'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const host = window.location.hostname;
        if (host !== 'localhost' && host !== '127.0.0.1') return;
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker
            .getRegistrations()
            .then((registrations) => {
                registrations.forEach((registration) => {
                    registration.unregister();
                });
            })
            .catch((error) => {
                console.warn('[pwa] failed to unregister service workers on local host', error);
            });

        if ('caches' in window) {
            caches
                .keys()
                .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
                .catch((error) => {
                    console.warn('[pwa] failed to clear caches on local host', error);
                });
        }
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
