// Step1Guardian.tsx — 보호자 정보 입력 (nickname 필수, 나머지 선택) (DANG-ONB-001)

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { step1Schema, type Step1Data } from "@/lib/schemas/onboarding";
import { cn } from "@/lib/utils";

const PURPOSES: Array<{ id: "friend" | "care" | "family"; label: string }> = [
    { id: "friend", label: "친구" },
    { id: "care", label: "돌봄" },
    { id: "family", label: "가족" },
];

export function Step1Guardian() {
    const { data, setData, nextStep } = useOnboardingStore();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            nickname: data.nickname || "",
            full_name: data.full_name || "",
            birth_date: data.birth_date || "",
            gender: data.gender,
            usage_purpose: data.usage_purpose || [],
            bio: data.bio || "",
        },
    });

    const selectedPurposes = watch("usage_purpose") || [];

    const togglePurpose = (purpose: "friend" | "care" | "family") => {
        const current = selectedPurposes;
        const next = current.includes(purpose)
            ? current.filter((p) => p !== purpose)
            : [...current, purpose];
        setValue("usage_purpose", next);
    };

    const onSubmit = (values: Step1Data) => {
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
                        닉네임 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("nickname")}
                        placeholder="호두 아빠"
                        className={cn(
                            "w-full px-4 h-14 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg",
                            errors.nickname ? "border-red-500" : "border-border"
                        )}
                    />
                    {errors.nickname && (
                        <p className="text-sm text-red-500">{errors.nickname.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        이름 <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>
                    <input
                        type="text"
                        {...register("full_name")}
                        placeholder="홍길동"
                        className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            생년월일 <span className="text-foreground-muted text-xs">(선택)</span>
                        </label>
                        <input
                            type="date"
                            {...register("birth_date")}
                            className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            성별 <span className="text-foreground-muted text-xs">(선택)</span>
                        </label>
                        <div className="flex gap-2 h-14">
                            <ToggleChip
                                className="flex-1 justify-center"
                                selected={watch("gender") === "female"}
                                onClick={() => setValue("gender", "female")}
                            >
                                여성
                            </ToggleChip>
                            <ToggleChip
                                className="flex-1 justify-center"
                                selected={watch("gender") === "male"}
                                onClick={() => setValue("gender", "male")}
                            >
                                남성
                            </ToggleChip>
                            <ToggleChip
                                className="flex-1 justify-center"
                                selected={watch("gender") === "other"}
                                onClick={() => setValue("gender", "other")}
                            >
                                기타
                            </ToggleChip>
                        </div>
                    </div>
                </div>


                <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                        이용 목적 <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>
                    <div className="flex gap-2">
                        {PURPOSES.map((purpose) => (
                            <ToggleChip
                                key={purpose.id}
                                selected={selectedPurposes.includes(purpose.id)}
                                onClick={() => togglePurpose(purpose.id)}
                            >
                                {purpose.label}
                            </ToggleChip>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        한 줄 소개 <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>
                    <textarea
                        {...register("bio")}
                        placeholder="주말 오전에 한강공원 산책하는 걸 좋아해요."
                        className="w-full p-4 h-28 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
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
