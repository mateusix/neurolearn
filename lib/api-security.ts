const MAX_BUCKETS = 2000;
const buckets = new Map<string, { count: number; expires: number }>();
/** Best-effort per-instance limit; a distributed firewall is needed at larger scale. */
export function allowFamilyRequest(userId: string, method: 'GET' | 'POST', now = Date.now()) {
  for (const [key, bucket] of buckets) if (bucket.expires <= now) buckets.delete(key);
  const key = `${method}:${userId}`;
  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) buckets.delete(buckets.keys().next().value!);
    bucket = { count: 0, expires: now + 60000 }; buckets.set(key, bucket);
  }
  const allowed = ++bucket.count <= (method === 'GET' ? 60 : 120);
  return { allowed, retryAfter: Math.max(1, Math.ceil((bucket.expires - now) / 1000)) };
}
export function validChildName(value: unknown): value is string {
  return typeof value === 'string' && !!value.trim() && value.trim().length <= 32 && !/[\u0000-\u001f\u007f<>]/u.test(value);
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
export async function readLimitedJson(request: Request, maxBytes = 16000): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new RangeError('body-size');
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError('body-empty');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new RangeError('body-size'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!isRecord(body)) throw new SyntaxError('body-object');
  return body;
}
export function logFamilyFailure(operation: 'load' | 'save') {
  // Never record children's data, account identifiers, tokens or exception payloads.
  console.error(JSON.stringify({ event: 'family_api_failure', operation }));
}
