"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { TapScale } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import CareRequestForm from "@/components/features/care/CareRequestForm";
import CareRequestList from "@/components/features/care/CareRequestList";
import { useCareRequests, useCaregiverOptions } from "@/lib/hooks/useCare";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";

type TabType = "sent" | "received";

export default function CarePage() {
    const [activeTab, setActiveTab] = useState<TabType>("sent");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCaregiverId, setSelectedCaregiverId] = useState("");
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";

    const {
        data: requests = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useCareRequests(guardianId, activeTab);

    const { data: caregiverOptions = [] } = useCaregiverOptions(guardianId);

    useEffect(() => {
        if (selectedCaregiverId || caregiverOptions.length === 0) return;
        setSelectedCaregiverId(caregiverOptions[0].id);
    }, [caregiverOptions, selectedCaregiverId]);

    useEffect(() => {
        if (!flashMessage) return;
        const timer = window.setTimeout(() => setFlashMessage(null), 2200);
        return () => window.clearTimeout(timer);
    }, [flashMessage]);

    const tabs: { key: TabType; label: string }[] = [
        { key: "sent", label: "Sent" },
        { key: "received", label: "Received" },
    ];

    return (
        <AppShell>
            <div className="px-4 py-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/modes">
                        <ArrowLeft className="w-5 h-5 text-foreground-muted" />
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-foreground">Care mode</h1>
                </div>

                <div role="tablist" className="flex gap-2 items-center">
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
                    {isFetching && (
                        <span className="text-xs text-foreground-muted" aria-live="polite">
                            refreshing...
                        </span>
                    )}
                </div>

                <CareRequestList
                    requests={requests}
                    isLoading={isLoading}
                    isError={isError}
                    onRetry={() => {
                        void refetch();
                    }}
                />
            </div>

            <TapScale className="fixed bottom-24 right-6 z-20">
                <button
                    onClick={() => setIsFormOpen(true)}
                    aria-label="Create care request"
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </TapScale>

            {guardian && (
                <CareRequestForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    requesterId={guardian.id}
                    caregiverId={selectedCaregiverId}
                    caregiverOptions={caregiverOptions}
                    onCaregiverChange={setSelectedCaregiverId}
                    onSubmitError={setFlashMessage}
                />
            )}

            {flashMessage && (
                <div
                    className="fixed bottom-40 left-4 right-4 z-30 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="status"
                    aria-live="polite"
                >
                    {flashMessage}
                </div>
            )}
        </AppShell>
    );
}
