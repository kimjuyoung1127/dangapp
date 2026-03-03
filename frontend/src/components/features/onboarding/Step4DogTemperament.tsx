// Step4DogTemperament.tsx — 강아지 성격 태그 및 지표 선택 (DANG-ONB-001)

"use client";

import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";

const TEMPERAMENTS = [
    "활발한", "차분한", "에너자이저", "소심한", "친화적인",
    "독립적인", "애교많은", "경계심있는", "식탐많은", "호기심많은",
];

const PROFILE_METRICS: Array<{ id: "energy" | "sociability" | "playfulness"; label: string }> = [
    { id: "energy", label: "에너지 레벨" },
    { id: "sociability", label: "사회성" },
    { id: "playfulness", label: "장난기" },
];

const SCALES: Array<{ id: "low" | "mid" | "high"; label: string }> = [
    { id: "low", label: "낮음" },
    { id: "mid", label: "보통" },
    { id: "high", label: "높음" },
];

export function Step4DogTemperament() {
    const { data, setData, nextStep } = useOnboardingStore();
    const selectedTags = data.dog_temperament || [];
    const profile = data.dog_temperament_profile || {};

    const toggleTag = (tag: string) => {
        const next = selectedTags.includes(tag)
            ? selectedTags.filter((t) => t !== tag)
            : selectedTags.length < 3 ? [...selectedTags, tag] : selectedTags;
        setData({ dog_temperament: next });
    };

    const updateProfile = (metric: "energy" | "sociability" | "playfulness", value: "low" | "mid" | "high") => {
        setData({
            dog_temperament_profile: { ...profile, [metric]: value }
        });
    };


    return (
        <div className="flex flex-col h-full overflow-y-auto pb-10 scrollbar-hide">
            <div className="flex-1 space-y-10">
                {/* 성격 태그 섹션 */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-base font-semibold text-foreground">
                            우리아이 성격 태그
                        </label>
                        <p className="text-sm text-foreground-muted">최대 3개까지 선택할 수 있어요.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {TEMPERAMENTS.map((tag) => (
                            <ToggleChip
                                key={tag}
                                selected={selectedTags.includes(tag)}
                                onClick={() => toggleTag(tag)}
                                className="px-5 h-11 text-base"
                            >
                                {tag}
                            </ToggleChip>
                        ))}
                    </div>
                </div>

                {/* 성격 지표 섹션 (Profile Metrics) */}
                <div className="space-y-8">
                    <div className="space-y-1">
                        <label className="text-base font-semibold text-foreground">
                            성격 지표 상세
                        </label>
                        <p className="text-sm text-foreground-muted">우리아이의 성향을 더 자세히 알려주세요.</p>
                    </div>
                    
                    <div className="space-y-6">
                        {PROFILE_METRICS.map((metric) => (
                            <div key={metric.id} className="space-y-3">
                                <span className="text-sm font-medium text-foreground-muted">{metric.label}</span>
                                <div className="flex gap-2 h-12">
                                    {SCALES.map((scale) => (
                                        <ToggleChip
                                            key={scale.id}
                                            className="flex-1 justify-center text-sm"
                                            selected={profile[metric.id] === scale.id}
                                            onClick={() => updateProfile(metric.id, scale.id)}
                                        >
                                            {scale.label}
                                        </ToggleChip>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <Button size="lg" className="w-full" onClick={nextStep}>
                    다음으로
                </Button>
            </div>
        </div>
    );
}

