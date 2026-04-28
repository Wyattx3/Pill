import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot, { OtterMascotName } from './OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const localMascotScreens = new Set([
  'ActiveCall',
  'AvatarSelector',
  'CreateFundraiser',
  'DonationScreen',
  'DonationsFeed',
  'DonationsOnboarding',
  'Home',
  'ListenerDashboard',
  'ListenerMode',
  'ListenerVerification',
  'Onboarding',
  'PasscodeCreate',
  'PasscodeEntry',
  'Profile',
  'ReportConfirmation',
  'SafetyCenter',
  'SafetyReport',
  'SecureSetup',
  'Settings',
  'TalkMode',
]);

const routeMascots: Record<string, OtterMascotName> = {
  AccountStatus: 'safetyHub',
  AvailabilitySchedule: 'homeAvailable',
  EditDisplayName: 'profile',
  EditEmail: 'settings',
  EditPhone: 'settings',
  GiftTiers: 'donate',
  IndividualVerification: 'verificationDocs',
  OrganizationVerification: 'verificationDocs',
  OrgDocumentsUpload: 'verificationDocs',
  PrivacySecurity: 'settings',
  ResourceDetail: 'guide',
  VerificationType: 'verificationDocs',
};

const compactScreens = new Set([
  'EditDisplayName',
  'EditEmail',
  'EditPhone',
]);

type ScreenMascotOverlayProps = {
  screenName?: string;
};

export default function ScreenMascotOverlay({ screenName }: ScreenMascotOverlayProps) {
  const insets = useSafeAreaInsets();
  if (!screenName || localMascotScreens.has(screenName)) return null;

  const mascot = routeMascots[screenName];
  if (!mascot) return null;

  const compact = compactScreens.has(screenName);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top: insets.top + (compact ? sc(44) : sc(54)),
          right: compact ? sc(10) : sc(12),
        },
      ]}
    >
      <OtterMascot name={mascot} size={compact ? sc(58) : sc(72)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 8,
    opacity: 0.92,
  },
});
