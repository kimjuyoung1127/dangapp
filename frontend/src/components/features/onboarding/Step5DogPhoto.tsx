"use client";

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Button } from '@/components/ui/Button';
import { ImagePlus } from 'lucide-react';

export function Step5DogPhoto() {
    const { data, setData, nextStep } = useOnboardingStore();

    const handlePhotoUploadMock = () => {
        // In a real scenario, this would trigger a file picker and upload to Supabase Storage
        setData({ dog_photo_url: "https://via.placeholder.com/400" });
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex-1 space-y-6 flex flex-col items-center justify-center">

                <button
                    onClick={handlePhotoUploadMock}
                    className={`w-48 h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${data.dog_photo_url
                            ? 'border-primary bg-primary-light/10'
                            : 'border-border bg-card hover:border-primary/50 text-foreground-muted hover:text-primary'
                        }`}
                >
                    {data.dog_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.dog_photo_url} alt="Dog Profile" className="w-full h-full object-cover rounded-3xl" />
                    ) : (
                        <>
                            <ImagePlus className="w-10 h-10 mb-2" />
                            <span className="text-sm font-medium">사진 한 장 추가하기</span>
                        </>
                    )}
                </button>

                <p className="text-sm text-foreground-muted text-center px-4">
                    매력적인 사진 한 장이 매칭 성공률을 <br />크게 높여줍니다!
                </p>

            </div>

            <div className="pt-8">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={nextStep}
                    disabled={!data.dog_photo_url}
                >
                    다음으로
                </Button>
            </div>
        </div>
    );
}
