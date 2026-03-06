// File: Unit tests for auth consent cookie parsing and consent log row creation.
import { describe, expect, it } from "vitest";
import {
    buildAuthConsentCookie,
    buildConsentLogRows,
    createAuthConsentPayload,
    hasRequiredConsents,
    parseAuthConsentPayload,
} from "@/lib/authConsent";

describe("authConsent helpers", () => {
    it("creates and parses a consent payload cookie", () => {
        const payload = createAuthConsentPayload({
            source: "login",
            terms: true,
            privacy: true,
            location: false,
            marketing: false,
        });
        const cookie = buildAuthConsentCookie(payload);
        const rawValue = cookie.split(";")[0].split("=")[1];

        const parsed = parseAuthConsentPayload(rawValue);

        expect(parsed).not.toBeNull();
        expect(parsed?.source).toBe("login");
        expect(parsed?.terms).toBe(true);
        expect(parsed?.privacy).toBe(true);
    });

    it("rejects malformed cookie payloads", () => {
        expect(parseAuthConsentPayload(undefined)).toBeNull();
        expect(parseAuthConsentPayload("not-json")).toBeNull();
        expect(parseAuthConsentPayload(encodeURIComponent("{}"))).toBeNull();
    });

    it("checks required consents correctly", () => {
        const required = createAuthConsentPayload({
            source: "register",
            terms: true,
            privacy: true,
            location: false,
            marketing: false,
        });
        const missing = createAuthConsentPayload({
            source: "register",
            terms: false,
            privacy: true,
            location: false,
            marketing: true,
        });

        expect(hasRequiredConsents(required)).toBe(true);
        expect(hasRequiredConsents(missing)).toBe(false);
    });

    it("builds 4 consent log rows with all consent types", () => {
        const payload = createAuthConsentPayload({
            source: "login",
            terms: true,
            privacy: true,
            location: true,
            marketing: false,
        });

        const rows = buildConsentLogRows("user-1", payload);
        const types = rows.map((row) => row.consent_type).sort();

        expect(rows).toHaveLength(4);
        expect(types).toEqual(["location", "marketing", "privacy", "terms"]);
        expect(rows.every((row) => row.user_id === "user-1")).toBe(true);
    });
});
