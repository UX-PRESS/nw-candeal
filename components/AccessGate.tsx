"use client";

import { CalendarCheck2, LockKeyhole } from "lucide-react";
import { useActionState } from "react";

import { signInWithPassword } from "@/app/actions/auth";

type AccessGateProps = {
  configurationMissing?: boolean;
  message?: string;
};

export function AccessGate({
  configurationMissing = false,
  message,
}: AccessGateProps) {
  const [state, formAction, isPending] = useActionState(signInWithPassword, {});

  if (configurationMissing) {
    return (
      <main className="app-shell access-shell">
        <section className="access-panel" aria-labelledby="access-title">
          <span className="access-icon" aria-hidden="true">
            <LockKeyhole size={23} />
          </span>
          <p className="eyebrow">Configuração necessária</p>
          <h1 id="access-title">Conecte o projeto ao Supabase</h1>
          <p>
            Configure as variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no ambiente local ou no
            projeto da Vercel para habilitar o acesso aos dados.
          </p>
          {message ? (
            <p className="status-message status-message--error" role="alert">
              {message}
            </p>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell access-shell">
      <section className="access-panel login-panel" aria-labelledby="access-title">
        <span className="brand-mark access-brand" aria-hidden="true">
          <CalendarCheck2 size={20} />
        </span>
        <p className="eyebrow">Agenda semanal</p>
        <h1 id="access-title">Entre para consultar a agenda</h1>
        <p>
          Use a conta autorizada pela administração da congregação. O cadastro
          de usuários é gerenciado pelo Supabase.
        </p>

        {message ? (
          <p className="status-message status-message--error" role="alert">
            {message}
          </p>
        ) : null}

        <form className="login-form" action={formAction}>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label className="form-field">
            <span>Senha</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              maxLength={256}
            />
          </label>
          {state.error ? (
            <p className="status-message status-message--error" role="alert">
              {state.error}
            </p>
          ) : null}
          <button className="primary-button login-submit" type="submit" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}

export function SupabaseSetupNotice() {
  return (
    <AccessGate
      configurationMissing
      message="Os dados de demonstração não são usados como alternativa. Configure o Supabase para continuar."
    />
  );
}
