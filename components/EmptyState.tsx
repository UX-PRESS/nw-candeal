import { CalendarX2 } from "lucide-react";

type EmptyStateProps = {
  weekRange: string;
};

export function EmptyState({ weekRange }: EmptyStateProps) {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      <span className="empty-state-icon" aria-hidden="true">
        <CalendarX2 size={26} />
      </span>
      <div>
        <h2 id="empty-state-title">Nenhuma designação nesta semana</h2>
        <p>
          Não há designações cadastradas para {weekRange}. Escolha outra semana
          ou adicione uma nova designação.
        </p>
      </div>
    </section>
  );
}
