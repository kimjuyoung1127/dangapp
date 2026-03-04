// Step3DogAge.tsx — 강아지 나이 선택 (전체 선택, 스킵 가능) (DANG-ONB-001)

"use client";

import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";

const AGES: Array<{ value: number; label: string }> = [
    { value: 1, label: "1살" },
    { value: 2, label: "2살" },
    { value: 3, label: "3살" },
    { value: 4, label: "4살" },
    { value: 5, label: "5살" },
    { value: 6, label: "6살" },
    { value: 7, label: "7살" },
    { value: 8, label: "8살" },
    { value: 9, label: "9살" },
    { value: 10, label: "10살" },
    { value: 11, label: "10+살" },
];

export function Step3DogAge() {
    const { data, setData, nextStep } = useOnboardingStore();

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                        강아지는 몇 살인가요? <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {AGES.map((age) => (
                            <ToggleChip
                                key={age.value}
                                size="lg"
                                fullWidth
                                selected={data.dog_age === age.value}
                                onClick={() => setData({ dog_age: age.value })}
                            >
                                {age.label}
                            </ToggleChip>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-8 space-y-3">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={nextStep}
                >
                    다음으로
                </Button>
                <button
                    type="button"
                    onClick={nextStep}
                    className="w-full text-sm text-foreground-muted hover:text-foreground transition-colors py-2"
                >
                    건너뛰기
                </button>
            </div>
        </div>
    );
}
