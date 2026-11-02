import { addDays, getStartOfWeek, toDateKey } from "@/lib/dates";
import type { Assignment } from "@/types/assignment";

export const mockDataNotice =
  "Dados de demonstração — nomes e designações são ilustrativos.";

export function createMockAssignments(referenceDate: Date): Assignment[] {
  const weekStart = getStartOfWeek(referenceDate);
  const midweekDate = toDateKey(addDays(weekStart, 2));
  const weekendDate = toDateKey(addDays(weekStart, 5));

  return [
    {
      id: "midweek-bible-highlights",
      date: midweekDate,
      meetingType: "midweek",
      section: "Tesouros da Palavra de Deus",
      title: "Joias espirituais",
      participantName: "Paulo Ribeiro",
      notes: "Prepare uma resposta breve para cada pergunta da assistência.",
      startTime: "19:30",
      durationMinutes: 10,
    },
    {
      id: "midweek-initial-conversation",
      date: midweekDate,
      meetingType: "midweek",
      section: "Faça Seu Melhor no Ministério",
      title: "Iniciando conversas — testemunho informal",
      participantName: "Rafael Almeida",
      assistantName: "Camila Souza",
      notes: "Use o cenário da lição 2, ponto 3.",
      startTime: "19:42",
      durationMinutes: 4,
    },
    {
      id: "midweek-return-visit",
      date: midweekDate,
      meetingType: "midweek",
      section: "Faça Seu Melhor no Ministério",
      title: "Cultivando o interesse — revisita",
      participantName: "Letícia Martins",
      assistantName: "Beatriz Rocha",
      startTime: "19:50",
      durationMinutes: 5,
    },
    {
      id: "midweek-congregation-study",
      date: midweekDate,
      meetingType: "midweek",
      section: "Nossa Vida Cristã",
      title: "Estudo bíblico de congregação",
      participantName: "Eduardo Lima",
      assistantName: "Felipe Costa",
      notes: "Capítulo 34, parágrafos 1 a 12.",
      startTime: "20:15",
      durationMinutes: 30,
    },
    {
      id: "weekend-chairman",
      date: weekendDate,
      meetingType: "weekend",
      section: "Programa da reunião",
      title: "Presidência da reunião",
      participantName: "Daniel Ferreira",
      notes: "Confirme a ordem do programa com os participantes antes do início.",
      startTime: "18:00",
    },
    {
      id: "weekend-public-talk",
      date: weekendDate,
      meetingType: "weekend",
      section: "Discurso público",
      title: "Como encontrar verdadeira paz",
      participantName: "André Cardoso",
      notes: "Orador visitante — recepção e hospitalidade organizadas.",
      startTime: "18:10",
      durationMinutes: 30,
    },
    {
      id: "weekend-watchtower-study",
      date: weekendDate,
      meetingType: "weekend",
      section: "Estudo de A Sentinela",
      title: "Fortaleça sua esperança nas promessas de Deus",
      participantName: "Marcos Oliveira",
      assistantName: "João Santos",
      notes: "Inclua a leitura dos parágrafos selecionados.",
      startTime: "18:45",
      durationMinutes: 60,
    },
  ];
}
