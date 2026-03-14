"use client";

import Link from "next/link";
import { Calendar, Dog, Users } from "lucide-react";
import { ScrollReveal, TapScale } from "@/components/ui/MotionWrappers";
import type { Database } from "@/types/database.types";

type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];

interface FamilyGroupCardProps {
    group: FamilyGroup;
    memberCount: number;
    memberCountError?: boolean;
}

export default function FamilyGroupCard({
    group,
    memberCount,
    memberCountError = false,
}: FamilyGroupCardProps) {
    const dogCount = group.dog_ids?.length ?? 0;

    return (
        <ScrollReveal>
            <div className="bg-card rounded-3xl border border-border p-5 space-y-4">
                <h3 className="font-display font-semibold text-lg text-foreground">{group.name}</h3>

                <div className="flex items-center gap-4 text-sm text-foreground-muted">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary/70" />
                        <span>구성원 {memberCount}명</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Dog className="w-4 h-4 text-primary/70" />
                        <span>반려견 {dogCount}마리</span>
                    </div>
                </div>

                {memberCountError && (
                    <p className="text-xs text-amber-600">구성원 수를 불러오지 못해 기본값으로 보여드려요.</p>
                )}

                <div className="flex gap-2">
                    <TapScale className="flex-1">
                        <Link
                            href={`/family/${group.id}/schedules`}
                            className="block w-full py-2.5 bg-primary/10 text-primary font-medium text-sm rounded-xl text-center"
                        >
                            <Calendar className="w-4 h-4 inline mr-1" />
                            일정 보기
                        </Link>
                    </TapScale>
                    <TapScale className="flex-1">
                        <Link
                            href={`/family/${group.id}/members`}
                            className="block w-full py-2.5 bg-muted text-foreground-muted font-medium text-sm rounded-xl text-center"
                        >
                            <Users className="w-4 h-4 inline mr-1" />
                            구성원 보기
                        </Link>
                    </TapScale>
                </div>
            </div>
        </ScrollReveal>
    );
}
