import { cn } from "@/lib/utils";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            role="status"
            aria-label="로딩 중"
            className={cn("animate-pulse rounded-xl bg-muted", className)}
            {...props}
        />
    )
}

export { Skeleton }
