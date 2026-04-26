import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function ReportConfirmationScreen({ route, navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const { actionType } = route.params || { actionType: 'report' };

  const isBlocking = actionType === 'block';

  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDone = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.content}>
        {/* Animated Success Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <OtterMascot name={isBlocking ? 'shield' : 'celebrate'} size={sc(136)} containerStyle={styles.confirmMascot} />
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isBlocking ? colors.errorContainer + '33' : colors.primaryContainer + '33' },
            ]}
          >
            <Ionicons
              name={isBlocking ? 'ban-outline' : 'checkmark-circle-outline'}
              size={sc(48)}
              color={isBlocking ? colors.error : colors.primary}
            />
          </View>
        </Animated.View>

        {/* Title & Description */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.title, { color: colors.onBackground }]}>
            {isBlocking ? 'User Blocked & Reported' : 'Report Submitted'}
          </Text>
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {isBlocking
              ? 'This user has been permanently blocked. They will not be able to contact you using this account again.'
              : 'Your report has been submitted. Our safety team will review it carefully.'}
          </Text>
        </Animated.View>

        {/* Info Cards */}
        <Animated.View style={[styles.infoCards, { opacity: fadeAnim }]}>
          <View style={[styles.infoCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="shield-checkmark-outline" size={sc(20)} color={colors.primary} />
            <View style={styles.infoCardText}>
              <Text style={[styles.infoCardTitle, { color: colors.onSurface }]}>Confidential</Text>
              <Text style={[styles.infoCardDesc, { color: colors.onSurfaceVariant }]}>
                Your identity is never revealed to the reported user.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="time-outline" size={sc(20)} color={colors.primary} />
            <View style={styles.infoCardText}>
              <Text style={[styles.infoCardTitle, { color: colors.onSurface }]}>Review Timeline</Text>
              <Text style={[styles.infoCardDesc, { color: colors.onSurfaceVariant }]}>
                Reports are typically reviewed within 24-48 hours.
              </Text>
            </View>
          </View>

          {isBlocking && (
            <View style={[styles.infoCard, { backgroundColor: colors.errorContainer + '22', borderColor: colors.error + '33', borderWidth: 1 }]}>
              <Ionicons name="lock-closed-outline" size={sc(20)} color={colors.error} />
              <View style={styles.infoCardText}>
                <Text style={[styles.infoCardTitle, { color: colors.onSurface }]}>Blocked</Text>
                <Text style={[styles.infoCardDesc, { color: colors.onSurfaceVariant }]}>
                  This user cannot contact you again through The Sanctuary.
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Bottom Button */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.background, paddingBottom: insets.bottom + sc(10) }]}>
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: colors.primary }]}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={[styles.doneButtonText, { color: colors.onPrimary }]}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: sc(24), paddingTop: sc(60) },

  // Icon
  iconContainer: { marginBottom: sc(32) },
  confirmMascot: { alignItems: 'center', marginBottom: sc(8) },
  iconCircle: { width: sc(88), height: sc(88), borderRadius: sc(44), alignItems: 'center', justifyContent: 'center' },

  // Text
  textContainer: { alignItems: 'center', marginBottom: sc(32) },
  title: { fontSize: sc(24), fontWeight: '800', textAlign: 'center', marginBottom: sc(12), letterSpacing: -0.5 },
  description: { fontSize: sc(14), lineHeight: sc(22), textAlign: 'center', paddingHorizontal: sc(8) },

  // Info Cards
  infoCards: { width: '100%', gap: sc(12) },
  infoCard: { borderRadius: sc(14), padding: sc(16), flexDirection: 'row', alignItems: 'flex-start', gap: sc(12) },
  infoCardText: { flex: 1 },
  infoCardTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(4) },
  infoCardDesc: { fontSize: sc(12), lineHeight: sc(18) },

  // Bottom
  bottomContainer: { paddingHorizontal: sc(24) },
  doneButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: sc(16), borderRadius: sc(26), minHeight: 52 },
  doneButtonText: { fontSize: sc(16), fontWeight: '700' },
});
