// CareRequestForm.tsx — 돌봄 요청 작성 BottomSheet

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCreateCareRequest } from "@/lib/hooks/useMode";
import { type CareType } from "@/lib/constants/modes";
import CareTypeSelect from "./CareTypeSelect";
import { X } from "lucide-react";

const careRequestSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요"),
    description: z.string().optional(),
    datetime: z.string().min(1, "일시를 선택해주세요"),
    duration_hours: z.number().min(1).max(24),
});

type CareRequestFormData = z.infer<typeof careRequestSchema>;

interface CareRequestFormProps {
    isOpen: boolean;
    onClose: () => void;
    requesterId: string;
    caregiverId: string;
    dogId?: string;
}

export default function CareRequestForm({
    isOpen,
    onClose,
    requesterId,
    caregiverId,
    dogId,
}: CareRequestFormProps) {
    const [careType, setCareType] = useState<CareType | null>(null);
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
        if (!careType) return;

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
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                {/* 상단 바 */}
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose}>
                        <X className="w-6 h-6 text-foreground-muted" />
                    </button>
                    <h3 className="text-xl font-display font-semibold">
                        돌봄 요청
                    </h3>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!careType || createMutation.isPending}
                    >
                        {createMutation.isPending ? "전송 중..." : "요청"}
                    </Button>
                </div>

                {/* 돌봄 유형 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        돌봄 유형
                    </label>
                    <CareTypeSelect value={careType} onChange={setCareType} />
                </div>

                {/* 제목 */}
                <div>
                    <input
                        {...register("title")}
                        placeholder="요청 제목"
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

                {/* 일시 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        일시
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

                {/* 소요 시간 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        소요 시간 (시간)
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

                {/* 설명 */}
                <textarea
                    {...register("description")}
                    placeholder="상세 설명 (선택)"
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
