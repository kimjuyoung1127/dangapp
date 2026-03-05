"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { StaggerItem, StaggerList, TapScale } from "@/components/ui/MotionWrappers";
import FamilyGroupCard from "@/components/features/family/FamilyGroupCard";
import FamilyGroupForm from "@/components/features/family/FamilyGroupForm";
import { useFamilyGroups, useFamilyMembers } from "@/lib/hooks/useFamily";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import type { Database } from "@/types/database.types";

type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];

export default function FamilyPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";

    const {
        data: groups = [],
        isLoading,
        isError,
        refetch,
    } = useFamilyGroups(guardianId);

    return (
        <AppShell>
            <div className="px-4 py-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/modes">
                        <ArrowLeft className="w-5 h-5 text-foreground-muted" />
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-foreground">Family mode</h1>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <FamilyGroupSkeleton />
                        <FamilyGroupSkeleton />
                    </div>
                ) : isError ? (
                    <div className="text-center py-10 space-y-3">
                        <p className="text-sm text-red-600">Failed to load family groups.</p>
                        <button
                            type="button"
                            className="text-primary text-sm font-medium"
                            onClick={() => {
                                void refetch();
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                        <p className="text-foreground-muted text-sm">No family groups yet.</p>
                        <TapScale>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="text-primary font-medium text-sm"
                            >
                                Create your first group
                            </button>
                        </TapScale>
                    </div>
                ) : (
                    <StaggerList className="space-y-4" animateOnMount={false}>
                        {groups.map((group) => (
                            <FamilyGroupCardWithCount key={group.id} group={group} />
                        ))}
                    </StaggerList>
                )}
            </div>

            <TapScale className="fixed bottom-24 right-6 z-20">
                <button
                    onClick={() => setIsFormOpen(true)}
                    aria-label="Create family group"
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </TapScale>

            {guardian && (
                <FamilyGroupForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    creatorId={guardian.id}
                />
            )}
        </AppShell>
    );
}

function FamilyGroupCardWithCount({ group }: { group: FamilyGroup }) {
    const { data: members = [], isError } = useFamilyMembers(group.id);

    return (
        <StaggerItem>
            <FamilyGroupCard
                group={group}
                memberCount={isError ? 0 : members.length}
                memberCountError={isError}
            />
        </StaggerItem>
    );
}

function FamilyGroupSkeleton() {
    return (
        <div className="bg-card rounded-3xl border border-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32 rounded-xl" />
                    <Skeleton className="h-4 w-20 rounded-xl" />
                </div>
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
        </div>
    );
}