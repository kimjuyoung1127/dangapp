// reviews.ts — 후기/신뢰 시스템 상수 (태그, 레벨, 뱃지 설정)

import {
    ShieldCheck,
    Footprints,
    Star,
    HeartHandshake,
    type LucideIcon,
} from "lucide-react";

/** 후기 태그 목록 */
export const REVIEW_TAGS = [
    { id: "kind", label: "친절해요" },
    { id: "manner", label: "매너 좋아요" },
    { id: "punctual", label: "시간 잘 지켜요" },
    { id: "dog_care", label: "강아지 관리 잘해요" },
    { id: "fun", label: "재미있어요" },
    { id: "safe", label: "안전해요" },
    { id: "again", label: "다시 만나고 싶어요" },
    { id: "recommend", label: "추천해요" },
] as const;

export type ReviewTagId = (typeof REVIEW_TAGS)[number]["id"];

/** 신뢰 레벨 1~5 설정 */
export const TRUST_LEVEL_CONFIG = [
    { level: 1, label: "새싹", minScore: 0, color: "text-foreground-muted" },
    { level: 2, label: "성장 중", minScore: 20, color: "text-green-500" },
    { level: 3, label: "신뢰 가능", minScore: 40, color: "text-blue-500" },
    { level: 4, label: "우수", minScore: 60, color: "text-purple-500" },
    { level: 5, label: "최우수", minScore: 80, color: "text-amber-500" },
] as const;

/** 뱃지 설정 */
export interface BadgeConfig {
    type: "verified" | "active_walker" | "top_reviewer" | "care_angel";
    label: string;
    description: string;
    icon: LucideIcon;
}

export const BADGE_CONFIG: BadgeConfig[] = [
    {
        type: "verified",
        label: "인증됨",
        description: "프로필 완성 (온보딩 완료)",
        icon: ShieldCheck,
    },
    {
        type: "active_walker",
        label: "산책왕",
        description: "완료 약속 10회 이상",
        icon: Footprints,
    },
    {
        type: "top_reviewer",
        label: "리뷰어",
        description: "후기 작성 10회 이상",
        icon: Star,
    },
    {
        type: "care_angel",
        label: "케어 천사",
        description: "돌봄 모드 5회 이상",
        icon: HeartHandshake,
    },
];

/** 레벨 번호 → 레벨 정보 조회 */
export function getTrustLevelInfo(level: number) {
    return (
        TRUST_LEVEL_CONFIG.find((c) => c.level === level) ??
        TRUST_LEVEL_CONFIG[0]
    );
}

/** 점수 → 레벨 계산 */
export function calcTrustLevel(score: number): number {
    for (let i = TRUST_LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (score >= TRUST_LEVEL_CONFIG[i].minScore) {
            return TRUST_LEVEL_CONFIG[i].level;
        }
    }
    return 1;
}
