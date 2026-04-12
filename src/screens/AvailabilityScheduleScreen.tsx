import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Switch, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AvailabilityScheduleScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  // State
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState({ h: 9, m: 0, p: 'AM' });
  const [endTime, setEndTime] = useState({ h: 5, m: 0, p: 'PM' });
  const [autoOn, setAutoOn] = useState(true);
  const [maxCalls, setMaxCalls] = useState(10);
  const [unlimited, setUnlimited] = useState(false);

  // Animate entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const adjustTime = (field: 'start' | 'end', delta: number) => {
    const setter = field === 'start' ? setStartTime : setEndTime;
    setter((prev: any) => {
      let { h, m, p } = prev;
      let newM = m + delta;
      let newH = h;
      let newP = p;
      if (newM >= 60) { newM -= 60; newH++; }
      if (newM < 0) { newM += 60; newH--; }
      if (newH > 12) { newH -= 12; newP = newP === 'AM' ? 'PM' : 'AM'; }
      if (newH < 1) { newH += 12; newP = newP === 'AM' ? 'PM' : 'AM'; }
      return { h: newH, m: newM, p: newP };
    });
  };

  const formatTime = (t: { h: number; m: number; p: string }) =>
    `${t.h}:${t.m.toString().padStart(2, '0')} ${t.p}`;

  const handleSave = () => {
    // Here you'd persist the schedule
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Availability Schedule</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Auto On Toggle */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
                <Ionicons name="toggle" size={sc(20)} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Auto Availability</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={[styles.rowText, { color: colors.onSurfaceVariant }]}>
                {autoOn ? 'Automatically go available during schedule' : 'Manual availability only'}
              </Text>
              <Switch
                value={autoOn}
                onValueChange={setAutoOn}
                trackColor={{ true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>

          {/* Active Days */}
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
                <Ionicons name="calendar-outline" size={sc(20)} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Active Days</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>Select which days you'll be auto-available</Text>
            <View style={styles.daysGrid}>
              {DAYS.map(day => {
                const active = selectedDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayChip, {
                      backgroundColor: active ? colors.primaryContainer : colors.surface,
                      borderColor: active ? colors.primary : colors.surfaceContainerHigh,
                      borderWidth: 2,
                    }]}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayText, { color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant, fontWeight: active ? '700' : '500' }]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Time Range */}
          {autoOn && (
            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
                  <Ionicons name="time-outline" size={sc(20)} color={colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Auto-On Time Range</Text>
              </View>
              <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>You'll automatically go available during these hours</Text>

              <View style={styles.timeRangeRow}>
                {/* Start Time */}
                <View style={styles.timePicker}>
                  <Text style={[styles.timeLabel, { color: colors.onSurfaceVariant }]}>From</Text>
                  <View style={styles.timeColumn}>
                    <TouchableOpacity style={styles.timeArrow} onPress={() => adjustTime('start', 5)} activeOpacity={0.5}>
                      <Ionicons name="chevron-up" size={sc(20)} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.timeValue, { color: colors.onSurface }]}>{formatTime(startTime)}</Text>
                    <TouchableOpacity style={styles.timeArrow} onPress={() => adjustTime('start', -5)} activeOpacity={0.5}>
                      <Ionicons name="chevron-down" size={sc(20)} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Separator */}
                <View style={styles.timeSeparator}>
                  <Ionicons name="arrow-forward" size={sc(24)} color={colors.primary} />
                </View>

                {/* End Time */}
                <View style={styles.timePicker}>
                  <Text style={[styles.timeLabel, { color: colors.onSurfaceVariant }]}>To</Text>
                  <View style={styles.timeColumn}>
                    <TouchableOpacity style={styles.timeArrow} onPress={() => adjustTime('end', 5)} activeOpacity={0.5}>
                      <Ionicons name="chevron-up" size={sc(20)} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.timeValue, { color: colors.onSurface }]}>{formatTime(endTime)}</Text>
                    <TouchableOpacity style={styles.timeArrow} onPress={() => adjustTime('end', -5)} activeOpacity={0.5}>
                      <Ionicons name="chevron-down" size={sc(20)} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Max Daily Calls */}
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
                <Ionicons name="call-outline" size={sc(20)} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Max Daily Calls</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>Limit how many calls you accept per day</Text>

            <View style={styles.rowBetween}>
              <Text style={[styles.rowText, { color: colors.onSurfaceVariant }]}>Unlimited calls</Text>
              <Switch
                value={unlimited}
                onValueChange={setUnlimited}
                trackColor={{ true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {!unlimited && (
              <View style={styles.counterRow}>
                <TouchableOpacity style={[styles.counterBtn, { backgroundColor: colors.surface }]} onPress={() => setMaxCalls(Math.max(1, maxCalls - 1))} activeOpacity={0.7}>
                  <Ionicons name="remove" size={sc(22)} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.counterValue, { color: colors.onSurface }]}>{maxCalls} calls/day</Text>
                <TouchableOpacity style={[styles.counterBtn, { backgroundColor: colors.surface }]} onPress={() => setMaxCalls(maxCalls + 1)} activeOpacity={0.7}>
                  <Ionicons name="add" size={sc(22)} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={sc(20)} color={colors.onPrimary} />
            <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>Save Schedule</Text>
          </TouchableOpacity>

          <View style={{ height: sc(40) }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(12), paddingTop: sc(8) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(20) },

  card: { borderRadius: sc(16), padding: sc(18), marginBottom: sc(14) },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(10), marginBottom: sc(4) },
  cardIcon: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: sc(15), fontWeight: '700' },
  cardDesc: { fontSize: sc(11), marginBottom: sc(12) },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: sc(4), marginBottom: sc(4) },
  rowText: { fontSize: sc(13) },

  // Days
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(8), marginTop: sc(8) },
  dayChip: { paddingHorizontal: sc(14), paddingVertical: sc(10), borderRadius: sc(20) },
  dayText: { fontSize: sc(13) },

  // Time range
  timeRangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: sc(12) },
  timePicker: { flex: 1, alignItems: 'center' },
  timeLabel: { fontSize: sc(10), fontWeight: '600', marginBottom: sc(8) },
  timeColumn: { alignItems: 'center' },
  timeArrow: { paddingVertical: sc(6), paddingHorizontal: sc(16) },
  timeValue: { fontSize: sc(22), fontWeight: '800', paddingVertical: sc(4) },
  timeSeparator: { paddingHorizontal: sc(12) },

  // Counter
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(20), marginTop: sc(12) },
  counterBtn: { width: sc(48), height: sc(48), borderRadius: sc(24), alignItems: 'center', justifyContent: 'center' },
  counterValue: { fontSize: sc(20), fontWeight: '800', minWidth: sc(100), textAlign: 'center' },

  // Save
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), borderRadius: sc(26), paddingVertical: sc(16), minHeight: 52, marginTop: sc(8) },
  saveButtonText: { fontSize: sc(16), fontWeight: '700' },
});
