// useCare.ts — 돌봄 요청 훅 모음 (DANG-B2B-001)
// useMode.ts의 care 관련 훅을 전용 파일로 re-export

export {
    useCareRequests,
    useCreateCareRequest,
    useUpdateCareRequest,
} from "@/lib/hooks/useMode";
