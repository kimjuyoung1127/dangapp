// File: Client onboarding flow with guardian redirect guard and family-direction copy.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";
import { Step1Guardian } from "@/components/features/onboarding/Step1Guardian";
import { Step2DogInfo } from "@/components/features/onboarding/Step2DogInfo";
import { Step3DogAge } from "@/components/features/onboarding/Step3DogAge";
import { Step4DogTemperament } from "@/components/features/onboarding/Step4DogTemperament";
import { Step5DogPhoto } from "@/components/features/onboarding/Step5DogPhoto";
import { Step6Location } from "@/components/features/onboarding/Step6Location";
import { Step7ActivityTimes } from "@/components/features/onboarding/Step7ActivityTimes";
import { StepPhoneAuth } from "@/components/features/onboarding/StepPhoneAuth";
import { Skeleton } from "@/components/ui/Skeleton";
import { useExistingGuardian } from "@/lib/hooks/useOnboarding";
import { useOnboardingStore } from "@/stores/useOnboardingStore";

export default function OnboardingPage() {
    const router = useRouter();
    const { step } = useOnboardingStore();
    const { data: existingGuardian, isLoading } = useExistingGuardian();

    useEffect(() => {
        if (existingGuardian) {
            router.replace("/home");
        }
    }, [existingGuardian, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_40%,#f8fafc_100%)] px-6">
                <Skeleton className="h-2 w-full max-w-lg rounded-full" />
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-14 w-full max-w-lg rounded-2xl" />
                <Skeleton className="h-14 w-full max-w-lg rounded-2xl" />
                <Skeleton className="h-14 w-full max-w-lg rounded-2xl" />
            </div>
        );
    }

    if (existingGuardian) {
        return null;
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return {
                    title: "보호자 정보를 알려주세요",
                    subtitle: "기본 정보부터 정리해 두면 더 신뢰도 높은 매칭을 받을 수 있어요.",
                    component: <Step1Guardian />,
                };
            case 2:
                return {
                    title: "반려견을 소개해 주세요",
                    subtitle: "함께 산책할 친구가 성향을 더 잘 이해할 수 있게 도와줍니다.",
                    component: <Step2DogInfo />,
                };
            case 3:
                return {
                    title: "나이 정보를 입력해 주세요",
                    subtitle: "비슷한 활동량의 친구를 추천하는 데 사용됩니다.",
                    component: <Step3DogAge />,
                };
            case 4:
                return {
                    title: "성향을 알려주세요",
                    subtitle: "성향이 맞는 친구를 찾을수록 첫 만남이 더 편안해집니다.",
                    component: <Step4DogTemperament />,
                };
            case 5:
                return {
                    title: "대표 사진을 올려주세요",
                    subtitle: "프로필 첫인상을 정리해 두면 신뢰와 응답률이 좋아집니다.",
                    component: <Step5DogPhoto />,
                };
            case 6:
                return {
                    title: "본인 인증을 완료해 주세요",
                    subtitle: "안전한 연결을 위해 기본 인증을 먼저 확인합니다.",
                    component: <StepPhoneAuth />,
                };
            case 7:
                return {
                    title: "동네를 설정해 주세요",
                    subtitle: "가까운 거리에서 만날 수 있는 보호자를 우선으로 찾습니다.",
                    component: <Step6Location />,
                };
            case 8:
                return {
                    title: "활동 시간을 알려주세요",
                    subtitle: "일정이 맞는 보호자와 자연스럽게 연결되도록 돕습니다.",
                    component: <Step7ActivityTimes />,
                };
            default:
                return { title: "", subtitle: "", component: null };
        }
    };

    const { title, subtitle, component } = renderStep();

    return (
        <OnboardingLayout title={title} subtitle={subtitle}>
            {component}
        </OnboardingLayout>
    );
}
