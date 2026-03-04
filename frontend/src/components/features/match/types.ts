// types.ts — Match 관련 타입 정의 (DANG-MAT-001)

export interface DogProfile {
    id: string;
    name: string;
    breed: string;
    age: number | null;
    weight_kg: number | null;
    temperament: string[];
    photo_urls: string[] | null;
    gender: "male" | "female" | null;
    neutered: boolean | null;
}

export interface MatchGuardianProfile {
    id: string;
    nickname: string;
    bio: string | null;
    address_name: string | null;
    usage_purpose: ("friend" | "care" | "family")[] | null;
    verified_region: boolean;
    onboarding_progress: number;
    users: { trust_score: number; trust_level: number } | null;
    dogs: DogProfile[];
    distance_meters?: number;
    compatibility_score?: number;
    time_overlap_score?: number; // Locked Decisions 연동
}
