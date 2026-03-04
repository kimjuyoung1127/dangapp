// EditProfileForm.tsx — 보호자·반려견 인라인 편집 폼 컴포넌트 (DANG-PRF-001)
// EditProfileSheet의 폼 로직을 독립 컴포넌트로 분리; 재사용 가능

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useUpdateGuardian, useUpdateDog } from "@/lib/hooks/useProfile";
import type { Database } from "@/types/database.types";

type Guardian = Database["public"]["Tables"]["guardians"]["Row"];
type Dog = Database["public"]["Tables"]["dogs"]["Row"];

// ─── 스키마 ──────────────────────────────

const guardianSchema = z.object({
    nickname: z.string().min(1, "닉네임을 입력해주세요").max(20),
    full_name: z.string().max(50).optional(),
    bio: z.string().max(200).optional(),
    gender: z.enum(["male", "female", "other", ""]).optional(),
    birth_date: z.string().optional(),
    address_name: z.string().max(100).optional(),
});

const dogSchema = z.object({
    name: z.string().min(1, "이름을 입력해주세요").max(30),
    breed: z.string().min(1, "품종을 입력해주세요").max(50),
    age: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : undefined)),
    weight_kg: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : undefined)),
});

type GuardianFormData = z.infer<typeof guardianSchema>;

// ─── Props ───────────────────────────────

interface EditProfileFormProps {
    /** "guardian" 탭 or "dog" 탭 */
    mode: "guardian" | "dog";
    guardian: Guardian;
    dog?: Dog | null;
    onSuccess?: () => void;
}

// ─── 컴포넌트 ─────────────────────────────

export default function EditProfileForm({
    mode,
    guardian,
    dog,
    onSuccess,
}: EditProfileFormProps) {
    const updateGuardian = useUpdateGuardian();
    const updateDog = useUpdateDog();

    const guardianForm = useForm<GuardianFormData>({
        resolver: zodResolver(guardianSchema),
        defaultValues: {
            nickname: guardian.nickname,
            full_name: guardian.full_name ?? "",
            bio: guardian.bio ?? "",
            gender: (guardian.gender as "male" | "female" | "other" | "") ?? "",
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
        onSuccess?.();
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
        onSuccess?.();
    };

    const isPending = updateGuardian.isPending || updateDog.isPending;

    if (mode === "guardian") {
        return (
            <form
                onSubmit={guardianForm.handleSubmit(onGuardianSubmit)}
                className="space-y-4"
            >
                <FormField
                    label="닉네임 *"
                    error={guardianForm.formState.errors.nickname?.message}
                >
                    <input
                        {...guardianForm.register("nickname")}
                        className={inputCls(!!guardianForm.formState.errors.nickname)}
                    />
                </FormField>

                <FormField label="이름">
                    <input
                        {...guardianForm.register("full_name")}
                        placeholder="실명 (선택)"
                        className={inputCls(false)}
                    />
                </FormField>

                <FormField label="소개">
                    <textarea
                        {...guardianForm.register("bio")}
                        placeholder="자기소개 (최대 200자)"
                        rows={3}
                        className={cn(inputCls(false), "resize-none")}
                    />
                </FormField>

                <FormField label="성별">
                    <select
                        {...guardianForm.register("gender")}
                        className={inputCls(false)}
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
                        className={inputCls(false)}
                    />
                </FormField>

                <FormField label="주소">
                    <input
                        {...guardianForm.register("address_name")}
                        placeholder="거주 지역"
                        className={inputCls(false)}
                    />
                </FormField>

                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                    {isPending ? "저장 중..." : "저장"}
                </Button>
            </form>
        );
    }

    // mode === "dog"
    return (
        <form
            onSubmit={dogForm.handleSubmit(onDogSubmit)}
            className="space-y-4"
        >
            <FormField
                label="이름 *"
                error={dogForm.formState.errors.name?.message as string | undefined}
            >
                <input
                    {...dogForm.register("name")}
                    className={inputCls(!!dogForm.formState.errors.name)}
                />
            </FormField>

            <FormField
                label="품종 *"
                error={dogForm.formState.errors.breed?.message as string | undefined}
            >
                <input
                    {...dogForm.register("breed")}
                    className={inputCls(!!dogForm.formState.errors.breed)}
                />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="나이 (세)">
                    <input
                        type="number"
                        {...dogForm.register("age")}
                        placeholder="나이"
                        className={inputCls(false)}
                    />
                </FormField>

                <FormField label="몸무게 (kg)">
                    <input
                        type="number"
                        step="0.1"
                        {...dogForm.register("weight_kg")}
                        placeholder="몸무게"
                        className={inputCls(false)}
                    />
                </FormField>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? "저장 중..." : "저장"}
            </Button>
        </form>
    );
}

// ─── 내부 헬퍼 ────────────────────────────

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

function inputCls(hasError: boolean) {
    return cn(
        "w-full px-4 py-3 rounded-xl border bg-card",
        "text-foreground placeholder:text-foreground-muted/50",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        hasError ? "border-red-400" : "border-border"
    );
}
