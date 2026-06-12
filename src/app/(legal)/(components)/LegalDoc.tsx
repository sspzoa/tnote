import { ArrowUpRight, Info } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** A single rendered block inside a legal section. */
export type LegalBlock =
  | { kind: "paragraph"; text: ReactNode }
  | { kind: "subheading"; text: ReactNode }
  | { kind: "list"; items: ReactNode[] }
  | { kind: "orderedList"; items: ReactNode[] }
  | { kind: "callout"; text: ReactNode }
  | { kind: "definitions"; terms: { term: ReactNode; desc: ReactNode }[] }
  | { kind: "table"; table: { headers: string[]; rows: ReactNode[][] } };

export interface LegalSection {
  /** ascii kebab anchor */
  id: string;
  /** e.g. 제1조 */
  number?: string;
  title: string;
  blocks: LegalBlock[];
}

interface LegalDocProps {
  title: string;
  /** e.g. 2026년 6월 12일 */
  effectiveDate: string;
  intro?: ReactNode;
  sections: LegalSection[];
  /** Cross-link to the sibling document. */
  sibling: { href: string; label: string };
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="text-[15px] text-muted-foreground leading-relaxed">{block.text}</p>;
    case "subheading":
      return <h3 className="mt-2 font-semibold text-foreground text-sm tracking-[-0.01em]">{block.text}</h3>;
    case "list":
      return (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] text-muted-foreground leading-relaxed marker:text-border-strong">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-[15px] text-muted-foreground leading-relaxed marker:text-muted-foreground/60 marker:tabular-nums">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div className="flex gap-3 rounded-xl border border-border bg-muted/50 p-4 print:bg-transparent">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary [&_svg]:size-3.5">
            <Info />
          </span>
          <p className="text-muted-foreground text-sm leading-relaxed">{block.text}</p>
        </div>
      );
    case "definitions":
      return (
        <dl className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
          {block.terms.map((entry, i) => (
            <div key={i} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
              <dt className="shrink-0 font-semibold text-foreground text-sm sm:w-32">{entry.term}</dt>
              <dd className="text-[15px] text-muted-foreground leading-relaxed">{entry.desc}</dd>
            </div>
          ))}
        </dl>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-border shadow-xs">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/50">
              <tr>
                {block.table.headers.map((h, i) => (
                  <th key={i} className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-foreground text-xs">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, ri) => (
                <tr key={ri} className="border-border border-t">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 align-top text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function LegalDoc({ title, effectiveDate, intro, sections, sibling }: LegalDocProps) {
  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar — brand + sibling-doc cross link */}
      <header className="sticky top-0 z-20 border-border border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70 print:hidden">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-xs shadow-brand">
              T
            </span>
            <span className="font-bold text-base tracking-[-0.01em]">Tnote</span>
          </Link>
          <Link
            href={sibling.href}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground">
            {sibling.label}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl gap-12 px-6 py-10 md:py-14">
        {/* Sticky table of contents (desktop) */}
        <nav aria-label="목차" className="hidden w-52 shrink-0 lg:block print:hidden">
          <div className="sticky top-24 flex flex-col gap-1">
            <p className="px-3 pb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">목차</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="truncate rounded-md px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground">
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Document body */}
        <article className="min-w-0 max-w-3xl flex-1">
          <div className="flex flex-col gap-3 border-border border-b pb-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary-soft px-2.5 py-1 font-medium text-primary text-xs">
              시행일 {effectiveDate}
            </span>
            <h1 className="font-bold text-3xl text-foreground tracking-[-0.02em] md:text-4xl">{title}</h1>
            {intro && <p className="text-[15px] text-muted-foreground leading-relaxed">{intro}</p>}
          </div>

          <div className="flex flex-col gap-10 pt-8">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="flex scroll-mt-20 flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  {section.number && (
                    <span className="font-semibold text-primary text-xs tracking-wide">{section.number}</span>
                  )}
                  <h2 className="font-semibold text-foreground text-lg tracking-[-0.01em]">{section.title}</h2>
                </div>
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </section>
            ))}
          </div>

          <footer className="mt-12 flex flex-col gap-1 border-border border-t pt-6 text-muted-foreground text-xs">
            <p>본 문서는 {effectiveDate}부터 시행됩니다.</p>
            <p>© {new Date().getFullYear()} Tnote</p>
          </footer>
        </article>
      </main>
    </div>
  );
}

/** Render an array of `{kind,...}` data blocks (e.g. produced upstream) into LegalBlock shapes. */
export type { LegalDocProps };
