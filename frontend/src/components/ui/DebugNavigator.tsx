"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ROUTES = [
  { path: "/login", label: "🔑 로그인" },
  { path: "/register", label: "📝 회원가입" },
  { path: "/onboarding", label: "🚀 온보딩" },
  { path: "/home", label: "🏠 홈 (매칭)" },
  { path: "/chat", label: "💬 채팅 목록" },
  { path: "/schedules", label: "📅 일정 관리" },
  { path: "/danglog", label: "🐕 댕로그" },
  { path: "/profile", label: "👤 프로필" },
  { path: "/modes", label: "🔄 모드 전환" },
  { path: "/care", label: "🏥 돌봄 서비스" },
  { path: "/family", label: "👨‍👩‍👧‍👦 가족 관리" },
];

export function DebugNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 배포 시 보안 취약점이 되지 않도록 환경 변수 기반으로 변경
  const isDev = process.env.NODE_ENV === "development"; 

  if (!isDev) return null;



  return (
    <div className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end gap-2">
      {isOpen && (
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 w-56 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <span className="text-xs font-bold text-primary">DEBUG NAVIGATOR</span>
            <span className="text-[10px] text-foreground-muted">Current: {pathname}</span>
          </div>
          <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {ROUTES.map((route) => (
              <button
                key={route.path}
                onClick={() => {
                  router.push(route.path);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm rounded-lg transition-colors",
                  pathname === route.path 
                    ? "bg-primary text-white font-bold" 
                    : "hover:bg-accent text-foreground"
                )}
              >
                {route.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition-transform active:scale-95",
          isOpen ? "bg-red-500 text-white rotate-45" : "bg-primary text-white"
        )}
      >
        {isOpen ? "+" : "🛠️"}
      </button>
    </div>
  );
}
