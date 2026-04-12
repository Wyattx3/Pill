import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const avatarOptions = [
  { id: 0, name: 'Willow', color: '#a8d5ba', emoji: '🌿' },
  { id: 1, name: 'Stone', color: '#b0bec5', emoji: '🪨' },
  { id: 2, name: 'Luna', color: '#c5cae9', emoji: '🌙' },
  { id: 3, name: 'Ember', color: '#ffccbc', emoji: '🔥' },
  { id: 4, name: 'River', color: '#b2ebf2', emoji: '🌊' },
  { id: 5, name: 'Sage', color: '#dcedc8', emoji: '🌱' },
  { id: 6, name: 'Cedar', color: '#d7ccc8', emoji: '🌲' },
  { id: 7, name: 'Dawn', color: '#fff9c4', emoji: '🌅' },
  { id: 8, name: 'Fern', color: '#a5d6a7', emoji: '🍃' },
  { id: 9, name: 'Ash', color: '#cfd8dc', emoji: '🍂' },
  { id: 10, name: 'Sky', color: '#bbdefb', emoji: '☁️' },
  { id: 11, name: 'Moss', color: '#80cbc4', emoji: '🪴' },
  { id: 12, name: 'Flint', color: '#bcaaa4', emoji: '🌑' },
  { id: 13, name: 'Pearl', color: '#f3e5f5', emoji: '✨' },
  { id: 14, name: 'Coral', color: '#ffab91', emoji: '🐚' },
  { id: 15, name: 'Hazel', color: '#a1887f', emoji: '🌰' },
  { id: 16, name: 'Ivy', color: '#81c784', emoji: '🍀' },
  { id: 17, name: 'Storm', color: '#90a4ae', emoji: '⛈️' },
  { id: 18, name: 'Breeze', color: '#80deea', emoji: '🌬️' },
  { id: 19, name: 'Rain', color: '#9fa8da', emoji: '🌧️' },
];

export default function AvatarSelectorScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);

  const selected = selectedAvatar !== null ? avatarOptions[selectedAvatar] : null;
  const currentName = displayName || (selected ? selected.name : '');

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative BG */}
      <View style={[styles.bgBlur1, { backgroundColor: colors.primaryContainer + '14' }]} pointerEvents="none" />
      <View style={[styles.bgBlur2, { backgroundColor: colors.tertiaryContainer + '10' }]} pointerEvents="none" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Create Your Identity</Text>
          <Text style={[styles.topBarSubtitle, { color: colors.primary }]}>Step 2 of 2</Text>
        </View>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ====== Large Preview Card ====== */}
        <View style={[styles.previewCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '22' }]}>
          <View style={[
            styles.previewAvatar,
            selected
              ? { backgroundColor: selected.color, borderColor: selected.color + '88' }
              : { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant + '44' }
          ]}>
            {selected ? (
              <Text style={styles.previewEmoji}>{selected.emoji}</Text>
            ) : (
              <Ionicons name="person-outline" size={sc(40)} color={colors.onSurfaceVariant} />
            )}
          </View>

          {/* Name Display */}
          <Text style={[styles.previewName, { color: colors.onSurface }]} numberOfLines={1}>
            {currentName || 'Your Name'}
          </Text>
          <Text style={[styles.previewSubtitle, { color: colors.onSurfaceVariant }]}>
            {selected ? `${selected.name} • ${selected.emoji}` : 'Pick an avatar below'}
          </Text>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: colors.surface }]}>
            <Ionicons
              name={selectedAvatar !== null ? 'checkmark-circle' : 'information-circle'}
              size={sc(14)}
              color={selectedAvatar !== null ? colors.primary : colors.outline}
            />
            <Text style={[
              styles.statusText,
              selectedAvatar !== null && styles.statusTextActive,
              { color: selectedAvatar !== null ? colors.primary : colors.outline }
            ]}>
              {selectedAvatar !== null ? 'Ready to go' : 'Select an avatar to continue'}
            </Text>
          </View>
        </View>

        {/* ====== Display Name Input ====== */}
        <View style={styles.nameSection}>
          <Text style={[styles.sectionLabel, { color: colors.onSurface }]}>Display Name</Text>
          <View style={[
            styles.nameInputCard,
            { backgroundColor: colors.surfaceContainerLow, borderColor: nameFocused ? colors.primary + '66' : colors.outlineVariant + '22' },
            nameFocused && { backgroundColor: colors.surfaceContainerLowest }
          ]}>
            <Ionicons
              name={nameFocused ? 'create' : 'create-outline'}
              size={sc(18)}
              color={nameFocused ? colors.primary : colors.onSurfaceVariant}
            />
            <TextInput
              style={[styles.nameInput, { color: colors.onSurface }]}
              placeholder="How should we call you?"
              placeholderTextColor={colors.onSurfaceVariant + '66'}
              value={displayName}
              onChangeText={setDisplayName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              autoCapitalize="words"
              maxLength={20}
              clearButtonMode="while-editing"
            />
            {displayName.length > 0 && !nameFocused && (
              <TouchableOpacity onPress={() => setDisplayName('')} activeOpacity={0.5} style={styles.clearName}>
                <Ionicons name="close-circle" size={sc(18)} color={colors.outline} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.nameHint, { color: colors.onSurfaceVariant }]}>{displayName.length}/20 characters</Text>
        </View>

        {/* ====== Avatar Grid ====== */}
        <View style={styles.avatarSection}>
          <Text style={[styles.sectionLabel, { color: colors.onSurface }]}>Choose Your Avatar</Text>
          <Text style={[styles.avatarSectionHint, { color: colors.onSurfaceVariant }]}>
            Tap to select • {avatarOptions.length} options
          </Text>
          <View style={styles.avatarGrid}>
            {avatarOptions.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              return (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarCard,
                    isSelected && { backgroundColor: colors.primaryContainer + '1A' }
                  ]}
                  onPress={() => setSelectedAvatar(avatar.id)}
                  activeOpacity={0.75}
                >
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
                      <Ionicons name="checkmark" size={sc(12)} color="#fff" />
                    </View>
                  )}
                  <View style={[
                    styles.avatarCircle,
                    { backgroundColor: avatar.color },
                    isSelected && { borderWidth: 2.5, borderColor: colors.primary + '55' }
                  ]}>
                    <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                  </View>
                  <Text style={[
                    styles.avatarName,
                    { color: isSelected ? colors.primary : colors.onSurfaceVariant },
                    isSelected && { fontWeight: '700' }
                  ]}>
                    {avatar.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ====== Complete Button ====== */}
        <TouchableOpacity
          style={[styles.nextButton, selectedAvatar === null && { opacity: 0.6 }]}
          onPress={() => navigation.navigate('ListenerDashboard')}
          disabled={selectedAvatar === null}
          activeOpacity={selectedAvatar !== null ? 0.8 : 0.5}
        >
          <LinearGradient
            colors={selectedAvatar !== null
              ? [colors.primary, colors.primaryContainer]
              : [colors.outlineVariant + '44', colors.surfaceContainerHigh]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
            pointerEvents="none"
          >
            <Text style={[styles.nextButtonText, { color: selectedAvatar !== null ? colors.onPrimary : colors.outline }]}>
              {selectedAvatar !== null ? 'Complete Setup' : 'Select an Avatar First'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={sc(18)}
              color={selectedAvatar !== null ? colors.onPrimary : colors.outline}
            />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  bgBlur1: { position: 'absolute', top: -sc(80), right: -sc(40), width: sc(220), height: sc(220), borderRadius: sc(110) },
  bgBlur2: { position: 'absolute', bottom: sc(100), left: -sc(60), width: sc(180), height: sc(180), borderRadius: sc(90) },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: sc(20), paddingBottom: sc(16), paddingTop: sc(4) },
  backButton: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(17), fontWeight: '800', letterSpacing: -0.3 },
  topBarSubtitle: { fontSize: sc(11), fontWeight: '600', marginTop: 2 },

  scrollContent: { paddingHorizontal: sc(20), paddingTop: sc(4) },

  previewCard: { alignItems: 'center', borderRadius: sc(24), paddingVertical: sc(28), paddingHorizontal: sc(20), marginBottom: sc(24), borderWidth: 1, overflow: 'hidden' },
  previewAvatar: { width: sc(96), height: sc(96), borderRadius: sc(48), alignItems: 'center', justifyContent: 'center', marginBottom: sc(16), borderWidth: 3 },
  previewEmoji: { fontSize: sc(44) },
  previewName: { fontSize: sc(22), fontWeight: '800', letterSpacing: -0.5, marginBottom: sc(4) },
  previewSubtitle: { fontSize: sc(12), marginBottom: sc(16) },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: sc(6), paddingHorizontal: sc(14), paddingVertical: sc(7), borderRadius: sc(20) },
  statusText: { fontSize: sc(11), fontWeight: '700' },
  statusTextActive: {},

  nameSection: { marginBottom: sc(24) },
  sectionLabel: { fontSize: sc(12), fontWeight: '700', marginBottom: sc(8), letterSpacing: 0.3 },
  nameInputCard: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(16), paddingHorizontal: sc(16), paddingVertical: sc(2), minHeight: sc(52), gap: sc(12), borderWidth: 1.5 },
  nameInput: { flex: 1, fontSize: sc(16), fontWeight: '500', paddingVertical: sc(12) },
  clearName: { padding: sc(4) },
  nameHint: { fontSize: sc(10), marginTop: sc(6), textAlign: 'right' },

  avatarSection: { marginBottom: sc(20) },
  avatarSectionHint: { fontSize: sc(11), marginBottom: sc(12) },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(8) },
  avatarCard: { width: (W - sc(40) - sc(24)) / 4, alignItems: 'center', paddingVertical: sc(12), borderRadius: sc(16), position: 'relative' },
  avatarCircle: { width: sc(52), height: sc(52), borderRadius: sc(26), alignItems: 'center', justifyContent: 'center', marginBottom: sc(8) },
  avatarEmoji: { fontSize: sc(24) },
  avatarName: { fontSize: sc(10), fontWeight: '600', textAlign: 'center' },
  checkBadge: { position: 'absolute', top: 0, right: sc(2), width: sc(18), height: sc(18), borderRadius: sc(9), alignItems: 'center', justifyContent: 'center', borderWidth: 2, zIndex: 1 },

  nextButton: { borderRadius: sc(20), overflow: 'hidden', marginTop: sc(12) },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(10), paddingVertical: sc(16), paddingHorizontal: sc(24), minHeight: sc(56) },
  nextButtonText: { fontSize: sc(15), fontWeight: '800', letterSpacing: 0.3 },
});
