import type { MeetingType } from "@/types/assignment";

export const MIDWEEK_SECTIONS = [
  "Tesouros da Palavra de Deus",
  "Faça Seu Melhor no Ministério",
  "Nossa Vida Cristã",
] as const;

export const MIDWEEK_PARTS: Record<
  (typeof MIDWEEK_SECTIONS)[number],
  readonly string[]
> = {
  "Tesouros da Palavra de Deus": [
    "Discurso",
    "Joias espirituais",
    "Leitura da Bíblia",
  ],
  "Faça Seu Melhor no Ministério": [
    "Primeira conversa",
    "Revisita",
    "Estudo bíblico",
    "Discurso",
  ],
  "Nossa Vida Cristã": [
    "Discurso",
    "Necessidades locais",
    "Estudo bíblico de congregação",
    "Leitor",
  ],
};

export const WEEKEND_PARTS = [
  "Presidente",
  "Orador + Congregação",
  "Dirigente do estudo",
  "Leitor",
  "Oração final",
] as const;

export const WEEKEND_SECTION = "Reunião de fim de semana";

export function getSectionOptions(
  meetingType: MeetingType,
  currentSection: string,
): string[] {
  const options =
    meetingType === "midweek" ? [...MIDWEEK_SECTIONS] : [WEEKEND_SECTION];

  if (currentSection && !options.includes(currentSection)) {
    options.push(currentSection);
  }

  return options;
}

export function getPartOptions(
  meetingType: MeetingType,
  section: string,
  currentTitle: string,
): string[] {
  const options =
    meetingType === "weekend"
      ? [...WEEKEND_PARTS]
      : [...(MIDWEEK_PARTS[section as keyof typeof MIDWEEK_PARTS] ?? [])];

  if (currentTitle && !options.includes(currentTitle)) {
    options.push(currentTitle);
  }

  return options;
}
