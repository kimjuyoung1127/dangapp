"use client";

import { StaggerItem, StaggerList } from "@/components/ui/MotionWrappers";
import { Skeleton } from "@/components/ui/Skeleton";
import CareRequestCard from "./CareRequestCard";
import type { Database } from "@/types/database.types";

type CareRequest = Database["public"]["Tables"]["care_requests"]["Row"];

interface CareRequestListProps {
    requests: CareRequest[];
    isLoading: boolean;
    isError?: boolean;
    onRetry?: () => void;
}

export default function CareRequestList({
    requests,
    isLoading,
    isError = false,
    onRetry,
}: CareRequestListProps) {
    if (isLoading && requests.length === 0) {
        return (
            <div className="space-y-4">
                <CareRequestSkeleton />
                <CareRequestSkeleton />
            </div>
        );
    }

    if (isError && requests.length === 0) {
        return (
            <div className="text-center py-8 space-y-3">
                <p className="text-sm text-red-600">요청 목록을 불러오지 못했어요.</p>
                {onRetry && (
                    <button
                        type="button"
                        className="text-sm font-medium text-primary"
                        onClick={onRetry}
                    >
                        다시 시도
                    </button>
                )}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <p className="text-sm text-foreground-muted text-center py-8">
                아직 요청 내역이 없어요.
            </p>
        );
    }

    return (
        <StaggerList className="space-y-4" animateOnMount={false}>
            {requests.map((request) => (
                <StaggerItem key={request.id}>
                    <CareRequestCard request={request} />
                </StaggerItem>
            ))}
        </StaggerList>
    );
}

function CareRequestSkeleton() {
    return (
        <div className="bg-card rounded-3xl border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded-xl" />
            <div className="flex gap-4">
                <Skeleton className="h-4 w-28 rounded-xl" />
                <Skeleton className="h-4 w-16 rounded-xl" />
            </div>
        </div>
    );
}
