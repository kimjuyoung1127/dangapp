// File: Family-style profile completion banner for the /home route.
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TapScale } from "@/components/ui/MotionWrappers";

interface IncompleteProfileBannerProps {
    progress: number;
}

export default function IncompleteProfileBanner({
    progress,
}: IncompleteProfileBannerProps) {
    if (progress >= 50) return null;

    const safeProgress = Math.max(progress, 8);

    return (
        <TapScale>
            <Link href="/profile" className="mb-4 block">
                <div className="rounded-[1.75rem] border border-sky-100 bg-sky-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                프로필을 더 채우면 더 잘 맞는 보호자를 찾을 수 있어요
                            </p>
                            <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                현재 완성도 {progress}%. 신뢰 정보와 일정 선호를 알려 주면 추천 품질이 더 좋아집니다.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-sky-700">
                            {progress}%
                            <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/90">
                        <div
                            className="h-full rounded-full bg-sky-600"
                            style={{ width: `${safeProgress}%` }}
                        />
                    </div>
                </div>
            </Link>
        </TapScale>
    );
}
