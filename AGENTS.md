# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

**Pill** is a React Native / Expo mobile app (SDK 54) that provides an anonymous emotional support platform. Users can either talk to trained listeners or become listeners themselves. The app also includes a peer-to-peer fundraising/donation system (GoFundMe-style). The design uses a "Digital Cocoon" aesthetic with warm, earthy tones.

The app is currently a UI prototype with no backend or API layer. All data is either hardcoded seed data or persisted locally via AsyncStorage.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK ~54.0.33 |
| React Native | 0.81.5 |
| React | 19.1.0 |
| Language | TypeScript 5.9.2 (strict mode) |
| Navigation | React Navigation 7 (`@react-navigation/native-stack`) |
| State / Persistence | AsyncStorage (`@react-native-async-storage/async-storage`) |
| Fonts | Manrope + Plus Jakarta Sans via `@expo-google-fonts` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Gradients | `expo-linear-gradient` |
| Image Picker | `expo-image-picker` |
| Screenshots | `react-native-view-shot` + `expo-media-library` |
| Safe Areas | `react-native-safe-area-context` |
| New Architecture | Enabled (`newArchEnabled: true`) |

## Build and Test Commands

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on specific platforms
npx expo start --android
npx expo start --ios
npx expo start --web

# Type check (no test or lint scripts are configured)
npx tsc --noEmit
```

There are no unit tests, integration tests, lint configs, or CI/CD pipelines in this project.

## File Organization

```
Pill/
├── index.ts                    → Expo root component registration
├── App.tsx                     → Font loading, ThemeProvider, NavigationContainer, Stack.Navigator
├── app.json                    → Expo configuration (orientation, icons, splash, plugins)
├── tsconfig.json               → Extends expo/tsconfig.base, strict: true
├── package.json                → Dependencies and scripts
├── src/
│   ├── components/
│   │   └── BottomNav.tsx       → Shared bottom navigation bar (Home / Safety / Give / Settings)
│   ├── screens/
│   │   └── *.tsx               → ~43 screen components (one file per screen)
│   ├── theme/
│   │   ├── index.ts            → Colors, DarkColors, BorderRadius, Typography design tokens
│   │   ├── ThemeProvider.tsx   → Dark/light mode React Context with AsyncStorage persistence
│   │   └── withTheme.tsx       → HOC for injecting theme props (currently unused; prefer ThemedScreen wrapper)
│   └── utils/
│       └── donations.ts        → AsyncStorage CRUD, seed data, and types for the donations feature
└── assets/
    ├── icon.png
    ├── adaptive-icon.png
    ├── splash-icon.png
    └── favicon.png
```

## Architecture

### Entry Point

`index.ts` calls `registerRootComponent(App)`.

`App.tsx` handles three responsibilities:
1. **Font loading** — loads Manrope (400, 700, 800) and Plus Jakarta Sans (300, 400, 500, 600, 700) via `expo-font`.
2. **Theme provision** — wraps the app in `<ThemeProvider>`.
3. **Navigation** — defines a single `NativeStackNavigator` with all screens registered through a `ThemedScreen` wrapper.

### Navigation

A single `NativeStackNavigator` lives in `App.tsx`. There is **no tab navigator**. The bottom navigation bar (`BottomNav`) is rendered directly inside individual screens that need it.

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
- **Onboarding** → **SecureSetup** → **Home**
- **Home** → **TalkMode** → **ActiveCall**
- **Home** → **ListenerVerification** → **ListenerMode** → **ListenerDashboard**
- **Home** → **SafetyCenter** → **SafetyReport** → **ReportConfirmation**
- **Home** → **Settings** → sub-settings (Profile, Earnings, Privacy, etc.)
- **DonationsFeed** → **CreateFundraiser** → **VerificationType** → **IndividualVerification** / **OrganizationVerification**

### ThemedScreen Wrapper

Every screen is wrapped by `ThemedScreen` inside `App.tsx`:

```tsx
function ThemedScreen({ Component, ...props }: { Component: React.ComponentType<any> }) {
  const theme = useTheme();
  return <Component {...props} theme={theme} />;
}
```

This means **every screen receives `{ navigation, theme }` as props**. Destructure colors and dark mode like:

```tsx
const { colors, isDark } = theme;
```

### Theme System

`src/theme/index.ts` exports three token objects:
- `Colors` / `DarkColors` — full Material Design 3-inspired palette with semantic naming (`primary`, `onPrimary`, `surface`, `onSurface`, `surfaceContainerLow`, `surfaceContainerHigh`, `outlineVariant`, `errorContainer`, etc.).
- `BorderRadius` — `sm: 8`, `md: 16`, `lg: 32`, `xl: 48`, `full: 9999`.
- `Typography` — predefined styles keyed by font family:
  - Manrope for display/headlines (`displayLg`, `headlineXL`, `headlineMD`, `headlineSM`)
  - Plus Jakarta Sans for body/labels (`bodyLg`, `bodyMD`, `labelMD`, `labelSM`)

`ThemeProvider.tsx` reads/writes the dark mode preference to AsyncStorage under key `@sanctuary_dark_mode`. It defaults to the system color scheme if no stored preference exists.

## Code Style Guidelines

### Screen Pattern

All screens follow a rigid, consistent pattern:

1. Import `React`, RN components, `StatusBar` from `expo-status-bar`, `Ionicons`, `useSafeAreaInsets`, and `BottomNav` where needed.
2. Define responsive scaling helper at the top of the file:
   ```tsx
   const { width: W } = Dimensions.get('window');
   const sc = (v: number) => Math.round(v * (W / 390));
   ```
3. Export default function receiving `({ navigation, theme }: any)`.
4. Destructure `const { colors, isDark } = theme;` and `const insets = useSafeAreaInsets();`.
5. Use `<StatusBar style={isDark ? 'light' : 'dark'} />`.
6. Apply theme colors via **inline styles**, not StyleSheet:
   ```tsx
   <View style={[styles.container, { backgroundColor: colors.background }]}>
   ```
7. Use `StyleSheet.create()` only for structural/layout styles. Inside StyleSheet, use `sc()` for all numeric dimensions.
8. Add `pointerEvents="none"` to decorative background elements.
9. Include `<BottomNav navigation={navigation} activeScreen="ScreenName" theme={theme} />` on screens that need bottom navigation.

### Styling Conventions

- **Colors**: Always pull from `colors.*`. Do not hardcode hex values except for functional states (e.g., online status green `#4CAF50`).
- **Opacity overlays**: Append hex alpha to color strings, e.g., `colors.primary + '0A'` for 4% opacity, `colors.surface + 'E6'` for 90% opacity.
- **Gradients**: Use `expo-linear-gradient` for primary CTA buttons and progress bars. Typical gradient: `['#126a63', '#0a675f']` (light mode) or derived from `colors.primary` / `colors.primaryDim`.
- **Border radius**: Prefer `BorderRadius` tokens from theme, but in practice screens use `sc()` values that match the token scale (`sc(8)`, `sc(16)`, `sc(32)`).
- **Touch targets**: Maintain a minimum height of `44` for all interactive elements.

### Component Conventions

- Props are typed loosely as `any` on screens. There are no strict prop interfaces.
- Only one shared presentational component exists (`BottomNav`). All other UI is colocated inside screen files.
- No shared hooks or utility helpers beyond the theme system and `donations.ts`.

## Data Layer

All state is local. There is **no backend, no API client, and no WebSocket connection**.

### AsyncStorage Keys

| Key | Purpose |
|-----|---------|
| `@sanctuary_dark_mode` | Dark mode preference (boolean string) |
| `@pill_donations` | Published fundraisers array (JSON) |
| `@pill_donation_comments` | Donation comments array (JSON) |
| `@pill_donation_history` | Past donation records (JSON) |
| `@pill_donations_onboarded` | Donations onboarding seen flag (boolean string) |
| `@pill_verification_status` | Fundraiser verification status (JSON) |
| `@pill_fundraiser_account` | Fundraiser account profile (JSON) |
| `@pill_otp_codes` | Stored email/phone OTP record (JSON) |
| `@pill_my_fundraisers` | User-created fundraisers (JSON) |
| `@pill_comment_replies` | Comment replies (JSON) |
| `@pill_payouts` | Payout records (JSON) |

### `src/utils/donations.ts`

This is the entire data layer for the donations feature. It exports:
- **Types**: `Fundraiser`, `FundraiserMedia`, `GiftTier`, `DonationComment`, `DonationRecord`, `VerificationStatus`, `FundraiserAccount`, `MyFundraiser`, `OTPRecord`, `PayoutRecord`, `CommentReply`
- **CRUD functions**: `getFundraisers`, `createFundraiser`, `getComments`, `addComment`, `getDonationHistory`, `addDonationRecord`, `getVerificationStatus`, `submitVerification`, `isOnboarded`, `setOnboarded`, `getFundraiserAccount`, `createFundraiserAccount`, `updateFundraiserAccount`, `getMyFundraisers`, `addMyFundraiser`, `updateMyFundraiser`, `deleteMyFundraiser`, `requestPayout`, `getPayouts`, `getReplies`, `addReply`, `getCommentStats`
- **OTP utilities**: `generateAndStoreEmailOTP`, `generateAndStorePhoneOTP`, `verifyEmailOTP`, `verifyPhoneOTP`
- **Verification helpers**: `getNextVerificationStep`, `isFullyVerified`, `setEmailVerified`, `setPhoneVerified`, `setNRCVerified`, `setOrgVerified`
- **Seed data**: 4 default fundraisers (2 organization, 2 individual) with gift tiers and 4 sample comments, auto-populated on first launch.

## Security Considerations

- **No real authentication**: Passcode screens and OTP flows are simulated with local AsyncStorage. There is no encryption of stored data.
- **No network layer**: All data is local, so there are no API keys, tokens, or secrets in the repository.
- **No certificate pinning or TLS config**: Not applicable without a backend.
- **Image handling**: `expo-image-picker` and `react-native-view-shot` are used. Ensure permissions are declared in `app.json` if moving to native builds.
- **Sensitive data in storage**: NRC/ID images, organization certificates, and payout details are stored as file URIs in AsyncStorage. If a backend is added, this must be migrated to encrypted remote storage.

## Testing Instructions

There is no test framework configured. To verify changes manually:

1. Run `npx expo start`.
2. Test on iOS Simulator, Android Emulator, or Expo Go on a physical device.
3. Use the `--web` flag for rapid UI iteration in a browser.
4. Clear AsyncStorage (uninstall Expo Go or use device settings) to test onboarding and seed data flows from a clean state.

## Adding New Screens

1. Create a new file in `src/screens/MyNewScreen.tsx` following the standard screen pattern.
2. Import the screen in `App.tsx`.
3. Add a `<Stack.Screen name="MyNew">` entry inside the `Stack.Navigator`, wrapping the component with `ThemedScreen`.
4. If the screen belongs to a bottom-nav section, include `<BottomNav navigation={navigation} activeScreen="MyNew" theme={theme} />` at the bottom of the screen's layout.
5. Use `navigation.navigate('MyNew')` from other screens to route to it.

## Asset Guidelines

- App icons and splash images live in `assets/`.
- `app.json` references these files for iOS, Android, and web builds.
- The splash background color and adaptive icon background are both set to `#fbf9f5` (matches `Colors.surface`).

## Dependencies to Know About

- `expo-blur` — available but not heavily used in current screens.
- `expo-file-system` — available for future file operations.
- `expo-media-library` — used by `DonationHistoryScreen` to save shareable donation certificates.
- `expo-image-picker` — used by `GiftTiersScreen` and verification flows for image uploads.
- `react-native-view-shot` — used by `DonationHistoryScreen` to capture certificate UI as an image.
