import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const AVATAR_OPTIONS = [
  { name: 'Stone', emoji: '🪨' },
  { name: 'Calm', emoji: '🌿' },
  { name: 'Sky', emoji: '☁️' },
  { name: 'River', emoji: '🌊' },
  { name: 'Dawn', emoji: '🌅' },
  { name: 'Fern', emoji: '🍃' },
  { name: 'Cedar', emoji: '🌲' },
  { name: 'Ash', emoji: '🍂' },
  { name: 'Ocean', emoji: '🌊' },
];

export default function EditProfileScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  const [accountName, setAccountName] = useState('Stone');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = () => {
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
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.primary }]} activeOpacity={0.7}>
          <Ionicons name="checkmark" size={sc(16)} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {/* Avatar Hero */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primaryContainer + '33' }]}>
          <Text style={{ fontSize: sc(56) }}>{AVATAR_OPTIONS[selectedAvatar].emoji}</Text>
        </View>
        <TouchableOpacity
          style={[styles.changeAvatarBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowPicker(!showPicker)}
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={sc(14)} color={colors.onPrimary} />
          <Text style={[styles.changeAvatarText, { color: colors.onPrimary }]}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Picker (inline) */}
      {showPicker && (
        <View style={[styles.pickerCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <Text style={[styles.pickerTitle, { color: colors.onSurface }]}>Choose Avatar</Text>
          <View style={styles.avatarRow}>
            {AVATAR_OPTIONS.map((av, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.pickerItem,
                  {
                    backgroundColor: selectedAvatar === i ? colors.primaryContainer : colors.surface,
                    borderColor: selectedAvatar === i ? colors.primary : colors.outlineVariant + '33',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => { setSelectedAvatar(i); setShowPicker(false); }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: sc(24) }}>{av.emoji}</Text>
                <Text
                  style={[
                    styles.pickerLabel,
                    { color: selectedAvatar === i ? colors.onPrimaryContainer : colors.onSurfaceVariant },
                  ]}
                >
                  {av.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Name Input */}
      <View style={[styles.inputCard, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={styles.inputHeader}>
          <Ionicons name="create-outline" size={sc(18)} color={colors.primary} />
          <Text style={[styles.inputTitle, { color: colors.onSurface }]}>Account Name</Text>
        </View>
        <Text style={[styles.inputDesc, { color: colors.onSurfaceVariant }]}>This is how talkers will see you</Text>
        <TextInput
          style={[styles.nameInput, { backgroundColor: colors.surface, color: colors.onSurface, borderColor: colors.outlineVariant + '44' }]}
          value={accountName}
          onChangeText={setAccountName}
          placeholder="Enter your name"
          placeholderTextColor={colors.onSurfaceVariant + '66'}
          maxLength={20}
          autoCapitalize="words"
        />
        <Text style={[styles.charCount, { color: colors.onSurfaceVariant }]}>{accountName.length}/20</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(12), paddingTop: sc(8) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  saveButton: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },

  // Avatar hero
  avatarSection: { alignItems: 'center', marginTop: sc(24), marginBottom: sc(20) },
  avatarCircle: { width: sc(96), height: sc(96), borderRadius: sc(48), alignItems: 'center', justifyContent: 'center' },
  changeAvatarBtn: { flexDirection: 'row', alignItems: 'center', gap: sc(4), paddingHorizontal: sc(14), paddingVertical: sc(6), borderRadius: sc(16), marginTop: sc(12) },
  changeAvatarText: { fontSize: sc(11), fontWeight: '700' },

  // Inline picker
  pickerCard: { borderRadius: sc(16), padding: sc(16), marginBottom: sc(16), marginHorizontal: sc(18) },
  pickerTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(12), textAlign: 'center' },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(8), justifyContent: 'center' },
  pickerItem: { width: sc(68), height: sc(78), borderRadius: sc(14), alignItems: 'center', justifyContent: 'center', gap: sc(4) },
  pickerLabel: { fontSize: sc(9), fontWeight: '600' },

  // Input card
  inputCard: { borderRadius: sc(16), padding: sc(18), marginBottom: sc(14), marginHorizontal: sc(18) },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(8), marginBottom: sc(4) },
  inputTitle: { fontSize: sc(14), fontWeight: '700' },
  inputDesc: { fontSize: sc(11), marginBottom: sc(12) },
  nameInput: { borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(14), fontSize: sc(16), fontWeight: '600' },
  charCount: { fontSize: sc(10), textAlign: 'right', marginTop: sc(4) },
});
