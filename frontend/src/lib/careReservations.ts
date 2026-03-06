// File: Utility helpers for reservation mapping and create-input validation in care flow.
import type { Database } from "@/types/database.types";
import type { CreateReservationInput } from "@/lib/hooks/useCare";

type PartnerPlace = Database["public"]["Tables"]["partner_places"]["Row"];
type Reservation = Database["public"]["Tables"]["reservations"]["Row"];

export interface PartnerPlaceViewModel {
    id: string;
    name: string;
    category: string;
    addressName: string | null;
    description: string | null;
    amenities: string[];
    isVerified: boolean;
}

export interface ReservationViewModel extends Reservation {
    placeName: string;
}

export function toPartnerPlaceViewModels(
    places: PartnerPlace[]
): PartnerPlaceViewModel[] {
    return places.map((place) => ({
        id: place.id,
        name: place.name,
        category: place.category,
        addressName: place.address_name,
        description: place.description,
        amenities: place.amenities,
        isVerified: place.is_verified,
    }));
}

export function mapReservationsWithPlaceName(
    reservations: Reservation[],
    places: PartnerPlace[]
): ReservationViewModel[] {
    const placeNameMap = new Map<string, string>();
    for (const place of places) {
        placeNameMap.set(place.id, place.name);
    }

    return reservations.map((reservation) => ({
        ...reservation,
        placeName: placeNameMap.get(reservation.place_id) ?? "알 수 없는 장소",
    }));
}

export function validateCreateReservationInput(
    input: Partial<CreateReservationInput>
): { ok: true } | { ok: false; message: string } {
    if (!input.guardian_id) {
        return { ok: false, message: "보호자 정보가 없어 예약을 생성할 수 없습니다." };
    }
    if (!input.place_id) {
        return { ok: false, message: "예약할 장소를 선택해 주세요." };
    }
    if (!input.reserved_at) {
        return { ok: false, message: "예약 일시를 입력해 주세요." };
    }
    const reservedAtMillis = new Date(input.reserved_at).getTime();
    if (Number.isNaN(reservedAtMillis)) {
        return { ok: false, message: "예약 일시 형식이 올바르지 않습니다." };
    }

    if (typeof input.guest_count !== "number" || input.guest_count < 1) {
        return { ok: false, message: "인원은 1명 이상이어야 합니다." };
    }

    return { ok: true };
}
