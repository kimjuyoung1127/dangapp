// useFamily.ts — 패밀리 그룹 훅 모음 (DANG-MAT-001)
// useMode.ts의 family 관련 훅을 전용 파일로 re-export

export {
    useFamilyGroups,
    useCreateFamilyGroup,
    useAddFamilyMember,
    useFamilyMembers,
} from "@/lib/hooks/useMode";
