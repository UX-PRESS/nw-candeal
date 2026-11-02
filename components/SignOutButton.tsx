"use client";

import { LogOut } from "lucide-react";
import { useState, useTransition } from "react";

import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signOut();
        if (!result.ok) {
          setError(result.error);
        }
      } catch {
        setError("Não foi possível encerrar a sessão. Tente novamente.");
      }
    });
  };

  return (
    <div className="sign-out-control">
      <button
        className="sign-out-button"
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
      >
        <LogOut aria-hidden="true" size={16} />
        {isPending ? "Saindo..." : "Sair"}
      </button>
      {error ? (
        <span className="sign-out-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
