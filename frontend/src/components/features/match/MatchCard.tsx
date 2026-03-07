// File: Family-oriented live match card for the /home route.
"use client";

import Image from "next/image";
import { CalendarClock, Heart, MapPin, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
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
    const trustScore = profile.users?.trust_score ?? null;
    const distance = formatDistance(profile.distance_meters);
    const photoSrc = dog?.photo_urls?.[0] || "/placeholder-dog.svg";
    const score = profile.compatibility_score != null ? Math.round(profile.compatibility_score) : null;
    const hasTimeOverlap = profile.time_overlap_score != null && profile.time_overlap_score > 0;

    const matchReasons = [
        score != null ? `매칭 점수 ${score}%로 기준을 넘겼어요.` : null,
        distance ? `${distance} 안에서 연결할 수 있어요.` : null,
        hasTimeOverlap ? "주요 산책 시간대가 겹쳐 일정 제안이 쉬워요." : "프로필을 먼저 살펴보고 천천히 인사하기 좋아요.",
    ].filter(Boolean) as string[];

    const safetySignals = [
        profile.verified_region ? "지역 인증" : null,
        `프로필 ${profile.onboarding_progress}%`,
        trustInfo.label,
        dog ? `${dog.name} 정보 등록` : null,
    ].filter(Boolean) as string[];

    const scheduleHint = hasTimeOverlap
        ? "관심을 보내면 일정 제안까지 자연스럽게 이어질 가능성이 높아요."
        : "먼저 관심을 보내고, 대화가 열리면 다음 산책 시간을 조율해 보세요.";

    return (
        <div className="relative mx-auto w-full max-w-md pb-10">
            <ScrollReveal>
                <div className="space-y-5 rounded-[2rem] border border-sky-100 bg-white p-4 shadow-[0_20px_60px_-28px_rgba(14,165,233,0.28)]">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                                family organizer match
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <h2 className="text-[28px] font-display font-bold text-foreground">
                                    {profile.nickname}
                                </h2>
                                <TrustBadge trustLevel={trustLevel} trustLabel={trustInfo.label} />
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground-muted">
                                {distance ? (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {distance}
                                    </span>
                                ) : null}
                                {hasTimeOverlap ? (
                                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                                        일정 겹침 높음
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        {score != null ? <MatchScoreCard score={score} /> : null}
                    </div>

                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-sky-100 bg-sky-50">
                        <Image
                            src={photoSrc}
                            alt={dog?.name ?? "강아지 프로필"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 420px"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                            <p className="text-3xl font-display font-bold">{dog?.name ?? "이름 미등록"}</p>
                            <p className="mt-1 text-sm opacity-95">
                                {dog?.breed ?? "견종 미기재"}
                                {dog?.age != null ? ` · ${dog.age}살` : ""}
                                {dog?.weight_kg != null ? ` · ${dog.weight_kg}kg` : ""}
                            </p>
                        </div>
                    </div>

                    {dog?.temperament?.length ? (
                        <div className="flex flex-wrap gap-2">
                            {dog.temperament.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    <InfoPanel title="잘 맞는 이유" className="border border-sky-100 bg-white">
                        <ul className="space-y-2 text-sm leading-6 text-foreground">
                            {matchReasons.map((reason) => (
                                <li key={reason} className="flex items-start gap-2">
                                    <Sparkles className="mt-1 h-4 w-4 shrink-0 text-sky-600" />
                                    <span>{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </InfoPanel>

                    <InfoPanel title="안심 체크와 다음 액션" className="border border-sky-200 bg-sky-50">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-foreground-muted">Trust score</span>
                                <span className="text-lg font-bold text-foreground">
                                    {trustScore != null ? trustScore : "-"}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {safetySignals.map((signal) => (
                                    <span
                                        key={signal}
                                        className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-foreground"
                                    >
                                        {signal}
                                    </span>
                                ))}
                            </div>
                            <div className="rounded-2xl bg-white/90 p-3 text-sm leading-6 text-foreground">
                                <div className="mb-1 flex items-center gap-2 font-semibold text-sky-700">
                                    <CalendarClock className="h-4 w-4" />
                                    일정 힌트
                                </div>
                                <p>{scheduleHint}</p>
                            </div>
                        </div>
                    </InfoPanel>

                    <InfoPanel title="보호자 소개" className="border border-sky-100 bg-white">
                        <p className="text-base leading-7 text-foreground">
                            {profile.bio || "아직 소개가 없어요. 관심을 보내고 대화를 열어 보세요."}
                        </p>
                    </InfoPanel>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="border border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
                            onClick={onPass}
                        >
                            <X className="mr-1.5 h-4 w-4" />
                            패스
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            className="bg-sky-600 text-white hover:bg-sky-700"
                            onClick={() => onLike(hasTimeOverlap ? "schedule" : "family-primary")}
                        >
                            <Heart className="mr-1.5 h-4 w-4" />
                            관심 보내기
                        </Button>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    );
}

function TrustBadge({ trustLevel, trustLabel }: { trustLevel: number; trustLabel: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white">
            <ShieldCheck className="h-3.5 w-3.5" />
            Lv.{trustLevel} {trustLabel}
        </span>
    );
}

function MatchScoreCard({ score }: { score: number }) {
    return (
        <div className="shrink-0 rounded-3xl bg-sky-100 px-4 py-3 text-right text-sky-700">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">match</p>
            <div className="mt-1 flex items-center justify-end gap-1">
                <Zap className="h-4 w-4 fill-current" />
                <p className="text-2xl font-bold">{score}%</p>
            </div>
        </div>
    );
}

function InfoPanel({
    title,
    className,
    children,
}: {
    title: string;
    className: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("rounded-[1.5rem] p-4", className)}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                {title}
            </p>
            <div className="mt-3">{children}</div>
        </div>
    );
}
