// FamilyGroupForm.tsx — 패밀리 그룹 생성 BottomSheet

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCreateFamilyGroup } from "@/lib/hooks/useMode";
import { X } from "lucide-react";

const groupSchema = z.object({
    name: z.string().min(1, "그룹 이름을 입력해주세요"),
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
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                {/* 상단 바 */}
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose}>
                        <X className="w-6 h-6 text-foreground-muted" />
                    </button>
                    <h3 className="text-xl font-display font-semibold">
                        패밀리 그룹 만들기
                    </h3>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? "생성 중..." : "만들기"}
                    </Button>
                </div>

                {/* 그룹 이름 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        그룹 이름
                    </label>
                    <input
                        {...register("name")}
                        placeholder="예: 초코네 가족"
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border bg-card",
                            "text-foreground placeholder:text-foreground-muted/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            errors.name ? "border-red-400" : "border-border"
                        )}
                    />
                    {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                    )}
                </div>

                <p className="text-xs text-foreground-muted">
                    그룹을 만들면 자동으로 그룹장이 됩니다. 이후 멤버를 초대할 수 있어요.
                </p>
            </form>
        </BottomSheet>
    );
}
