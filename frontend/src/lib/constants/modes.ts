// modes.ts — 모드 확장 상수 (모드 설정, 돌봄 유형, 그룹 역할)

import {
    Dog,
    HeartHandshake,
    Users,
    Footprints,
    Home,
    Scissors,
    Stethoscope,
    MoreHorizontal,
    type LucideIcon,
} from "lucide-react";

/** 모드 설정 */
export interface ModeConfig {
    mode: "basic" | "care" | "family";
    label: string;
    description: string;
    icon: LucideIcon;
    requiredLevel: number;
    features: string[];
}

export const MODE_CONFIG: ModeConfig[] = [
    {
        mode: "basic",
        label: "기본 모드",
        description: "매칭, 채팅, 약속 관리",
        icon: Dog,
        requiredLevel: 1,
        features: ["보호자 매칭", "1:1 채팅", "약속 관리", "댕로그"],
    },
    {
        mode: "care",
        label: "돌봄 모드",
        description: "반려견 돌봄 요청/대행",
        icon: HeartHandshake,
        requiredLevel: 2,
        features: ["돌봄 요청", "산책 대행", "돌봄 수락", "케어 기록"],
    },
    {
        mode: "family",
        label: "패밀리 모드",
        description: "그룹 생성, 공동 일정 관리",
        icon: Users,
        requiredLevel: 3,
        features: ["패밀리 그룹", "공동 일정", "멤버 초대", "반려견 공유"],
    },
] as const;

/** 돌봄 유형 */
export const CARE_TYPES = [
    { value: "walk", label: "산책 대행", icon: Footprints },
    { value: "sitting", label: "돌봄", icon: Home },
    { value: "grooming", label: "미용", icon: Scissors },
    { value: "hospital", label: "병원", icon: Stethoscope },
    { value: "other", label: "기타", icon: MoreHorizontal },
] as const;

export type CareType = (typeof CARE_TYPES)[number]["value"];

/** 돌봄 요청 상태 라벨 */
export const CARE_STATUS_CONFIG = {
    pending: { label: "대기 중", color: "text-amber-500 bg-amber-50" },
    accepted: { label: "수락됨", color: "text-green-600 bg-green-50" },
    completed: { label: "완료", color: "text-primary bg-primary-light/20" },
    cancelled: { label: "취소됨", color: "text-foreground-muted bg-muted" },
} as const;

/** 패밀리 그룹 역할 */
export const FAMILY_ROLES = {
    owner: { label: "그룹장", color: "text-amber-500" },
    admin: { label: "관리자", color: "text-primary" },
    member: { label: "멤버", color: "text-foreground-muted" },
} as const;

export type FamilyRole = keyof typeof FAMILY_ROLES;
