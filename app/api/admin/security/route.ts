import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/requireAdmin";

type AgentStatus = "pending" | "approved" | "rejected" | "none" | "suspended";

type SecurityUser = {
  id: string;
  nume: string;
  email: string;
  telefon?: string;
  esteAdministrator: boolean;
  esteAgent: boolean;
  statusAgent: AgentStatus;
  rolAfisat: string;
  permisiuni: string[];
  contSuspendat: boolean;
  dataInregistrare: string;
};

function getAgentStatus(raw: unknown): AgentStatus {
  if (raw === "suspended") return "suspended";
  if (raw === "pending" || raw === "approved" || raw === "rejected") {
    return raw;
  }
  return "none";
}

function rolSiPermisiuni(meta: {
  isAdmin?: boolean;
  isAgent?: boolean;
  agentStatus?: AgentStatus;
}): { rolAfisat: string; permisiuni: string[] } {
  if (meta.isAdmin) {
    return {
      rolAfisat: "Administrator",
      permisiuni: ["Panou admin", "Moderare anunțuri", "Utilizatori & agenți"],
    };
  }
  if (meta.isAgent) {
    const s = meta.agentStatus ?? "none";
    if (s === "approved") {
      return {
        rolAfisat: "Agent",
        permisiuni: ["Zonă agent", "Anunțuri proprii", "Profil"],
      };
    }
    if (s === "suspended") {
      return {
        rolAfisat: "Agent (suspendat)",
        permisiuni: ["Acces limitat — chestionare obligatorii"],
      };
    }
    if (s === "pending") {
      return {
        rolAfisat: "Agent (în așteptare)",
        permisiuni: ["Cerere în revizuire", "Acces limitat"],
      };
    }
    if (s === "rejected") {
      return {
        rolAfisat: "Agent (respins)",
        permisiuni: ["Acces ca utilizator", "Poate retrimite cerere"],
      };
    }
    return {
      rolAfisat: "Agent",
      permisiuni: ["Profil agent", "Anunțuri (după aprobare)"],
    };
  }
  return {
    rolAfisat: "Client",
    permisiuni: ["Căutare", "Favorite", "Cont"],
  };
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({
      orderBy: "-created_at",
      limit: 100,
    });

    const users: SecurityUser[] = usersResponse.data.map((user) => {
      const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        user.username ||
        user.emailAddresses[0]?.emailAddress ||
        "Utilizator fără nume";

      const publicMetadata = user.publicMetadata as {
        isAdmin?: boolean;
        isAgent?: boolean;
        agentStatus?: unknown;
      };

      const esteAdministrator = Boolean(publicMetadata?.isAdmin);
      const esteAgent = Boolean(publicMetadata?.isAgent);
      const statusAgent = getAgentStatus(publicMetadata?.agentStatus);
      const { rolAfisat, permisiuni } = rolSiPermisiuni({
        isAdmin: esteAdministrator,
        isAgent: esteAgent,
        agentStatus: statusAgent,
      });

      return {
        id: user.id,
        nume: fullName,
        email: user.emailAddresses[0]?.emailAddress || "-",
        telefon: user.phoneNumbers[0]?.phoneNumber,
        esteAdministrator,
        esteAgent,
        statusAgent,
        rolAfisat,
        permisiuni,
        contSuspendat: Boolean(user.banned),
        dataInregistrare: new Date(user.createdAt).toISOString(),
      };
    });

    const administratori = users.filter((u) => u.esteAdministrator).length;
    const agenti = users.filter((u) => u.esteAgent).length;
    const agentiAprobati = users.filter(
      (u) => u.esteAgent && u.statusAgent === "approved"
    ).length;
    const agentiInAsteptare = users.filter(
      (u) => u.esteAgent && u.statusAgent === "pending"
    ).length;
    const clienti = users.filter((u) => !u.esteAdministrator && !u.esteAgent).length;

    return NextResponse.json({
      users,
      statistici: {
        total: users.length,
        administratori,
        agenti,
        agentiAprobati,
        agentiInAsteptare,
        clienti,
        conturiSuspendate: users.filter((u) => u.contSuspendat).length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin security overview", error);
    return NextResponse.json(
      { error: "Eroare la citirea datelor de securitate" },
      { status: 500 }
    );
  }
}
