---
name: dangapp-motion-wrapper
description: Framer Motion 기반의 일관된 마이크로 인터랙션 및 애니메이션 컴포넌트 패턴
---

# dangapp-motion-wrapper (SKILL-03)

이 스킬은 댕게팅(DangGeting) 앱 전반의 부드러운 전환과 피드백을 구현하기 위한 Framer Motion 래핑 컴포넌트 패턴입니다. 

## 📌 핵심 원칙
1. **각 요소에 `motion.div` 속성을 직접 하드코딩하지 마십시오.** 추상화된 래퍼(Wrapper) 컴포넌트만 재사용합니다.
2. 상태 전환, 페이지 진입 등은 반드시 Stagger(순차 등장)나 TapScale(탭 촉각 효과)을 적용합니다.

## 🛠️ 적용 예시 (MotionWrappers.tsx)

```tsx
import { motion, AnimatePresence } from "framer-motion";

// 버튼/카드용 쫀득한 탭 피드백
export const TapScale = ({ children, ...props }) => (
  <motion.div whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }} {...props}>
    {children}
  </motion.div>
);

// 리스트 순차 등장 부모 래퍼
export const StaggerList = ({ children }) => (
  <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    initial="hidden" animate="show">
    {children}
  </motion.div>
);

// 리스트 순차 등장 개별 아이템
export const StaggerItem = ({ children }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
    {children}
  </motion.div>
);

// 하단 드로어 컴포넌트용 바텀 시트
export const BottomSheet = ({ children, isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} />
        <motion.div className="fixed inset-x-0 bottom-0 bg-card rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}>
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
```

## 🚨 절대 금지 (Forbidden)
- 버튼을 만들 때마다 `whileTap={{ scale: 0.9 }}`를 반복하여 작성하지 마세요. `<TapScale>` 래퍼에 children으로 넘기세요.
