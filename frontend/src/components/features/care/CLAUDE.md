# care components

UI components for care request and acceptance flows.

- `CareRequestForm`: create a care request with time, type, and notes.
- `CareTypeSelect`: select care type chips.
- `CareRequestCard`: show request status and summary.
- `CareRequestList`: render request lists with loading or empty support.
- Data flow should go through `useCare.ts` or the matching hooks layer.
