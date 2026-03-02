// WalkRecordForm.tsx — 산책 기록 작성 BottomSheet (DANG-WLK-001)

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCreateWalkRecord, useUploadWalkPhoto } from "@/lib/hooks/useWalkRecord";
import Image from "next/image";
import { X } from "lucide-react";

const walkRecordSchema = z.object({
    walk_date: z.string().min(1, "산책 날짜를 선택해주세요"),
    place_name: z.string().optional(),
    memo: z.string().max(500, "500자까지 입력 가능합니다").optional(),
});

type WalkRecordFormData = z.infer<typeof walkRecordSchema>;

type VisibilityOption = "public" | "neighbor" | "private";

interface WalkRecordFormProps {
    isOpen: boolean;
    onClose: () => void;
    scheduleId?: string;
    partnerGuardianId?: string;
    authorId: string;
}

export default function WalkRecordForm({
    isOpen,
    onClose,
    scheduleId,
    partnerGuardianId,
    authorId,
}: WalkRecordFormProps) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [visibility, setVisibility] = useState<VisibilityOption>("public");

    const createMutation = useCreateWalkRecord();
    // ImageUploader는 danglog-images 버킷 사용, walk 사진은 별도 업로드
    const uploadPhoto = useUploadWalkPhoto();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<WalkRecordFormData>({
        resolver: zodResolver(walkRecordSchema),
        defaultValues: {
            walk_date: new Date().toISOString().split("T")[0],
        },
    });

    const onSubmit = async (formData: WalkRecordFormData) => {
        await createMutation.mutateAsync({
            schedule_id: scheduleId ?? null,
            author_id: authorId,
            partner_guardian_id: partnerGuardianId ?? null,
            walk_date: formData.walk_date,
            place_name: formData.place_name || null,
            memo: formData.memo || null,
            photo_urls: imageUrls.length > 0 ? imageUrls : null,
            visibility,
        });

        reset();
        setImageUrls([]);
        setVisibility("public");
        onClose();
    };

    const handleFileUpload = async (file: File): Promise<string> => {
        return uploadPhoto.mutateAsync(file);
    };

    const VISIBILITY_OPTIONS: { value: VisibilityOption; label: string }[] = [
        { value: "public", label: "전체 공개" },
        { value: "neighbor", label: "이웃만" },
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
                        산책 기록
                    </h3>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? "저장 중..." : "완료"}
                    </Button>
                </div>

                {/* 산책 날짜 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        산책 날짜 *
                    </label>
                    <input
                        type="date"
                        {...register("walk_date")}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border bg-card",
                            "text-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            errors.walk_date ? "border-red-400" : "border-border"
                        )}
                    />
                    {errors.walk_date && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.walk_date.message}
                        </p>
                    )}
                </div>

                {/* 장소 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        장소
                    </label>
                    <input
                        {...register("place_name")}
                        placeholder="산책한 장소를 입력해주세요"
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border border-border bg-card",
                            "text-foreground placeholder:text-foreground-muted/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        )}
                    />
                </div>

                {/* 메모 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        메모 (최대 500자)
                    </label>
                    <textarea
                        {...register("memo")}
                        placeholder="산책 중 특이사항이나 기록할 내용을 적어주세요"
                        rows={3}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border bg-card resize-none",
                            "text-foreground placeholder:text-foreground-muted/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            errors.memo ? "border-red-400" : "border-border"
                        )}
                    />
                    {errors.memo && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.memo.message}
                        </p>
                    )}
                </div>

                {/* 사진 업로드 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        사진 (최대 4장)
                    </label>
                    <WalkImageUploader
                        images={imageUrls}
                        onChange={setImageUrls}
                        onUpload={handleFileUpload}
                    />
                </div>

                {/* 공개 범위 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        공개 범위
                    </label>
                    <div className="flex gap-2">
                        {VISIBILITY_OPTIONS.map((opt) => (
                            <Button
                                key={opt.value}
                                type="button"
                                variant={visibility === opt.value ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => setVisibility(opt.value)}
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

/** walk-records 전용 이미지 업로더 (danglog ImageUploader와 동일 UX, 버킷만 다름) */
function WalkImageUploader({
    images,
    onChange,
    onUpload,
}: {
    images: string[];
    onChange: (urls: string[]) => void;
    onUpload: (file: File) => Promise<string>;
}) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = { current: null as HTMLInputElement | null };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || images.length >= 4) return;

        setIsUploading(true);
        try {
            const url = await onUpload(file);
            onChange([...images, url]);
        } catch {
            // 업로드 실패 시 조용히 처리
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    return (
        <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, i) => {
                const url = images[i];
                if (url) {
                    return (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                            <Image src={url} alt={`사진 ${i + 1}`} fill className="object-cover" sizes="25vw" />
                            <button
                                type="button"
                                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    );
                }
                if (i === images.length && images.length < 4) {
                    return (
                        <label
                            key={i}
                            className={cn(
                                "aspect-square rounded-xl border-2 border-dashed border-border",
                                "flex flex-col items-center justify-center gap-1 cursor-pointer",
                                "text-foreground-muted hover:border-primary-light hover:text-primary transition-colors"
                            )}
                        >
                            {isUploading ? (
                                <span className="text-xs">업로드 중...</span>
                            ) : (
                                <>
                                    <span className="text-lg">+</span>
                                    <span className="text-[10px]">추가</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                ref={(el) => { fileInputRef.current = el; }}
                            />
                        </label>
                    );
                }
                return (
                    <div key={i} className="aspect-square rounded-xl border border-border/50 bg-muted/50" />
                );
            })}
        </div>
    );
}
