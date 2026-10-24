const transfers = new WeakMap<HTMLElement, Set<() => void>>();

export function cancelPieceTransfers(root: HTMLElement | null) {
  if (root) transfers.get(root)?.forEach(cancel => cancel());
}

// Capture before React updates; find the destination after the new layout is committed.
export function movePiece(root: HTMLElement | null, index: number, removing: boolean) {
  if (!root || root.closest('[data-motion]')?.getAttribute('data-motion') !== 'on' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  cancelPieceTransfers(root);
  const source = root.querySelector<HTMLElement>(`[data-${removing ? 'piece' : 'bank'}="${index}"]`);
  if (!source || typeof source.animate !== 'function') return;
  const from = source.getBoundingClientRect();
  const appearance = getComputedStyle(source);
  const ghost = document.createElement('span');
  ghost.textContent = source.textContent;
  ghost.className = 'piece-transfer';
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, {position:'fixed',pointerEvents:'none',zIndex:'50',boxSizing:'border-box',display:'flex',alignItems:'center',justifyContent:'center',left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`,font:appearance.font,color:appearance.color,background:appearance.backgroundColor,border:appearance.border,borderRadius:appearance.borderRadius,transformOrigin:'top left'});
  let frame = 0;
  const animations: Animation[] = [];
  const active = transfers.get(root) || new Set<() => void>();
  transfers.set(root, active);
  const cancel = () => { cancelAnimationFrame(frame); animations.forEach(a=>a.cancel()); ghost.remove(); active.delete(cancel); window.removeEventListener('neurolearn-comfort',cancel); window.removeEventListener('resize',cancel); window.removeEventListener('scroll',cancel,true); media.removeEventListener('change',cancel); };
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  active.add(cancel);
  window.addEventListener('neurolearn-comfort',cancel); window.addEventListener('resize',cancel); window.addEventListener('scroll',cancel,true); media.addEventListener('change',cancel);
  frame = requestAnimationFrame(() => {
    const target = root.querySelector<HTMLElement>(`[data-${removing ? 'bank' : 'piece'}="${index}"]`);
    if (!root.isConnected || !target || !from.width || !from.height) { cancel(); return; }
    const to = target.getBoundingClientRect();
    root.append(ghost);
    const options = {duration:320,easing:'cubic-bezier(.2,.7,.2,1)'};
    animations.push(target.animate([{opacity:0},{opacity:0}], options));
    const flight = ghost.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`}],options);
    animations.push(flight);
    flight.onfinish = cancel;
  });
}
