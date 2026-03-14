import { useQuery } from "@tanstack/react-query";
import type {
    CareDebugDemoPayload,
    FamilyDebugDemoPayload,
    HomeDebugDemoPayload,
    ModesDebugDemoPayload,
} from "@/lib/debugDemoFallback";
import { isDebugDemoFallbackEnabled } from "@/lib/debugDemoFallback";

async function fetchDebugDemo<T>(surface: "home" | "care" | "family" | "modes") {
    const response = await fetch(`/api/debug-demo-fallback?surface=${surface}`);
    if (response.status === 404) return null;
    if (!response.ok) {
        throw new Error(`debug demo fetch failed: ${surface}`);
    }
    return (await response.json()) as T;
}

function useDebugDemoQuery<T>(surface: "home" | "care" | "family" | "modes") {
    return useQuery({
        queryKey: ["debug-demo-fallback", surface],
        queryFn: () => fetchDebugDemo<T>(surface),
        enabled: isDebugDemoFallbackEnabled(),
        staleTime: 5 * 60 * 1000,
        retry: 0,
        refetchOnWindowFocus: false,
    });
}

export function useHomeDebugDemo() {
    return useDebugDemoQuery<HomeDebugDemoPayload>("home");
}

export function useCareDebugDemo() {
    return useDebugDemoQuery<CareDebugDemoPayload>("care");
}

export function useFamilyDebugDemo() {
    return useDebugDemoQuery<FamilyDebugDemoPayload>("family");
}

export function useModesDebugDemo() {
    return useDebugDemoQuery<ModesDebugDemoPayload>("modes");
}
