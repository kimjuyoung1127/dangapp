// File: Shared auth consent helpers for OAuth entry and callback consent logging.
import type { Database } from "@/types/database.types";

export const AUTH_CONSENT_COOKIE = "dang_auth_consent";
export const AUTH_CONSENT_POLICY_VERSION = "2026-03-06";
const CONSENT_COOKIE_TTL_SECONDS = 10 * 60;

export type AuthEntrySource = "login" | "register";
export type ConsentType = Database["public"]["Tables"]["consent_logs"]["Row"]["consent_type"];

export interface AuthConsentPayload {
    source: AuthEntrySource;
    policyVersion: string;
    capturedAt: string;
    terms: boolean;
    privacy: boolean;
    location: boolean;
    marketing: boolean;
}

interface CreateAuthConsentPayloadInput {
    source: AuthEntrySource;
    terms: boolean;
    privacy: boolean;
    location: boolean;
    marketing: boolean;
}

export function createAuthConsentPayload(
    input: CreateAuthConsentPayloadInput
): AuthConsentPayload {
    return {
        source: input.source,
        policyVersion: AUTH_CONSENT_POLICY_VERSION,
        capturedAt: new Date().toISOString(),
        terms: input.terms,
        privacy: input.privacy,
        location: input.location,
        marketing: input.marketing,
    };
}

export function buildAuthConsentCookie(payload: AuthConsentPayload) {
    const encoded = encodeURIComponent(JSON.stringify(payload));
    return `${AUTH_CONSENT_COOKIE}=${encoded}; Max-Age=${CONSENT_COOKIE_TTL_SECONDS}; Path=/; SameSite=Lax`;
}

export function parseAuthConsentPayload(rawValue: string | undefined): AuthConsentPayload | null {
    if (!rawValue) return null;

    try {
        const decoded = decodeURIComponent(rawValue);
        const parsed = JSON.parse(decoded) as Partial<AuthConsentPayload>;
        if (!parsed) return null;
        if (parsed.source !== "login" && parsed.source !== "register") return null;
        if (typeof parsed.policyVersion !== "string" || parsed.policyVersion.length === 0) return null;
        if (typeof parsed.capturedAt !== "string" || parsed.capturedAt.length === 0) return null;
        if (typeof parsed.terms !== "boolean") return null;
        if (typeof parsed.privacy !== "boolean") return null;
        if (typeof parsed.location !== "boolean") return null;
        if (typeof parsed.marketing !== "boolean") return null;

        return {
            source: parsed.source,
            policyVersion: parsed.policyVersion,
            capturedAt: parsed.capturedAt,
            terms: parsed.terms,
            privacy: parsed.privacy,
            location: parsed.location,
            marketing: parsed.marketing,
        };
    } catch {
        return null;
    }
}

export function hasRequiredConsents(
    payload: AuthConsentPayload | null
): payload is AuthConsentPayload {
    if (!payload) return false;
    return payload.terms && payload.privacy;
}

export function buildConsentLogRows(
    userId: string,
    payload: AuthConsentPayload
): Database["public"]["Tables"]["consent_logs"]["Insert"][] {
    const metadataBase = {
        source: payload.source,
        capturedAt: payload.capturedAt,
        policyVersion: payload.policyVersion,
    };

    const entries: Array<{ type: ConsentType; consented: boolean }> = [
        { type: "terms", consented: payload.terms },
        { type: "privacy", consented: payload.privacy },
        { type: "location", consented: payload.location },
        { type: "marketing", consented: payload.marketing },
    ];

    return entries.map((entry) => ({
        user_id: userId,
        consent_type: entry.type,
        consented: entry.consented,
        policy_version: payload.policyVersion,
        metadata: metadataBase,
    }));
}
