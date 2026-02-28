"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, MessageCircle, BookOpen, User } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide Top/Bottom Nav on specific pages like auth, onboarding
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
    const isOnboardingPage = pathname?.startsWith('/onboarding');
    const hideNav = isAuthPage || isOnboardingPage;

    if (hideNav) {
        return <main className="min-h-screen bg-background">{children}</main>;
    }

    const NAV_ITEMS = [
        { icon: Home, label: '홈', href: '/home' },
        { icon: MessageCircle, label: '채팅', href: '/chat' },
        { icon: BookOpen, label: '댕로그', href: '/danglog' },
        { icon: User, label: '프로필', href: '/profile' },
    ];

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-30 bg-card/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 justify-between">
                {/* Top bar content will be dynamically injected, sticking a placeholder for now */}
                <div className="text-lg font-display font-semibold text-primary">DangGeting</div>
            </header>

            <main className="pt-14 pb-[calc(4rem+env(safe-area-inset-bottom))] min-h-screen bg-background">
                {children}
            </main>

            <nav
                className="fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border h-16 safe-area-pb"
                aria-label="메인 내비게이션"
            >
                <div className="flex justify-around items-center h-full">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname?.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full transition-all",
                                    isActive
                                        ? "text-primary font-display scale-105"
                                        : "text-foreground-muted hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-6 h-6 mb-1", isActive && "stroke-[2.5px]")} />
                                <span className="text-[10px] sm:text-xs">
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    );
}
