import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { getMyFundraisers, updateMyFundraiser, MyFundraiser } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function FundraiserEditScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const { fundraiserId } = route.params || {};
  const [fundraiser, setFundraiser] = useState<MyFundraiser | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'paused'>('active');

  useEffect(() => {
    loadFundraiser();
  }, [fundraiserId]);

  const loadFundraiser = async () => {
    const fundraisers = await getMyFundraisers();
    const found = fundraisers.find((f) => f.id === fundraiserId);
    if (found) {
      setFundraiser(found);
      setTitle(found.title);
      setDescription(found.description);
      setGoalAmount(String(found.goalAmount));
      setStatus(found.status);
    } else {
      Alert.alert('Not Found', 'Fundraiser not found.');
      navigation.goBack();
    }
  };

  const canSubmit = title.trim().length >= 5 && description.trim().length >= 20 && parseInt(goalAmount, 10) > 0;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setFundraiser((prev) => prev ? { ...prev, imageUrl: result.assets[0].uri } : null);
    }
  };

  const handleSave = async () => {
    if (!canSubmit || !fundraiserId) return;
    await updateMyFundraiser(fundraiserId, {
      title: title.trim(),
      description: description.trim(),
      goalAmount: parseInt(goalAmount, 10),
      status,
      imageUrl: fundraiser?.imageUrl || '',
    });
    Alert.alert('Saved', 'Your fundraiser has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const statusOptions: { value: 'draft' | 'active' | 'completed' | 'paused'; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
  ];

  if (!fundraiser) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Edit Fundraiser</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: canSubmit ? colors.primary : colors.outlineVariant }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={!canSubmit}
        >
          <Text style={[styles.saveBtnText, { color: canSubmit ? colors.onPrimary : colors.surface }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <TouchableOpacity
          style={[styles.imageCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          {fundraiser.imageUrl ? (
            <Image source={{ uri: fundraiser.imageUrl }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={sc(36)} color={colors.outlineVariant} />
              <Text style={[styles.imageText, { color: colors.onSurfaceVariant }]}>Tap to add cover image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Status */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>Status</Text>
          <View style={styles.statusRow}>
            {statusOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.statusChip,
                  { borderColor: colors.outlineVariant },
                  status === opt.value && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '22',
                  },
                ]}
                onPress={() => setStatus(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.statusChipText,
                  { color: status === opt.value ? colors.primary : colors.onSurfaceVariant },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            Title <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface, borderColor: colors.outlineVariant },
            ]}
            placeholder="Fundraiser title"
            placeholderTextColor={colors.onSurfaceVariant}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />
          <Text style={[styles.charCount, { color: colors.onSurfaceVariant }]}>{title.length}/60</Text>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            Description <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface, borderColor: colors.outlineVariant },
            ]}
            placeholder="Tell people about your cause..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
          />
          <Text style={[styles.charCount, { color: colors.onSurfaceVariant }]}>{description.length}/500</Text>
        </View>

        {/* Goal Amount */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            Goal Amount <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View style={[styles.currencyInput, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            <Text style={[styles.currencySymbol, { color: colors.onSurfaceVariant }]}>$</Text>
            <TextInput
              style={[styles.currencyText, { color: colors.onSurface }]}
              placeholder="0"
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="numeric"
              value={goalAmount}
              onChangeText={setGoalAmount}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.deleteWrap, { opacity: 0.7 }]}
          onPress={() => Alert.alert('Delete', 'Are you sure? This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive' },
          ])}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={sc(16)} color={colors.error} />
          <Text style={[styles.deleteText, { color: colors.error }]}>Delete Fundraiser</Text>
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
  saveBtn: { borderRadius: sc(14), paddingHorizontal: sc(16), paddingVertical: sc(6) },
  saveBtnText: { fontSize: sc(14), fontWeight: '700' },
  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: sc(14) },

  imageCard: { borderRadius: sc(14), borderWidth: 1, marginBottom: sc(16), overflow: 'hidden' },
  imagePreview: { width: '100%', height: sc(160), resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: sc(160), alignItems: 'center', justifyContent: 'center' },
  imageText: { fontSize: sc(13), marginTop: sc(8) },

  field: { marginBottom: sc(16) },
  label: { fontSize: sc(13), fontWeight: '600', marginBottom: sc(6) },
  input: {
    borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14),
    paddingVertical: sc(12), fontSize: sc(15),
  },
  textArea: {
    borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14),
    paddingVertical: sc(12), fontSize: sc(14), textAlignVertical: 'top',
    minHeight: sc(100),
  },
  charCount: { fontSize: sc(10), marginTop: sc(4), textAlign: 'right' },
  currencyInput: {
    flexDirection: 'row', alignItems: 'center', borderRadius: sc(12),
    borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(10),
  },
  currencySymbol: { fontSize: sc(20), fontWeight: '700', marginRight: sc(4) },
  currencyText: { fontSize: sc(24), fontWeight: '700', flex: 1 },

  statusRow: { flexDirection: 'row', gap: sc(8), flexWrap: 'wrap' },
  statusChip: {
    borderRadius: sc(16), borderWidth: 1, paddingHorizontal: sc(14),
    paddingVertical: sc(6),
  },
  statusChipText: { fontSize: sc(12), fontWeight: '600' },

  deleteWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(14), marginTop: sc(16),
  },
  deleteText: { fontSize: sc(14), fontWeight: '600' },
});
