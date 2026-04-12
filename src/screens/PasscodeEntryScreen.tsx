import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

export default function PasscodeEntryScreen({ navigation }: any) {
  navigation.replace('Onboarding');
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
