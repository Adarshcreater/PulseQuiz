"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function login() {
    try {
      setLoading(true);
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      window.location.href = "/admin";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="glass rounded-lg p-6">
        <Lock className="mb-4 h-9 w-9 text-cyan-200" />
        <h1 className="text-3xl font-black">Admin Login</h1>
        <Input className="mt-5" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
        <Button className="mt-4 w-full" disabled={loading || !password} onClick={login}>Login</Button>
      </div>
    </main>
  );
}
