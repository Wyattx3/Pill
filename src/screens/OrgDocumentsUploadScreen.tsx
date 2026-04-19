import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { setOrgVerified } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function OrgDocumentsUploadScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [certificate, setCertificate] = useState('');
  const [groupPhoto1, setGroupPhoto1] = useState('');
  const [groupPhoto2, setGroupPhoto2] = useState('');

  const canSubmit = certificate && groupPhoto1 && groupPhoto2;

  const pickImage = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setter(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await setOrgVerified({ certificate, groupPhoto1, groupPhoto2 });
    Alert.alert(
      'Organization Verified',
      'Your organization has been verified. You now have a blue verification badge.',
      [{ text: 'Continue', onPress: () => navigation.navigate('MyFundraiser') }]
    );
  };

  const UploadCard = ({ label, uri, setter }: { label: string; uri: string; setter: (v: string) => void }) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.uploadCard, { backgroundColor: colors.surfaceContainerLow, borderColor: uri ? colors.primary : colors.outlineVariant }]}
        onPress={() => pickImage(setter)}
        activeOpacity={0.7}
      >
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.uploadPreview} />
            <View style={styles.uploadActions}>
              <Ionicons name="checkmark-circle" size={sc(20)} color={colors.primary} />
              <Text style={[styles.uploadSuccessText, { color: colors.primary }]}>Uploaded</Text>
            </View>
          </>
        ) : (
          <>
            <Ionicons name="image-outline" size={sc(36)} color={colors.outlineVariant} />
            <Text style={[styles.uploadText, { color: colors.onSurfaceVariant }]}>Tap to select</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Organization Docs</Text>
        <View style={{ width: sc(22) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="business-outline" size={sc(48)} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.onSurface }]}>Organization Verification</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Upload your organization certificate and two group photos to complete the verification process.
        </Text>

        <UploadCard label="Organization Certificate *" uri={certificate} setter={setCertificate} />
        <UploadCard label="Group Photo 1 *" uri={groupPhoto1} setter={setGroupPhoto1} />
        <UploadCard label="Group Photo 2 *" uri={groupPhoto2} setter={setGroupPhoto2} />

        <TouchableOpacity
          style={[styles.btnWrap, { opacity: canSubmit ? 1 : 0.4 }]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Ionicons name="shield-checkmark" size={sc(18)} color={colors.onPrimary} />
            <Text style={[styles.btnText, { color: colors.onPrimary }]}>Complete Organization Verification</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sc(16), paddingBottom: sc(12),
  },
  topTitle: { fontSize: sc(16), fontWeight: '700' },
  scrollContent: { paddingHorizontal: sc(24), paddingTop: sc(20) },
  iconWrap: { alignItems: 'center', marginBottom: sc(16) },
  iconCircle: {
    width: sc(80), height: sc(80), borderRadius: sc(40),
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: sc(22), fontWeight: '800', textAlign: 'center', marginBottom: sc(8) },
  subtitle: { fontSize: sc(14), lineHeight: sc(22), textAlign: 'center', marginBottom: sc(24) },
  field: { marginBottom: sc(16) },
  label: { fontSize: sc(13), fontWeight: '600', marginBottom: sc(6) },
  uploadCard: {
    borderRadius: sc(12), borderWidth: 1, alignItems: 'center',
    justifyContent: 'center', padding: sc(20), minHeight: sc(120),
  },
  uploadPreview: { width: '100%', height: sc(120), borderRadius: sc(8), resizeMode: 'cover', marginBottom: sc(8) },
  uploadActions: { flexDirection: 'row', alignItems: 'center', gap: sc(6) },
  uploadText: { fontSize: sc(14), marginTop: sc(8) },
  uploadSuccessText: { fontSize: sc(14), fontWeight: '600' },
  btnWrap: { borderRadius: sc(24), overflow: 'hidden', marginTop: sc(16) },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(15), minHeight: sc(52),
  },
  btnText: { fontSize: sc(15), fontWeight: '700' },
});
