// File: Bottom-sheet form to create a family group.
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { useCreateFamilyGroup } from "@/lib/hooks/useFamily";
import { cn } from "@/lib/utils";

const groupSchema = z.object({
    name: z.string().min(1, "그룹 이름을 입력해 주세요."),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface FamilyGroupFormProps {
    isOpen: boolean;
    onClose: () => void;
    creatorId: string;
}

export default function FamilyGroupForm({
    isOpen,
    onClose,
    creatorId,
}: FamilyGroupFormProps) {
    const createMutation = useCreateFamilyGroup();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
    });

    const onSubmit = async (formData: GroupFormData) => {
        await createMutation.mutateAsync({
            name: formData.name,
            creator_id: creatorId,
        });

        reset();
        onClose();
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose} aria-label="그룹 만들기 닫기">
                        <X className="h-6 w-6 text-foreground-muted" />
                    </button>
                    <h3 className="text-xl font-display font-semibold">돌봄 그룹 만들기</h3>
                    <Button type="submit" size="sm" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "생성 중..." : "만들기"}
                    </Button>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-foreground-muted">그룹 이름</label>
                    <input
                        {...register("name")}
                        placeholder="예: 초코와 우주 가족"
                        className={cn(
                            "w-full rounded-xl border bg-card px-4 py-3",
                            "text-foreground placeholder:text-foreground-muted/50",
                            "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary",
                            errors.name ? "border-red-400" : "border-border"
                        )}
                    />
                    {errors.name ? (
                        <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                    ) : null}
                </div>

                <p className="text-xs text-foreground-muted">
                    그룹을 만들면 생성자가 기본 그룹장으로 등록됩니다.
                </p>
            </form>
        </BottomSheet>
    );
}
