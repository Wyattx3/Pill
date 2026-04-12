import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function PrivacySecurityScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showCloseAccount, setShowCloseAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmText, setConfirmText] = useState('');

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Privacy & Security</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Email Card */}
        <View style={[styles.emailCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={[styles.emailIconWrap, { backgroundColor: colors.primaryContainer + '33' }]}>
            <Ionicons name="mail" size={sc(24)} color={colors.primary} />
          </View>
          <Text style={[styles.emailLabel, { color: colors.onSurfaceVariant }]}>Linked Email</Text>
          <Text style={[styles.emailValue, { color: colors.onSurface }]}>listener@example.com</Text>
          <TouchableOpacity
            style={[styles.emailBtn, { backgroundColor: colors.primary }]}
            onPress={() => { setShowChangeEmail(true); setEmail(''); }}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-horizontal" size={sc(16)} color={colors.onPrimary} />
            <Text style={[styles.emailBtnText, { color: colors.onPrimary }]}>Change Email</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>

        <TouchableOpacity
          style={[styles.dangerCard, { backgroundColor: colors.errorContainer + '11', borderColor: colors.error + '33' }]}
          onPress={() => { setShowCloseAccount(true); setConfirmText(''); }}
          activeOpacity={0.7}
        >
          <View style={styles.dangerRow}>
            <View style={[styles.dangerIconWrap, { backgroundColor: colors.errorContainer + '33' }]}>
              <Ionicons name="trash-outline" size={sc(20)} color={colors.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dangerTitle, { color: colors.error }]}>Close Account</Text>
              <Text style={[styles.dangerDesc, { color: colors.onSurfaceVariant }]}>
                Permanently delete your account and all data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={sc(18)} color={colors.error + '88'} />
          </View>
        </TouchableOpacity>

        {/* Info note */}
        <View style={[styles.infoCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <Ionicons name="information-circle-outline" size={sc(20)} color={colors.onSurfaceVariant} />
          <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
            Closing your account is irreversible. All sessions, earnings, and listener data will be permanently removed.
          </Text>
        </View>
      </ScrollView>

      {/* Change Email Modal */}
      <Modal visible={showChangeEmail} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowChangeEmail(false)} activeOpacity={1}>
            <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLow }]} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconWrap, { backgroundColor: colors.primaryContainer + '33' }]}>
                  <Ionicons name="mail" size={sc(24)} color={colors.primary} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Change Email</Text>
              </View>
              <Text style={[styles.modalDesc, { color: colors.onSurfaceVariant }]}>Enter the new email for this device</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.onSurface, borderColor: colors.outlineVariant + '44' }]}
                value={email}
                onChangeText={setEmail}
                placeholder="newemail@example.com"
                placeholderTextColor={colors.onSurfaceVariant + '66'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity onPress={() => setShowChangeEmail(false)} style={[styles.modalCancel, { borderColor: colors.outlineVariant }]} activeOpacity={0.7}>
                  <Text style={[styles.modalCancelText, { color: colors.onSurfaceVariant }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowChangeEmail(false); setEmail(''); }} style={[styles.modalSave, { backgroundColor: colors.primary }]} activeOpacity={0.7}>
                  <Text style={[styles.modalSaveText, { color: colors.onPrimary }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Close Account Modal */}
      <Modal visible={showCloseAccount} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowCloseAccount(false)} activeOpacity={1}>
            <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLow }]} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconWrap, { backgroundColor: colors.errorContainer + '33' }]}>
                  <Ionicons name="warning" size={sc(24)} color={colors.error} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.error }]}>Close Account</Text>
              </View>
              <Text style={[styles.modalDesc, { color: colors.onSurfaceVariant }]}>
                This is permanent and cannot be undone. Type <Text style={{ fontWeight: '700' }}>CLOSE MY ACCOUNT</Text> to confirm.
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.onSurface, borderColor: confirmText === 'CLOSE MY ACCOUNT' ? colors.error : colors.outlineVariant + '44' }]}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="CLOSE MY ACCOUNT"
                placeholderTextColor={colors.onSurfaceVariant + '66'}
                autoCapitalize="characters"
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity onPress={() => setShowCloseAccount(false)} style={[styles.modalCancel, { borderColor: colors.outlineVariant }]} activeOpacity={0.7}>
                  <Text style={[styles.modalCancelText, { color: colors.onSurfaceVariant }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSave, { backgroundColor: confirmText === 'CLOSE MY ACCOUNT' ? colors.error : colors.outlineVariant, opacity: confirmText === 'CLOSE MY ACCOUNT' ? 1 : 0.5 }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalSaveText, { color: confirmText === 'CLOSE MY ACCOUNT' ? colors.onError : colors.onSurfaceVariant }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(12), paddingTop: sc(8) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(20) },

  // Email Card
  emailCard: { borderRadius: sc(16), padding: sc(20), alignItems: 'center', marginBottom: sc(24) },
  emailIconWrap: { width: sc(56), height: sc(56), borderRadius: sc(28), alignItems: 'center', justifyContent: 'center', marginBottom: sc(12) },
  emailLabel: { fontSize: sc(11), fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: sc(4) },
  emailValue: { fontSize: sc(15), fontWeight: '700', marginBottom: sc(16) },
  emailBtn: { flexDirection: 'row', alignItems: 'center', gap: sc(6), paddingHorizontal: sc(18), paddingVertical: sc(10), borderRadius: sc(22) },
  emailBtnText: { fontSize: sc(13), fontWeight: '700' },

  // Danger Zone
  sectionTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(10) },
  dangerCard: { borderRadius: sc(14), padding: sc(16), marginBottom: sc(14), borderWidth: 1 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: sc(10) },
  dangerIconWrap: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dangerTitle: { fontSize: sc(14), fontWeight: '700' },
  dangerDesc: { fontSize: sc(11), marginTop: sc(2) },

  // Info
  infoCard: { borderRadius: sc(14), padding: sc(16), flexDirection: 'row', gap: sc(10) },
  infoText: { flex: 1, fontSize: sc(11), lineHeight: sc(16) },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { width: '90%' },
  modalContent: { borderRadius: sc(20), padding: sc(20) },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(10), marginBottom: sc(4) },
  modalIconWrap: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: sc(16), fontWeight: '800' },
  modalDesc: { fontSize: sc(12), lineHeight: sc(18), marginBottom: sc(14) },
  modalInput: { borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(14), fontSize: sc(14) },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', gap: sc(12), marginTop: sc(16) },
  modalCancel: { flex: 1, borderRadius: sc(14), paddingVertical: sc(13), alignItems: 'center', borderWidth: 1, minHeight: 48 },
  modalCancelText: { fontSize: sc(14), fontWeight: '700' },
  modalSave: { flex: 1, borderRadius: sc(14), paddingVertical: sc(13), alignItems: 'center', minHeight: 48 },
  modalSaveText: { fontSize: sc(14), fontWeight: '700' },
});
