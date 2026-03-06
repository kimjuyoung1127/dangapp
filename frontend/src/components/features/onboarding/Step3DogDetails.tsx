// Step3DogDetails.tsx — 반려견 상세 정보 (크기·특이사항·예방접종) (DANG-ONB-001)

"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { cn } from "@/lib/utils";

const step3DetailsSchema = z.object({
    dog_size: z.enum(["small", "medium", "large"]).optional(),
    dog_vaccinated: z.boolean().optional(),
    dog_special_notes: z.string().max(300).optional(),
});

type Step3DetailsData = z.infer<typeof step3DetailsSchema>;

const SIZE_OPTIONS: { value: "small" | "medium" | "large"; label: string; desc: string }[] = [
    { value: "small", label: "소형", desc: "~10kg" },
    { value: "medium", label: "중형", desc: "10~25kg" },
    { value: "large", label: "대형", desc: "25kg~" },
];

export function Step3DogDetails() {
    const { data, setData, nextStep, prevStep } = useOnboardingStore();

    const {
        register,
        control,
        handleSubmit,
        watch,
    } = useForm<Step3DetailsData>({
        resolver: zodResolver(step3DetailsSchema),
        defaultValues: {
            dog_size: (data as Record<string, unknown>).dog_size as "small" | "medium" | "large" | undefined,
            dog_vaccinated: (data as Record<string, unknown>).dog_vaccinated as boolean | undefined,
            dog_special_notes: (data as Record<string, unknown>).dog_special_notes as string | undefined,
        },
    });

    const onSubmit = (values: Step3DetailsData) => {
        setData(values as Parameters<typeof setData>[0]);
        nextStep();
    };

    const handleForceNext = () => {
        const vals = watch();
        setData(vals as Parameters<typeof setData>[0]);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex-1 space-y-6">

                {/* 크기 */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                        크기 <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>
                    <Controller
                        name="dog_size"
                        control={control}
                        render={({ field }) => (
                            <div className="flex gap-2">
                                {SIZE_OPTIONS.map((opt) => (
                                    <ToggleChip
                                        key={opt.value}
                                        className="flex-1 flex-col py-3 h-auto"
                                        selected={field.value === opt.value}
                                        onClick={() =>
                                            field.onChange(
                                                field.value === opt.value ? undefined : opt.value
                                            )
                                        }
                                    >
                                        <span className="font-semibold text-sm">{opt.label}</span>
                                        <span className="text-xs opacity-70">{opt.desc}</span>
                                    </ToggleChip>
                                ))}
                            </div>
                        )}
                    />
                </div>

                {/* 예방접종 */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                        예방접종 완료 여부 <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>
                    <Controller
                        name="dog_vaccinated"
                        control={control}
                        render={({ field }) => (
                            <div className="flex gap-2">
                                <ToggleChip
                                    selected={field.value === true}
                                    onClick={() => field.onChange(field.value === true ? undefined : true)}
                                >
                                    완료
                                </ToggleChip>
                                <ToggleChip
                                    selected={field.value === false}
                                    onClick={() => field.onChange(field.value === false ? undefined : false)}
                                >
                                    미완료
                                </ToggleChip>
                            </div>
                        )}
                    />
                </div>

                {/* 특이사항 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        특이사항 <span className="text-foreground-muted text-xs">(선택 · 최대 300자)</span>
                    </label>
                    <textarea
                        {...register("dog_special_notes")}
                        rows={4}
                        placeholder="알레르기, 겁이 많음, 낯선 개를 싫어함 등 돌봄 시 알아야 할 점을 적어주세요."
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border border-border bg-card resize-none",
                            "focus:outline-none focus:ring-2 focus:ring-primary transition-all",
                            "text-sm placeholder:text-foreground-muted/50"
                        )}
                    />
                </div>
            </div>

            <div className="pt-8 flex gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={prevStep}
                >
                    이전
                </Button>
                <Button
                    type="button"
                    size="lg"
                    className="flex-1"
                    onClick={handleForceNext}
                >
                    다음으로
                </Button>
            </div>
        </form>
    );
}
