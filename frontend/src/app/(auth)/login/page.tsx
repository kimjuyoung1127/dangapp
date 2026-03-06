// File: Login route that uses the shared Google OAuth entry card.
import { AuthEntryCard } from "@/app/(auth)/AuthEntryCard";

export default function LoginPage() {
    return <AuthEntryCard source="login" />;
}
