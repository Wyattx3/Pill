# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pill** is a React Native / Expo mobile app (SDK 54) that provides an anonymous emotional support platform. Users can either talk to trained listeners or become listeners themselves. The app uses a "Digital Cocoon" aesthetic with warm, earthy tones.

## Key Commands

```bash
# Start Expo dev server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web

# Install dependencies
npm install
```

## Architecture

### Tech Stack
- **Framework**: Expo (SDK 54.0.33) with React Native 0.81.5
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation 7 (native stack)
- **Fonts**: Manrope + Plus Jakarta Sans via `@expo-google-fonts`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **State**: AsyncStorage for persistence
- **New Architecture**: Enabled (`newArchEnabled: true`)

### Entry Point & App Structure

```
index.ts              → Expo root component registration
App.tsx               → Font loading, theme provider, navigation stack
src/
  screens/            → All screen components (~30 screens)
  theme/
    index.ts          → Colors, BorderRadius, Typography design tokens
    ThemeProvider.tsx → Dark/light mode context with AsyncStorage persistence
    withTheme.tsx     → HOC for injecting theme props
```

### Navigation

Single `NativeStackNavigator` in `App.tsx` with all screens registered. No tab navigator — bottom navigation bars are rendered directly in individual screens. Key navigation flows:

- **Onboarding** → **SecureSetup** → **Home** (primary user journey)
- **Home** → **TalkMode** → **ActiveCall** (seeking support)
- **Home** → **ListenerVerification** → **ListenerMode** → **ListenerDashboard** (becoming a listener)
- **Home** → **SafetyCenter** → **SafetyReport** → **ReportConfirmation** (safety flow)
- **Home** → **Settings** → sub-settings (profile, earnings, ratings, etc.)

### Screen Pattern

All screens follow a consistent pattern:
1. Receive `{ navigation, theme }` as props (theme injected via `ThemedScreen` wrapper in `App.tsx`)
2. Destructure `{ colors, isDark }` from `theme`
3. Use `useSafeAreaInsets()` for safe area handling
4. Use `Dimensions.get('window')` + `sc()` helper for responsive scaling
5. Apply theme colors via inline styles: `{ backgroundColor: colors.surface }`

### Design System (`src/theme/`)

- `Colors` — light mode color tokens (Material Design 3 inspired)
- `DarkColors` — dark mode equivalents
- `Typography` — predefined text styles (displayLg, headlineXL/MD/SM, bodyLg/MD, labelMD/SM)
- `BorderRadius` — sm(8), md(16), lg(32), xl(48), full(9999)
- Responsive scaling helper: `const sc = (v) => Math.round(v * (W / 390))`

### Current State

The app has no backend/API layer — all data is currently hardcoded. Screens represent UI prototypes without real data fetching, WebSockets, or server-side logic. AsyncStorage is used only for dark mode persistence.

### Key Screens by Feature Area

| Area | Screens |
|------|---------|
| Auth/Onboarding | OnboardingScreen, SecureSetupScreen, PasscodeEntryScreen, PasscodeCreateScreen, UpdatePINScreen |
| Core | HomeScreen, TalkModeScreen, ListenerModeScreen, ActiveCallScreen, IncomingCallScreen |
| Listener | ListenerVerificationScreen, ListenerDashboardScreen, AvatarSelectorScreen, EarningsScreen, RatingsScreen, AvailabilityScheduleScreen |
| Safety | SafetyCenterScreen, SafetyReportScreen, ReportConfirmationScreen, ReflectionScreen |
| Settings | SettingsScreen, ProfileScreen, EditProfileScreen, PrivacySecurityScreen, AccountStatusScreen, TrustSystemScreen |
| Support | FAQScreen, ContactSupportScreen, LiveChatScreen, ResourceDetailScreen, DonationScreen |
