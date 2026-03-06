// File: Pure helpers for computing care/family progress badges on the modes page.
export type ModeProgressTone = "good" | "neutral" | "warning";

export interface ModeProgressSummary {
    title: string;
    tone: ModeProgressTone;
    message: string;
}

export interface CareProgressInput {
    hasError: boolean;
    placesCount: number;
    reservationsCount: number;
    pendingReservationsCount: number;
}

export interface FamilyProgressInput {
    hasError: boolean;
    ownershipCount: number;
    participantsCount: number;
    acceptedParticipantsCount: number;
}

export function summarizeCareProgress(input: CareProgressInput): ModeProgressSummary {
    if (input.hasError) {
        return {
            title: "주의",
            tone: "warning",
            message: "돌봄 데이터를 불러오지 못했습니다. 다시 시도해 주세요.",
        };
    }

    if (input.placesCount === 0) {
        return {
            title: "주의",
            tone: "warning",
            message: "연결된 파트너 장소가 없어 예약 생성이 제한됩니다.",
        };
    }

    if (input.reservationsCount === 0) {
        return {
            title: "진행중",
            tone: "neutral",
            message: "장소 확인 완료. 첫 예약을 생성하면 케어 플로우가 활성화됩니다.",
        };
    }

    if (input.pendingReservationsCount > 0) {
        return {
            title: "활성",
            tone: "good",
            message: `대기 중 예약 ${input.pendingReservationsCount}건이 있습니다.`,
        };
    }

    return {
        title: "안정",
        tone: "good",
        message: "예약 이력이 확인되어 케어 플로우가 정상 동작 중입니다.",
    };
}

export function summarizeFamilyProgress(input: FamilyProgressInput): ModeProgressSummary {
    if (input.hasError) {
        return {
            title: "주의",
            tone: "warning",
            message: "패밀리 데이터를 불러오지 못했습니다. 다시 시도해 주세요.",
        };
    }

    if (input.ownershipCount === 0 && input.participantsCount === 0) {
        return {
            title: "진행중",
            tone: "neutral",
            message: "공동 양육/공유 일정 데이터가 아직 없습니다.",
        };
    }

    if (input.acceptedParticipantsCount > 0) {
        return {
            title: "활성",
            tone: "good",
            message: `수락된 공유 일정 ${input.acceptedParticipantsCount}건이 있습니다.`,
        };
    }

    return {
        title: "진행중",
        tone: "neutral",
        message: "기본 데이터는 연결되었고 공유 일정 참여를 확장할 수 있습니다.",
    };
}

export function getProgressToneClasses(tone: ModeProgressTone): string {
    if (tone === "good") return "bg-green-50 text-green-700";
    if (tone === "warning") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
}
