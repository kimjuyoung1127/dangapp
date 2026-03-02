// NotificationSettings.tsx — 알림 설정 토글 섹션 (DANG-PRF-001)

"use client";

import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/lib/hooks/useProfile";
import { Bell, MessageCircle, Calendar, BookOpen, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NotificationSettingsProps {
    userId: string;
}

interface ToggleItem {
    key: "push_opt_in" | "chat_opt_in" | "schedule_opt_in" | "danglog_opt_in" | "marketing_opt_in";
    label: string;
    description: string;
    icon: LucideIcon;
}

const TOGGLE_ITEMS: ToggleItem[] = [
    {
        key: "push_opt_in",
        label: "푸시 알림",
        description: "전체 푸시 알림 수신",
        icon: Bell,
    },
    {
        key: "chat_opt_in",
        label: "채팅 알림",
        description: "새 메시지 도착 시 알림",
        icon: MessageCircle,
    },
    {
        key: "schedule_opt_in",
        label: "약속 알림",
        description: "약속 확정/변경/리마인더 알림",
        icon: Calendar,
    },
    {
        key: "danglog_opt_in",
        label: "댕로그 알림",
        description: "좋아요, 댓글, 공유 알림",
        icon: BookOpen,
    },
    {
        key: "marketing_opt_in",
        label: "마케팅 알림",
        description: "이벤트, 프로모션 알림",
        icon: Megaphone,
    },
];

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
    const { data: settings, isLoading } = useNotificationSettings(userId);
    const updateSettings = useUpdateNotificationSettings();

    const handleToggle = (key: ToggleItem["key"]) => {
        if (!settings) return;
        updateSettings.mutate({
            userId,
            settings: { [key]: !settings[key] },
        });
    };

    if (isLoading) {
        return <NotificationSkeleton />;
    }

    return (
        <ScrollReveal>
            <div className="bg-card rounded-3xl border border-border p-5 space-y-1">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                    알림 설정
                </h3>
                {TOGGLE_ITEMS.map((item, idx) => {
                    const Icon = item.icon;
                    const isEnabled = settings?.[item.key] ?? false;

                    return (
                        <div
                            key={item.key}
                            className={cn(
                                "flex items-center justify-between py-3",
                                idx < TOGGLE_ITEMS.length - 1 && "border-b border-border/50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-4.5 h-4.5 text-foreground-muted" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {item.label}
                                    </p>
                                    <p className="text-xs text-foreground-muted">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            {/* 토글 스위치 */}
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isEnabled}
                                onClick={() => handleToggle(item.key)}
                                className={cn(
                                    "relative w-11 h-6 rounded-full transition-colors",
                                    isEnabled ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                                        isEnabled && "translate-x-5"
                                    )}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ScrollReveal>
    );
}

function NotificationSkeleton() {
    return (
        <div className="bg-card rounded-3xl border border-border p-5 space-y-3">
            <Skeleton className="h-4 w-16 rounded-xl" />
            {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-16 rounded-xl" />
                            <Skeleton className="h-2.5 w-28 rounded-xl" />
                        </div>
                    </div>
                    <Skeleton className="w-11 h-6 rounded-full" />
                </div>
            ))}
        </div>
    );
}
