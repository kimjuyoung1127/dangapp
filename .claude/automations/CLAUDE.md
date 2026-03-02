# automations/

DangApp 자동화 프롬프트 — 예약 작업용 Claude 명령어 모음.

## 원칙
- 프롬프트는 결정적(deterministic)이고 멱등(idempotent)해야 함.
- 각 프롬프트에 스케줄/타임존을 명시할 것.
- 잠금(lock) 파일로 중복 실행 방지.
- 코드 파일 직접 수정 금지 (문서·보드·로그만 대상).
- DRY_RUN=true 지원 필수.

## 파일 목록
| 파일 | 용도 | 스케줄 |
|------|------|--------|
| `schema-drift-detector.prompt.md` | DB types ↔ Changelog ↔ 훅 3-Way 드리프트 탐지 | 매일 02:00 KST |
| `skill-doc-integrity.prompt.md` | 스킬↔문서↔코드 정합성 검사 | 매일 03:00 KST |
| `code-doc-align.prompt.md` | 코드↔문서 정합성 검사 | 매일 03:30 KST |
| `wave-status-sync.prompt.md` | Wave/Parity 상태 보드 자동 동기화 | 매일 04:00 KST |
| `parity-cascade-sync.prompt.md` | Board→Matrix→Status Parity 캐스케이드 동기화 | 매일 04:30 KST |
| `automation-health-monitor.prompt.md` | 전체 자동화 헬스 대시보드 | 매일 05:00 KST |
| `memory-drift-reporter.prompt.md` | MEMORY.md 상태 드리프트 보고 | 매일 05:30 KST |
| `docs-nightly-organizer.prompt.md` | daily 로그 압축 + docs 구조 정리 | 매일 22:00 KST |
| `session-bootstrap.prompt.md` | 새 세션 시작 시 핸드오프 + preflight | 세션 시작 시 수동 |
| `slack-completion-report.prompt.md` | 태스크 완료 시 슬랙 D09LC7XLBQ9 보고 | 완료 시마다 |

## 실행 순서 (의존성 기반)
```
02:00  schema-drift-detector     (독립)
03:00  skill-doc-integrity       (독립)
03:30  code-doc-align            (독립)
04:00  wave-status-sync          (독립)
04:30  parity-cascade-sync       (wave-status-sync 이후)
05:00  automation-health-monitor (모든 야간 자동화 이후)
05:30  memory-drift-reporter     (automation-health-monitor 이후)
22:00  docs-nightly-organizer    (독립)
이벤트  slack-completion-report   (태스크 완료 시)
수동    session-bootstrap         (세션 시작 시)
```
