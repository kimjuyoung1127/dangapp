import { useState } from "react";
import { BottomSheet, TapScale } from "@/components/ui/MotionWrappers";
import { Calendar as CalendarIcon, MapPin, X } from "lucide-react";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPropose: (scheduleData: { date: string; time: string; location: string }) => void;
}

export function ScheduleModal({ isOpen, onClose, onPropose }: ScheduleModalProps) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time || !location) return;

        // TODO: Send structured schedule data
        onPropose({ date, time, location });
        onClose();
        setDate("");
        setTime("");
        setLocation("");
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <div className="p-5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-display text-foreground">약속 제안하기</h2>
                    <button
                        onClick={onClose}
                        aria-label="닫기"
                        className="p-2 -mr-2 text-foreground-muted hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground-muted flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4" /> 날짜 및 시간
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground-muted flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> 장소
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="예: 한강공원 프리스비 존"
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <TapScale>
                            <button
                                type="submit"
                                className="w-full bg-primary text-white font-medium rounded-xl py-3.5"
                            >
                                약속 제안 보내기
                            </button>
                        </TapScale>
                    </div>
                </form>
            </div>
        </BottomSheet>
    );
}
