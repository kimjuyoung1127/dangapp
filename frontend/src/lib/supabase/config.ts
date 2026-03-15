const MISSING_ENV_MESSAGE =
    "Supabase 환경변수가 설정되지 않았습니다. frontend/.env.local의 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인한 뒤 개발 서버를 다시 시작해 주세요.";

function assertEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY", value?: string) {
    if (!value || value.includes("placeholder")) {
        throw new Error(`${MISSING_ENV_MESSAGE} 누락 항목: ${name}`);
    }

    return value;
}

export function getSupabasePublicEnv() {
    return {
        supabaseUrl: assertEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
        supabaseAnonKey: assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    };
}
