"use client";

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Button } from '@/components/ui/Button';

const TEMPERAMENTS = [
    "활발한", "차분한", "에너자이저", "소심한", "친화적인",
    "독립적인", "애교많은", "경계심있는", "식탐많은", "호기심많은"
];

export function Step4DogTemperament() {
    const { data, setData, nextStep } = useOnboardingStore();
    const selectedTags = data.dog_temperament || [];

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setData({ dog_temperament: selectedTags.filter(t => t !== tag) });
        } else {
            if (selectedTags.length < 3) {
                setData({ dog_temperament: [...selectedTags, tag] });
            }
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex-1 space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                        우리아이 성격 태그 (최대 3개)
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {TEMPERAMENTS.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-2 rounded-full border text-sm transition-all ${isSelected
                                            ? 'border-primary bg-primary-light/20 text-primary font-medium'
                                            : 'border-border bg-card text-foreground hover:border-primary/50'
                                        }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={nextStep}
                    disabled={selectedTags.length === 0}
                >
                    다음으로
                </Button>
            </div>
        </div>
    );
}
