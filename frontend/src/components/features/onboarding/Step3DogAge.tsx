"use client";

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Button } from '@/components/ui/Button';

export function Step3DogAge() {
    const { data, setData, nextStep } = useOnboardingStore();

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex-1 space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">강아지는 몇 살인가요?</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "10+"].map((age) => (
                            <button
                                key={age}
                                onClick={() => setData({ dog_age: typeof age === 'number' ? age : 11 })}
                                className={`h-14 rounded-xl border text-lg font-medium transition-all ${(data.dog_age === age || (age === "10+" && data.dog_age === 11))
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-border bg-card text-foreground hover:border-primary/50'
                                    }`}
                            >
                                {age}살
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={nextStep}
                    disabled={!data.dog_age}
                >
                    다음으로
                </Button>
            </div>
        </div>
    );
}
