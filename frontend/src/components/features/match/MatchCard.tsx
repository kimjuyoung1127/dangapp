"use client";

import Image from "next/image";
import { Heart, X, ShieldCheck, MapPin } from "lucide-react";
import { TapScale, ScrollReveal } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import { getTrustLevelInfo } from "@/lib/constants/reviews";

interface MatchCardProps {
    guardian?: {
        nickname: string;
        trustLevel: number;
        distance: string;
        prompts: { id: string; question: string; answer: string }[];
    } | null;
    dog?: {
        name: string;
        breed: string;
        age: number;
        weight: number;
        photos: string[];
        tags: string[];
    } | null;
    onLikeSection: (sectionId: string) => void;
    onPass: () => void;
}

export default function MatchCard({ guardian, dog, onLikeSection, onPass }: MatchCardProps) {
    // 임시 더미 데이터 대체용 (실제 데이터 연동 전 시각적 확인)
    const dDog = dog || {
        name: "초코", breed: "푸들", age: 3, weight: 5,
        photos: ["/photo/2025040803041_0.jpg"],
        tags: ["활발함", "애교많음", "사람좋아함"]
    };

    const dGuardian = guardian || {
        nickname: "초코언니", trustLevel: 3, distance: "1.2km",
        prompts: [
            { id: "p1", question: "우리 강아지의 가장 귀여운 순간은?", answer: "간식 달라고 꼬리 흔들면서 두 발로 설 때예요 🐾" },
            { id: "p2", question: "주로 산책하는 시간대는?", answer: "퇴근 후 저녁 7시~8시 사이에 한강공원을 자주 갑니다." }
        ]
    };

    return (
        <div className="relative w-full max-w-md mx-auto pb-24 space-y-6">
            {/* 1. 프로필 헤더 (이름 + 신뢰 뱃지 + 거리) */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-display font-bold text-foreground">{dGuardian.nickname}</h2>
                    <span className="inline-flex items-center gap-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Lv.{dGuardian.trustLevel}
                    </span>
                    <span className={cn("text-xs font-medium", getTrustLevelInfo(dGuardian.trustLevel).color)}>
                        {getTrustLevelInfo(dGuardian.trustLevel).label}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-foreground-muted text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{dGuardian.distance}</span>
                </div>
            </div>

            {/* 2. 대형 메인 사진 (SKILL-04 Hinge Style) */}
            <ScrollReveal>
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-muted shadow-sm border border-border">
                    <Image
                        src={dDog.photos[0]}
                        alt={dDog.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                        priority
                    />
                    {/* 하단 그라디언트 오버레이 (텍스트 가독성) */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-3xl font-display font-bold">{dDog.name}</p>
                        <p className="text-sm opacity-90">{dDog.breed} · {dDog.age}살 · {dDog.weight}kg</p>
                    </div>

                    {/* 특정 섹션 콕 찝어 좋아요 버튼 (우측 하단 절대좌표) */}
                    <TapScale className="absolute bottom-4 right-4 z-10">
                        <button
                            onClick={() => onLikeSection(`photo-0`)}
                            aria-label="사진 좋아요"
                            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-colors"
                        >
                            <Heart className="w-6 h-6 fill-transparent hover:fill-current" />
                        </button>
                    </TapScale>
                </div>
            </ScrollReveal>

            {/* 3. 강아지 성향 태그 (가로 스크롤) */}
            <ScrollReveal>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {dDog.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="flex-shrink-0 bg-primary-light/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                            {tag}
                        </span>
                    ))}
                </div>
            </ScrollReveal>

            {/* 4. 프롬프트 카드 1 */}
            <ScrollReveal>
                <div className="relative bg-card p-6 rounded-3xl shadow-sm border border-border mt-2">
                    <p className="text-sm text-foreground-muted mb-2 font-medium">{dGuardian.prompts[0].question}</p>
                    <h3 className="text-xl font-display font-semibold text-foreground pr-12 leading-snug">
                        {dGuardian.prompts[0].answer}
                    </h3>

                    <TapScale className="absolute -bottom-5 right-4 z-10">
                        <button
                            onClick={() => onLikeSection(`prompt-0`)}
                            aria-label="답변 좋아요"
                            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"
                        >
                            <Heart className="w-6 h-6" />
                        </button>
                    </TapScale>
                </div>
            </ScrollReveal>

            {/* 5. 대형 사진 혹은 두번째 프롬프트 (반복 형태) */}
            <ScrollReveal>
                <div className="relative bg-card p-6 rounded-3xl shadow-sm border border-border mt-8">
                    <p className="text-sm text-foreground-muted mb-2 font-medium">{dGuardian.prompts[1].question}</p>
                    <h3 className="text-xl font-display font-semibold text-foreground pr-12 leading-snug">
                        {dGuardian.prompts[1].answer}
                    </h3>

                    <TapScale className="absolute -bottom-5 right-4 z-10">
                        <button
                            onClick={() => onLikeSection(`prompt-1`)}
                            aria-label="답변 좋아요"
                            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"
                        >
                            <Heart className="w-6 h-6" />
                        </button>
                    </TapScale>
                </div>
            </ScrollReveal>

            {/* 전체 패스(X) 버튼 플로팅 - 화면 가장 아래에 떠있음 */}
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
