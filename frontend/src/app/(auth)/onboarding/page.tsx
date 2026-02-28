"use client";

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { OnboardingLayout } from '@/components/features/onboarding/OnboardingLayout';
import { Step1Guardian } from '@/components/features/onboarding/Step1Guardian';
import { Step2DogInfo } from '@/components/features/onboarding/Step2DogInfo';
import { Step3DogAge } from '@/components/features/onboarding/Step3DogAge';
import { Step4DogTemperament } from '@/components/features/onboarding/Step4DogTemperament';
import { Step5DogPhoto } from '@/components/features/onboarding/Step5DogPhoto';
import { Step6Location } from '@/components/features/onboarding/Step6Location';
import { Step7ActivityTimes } from '@/components/features/onboarding/Step7ActivityTimes';

export default function OnboardingPage() {
    const { step } = useOnboardingStore();

    const renderStep = () => {
        switch (step) {
            case 1:
                return {
                    title: "프로필 만들기",
                    subtitle: "보호자님의 정보를 입력해주세요.",
                    component: <Step1Guardian />
                };
            case 2:
                return {
                    title: "반려견 정보",
                    subtitle: "사랑스러운 나의 강아지를 소개해주세요.",
                    component: <Step2DogInfo />
                };
            case 3:
                return {
                    title: "강아지 나이",
                    subtitle: "비슷한 나이대의 친구를 추천해드려요.",
                    component: <Step3DogAge />
                };
            case 4:
                return {
                    title: "강아지 성향",
                    subtitle: "성향이 잘 맞는 찰떡궁합 친구를 찾아드려요.",
                    component: <Step4DogTemperament />
                };
            case 5:
                return {
                    title: "가장 맘에 드는 사진",
                    subtitle: "프로필에 첫번째로 보여질 얼굴이에요!",
                    component: <Step5DogPhoto />
                };
            case 6:
                return {
                    title: "동네 설정",
                    subtitle: "가까워서 만나기 편한 보호자를 찾아드릴게요.",
                    component: <Step6Location />
                };
            case 7:
                return {
                    title: "산책 시간",
                    subtitle: "내 라이프스타일과 겹치는 사람과 만나요.",
                    component: <Step7ActivityTimes />
                };
            default:
                return {
                    title: "",
                    component: null
                };
        }
    };

    const { title, subtitle, component } = renderStep();

    return (
        <OnboardingLayout title={title} subtitle={subtitle}>
            {component}
        </OnboardingLayout>
    );
}
