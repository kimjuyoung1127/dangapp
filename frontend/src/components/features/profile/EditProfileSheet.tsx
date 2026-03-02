// EditProfileSheet.tsx — 프로필 편집 BottomSheet (DANG-PRF-001)

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useUpdateGuardian, useUpdateDog } from "@/lib/hooks/useProfile";
import { X } from "lucide-react";
import type { Database } from "@/types/database.types";

type Guardian = Database["public"]["Tables"]["guardians"]["Row"];
type Dog = Database["public"]["Tables"]["dogs"]["Row"];

const guardianSchema = z.object({
    nickname: z.string().min(1, "닉네임을 입력해주세요").max(20),
    full_name: z.string().optional(),
    bio: z.string().max(200).optional(),
    gender: z.string().optional(),
    birth_date: z.string().optional(),
    address_name: z.string().optional(),
});

const dogSchema = z.object({
    name: z.string().min(1, "이름을 입력해주세요"),
    breed: z.string().min(1, "품종을 입력해주세요"),
    age: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
    weight_kg: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
});

type GuardianFormData = z.infer<typeof guardianSchema>;
type EditTab = "guardian" | "dog";

interface EditProfileSheetProps {
    isOpen: boolean;
    onClose: () => void;
    guardian: Guardian;
    dog: Dog | null;
}

export default function EditProfileSheet({
    isOpen,
    onClose,
    guardian,
    dog,
}: EditProfileSheetProps) {
    const [activeTab, setActiveTab] = useState<EditTab>("guardian");
    const updateGuardian = useUpdateGuardian();
    const updateDog = useUpdateDog();

    const guardianForm = useForm<GuardianFormData>({
        resolver: zodResolver(guardianSchema),
        defaultValues: {
            nickname: guardian.nickname,
            full_name: guardian.full_name ?? "",
            bio: guardian.bio ?? "",
            gender: guardian.gender ?? "",
            birth_date: guardian.birth_date ?? "",
            address_name: guardian.address_name ?? "",
        },
    });

    const dogForm = useForm({
        resolver: zodResolver(dogSchema),
        defaultValues: {
            name: dog?.name ?? "",
            breed: dog?.breed ?? "",
            age: dog?.age?.toString() ?? "",
            weight_kg: dog?.weight_kg?.toString() ?? "",
        },
    });

    const onGuardianSubmit = async (data: GuardianFormData) => {
        await updateGuardian.mutateAsync({
            guardianId: guardian.id,
            data: {
                nickname: data.nickname,
                full_name: data.full_name || null,
                bio: data.bio || null,
                gender: data.gender || null,
                birth_date: data.birth_date || null,
                address_name: data.address_name || null,
            },
        });
        onClose();
    };

    const onDogSubmit = async (data: Record<string, unknown>) => {
        if (!dog) return;
        const parsed = dogSchema.parse(data);
        await updateDog.mutateAsync({
            dogId: dog.id,
            data: {
                name: parsed.name,
                breed: parsed.breed,
                age: parsed.age ?? null,
                weight_kg: parsed.weight_kg ?? null,
            },
        });
        onClose();
    };

    const isPending = updateGuardian.isPending || updateDog.isPending;

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <div className="p-6 space-y-5">
                {/* 상단 바 */}
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose}>
                        <X className="w-6 h-6 text-foreground-muted" />
                    </button>
                    <h3 className="text-xl font-display font-semibold">
                        프로필 편집
                    </h3>
                    <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => {
                            if (activeTab === "guardian") {
                                guardianForm.handleSubmit(onGuardianSubmit)();
                            } else {
                                dogForm.handleSubmit(onDogSubmit)();
                            }
                        }}
                    >
                        {isPending ? "저장 중..." : "저장"}
                    </Button>
                </div>

                {/* 탭 */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={activeTab === "guardian" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setActiveTab("guardian")}
                    >
                        보호자 정보
                    </Button>
                    {dog && (
                        <Button
                            type="button"
                            variant={activeTab === "dog" ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => setActiveTab("dog")}
                        >
                            반려견 정보
                        </Button>
                    )}
                </div>

                {/* 보호자 폼 */}
                {activeTab === "guardian" && (
                    <form className="space-y-4">
                        <FormField
                            label="닉네임 *"
                            error={guardianForm.formState.errors.nickname?.message}
                        >
                            <input
                                {...guardianForm.register("nickname")}
                                className={inputClass(!!guardianForm.formState.errors.nickname)}
                            />
                        </FormField>

                        <FormField label="이름">
                            <input
                                {...guardianForm.register("full_name")}
                                placeholder="실명 (선택)"
                                className={inputClass(false)}
                            />
                        </FormField>

                        <FormField label="소개">
                            <textarea
                                {...guardianForm.register("bio")}
                                placeholder="자기소개 (최대 200자)"
                                rows={2}
                                className={cn(inputClass(false), "resize-none")}
                            />
                        </FormField>

                        <FormField label="성별">
                            <select
                                {...guardianForm.register("gender")}
                                className={inputClass(false)}
                            >
                                <option value="">선택 안 함</option>
                                <option value="male">남성</option>
                                <option value="female">여성</option>
                                <option value="other">기타</option>
                            </select>
                        </FormField>

                        <FormField label="생년월일">
                            <input
                                type="date"
                                {...guardianForm.register("birth_date")}
                                className={inputClass(false)}
                            />
                        </FormField>

                        <FormField label="주소">
                            <input
                                {...guardianForm.register("address_name")}
                                placeholder="거주 지역"
                                className={inputClass(false)}
                            />
                        </FormField>
                    </form>
                )}

                {/* 반려견 폼 */}
                {activeTab === "dog" && dog && (
                    <form className="space-y-4">
                        <FormField
                            label="이름 *"
                            error={dogForm.formState.errors.name?.message}
                        >
                            <input
                                {...dogForm.register("name")}
                                className={inputClass(!!dogForm.formState.errors.name)}
                            />
                        </FormField>

                        <FormField
                            label="품종 *"
                            error={dogForm.formState.errors.breed?.message}
                        >
                            <input
                                {...dogForm.register("breed")}
                                className={inputClass(!!dogForm.formState.errors.breed)}
                            />
                        </FormField>

                        <FormField label="나이 (세)">
                            <input
                                type="number"
                                {...dogForm.register("age")}
                                placeholder="나이"
                                className={inputClass(false)}
                            />
                        </FormField>

                        <FormField label="몸무게 (kg)">
                            <input
                                type="number"
                                step="0.1"
                                {...dogForm.register("weight_kg")}
                                placeholder="몸무게"
                                className={inputClass(false)}
                            />
                        </FormField>
                    </form>
                )}
            </div>
        </BottomSheet>
    );
}

function FormField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-foreground-muted mb-1.5 block">
                {label}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function inputClass(hasError: boolean) {
    return cn(
        "w-full px-4 py-3 rounded-xl border bg-card",
        "text-foreground placeholder:text-foreground-muted/50",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        hasError ? "border-red-400" : "border-border"
    );
}
