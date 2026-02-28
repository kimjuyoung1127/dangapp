// CareTypeSelect.tsx — 돌봄 유형 칩 선택 (ActivityTypeSelect 패턴)

"use client";

import { cn } from "@/lib/utils";
import { TapScale } from "@/components/ui/MotionWrappers";
import { CARE_TYPES, type CareType } from "@/lib/constants/modes";

interface CareTypeSelectProps {
    value: CareType | null;
    onChange: (value: CareType) => void;
}

export default function CareTypeSelect({
    value,
    onChange,
}: CareTypeSelectProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {CARE_TYPES.map((type) => {
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
