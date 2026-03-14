"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCreateCareRequest, type CaregiverOption } from "@/lib/hooks/useMode";
import { type CareType } from "@/lib/constants/modes";
import CareTypeSelect from "./CareTypeSelect";
import { X } from "lucide-react";

const careRequestSchema = z.object({
    title: z.string().min(1, "요청 제목을 입력해 주세요."),
    description: z.string().optional(),
    datetime: z.string().min(1, "날짜와 시간을 입력해 주세요."),
    duration_hours: z.number().min(1).max(24),
});

type CareRequestFormData = z.infer<typeof careRequestSchema>;

interface CareRequestFormProps {
    isOpen: boolean;
    onClose: () => void;
    requesterId: string;
    caregiverId: string;
    caregiverOptions: CaregiverOption[];
    onCaregiverChange: (caregiverId: string) => void;
    onSubmitError?: (message: string) => void;
    dogId?: string;
}

export default function CareRequestForm({
    isOpen,
    onClose,
    requesterId,
    caregiverId,
    caregiverOptions,
    onCaregiverChange,
    onSubmitError,
    dogId,
}: CareRequestFormProps) {
    const [careType, setCareType] = useState<CareType | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const createMutation = useCreateCareRequest();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CareRequestFormData>({
        resolver: zodResolver(careRequestSchema),
        defaultValues: { duration_hours: 1 },
    });

    const onSubmit = async (formData: CareRequestFormData) => {
        setSubmitError(null);

        if (!careType || !caregiverId) {
            const message = "돌봄 유형과 상대 보호자를 먼저 선택해 주세요.";
            setSubmitError(message);
            onSubmitError?.(message);
            return;
        }

        try {
            await createMutation.mutateAsync({
                requester_id: requesterId,
                caregiver_id: caregiverId,
                dog_id: dogId ?? null,
                title: formData.title,
                description: formData.description || null,
                care_type: careType,
                datetime: formData.datetime,
                duration_hours: formData.duration_hours,
            });

            reset();
            setCareType(null);
            onClose();
        } catch {
            const message = "요청 생성에 실패했어요. 잠시 후 다시 시도해 주세요.";
            setSubmitError(message);
            onSubmitError?.(message);
        }
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose}>
                        <X className="w-6 h-6 text-foreground-muted" />
                    </button>
                    <h3 className="text-xl font-display font-semibold">돌봄 요청</h3>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!careType || !caregiverId || createMutation.isPending}
                    >
                        {createMutation.isPending ? "보내는 중..." : "보내기"}
                    </Button>
                </div>

                {submitError && (
                    <div
                        className="rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2"
                        role="status"
                        aria-live="polite"
                    >
                        {submitError}
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        함께할 보호자
                    </label>
                    <select
                        value={caregiverId}
                        onChange={(event) => onCaregiverChange(event.target.value)}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border bg-card",
                            "text-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            caregiverId ? "border-border" : "border-amber-300"
                        )}
                    >
                        <option value="">상대 보호자를 선택해 주세요.</option>
                        {caregiverOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.nickname} (Lv.{option.trustLevel})
                            </option>
                        ))}
                    </select>
                    {caregiverOptions.length === 0 && (
                        <p className="text-xs text-foreground-muted mt-1">
                            아직 선택할 수 있는 보호자가 없어요. 먼저 연결을 만들어 보세요.
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        돌봄 유형
                    </label>
                    <CareTypeSelect value={careType} onChange={setCareType} />
                </div>

                <div>
                    <input
                        {...register("title")}
                        placeholder="예: 저녁 산책 돌봄 요청"
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border bg-card",
                            "text-foreground placeholder:text-foreground-muted/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            errors.title ? "border-red-400" : "border-border"
                        )}
                    />
                    {errors.title && (
                        <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        날짜와 시간
                    </label>
                    <input
                        {...register("datetime")}
                        type="datetime-local"
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border bg-card",
                            "text-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            errors.datetime ? "border-red-400" : "border-border"
                        )}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        예상 소요 시간
                    </label>
                    <input
                        {...register("duration_hours", { valueAsNumber: true })}
                        type="number"
                        min={1}
                        max={24}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border border-border bg-card",
                            "text-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        )}
                    />
                </div>

                <textarea
                    {...register("description")}
                    placeholder="전달할 메모가 있다면 적어 주세요. (선택)"
                    rows={3}
                    className={cn(
                        "w-full px-4 py-3 rounded-xl border border-border bg-card resize-none",
                        "text-foreground placeholder:text-foreground-muted/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                />
            </form>
        </BottomSheet>
    );
}
