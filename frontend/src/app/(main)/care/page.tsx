// care/page.tsx — 돌봄 요청 목록 페이지 (DANG-B2B-001)

"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { TapScale } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CareRequestList from "@/components/features/care/CareRequestList";
import CareRequestForm from "@/components/features/care/CareRequestForm";
import { useCareRequests } from "@/lib/hooks/useCare";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";

type TabType = "sent" | "received";

export default function CarePage() {
    const [activeTab, setActiveTab] = useState<TabType>("sent");
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";

    const { data: requests = [], isLoading } = useCareRequests(guardianId, activeTab);

    const tabs: { key: TabType; label: string }[] = [
        { key: "sent", label: "보낸 요청" },
        { key: "received", label: "받은 요청" },
    ];

    return (
        <AppShell>
            <div className="px-4 py-6 space-y-6">
                {/* 헤더 */}
                <div className="flex items-center gap-3">
                    <Link href="/modes">
                        <ArrowLeft className="w-5 h-5 text-foreground-muted" />
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-foreground">
                        돌봄 모드
                    </h1>
                </div>

                {/* 탭 */}
                <div role="tablist" className="flex gap-2">
                    {tabs.map((tab) => (
                        <TapScale key={tab.key}>
                            <button
                                role="tab"
                                aria-selected={activeTab === tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                    activeTab === tab.key
                                        ? "bg-foreground text-background"
                                        : "bg-muted text-foreground-muted hover:bg-muted/80"
                                )}
                            >
                                {tab.label}
                            </button>
                        </TapScale>
                    ))}
                </div>

                {/* 요청 목록 */}
                <CareRequestList requests={requests} isLoading={isLoading} />
            </div>

            {/* FAB */}
            <TapScale className="fixed bottom-24 right-6 z-20">
                <button
                    onClick={() => setIsFormOpen(true)}
                    aria-label="새 돌봄 요청 작성"
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </TapScale>

            {/* 돌봄 요청 폼 */}
            {guardian && (
                <CareRequestForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    requesterId={guardian.id}
                    caregiverId=""
                />
            )}
        </AppShell>
    );
}
