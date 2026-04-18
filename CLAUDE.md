# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pill** is a React Native / Expo mobile app (SDK 54) that provides an anonymous emotional support platform. Users can either talk to trained listeners or become listeners themselves. The app also includes a peer-to-peer fundraising/donation system (GoFundMe-style). The design uses a "Digital Cocoon" aesthetic with warm, earthy tones.

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

# Type check
npx tsc --noEmit
```

There are no test or lint scripts configured.

## Architecture

### Tech Stack

- **Framework**: Expo (SDK 54.0.33) with React Native 0.81.5
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation 7 (native stack)
- **Fonts**: Manrope + Plus Jakarta Sans via `@expo-google-fonts`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Styling**: `expo-linear-gradient` for progress bars and CTA buttons
- **State**: AsyncStorage for all data persistence (no backend/API)
- **New Architecture**: Enabled (`newArchEnabled: true`)

### File Structure

```
index.ts              → Expo root component registration
App.tsx               → Font loading, ThemeProvider, NavigationContainer + Stack
src/
  components/
    BottomNav.tsx     → Shared bottom navigation (Home / Safety / Give / Settings)
  screens/            → ~43 screen components
  theme/
    index.ts          → Colors, DarkColors, BorderRadius, Typography tokens
    ThemeProvider.tsx → Dark/light mode context with AsyncStorage persistence
    withTheme.tsx     → HOC for injecting theme props (unused)
  utils/
    donations.ts      → Donations data layer (AsyncStorage CRUD + seed data)
```

### Theme System

`ThemeProvider` wraps the entire app and provides a context with `{ isDark, colors, toggleDarkMode }`. Screens receive this via the `ThemedScreen` wrapper in `App.tsx`, which injects a `theme` prop.

Design tokens in `src/theme/index.ts`:
- `Colors` / `DarkColors` — full Material Design 3-inspired palettes with semantic naming (surface, primary, error, onSurface, onSurfaceVariant, surfaceContainerLow, surfaceContainerHigh, primaryDim, primaryFixed, primaryFixedDim, outlineVariant, etc.)
- `BorderRadius` — sm(8), md(16), lg(32), xl(48), full(9999)
- `Typography` — predefined text styles keyed by font family (Manrope for headings, PlusJakartaSans for body/labels)

`ThemeProvider.tsx` reads/writes dark mode preference to AsyncStorage under key `@sanctuary_dark_mode`.

### ThemedScreen Wrapper

All screens in `App.tsx` are registered using the `ThemedScreen` wrapper pattern:

```tsx
function ThemedScreen({ Component, ...props }: { Component: React.ComponentType<any> }) {
  const theme = useTheme();
  return <Component {...props} theme={theme} />;
}

// Registration example:
<Stack.Screen name="Home">
  {(props) => <ThemedScreen {...props} Component={HomeScreen} />}
</Stack.Screen>
```

This means every screen receives `{ navigation, theme }` as props.

### Standard Screen Pattern

All screens follow this consistent pattern:

```tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390)); // Responsive scaling (base 390px)

export default function ScreenName({ navigation, theme }: any) {
  const { colors, isDark } = theme;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Top bar with safe area padding */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        {/* ... */}
      </View>
      {/* Content */}
      {/* BottomNav on screens that need it */}
      <BottomNav navigation={navigation} activeScreen="ScreenName" theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({ /* local styles, dimensions use sc() */ });
```

**Key conventions:**
- Props typed as `any` — no strict prop types
- `sc()` helper defined locally in every screen for responsive scaling
- Theme colors applied via inline styles, not StyleSheet
- `useSafeAreaInsets()` used for top bar and bottom nav padding
- `expo-linear-gradient` used for progress bars and primary CTA buttons
- No shared component utilities beyond `BottomNav` and theme system

### Navigation

Single `NativeStackNavigator` in `App.tsx` with all ~43 screens registered. No tab navigator — the `BottomNav` component renders navigation directly in individual screens.

Navigation config:
```tsx
screenOptions={{
  headerShown: false,
  animation: 'none',
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  presentation: 'card',
}}
```

Key navigation flows:
- **Onboarding** → **SecureSetup** → **Home** (primary journey)
- **Home** → **TalkMode** → **ActiveCall** → **DonationScreen** (seeking support)
- **Home** → **ListenerVerification** → **ListenerMode** → **ListenerDashboard** (becoming listener)
- **Home** → **SafetyCenter** → **SafetyReport** → **ReportConfirmation** (safety flow)
- **Home** → **Settings** → sub-settings
- **DonationsFeed** → **CreateFundraiser** → **VerificationType** → **IndividualVerification** / **OrganizationVerification**

### BottomNav Component

4 tabs: Home, Safety, Give (heart-circle icon → DonationsFeed), Settings. Each screen that needs nav includes `<BottomNav>` at the bottom with `activeScreen` prop to highlight the current tab.

### AsyncStorage Usage

All data persistence is via AsyncStorage. Keys:
- `@sanctuary_dark_mode` — dark mode preference (boolean string)
- `@pill_donations` — fundraisers array (JSON)
- `@pill_donation_comments` — donation comments array (JSON)
- `@pill_donations_onboarded` — donations onboarding seen flag (boolean string)
- `@pill_verification_status` — user verification status (JSON)
- Passcode/PIN storage (various keys in passcode screens)

No backend or API layer exists — all data is hardcoded seed data or stored locally.

### Donations Feature

**Data layer** (`src/utils/donations.ts`):
- `Fundraiser` type: id, title, description, imageUrl, goalAmount, raisedAmount, creatorName, creatorType ('individual' | 'organization'), verificationStatus ('pending' | 'approved'), submittedAt, isPublished, orgName?
- `DonationComment` type: id, postId, donorName (null = anonymous), amount, donationType ('money' | 'ads'), message, timestamp
- `VerificationStatus` type: type, status, submittedAt, fullName?, orgName?, orgType?, website?
- CRUD functions: `getFundraisers()`, `createFundraiser()`, `getComments()`, `addComment()`, `getVerificationStatus()`, `submitVerification()`, `isOnboarded()`, `setOnboarded()`
- Seed data: 4 fundraisers (2 org, 2 individual) + 4 comments

**Screens (8):**
| Screen | File | Purpose |
|--------|------|---------|
| DonationsOnboarding | `DonationsOnboardingScreen.tsx` | First-time intro, sets onboarding flag |
| Donations Feed | `DonationsFeedScreen.tsx` | Fundraiser cards with progress bars, inline onboarding/loading/empty states |
| Post Detail | `DonationPostDetailScreen.tsx` | Full post view, comments, Donate CTA |
| Donate | `DonateScreen.tsx` | Money/Ads toggle, preset amounts, ad countdown modal |
| Create Fundraiser | `CreateFundraiserScreen.tsx` | Form with title, description, goal, image URL |
| Verification Type | `VerificationTypeScreen.tsx` | Individual vs Organization selection |
| Individual Verification | `IndividualVerificationScreen.tsx` | Name, DOB, ID upload, instant approval |
| Organization Verification | `OrganizationVerificationScreen.tsx` | Org name, type, website, instant publish with blue badge |
| Donation History | `DonationHistoryScreen.tsx` | Past donations list with shareable certificate generation (uses `captureRef` + `expo-media-library`) |
| Gift Tiers | `GiftTiersScreen.tsx` | Manage donation reward tiers for fundraisers (uses `expo-image-picker` for tier images) |

**Onboarding behavior**: DonationsFeedScreen checks `isOnboarded()` on mount. If false, shows inline onboarding UI within the screen (not full-screen overlay). After "Continue to Feed", sets flag and shows feed. Individual verification is simulated instant approval (not real 24h review).

### Key Screens by Feature Area

| Area | Screens |
|------|---------|
| Auth/Onboarding | OnboardingScreen, SecureSetupScreen, PasscodeEntryScreen, PasscodeCreateScreen, UpdatePINScreen |
| Core | HomeScreen, TalkModeScreen, ListenerModeScreen, ActiveCallScreen, IncomingCallScreen |
| Listener | ListenerVerificationScreen, ListenerDashboardScreen, AvatarSelectorScreen, EarningsScreen, RatingsScreen, AvailabilityScheduleScreen |
| Safety | SafetyCenterScreen, SafetyReportScreen, ReportConfirmationScreen, ReflectionScreen |
| Settings | SettingsScreen, ProfileScreen, EditProfileScreen, PrivacySecurityScreen, AccountStatusScreen, TrustSystemScreen |
| Support | FAQScreen, ContactSupportScreen, LiveChatScreen, ResourceDetailScreen, DonationScreen |
| Donations | DonationsOnboardingScreen, DonationsFeedScreen, DonationPostDetailScreen, DonateScreen, CreateFundraiserScreen, VerificationTypeScreen, IndividualVerificationScreen, OrganizationVerificationScreen |
