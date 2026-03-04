// MatchCard.tsx — Hinge 스타일 매칭 프로필 카드 (DANG-MAT-001)
"use client";

import Image from "next/image";
import { Heart, X, ShieldCheck, MapPin, Zap } from "lucide-react";
import { TapScale, ScrollReveal } from "@/components/ui/MotionWrappers";
import { cn, formatDistance } from "@/lib/utils";
import { getTrustLevelInfo } from "@/lib/constants/reviews";
import type { MatchGuardianProfile } from "./types";

interface MatchCardProps {
    profile: MatchGuardianProfile;
    onLike: (section: string) => void;
    onPass: () => void;
}

export default function MatchCard({ profile, onLike, onPass }: MatchCardProps) {
    const dog = profile.dogs[0];
    const trustLevel = profile.users?.trust_level ?? 1;
    const trustInfo = getTrustLevelInfo(trustLevel);
    const distance = formatDistance(profile.distance_meters);
    const photoSrc = dog?.photo_urls?.[0] || "/placeholder-dog.svg";

    // 매칭 점수 계산 (리뷰 기반 반올림)
    const score = profile.compatibility_score != null ? Math.round(profile.compatibility_score) : null;
    const isHighMatch = score != null && score >= 90;
    const hasTimeOverlap = profile.time_overlap_score != null && profile.time_overlap_score > 0;

    return (
        <div className="relative w-full max-w-md mx-auto pb-24 space-y-6">
            {/* 1. 프로필 헤더 (이름 + 신뢰 뱃지 + 거리) */}
            <div className="flex items-center justify-between px-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-display font-bold text-foreground">
                            {profile.nickname}
                        </h2>
                        {score != null && (
                            <span className={cn(
                                "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold",
                                isHighMatch ? "bg-primary text-white" : "bg-muted text-foreground-muted"
                            )}>
                                <Zap className="w-2.5 h-2.5 fill-current" />
                                {score}% 찰떡궁합
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-primary-light/30 text-primary text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
                            Lv.{trustLevel} {trustInfo.label}
                        </span>
                        {hasTimeOverlap && (
                            <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-md">
                                산책 시간대 비슷!
                            </span>
                        )}
                    </div>
                </div>
                {distance && (
                    <div className="flex items-center gap-1 text-foreground-muted text-sm self-start mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{distance}</span>
                    </div>
                )}
            </div>

            {/* 2. 대형 메인 사진 (SKILL-04 Hinge Style) */}
            <ScrollReveal>
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-muted shadow-sm border border-border">
                    <Image
                        src={photoSrc}
                        alt={dog?.name ?? "강아지"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                        priority
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-3xl font-display font-bold">
                            {dog?.name ?? "이름 없음"}
                        </p>
                        <p className="text-sm opacity-90">
                            {dog?.breed ?? "견종 미정"}
                            {dog?.age != null && ` · ${dog.age}살`}
                            {dog?.weight_kg != null && ` · ${dog.weight_kg}kg`}
                        </p>
                    </div>

                    <TapScale className="absolute bottom-4 right-4 z-10">
                        <button
                            onClick={() => onLike("photo-0")}
                            aria-label="사진 좋아요"
                            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-colors"
                        >
                            <Heart className="w-6 h-6 fill-transparent hover:fill-current" />
                        </button>
                    </TapScale>
                </div>
            </ScrollReveal>

            {/* 3. 강아지 성향 태그 */}
            {dog?.temperament && (Array.isArray(dog.temperament)) && dog.temperament.length > 0 && (
                <ScrollReveal>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {dog.temperament.map((tag, idx) => (
                            <span
                                key={idx}
                                className="flex-shrink-0 bg-primary-light/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </ScrollReveal>
            )}

            {/* 4. 보호자 소개 카드 */}
            <ScrollReveal>
                <div className="relative bg-card p-6 rounded-3xl shadow-sm border border-border mt-2">
                    <p className="text-sm text-foreground-muted mb-2 font-medium">
                        보호자 소개
                    </p>
                    <h3 className="text-xl font-display font-semibold text-foreground pr-12 leading-snug">
                        {profile.bio || "아직 소개가 없어요"}
                    </h3>

                    <TapScale className="absolute -bottom-5 right-4 z-10">
                        <button
                            onClick={() => onLike("bio")}
                            aria-label="소개 좋아요"
                            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"
                        >
                            <Heart className="w-6 h-6" />
                        </button>
                    </TapScale>
                </div>
            </ScrollReveal>

            {/* 전체 패스(X) 버튼 플로팅 */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20">
                <TapScale>
                    <button
                        onClick={onPass}
                        aria-label="넘기기"
                        className="w-14 h-14 bg-white border border-border rounded-full flex items-center justify-center text-foreground-muted shadow-lg hover:bg-muted hover:text-red-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </TapScale>
            </div>
        </div>
    );
}
