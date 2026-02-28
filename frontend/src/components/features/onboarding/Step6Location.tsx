"use client";

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Button } from '@/components/ui/Button';

export function Step6Location() {
    const { data, setData, nextStep } = useOnboardingStore();

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex-1 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">주로 산책하는 지역</label>
                    <input
                        type="text"
                        value={data.address_name || ''}
                        onChange={(e) => setData({ address_name: e.target.value })}
                        placeholder="동/구 이름 검색 (예: 서초구 반포동)"
                        className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                    />
                    <p className="text-xs text-foreground-muted mt-2">정확한 주소가 아닌 동네 정보만 사용됩니다.</p>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-foreground">매칭 희망 반경</label>
                        <span className="text-primary font-semibold">{data.preferred_radius_km || 3}km</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={data.preferred_radius_km || 3}
                        onChange={(e) => setData({ preferred_radius_km: parseInt(e.target.value) })}
                        className="w-full accent-primary h-2 bg-border-default rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-foreground-muted">
                        <span>가까이 (1km)</span>
                        <span>멀리 (10km)</span>
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={nextStep}
                    disabled={!data.address_name}
                >
                    다음으로
                </Button>
            </div>
        </div>
    );
}
