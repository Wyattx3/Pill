import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const PASSCODE_KEY = '@sanctuary_passcode';
const SETUP_KEY = '@sanctuary_setup_complete';

const DIALPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'BACK'],
];

export default function PasscodeCreateScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState<string[]>(['', '', '', '']);
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState(false);

  const currentPin = step === 'create' ? pin : confirmPin;
  const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

  const handleDigit = useCallback((digit: string) => {
    const emptyIdx = currentPin.findIndex((d) => d === '');
    if (emptyIdx === -1) return;

    const newPin = [...currentPin];
    newPin[emptyIdx] = digit;
    setCurrentPin(newPin);

    // Auto-verify when all 4 digits entered in confirm step
    if (emptyIdx === 3 && step === 'confirm') {
      setTimeout(() => {
        const fullPin = pin.join('');
        const fullConfirm = newPin.join('');
        if (fullPin === fullConfirm) {
          AsyncStorage.multiSet([
            [PASSCODE_KEY, fullPin],
            [SETUP_KEY, 'true'],
          ]).then(() => {
            navigation.navigate('Home');
          });
        } else {
          setError(true);
          setTimeout(() => {
            setConfirmPin(['', '', '', '']);
            setError(false);
          }, 800);
        }
      }, 300);
    }
  }, [currentPin, pin, step, navigation, setCurrentPin]);

  const handleBackspace = useCallback(() => {
    const lastFilled = currentPin.map((d, i) => (d === '' ? -1 : i)).filter((i) => i >= 0).pop();
    if (lastFilled === undefined) return;
    const newPin = [...currentPin];
    newPin[lastFilled] = '';
    setCurrentPin(newPin);
  }, [currentPin, setCurrentPin]);

  const handleContinue = () => {
    if (pin.join('').length < 4) return;
    setStep('confirm');
    setConfirmPin(['', '', '', '']);
    setError(false);
  };

  const handleConfirmCreate = () => {
    const fullPin = pin.join('');
    const fullConfirm = confirmPin.join('');
    if (fullPin === fullConfirm && fullPin.length === 4) {
      AsyncStorage.multiSet([
        [PASSCODE_KEY, fullPin],
        [SETUP_KEY, 'true'],
      ]).then(() => {
        navigation.navigate('Home');
      });
    } else {
      setError(true);
      setTimeout(() => {
        setConfirmPin(['', '', '', '']);
        setError(false);
      }, 800);
    }
  };

  const isComplete = currentPin.join('').length === 4;
  const canSubmit = step === 'create' ? pin.join('').length === 4 : isComplete;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, sc(40)) }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        {step === 'confirm' ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('create'); setConfirmPin(['', '', '', '']); setError(false); }} activeOpacity={0.5}>
            <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: sc(40) }} />
        )}
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>
          {step === 'create' ? 'Create Passcode' : 'Confirm Passcode'}
        </Text>
        <View style={{ width: sc(40) }} />
      </View>

      <View style={styles.centerContent}>
        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {step === 'create'
            ? 'Enter a 4-digit passcode'
            : 'Re-enter the same passcode to confirm'}
        </Text>

      {/* Dots */}
      <View style={styles.pinDots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: error
                  ? colors.error
                  : currentPin[i] !== ''
                    ? colors.primary
                    : colors.surfaceContainerHigh,
              },
            ]}
          >
            {currentPin[i] !== '' && !error && (
              <View style={[styles.dotInner, { backgroundColor: colors.background }]} />
            )}
          </View>
        ))}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="close-circle" size={sc(16)} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>PINs don't match. Try again.</Text>
        </View>
      )}

      {/* Dialpad */}
      <View style={styles.dialpad}>
        {DIALPAD.map((row, ri) => (
          <View key={ri} style={styles.dialRow}>
            {row.map((digit, di) => {
              if (digit === '') return <View key={di} style={styles.dialBtn} />;
              if (digit === 'BACK') {
                return (
                  <TouchableOpacity key={di} style={styles.dialBtn} onPress={handleBackspace} activeOpacity={0.5}>
                    <Ionicons name="backspace-outline" size={sc(26)} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity key={di} style={styles.dialBtn} onPress={() => handleDigit(digit)} activeOpacity={0.6}>
                  <Text style={[styles.digitText, { color: colors.onSurface }]}>{digit}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
      </View>

      {/* Submit Button */}
      <View style={styles.submitWrap}>
        <TouchableOpacity
          style={[styles.submitBtn, { opacity: canSubmit ? 1 : 0.4, backgroundColor: colors.primary }]}
          disabled={!canSubmit}
          onPress={step === 'create' ? handleContinue : handleConfirmCreate}
          activeOpacity={0.8}
        >
          <Ionicons name={step === 'create' ? 'arrow-forward' : 'shield-checkmark'} size={sc(20)} color={colors.onPrimary} />
          <Text style={[styles.submitText, { color: colors.onPrimary }]}>
            {step === 'create' ? 'Continue' : 'Create My Secure Space'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), width: '100%', marginTop: sc(8) },
  backBtn: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  subtitle: { fontSize: sc(13), marginBottom: sc(24) },

  pinDots: { flexDirection: 'row', justifyContent: 'center', gap: sc(24), marginBottom: sc(8) },
  dot: { width: sc(18), height: sc(18), borderRadius: sc(9), justifyContent: 'center', alignItems: 'center' },
  dotInner: { width: sc(8), height: sc(8), borderRadius: sc(4) },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: sc(6), height: sc(30), marginBottom: sc(4) },
  errorText: { fontSize: sc(12), fontWeight: '600' },

  dialpad: { marginTop: sc(8) },
  dialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: sc(12), width: sc(260) },
  dialBtn: { width: sc(72), height: sc(72), borderRadius: sc(36), justifyContent: 'center', alignItems: 'center' },
  digitText: { fontSize: sc(30), fontWeight: '600' },

  submitWrap: { width: '100%', alignItems: 'center', paddingBottom: Math.max(sc(40), 40) },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), borderRadius: sc(26), paddingVertical: sc(16), width: sc(260), minHeight: 52 },
  submitText: { fontSize: sc(15), fontWeight: '700' },
});
