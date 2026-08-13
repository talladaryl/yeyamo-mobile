# Water UI refactor

## Scope

This refactor preserves the existing Expo Router structure and the five primary tabs. It changes shared visual tokens and the navigation/feed presentation only; no business endpoint or DTO was changed for visual styling.

## Token migration

| Legacy token | Water UI role | Light | Dark |
|---|---|---|---|
| `background` | cold neutral background | `#F1F5F9` | `#0B1420` |
| `card` | milk surface | `#FCFDFE` | `#152231` |
| `elevated` | input/secondary surface | `#E8EEF5` | `#1B2A3A` |
| — | `surfaceElevated` | `#FCFDFE` | `#1A2A3B` |
| — | `surfaceGlass` | `#F8FBFCCC` | `#142336CC` |
| — | `surfaceGlassStrong` | `#F8FBFCEB` | `#17283BE8` |
| `border` | `borderSoft` | `#D8E2EC` | `#2A3C50` |
| — | `borderGlass` | `#FFFFFFA8` | `#6D819433` |
| `text` | `textPrimary` | `#162033` | `#F3F7FB` |
| — | `accentSoft` | `#FDE8E8` | `#3F1E28` |
| — | `overlay` | `rgba(15, 23, 42, 0.42)` | `rgba(2, 8, 18, 0.62)` |

`primary` remains YeYamo red and is reserved for active state, CTAs, likes, badges, and meaningful errors. It is not used as a broad page surface.

## Migrated shared components

- `src/constants/theme.ts`: conceptual surface, glass, border, text, accent, and overlay tokens for both modes.
- `src/components/ui/FloatingTabBar.tsx`: compact glass shell, limited `expo-blur`, soft refraction, and a red-tinted active drop.
- `src/components/ui/Input.tsx`: milk surface with soft/error borders.
- `src/components/comments/CommentInput.tsx`: elevated, keyboard-safe milk input.
- `src/app/(tabs)/_layout.tsx`: compact safe-area-aware floating tab geometry.
- `src/components/feed/FeedModeSwitch.tsx`: low-emphasis glass feed capsule, reduced-motion aware.

## Intentional non-migrations

- Full-screen visual media (feed video, stories, hero images) remains dark/black when required for content legibility. It is not a primary app surface.
- Existing feature-specific cards were not mass-rewritten. Their theme tokens remain compatible and can be migrated incrementally without changing user flows.
- Blur remains limited to the floating tab shell. It is deliberately not used for posts, forms, long reading, or full page backgrounds.

## Accessibility checks

- Primary and secondary text use opaque high-contrast colors rather than translucent white/black.
- Placeholders use `textMuted`; disabled/selected controls retain text and border distinction in light and dark modes.
- The active feed/tab state has text and border changes in addition to color.
- `useReducedMotion` prevents the feed capsule from translating while scrolling and already disables the tab bubble spring.
