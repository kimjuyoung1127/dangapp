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
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    datetime: z.string().min(1, "Date/time is required"),
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
            const message = "Select care type and partner before submitting.";
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
            const message = "Failed to create request. Please retry.";
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
                    <h3 className="text-xl font-display font-semibold">Care request</h3>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!careType || !caregiverId || createMutation.isPending}
                    >
                        {createMutation.isPending ? "Submitting..." : "Submit"}
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
                        Care partner
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
                        <option value="">Select partner</option>
                        {caregiverOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.nickname} (Lv.{option.trustLevel})
                            </option>
                        ))}
                    </select>
                    {caregiverOptions.length === 0 && (
                        <p className="text-xs text-foreground-muted mt-1">
                            No available partners yet. Create a connection first.
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        Care type
                    </label>
                    <CareTypeSelect value={careType} onChange={setCareType} />
                </div>

                <div>
                    <input
                        {...register("title")}
                        placeholder="Request title"
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
                        Date and time
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
                        Duration (hours)
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
                    placeholder="Description (optional)"
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
