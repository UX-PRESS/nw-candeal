export function getAssignmentDatabaseErrorMessage(
  operation: "load" | "save",
  code: string,
): string {
  console.error(`Supabase assignment ${operation} failed (${code}).`);

  if (code === "42P01" || code === "PGRST205") {
    return "A tabela de designações não foi encontrada. Execute a migration do Supabase e tente novamente.";
  }

  if (code === "PGRST202") {
    return "A configuração de permissões não foi encontrada. Execute a migration de segurança do Supabase.";
  }

  if (code === "42501" || code === "PGRST301") {
    return "Seu usuário não tem permissão para esta operação.";
  }

  return operation === "load"
    ? "Não foi possível carregar as designações. Verifique a conexão e tente novamente."
    : "Não foi possível salvar as alterações. Verifique a conexão e suas permissões.";
}
