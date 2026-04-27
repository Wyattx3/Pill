import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const reasonTypes = [
  { icon: 'sad-outline' as const, label: 'Inappropriate Behavior', desc: 'Disrespectful or offensive conduct' },
  { icon: 'warning' as const, label: 'Abuse or Harassment', desc: 'Hate speech, threats, or abuse' },
  { icon: 'chatbubble-outline' as const, label: 'Not a Support Call', desc: 'Spam, marketing, or unrelated topics' },
  { icon: 'information-circle-outline' as const, label: 'Something Else', desc: "Other issue that doesn't fit above" },
];

export default function SafetyReportScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [details, setDetails] = useState('');

  const canProceed = selectedReason !== null;

  const handleBlockAndReport = () => {
    navigation.navigate('ReportConfirmation', { actionType: 'block' });
  };

  const handleJustReport = () => {
    navigation.navigate('ReportConfirmation', { actionType: 'report' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Safety & Report</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <OtterMascot name="safetyReport" size={sc(118)} containerStyle={styles.headerMascot} />
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Help Us Stay Safe</Text>
          <Text style={[styles.headerDesc, { color: colors.onSurfaceVariant }]}>
            Reports are confidential. The reported user will never know who filed this report.
          </Text>
        </View>

        {/* Reason Selection */}
        <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>What happened?</Text>
        {reasonTypes.map((reason, i) => {
          const isSelected = selectedReason === i;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.reasonRow,
                {
                  backgroundColor: isSelected ? colors.primaryContainer + '44' : colors.surfaceContainerLow,
                  borderColor: isSelected ? colors.primary : colors.outlineVariant + '22',
                  borderWidth: 1.5,
                },
              ]}
              onPress={() => setSelectedReason(i)}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.reasonLeft}>
                <View style={[styles.reasonIcon, { backgroundColor: isSelected ? colors.primary + '22' : colors.surfaceContainerHigh }]}>
                  <Ionicons name={reason.icon} size={sc(20)} color={isSelected ? colors.primary : colors.onSurfaceVariant} />
                </View>
                <View>
                  <Text style={[styles.reasonTitle, { color: colors.onSurface }]}>{reason.label}</Text>
                  <Text style={[styles.reasonDesc, { color: isSelected ? colors.onSurface : colors.onSurfaceVariant }]}>{reason.desc}</Text>
                </View>
              </View>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={sc(20)} color={colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={sc(18)} color={colors.outlineVariant} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Optional Details */}
        {selectedReason !== null && (
          <View style={[styles.detailsCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={[styles.detailsLabel, { color: colors.onSurface }]}>Additional Details</Text>
            <Text style={[styles.detailsSub, { color: colors.onSurfaceVariant }]}>Optional — share what happened</Text>
            <TextInput
              style={[styles.detailsInput, { backgroundColor: colors.surface, color: colors.onSurface, borderColor: colors.outlineVariant + '44' }]}
              value={details}
              onChangeText={setDetails}
              placeholder="Describe the incident..."
              placeholderTextColor={colors.onSurfaceVariant + '66'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Block Confirmation */}
        {canProceed && (
          <View style={[styles.blockCard, { backgroundColor: colors.errorContainer + '11', borderColor: colors.error + '22' }]}>
            <Ionicons name="ban-outline" size={sc(20)} color={colors.error} />
            <Text style={[styles.blockTitle, { color: colors.onSurface }]}>Block this user?</Text>
            <Text style={[styles.blockDesc, { color: colors.onSurfaceVariant }]}>
              This action is permanent. They will never be able to contact you again.
            </Text>
            <View style={styles.blockActions}>
              <TouchableOpacity
                style={[styles.blockButton, { backgroundColor: colors.error }]}
                onPress={handleBlockAndReport}
                activeOpacity={0.7}
              >
                <Ionicons name="ban" size={sc(16)} color={colors.onError} />
                <Text style={[styles.blockButtonText, { color: colors.onError }]}>Block & Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.justReportButton, { backgroundColor: colors.primary }]}
                onPress={handleJustReport}
                activeOpacity={0.7}
              >
                <Ionicons name="paper-plane-outline" size={sc(16)} color={colors.onPrimary} />
                <Text style={[styles.justReportText, { color: colors.onPrimary }]}>Just Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Exit */}
        <TouchableOpacity
          style={[styles.exitButton, { backgroundColor: colors.surfaceContainerLow }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={sc(16)} color={colors.onSurfaceVariant} />
          <Text style={[styles.exitText, { color: colors.onSurfaceVariant }]}>Exit without reporting</Text>
        </TouchableOpacity>

        <View style={{ height: sc(30) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(12) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(10) },

  // Header
  headerCard: { borderRadius: sc(16), padding: sc(20), alignItems: 'center', marginBottom: sc(20) },
  headerMascot: { marginBottom: sc(6) },
  headerTitle: { fontSize: sc(18), fontWeight: '800', marginBottom: sc(6) },
  headerDesc: { fontSize: sc(12), lineHeight: sc(18), textAlign: 'center' },

  // Section label
  sectionLabel: { fontSize: sc(11), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: sc(10) },

  // Reason rows
  reasonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: sc(14), padding: sc(16), marginBottom: sc(10) },
  reasonLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(12) },
  reasonIcon: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reasonTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(2) },
  reasonDesc: { fontSize: sc(11) },

  // Details card
  detailsCard: { borderRadius: sc(14), padding: sc(16), marginBottom: sc(16) },
  detailsLabel: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(2) },
  detailsSub: { fontSize: sc(11), marginBottom: sc(10) },
  detailsInput: { borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(12), fontSize: sc(13), minHeight: sc(80) },

  // Block card
  blockCard: { borderRadius: sc(14), padding: sc(16), marginBottom: sc(12), borderWidth: 1, alignItems: 'center' },
  blockTitle: { fontSize: sc(15), fontWeight: '700', marginTop: sc(6), marginBottom: sc(4) },
  blockDesc: { fontSize: sc(11), textAlign: 'center', marginBottom: sc(14) },
  blockActions: { flexDirection: 'row', gap: sc(10), width: '100%' },
  blockButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(13), borderRadius: sc(26), minHeight: 48 },
  blockButtonText: { fontSize: sc(13), fontWeight: '700' },
  justReportButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(13), borderRadius: sc(26), minHeight: 48 },
  justReportText: { fontSize: sc(13), fontWeight: '700' },

  // Exit
  exitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(14), borderRadius: sc(14), minHeight: 44 },
  exitText: { fontSize: sc(12), fontWeight: '600' },
});
