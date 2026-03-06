// File: OAuth callback route that validates consent cookie and writes consent logs.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
    AUTH_CONSENT_COOKIE,
    buildConsentLogRows,
    hasRequiredConsents,
    parseAuthConsentPayload,
} from "@/lib/authConsent";

function sanitizeNextPath(nextPath: string | null) {
    if (!nextPath) return "/home";
    if (!nextPath.startsWith("/")) return "/home";
    if (nextPath.startsWith("//")) return "/home";
    return nextPath;
}

function withRedirect(response: NextResponse, targetUrl: string) {
    response.headers.set("location", targetUrl);
    return response;
}

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const nextPath = sanitizeNextPath(searchParams.get("next"));

    const response = NextResponse.redirect(`${origin}${nextPath}`);
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                },
            },
        }
    );

    if (!code) {
        return withRedirect(response, `${origin}/login?error=missing-auth-code`);
    }

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
        return withRedirect(response, `${origin}/login?error=auth-code-error`);
    }

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        await supabase.auth.signOut();
        return withRedirect(response, `${origin}/login?error=auth-user-error`);
    }

    const consentPayload = parseAuthConsentPayload(request.cookies.get(AUTH_CONSENT_COOKIE)?.value);
    response.cookies.delete(AUTH_CONSENT_COOKIE);

    if (!hasRequiredConsents(consentPayload)) {
        await supabase.auth.signOut();
        return withRedirect(response, `${origin}/login?error=consent-required`);
    }

    const consentRows = buildConsentLogRows(user.id, consentPayload);
    const { error: consentError } = await supabase.from("consent_logs").insert(consentRows);

    if (consentError) {
        await supabase.auth.signOut();
        return withRedirect(response, `${origin}/login?error=consent-log-error`);
    }

    return response;
}
