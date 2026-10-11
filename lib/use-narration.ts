"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import catalog from "@/content/narration.pt-BR.json";

export function useNarration() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const sequence = useRef(0);
  const [message, setMessage] = useState("");
  const stop = useCallback(() => {
    sequence.current += 1;
    audio.current?.pause();
    audio.current = null;
  }, []);
  useEffect(() => () => { stop(); }, [stop]);
  const speak = useCallback(async (id: string) => {
    stop();
    setMessage("");
    const token = sequence.current;
    const phrase = catalog.phrases.find((item) => item.id === id);
    if (phrase?.status !== "generated") return;
    const player = new Audio(`/audio/pt-BR/${catalog.voice}/${id}.mp3`);
    audio.current = player;
    try { await player.play(); } catch {
      if (token === sequence.current) setMessage("Não consegui tocar o áudio. Você pode ler a mensagem ou tentar novamente.");
    }
  }, [stop]);
  return { speak, stop, message, hasAudio: (id: string) => catalog.phrases.some((phrase) => phrase.id === id && phrase.status === "generated") };
}
