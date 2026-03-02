// Step2DogInfo.tsx — 반려견 기본 정보 (dog_name 필수, 나머지 선택) (DANG-ONB-001)

"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { step2Schema, type Step2Data } from "@/lib/schemas/onboarding";
import { cn } from "@/lib/utils";

export function Step2DogInfo() {
    const { data, setData, nextStep } = useOnboardingStore();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            dog_name: data.dog_name || "",
            dog_breed: data.dog_breed || "",
            dog_birth_date: data.dog_birth_date || "",
            dog_weight_kg: data.dog_weight_kg,
            dog_gender: data.dog_gender,
            dog_neutered: data.dog_neutered,
        },
    });

    const onSubmit = (values: Step2Data) => {
        setData(values);
        nextStep();
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col h-full"
        >
            <div className="flex-1 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        반려견 이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("dog_name")}
                        placeholder="호두"
                        className={cn(
                            "w-full px-4 h-14 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg",
                            errors.dog_name ? "border-red-500" : "border-border"
                        )}
                    />
                    {errors.dog_name && (
                        <p className="text-sm text-red-500">{errors.dog_name.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            견종 <span className="text-foreground-muted text-xs">(선택)</span>
                        </label>
                        <input
                            type="text"
                            {...register("dog_breed")}
                            placeholder="말티즈"
                            className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            생년월일 <span className="text-foreground-muted text-xs">(선택)</span>
                        </label>
                        <input
                            type="date"
                            {...register("dog_birth_date")}
                            className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            몸무게(kg) <span className="text-foreground-muted text-xs">(선택)</span>
                        </label>
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            {...register("dog_weight_kg", { valueAsNumber: true })}
                            placeholder="5.2"
                            className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            성별 <span className="text-foreground-muted text-xs">(선택)</span>
                        </label>
                        <select
                            {...register("dog_gender")}
                            className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        >
                            <option value="">선택</option>
                            <option value="female">여아</option>
                            <option value="male">남아</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        중성화 여부 <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>
                    <Controller
                        name="dog_neutered"
                        control={control}
                        render={({ field }) => (
                            <div className="flex gap-2">
                                <ToggleChip
                                    selected={field.value === true}
                                    onClick={() => field.onChange(true)}
                                >
                                    완료
                                </ToggleChip>
                                <ToggleChip
                                    selected={field.value === false}
                                    onClick={() => field.onChange(false)}
                                >
                                    미완료
                                </ToggleChip>
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className="pt-8">
                <Button type="submit" size="lg" className="w-full">
                    다음으로
                </Button>
            </div>
        </form>
    );
}
