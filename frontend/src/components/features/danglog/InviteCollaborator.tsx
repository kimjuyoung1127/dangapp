// InviteCollaborator.tsx — 댕로그 공동기록 초대 컴포넌트 (DANG-DLG-001)

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient } from "@/lib/supabase/client";
import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserPlus, Check, X } from "lucide-react";
import type { Database } from "@/types/database.types";

type Guardian = Database["public"]["Tables"]["guardians"]["Row"];

interface InviteCollaboratorProps {
    isOpen: boolean;
    onClose: () => void;
    danglogId: string;
    inviterId: string;
}

// ─── 훅 ──────────────────────────────────

function useMatchedGuardians(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["matched-guardians", guardianId],
        queryFn: async () => {
            // 매칭된 상대방 목록 조회 (match_requests 테이블 기준)
            const { data, error } = await supabase
                .from("match_requests")
                .select("requester_id, receiver_id")
                .or(`requester_id.eq.${guardianId},receiver_id.eq.${guardianId}`)
                .eq("status", "accepted");

            if (error) throw error;

            const partnerIds = (data || []).map((row) =>
                row.requester_id === guardianId ? row.receiver_id : row.requester_id
            );

            if (partnerIds.length === 0) return [] as Guardian[];

            const { data: guardians, error: gError } = await supabase
                .from("guardians")
                .select("*")
                .in("id", partnerIds);

            if (gError) throw gError;
            return (guardians || []) as Guardian[];
        },
        enabled: !!guardianId,
    });
}

function useSendDanglogInvite(danglogId: string) {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ inviterId }: { inviterId: string }) => {
            // danglog_invites는 토큰 기반 초대 방식
            const token = crypto.randomUUID();
            const { data, error } = await supabase
                .from("danglog_invites")
                .insert({
                    danglog_id: danglogId,
                    invited_by: inviterId,
                    invite_token: token,
                    status: "pending",
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["danglog-invites", danglogId],
            });
        },
    });
}

// ─── 컴포넌트 ─────────────────────────────

export default function InviteCollaborator({
    isOpen,
    onClose,
    danglogId,
    inviterId,
}: InviteCollaboratorProps) {
    const [sentIds, setSentIds] = useState<Set<string>>(new Set());

    const { data: guardians, isLoading: loadingGuardians } =
        useMatchedGuardians(inviterId);
    const sendInvite = useSendDanglogInvite(danglogId);

    const handleInvite = async (guardianId: string) => {
        await sendInvite.mutateAsync({ inviterId });
        setSentIds((prev) => new Set(prev).add(guardianId));
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <div className="p-6 space-y-5">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose}>
                        <X className="w-6 h-6 text-foreground-muted" />
                    </button>
                    <h3 className="text-xl font-display font-semibold">
                        공동기록 초대
                    </h3>
                    <span className="w-6" />
                </div>

                <p className="text-sm text-foreground-muted">
                    매칭된 보호자를 초대하면 함께 댕로그를 작성할 수 있어요.
                </p>

                {/* 보호자 목록 */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {loadingGuardians ? (
                        <>
                            <GuardianRowSkeleton />
                            <GuardianRowSkeleton />
                        </>
                    ) : (guardians || []).length === 0 ? (
                        <p className="text-center text-sm text-foreground-muted py-6">
                            아직 매칭된 보호자가 없어요.
                        </p>
                    ) : (
                        (guardians || []).map((g) => {
                            const invited = sentIds.has(g.id);
                            return (
                                <div
                                    key={g.id}
                                    className="flex items-center justify-between py-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground-muted font-medium text-sm">
                                            {g.nickname?.[0] ?? "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {g.nickname}
                                            </p>
                                            {g.bio && (
                                                <p className="text-xs text-foreground-muted truncate max-w-[160px]">
                                                    {g.bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {invited ? (
                                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                            <Check className="w-3.5 h-3.5" />
                                            초대 완료
                                        </span>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            disabled={sendInvite.isPending}
                                            onClick={() => handleInvite(g.id)}
                                        >
                                            <UserPlus className="w-3.5 h-3.5 mr-1" />
                                            초대
                                        </Button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </BottomSheet>
    );
}

function GuardianRowSkeleton() {
    return (
        <div className="flex items-center gap-3 py-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
            </div>
        </div>
    );
}
