// Step4DogTemperament.tsx — 강아지 성격 태그 선택 (전체 선택, max 3) (DANG-ONB-001)

"use client";

import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";

const TEMPERAMENTS = [
    "활발한", "차분한", "에너자이저", "소심한", "친화적인",
    "독립적인", "애교많은", "경계심있는", "식탐많은", "호기심많은",
];

export function Step4DogTemperament() {
    const { data, setData, nextStep } = useOnboardingStore();
    const selectedTags = data.dog_temperament || [];

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setData({ dog_temperament: selectedTags.filter((t) => t !== tag) });
        } else if (selectedTags.length < 3) {
            setData({ dog_temperament: [...selectedTags, tag] });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                        우리아이 성격 태그 (최대 3개) <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {TEMPERAMENTS.map((tag) => (
                            <ToggleChip
                                key={tag}
                                selected={selectedTags.includes(tag)}
                                onClick={() => toggleTag(tag)}
                            >
                                {tag}
                            </ToggleChip>
                        ))}
                    </div>
                    {selectedTags.length > 0 && (
                        <p className="text-xs text-foreground-muted">
                            {selectedTags.length}/3 선택됨
                        </p>
                    )}
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
