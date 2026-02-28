import type { Metadata, Viewport } from 'next';
import { Sora, Noto_Sans_KR } from 'next/font/google';
import '@/styles/globals.css';
import { cn } from '@/lib/utils';

const sora = Sora({
    subsets: ['latin'],
    variable: '--font-sora',
    display: 'swap',
});

const notoSansKR = Noto_Sans_KR({
    subsets: ['latin'], // Noto Sans KR usually requires subsets: ['latin'] in next/font/google for Next.js, korean goes natively
    weight: ['300', '400', '500', '700'],
    variable: '--font-noto-sans-kr',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'DangGeting - 댕게팅',
    description: '신뢰 기반 반려견 보호자 매칭 & 커뮤니티 플랫폼',
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.ico',
        apple: '/icons/icon-192x192.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: '댕게팅',
    },
    openGraph: {
        title: 'DangGeting - 댕게팅',
        description: '신뢰 기반 반려견 보호자 매칭 & 커뮤니티 플랫폼',
        type: 'website',
        locale: 'ko_KR',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#FF6B35',
    viewportFit: 'cover',
};

import Providers from '@/components/providers/Providers';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" className={cn(sora.variable, notoSansKR.variable)}>
            <body className="font-body text-foreground bg-background antialiased min-h-screen">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
