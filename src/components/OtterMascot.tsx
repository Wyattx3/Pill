import React from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';

export const OtterMascotAssets = {
  calm: require('../../assets/mascots/otter-calm.png'),
  celebrate: require('../../assets/mascots/otter-celebrate.png'),
  donate: require('../../assets/mascots/otter-donate.png'),
  guide: require('../../assets/mascots/otter-guide.png'),
  hug: require('../../assets/mascots/otter-hug.png'),
  listener: require('../../assets/mascots/otter-listener.png'),
  note: require('../../assets/mascots/otter-note.png'),
  passcodeConfirm: require('../../assets/mascots/otter-passcode-confirm.png'),
  passcodeCreate: require('../../assets/mascots/otter-passcode-create.png'),
  privacyGuard: require('../../assets/mascots/otter-privacy-guard.png'),
  secure: require('../../assets/mascots/otter-secure.png'),
  shield: require('../../assets/mascots/otter-shield.png'),
  tea: require('../../assets/mascots/otter-tea.png'),
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
