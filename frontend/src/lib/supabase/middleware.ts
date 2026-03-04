import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isMainApp = 
        request.nextUrl.pathname.startsWith('/home') ||
        request.nextUrl.pathname.startsWith('/chat') ||
        request.nextUrl.pathname.startsWith('/danglog') ||
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/schedules') ||
        request.nextUrl.pathname.startsWith('/modes') ||
        request.nextUrl.pathname.startsWith('/care') ||
        request.nextUrl.pathname.startsWith('/family');

    const isAuthPage = 
        request.nextUrl.pathname.startsWith('/login') || 
        request.nextUrl.pathname.startsWith('/register');

    const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');

    // 1. Redirect root to home/login
    if (request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = user ? '/home' : '/login'
        return NextResponse.redirect(url)
    }

    // 2. Protect main app routes
    if (!user && isMainApp) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 3. Handle Onboarding Check for logged-in users
    if (user && (isMainApp || isOnboardingPage)) {
        // Query onboarding status
        const { data: guardian } = await supabase
            .from('guardians')
            .select('onboarding_progress')
            .eq('user_id', user.id)
            .maybeSingle();

        const progress = guardian?.onboarding_progress ?? 0;

        if (progress < 100 && isMainApp) {
            // Force onboarding if incomplete
            const url = request.nextUrl.clone()
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }

        if (progress === 100 && isOnboardingPage) {
            // Skip onboarding if already done
            const url = request.nextUrl.clone()
            url.pathname = '/home'
            return NextResponse.redirect(url)
        }
    }

    // 4. Redirect logged-in users away from auth pages
    if (user && isAuthPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/home'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
