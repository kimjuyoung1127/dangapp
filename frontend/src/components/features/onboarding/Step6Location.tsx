// Step6Location.tsx — 동네 설정 (address_name 필수, 나머지 선택) (DANG-ONB-001)

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { step6Schema, type Step6Data } from "@/lib/schemas/onboarding";
import { cn } from "@/lib/utils";

export function Step6Location() {
    const { data, setData, nextStep } = useOnboardingStore();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<Step6Data>({
        resolver: zodResolver(step6Schema),
        defaultValues: {
            address_name: data.address_name || "",
            verified_region: data.verified_region,
            preferred_radius_km: data.preferred_radius_km ?? 3,
        },
    });

    const radiusValue = watch("preferred_radius_km") ?? 3;
    const verifiedRegion = watch("verified_region");

    const handleVerifyLocation = () => {
        if (!navigator.geolocation) {
            alert("위치 정보를 지원하지 않는 브라우저입니다.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // 좌표를 스토어에 저장 (추후 매퍼에서 POINT 형식으로 변환)
                setData({ 
                    latitude, 
                    longitude,
                    verified_region: true 
                });
                setValue("verified_region", true);
                alert("위치 인증에 성공했습니다.");
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("위치 정보를 가져오는 데 실패했습니다. 직접 주소를 입력해 주세요.");
            }
        );
    };

    const onSubmit = (values: Step6Data) => {
        setData(values);
        nextStep();
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col h-full"
        >
            <div className="flex-1 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        주로 산책하는 지역 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("address_name")}
                        placeholder="동/구 이름 검색 (예: 서초구 반포동)"
                        className={cn(
                            "w-full px-4 h-14 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg",
                            errors.address_name ? "border-red-500" : "border-border"
                        )}
                    />
                    {errors.address_name ? (
                        <p className="text-sm text-red-500">{errors.address_name.message}</p>
                    ) : (
                        <p className="text-xs text-foreground-muted mt-2">
                            정확한 주소가 아닌 동네 정보만 사용됩니다.
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        지역 인증 <span className="text-foreground-muted text-xs">(선택)</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <ToggleChip
                            selected={verifiedRegion === true}
                            onClick={handleVerifyLocation}
                        >
                            현재 위치 인증
                        </ToggleChip>
                        <ToggleChip
                            selected={verifiedRegion === false}
                            onClick={() => setValue("verified_region", false)}
                        >
                            위치 재측정
                        </ToggleChip>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-foreground">
                            매칭 희망 반경 <span className="text-foreground-muted text-xs">(선택)</span>
                        </label>
                        <span className="text-primary font-semibold">{radiusValue}km</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        {...register("preferred_radius_km", { valueAsNumber: true })}
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
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={!watch("address_name")}
                >
                    다음으로
                </Button>
            </div>
        </form>
    );
}
