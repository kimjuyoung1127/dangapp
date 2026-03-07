# Code-Doc Alignment Report

Generated: 2026-03-06

## Summary

- **Total Code Files Analyzed**: 105
- **Files Referenced in Docs**: 34
- **Coverage**: 32%

| Category | Count | Important |
|----------|-------|-----------|
| Untracked | 71 | 49 |
| Orphan | 0 | 0 |
| Mock Residue | 3 | 3 |

## Key Findings

### 1. Untracked Files (Code not mentioned in docs)

**Important Untracked** (49 files):

- `app/(auth)/login/page.tsx`
- `app/(auth)/onboarding/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(main)/care/page.tsx`
- `app/(main)/chat/[id]/page.tsx`
- `app/(main)/chat/page.tsx`
- `app/(main)/danglog/[id]/page.tsx`
- `app/(main)/danglog/page.tsx`
- `app/(main)/family/page.tsx`
- `app/(main)/home/page.tsx`
- `app/(main)/modes/page.tsx`
- `app/(main)/profile/page.tsx`
- `app/(main)/schedules/page.tsx`
- `components/features/care/CareRequestCard.tsx`
- `components/features/care/CareRequestForm.tsx`
- `components/features/care/CareRequestList.tsx`
- `components/features/care/CareTypeSelect.tsx`
- `components/features/danglog/ActivityTypeSelect.tsx`
- `components/features/danglog/CommentSection.tsx`
- `components/features/danglog/DangLogCard.tsx`
- `components/features/danglog/DangLogEditor.tsx`
- `components/features/danglog/ImageUploader.tsx`
- `components/features/family/FamilyGroupCard.tsx`
- `components/features/family/FamilyGroupForm.tsx`
- `components/features/family/FamilyMemberList.tsx`
- `components/features/family/SharedScheduleList.tsx`
- `components/features/modes/ModeCard.tsx`
- `components/features/modes/ModeUnlockDialog.tsx`
- `components/features/onboarding/OnboardingLayout.tsx`
- `components/features/onboarding/Step1Guardian.tsx`
- `components/features/onboarding/Step2DogInfo.tsx`
- `components/features/onboarding/Step3DogAge.tsx`
- `components/features/onboarding/Step4DogTemperament.tsx`
- `components/features/onboarding/Step5DogPhoto.tsx`
- `components/features/onboarding/Step6Location.tsx`
- `components/features/onboarding/Step7ActivityTimes.tsx`
- `components/features/onboarding/StepPhoneAuth.tsx`
- `components/features/profile/ProfileHeader.tsx`
- `components/features/profile/ProfileStats.tsx`
- `components/features/profile/TrustBadgeList.tsx`
- `components/features/profile/TrustScoreDisplay.tsx`
- `components/features/review/ReviewCard.tsx`
- `components/features/review/ReviewForm.tsx`
- `components/features/review/ReviewList.tsx`
- `components/features/review/ReviewTagSelect.tsx`
- `components/features/review/StarRating.tsx`
- `lib/hooks/useReview.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`

### 2. Orphan References (Docs reference non-existent files)

**Important Orphan** (0 files):

- None found (good!)

### 3. Mock/Stub Residue (Files with mock patterns)

**Important Mock Residue** (3 files):

- `lib/hooks/useCare.ts`
- `lib/hooks/useFamily.ts`
- `lib/hooks/useMode.ts`

## Untracked Files (Complete List)

All 71 files not mentioned in any docs:


- `app/(auth)/AuthEntryCard.tsx` [util/support]
- `app/(auth)/login/page.tsx` [IMPORTANT]
- `app/(auth)/onboarding/page.tsx` [IMPORTANT]
- `app/(auth)/register/page.tsx` [IMPORTANT]
- `app/(main)/care/page.tsx` [IMPORTANT]
- `app/(main)/chat/[id]/page.tsx` [IMPORTANT]
- `app/(main)/chat/page.tsx` [IMPORTANT]
- `app/(main)/danglog/[id]/page.tsx` [IMPORTANT]
- `app/(main)/danglog/page.tsx` [IMPORTANT]
- `app/(main)/error.tsx` [util/support]
- `app/(main)/family/page.tsx` [IMPORTANT]
- `app/(main)/home/page.tsx` [IMPORTANT]
- `app/(main)/modes/page.tsx` [IMPORTANT]
- `app/(main)/profile/page.tsx` [IMPORTANT]
- `app/(main)/schedules/page.tsx` [IMPORTANT]
- `app/error.tsx` [util/support]
- `app/layout.tsx` [util/support]
- `components/features/care/CareRequestCard.tsx` [IMPORTANT]
- `components/features/care/CareRequestForm.tsx` [IMPORTANT]
- `components/features/care/CareRequestList.tsx` [IMPORTANT]
- `components/features/care/CareTypeSelect.tsx` [IMPORTANT]
- `components/features/danglog/ActivityTypeSelect.tsx` [IMPORTANT]
- `components/features/danglog/CommentSection.tsx` [IMPORTANT]
- `components/features/danglog/DangLogCard.tsx` [IMPORTANT]
- `components/features/danglog/DangLogEditor.tsx` [IMPORTANT]
- `components/features/danglog/ImageUploader.tsx` [IMPORTANT]
- `components/features/family/FamilyGroupCard.tsx` [IMPORTANT]
- `components/features/family/FamilyGroupForm.tsx` [IMPORTANT]
- `components/features/family/FamilyMemberList.tsx` [IMPORTANT]
- `components/features/family/SharedScheduleList.tsx` [IMPORTANT]
- `components/features/modes/ModeCard.tsx` [IMPORTANT]
- `components/features/modes/ModeUnlockDialog.tsx` [IMPORTANT]
- `components/features/onboarding/OnboardingLayout.tsx` [IMPORTANT]
- `components/features/onboarding/Step1Guardian.tsx` [IMPORTANT]
- `components/features/onboarding/Step2DogInfo.tsx` [IMPORTANT]
- `components/features/onboarding/Step3DogAge.tsx` [IMPORTANT]
- `components/features/onboarding/Step4DogTemperament.tsx` [IMPORTANT]
- `components/features/onboarding/Step5DogPhoto.tsx` [IMPORTANT]
- `components/features/onboarding/Step6Location.tsx` [IMPORTANT]
- `components/features/onboarding/Step7ActivityTimes.tsx` [IMPORTANT]
- `components/features/onboarding/StepPhoneAuth.tsx` [IMPORTANT]
- `components/features/profile/ProfileHeader.tsx` [IMPORTANT]
- `components/features/profile/ProfileStats.tsx` [IMPORTANT]
- `components/features/profile/TrustBadgeList.tsx` [IMPORTANT]
- `components/features/profile/TrustScoreDisplay.tsx` [IMPORTANT]
- `components/features/review/ReviewCard.tsx` [IMPORTANT]
- `components/features/review/ReviewForm.tsx` [IMPORTANT]
- `components/features/review/ReviewList.tsx` [IMPORTANT]
- `components/features/review/ReviewTagSelect.tsx` [IMPORTANT]
- `components/features/review/StarRating.tsx` [IMPORTANT]
- `components/providers/Providers.tsx` [util/support]
- `components/shared/AppShell.tsx` [util/support]
- `components/ui/Button.tsx` [util/support]
- `components/ui/DebugNavigator.tsx` [util/support]
- `components/ui/MotionWrappers.tsx` [util/support]
- `components/ui/Skeleton.tsx` [util/support]
- `components/ui/ToggleChip.tsx` [util/support]
- `lib/authConsent.ts` [util/support]
- `lib/careReservations.ts` [util/support]
- `lib/constants/breeds.ts` [util/support]
- `lib/constants/modes.ts` [util/support]
- `lib/constants/reviews.ts` [util/support]
- `lib/familyOverview.ts` [util/support]
- `lib/hooks/useReview.ts` [IMPORTANT]
- `lib/modesProgress.ts` [util/support]
- `lib/scheduleResponse.ts` [util/support]
- `lib/schemas/onboarding.ts` [util/support]
- `lib/supabase/client.ts` [IMPORTANT]
- `lib/supabase/server.ts` [IMPORTANT]
- `lib/utils/index.ts` [util/support]
- `lib/utils/mappers.ts` [util/support]

## Recommendations

1. **Untracked Pages**: Pages in `app/*/page.tsx` should be documented in daily logs and skill matrix
2. **Orphan Orphans**: Remove orphan references or verify files need to be created
3. **Mock Cleanup**: No significant mock residue found (good state)

## Notes

- Test files (*.test.ts, *.test.tsx) excluded from analysis
- Focus on major files in app/, lib/hooks/, lib/api/, stores/, and feature components
- Daily logs and STATUS docs are primary source of truth for feature tracking

---

**Counts for Summary:**
- untracked=71
- orphan=0
- mock_residue=3
