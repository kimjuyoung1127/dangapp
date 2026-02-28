"use client";

import { cn } from "@/lib/utils";
import { TapScale } from "@/components/ui/MotionWrappers";
import {
    Footprints,
    Gamepad2,
    GraduationCap,
    Coffee,
    Stethoscope,
    MoreHorizontal,
} from "lucide-react";

const ACTIVITY_TYPES = [
    { value: "walk", label: "산책", icon: Footprints },
    { value: "play", label: "놀이", icon: Gamepad2 },
    { value: "training", label: "훈련", icon: GraduationCap },
    { value: "cafe", label: "카페", icon: Coffee },
    { value: "hospital", label: "병원", icon: Stethoscope },
    { value: "other", label: "기타", icon: MoreHorizontal },
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number]["value"];

interface ActivityTypeSelectProps {
    value: string | null;
    onChange: (value: ActivityType) => void;
}

export default function ActivityTypeSelect({
    value,
    onChange,
}: ActivityTypeSelectProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {ACTIVITY_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = value === type.value;

                return (
                    <TapScale key={type.value}>
                        <button
                            type="button"
                            onClick={() => onChange(type.value)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors w-full",
                                isSelected
                                    ? "bg-primary text-white border-primary"
                                    : "bg-card text-foreground-muted border-border hover:border-primary-light"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">
                                {type.label}
                            </span>
                        </button>
                    </TapScale>
                );
            })}
        </div>
    );
}
