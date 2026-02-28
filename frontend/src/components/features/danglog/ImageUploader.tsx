"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TapScale } from "@/components/ui/MotionWrappers";
import { useUploadDangLogImage } from "@/lib/hooks/useDangLog";
import { Camera, X, Loader2 } from "lucide-react";

const MAX_IMAGES = 4;

interface ImageUploaderProps {
    images: string[];
    onChange: (urls: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const uploadMutation = useUploadDangLogImage();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || images.length >= MAX_IMAGES) return;

        setUploadingIndex(images.length);

        try {
            const url = await uploadMutation.mutateAsync(file);
            onChange([...images, url]);
        } catch {
            // 업로드 실패 시 조용히 처리
        } finally {
            setUploadingIndex(null);
            // 같은 파일 재선택 허용
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemove = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const slots = Array.from({ length: MAX_IMAGES }, (_, i) => i);

    return (
        <div className="grid grid-cols-4 gap-2">
            {slots.map((index) => {
                const imageUrl = images[index];
                const isUploading = uploadingIndex === index;
                const isEmpty = !imageUrl && !isUploading;
                const canAdd = isEmpty && index === images.length && images.length < MAX_IMAGES;

                if (imageUrl) {
                    return (
                        <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden border border-border"
                        >
                            <Image
                                src={imageUrl}
                                alt={`업로드 이미지 ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="25vw"
                            />
                            <TapScale className="absolute top-1 right-1">
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </TapScale>
                        </div>
                    );
                }

                if (isUploading) {
                    return (
                        <div
                            key={index}
                            className="aspect-square rounded-xl border border-border bg-muted/50 flex items-center justify-center"
                        >
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                    );
                }

                if (canAdd) {
                    return (
                        <TapScale key={index}>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "aspect-square rounded-xl border-2 border-dashed border-border",
                                    "flex flex-col items-center justify-center gap-1",
                                    "text-foreground-muted hover:border-primary-light hover:text-primary transition-colors"
                                )}
                            >
                                <Camera className="w-5 h-5" />
                                <span className="text-[10px]">추가</span>
                            </button>
                        </TapScale>
                    );
                }

                // 빈 슬롯
                return (
                    <div
                        key={index}
                        className="aspect-square rounded-xl border border-border/50 bg-muted/50"
                    />
                );
            })}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}
