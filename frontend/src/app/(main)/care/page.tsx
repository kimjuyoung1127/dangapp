// File: Family-direction care page with reservations-first flow and legacy request fallback.
"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import {
    FamilyEmptyPanel,
    FamilyPageIntro,
    FamilySectionTitle,
    FamilyStatusChip,
    FamilySurface,
} from "@/components/shared/FamilyUi";
import { BottomSheet, TapScale } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import CareRequestForm from "@/components/features/care/CareRequestForm";
import CareRequestList from "@/components/features/care/CareRequestList";
import {
    mapReservationsWithPlaceName,
    toPartnerPlaceViewModels,
    validateCreateReservationInput,
    type ReservationViewModel,
} from "@/lib/careReservations";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import {
    useCareRequests,
    useCaregiverOptions,
    useCreateReservation,
    useMyReservations,
    usePartnerPlaces,
} from "@/lib/hooks/useCare";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
type CareTab = "reservations" | "legacy";
type LegacyTab = "sent" | "received";

const RESERVATION_STATUS_LABELS: Record<Reservation["status"], string> = {
    pending: "대기 중",
    confirmed: "확정",
    completed: "완료",
    cancelled: "취소",
};

const RESERVATION_STATUS_TONES: Record<
    Reservation["status"],
    "warning" | "success" | "default" | "danger"
> = {
    pending: "warning",
    confirmed: "success",
    completed: "default",
    cancelled: "danger",
};

export default function CarePage() {
    const [activeTab, setActiveTab] = useState<CareTab>("reservations");
    const [legacyTab, setLegacyTab] = useState<LegacyTab>("sent");
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState("");
    const [selectedDogId, setSelectedDogId] = useState("");
    const [reservedAtInput, setReservedAtInput] = useState("");
    const [guestCountInput, setGuestCountInput] = useState(1);
    const [requestMemo, setRequestMemo] = useState("");
    const [localCreatedReservations, setLocalCreatedReservations] = useState<Reservation[]>([]);

    const [isLegacyFormOpen, setIsLegacyFormOpen] = useState(false);
    const [selectedCaregiverId, setSelectedCaregiverId] = useState("");

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";
    const guardianDogs = useMemo(() => {
        const rawDogs = (guardian as { dogs?: Array<{ id: string; name?: string | null }> } | null)?.dogs;
        return Array.isArray(rawDogs) ? rawDogs : [];
    }, [guardian]);

    const {
        data: places = [],
        isLoading: isPlacesLoading,
        isError: isPlacesError,
        refetch: refetchPlaces,
    } = usePartnerPlaces();
    const {
        data: reservations = [],
        isLoading: isReservationsLoading,
        isError: isReservationsError,
        refetch: refetchReservations,
        isFetching: isReservationsFetching,
    } = useMyReservations(guardianId);
    const createReservation = useCreateReservation();

    const {
        data: legacyRequests = [],
        isLoading: isLegacyLoading,
        isError: isLegacyError,
        isFetching: isLegacyFetching,
        refetch: refetchLegacy,
    } = useCareRequests(guardianId, legacyTab);
    const { data: caregiverOptions = [] } = useCaregiverOptions(guardianId);

    const placeViewModels = useMemo(() => toPartnerPlaceViewModels(places), [places]);

    const mergedReservations = useMemo(() => {
        const uniqueMap = new Map<string, Reservation>();
        for (const reservation of localCreatedReservations) uniqueMap.set(reservation.id, reservation);
        for (const reservation of reservations) uniqueMap.set(reservation.id, reservation);
        return Array.from(uniqueMap.values());
    }, [localCreatedReservations, reservations]);

    const reservationViewModels = useMemo<ReservationViewModel[]>(
        () => mapReservationsWithPlaceName(mergedReservations, places),
        [mergedReservations, places]
    );

    useEffect(() => {
        if (selectedPlaceId || placeViewModels.length === 0) return;
        setSelectedPlaceId(placeViewModels[0].id);
    }, [placeViewModels, selectedPlaceId]);

    useEffect(() => {
        if (selectedDogId || guardianDogs.length === 0) return;
        setSelectedDogId(guardianDogs[0].id);
    }, [guardianDogs, selectedDogId]);

    useEffect(() => {
        if (selectedCaregiverId || caregiverOptions.length === 0) return;
        setSelectedCaregiverId(caregiverOptions[0].id);
    }, [caregiverOptions, selectedCaregiverId]);

    useEffect(() => {
        if (!flashMessage) return;
        const timer = window.setTimeout(() => setFlashMessage(null), 2400);
        return () => window.clearTimeout(timer);
    }, [flashMessage]);

    const handleCreateReservation = async () => {
        const validationResult = validateCreateReservationInput({
            guardian_id: guardianId,
            place_id: selectedPlaceId,
            reserved_at: reservedAtInput,
            guest_count: guestCountInput,
            request_memo: requestMemo,
            dog_id: selectedDogId || null,
        });

        if (!validationResult.ok) {
            setFlashMessage(validationResult.message);
            return;
        }

        try {
            const created = await createReservation.mutateAsync({
                guardian_id: guardianId,
                place_id: selectedPlaceId,
                reserved_at: new Date(reservedAtInput).toISOString(),
                guest_count: guestCountInput,
                request_memo: requestMemo || null,
                dog_id: selectedDogId || null,
            });

            setLocalCreatedReservations((prev) => [created, ...prev]);
            setIsReservationFormOpen(false);
            setReservedAtInput("");
            setGuestCountInput(1);
            setRequestMemo("");
            setFlashMessage("예약을 생성했어요.");
        } catch {
            setFlashMessage("예약 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    return (
        <AppShell>
            <div className="space-y-5 px-4 py-6">
                <FamilyPageIntro
                    eyebrow="care mode"
                    title="돌봄 예약"
                    description="장소 신뢰도, 예약 상태, 다음 행동을 한 화면에서 정리해 보세요."
                    action={
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsReservationFormOpen(true)}
                            disabled={!guardianId || placeViewModels.length === 0}
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            예약 추가
                        </Button>
                    }
                />

                <div className="flex flex-wrap items-center gap-2">
                    <TabButton
                        active={activeTab === "reservations"}
                        label="예약"
                        onClick={() => setActiveTab("reservations")}
                    />
                    <TabButton
                        active={activeTab === "legacy"}
                        label="기존 요청"
                        onClick={() => setActiveTab("legacy")}
                    />
                    {(isReservationsFetching && activeTab === "reservations") ||
                    (isLegacyFetching && activeTab === "legacy") ? (
                        <span className="text-xs text-foreground-muted">동기화 중...</span>
                    ) : null}
                </div>

                {activeTab === "reservations" ? (
                    <div className="space-y-5">
                        <FamilySurface tone="soft" className="space-y-4">
                            <FamilySectionTitle
                                title="파트너 장소"
                                meta="검증된 장소와 편의 시설을 먼저 확인한 뒤 예약을 생성하세요."
                            />

                            {isPlacesLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-24 w-full rounded-[1.5rem]" />
                                    <Skeleton className="h-24 w-full rounded-[1.5rem]" />
                                </div>
                            ) : null}

                            {isPlacesError && !isPlacesLoading ? (
                                <FamilyEmptyPanel
                                    message="파트너 장소를 불러오지 못했습니다."
                                    action={
                                        <button
                                            type="button"
                                            className="text-sm font-semibold text-sky-700"
                                            onClick={() => {
                                                void refetchPlaces();
                                            }}
                                        >
                                            장소 다시 불러오기
                                        </button>
                                    }
                                />
                            ) : null}

                            {!isPlacesLoading && !isPlacesError && placeViewModels.length === 0 ? (
                                <FamilyEmptyPanel message="등록된 파트너 장소가 아직 없습니다." />
                            ) : null}

                            {!isPlacesLoading && !isPlacesError && placeViewModels.length > 0 ? (
                                <div className="space-y-3">
                                    {placeViewModels.map((place) => (
                                        <FamilySurface key={place.id} className="space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-base font-semibold text-foreground">
                                                        {place.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-foreground-muted">
                                                        {place.category}
                                                        {place.addressName ? ` · ${place.addressName}` : ""}
                                                    </p>
                                                </div>
                                                {place.isVerified ? (
                                                    <FamilyStatusChip label="검증됨" tone="success" />
                                                ) : null}
                                            </div>

                                            {place.amenities.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {place.amenities.map((amenity) => (
                                                        <span
                                                            key={amenity}
                                                            className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700"
                                                        >
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}

                                            {place.description ? (
                                                <p className="text-sm leading-6 text-foreground-muted">
                                                    {place.description}
                                                </p>
                                            ) : null}
                                        </FamilySurface>
                                    ))}
                                </div>
                            ) : null}
                        </FamilySurface>

                        <FamilySurface className="space-y-4">
                            <FamilySectionTitle
                                title="나의 예약"
                                meta="날짜, 상태, 메모 순서로 확인할 수 있게 정리했습니다."
                            />

                            {isReservationsLoading && reservationViewModels.length === 0 ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-24 w-full rounded-[1.5rem]" />
                                    <Skeleton className="h-24 w-full rounded-[1.5rem]" />
                                </div>
                            ) : null}

                            {isReservationsError && reservationViewModels.length === 0 ? (
                                <FamilyEmptyPanel
                                    message="예약 목록을 불러오지 못했습니다."
                                    action={
                                        <button
                                            type="button"
                                            className="text-sm font-semibold text-sky-700"
                                            onClick={() => {
                                                void refetchReservations();
                                            }}
                                        >
                                            예약 다시 불러오기
                                        </button>
                                    }
                                />
                            ) : null}

                            {!isReservationsLoading &&
                            !isReservationsError &&
                            reservationViewModels.length === 0 ? (
                                <FamilyEmptyPanel message="아직 생성한 예약이 없습니다." />
                            ) : null}

                            {reservationViewModels.length > 0 ? (
                                <div className="space-y-3">
                                    {reservationViewModels.map((reservation) => (
                                        <FamilySurface key={reservation.id} className="space-y-3" tone="soft">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-base font-semibold text-foreground">
                                                        {reservation.placeName}
                                                    </p>
                                                    <p className="mt-1 text-xs text-foreground-muted">
                                                        생성일 {new Date(reservation.created_at).toLocaleString("ko-KR")}
                                                    </p>
                                                </div>
                                                <FamilyStatusChip
                                                    label={RESERVATION_STATUS_LABELS[reservation.status]}
                                                    tone={RESERVATION_STATUS_TONES[reservation.status]}
                                                />
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-[1.25rem] bg-white px-3 py-3">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                                                        예약 일시
                                                    </p>
                                                    <p className="mt-2 text-sm font-medium text-foreground">
                                                        {new Date(reservation.reserved_at).toLocaleString("ko-KR")}
                                                    </p>
                                                </div>
                                                <div className="rounded-[1.25rem] bg-white px-3 py-3">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                                                        인원
                                                    </p>
                                                    <p className="mt-2 text-sm font-medium text-foreground">
                                                        {reservation.guest_count}명
                                                    </p>
                                                </div>
                                            </div>

                                            {reservation.request_memo ? (
                                                <div className="rounded-[1.25rem] bg-white px-3 py-3">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                                                        요청 메모
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-foreground-muted">
                                                        {reservation.request_memo}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </FamilySurface>
                                    ))}
                                </div>
                            ) : null}
                        </FamilySurface>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <FamilySurface tone="soft" className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <TabButton
                                    active={legacyTab === "sent"}
                                    label="보낸 요청"
                                    onClick={() => setLegacyTab("sent")}
                                />
                                <TabButton
                                    active={legacyTab === "received"}
                                    label="받은 요청"
                                    onClick={() => setLegacyTab("received")}
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setIsLegacyFormOpen(true)}
                                    disabled={!guardianId}
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    요청 작성
                                </Button>
                            </div>
                            <CareRequestList
                                requests={legacyRequests}
                                isLoading={isLegacyLoading}
                                isError={isLegacyError}
                                onRetry={() => {
                                    void refetchLegacy();
                                }}
                            />
                        </FamilySurface>
                    </div>
                )}
            </div>

            {guardian ? (
                <BottomSheet isOpen={isReservationFormOpen} onClose={() => setIsReservationFormOpen(false)}>
                    <div className="space-y-4 p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">예약 생성</h3>
                                <p className="mt-1 text-sm text-foreground-muted">
                                    일정과 동행 정보를 함께 남겨 두세요.
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleCreateReservation}
                                disabled={createReservation.isPending}
                            >
                                {createReservation.isPending ? "생성 중" : "저장"}
                            </Button>
                        </div>

                        <FormField label="장소">
                            <select
                                value={selectedPlaceId}
                                onChange={(event) => setSelectedPlaceId(event.target.value)}
                                aria-label="예약 장소"
                                className="w-full rounded-[1rem] border border-sky-100 bg-sky-50/70 px-3 py-3 text-sm text-foreground outline-none"
                            >
                                <option value="">장소를 선택해 주세요.</option>
                                {placeViewModels.map((place) => (
                                    <option key={place.id} value={place.id}>
                                        {place.name}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="예약 일시">
                            <input
                                value={reservedAtInput}
                                onChange={(event) => setReservedAtInput(event.target.value)}
                                type="datetime-local"
                                aria-label="예약 일시"
                                className="w-full rounded-[1rem] border border-sky-100 bg-sky-50/70 px-3 py-3 text-sm text-foreground outline-none"
                            />
                        </FormField>

                        <FormField label="인원">
                            <input
                                value={guestCountInput}
                                onChange={(event) => setGuestCountInput(Number(event.target.value))}
                                type="number"
                                min={1}
                                aria-label="예약 인원"
                                className="w-full rounded-[1rem] border border-sky-100 bg-sky-50/70 px-3 py-3 text-sm text-foreground outline-none"
                            />
                        </FormField>

                        <FormField label="반려견 선택">
                            <select
                                value={selectedDogId}
                                onChange={(event) => setSelectedDogId(event.target.value)}
                                aria-label="반려견 선택"
                                className="w-full rounded-[1rem] border border-sky-100 bg-sky-50/70 px-3 py-3 text-sm text-foreground outline-none"
                            >
                                <option value="">선택 안 함</option>
                                {guardianDogs.map((dog) => (
                                    <option key={dog.id} value={dog.id}>
                                        {dog.name || dog.id}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="메모">
                            <textarea
                                value={requestMemo}
                                onChange={(event) => setRequestMemo(event.target.value)}
                                rows={3}
                                aria-label="예약 메모"
                                className="w-full resize-none rounded-[1rem] border border-sky-100 bg-sky-50/70 px-3 py-3 text-sm text-foreground outline-none"
                            />
                        </FormField>
                    </div>
                </BottomSheet>
            ) : null}

            {guardian && activeTab === "legacy" ? (
                <CareRequestForm
                    isOpen={isLegacyFormOpen}
                    onClose={() => setIsLegacyFormOpen(false)}
                    requesterId={guardian.id}
                    caregiverId={selectedCaregiverId}
                    caregiverOptions={caregiverOptions}
                    onCaregiverChange={setSelectedCaregiverId}
                    onSubmitError={setFlashMessage}
                    dogId={selectedDogId || undefined}
                />
            ) : null}

            {flashMessage ? (
                <div
                    className="fixed bottom-24 left-4 right-4 z-40 rounded-[1.25rem] border border-sky-200 bg-white px-4 py-3 text-sm text-foreground shadow-lg"
                    role="status"
                    aria-live="polite"
                >
                    {flashMessage}
                </div>
            ) : null}
        </AppShell>
    );
}

function TabButton({
    active,
    label,
    onClick,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <TapScale>
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    active ? "bg-sky-600 text-white" : "bg-white text-foreground-muted"
                )}
            >
                {label}
            </button>
        </TapScale>
    );
}

function FormField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{label}</label>
            {children}
        </div>
    );
}
