// Step7ActivityTimes.tsx — 활동 시간 + 최종 제출 (전체 선택, Supabase 영속화) (DANG-ONB-001)

"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { useCompleteOnboarding } from "@/lib/hooks/useOnboarding";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";

const TIME_SLOTS: Array<{ id: "morning" | "afternoon" | "evening"; label: string }> = [
    { id: "morning", label: "아침 (06:00~09:00)" },
    { id: "afternoon", label: "낮 (12:00~15:00)" },
    { id: "evening", label: "저녁 (18:00~21:00)" },
];

export function Step7ActivityTimes() {
    const router = useRouter();
    const { data, setData, completionScore, isSubmitting, submitError, setSubmitting, setSubmitError, photoFile } =
        useOnboardingStore();
    const completeMutation = useCompleteOnboarding();

    const weekdayTimes = data.weekday_activity_times || [];
    const weekendTimes = data.weekend_activity_times || [];

    const toggleWeekday = (id: "morning" | "afternoon" | "evening") => {
        const next = weekdayTimes.includes(id)
            ? weekdayTimes.filter((t) => t !== id)
            : [...weekdayTimes, id];
        setData({ weekday_activity_times: next });
    };

    const toggleWeekend = (id: "morning" | "afternoon" | "evening") => {
        const next = weekendTimes.includes(id)
            ? weekendTimes.filter((t) => t !== id)
            : [...weekendTimes, id];
        setData({ weekend_activity_times: next });
    };

    const handleComplete = async () => {
        setSubmitting(true);
        setSubmitError(null);

        try {
            await completeMutation.mutateAsync({ data, photoFile });
            router.push("/home");
        } catch (err) {
            const message = err instanceof Error ? err.message : "저장에 실패했습니다. 다시 시도해주세요.";
            setSubmitError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                        활동 시간 선택 <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>

                    <div className="rounded-2xl border border-border p-4 space-y-3">
                        <p className="text-sm font-medium text-foreground">평일</p>
                        {TIME_SLOTS.map((slot) => (
                            <ToggleChip
                                key={`weekday-${slot.id}`}
                                size="lg"
                                fullWidth
                                selected={weekdayTimes.includes(slot.id)}
                                onClick={() => toggleWeekday(slot.id)}
                                className="justify-between text-left"
                            >
                                <span>{slot.label}</span>
                                {weekdayTimes.includes(slot.id) && (
                                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                                        ✓
                                    </span>
                                )}
                            </ToggleChip>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-border p-4 space-y-3">
                        <p className="text-sm font-medium text-foreground">주말</p>
                        {TIME_SLOTS.map((slot) => (
                            <ToggleChip
                                key={`weekend-${slot.id}`}
                                size="lg"
                                fullWidth
                                selected={weekendTimes.includes(slot.id)}
                                onClick={() => toggleWeekend(slot.id)}
                                className="justify-between text-left"
                            >
                                <span>{slot.label}</span>
                                {weekendTimes.includes(slot.id) && (
                                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                                        ✓
                                    </span>
                                )}
                            </ToggleChip>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <p className="text-xs text-foreground-muted mb-3 text-center">
                    온보딩 완성도: {completionScore()}%
                </p>

                {submitError && (
                    <p className="text-sm text-red-500 text-center mb-3">{submitError}</p>
                )}

                <Button
                    size="lg"
                    className="w-full"
                    onClick={handleComplete}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "저장 중..." : "가입 완료하고 시작하기!"}
                </Button>
            </div>
        </div>
    );
}
