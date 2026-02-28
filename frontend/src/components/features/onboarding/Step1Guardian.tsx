"use client";

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Button } from '@/components/ui/Button';

export function Step1Guardian() {
    const { data, setData, nextStep } = useOnboardingStore();

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex-1 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">닉네임</label>
                    <input
                        type="text"
                        value={data.nickname || ''}
                        onChange={(e) => setData({ nickname: e.target.value })}
                        placeholder="호두 아빠"
                        className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">한 줄 소개</label>
                    <textarea
                        value={data.bio || ''}
                        onChange={(e) => setData({ bio: e.target.value })}
                        placeholder="주말 오전에 한강공원 산책하는 걸 좋아해요."
                        className="w-full p-4 h-32 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                </div>
            </div>

            <div className="pt-8">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={nextStep}
                    disabled={!data.nickname}
                >
                    다음으로
                </Button>
            </div>
        </div>
    );
}
