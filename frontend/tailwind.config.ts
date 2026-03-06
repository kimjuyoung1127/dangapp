import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F5F7FA",
                card: "#FFFFFF",
                primary: {
                    DEFAULT: "#1E88E5",
                    light: "#9EC6E8",
                },
                foreground: {
                    DEFAULT: "#111827",
                    muted: "#4B5563",
                },
                border: {
                    default: "#E5E7EB",
                },
                success: "#10B981",
                warning: "#F59E0B",
                error: "#EF4444",
                muted: "#E5E7EB",
                disabled: {
                    DEFAULT: "#9CA3AF",
                    bg: "#F3F4F6",
                },
            },
            fontFamily: {
                display: ["var(--font-sora)", "sans-serif"],
                body: ["var(--font-noto-sans-kr)", "sans-serif"],
            },
            borderRadius: {
                "3xl": "1.5rem",
                xl: "0.75rem",
            },
        },
    },
    plugins: [],
};

export default config;
