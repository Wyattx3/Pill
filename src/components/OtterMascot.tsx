import React from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';

export const OtterMascotAssets = {
  calm: require('../../assets/mascots/otter-calm.png'),
  celebrate: require('../../assets/mascots/otter-celebrate.png'),
  donate: require('../../assets/mascots/otter-donate.png'),
  donationThanks: require('../../assets/mascots/otter-donation-thanks.png'),
  crisisAssistant: require('../../assets/mascots/otter-crisis-assistant.png'),
  fundraiserCreate: require('../../assets/mascots/otter-fundraiser-create.png'),
  guide: require('../../assets/mascots/otter-guide.png'),
  homeAvailable: require('../../assets/mascots/otter-home-available.png'),
  homeCall: require('../../assets/mascots/otter-home-call.png'),
  homeStatus: require('../../assets/mascots/otter-home-status.png'),
  hug: require('../../assets/mascots/otter-hug.png'),
  listener: require('../../assets/mascots/otter-listener.png'),
  listenerCall: require('../../assets/mascots/otter-listener-call.png'),
  listenerDashboard: require('../../assets/mascots/otter-listener-dashboard.png'),
  listenerReview: require('../../assets/mascots/otter-listener-review.png'),
  note: require('../../assets/mascots/otter-note.png'),
  passcodeConfirm: require('../../assets/mascots/otter-passcode-confirm.png'),
  passcodeCreate: require('../../assets/mascots/otter-passcode-create.png'),
  privacyGuard: require('../../assets/mascots/otter-privacy-guard.png'),
  profile: require('../../assets/mascots/otter-profile.png'),
  safetyHub: require('../../assets/mascots/otter-safety-hub.png'),
  safetyReport: require('../../assets/mascots/otter-safety-report.png'),
  secure: require('../../assets/mascots/otter-secure.png'),
  settings: require('../../assets/mascots/otter-settings.png'),
  shield: require('../../assets/mascots/otter-shield.png'),
  support: require('../../assets/mascots/otter-support.png'),
  tea: require('../../assets/mascots/otter-tea.png'),
  verificationDocs: require('../../assets/mascots/otter-verification-docs.png'),
  wave: require('../../assets/mascots/otter-wave.png'),
} as const;

export type OtterMascotName = keyof typeof OtterMascotAssets;

type OtterMascotProps = {
  name?: OtterMascotName;
  size?: number;
  width?: number;
  height?: number;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ImageStyle>;
};

export default function OtterMascot({
  name = 'wave',
  size = 120,
  width,
  height,
  containerStyle,
  style,
}: OtterMascotProps) {
  return (
    <View pointerEvents="none" accessible={false} style={containerStyle}>
      <Image
        source={OtterMascotAssets[name]}
        style={[
          {
            width: width ?? size,
            height: height ?? size,
            resizeMode: 'contain',
          },
          style,
        ]}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
