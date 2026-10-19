import { useMemo, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Gavel,
  Heart,
  Scale,
} from "lucide-react";
import {
  CERTAINTY_LABEL,
  EVENTS,
  LANE_LABEL,
  LANES,
  type Certainty,
  type Lane,
  type TimelineEvent,
} from "@/data/timeline";

const LANE_ICON = {
  carrera: GraduationCap,
  vida: Heart,
  edificio: Building2,
  crimenes: Scale,
  fin: Gavel,
} as const;

function certaintyClass(c: Certainty) {
  if (c === "leyenda") return "text-oxblood";
  if (c === "probable") return "text-brass";
  return "text-ink";
}

export function HolmesTimeline() {
  const [lane, setLane] = useState<Lane | "todo">("todo");
  const [selectedId, setSelectedId] = useState("michigan");

  const ordered = useMemo(() => [...EVENTS].sort((a, b) => a.sort - b.sort), []);
  const visible = useMemo(
    () => (lane === "todo" ? ordered : ordered.filter((event) => event.lane === lane)),
    [lane, ordered],
  );

  const selected = visible.find((event) => event.id === selectedId) ?? visible[0];
  const index = Math.max(
    0,
    visible.findIndex((event) => event.id === selected.id),
  );

  function chooseLane(next: Lane | "todo") {
    setLane(next);
    const pool = next === "todo" ? ordered : ordered.filter((event) => event.lane === next);
    setSelectedId((current) => (pool.some((event) => event.id === current) ? current : pool[0].id));
  }

  function go(delta: number) {
    const next = visible[index + delta];
    if (!next) return;
    setSelectedId(next.id);
    requestAnimationFrame(() => {
      document.getElementById(`ev-${next.id}`)?.scrollIntoView({ block: "nearest" });
    });
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-xs font-semibold tracking-[0.22em] text-brass uppercase">
            Archivo · Chicago 1886–1896
          </p>
          <h1 className="mt-3 font-display text-5xl leading-none font-semibold tracking-tight sm:text-7xl">
            H. H. Holmes
          </h1>
          <p className="mt-3 max-w-2xl font-display text-xl text-ink italic sm:text-2xl">
            De la facultad de medicina a la horca.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Herman Webster Mudgett sale de la carrera en junio de 1884. Esta línea sigue
            desde ahí: el alias, las esposas, cómo consigue el edificio de Englewood,
            los nueve asesinatos que sí se sostienen y la ejecución del 7 de mayo de
            1896. Lo que la prensa inventó va marcado como leyenda.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
          {[
            ["9", "víctimas confirmadas"],
            ["3", "esposas a la vez"],
            ["34", "años al morir"],
            ["1896", "la horca"],
          ].map(([value, label]) => (
            <div key={label} className="bg-sheet px-4 py-4">
              <p className="font-display text-3xl leading-none font-semibold">{value}</p>
              <p className="mt-2 text-sm text-muted">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-card border border-line bg-sheet p-5 sm:p-6">
          <h2 className="font-display text-2xl font-semibold">Cómo consiguió el edificio</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            No era la casa de la familia. Myrta y Lucy vivían en Wilmette. Lo que
            llamaron “castillo” fue un local de esquina, comprado y levantado a crédito.
          </p>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Agosto de 1886: entra de empleado a la farmacia de Elizabeth Holton, viuda, en Wallace y 63rd.",
              "Se queda con la botica. No mata al doctor Holton: el dueño ya había muerto.",
              "En 1887 compra el lote de enfrente y encarga dos plantas. En 1888 lo demandan por no pagar.",
              "Rota cuadrillas para que nadie vea el plano entero. En 1892 añade un tercer piso y lo llama hotel de la Feria.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-display text-lg leading-none text-brass">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar la línea">
          {LANES.map((item) => {
            const count =
              item.id === "todo" ? ordered.length : ordered.filter((event) => event.lane === item.id).length;
            const active = lane === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => chooseLane(item.id)}
                className={
                  "min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium " +
                  (active
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-sheet text-ink")
                }
              >
                {item.label}
                <span className={active ? "text-line" : "text-muted"}> {count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <ol className="relative m-0 list-none p-0">
            <div className="absolute top-3 bottom-3 left-16 w-px bg-line" aria-hidden />
            {visible.map((event, i) => {
              const showChapter = i === 0 || visible[i - 1].chapter !== event.chapter;
              return (
                <li key={event.id} id={`ev-${event.id}`} className="scroll-mt-6">
                  <EventRow
                    event={event}
                    active={event.id === selected.id}
                    showChapter={showChapter}
                    onSelect={() => setSelectedId(event.id)}
                  />
                </li>
              );
            })}
          </ol>

          <Dossier event={selected} index={index} total={visible.length} onGo={go} />
        </div>

        <footer className="mt-12 border-t border-line pt-6 text-sm leading-relaxed text-muted">
          <p>
            Fechas según actas, el juicio de Filadelfia de 1895 y la investigación que
            fija nueve víctimas confirmadas. El plano del “Murder Castle” sale del{" "}
            <span className="text-ink">New York World</span> del 11 de agosto de 1895,
            no de los planos de obra. Esta línea no sigue la novela de Erik Larson.
          </p>
          <p className="mt-3">
            <a
              className="text-ink underline decoration-line underline-offset-4"
              href="https://en.wikipedia.org/wiki/H._H._Holmes"
              target="_blank"
              rel="noreferrer"
            >
              Expediente público (Wikipedia)
            </a>
            <span aria-hidden> · </span>
            <a
              className="text-ink underline decoration-line underline-offset-4"
              href="https://www.smithsonianmag.com/smart-news/enduring-mystery-hh-holmes-americas-first-serial-killer-180977646/"
              target="_blank"
              rel="noreferrer"
            >
              Smithsonian, sobre el mito
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

function EventRow({
  event,
  active,
  showChapter,
  onSelect,
}: {
  event: TimelineEvent;
  active: boolean;
  showChapter: boolean;
  onSelect: () => void;
}) {
  const Icon = LANE_ICON[event.lane];
  return (
    <div className="mb-3">
      {showChapter ? (
        <div className="mb-2 flex">
          <span className="w-14 shrink-0" aria-hidden />
          <span className="w-4 shrink-0" aria-hidden />
          <p className="font-display text-sm tracking-wide text-brass italic">{event.chapter}</p>
        </div>
      ) : null}
      <div className="flex">
        <div className="w-14 shrink-0 pt-4 text-right">
          <span className="text-xs font-semibold text-muted">{event.year}</span>
        </div>
        <div className="relative w-4 shrink-0">
          <span
            className={
              "absolute top-5 left-1/2 z-10 size-2.5 -translate-x-1/2 rounded-full border-2 border-paper " +
              (active ? "bg-oxblood" : "bg-brass")
            }
            aria-hidden
          />
        </div>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={active}
          className={
            "min-w-0 flex-1 rounded-card border px-4 py-3 text-left " +
            (active ? "border-ink bg-sheet" : "border-line bg-paper")
          }
        >
        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <Icon className="size-3.5 text-brass" aria-hidden />
          <span className="text-muted">{LANE_LABEL[event.lane]}</span>
          <span className={certaintyClass(event.certainty)}>· {CERTAINTY_LABEL[event.certainty]}</span>
        </span>
        <span className="mt-1 block font-display text-lg leading-snug font-semibold">{event.title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">{event.summary}</span>
        {active ? (
          <span className="mt-3 block space-y-2 border-t border-line pt-3 text-sm leading-relaxed lg:hidden">
            <span className="block text-xs font-semibold tracking-wide text-brass uppercase">{event.date}</span>
            {event.body.map((paragraph) => (
              <span key={paragraph} className="block">
                {paragraph}
              </span>
            ))}
          </span>
        ) : null}
      </button>
      </div>
    </div>
  );
}

function Dossier({
  event,
  index,
  total,
  onGo,
}: {
  event: TimelineEvent;
  index: number;
  total: number;
  onGo: (delta: number) => void;
}) {
  const Icon = LANE_ICON[event.lane];
  return (
    <aside className="sticky top-4 hidden rounded-card border border-line bg-sheet p-6 lg:block">
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-semibold tracking-[0.16em] uppercase ${certaintyClass(event.certainty)}`}>
          {CERTAINTY_LABEL[event.certainty]}
        </p>
        <p className="text-xs text-muted">
          {index + 1} / {total}
        </p>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <Icon className="size-4 text-brass" aria-hidden />
        {LANE_LABEL[event.lane]} · {event.date}
      </p>
      <h2 className="mt-2 font-display text-3xl leading-tight font-semibold">{event.title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed">
        {event.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => onGo(-1)}
          disabled={index === 0}
          className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-4 text-sm font-medium disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onGo(1)}
          disabled={index === total - 1}
          className="inline-flex min-h-11 items-center gap-1 rounded-full border border-ink bg-ink px-4 text-sm font-medium text-paper disabled:opacity-40"
        >
          Siguiente
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
