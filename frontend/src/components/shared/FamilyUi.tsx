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
      "rounded-[1.75rem] border p-4 shadow-sm",
      light ? "border-sky-100 bg-white" : "border-sky-100 bg-sky-50/80"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              {eyebrow}
            </p>
          ) : null}
          <div className="mt-1 flex items-center gap-2">
            {backHref ? (
              <Link href={backHref} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            ) : null}
            <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
          </div>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
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
        "rounded-[1.75rem] border p-4 shadow-sm",
        tone === "default" && "border-sky-100 bg-white",
        tone === "soft" && "border-sky-100 bg-sky-50/70",
        tone === "accent" && "border-sky-200 bg-sky-100/70",
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
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {meta ? <p className="mt-1 text-xs text-foreground-muted">{meta}</p> : null}
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
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "default" && "bg-sky-100 text-sky-700",
        tone === "success" && "bg-green-50 text-green-700",
        tone === "warning" && "bg-amber-50 text-amber-700",
        tone === "danger" && "bg-red-50 text-red-700"
      )}
    >
      {label}
    </span>
  );
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
