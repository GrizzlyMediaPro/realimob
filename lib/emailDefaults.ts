/** Valori inițiale pentru topicuri — folosite la primul încărcare al panoului. */
export const DEFAULT_EMAIL_TOPICS = [
  {
    topicId: "listing_moderation",
    label: "Moderare anunțuri",
    description:
      "Schimbări de status anunț (aprobat, respins, în așteptare, solicitare modificări).",
    sortOrder: 0,
    sendToAgents: true,
    sendToClients: false,
    sendToAdmins: true,
  },
  {
    topicId: "account_security",
    label: "Cont și securitate",
    description:
      "Verificare email, reset parolă, alerte de securitate legate de cont.",
    sortOrder: 1,
    sendToAgents: true,
    sendToClients: true,
    sendToAdmins: false,
  },
  {
    topicId: "appointments_messages",
    label: "Programări și mesaje",
    description:
      "Programări vizionări, mesaje legate de anunțuri, notificări între părți.",
    sortOrder: 2,
    sendToAgents: true,
    sendToClients: true,
    sendToAdmins: false,
  },
  {
    topicId: "marketing_platform",
    label: "Actualizări platformă",
    description:
      "Noutăți despre produs, newsletter (unde există consimțământ), mentenanță.",
    sortOrder: 3,
    sendToAgents: true,
    sendToClients: true,
    sendToAdmins: true,
  },
] as const;
