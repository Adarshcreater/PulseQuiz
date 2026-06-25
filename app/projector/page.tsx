"use client";

import { MonitorPlay } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProjectorCodePage() {
  const [code, setCode] = useState("");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="glass rounded-lg p-6">
        <MonitorPlay className="mb-4 h-9 w-9 text-cyan-200" />
        <h1 className="text-3xl font-black">Open Projector</h1>
        <Input className="mt-5 text-center text-2xl uppercase tracking-widest" placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <Button className="mt-4 w-full" onClick={() => { if (code) window.location.href = `/projector/${code}`; }}>Open</Button>
      </div>
    </main>
  );
}
