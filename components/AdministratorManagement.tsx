"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ShieldCheck, Trash2, X } from "lucide-react";

import {
  addAssignmentAdministratorAction,
  listAssignmentAdministratorsAction,
  removeAssignmentAdministratorAction,
  type AssignmentAdministrator,
} from "@/app/actions/administrators";
import type { ActionResult } from "@/types/assignment";

type AdministratorManagementProps = {
  onClose: () => void;
};

export function AdministratorManagement({
  onClose,
}: AdministratorManagementProps) {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [administrators, setAdministrators] = useState<
    AssignmentAdministrator[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);

  const refreshAdministrators = async (): Promise<
    ActionResult<AssignmentAdministrator[]>
  > => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listAssignmentAdministratorsAction();
      if (result.ok) {
        setAdministrators(result.data);
      } else {
        setError(result.error);
      }
      return result;
    } catch {
      const result = {
        ok: false as const,
        error: "Não foi possível carregar a lista de administradores.",
      };
      setError(result.error);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    void listAssignmentAdministratorsAction()
      .then((result) => {
        if (!isCurrent) {
          return;
        }
        if (result.ok) {
          setAdministrators(result.data);
        } else {
          setError(result.error);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setError("Não foi possível carregar a lista de administradores.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    emailInputRef.current?.focus();
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleAddAdministrator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const result = await addAssignmentAdministratorAction(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(
        result.data.added
          ? `${result.data.administrator.email} agora é administrador(a).`
          : `${result.data.administrator.email} já tinha acesso administrativo.`,
      );
      setEmail("");
      await refreshAdministrators();
      emailInputRef.current?.focus();
    } catch {
      setError("Não foi possível adicionar a conta. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAdministrator = async (administrator: AssignmentAdministrator) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const result = await removeAssignmentAdministratorAction(
        administrator.userId,
      );
      if (!result.ok) {
        setError(result.error);
        setPendingRemovalId(null);
        return;
      }

      setMessage(`O acesso administrativo de ${administrator.email} foi removido.`);
      setPendingRemovalId(null);
      await refreshAdministrators();
    } catch {
      setError("Não foi possível remover a conta. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <section
        className="assignment-dialog administrator-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="administrator-dialog-title"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !isSaving) {
            onClose();
          }
        }}
      >
        <header className="dialog-header">
          <div>
            <p className="dialog-eyebrow">Acesso do sistema</p>
            <h2 id="administrator-dialog-title">Administradores</h2>
          </div>
          <button
            className="icon-button dialog-close"
            type="button"
            onClick={onClose}
            aria-label="Fechar gerenciamento de administradores"
            disabled={isSaving}
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="administrator-content">
          <p>
            Somente contas existentes no Supabase Auth podem receber acesso
            administrativo.
          </p>

          <form
            className="administrator-add-form"
            onSubmit={handleAddAdministrator}
          >
            <label className="form-field">
              <span>Email da conta</span>
              <input
                ref={emailInputRef}
                type="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <button
              className="primary-button"
              type="submit"
              disabled={isSaving || isLoading}
            >
              {isSaving ? "Salvando..." : "Adicionar administrador"}
            </button>
          </form>

          {error ? (
            <p className="status-message status-message--error" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="status-message status-message--success" role="status">
              {message}
            </p>
          ) : null}

          <section aria-labelledby="administrator-list-title">
            <h3 id="administrator-list-title">Contas administrativas</h3>
            {isLoading ? (
              <p className="loading-state" role="status">
                Carregando administradores...
              </p>
            ) : administrators.length === 0 ? (
              <p>Nenhuma conta administrativa foi encontrada.</p>
            ) : (
              <ul className="administrator-list">
                {administrators.map((administrator) => (
                  <li key={administrator.userId}>
                    <span className="administrator-identity">
                      <ShieldCheck aria-hidden="true" size={17} />
                      {administrator.email || "Conta sem email"}
                    </span>
                    {pendingRemovalId === administrator.userId ? (
                      <span className="administrator-confirmation">
                        <span>Remover acesso?</span>
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => setPendingRemovalId(null)}
                          disabled={isSaving}
                        >
                          Cancelar
                        </button>
                        <button
                          className="danger-outline-button"
                          type="button"
                          onClick={() =>
                            void handleRemoveAdministrator(administrator)
                          }
                          disabled={isSaving || administrators.length <= 1}
                        >
                          Confirmar
                        </button>
                      </span>
                    ) : (
                      <button
                        className="danger-outline-button administrator-remove"
                        type="button"
                        onClick={() =>
                          setPendingRemovalId(administrator.userId)
                        }
                        disabled={
                          isSaving ||
                          isLoading ||
                          administrators.length <= 1
                        }
                        aria-label={`Remover ${administrator.email} dos administradores`}
                        title={
                          administrators.length <= 1
                            ? "O último administrador não pode ser removido"
                            : "Remover administrador"
                        }
                      >
                        <Trash2 aria-hidden="true" size={16} />
                        Remover
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
