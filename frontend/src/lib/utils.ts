import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** 거리(meters)를 읽기 좋은 문자열로 변환 */
export function formatDistance(meters?: number): string {
    if (meters === undefined || meters === null) return "";
    if (meters === 0) return "내 주변";
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
}
