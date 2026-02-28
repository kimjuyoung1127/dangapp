// care/page.tsx — 돌봄 요청 목록 페이지

"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { TapScale } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CareRequestList from "@/components/features/care/CareRequestList";
import CareRequestForm from "@/components/features/care/CareRequestForm";
import type { Database } from "@/types/database.types";

type CareRequest = Database["public"]["Tables"]["care_requests"]["Row"];
type TabType = "sent" | "received";

// 더미 데이터
const MOCK_REQUESTS: CareRequest[] = [
    {
        id: "cr-1",
        requester_id: "mock-user",
        caregiver_id: "mock-partner-1",
        dog_id: null,
        title: "주말 산책 대행 부탁드려요",
        description: "토요일 오후에 한강 산책 부탁드립니다.",
        care_type: "walk",
        datetime: "2026-03-05T14:00:00Z",
        duration_hours: 2,
        status: "pending",
        created_at: "2026-02-28T10:00:00Z",
        updated_at: "2026-02-28T10:00:00Z",
    },
    {
        id: "cr-2",
        requester_id: "mock-user",
        caregiver_id: "mock-partner-2",
        dog_id: null,
        title: "동물병원 방문 동행",
        description: null,
        care_type: "hospital",
        datetime: "2026-03-02T10:00:00Z",
        duration_hours: 1,
        status: "accepted",
        created_at: "2026-02-27T08:00:00Z",
        updated_at: "2026-02-27T09:00:00Z",
    },
];

export default function CarePage() {
    const [activeTab, setActiveTab] = useState<TabType>("sent");
    const [isFormOpen, setIsFormOpen] = useState(false);

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
                <CareRequestList
                    requests={activeTab === "sent" ? MOCK_REQUESTS : []}
                    isLoading={false}
                />
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
            <CareRequestForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                requesterId="mock-user"
                caregiverId="mock-partner"
            />
        </AppShell>
    );
}
