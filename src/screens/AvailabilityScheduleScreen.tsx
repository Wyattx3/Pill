import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export default function AvailabilityScheduleScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startHour, setStartHour] = useState(9);
  const [startMin, setStartMin] = useState(0);
  const [startAmPm, setStartAmPm] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState(5);
  const [endMin, setEndMin] = useState(0);
  const [endAmPm, setEndAmPm] = useState<'AM' | 'PM'>('PM');
  const [autoOn, setAutoOn] = useState(true);
  const [maxCalls, setMaxCalls] = useState(10);
  const [unlimited, setUnlimited] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigation.goBack();
    }, 800);
  };

  const set24Hours = () => {
    setStartHour(0);
    setStartMin(0);
    setStartAmPm('AM');
    setEndHour(11);
    setEndMin(59);
    setEndAmPm('PM');
  };

  const adjustHour = (setter: React.Dispatch<React.SetStateAction<number>>, val: number) => {
    setter((prev) => {
      let next = prev + val;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      return next;
    });
  };

  const adjustMin = (setter: React.Dispatch<React.SetStateAction<number>>, val: number) => {
    setter((prev) => {
      let next = prev + val;
      if (next < 0) next = 55;
      if (next >= 60) next = 0;
      return next;
    });
  };

  const TimeBlock = ({
    label,
    h,
    m,
    p,
    setH,
    setM,
    setP,
  }: {
    label: string;
    h: number;
    m: number;
    p: 'AM' | 'PM';
    setH: React.Dispatch<React.SetStateAction<number>>;
    setM: React.Dispatch<React.SetStateAction<number>>;
    setP: React.Dispatch<React.SetStateAction<'AM' | 'PM'>>;
  }) => (
    <View style={styles.timeBlock}>
      <Text style={[styles.timeBlockLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <View style={styles.timeWheelRow}>
        {/* Hour */}
        <View style={styles.wheelCol}>
          <TouchableOpacity style={styles.wheelArrow} onPress={() => adjustHour(setH, 1)} activeOpacity={0.6}>
            <Ionicons name="chevron-up" size={sc(18)} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.wheelValue, { color: colors.onSurface }]}>{pad(h)}</Text>
          <TouchableOpacity style={styles.wheelArrow} onPress={() => adjustHour(setH, -1)} activeOpacity={0.6}>
            <Ionicons name="chevron-down" size={sc(18)} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.wheelUnit, { color: colors.onSurfaceVariant }]}>h</Text>
        </View>

        <Text style={[styles.wheelColon, { color: colors.onSurfaceVariant }]}>:</Text>

        {/* Minute */}
        <View style={styles.wheelCol}>
          <TouchableOpacity style={styles.wheelArrow} onPress={() => adjustMin(setM, 5)} activeOpacity={0.6}>
            <Ionicons name="chevron-up" size={sc(18)} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.wheelValue, { color: colors.onSurface }]}>{pad(m)}</Text>
          <TouchableOpacity style={styles.wheelArrow} onPress={() => adjustMin(setM, -5)} activeOpacity={0.6}>
            <Ionicons name="chevron-down" size={sc(18)} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.wheelUnit, { color: colors.onSurfaceVariant }]}>m</Text>
        </View>

        {/* AM/PM */}
        <View style={styles.wheelCol}>
          <TouchableOpacity
            style={[styles.ampmBtn, { backgroundColor: p === 'AM' ? colors.primary : colors.surface }]}
            onPress={() => setP('AM')}
            activeOpacity={0.7}
          >
            <Text style={[styles.ampmText, { color: p === 'AM' ? colors.onPrimary : colors.onSurfaceVariant }]}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ampmBtn, { backgroundColor: p === 'PM' ? colors.primary : colors.surface }]}
            onPress={() => setP('PM')}
            activeOpacity={0.7}
          >
            <Text style={[styles.ampmText, { color: p === 'PM' ? colors.onPrimary : colors.onSurfaceVariant }]}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, sc(8)) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.headerBtn, { backgroundColor: colors.surfaceContainerLow }]}
          activeOpacity={0.5}
        >
          <Ionicons name="arrow-back" size={sc(20)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Availability</Text>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={sc(20)} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {saved && (
          <View style={[styles.savedBanner, { backgroundColor: colors.primary + '14' }]}>
            <Ionicons name="checkmark-circle" size={sc(18)} color={colors.primary} />
            <Text style={[styles.savedText, { color: colors.primary }]}>Saved</Text>
          </View>
        )}

        {/* Auto Availability */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
              <Ionicons name="toggle" size={sc(18)} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Auto Availability</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>
                Go available automatically during scheduled hours
              </Text>
            </View>
            <Switch
              value={autoOn}
              onValueChange={setAutoOn}
              trackColor={{ false: colors.outlineVariant + '66', true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        {/* Active Days */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
              <Ionicons name="calendar-outline" size={sc(18)} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Active Days</Text>
          </View>

          <View style={styles.daysRow}>
            {DAYS.map((day) => {
              const active = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.surfaceContainerHigh,
                    },
                  ]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.dayCircleText,
                      { color: active ? colors.onPrimary : colors.onSurfaceVariant },
                    ]}
                  >
                    {day.charAt(0)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.daysSummary, { color: colors.onSurfaceVariant }]}>
            {selectedDays.length === 7
              ? 'Every day'
              : selectedDays.length === 0
              ? 'No days selected'
              : selectedDays.join(', ')}
          </Text>
        </View>

        {/* Time Range */}
        {autoOn && (
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.timeSectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
                  <Ionicons name="time-outline" size={sc(18)} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Time Range</Text>
              </View>
              <TouchableOpacity
                style={[styles.twentyFourBtn, { backgroundColor: colors.primaryContainer + '33' }]}
                onPress={set24Hours}
                activeOpacity={0.7}
              >
                <Ionicons name="time" size={sc(12)} color={colors.primary} />
                <Text style={[styles.twentyFourText, { color: colors.primary }]}>24h</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeBlocksRow}>
              <TimeBlock
                label="From"
                h={startHour}
                m={startMin}
                p={startAmPm}
                setH={setStartHour}
                setM={setStartMin}
                setP={setStartAmPm}
              />

              <View style={styles.timeConnector}>
                <View style={[styles.dotLine, { backgroundColor: colors.surfaceContainerHigh }]} />
                <Ionicons name="arrow-forward" size={sc(14)} color={colors.onSurfaceVariant} />
                <View style={[styles.dotLine, { backgroundColor: colors.surfaceContainerHigh }]} />
              </View>

              <TimeBlock
                label="To"
                h={endHour}
                m={endMin}
                p={endAmPm}
                setH={setEndHour}
                setM={setEndMin}
                setP={setEndAmPm}
              />
            </View>
          </View>
        )}

        {/* Max Daily Calls */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
              <Ionicons name="call-outline" size={sc(18)} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Daily Call Limit</Text>
          </View>

          <View style={styles.limitToggleRow}>
            <Text style={[styles.limitToggleText, { color: colors.onSurface }]}>Unlimited calls</Text>
            <Switch
              value={unlimited}
              onValueChange={setUnlimited}
              trackColor={{ false: colors.outlineVariant + '66', true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {!unlimited && (
            <View style={styles.limitStepper}>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
                onPress={() => setMaxCalls(Math.max(1, maxCalls - 1))}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={sc(18)} color={colors.primary} />
              </TouchableOpacity>
              <View style={styles.stepperValueWrap}>
                <Text style={[styles.stepperValue, { color: colors.onSurface }]}>{maxCalls}</Text>
                <Text style={[styles.stepperUnit, { color: colors.onSurfaceVariant }]}>calls / day</Text>
              </View>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
                onPress={() => setMaxCalls(maxCalls + 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={sc(18)} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: sc(32) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sc(18),
    paddingVertical: sc(10),
  },
  headerBtn: {
    width: sc(38),
    height: sc(38),
    borderRadius: sc(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: sc(17), fontWeight: '700', letterSpacing: -0.3 },

  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(6) },

  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sc(6),
    borderRadius: sc(12),
    paddingVertical: sc(10),
    marginBottom: sc(14),
  },
  savedText: { fontSize: sc(14), fontWeight: '600' },

  sectionCard: {
    borderRadius: sc(16),
    padding: sc(16),
    marginBottom: sc(12),
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(12),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(12),
    marginBottom: sc(12),
  },
  sectionIcon: {
    width: sc(34),
    height: sc(34),
    borderRadius: sc(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: sc(15), fontWeight: '700' },
  sectionSubtitle: { fontSize: sc(12), marginTop: sc(2), lineHeight: sc(18) },

  // Days
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sc(4),
    marginBottom: sc(10),
  },
  dayCircle: {
    width: sc(42),
    height: sc(42),
    borderRadius: sc(21),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayCircleText: { fontSize: sc(14), fontWeight: '700' },
  daysSummary: { fontSize: sc(12), fontWeight: '500' },

  // Time
  timeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sc(16),
  },
  twentyFourBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(4),
    borderRadius: sc(14),
    paddingHorizontal: sc(10),
    paddingVertical: sc(6),
  },
  twentyFourText: { fontSize: sc(12), fontWeight: '700' },

  timeBlocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: sc(8),
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeBlockLabel: {
    fontSize: sc(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: sc(8),
  },
  timeWheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(6),
  },
  wheelCol: {
    alignItems: 'center',
    minWidth: sc(44),
  },
  wheelArrow: {
    paddingVertical: sc(4),
    paddingHorizontal: sc(8),
  },
  wheelValue: {
    fontSize: sc(22),
    fontWeight: '800',
    minWidth: sc(30),
    textAlign: 'center',
  },
  wheelUnit: {
    fontSize: sc(10),
    marginTop: sc(2),
  },
  wheelColon: {
    fontSize: sc(20),
    fontWeight: '600',
    paddingBottom: sc(12),
  },
  ampmBtn: {
    borderRadius: sc(8),
    paddingHorizontal: sc(8),
    paddingVertical: sc(4),
    marginVertical: sc(2),
    minWidth: sc(40),
    alignItems: 'center',
  },
  ampmText: { fontSize: sc(12), fontWeight: '700' },

  timeConnector: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: sc(4),
    paddingTop: sc(14),
  },
  dotLine: {
    width: 1,
    height: sc(14),
    borderRadius: 0.5,
  },

  // Limit
  limitToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: sc(4),
  },
  limitToggleText: { fontSize: sc(14), fontWeight: '600' },

  limitStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sc(20),
    marginTop: sc(16),
  },
  stepperBtn: {
    width: sc(44),
    height: sc(44),
    borderRadius: sc(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueWrap: { alignItems: 'center', minWidth: sc(80) },
  stepperValue: { fontSize: sc(28), fontWeight: '800', letterSpacing: -0.5 },
  stepperUnit: { fontSize: sc(11), marginTop: sc(-2), fontWeight: '500' },
});
