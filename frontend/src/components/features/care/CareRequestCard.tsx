// CareRequestCard.tsx — 돌봄 요청 카드 (상태별 표시)

"use client";

import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import { CARE_TYPES, CARE_STATUS_CONFIG } from "@/lib/constants/modes";
import type { Database } from "@/types/database.types";

type CareRequest = Database["public"]["Tables"]["care_requests"]["Row"];

interface CareRequestCardProps {
    request: CareRequest;
    partnerName?: string;
}

export default function CareRequestCard({
    request,
    partnerName,
}: CareRequestCardProps) {
    const careTypeInfo = CARE_TYPES.find((t) => t.value === request.care_type);
    const statusInfo = CARE_STATUS_CONFIG[request.status];
    const Icon = careTypeInfo?.icon;

    return (
        <ScrollReveal>
            <div className="bg-card rounded-3xl border border-border p-5 space-y-3">
                {/* 상단: 유형 + 상태 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-4.5 h-4.5 text-primary" />}
                        <span className="text-sm font-semibold text-foreground">
                            {careTypeInfo?.label ?? request.care_type}
                        </span>
                    </div>
                    <span
                        className={cn(
                            "text-xs font-medium px-2.5 py-1 rounded-full",
                            statusInfo.color
                        )}
                    >
                        {statusInfo.label}
                    </span>
                </div>

                {/* 제목 */}
                <h3 className="font-display font-semibold text-foreground">
                    {request.title}
                </h3>

                {/* 대상 */}
                {partnerName && (
                    <p className="text-sm text-foreground-muted">
                        {partnerName}에게
                    </p>
                )}

                {/* 일시 + 소요시간 */}
                <div className="flex items-center gap-4 text-sm text-foreground-muted">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        <span>
                            {new Date(request.datetime).toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary/70" />
                        <span>{request.duration_hours}시간</span>
                    </div>
                </div>

                {/* 설명 */}
                {request.description && (
                    <p className="text-sm text-foreground-muted line-clamp-2">
                        {request.description}
                    </p>
                )}
            </div>
        </ScrollReveal>
    );
}
