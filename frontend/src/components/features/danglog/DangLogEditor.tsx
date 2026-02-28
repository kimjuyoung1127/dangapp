"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCreateDangLog } from "@/lib/hooks/useDangLog";
import ActivityTypeSelect, { type ActivityType } from "./ActivityTypeSelect";
import ImageUploader from "./ImageUploader";
import { X } from "lucide-react";

const dangLogSchema = z.object({
    title: z.string().optional(),
    content: z.string().min(1, "내용을 입력해주세요"),
});

type DangLogFormData = z.infer<typeof dangLogSchema>;

type ShareScope = "public" | "friends" | "private";

interface DangLogEditorProps {
    isOpen: boolean;
    onClose: () => void;
    authorId: string;
    dogId?: string;
}

export default function DangLogEditor({
    isOpen,
    onClose,
    authorId,
    dogId,
}: DangLogEditorProps) {
    const [activityType, setActivityType] = useState<ActivityType | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [shareScope, setShareScope] = useState<ShareScope>("public");

    const createMutation = useCreateDangLog();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DangLogFormData>({
        resolver: zodResolver(dangLogSchema),
    });

    const onSubmit = async (formData: DangLogFormData) => {
        await createMutation.mutateAsync({
            author_id: authorId,
            dog_id: dogId ?? null,
            title: formData.title || null,
            content: formData.content,
            image_urls: imageUrls.length > 0 ? imageUrls : null,
            activity_type: activityType,
            shared_with: shareScope === "private" ? [authorId] : null,
        });

        // 폼 초기화 + 시트 닫기
        reset();
        setActivityType(null);
        setImageUrls([]);
        setShareScope("public");
        onClose();
    };

    const SHARE_OPTIONS: { value: ShareScope; label: string }[] = [
        { value: "public", label: "전체 공개" },
        { value: "friends", label: "친구만" },
        { value: "private", label: "나만" },
    ];

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                {/* 상단 바 */}
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose}>
                        <X className="w-6 h-6 text-foreground-muted" />
                    </button>
                    <h3 className="text-xl font-display font-semibold">
                        새 댕로그 작성
                    </h3>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? "저장 중..." : "완료"}
                    </Button>
                </div>

                {/* 활동 유형 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        활동 유형
                    </label>
                    <ActivityTypeSelect
                        value={activityType}
                        onChange={setActivityType}
                    />
                </div>

                {/* 이미지 업로드 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        사진 (최대 4장)
                    </label>
                    <ImageUploader
                        images={imageUrls}
                        onChange={setImageUrls}
                    />
                </div>

                {/* 제목 (선택) */}
                <input
                    {...register("title")}
                    placeholder="제목 (선택)"
                    className={cn(
                        "w-full px-4 py-3 rounded-xl border border-border bg-card",
                        "text-foreground placeholder:text-foreground-muted/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                />

                {/* 내용 */}
                <div>
                    <textarea
                        {...register("content")}
                        placeholder="내용을 기록해보세요..."
                        rows={4}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border bg-card resize-none",
                            "text-foreground placeholder:text-foreground-muted/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            errors.content
                                ? "border-red-400"
                                : "border-border"
                        )}
                    />
                    {errors.content && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.content.message}
                        </p>
                    )}
                </div>

                {/* 공유 범위 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        공유 대상
                    </label>
                    <div className="flex gap-2">
                        {SHARE_OPTIONS.map((opt) => (
                            <Button
                                key={opt.value}
                                type="button"
                                variant={
                                    shareScope === opt.value
                                        ? "primary"
                                        : "secondary"
                                }
                                size="sm"
                                onClick={() => setShareScope(opt.value)}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </form>
        </BottomSheet>
    );
}
