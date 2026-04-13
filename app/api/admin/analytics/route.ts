import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCachedAgentPerformanceScore } from "@/lib/agentPerformanceScore";
import {
  endOfUtcDayFromDate,
  MAX_ANALYTICS_RANGE_DAYS,
  parseUtcDateParam,
  startOfUtcDayFromDate,
} from "@/lib/adminAnalyticsRange";

/** Luni scurte RO — evită duplicate/glitcuri din toLocaleDateString pe server */
const RO_MONTH_SHORT = [
  "ian",
  "feb",
  "mar",
  "apr",
  "mai",
  "iun",
  "iul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

function monthLabelRoUtc(year: number, monthIndex: number) {
  return `${RO_MONTH_SHORT[monthIndex]} ${year}`;
}

async function countNewClerkUsersInRange(
  client: Awaited<ReturnType<typeof clerkClient>>,
  fromMs: number,
  toMs: number
): Promise<number> {
  let count = 0;
  let offset = 0;
  const limit = 100;
  const maxPages = 200;
  for (let page = 0; page < maxPages; page++) {
    const res = await client.users.getUserList({
      limit,
      offset,
      orderBy: "-created_at",
    });
    if (!res.data.length) break;
    let stop = false;
    for (const u of res.data) {
      const c = u.createdAt as number | Date | undefined;
      const ms =
        typeof c === "number" ? c : c instanceof Date ? c.getTime() : 0;
      if (ms < fromMs) {
        stop = true;
        break;
      }
      if (ms >= fromMs && ms <= toMs) count += 1;
    }
    if (stop) break;
    offset += res.data.length;
    if (res.data.length < limit) break;
  }
  return count;
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const isAdmin = Boolean(currentUser.publicMetadata?.isAdmin);

    if (!isAdmin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const url = new URL(req.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");

    const fromParsed = parseUtcDateParam(fromParam);
    const toParsed = parseUtcDateParam(toParam);

    if ((fromParam || toParam) && (!fromParsed || !toParsed)) {
      return NextResponse.json(
        {
          error:
            "Parametri from și to trebuie să fie date valide în format YYYY-MM-DD (UTC).",
        },
        { status: 400 }
      );
    }

    if (fromParsed && toParsed) {
      const rangeFrom = startOfUtcDayFromDate(fromParsed);
      const rangeTo = endOfUtcDayFromDate(toParsed);
      if (rangeFrom.getTime() > rangeTo.getTime()) {
        return NextResponse.json(
          { error: "Data „de la” trebuie să fie înainte de „până la”." },
          { status: 400 }
        );
      }
      const spanDays =
        (rangeTo.getTime() - rangeFrom.getTime()) / (24 * 60 * 60 * 1000) + 1;
      if (spanDays > MAX_ANALYTICS_RANGE_DAYS) {
        return NextResponse.json(
          {
            error: `Intervalul maxim permis este ${MAX_ANALYTICS_RANGE_DAYS} zile.`,
          },
          { status: 400 }
        );
      }

      const listingCreated = {
        createdAt: { gte: rangeFrom, lte: rangeTo },
      };

      const startDay = startOfUtcDayFromDate(rangeFrom);
      const endDay = startOfUtcDayFromDate(rangeTo);
      const dayCount =
        Math.floor(
          (endDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000)
        ) + 1;
      const nDailyBars = Math.min(7, Math.max(1, dayCount));
      const dailyStartBound = new Date(
        endDay.getTime() - (nDailyBars - 1) * 24 * 60 * 60 * 1000
      );
      const dailyQueryFrom =
        dailyStartBound < startDay ? startDay : dailyStartBound;

      const sevenStart = new Date(
        Math.max(
          rangeFrom.getTime(),
          endDay.getTime() - 6 * 24 * 60 * 60 * 1000
        )
      );
      const thirtyStart = new Date(
        Math.max(
          rangeFrom.getTime(),
          endDay.getTime() - 29 * 24 * 60 * 60 * 1000
        )
      );

      const monthBuckets: { key: string; label: string; count: number }[] = [];
      let yM = rangeFrom.getUTCFullYear();
      let mM = rangeFrom.getUTCMonth();
      const yEnd = rangeTo.getUTCFullYear();
      const mEnd = rangeTo.getUTCMonth();
      while (yM < yEnd || (yM === yEnd && mM <= mEnd)) {
        const key = `${yM}-${String(mM + 1).padStart(2, "0")}`;
        monthBuckets.push({
          key,
          label: monthLabelRoUtc(yM, mM),
          count: 0,
        });
        mM += 1;
        if (mM > 11) {
          mM = 0;
          yM += 1;
        }
      }

      const [
        approvedListings,
        deniedListings,
        pendingListings,
        totalAgents,
        agentsWithListingsInRange,
        usersResponse,
        byTransaction,
        byProperty,
        bySector,
        priceByCurrency,
        new7,
        new30,
        listingsForMonths,
        listingsForDaily,
        listingCountsByAgent,
        newUsersInRange,
      ] = await Promise.all([
        prisma.listing.count({
          where: { ...listingCreated, status: "approved" },
        }),
        prisma.listing.count({
          where: { ...listingCreated, status: "denied" },
        }),
        prisma.listing.count({
          where: { ...listingCreated, status: "pending" },
        }),
        prisma.agent.count(),
        prisma.agent.count({
          where: { listings: { some: listingCreated } },
        }),
        client.users.getUserList({ limit: 100 }),
        prisma.listing.groupBy({
          by: ["transactionType"],
          where: listingCreated,
          _count: { _all: true },
        }),
        prisma.listing.groupBy({
          by: ["propertyType"],
          where: listingCreated,
          _count: { _all: true },
        }),
        prisma.listing.groupBy({
          by: ["sector"],
          where: listingCreated,
          _count: { _all: true },
        }),
        prisma.listing.groupBy({
          by: ["currency"],
          where: { ...listingCreated, status: "approved" },
          _avg: { price: true },
          _count: { _all: true },
        }),
        prisma.listing.count({
          where: { createdAt: { gte: sevenStart, lte: rangeTo } },
        }),
        prisma.listing.count({
          where: { createdAt: { gte: thirtyStart, lte: rangeTo } },
        }),
        prisma.listing.findMany({
          where: listingCreated,
          select: { createdAt: true },
        }),
        prisma.listing.findMany({
          where: {
            createdAt: { gte: dailyQueryFrom, lte: rangeTo },
          },
          select: { createdAt: true },
        }),
        prisma.listing.groupBy({
          by: ["agentId"],
          where: { ...listingCreated, agentId: { not: null } },
          _count: { _all: true },
        }),
        countNewClerkUsersInRange(
          client,
          rangeFrom.getTime(),
          rangeTo.getTime()
        ),
      ]);

      for (const row of listingsForMonths) {
        const d = new Date(row.createdAt);
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
        const bucket = monthBuckets.find((b) => b.key === key);
        if (bucket) bucket.count += 1;
      }

      const dailyCreatedLast7: {
        key: string;
        label: string;
        count: number;
      }[] = [];
      for (let i = nDailyBars - 1; i >= 0; i--) {
        const d = new Date(endDay.getTime() - i * 24 * 60 * 60 * 1000);
        if (d < startDay) continue;
        const y = d.getUTCFullYear();
        const mo = d.getUTCMonth();
        const day = d.getUTCDate();
        const key = `${y}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        dailyCreatedLast7.push({
          key,
          label: `${day}.${String(mo + 1).padStart(2, "0")}`,
          count: 0,
        });
      }

      for (const row of listingsForDaily) {
        const d = new Date(row.createdAt);
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        const bucket = dailyCreatedLast7.find((b) => b.key === key);
        if (bucket) bucket.count += 1;
      }

      const totalUsers =
        typeof usersResponse.totalCount === "number"
          ? usersResponse.totalCount
          : usersResponse.data.length;

      const topSectors = [...bySector]
        .filter((s) => s.sector != null && String(s.sector).trim() !== "")
        .map((s) => ({
          sector: String(s.sector).trim(),
          count: s._count._all,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const agentIds = listingCountsByAgent
        .filter((r) => r.agentId)
        .sort((a, b) => b._count._all - a._count._all)
        .slice(0, 8);

      const agentsNamed = await prisma.agent.findMany({
        where: { id: { in: agentIds.map((r) => r.agentId!) } },
        select: { id: true, name: true },
      });
      const nameById = new Map(agentsNamed.map((a) => [a.id, a.name]));

      const topAgentsBase = agentIds.map((r) => ({
        id: r.agentId!,
        name: nameById.get(r.agentId!) ?? "Agent",
        listings: r._count._all,
      }));

      const topAgents = await Promise.all(
        topAgentsBase.map(async (a) => {
          try {
            const score = await getCachedAgentPerformanceScore(a.id);
            return {
              ...a,
              scorVanzari: score.scorVanzari,
              scorInchirieri: score.scorInchirieri,
            };
          } catch {
            return {
              ...a,
              scorVanzari: null,
              scorInchirieri: null,
            };
          }
        })
      );

      const totalListings =
        approvedListings + deniedListings + pendingListings;
      const approvalRate =
        totalListings > 0
          ? Math.round((approvedListings / totalListings) * 1000) / 10
          : 0;

      return NextResponse.json({
        meta: {
          filtered: true,
          from: rangeFrom.toISOString(),
          to: rangeTo.toISOString(),
          timezone: "UTC",
        },
        listings: {
          approved: approvedListings,
          denied: deniedListings,
          pending: pendingListings,
          total: totalListings,
          approvalRatePercent: approvalRate,
        },
        agents: {
          total: totalAgents,
          active: agentsWithListingsInRange,
        },
        users: {
          total: totalUsers,
          newLast30Days: newUsersInRange,
        },
        listingsByTransaction: byTransaction.map((r) => ({
          transactionType: r.transactionType || "—",
          count: r._count._all,
        })),
        listingsByPropertyType: byProperty.map((r) => ({
          propertyType: r.propertyType || "—",
          count: r._count._all,
        })),
        topSectors,
        priceByCurrencyApproved: priceByCurrency.map((r) => ({
          currency: r.currency || "RON",
          avgPrice: r._avg.price ?? 0,
          count: r._count._all,
        })),
        newListings: {
          last7Days: new7,
          last30Days: new30,
        },
        monthlyCreated: monthBuckets.map(({ key, label, count }) => ({
          key,
          label,
          count,
        })),
        dailyCreatedLast7: dailyCreatedLast7.map(({ key, label, count }) => ({
          key,
          label,
          count,
        })),
        topAgents,
      });
    }

    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      approvedListings,
      deniedListings,
      pendingListings,
      totalAgents,
      agentsWithListings,
      usersResponse,
      byTransaction,
      byProperty,
      bySector,
      priceByCurrency,
      new7,
      new30,
      listingsSince6M,
      listingsLast7DaysRange,
      allAgentsWithCounts,
    ] = await Promise.all([
      prisma.listing.count({ where: { status: "approved" } }),
      prisma.listing.count({ where: { status: "denied" } }),
      prisma.listing.count({ where: { status: "pending" } }),
      prisma.agent.count(),
      prisma.agent.count({
        where: { listings: { some: {} } },
      }),
      client.users.getUserList({ limit: 100 }),
      prisma.listing.groupBy({
        by: ["transactionType"],
        _count: { _all: true },
      }),
      prisma.listing.groupBy({
        by: ["propertyType"],
        _count: { _all: true },
      }),
      prisma.listing.groupBy({
        by: ["sector"],
        _count: { _all: true },
      }),
      prisma.listing.groupBy({
        by: ["currency"],
        where: { status: "approved" },
        _avg: { price: true },
        _count: { _all: true },
      }),
      prisma.listing.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.listing.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      (() => {
        const u = new Date(now);
        const y = u.getUTCFullYear();
        const m = u.getUTCMonth();
        const sixMonthsStart = new Date(Date.UTC(y, m - 5, 1));
        return prisma.listing.findMany({
          where: { createdAt: { gte: sixMonthsStart } },
          select: { createdAt: true },
        });
      })(),
      (() => {
        const u = new Date(now);
        const todayUtc = new Date(
          Date.UTC(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate())
        );
        const oldest = new Date(todayUtc);
        oldest.setUTCDate(oldest.getUTCDate() - 6);
        return prisma.listing.findMany({
          where: { createdAt: { gte: oldest } },
          select: { createdAt: true },
        });
      })(),
      prisma.agent.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { listings: true } },
        },
      }),
    ]);

    const totalUsers =
      typeof usersResponse.totalCount === "number"
        ? usersResponse.totalCount
        : usersResponse.data.length;
    const thirtyMs = thirtyDaysAgo.getTime();
    const newUsersLast30Days = usersResponse.data.filter((u) => {
      const c = u.createdAt as number | Date | undefined;
      const ms =
        typeof c === "number" ? c : c instanceof Date ? c.getTime() : 0;
      return ms >= thirtyMs;
    }).length;

    const monthBuckets: { key: string; label: string; count: number }[] = [];
    const anchor = new Date(now);
    const y0 = anchor.getUTCFullYear();
    const m0 = anchor.getUTCMonth();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(y0, m0 - i, 1));
      const y = d.getUTCFullYear();
      const mi = d.getUTCMonth();
      const key = `${y}-${String(mi + 1).padStart(2, "0")}`;
      monthBuckets.push({
        key,
        label: monthLabelRoUtc(y, mi),
        count: 0,
      });
    }

    for (const row of listingsSince6M) {
      const d = new Date(row.createdAt);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const bucket = monthBuckets.find((b) => b.key === key);
      if (bucket) bucket.count += 1;
    }

    const u = new Date(now);
    const todayUtc = new Date(
      Date.UTC(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate())
    );
    const dailyCreatedLast7: { key: string; label: string; count: number }[] =
      [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayUtc);
      d.setUTCDate(d.getUTCDate() - i);
      const y = d.getUTCFullYear();
      const mo = d.getUTCMonth();
      const day = d.getUTCDate();
      const key = `${y}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      dailyCreatedLast7.push({
        key,
        label: `${day}.${String(mo + 1).padStart(2, "0")}`,
        count: 0,
      });
    }

    for (const row of listingsLast7DaysRange) {
      const d = new Date(row.createdAt);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      const bucket = dailyCreatedLast7.find((b) => b.key === key);
      if (bucket) bucket.count += 1;
    }

    const topSectors = [...bySector]
      .filter((s) => s.sector != null && String(s.sector).trim() !== "")
      .map((s) => ({
        sector: String(s.sector).trim(),
        count: s._count._all,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topAgentsBase = [...allAgentsWithCounts]
      .sort((a, b) => b._count.listings - a._count.listings)
      .slice(0, 8)
      .map((a) => ({
        id: a.id,
        name: a.name,
        listings: a._count.listings,
      }));
    const topAgents = await Promise.all(
      topAgentsBase.map(async (a) => {
        try {
          const score = await getCachedAgentPerformanceScore(a.id);
          return {
            ...a,
            scorVanzari: score.scorVanzari,
            scorInchirieri: score.scorInchirieri,
          };
        } catch {
          return {
            ...a,
            scorVanzari: null,
            scorInchirieri: null,
          };
        }
      })
    );

    const totalListings =
      approvedListings + deniedListings + pendingListings;
    const approvalRate =
      totalListings > 0
        ? Math.round((approvedListings / totalListings) * 1000) / 10
        : 0;

    return NextResponse.json({
      meta: {
        filtered: false,
        from: null,
        to: null,
        timezone: "UTC",
      },
      listings: {
        approved: approvedListings,
        denied: deniedListings,
        pending: pendingListings,
        total: totalListings,
        approvalRatePercent: approvalRate,
      },
      agents: {
        total: totalAgents,
        active: agentsWithListings,
      },
      users: {
        total: totalUsers,
        newLast30Days: newUsersLast30Days,
      },
      listingsByTransaction: byTransaction.map((r) => ({
        transactionType: r.transactionType || "—",
        count: r._count._all,
      })),
      listingsByPropertyType: byProperty.map((r) => ({
        propertyType: r.propertyType || "—",
        count: r._count._all,
      })),
      topSectors,
      priceByCurrencyApproved: priceByCurrency.map((r) => ({
        currency: r.currency || "RON",
        avgPrice: r._avg.price ?? 0,
        count: r._count._all,
      })),
      newListings: {
        last7Days: new7,
        last30Days: new30,
      },
      monthlyCreated: monthBuckets.map(({ key, label, count }) => ({
        key,
        label,
        count,
      })),
      dailyCreatedLast7: dailyCreatedLast7.map(({ key, label, count }) => ({
        key,
        label,
        count,
      })),
      topAgents,
    });
  } catch (error) {
    console.error("Failed to fetch admin analytics", error);
    return NextResponse.json(
      { error: "Eroare la citirea analiticelor" },
      { status: 500 }
    );
  }
}
