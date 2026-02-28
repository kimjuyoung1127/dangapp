"use client";

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Button } from '@/components/ui/Button';

export function Step2DogInfo() {
    const { data, setData, nextStep } = useOnboardingStore();

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex-1 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">반려견 이름</label>
                    <input
                        type="text"
                        value={data.dog_name || ''}
                        onChange={(e) => setData({ dog_name: e.target.value })}
                        placeholder="호두"
                        className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">견종</label>
                    <input
                        type="text"
                        value={data.dog_breed || ''}
                        onChange={(e) => setData({ dog_breed: e.target.value })}
                        placeholder="골든 리트리버"
                        className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                    />
                </div>
            </div>

            <div className="pt-8">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={nextStep}
                    disabled={!data.dog_name || !data.dog_breed}
                >
                    다음으로
                </Button>
            </div>
        </div>
    );
}
