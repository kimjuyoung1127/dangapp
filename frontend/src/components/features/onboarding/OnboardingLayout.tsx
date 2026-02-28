"use client";

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { motion } from 'framer-motion';

export function OnboardingLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) {
    const { step, maxStep, prevStep } = useOnboardingStore();

    const progress = (step / maxStep) * 100;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Top Bar with Progress */}
            <header className="sticky top-0 z-10 bg-background pt-12 pb-4 px-6">
                <div className="flex items-center justify-between mb-6">
                    {step > 1 ? (
                        <button onClick={prevStep} className="p-2 -ml-2 text-foreground-muted hover:text-foreground">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    ) : (
                        <div className="w-10"></div> // Placeholder for balance
                    )}
                    <span className="text-sm font-medium text-primary">{step} / {maxStep}</span>
                    <div className="w-10"></div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-border-default rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col px-6 pt-4 pb-24 max-w-lg mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0 }}
                    className="flex-1 flex flex-col"
                >
                    <h1 className="text-3xl font-display font-bold text-foreground mb-2">{title}</h1>
                    {subtitle && <p className="text-foreground-muted mb-8">{subtitle}</p>}

                    <div className="flex-1">
                        {children}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
