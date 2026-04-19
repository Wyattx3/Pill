import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFundraiserAccount, updateFundraiserAccount } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function EditDisplayNameScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [displayName, setDisplayName] = useState('');
  const [originalName, setOriginalName] = useState('');

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    const acc = await getFundraiserAccount();
    if (acc) {
      const name = acc.email?.split('@')[0] || '';
      setOriginalName(name);
      setDisplayName(name);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Required', 'Display name cannot be empty.');
      return;
    }
    if (displayName.length > 30) {
      Alert.alert('Too Long', 'Display name must be 30 characters or less.');
      return;
    }
    await updateFundraiserAccount({ email: displayName.trim() + '@pill.app' });
    Alert.alert('Updated', 'Your display name has been changed successfully.');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Edit Display Name</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '12' }]}>
          <Ionicons name="person" size={sc(48)} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.onSurface }]}>Display Name</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          This is how supporters will see you across the platform
        </Text>

        {/* Input */}
        <View style={styles.form}>
          <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>Current Name</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            <Ionicons name="person-outline" size={sc(18)} color={colors.onSurfaceVariant} />
            <TextInput
              style={[styles.input, { color: colors.onSurface }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              placeholderTextColor={colors.onSurfaceVariant}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          {displayName !== originalName && displayName.trim() ? (
            <Text style={[styles.changedText, { color: colors.primary }]}>
              Will change from "{originalName}" to "{displayName.trim()}"
            </Text>
          ) : null}
        </View>

        {/* Save button */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.saveWrap, { opacity: displayName.trim() && displayName !== originalName ? 1 : 0.4 }]}
            onPress={handleSave}
            disabled={!displayName.trim() || displayName === originalName}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primaryDim, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              <Ionicons name="checkmark-circle" size={sc(18)} color={colors.onPrimary} />
              <Text style={[styles.saveText, { color: colors.onPrimary }]}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingVertical: sc(12) },
  backBtn: { padding: sc(8), minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  topTitle: { fontSize: sc(16), fontWeight: '700' },

  content: { flex: 1, paddingHorizontal: sc(24), paddingTop: sc(32) },
  iconCircle: { width: sc(88), height: sc(88), borderRadius: sc(44), alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: sc(20) },
  title: { fontSize: sc(22), fontWeight: '800', textAlign: 'center', marginBottom: sc(6) },
  subtitle: { fontSize: sc(13), lineHeight: sc(20), textAlign: 'center', marginBottom: sc(32) },

  form: {},
  fieldLabel: { fontSize: sc(11), fontWeight: '600', marginBottom: sc(8), textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(14), borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(10), gap: sc(10) },
  input: { flex: 1, fontSize: sc(15), fontWeight: '600', paddingVertical: sc(4) },
  changedText: { fontSize: sc(12), marginTop: sc(10), textAlign: 'center' },

  bottom: { flex: 1, justifyContent: 'flex-end', paddingBottom: sc(40) },
  saveWrap: { borderRadius: sc(26), overflow: 'hidden' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(14), minHeight: sc(52), borderRadius: sc(26) },
  saveText: { fontSize: sc(15), fontWeight: '700' },
});
