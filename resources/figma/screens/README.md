# Figma Make Screens

Place Figma Make generated code here, one file per screen.

## Naming convention
- `<ScreenName>.tsx` — e.g., `Login.tsx`, `AuditList.tsx`, `TripDetail.tsx`

## How to use
1. Run **FastMVP** or **Feature Builder** → generates `docs/figma.md` with prompts
2. Copy screen prompts into Figma Make
3. Figma Make generates React code per screen
4. Copy the generated code into this folder (one `.tsx` per screen)
5. Invoke the **Design Integrator** agent → integrates the code into `apps/web/src/`
