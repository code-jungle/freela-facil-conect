import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

export const LoginForm = ({ onSubmit, loading }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          inputMode="email" 
          autoComplete="email" 
          required 
          className="h-12 text-base input-surface" 
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="password">Senha</Label>
        <Input 
          id="password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          autoComplete="current-password" 
          required 
          className="h-12 text-base input-surface" 
        />
      </div>

      <Button type="submit" className="w-full h-12 text-base mt-8" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};