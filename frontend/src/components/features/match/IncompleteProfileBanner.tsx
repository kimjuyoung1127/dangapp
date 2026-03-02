// IncompleteProfileBanner.tsx — 프로필 완성 유도 배너 (DANG-MAT-001)
"use client";

import Link from "next/link";
import { TapScale } from "@/components/ui/MotionWrappers";

interface IncompleteProfileBannerProps {
    progress: number;
}

export default function IncompleteProfileBanner({
    progress,
}: IncompleteProfileBannerProps) {
    if (progress >= 50) return null;

    return (
        <TapScale>
            <Link href="/profile">
                <div className="bg-primary-light/10 rounded-3xl p-4 mb-4">
                    <p className="text-sm font-medium text-foreground">
                        프로필을 완성하면 더 정확한 매칭을 받을 수 있어요!
                    </p>
                    <p className="text-xs text-foreground-muted mt-1">
                        현재 완성도: {progress}% · 탭하여 프로필 편집
                    </p>
                </div>
            </Link>
        </TapScale>
    );
}
