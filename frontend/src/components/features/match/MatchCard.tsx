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
    readOnlyLabel?: string | null;
}

export default function MatchCard({
    profile,
    onLike,
    onPass,
    readOnlyLabel = null,
}: MatchCardProps) {
    const dog = profile.dogs[0];
    const trustLevel = profile.users?.trust_level ?? 1;
    const trustInfo = getTrustLevelInfo(trustLevel);
    const trustScore = profile.users?.trust_score ?? null;
    const distance = formatDistance(profile.distance_meters);
    const photoSrc = dog?.photo_urls?.[0] || "/placeholder-dog.svg";
    const score = profile.compatibility_score != null ? Math.round(profile.compatibility_score) : null;
    const hasTimeOverlap = profile.time_overlap_score != null && profile.time_overlap_score > 0;
    const breedLabel = dog?.breed ? mapBreedLabel(dog.breed) : null;
    const temperamentLabels = Array.isArray(dog?.temperament)
        ? dog.temperament.map((tag) => mapTemperamentLabel(String(tag)))
        : [];

    const matchReasons = [
        score != null ? `생활 리듬과 선호가 잘 맞아 매칭 점수 ${score}%로 추천드려요.` : null,
        distance ? `${distance} 거리라 첫 만남 일정을 비교적 편하게 잡을 수 있어요.` : null,
        hasTimeOverlap
            ? "활동 시간이 겹쳐서 관심을 보낸 뒤 바로 일정 제안으로 이어가기 좋아요."
            : "먼저 관심을 보내고, 답장이 오면 서로 가능한 시간을 맞춰 보세요.",
    ].filter(Boolean) as string[];

    const safetySignals = [
        profile.verified_region ? "활동 지역 인증" : null,
        `프로필 완성도 ${profile.onboarding_progress}%`,
        trustInfo.label,
        dog ? `${dog.name} 프로필 작성 완료` : null,
    ].filter(Boolean) as string[];

    const scheduleHint = hasTimeOverlap
        ? "지금 관심을 보내면 다음 단계로 자연스럽게 산책 일정을 제안할 수 있어요."
        : "먼저 관심을 보내고, 채팅에서 서로 가능한 시간을 조율해 보세요.";

    return (
        <div className="relative mx-auto w-full max-w-md pb-10">
            <ScrollReveal>
                <div className="space-y-5 overflow-hidden rounded-[2.1rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,252,255,0.92)_100%)] p-4 shadow-[0_24px_64px_-34px_rgba(17,49,85,0.28)]">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
                                추천 산책 상대
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <h2 className="text-[30px] font-display font-bold tracking-[-0.04em] text-foreground">
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
                                    <span className="rounded-full border border-sky-200/70 bg-white px-2.5 py-1 text-xs font-medium text-sky-700 shadow-[0_10px_24px_-22px_rgba(17,49,85,0.24)]">
                                        일정 맞추기 쉬움
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        {score != null ? <MatchScoreCard score={score} /> : null}
                    </div>

                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-sky-100 bg-sky-50">
                        <Image
                            src={photoSrc}
                            alt={dog?.name ?? "반려견 프로필"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 420px"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                            <p className="text-3xl font-display font-bold">{dog?.name ?? "이름 미등록"}</p>
                            <p className="mt-1 text-sm opacity-95">
                                {breedLabel ?? "품종 정보 준비 중"}
                                {dog?.age != null ? ` · ${dog.age}살` : ""}
                                {dog?.weight_kg != null ? ` · ${dog.weight_kg}kg` : ""}
                            </p>
                        </div>
                    </div>

                    {temperamentLabels.length ? (
                        <div className="flex flex-wrap gap-2">
                            {temperamentLabels.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-white/80 bg-white/84 px-3 py-1.5 text-sm font-medium text-sky-700 shadow-[0_10px_24px_-22px_rgba(17,49,85,0.22)]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    <InfoPanel title="추천 이유" className="border border-white/80 bg-white/90">
                        <ul className="space-y-2 text-sm leading-6 text-foreground">
                            {matchReasons.map((reason) => (
                                <li key={reason} className="flex items-start gap-2">
                                    <Sparkles className="mt-1 h-4 w-4 shrink-0 text-sky-600" />
                                    <span>{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </InfoPanel>

                    <InfoPanel title="신뢰 정보와 다음 단계" className="border border-sky-200/50 bg-[linear-gradient(180deg,rgba(238,247,255,0.92)_0%,rgba(229,242,255,0.88)_100%)]">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-foreground-muted">신뢰 점수</span>
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
                            <div className="rounded-[1.4rem] border border-white/80 bg-white/88 p-3.5 text-sm leading-6 text-foreground shadow-[0_12px_26px_-22px_rgba(17,49,85,0.24)]">
                                <div className="mb-1 flex items-center gap-2 font-semibold text-sky-700">
                                    <CalendarClock className="h-4 w-4" />
                                    일정 제안 힌트
                                </div>
                                <p>{scheduleHint}</p>
                            </div>
                        </div>
                    </InfoPanel>

                    <InfoPanel title="보호자 한마디" className="border border-white/80 bg-white/90">
                        <p className="text-base leading-7 text-foreground">
                            {profile.bio || "아직 소개글이 없어요. 먼저 관심을 보내고 채팅에서 대화를 이어가 보세요."}
                        </p>
                    </InfoPanel>

                    <div className="space-y-3">
                        {readOnlyLabel ? (
                            <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/90 px-3 py-2.5 text-sm font-medium text-amber-800">
                                {readOnlyLabel}
                            </div>
                        ) : null}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                className="border border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
                                onClick={onPass}
                                disabled={!!readOnlyLabel}
                            >
                                <X className="mr-1.5 h-4 w-4" />
                                넘기기
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                className="bg-sky-600 text-white hover:bg-sky-700"
                                onClick={() => onLike(hasTimeOverlap ? "schedule" : "family-primary")}
                                disabled={!!readOnlyLabel}
                            >
                                <Heart className="mr-1.5 h-4 w-4" />
                                관심 보내기
                            </Button>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    );
}

function TrustBadge({ trustLevel, trustLabel }: { trustLevel: number; trustLabel: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_12px_24px_-18px_rgba(22,119,216,0.72)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Lv.{trustLevel} {trustLabel}
        </span>
    );
}

function MatchScoreCard({ score }: { score: number }) {
    return (
        <div className="shrink-0 rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(240,248,255,1)_0%,rgba(221,238,252,0.94)_100%)] px-4 py-3 text-right text-sky-700 shadow-[0_16px_34px_-22px_rgba(17,49,85,0.24)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">매칭</p>
            <div className="mt-1 flex items-center justify-end gap-1">
                <Zap className="h-4 w-4 fill-current" />
                <p className="text-2xl font-bold">{score}%</p>
            </div>
        </div>
    );
}

function mapBreedLabel(breed: string) {
    const normalized = breed.trim().toLowerCase();
    const breedLabels: Record<string, string> = {
        poodle: "푸들",
        corgi: "웰시코기",
        maltese: "말티즈",
        "bichon frise": "비숑 프리제",
        shiba: "시바견",
    };
    return breedLabels[normalized] ?? breed;
}

function mapTemperamentLabel(tag: string) {
    const normalized = tag.trim().toLowerCase();
    const temperamentLabels: Record<string, string> = {
        gentle: "온순함",
        playful: "장난기 많음",
        steady: "차분함",
        friendly: "친화적",
        bright: "활발함",
        social: "사교적",
        clean: "깔끔함",
        affectionate: "애교 많음",
        alert: "경계심 있음",
        independent: "독립적",
    };
    return temperamentLabels[normalized] ?? tag;
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
        <div className={cn("rounded-[1.55rem] p-4", className)}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground-muted">
                {title}
            </p>
            <div className="mt-3">{children}</div>
        </div>
    );
}
