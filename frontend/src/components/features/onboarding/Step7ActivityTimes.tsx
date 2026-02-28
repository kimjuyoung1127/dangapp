"use client";

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Button } from '@/components/ui/Button';

const TIME_SLOTS = [
    { id: "morning", label: "아침 (06:00~09:00)" },
    { id: "afternoon", label: "낮 (12:00~15:00)" },
    { id: "evening", label: "저녁 (18:00~21:00)" },
    { id: "night", label: "밤 (21:00~00:00)" },
    { id: "weekend", label: "주말 위주" },
];

export function Step7ActivityTimes() {
    const { data, setData } = useOnboardingStore();
    const selectedTimes = data.activity_times || [];

    const toggleTime = (id: string) => {
        if (selectedTimes.includes(id)) {
            setData({ activity_times: selectedTimes.filter(t => t !== id) });
        } else {
            setData({ activity_times: [...selectedTimes, id] });
        }
    };

    const handleComplete = async () => {
        // Trigger API call to save all user profile
        console.log("FINAL DATA TO SAVE:", data);
        // Redirect will be handled on page level or router push but for now mock it:
        window.location.href = "/home";
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex-1 space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                        주로 언제 산책하시나요? (다중 선택 가능)
                    </label>
                    <div className="flex flex-col gap-3">
                        {TIME_SLOTS.map((slot) => {
                            const isSelected = selectedTimes.includes(slot.id);
                            return (
                                <button
                                    key={slot.id}
                                    onClick={() => toggleTime(slot.id)}
                                    className={`w-full text-left px-5 h-14 rounded-xl border text-base font-medium transition-all flex items-center justify-between ${isSelected
                                            ? 'border-primary bg-primary-light/10 text-primary'
                                            : 'border-border bg-card text-foreground hover:border-primary/50'
                                        }`}
                                >
                                    {slot.label}
                                    {isSelected && (
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">✓</div>
                                    )}
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
                    onClick={handleComplete}
                    disabled={selectedTimes.length === 0}
                >
                    가입 완료하고 시작하기!
                </Button>
            </div>
        </div>
    );
}
