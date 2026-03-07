// File: Shared onboarding layout with family-direction progress framing.
"use client";

import { motion } from "framer-motion";
import { PageSlide } from "@/components/ui/MotionWrappers";
import { useOnboardingStore } from "@/stores/useOnboardingStore";

export function OnboardingLayout({
    children,
    title,
    subtitle,
}: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}) {
    const { step, maxStep, prevStep } = useOnboardingStore();
    const progress = (step / maxStep) * 100;

    return (
        <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_40%,#f8fafc_100%)]">
            <header className="sticky top-0 z-10 border-b border-sky-100 bg-white/90 px-6 pb-4 pt-10 backdrop-blur">
                <div className="mx-auto max-w-lg">
                    <div className="flex items-center justify-between">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M15 18L9 12L15 6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        ) : (
                            <div className="h-10 w-10" />
                        )}

                        <div className="text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                                onboarding
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                {step} / {maxStep} 단계
                            </p>
                        </div>

                        <div className="h-10 w-10" />
                    </div>

                    <div className="mt-5 overflow-hidden rounded-full bg-sky-100">
                        <motion.div
                            className="h-2 rounded-full bg-sky-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pb-24 pt-6">
                <PageSlide className="flex flex-1 flex-col">
                    <div className="rounded-[2rem] border border-sky-100 bg-white/95 p-6 shadow-[0_24px_70px_-34px_rgba(14,165,233,0.3)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                            family setup
                        </p>
                        <h1 className="mt-3 text-3xl font-display font-bold text-foreground">{title}</h1>
                        {subtitle ? (
                            <p className="mt-2 text-sm leading-6 text-foreground-muted">{subtitle}</p>
                        ) : null}
                        <div className="mt-8">{children}</div>
                    </div>
                </PageSlide>
            </main>
        </div>
    );
}
