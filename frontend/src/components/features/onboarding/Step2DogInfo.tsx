// Step2DogInfo.tsx — 반려견 기본 정보 (dog_name 필수, 나머지 선택) (DANG-ONB-001)

"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { step2Schema, type Step2Data } from "@/lib/schemas/onboarding";
import { BREEDS } from "@/lib/constants/breeds";
import { cn } from "@/lib/utils";

export function Step2DogInfo() {
    const { data, setData, nextStep } = useOnboardingStore();
    const [breedSearch, setBreedSearch] = useState(data.dog_breed || "");
    const [showBreedList, setShowBreedList] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
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

    const filteredBreeds = BREEDS.filter(b => 
        b.name.includes(breedSearch) || b.enName.toLowerCase().includes(breedSearch.toLowerCase())
    ).slice(0, 5);

    const onSubmit = (values: Step2Data) => {
        setData(values);
        nextStep();
    };

    // [디버깅 모드] 유효성 검사 무시하고 강제 다음 단계 이동
    const handleForceNext = () => {
        const currentValues = watch();
        setData(currentValues);
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
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium text-foreground">
                            견종 <span className="text-foreground-muted text-xs">(선택)</span>
                        </label>
                        <input
                            type="text"
                            value={breedSearch}
                            onChange={(e) => {
                                setBreedSearch(e.target.value);
                                setValue("dog_breed", e.target.value);
                                setShowBreedList(true);
                            }}
                            onFocus={() => setShowBreedList(true)}
                            onBlur={() => {
                                // 딜레이를 주어 리스트 항목의 onClick이 먼저 실행될 수 있게 함
                                setTimeout(() => setShowBreedList(false), 200);
                            }}
                            placeholder="말티즈"
                            className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                        />

                        {showBreedList && breedSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                                {filteredBreeds.map((breed) => (
                                    <button
                                        key={breed.id}
                                        type="button"
                                        className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-0"
                                        onClick={() => {
                                            setBreedSearch(breed.name);
                                            setValue("dog_breed", breed.name);
                                            setShowBreedList(false);
                                        }}
                                    >
                                        <span className="text-sm font-medium">{breed.name}</span>
                                        <span className="ml-2 text-xs text-foreground-muted">{breed.enName}</span>
                                    </button>
                                ))}
                                {filteredBreeds.length === 0 && (
                                    <div className="px-4 py-3 text-sm text-foreground-muted italic">
                                        직접 입력: {breedSearch}
                                    </div>
                                )}
                            </div>
                        )}
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
                        <Controller
                            name="dog_gender"
                            control={control}
                            render={({ field }) => (
                                <div className="flex gap-2 h-14">
                                    <ToggleChip
                                        className="flex-1 justify-center"
                                        selected={field.value === "female"}
                                        onClick={() => field.onChange("female")}
                                    >
                                        여아
                                    </ToggleChip>
                                    <ToggleChip
                                        className="flex-1 justify-center"
                                        selected={field.value === "male"}
                                        onClick={() => field.onChange("male")}
                                    >
                                        남아
                                    </ToggleChip>
                                </div>
                            )}
                        />
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
                <Button 
                    type="button" 
                    size="lg" 
                    className="w-full"
                    onClick={handleForceNext}
                >
                    다음으로
                </Button>
            </div>
        </form>
    );
}
