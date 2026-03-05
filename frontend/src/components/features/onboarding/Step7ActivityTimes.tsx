// Step7ActivityTimes.tsx — 활동 시간 + 최종 제출 (DANG-ONB-001)

"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";

const TIME_SLOTS: Array<{ id: "morning" | "afternoon" | "evening"; label: string; icon: string }> = [
    { id: "morning", label: "오전", icon: "🌅" },
    { id: "afternoon", label: "오후", icon: "☀️" },
    { id: "evening", label: "저녁", icon: "🌙" },
];

export function Step7ActivityTimes() {
    const router = useRouter();
    const { data, setData, completionScore, isSubmitting, submitError, submitOnboarding } =
        useOnboardingStore();

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
        try {
            await submitOnboarding();
            router.push("/home");
        } catch (err) {
            // 에러는 스토어의 submitError에 저장되므로 여기서는 별도 처리가 필요 없을 수 있음
            console.error("Onboarding submission failed:", err);
        }
    };


    return (
        <div className="flex flex-col h-full overflow-y-auto pb-10 scrollbar-hide">
            <div className="flex-1 space-y-10">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">활동 시간을 알려주세요</h2>
                    <p className="text-sm text-foreground-muted">맞춤형 매칭을 위해 활동 가능한 시간을 선택해주세요.</p>
                </div>

                <div className="space-y-8">
                    {/* 평일 섹션 */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-foreground">평일 활동 시간</span>
                            <span className="text-xs text-foreground-muted">(다중 선택 가능)</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {TIME_SLOTS.map((slot) => (
                                <ToggleChip
                                    key={`weekday-${slot.id}`}
                                    className="h-20 flex flex-col justify-center items-center gap-1 border-2"
                                    selected={weekdayTimes.includes(slot.id)}
                                    onClick={() => toggleWeekday(slot.id)}
                                >
                                    <span className="text-xl">{slot.icon}</span>
                                    <span className="text-sm font-medium">{slot.label}</span>
                                </ToggleChip>
                            ))}
                        </div>
                    </div>

                    {/* 주말 섹션 */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-foreground">주말 활동 시간</span>
                            <span className="text-xs text-foreground-muted">(다중 선택 가능)</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {TIME_SLOTS.map((slot) => (
                                <ToggleChip
                                    key={`weekend-${slot.id}`}
                                    className="h-20 flex flex-col justify-center items-center gap-1 border-2"
                                    selected={weekendTimes.includes(slot.id)}
                                    onClick={() => toggleWeekend(slot.id)}
                                >
                                    <span className="text-xl">{slot.icon}</span>
                                    <span className="text-sm font-medium">{slot.label}</span>
                                </ToggleChip>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 space-y-4">
                <div className="flex flex-col items-center gap-1">
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${completionScore()}%` }} 
                        />
                    </div>
                    <p className="text-xs text-foreground-muted">
                        온보딩 완성도 {completionScore()}%
                    </p>
                </div>

                {submitError && (
                    <p className="text-sm text-red-500 text-center">{submitError}</p>
                )}

                <Button
                    size="lg"
                    className="w-full h-14 text-lg font-bold"
                    onClick={handleComplete}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "가입 정보 전송 중..." : "가입 완료하고 시작하기"}
                </Button>
            </div>
        </div>
    );
}

