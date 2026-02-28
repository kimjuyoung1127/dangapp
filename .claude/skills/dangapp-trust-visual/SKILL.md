---
name: dangapp-trust-visual
description: 범블(Bumble) 스타일의 안전 및 신뢰도 마커 시각화 패턴
---

# dangapp-trust-visual (SKILL-08)

안전한 반려동물 보호자 간의 만남을 강조하기 위해, 인증 및 보호자에 대한 신뢰 지표를 시각적으로 전진 배치하는 패턴입니다. 

## 📌 핵심 원칙
1. 뱃지나 안전 신호 시각물은 브랜드 컬러(`bg-primary` 등)를 사용하여 일반 텍스트의 색조와 분리되어 돋보이게 만듭니다.
2. 사용자 이름 영역 근처에 항상 가장 작은 `TrustBadge` (방패/체크)를 부착(Anchor)합니다.
3. 인증 척도나 활동 비율(게이지) 데이터는 프로그레스 바(Progress Bar) 형태를 사용하여 한눈에 투명성을 제공합니다.

## 🛠️ 적용 예시 (신뢰 인디케이터)

```tsx
import { ShieldCheck } from "lucide-react";

// 가장 기본적인 Trust Badge (이름 옆에 상시 부착)
export function TrustBadge({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
      <ShieldCheck className="w-3.5 h-3.5" /> 
      Lv.{level}
    </span>
  );
}
```

```tsx
// 세부 신뢰 지표 스코어 카드 (프로필 최하단 위치 권장)
export function TrustScoreCard() {
  const trustFactors = [
    { label: "연락처/신원 인증", value: 100 },
    { label: "만남 후기 별점", value: 80 },
    { label: "메시지 응답률", value: 100 },
    { label: "댕로그 활동성", value: 60 },
  ];

  return (
    <div className="bg-primary-light/10 p-4 rounded-3xl border border-primary/20">
      <h3 className="text-sm font-semibold text-primary mb-3">
        🛡️ 믿고 만날 수 있는 보호자
      </h3>
      
      <div className="space-y-3">
        {trustFactors.map((f, i) => (
          <div key={i} className="flex justify-between items-center text-xs">
            <span className="text-foreground-muted">{f.label}</span>
            <div className="w-1/2 h-2 bg-gray-200 rounded-full overflow-hidden">
               {/* 프로그레스 바로 채워짐 */}
               <div 
                 className="bg-primary h-full rounded-full" 
                 style={{ width: `${f.value}%` }} 
               />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🚨 절대 금지 (Forbidden)
- 신뢰 점수나 레벨을 모호한 회색 텍스트로 보이지 않는 곳에 작게 숨겨두지 마세요. 매칭의 중요한 지표이므로 전면에 나서야 합니다.
