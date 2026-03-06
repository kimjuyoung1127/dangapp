// Step5DogPhoto.tsx — 반려견 사진 실제 업로드 (전체 선택, 스킵 가능) (DANG-ONB-001)

"use client";

import { useRef } from "react";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { useUploadDogPhoto } from "@/lib/hooks/useOnboarding";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Step5DogPhoto() {
    const { data, setData, nextStep, photoFile, setPhotoFile } = useOnboardingStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadMutation = useUploadDogPhoto();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPhotoFile(file);

        try {
            const publicUrl = await uploadMutation.mutateAsync(file);
            setData({ dog_photo_url: publicUrl });
        } catch {
            // 에러는 mutation 상태로 관리
        }
    };

    const previewUrl = data.dog_photo_url || (photoFile ? URL.createObjectURL(photoFile) : null);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-6 flex flex-col items-center justify-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {uploadMutation.isPending ? (
                    <Skeleton className="w-48 h-48 rounded-3xl" />
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "w-48 h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                            previewUrl
                                ? "border-primary bg-primary-light/10"
                                : "border-border bg-card hover:border-primary/50 text-foreground-muted hover:text-primary"
                        )}
                    >
                        {previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewUrl}
                                alt="반려견 프로필"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                <ImagePlus className="w-10 h-10 mb-2" />
                                <span className="text-sm font-medium">사진 한 장 추가하기</span>
                            </>
                        )}
                    </button>
                )}

                {previewUrl && !uploadMutation.isPending && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        다른 사진으로 변경
                    </button>
                )}

                {uploadMutation.isError && (
                    <div className="text-center space-y-2">
                        <p className="text-sm text-red-500">
                            업로드에 실패했습니다. 다시 시도해주세요.
                        </p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-primary underline"
                        >
                            재시도
                        </button>
                    </div>
                )}

                <p className="text-sm text-foreground-muted text-center px-4">
                    매력적인 사진 한 장이 매칭 성공률을 <br />크게 높여줍니다!
                </p>
            </div>

            <div className="pt-8 space-y-3">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={nextStep}
                    disabled={uploadMutation.isPending}
                >
                    다음으로
                </Button>
                <button
                    type="button"
                    onClick={nextStep}
                    className="w-full text-sm text-foreground-muted hover:text-foreground transition-colors py-2"
                >
                    나중에 추가하기
                </button>
            </div>
        </div>
    );
}
