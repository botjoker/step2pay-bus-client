"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { publicEventsApi } from "@/lib/api/events";
import { festivalPublicApi, type FestivalStage, type FestivalPerformance } from "@/lib/api/festival";

// Россия постоянно UTC+3 (нет DST с 2014 года)
function msk(date: Date): Date {
  const diff = 3 * 60 + date.getTimezoneOffset();
  return new Date(date.getTime() + diff * 60000);
}

export default function EventDisplayPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  const { data: eventData } = useQuery({
    queryKey: ["display-event", slug],
    queryFn: () =>
      isUUID
        ? publicEventsApi.getEventById(slug)
        : publicEventsApi.getEventBySlug(slug),
    refetchInterval: 30000,
  });

  const event = eventData?.data;
  const eventId = event?.id;

  const { data: stages = [] } = useQuery<FestivalStage[]>({
    queryKey: ["display-stages", eventId],
    queryFn: () => festivalPublicApi.getStages(eventId!),
    enabled: !!eventId,
    refetchInterval: 10000,
  });

  const { data: performances = [] } = useQuery<FestivalPerformance[]>({
    queryKey: ["display-performances", eventId],
    queryFn: () => festivalPublicApi.getPerformances(eventId!),
    enabled: !!eventId,
    refetchInterval: 10000,
  });

  const isStarted = event?.stage === "started";

  const forStage = (stageId: string) =>
    performances.filter((p) => p.stage_id === stageId);

  // "Сейчас": явный статус performing ИЛИ автодетект по времени (start_time ≤ now < start_time + duration)
  const nowOn = (stageId: string) => {
    const list = forStage(stageId);
    const explicit = list.find((p) => p.status === "performing");
    if (explicit) return explicit;
    if (!currentTime) return undefined;
    const nowMs = currentTime.getTime();
    return list.find((p) => {
      if (!p.start_time || p.status === "done" || p.status === "cancelled") return false;
      const startMs = new Date(p.start_time).getTime();
      const endMs = startMs + (p.duration_minutes ?? 30) * 60000;
      return nowMs >= startMs && nowMs < endMs;
    });
  };

  // "Готовится": явный статус preparing ИЛИ следующий по времени (start_time в пределах 15 мин)
  const preparing = (stageId: string) => {
    const list = forStage(stageId);
    const explicit = list.find((p) => p.status === "preparing");
    if (explicit) return explicit;
    if (!currentTime) return undefined;
    const nowMs = currentTime.getTime();
    const active = nowOn(stageId);
    return list
      .filter((p) => {
        if (!p.start_time || p.status === "done" || p.status === "cancelled") return false;
        if (active && p.id === active.id) return false;
        const startMs = new Date(p.start_time).getTime();
        return startMs > nowMs && startMs - nowMs <= 15 * 60000;
      })
      .sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime())[0];
  };

  // "Далее": scheduled, не текущий, не готовящийся, в будущем
  const upcoming = (stageId: string) => {
    const active = nowOn(stageId);
    const prep = preparing(stageId);
    const nowMs = currentTime ? currentTime.getTime() : Date.now();
    return forStage(stageId)
      .filter((p) => {
        if (p.status === "done" || p.status === "cancelled") return false;
        if (active && p.id === active.id) return false;
        if (prep && p.id === prep.id) return false;
        if (p.start_time && new Date(p.start_time).getTime() <= nowMs) return false;
        return true;
      })
      .sort((a, b) => {
        if (!a.start_time && !b.start_time) return (a.order_index ?? 0) - (b.order_index ?? 0);
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      })
      .slice(0, 2);
  };

  // ── Экран ожидания ───────────────────────────────────────────

  if (!event || !isStarted) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
        style={{ background: "#050510", color: "#fff" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, #1a1a4e 0%, transparent 70%)",
          }}
        />
        <div className="relative text-center">
          <div
            className="font-mono font-bold mb-6 tabular-nums"
            style={{ fontSize: "5rem", color: "rgba(255,255,255,0.9)", letterSpacing: "0.04em" }}
          >
            {currentTime ? format(msk(currentTime), "HH:mm:ss") : "--:--:--"}
          </div>
          {event ? (
            <>
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {event.title}
              </div>
              <div className="text-lg" style={{ color: "rgba(255,255,255,0.3)" }}>
                Мероприятие ещё не началось
              </div>
            </>
          ) : (
            <div
              className="text-xl animate-pulse"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Загрузка...
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Дисплей мероприятия ──────────────────────────────────────

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={{
        background: "#050510",
        color: "#fff",
        fontFamily: "var(--font-montserrat), system-ui, sans-serif",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 50% 0%, #0d0d2e 0%, transparent 60%)",
        }}
      />

      {/* ── Шапка ─────────────────────────────────────────────── */}
      <header
        className="relative z-10 flex items-start justify-between shrink-0"
        style={{ padding: "20px 32px" }}
      >
        <div>
          <div
            className="text-xs uppercase mb-1"
            style={{ letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)" }}
          >
            {event.city ?? "Фестиваль"}
          </div>
          <h1
            className="text-2xl font-bold leading-tight"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {event.title}
          </h1>
          <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            {format(msk(new Date(event.start_date)), "d MMMM yyyy", { locale: ru })}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className="font-mono font-bold tabular-nums leading-none"
            style={{ fontSize: "3rem", color: "#fff" }}
          >
            {currentTime ? format(msk(currentTime), "HH:mm") : "--:--"}
            <span style={{ fontSize: "2rem", color: "rgba(255,255,255,0.25)" }}>
              :{currentTime ? format(msk(currentTime), "ss") : "--"}
            </span>
          </div>
          <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            {currentTime ? format(msk(currentTime), "EEEE, d MMMM", { locale: ru }) : ""} МСК
          </div>
        </div>
      </header>

      <div
        className="relative z-10 shrink-0"
        style={{
          margin: "0 32px",
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* ── Колонки сцен ──────────────────────────────────────── */}
      <main
        className="relative z-10 flex-1 flex overflow-hidden"
        style={{ padding: "20px 24px", gap: "16px" }}
      >
        {stages.map((stage: FestivalStage) => {
          const color = stage.color || "#6366F1";
          const now = nowOn(stage.id);
          const prep = preparing(stage.id);
          const next = upcoming(stage.id);

          return (
            <div
              key={stage.id}
              className="flex-1 flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: now
                  ? `0 0 50px ${color}1a, inset 0 0 1px ${color}33`
                  : "none",
              }}
            >
              {/* Заголовок сцены */}
              <div
                className="flex items-center gap-2.5 shrink-0"
                style={{ padding: "12px 20px", borderBottom: `1px solid ${color}25` }}
              >
                <span
                  className="rounded-full shrink-0"
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}`,
                  }}
                />
                <span
                  className="font-bold uppercase"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    letterSpacing: "0.08em",
                    fontSize: "0.85rem",
                  }}
                >
                  {stage.name}
                </span>
                {now && (
                  <span
                    className="ml-auto text-xs font-bold rounded-full animate-pulse"
                    style={{
                      padding: "2px 10px",
                      backgroundColor: `${color}25`,
                      color,
                      letterSpacing: "0.1em",
                    }}
                  >
                    LIVE
                  </span>
                )}
              </div>

              {/* Контент */}
              <div
                className="flex-1 flex flex-col overflow-hidden"
                style={{ padding: "16px 20px", gap: "16px" }}
              >
                {now ? (
                  <div>
                    <div
                      className="text-xs font-bold uppercase mb-3"
                      style={{ color: `${color}88`, letterSpacing: "0.2em" }}
                    >
                      ▶ Сейчас на сцене
                    </div>
                    {/* Время начала + продолжительность */}
                    <div className="flex items-center gap-2 mb-2">
                      {now.start_time && (
                        <span
                          className="text-sm font-mono font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {format(msk(new Date(now.start_time)), "HH:mm")}
                        </span>
                      )}
                      {now.duration_minutes && (
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {now.duration_minutes} мин
                        </span>
                      )}
                    </div>
                    {/* Название */}
                    <div
                      className="font-bold leading-tight"
                      style={{
                        fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)",
                        color,
                        textShadow: `0 0 24px ${color}55`,
                      }}
                    >
                      {now.title}
                    </div>
                    {/* Коллектив / исполнитель */}
                    {now.performer_name && (
                      <div
                        className="mt-1.5 font-medium"
                        style={{ fontSize: "1rem", color: "rgba(255,255,255,0.65)" }}
                      >
                        {now.performer_name}
                      </div>
                    )}
                    {now.performers_count && now.performers_count > 1 && (
                      <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {now.performers_count} чел.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm italic" style={{ color: "rgba(255,255,255,0.15)" }}>
                    Нет активного выступления
                  </div>
                )}

                {(prep || next.length > 0) && (
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                )}

                {prep && (
                  <div>
                    <div
                      className="text-xs font-bold uppercase mb-2"
                      style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em" }}
                    >
                      ⏳ Готовится
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {prep.start_time && (
                        <span
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}
                        >
                          {format(msk(new Date(prep.start_time)), "HH:mm")}
                        </span>
                      )}
                      {prep.duration_minutes && (
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                          {prep.duration_minutes} мин
                        </span>
                      )}
                    </div>
                    <div className="font-semibold" style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.65)" }}>
                      {prep.title}
                    </div>
                    {prep.performer_name && (
                      <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                        {prep.performer_name}
                      </div>
                    )}
                  </div>
                )}

                {next.length > 0 && (
                  <div>
                    <div
                      className="text-xs font-bold uppercase mb-2"
                      style={{ color: "rgba(255,255,255,0.18)", letterSpacing: "0.2em" }}
                    >
                      Далее
                    </div>
                    <div className="flex flex-col gap-3">
                      {next.map((p: FestivalPerformance, i: number) => (
                        <div key={p.id} className="flex items-start gap-2.5">
                          <span
                            className="text-xs shrink-0 mt-0.5 tabular-nums"
                            style={{ color: "rgba(255,255,255,0.18)", minWidth: 14 }}
                          >
                            {i + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              {p.start_time && (
                                <span
                                  className="text-xs font-mono shrink-0"
                                  style={{ color: "rgba(255,255,255,0.3)" }}
                                >
                                  {format(msk(new Date(p.start_time)), "HH:mm")}
                                </span>
                              )}
                              {p.duration_minutes && (
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
                                  {p.duration_minutes} мин
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                              {p.title}
                            </div>
                            {p.performer_name && (
                              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                                {p.performer_name}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!now && !prep && next.length === 0 && (
                  <div
                    className="flex-1 flex items-center justify-center text-sm"
                    style={{ color: "rgba(255,255,255,0.08)" }}
                  >
                    — —
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {stages.length === 0 && (
          <div
            className="flex-1 flex items-center justify-center text-xl"
            style={{ color: "rgba(255,255,255,0.15)" }}
          >
            Сцены не настроены
          </div>
        )}
      </main>

      {/* ── Нижний тикер ──────────────────────────────────────── */}
      <footer
        className="relative z-10 shrink-0 flex items-center gap-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "10px 32px" }}
      >
        <span
          className="text-xs font-bold uppercase shrink-0"
          style={{ letterSpacing: "0.3em", color: "rgba(255,255,255,0.18)" }}
        >
          Программа
        </span>
        <div className="flex-1 overflow-hidden">
          <div
            className="flex gap-8 text-sm whitespace-nowrap"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            {performances
              .filter((p) => p.status !== "done" && p.status !== "cancelled")
              .slice(0, 15)
              .map((p: FestivalPerformance) => {
                const stage = stages.find((s: FestivalStage) => s.id === p.stage_id);
                const isActive = p.status === "performing";
                return (
                  <span
                    key={p.id}
                    className="shrink-0"
                    style={isActive ? { color: stage?.color || "#fff", fontWeight: "bold" } : {}}
                  >
                    {stage && (
                      <span
                        className="inline-block rounded-full mr-1.5 align-middle"
                        style={{ width: 6, height: 6, backgroundColor: stage.color || "#6366F1" }}
                      />
                    )}
                    {p.title}
                    {p.performer_name ? ` — ${p.performer_name}` : ""}
                  </span>
                );
              })}
          </div>
        </div>
        <span
          className="text-xs tabular-nums shrink-0"
          style={{ color: "rgba(255,255,255,0.1)" }}
        >
          {currentTime ? format(msk(currentTime), "HH:mm:ss") : "--:--:--"} МСК
        </span>
      </footer>
    </div>
  );
}
