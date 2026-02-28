---
name: dangapp-app-shell
description: 모바일 앱 룩앤필을 위한 고정 레이아웃 (App Shell) 컴포넌트 패턴
---

# dangapp-app-shell (SKILL-04)

이 스킬은 댕게팅 앱에서 네이티브 모바일 애플리케이션과 유사한 사용자 경험을 제공하기 위한 전역 레이아웃 컴포넌트(App Shell)를 정의합니다.

## 📌 핵심 원칙
1. **Top App Bar**는 최상단에 고정(`fixed top-0`)되며 데스크톱 환경에서도 뷰포트 너비에 맞게 조절되어야 합니다.
2. 스크롤 내용물(글, 피드)이 바 아래로 은은하게 비치도록 **Glassmorphism (`backdrop-blur-md`)** 효과를 적용합니다.
3. **Bottom Navigation**은 하단에 고정(`fixed bottom-0`)되며, 현재 활성화된 탭은 폰트 크기/굵기와 색상으로 명확히 구분되어야 합니다.
4. **Main Content 영역**은 Top Bar와 Bottom Nav에 콘텐츠가 가려지지 않도록 **충분한 상/하단 여백(`pt-14 pb-20`)**을 가져야 합니다.

## 🛠️ 적용 예시 (AppShell.tsx)

```tsx
import Link from 'next/link';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      {/* Top App Bar (고정) */}
      <header className="fixed top-0 inset-x-0 z-30 h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center px-4">
        {/* 뒤로가기 버튼, 로고, 액션 아이콘 등 */}
      </header>

      {/* 뒤에 깔리는 콘텐츠 영역 (패딩 필수) */}
      <main className="pt-14 pb-20">
        {children}
      </main>

      {/* Bottom Navigation (고정) */}
      <nav className="fixed bottom-0 inset-x-0 z-30 h-16 bg-card border-t border-border flex items-center justify-around safe-area-pb">
        <Link href="/home" className="flex flex-col items-center">
          <span className="text-primary font-display scale-105">홈</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center">
          <span className="text-foreground-muted text-xs">프로필</span>
        </Link>
      </nav>
    </div>
  );
}
```

## 🚨 절대 금지 (Forbidden)
- `<AppShell>` 외부에서 별도의 `<header>`나 `<footer>`를 중복해서 선언하지 마세요. 모든 메인 페이지는 이 쉘 내부에서만 콘텐츠를 구성합니다.
