// File: Care page with reservations-first flow and legacy care-request fallback tab.
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Plus } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { BottomSheet, TapScale } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
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
import CareRequestForm from "@/components/features/care/CareRequestForm";
import CareRequestList from "@/components/features/care/CareRequestList";
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

const RESERVATION_STATUS_COLORS: Record<Reservation["status"], string> = {
    pending: "text-amber-600 bg-amber-50",
    confirmed: "text-green-700 bg-green-50",
    completed: "text-primary bg-primary-light/20",
    cancelled: "text-foreground-muted bg-muted",
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
            setFlashMessage("예약이 생성되었습니다.");
        } catch {
            setFlashMessage("예약 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    const tabs: Array<{ key: CareTab; label: string }> = [
        { key: "reservations", label: "Reservations" },
        { key: "legacy", label: "Legacy requests" },
    ];

    return (
        <AppShell>
            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center gap-3">
                    <Link href="/modes">
                        <ArrowLeft className="h-5 w-5 text-foreground-muted" />
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-foreground">Care mode</h1>
                </div>

                <div role="tablist" className="flex items-center gap-2">
                    {tabs.map((tab) => (
                        <TapScale key={tab.key}>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                                    activeTab === tab.key
                                        ? "bg-foreground text-background"
                                        : "bg-muted text-foreground-muted hover:bg-muted/80"
                                )}
                            >
                                {tab.label}
                            </button>
                        </TapScale>
                    ))}
                    {(isReservationsFetching && activeTab === "reservations") ||
                    (isLegacyFetching && activeTab === "legacy") ? (
                        <span className="text-xs text-foreground-muted">refreshing...</span>
                    ) : null}
                </div>

                {activeTab === "reservations" ? (
                    <div className="space-y-6">
                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-foreground">파트너 장소</h2>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setIsReservationFormOpen(true)}
                                    disabled={!guardianId || placeViewModels.length === 0}
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    예약 추가
                                </Button>
                            </div>

                            {isPlacesLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                </div>
                            ) : null}

                            {isPlacesError && !isPlacesLoading ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    파트너 장소를 불러오지 못했습니다.
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            className="font-medium underline"
                                            onClick={() => {
                                                void refetchPlaces();
                                            }}
                                        >
                                            장소 다시 불러오기
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            {!isPlacesLoading && !isPlacesError && placeViewModels.length === 0 ? (
                                <p className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground-muted">
                                    등록된 파트너 장소가 없습니다.
                                </p>
                            ) : null}

                            {!isPlacesLoading && !isPlacesError && placeViewModels.length > 0 ? (
                                <div className="space-y-3">
                                    {placeViewModels.map((place) => (
                                        <article
                                            key={place.id}
                                            className="rounded-2xl border border-border bg-card p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-foreground">{place.name}</p>
                                                    <p className="text-xs text-foreground-muted">
                                                        {place.category} {place.addressName ? `· ${place.addressName}` : ""}
                                                    </p>
                                                </div>
                                                {place.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        verified
                                                    </span>
                                                ) : null}
                                            </div>
                                            {place.amenities.length > 0 ? (
                                                <p className="mt-2 text-xs text-foreground-muted">
                                                    편의시설: {place.amenities.join(", ")}
                                                </p>
                                            ) : null}
                                            {place.description ? (
                                                <p className="mt-2 text-sm text-foreground-muted">{place.description}</p>
                                            ) : null}
                                        </article>
                                    ))}
                                </div>
                            ) : null}
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-foreground">내 예약</h2>

                            {isReservationsLoading && reservationViewModels.length === 0 ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                </div>
                            ) : null}

                            {isReservationsError && reservationViewModels.length === 0 ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    예약 목록을 불러오지 못했습니다.
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            className="font-medium underline"
                                            onClick={() => {
                                                void refetchReservations();
                                            }}
                                        >
                                            예약 다시 불러오기
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            {!isReservationsLoading &&
                            !isReservationsError &&
                            reservationViewModels.length === 0 ? (
                                <p className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground-muted">
                                    아직 예약이 없습니다.
                                </p>
                            ) : null}

                            {reservationViewModels.length > 0 ? (
                                <div className="space-y-3">
                                    {reservationViewModels.map((reservation) => (
                                        <article
                                            key={reservation.id}
                                            className="rounded-2xl border border-border bg-card p-4"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-semibold text-foreground">
                                                    {reservation.placeName}
                                                </p>
                                                <span
                                                    className={cn(
                                                        "rounded-full px-2.5 py-1 text-xs font-medium",
                                                        RESERVATION_STATUS_COLORS[reservation.status]
                                                    )}
                                                >
                                                    {RESERVATION_STATUS_LABELS[reservation.status]}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-sm text-foreground-muted">
                                                <p>
                                                    예약일:{" "}
                                                    {new Date(reservation.reserved_at).toLocaleString("ko-KR")}
                                                </p>
                                                <p>
                                                    생성일:{" "}
                                                    {new Date(reservation.created_at).toLocaleString("ko-KR")}
                                                </p>
                                                <p>인원: {reservation.guest_count}명</p>
                                                {reservation.request_memo ? (
                                                    <p className="mt-1 line-clamp-2">{reservation.request_memo}</p>
                                                ) : null}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : null}
                        </section>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {(["sent", "received"] as LegacyTab[]).map((tab) => (
                                <TapScale key={tab}>
                                    <button
                                        type="button"
                                        onClick={() => setLegacyTab(tab)}
                                        className={cn(
                                            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                                            legacyTab === tab
                                                ? "bg-foreground text-background"
                                                : "bg-muted text-foreground-muted hover:bg-muted/80"
                                        )}
                                    >
                                        {tab === "sent" ? "Sent" : "Received"}
                                    </button>
                                </TapScale>
                            ))}
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
                    </div>
                )}
            </div>

            {guardian && (
                <BottomSheet
                    isOpen={isReservationFormOpen}
                    onClose={() => setIsReservationFormOpen(false)}
                >
                    <div className="space-y-4 p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">예약 생성</h3>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleCreateReservation}
                                disabled={createReservation.isPending}
                            >
                                {createReservation.isPending ? "생성 중..." : "저장"}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">장소</label>
                            <select
                                value={selectedPlaceId}
                                onChange={(event) => setSelectedPlaceId(event.target.value)}
                                aria-label="예약 장소"
                                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
                            >
                                <option value="">장소를 선택해 주세요</option>
                                {placeViewModels.map((place) => (
                                    <option key={place.id} value={place.id}>
                                        {place.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">예약 일시</label>
                            <input
                                value={reservedAtInput}
                                onChange={(event) => setReservedAtInput(event.target.value)}
                                type="datetime-local"
                                aria-label="예약 일시"
                                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">인원</label>
                            <input
                                value={guestCountInput}
                                onChange={(event) => setGuestCountInput(Number(event.target.value))}
                                type="number"
                                min={1}
                                aria-label="예약 인원"
                                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">반려견 선택</label>
                            <select
                                value={selectedDogId}
                                onChange={(event) => setSelectedDogId(event.target.value)}
                                aria-label="반려견 선택"
                                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
                            >
                                <option value="">선택 안 함</option>
                                {guardianDogs.map((dog) => (
                                    <option key={dog.id} value={dog.id}>
                                        {dog.name || dog.id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">메모 (선택)</label>
                            <textarea
                                value={requestMemo}
                                onChange={(event) => setRequestMemo(event.target.value)}
                                rows={3}
                                aria-label="예약 메모"
                                className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
                            />
                        </div>
                    </div>
                </BottomSheet>
            )}

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
                    className="fixed bottom-24 left-4 right-4 z-40 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="status"
                    aria-live="polite"
                >
                    {flashMessage}
                </div>
            ) : null}
        </AppShell>
    );
}
