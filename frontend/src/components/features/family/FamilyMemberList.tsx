// FamilyMemberList.tsx — 그룹 멤버 목록 + 역할 표시

"use client";

import { StaggerList, StaggerItem } from "@/components/ui/MotionWrappers";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { FAMILY_ROLES } from "@/lib/constants/modes";
import type { Database } from "@/types/database.types";

type FamilyMember = Database["public"]["Tables"]["family_members"]["Row"];

interface FamilyMemberListProps {
    members: FamilyMember[];
    isLoading: boolean;
}

export default function FamilyMemberList({
    members,
    isLoading,
}: FamilyMemberListProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <MemberSkeleton />
                <MemberSkeleton />
            </div>
        );
    }

    if (members.length === 0) {
        return (
            <p className="text-sm text-foreground-muted text-center py-6">
                멤버가 없어요.
            </p>
        );
    }

    return (
        <StaggerList className="space-y-3">
            {members.map((member) => {
                const roleInfo = FAMILY_ROLES[member.role as keyof typeof FAMILY_ROLES];
                return (
                    <StaggerItem key={`${member.group_id}-${member.member_id}`}>
                        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                            <div className="w-10 h-10 rounded-full bg-primary-light/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-display font-bold text-primary">
                                    {member.member_id.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {member.member_id.slice(0, 8)}
                                </p>
                                <p className={cn("text-xs font-medium", roleInfo.color)}>
                                    {roleInfo.label}
                                </p>
                            </div>
                        </div>
                    </StaggerItem>
                );
            })}
        </StaggerList>
    );
}

function MemberSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded-xl" />
                <Skeleton className="h-3 w-12 rounded-xl" />
            </div>
        </div>
    );
}
