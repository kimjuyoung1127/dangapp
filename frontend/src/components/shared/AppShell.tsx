"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Home, MessageCircle, BookOpen, User } from 'lucide-react';
import { DebugNavigator } from '@/components/ui/DebugNavigator';

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide Top/Bottom Nav on specific pages like auth, onboarding
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
    const isOnboardingPage = pathname?.startsWith('/onboarding');
    const hideNav = isAuthPage || isOnboardingPage;

    const NAV_ITEMS = [
        { icon: Home, label: '홈', href: '/home' },
        { icon: MessageCircle, label: '채팅', href: '/chat' },
        { icon: BookOpen, label: '댕로그', href: '/danglog' },
        { icon: User, label: '프로필', href: '/profile' },
    ];

    return (
        <div className="page-shell relative min-h-screen">
            {/* 디버깅 도구는 어떤 상황에서도 보임 */}
            <DebugNavigator />

            {hideNav ? (
                <main className="min-h-screen bg-background">{children}</main>
            ) : (
                <>
                    <header className="fixed inset-x-0 top-0 z-30 px-3 pt-3">
                        <div className="glass-panel mx-auto flex h-14 w-full max-w-md items-center justify-between rounded-[1.6rem] px-4">
                            <div className="relative h-8 w-24">
                                <Image
                                    src="/logo.svg"
                                    alt="댕게팅"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                            <div className="rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-sky-700">
                                안심 연결
                            </div>
                        </div>
                    </header>

                    <main className="min-h-screen bg-transparent pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-[4.6rem]">
                        {children}
                    </main>

                    <nav
                        className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
                        aria-label="메인 내비게이션"
                    >
                        <div className="glass-panel mx-auto flex h-[4.55rem] w-full max-w-md items-center justify-around rounded-[1.9rem] px-2">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname?.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={isActive ? "page" : undefined}
                                        className={cn(
                                            "flex h-full w-full flex-col items-center justify-center gap-1 rounded-[1.2rem] transition-all duration-200",
                                            isActive
                                                ? "bg-white text-primary shadow-[0_14px_28px_-22px_rgba(20,88,153,0.45)]"
                                                : "text-foreground-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5", isActive && "stroke-[2.4px]")} />
                                        <span className="text-[10px] font-medium sm:text-[11px]">
                                            {item.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>
                </>
            )}
        </div>
    );
}
