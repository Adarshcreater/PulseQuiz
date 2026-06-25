"use client";

import { useEffect, useState } from "react";
import { createPusherClient, events } from "@/lib/realtime";
import type { SessionSnapshot } from "@/lib/types";

export function useLiveSession(code: string, initial?: SessionSnapshot | null) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(initial || null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/sessions/${code}`, { cache: "no-store" });
        if (response.ok && active) setSnapshot(await response.json());
        setOffline(false);
      } catch {
        setOffline(true);
      }
    }
    load();
    const client = createPusherClient();
    if (!client) {
      const interval = window.setInterval(load, 5000);
      return () => {
        active = false;
        window.clearInterval(interval);
      };
    }
    const channel = client.subscribe(`quiz-${code.toUpperCase()}`);
    const update = (data: SessionSnapshot) => setSnapshot(data);
    Object.values(events).forEach((event) => channel.bind(event, update));
    return () => {
      active = false;
      Object.values(events).forEach((event) => channel.unbind(event, update));
      client.unsubscribe(`quiz-${code.toUpperCase()}`);
      client.disconnect();
    };
  }, [code]);

  return { snapshot, offline };
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data as T;
}
