// File: Shared family-direction UI primitives for route headers, surfaces, and chips.
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function FamilyPageIntro({
  eyebrow,
  title,
  description,
  action,
  backHref,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  light?: boolean;
}) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-[2rem] border p-5 shadow-[0_24px_60px_-34px_rgba(17,49,85,0.24)]",
      light
        ? "border-white/80 bg-white/88 backdrop-blur-xl"
        : "border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(238,246,255,0.94)_52%,rgba(219,234,248,0.84)_100%)] backdrop-blur-xl"
    )}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_16rem)]" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700/90">
              {eyebrow}
            </p>
          ) : null}
          <div className="mt-2 flex items-start gap-2">
            {backHref ? (
              <Link href={backHref} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/85 text-sky-700 shadow-[0_12px_26px_-20px_rgba(17,49,85,0.42)]">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            ) : null}
            <div className="min-w-0">
              <h1 className="editorial-title text-[2rem] font-display font-bold text-foreground sm:text-[2.3rem]">{title}</h1>
            </div>
          </div>
          {description ? (
            <p className="mt-3 max-w-[32rem] text-[14px] leading-6 text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 pt-1">{action}</div> : null}
      </div>
    </div>
  );
}

export function FamilySurface({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "soft" | "accent";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.9rem] border p-4 shadow-[0_18px_38px_-28px_rgba(17,49,85,0.22)] backdrop-blur-xl",
        tone === "default" && "border-white/80 bg-white/88",
        tone === "soft" && "border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(239,246,255,0.82)_100%)]",
        tone === "accent" && "border-sky-200/60 bg-[linear-gradient(180deg,rgba(235,245,255,0.94)_0%,rgba(217,233,248,0.92)_100%)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FamilySectionTitle({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
        {meta ? <p className="mt-1 text-[12px] leading-5 text-foreground-muted">{meta}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function FamilyStatusChip({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em]",
        tone === "default" && "border-sky-200/70 bg-white/88 text-sky-700",
        tone === "success" && "border-green-200 bg-green-50 text-green-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "danger" && "border-red-200 bg-red-50 text-red-700"
      )}
    >
      {label}
    </span>
  );
}

export function FamilyDebugBadge({
  label = "예시 데이터",
}: {
  label?: string;
}) {
  return <FamilyStatusChip label={label} tone="warning" />;
}

export function FamilyEmptyPanel({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <FamilySurface tone="soft" className="text-center">
      <p className="text-sm leading-6 text-foreground-muted">{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </FamilySurface>
  );
}
