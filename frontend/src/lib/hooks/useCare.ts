// File: Care hooks for reservations flow and legacy care-request compatibility.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

export {
    useCareRequests,
    useCreateCareRequest,
    useUpdateCareRequest,
    useCaregiverOptions,
} from "@/lib/hooks/useMode";

type PartnerPlace = Database["public"]["Tables"]["partner_places"]["Row"];
type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
type ReservationInsert = Database["public"]["Tables"]["reservations"]["Insert"];

export interface CreateReservationInput {
    guardian_id: string;
    place_id: string;
    reserved_at: string;
    guest_count: number;
    request_memo?: string | null;
    dog_id?: string | null;
}

const partnerPlacesQueryKey = ["partner-places"] as const;
const myReservationsQueryKey = (guardianId: string) =>
    ["my-reservations", guardianId] as const;

export function usePartnerPlaces() {
    const supabase = createClient();

    return useQuery({
        queryKey: partnerPlacesQueryKey,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("partner_places")
                .select("*")
                .order("is_verified", { ascending: false })
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data ?? []) as PartnerPlace[];
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}

export function useMyReservations(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: myReservationsQueryKey(guardianId),
        queryFn: async () => {
            if (!guardianId) return [] as Reservation[];

            const { data, error } = await supabase
                .from("reservations")
                .select("*")
                .eq("guardian_id", guardianId)
                .order("reserved_at", { ascending: false });

            if (error) throw error;
            return (data ?? []) as Reservation[];
        },
        enabled: !!guardianId,
        staleTime: 20 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false,
    });
}

export function useCreateReservation() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateReservationInput) => {
            const insertPayload: ReservationInsert = {
                guardian_id: input.guardian_id,
                place_id: input.place_id,
                reserved_at: input.reserved_at,
                guest_count: input.guest_count,
                request_memo: input.request_memo ?? null,
                dog_id: input.dog_id ?? null,
                status: "pending",
            };

            const { data, error } = await supabase
                .from("reservations")
                .insert(insertPayload)
                .select("*")
                .single();

            if (error) throw error;
            return data as Reservation;
        },
        onSuccess: (created) => {
            queryClient.invalidateQueries({
                queryKey: myReservationsQueryKey(created.guardian_id),
            });
        },
    });
}
