// File: Register route that reuses the shared Google OAuth entry card.
import { AuthEntryCard } from "@/app/(auth)/AuthEntryCard";

export default function RegisterPage() {
    return <AuthEntryCard source="register" />;
}
