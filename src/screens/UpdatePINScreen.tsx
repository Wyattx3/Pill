import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const PASSCODE_KEY = '@sanctuary_passcode';

const DIALPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'BACK'],
];

type Step = 'verify' | 'create' | 'confirm';

export default function UpdatePINScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  const [step, setStep] = useState<Step>('verify');
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [newPin, setNewPin] = useState<string[]>(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentPin = step === 'verify' ? pin : step === 'create' ? newPin : confirmPin;
  const setCurrentPin = step === 'verify' ? setPin : step === 'create' ? setNewPin : setConfirmPin;

  const stepTitles: Record<Step, string> = {
    verify: 'Verify Current PIN',
    create: 'Set New PIN',
    confirm: 'Confirm New PIN',
  };
  const stepSubtitles: Record<Step, string> = {
    verify: 'Enter your current 4-digit PIN',
    create: 'Enter a new 4-digit PIN',
    confirm: 'Re-enter the same PIN to confirm',
  };

  const handleDigit = useCallback((digit: string) => {
    const emptyIdx = currentPin.findIndex((d) => d === '');
    if (emptyIdx === -1) return;

    const newDigits = [...currentPin];
    newDigits[emptyIdx] = digit;
    setCurrentPin(newDigits);

    // Auto-advance on 4th digit
    if (emptyIdx === 3) {
      setTimeout(() => {
        if (step === 'verify') {
          AsyncStorage.getItem(PASSCODE_KEY).then((storedPin) => {
            if (storedPin === newDigits.join('')) {
              setStep('create');
              setError(false);
            } else {
              setError(true);
              setErrorMsg('Incorrect PIN');
              setTimeout(() => {
                setPin(['', '', '', '']);
                setError(false);
                setErrorMsg('');
              }, 800);
            }
          });
        } else if (step === 'create') {
          setStep('confirm');
          setError(false);
        } else {
          // confirm step
          const fullNew = newPin.join('');
          const fullConfirm = newDigits.join('');
          if (fullNew === fullConfirm && fullNew.length === 4) {
            AsyncStorage.setItem(PASSCODE_KEY, fullNew).then(() => {
              navigation.goBack();
            });
          } else {
            setError(true);
            setErrorMsg("PINs don't match");
            setTimeout(() => {
              setConfirmPin(['', '', '', '']);
              setError(false);
              setErrorMsg('');
            }, 800);
          }
        }
      }, 300);
    }
  }, [currentPin, step, newPin, navigation, setCurrentPin, navigation]);

  const handleBackspace = useCallback(() => {
    const lastFilled = currentPin.map((d, i) => (d === '' ? -1 : i)).filter((i) => i >= 0).pop();
    if (lastFilled === undefined) return;
    const newDigits = [...currentPin];
    newDigits[lastFilled] = '';
    setCurrentPin(newDigits);
  }, [currentPin, setCurrentPin]);

  const handleGoBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setConfirmPin(['', '', '', '']);
      setError(false);
      setErrorMsg('');
    } else if (step === 'create') {
      setStep('verify');
      setNewPin(['', '', '', '']);
      setError(false);
      setErrorMsg('');
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, sc(40)) }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={handleGoBack} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>{stepTitles[step]}</Text>
        <View style={{ width: sc(40) }} />
      </View>

      <View style={styles.centerContent}>
        <View style={styles.pinSection}>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{stepSubtitles[step]}</Text>

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

          {error && (
            <View style={styles.errorRow}>
              <Ionicons name="close-circle" size={sc(16)} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
            </View>
          )}
        </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), width: '100%', marginTop: sc(8) },
  backBtn: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  centerContent: { flex: 1, justifyContent: 'space-between', width: '100%', paddingHorizontal: sc(18) },
  pinSection: { alignItems: 'center', marginTop: sc(40) },
  subtitle: { fontSize: sc(14), marginBottom: sc(20), textAlign: 'center' },

  pinDots: { flexDirection: 'row', justifyContent: 'center', gap: sc(24), marginBottom: sc(10) },
  dot: { width: sc(18), height: sc(18), borderRadius: sc(9), justifyContent: 'center', alignItems: 'center' },
  dotInner: { width: sc(8), height: sc(8), borderRadius: sc(4) },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: sc(6), height: sc(28), marginBottom: sc(4) },
  errorText: { fontSize: sc(12), fontWeight: '600' },

  dialpad: { marginBottom: sc(40), alignItems: 'center' },
  dialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: sc(12), width: sc(260) },
  dialBtn: { width: sc(72), height: sc(72), borderRadius: sc(36), justifyContent: 'center', alignItems: 'center' },
  digitText: { fontSize: sc(30), fontWeight: '600' },
});
