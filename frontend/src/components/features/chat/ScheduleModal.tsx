// File: Schedule proposal modal with async submit and inline error handling.
import { useEffect, useState } from "react";
import { BottomSheet, TapScale } from "@/components/ui/MotionWrappers";
import { Calendar as CalendarIcon, MapPin, X } from "lucide-react";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPropose: (scheduleData: { date: string; time: string; location: string }) => Promise<void>;
    isSubmitting?: boolean;
}

export function ScheduleModal({ isOpen, onClose, onPropose, isSubmitting = false }: ScheduleModalProps) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setErrorMessage("");
        }
    }, [isOpen]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!date || !time || !location || isSubmitting) return;

        setErrorMessage("");

        try {
            await onPropose({ date, time, location });
            onClose();
            setDate("");
            setTime("");
            setLocation("");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "약속 제안 저장 중 오류가 발생했습니다.";
            setErrorMessage(message);
            console.error("[chat/schedule-modal] propose failed", error);
        }
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <div className="p-5">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold font-display text-foreground">약속 제안하기</h2>
                    <button
                        onClick={onClose}
                        aria-label="닫기"
                        className="-mr-2 rounded-full p-2 text-foreground-muted transition-colors hover:bg-muted"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground-muted">
                            <CalendarIcon className="h-4 w-4" /> 날짜 및 시간
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            />
                            <input
                                type="time"
                                value={time}
                                onChange={(event) => setTime(event.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground-muted">
                            <MapPin className="h-4 w-4" /> 장소
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                            placeholder="예: 서울숲 3번 출입구"
                            className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                        />
                    </div>

                    <div className="pt-4">
                        {errorMessage ? <p className="mb-2 text-xs text-red-600">{errorMessage}</p> : null}
                        <TapScale>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-xl bg-primary py-3.5 font-medium text-white disabled:opacity-60"
                            >
                                {isSubmitting ? "저장 중..." : "약속 제안 보내기"}
                            </button>
                        </TapScale>
                    </div>
                </form>
            </div>
        </BottomSheet>
    );
}
