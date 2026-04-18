import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { GiftTier } from '../utils/donations';
import * as ImagePicker from 'expo-image-picker';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function GiftTiersScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const existingTiers: GiftTier[] = route.params?.tiers || [];

  const [giftTiers, setGiftTiers] = useState<GiftTier[]>(existingTiers);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [tierImage, setTierImage] = useState('');
  const [tierTitle, setTierTitle] = useState('');
  const [tierMinAmount, setTierMinAmount] = useState('');
  const [tierDesc, setTierDesc] = useState('');

  // Update local state if route params change
  useEffect(() => {
    if (route.params?.tiers) {
      setGiftTiers(route.params.tiers);
    }
  }, [route.params?.tiers]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setTierImage(result.assets[0].uri);
    }
  };

  const clearImage = () => setTierImage('');

  const openAddModal = () => {
    setEditIndex(null);
    setTierImage('');
    setTierTitle('');
    setTierMinAmount('');
    setTierDesc('');
    setShowModal(true);
  };

  const openEditModal = (tier: GiftTier, index: number) => {
    setEditIndex(index);
    setTierImage(tier.imageUrl || '');
    setTierTitle(tier.title);
    setTierMinAmount(String(tier.minAmount));
    setTierDesc(tier.description);
    setShowModal(true);
  };

  const saveTier = () => {
    if (!tierTitle.trim() || !tierMinAmount || parseInt(tierMinAmount, 10) <= 0) return;
    const tier: GiftTier = {
      id: editIndex !== null ? giftTiers[editIndex].id : `tier-${Date.now()}`,
      minAmount: parseInt(tierMinAmount, 10),
      title: tierTitle.trim(),
      description: tierDesc.trim(),
      imageUrl: tierImage || '',
    };
    if (editIndex !== null) {
      const updated = [...giftTiers];
      updated[editIndex] = tier;
      setGiftTiers(updated);
    } else {
      setGiftTiers((prev) => [...prev, tier]);
    }
    setShowModal(false);
  };

  const deleteTier = (index: number) => {
    setGiftTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...giftTiers];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setGiftTiers(updated);
  };

  const moveDown = (index: number) => {
    if (index >= giftTiers.length - 1) return;
    const updated = [...giftTiers];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setGiftTiers(updated);
  };

  const handleSave = () => {
    const onTiersComplete = route.params?.onTiersComplete;
    if (typeof onTiersComplete === 'function') {
      onTiersComplete([...giftTiers]);
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Gift Rewards</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: giftTiers.length > 0 ? colors.primary : colors.outlineVariant }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={giftTiers.length === 0}
        >
          <Text style={[styles.saveBtnText, { color: giftTiers.length > 0 ? colors.onPrimary : colors.surface }]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sub, { color: colors.onSurfaceVariant }]}>
          Create custom reward tiers to incentivize donors.
        </Text>

        {giftTiers.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: colors.outlineVariant }]}>
            <Ionicons name="gift-outline" size={sc(48)} color={colors.outlineVariant} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No gift tiers yet</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
              Add rewards to encourage more donations
            </Text>
          </View>
        ) : (
          giftTiers.map((tier, index) => (
            <View key={tier.id} style={[styles.tierCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.tierLeft}>
                {tier.imageUrl ? (
                  <Image source={{ uri: tier.imageUrl }} style={styles.tierImage} />
                ) : (
                  <View style={[styles.tierImagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="gift-outline" size={sc(28)} color={colors.primary} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tierTitle, { color: colors.onSurface }]}>{tier.title}</Text>
                  <Text style={[styles.tierDesc, { color: colors.onSurfaceVariant }]}>{tier.description}</Text>
                  <Text style={[styles.tierMin, { color: colors.primary }]}>Min. ${tier.minAmount}</Text>
                </View>
              </View>
              <View style={styles.tierActions}>
                {index > 0 && (
                  <TouchableOpacity onPress={() => moveUp(index)} style={styles.actionBtn}>
                    <Ionicons name="chevron-up" size={sc(16)} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
                {index < giftTiers.length - 1 && (
                  <TouchableOpacity onPress={() => moveDown(index)} style={styles.actionBtn}>
                    <Ionicons name="chevron-down" size={sc(16)} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => openEditModal(tier, index)} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={sc(16)} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTier(index)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={sc(16)} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addBtnWrap} onPress={openAddModal} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addBtn}
          >
            <Ionicons name="add-circle" size={sc(18)} color={colors.onPrimary} />
            <Text style={[styles.addBtnText, { color: colors.onPrimary }]}>Add Gift Tier</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: sc(40) }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                {editIndex !== null ? 'Edit Gift Tier' : 'New Gift Tier'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={sc(24)} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.onSurface }]}>Reward Image (optional)</Text>
              {tierImage ? (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: tierImage }} style={styles.imagePreview} />
                  <TouchableOpacity onPress={clearImage} style={styles.imageClearBtn}>
                    <Ionicons name="close-circle" size={sc(24)} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ) : null}
              <TouchableOpacity
                style={[styles.imagePickBtn, { borderColor: colors.outlineVariant }]}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <Ionicons name="image-outline" size={sc(18)} color={colors.primary} />
                <Text style={[styles.imagePickText, { color: colors.primary }]}>
                  {tierImage ? 'Change Image' : 'Choose Image'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.onSurface }]}>Tier Title</Text>
              <TextInput
                style={[styles.modalInput, {
                  backgroundColor: colors.surfaceContainerHigh,
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant,
                }]}
                placeholder="e.g. Supporter Badge"
                placeholderTextColor={colors.onSurfaceVariant}
                value={tierTitle}
                onChangeText={setTierTitle}
                maxLength={30}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.onSurface }]}>Minimum Donation ($)</Text>
              <TextInput
                style={[styles.modalInput, {
                  backgroundColor: colors.surfaceContainerHigh,
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant,
                }]}
                placeholder="e.g. 25"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="numeric"
                value={tierMinAmount}
                onChangeText={setTierMinAmount}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.onSurface }]}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea, {
                  backgroundColor: colors.surfaceContainerHigh,
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant,
                }]}
                placeholder="e.g. Thank you card + digital badge"
                placeholderTextColor={colors.onSurfaceVariant}
                value={tierDesc}
                onChangeText={setTierDesc}
                multiline
                maxLength={100}
              />
            </View>

            <TouchableOpacity
              style={[styles.modalBtnWrap, { opacity: (tierTitle.trim() && tierMinAmount) ? 1 : 0.5 }]}
              onPress={saveTier}
              disabled={!tierTitle.trim() || !tierMinAmount}
            >
              <LinearGradient
                colors={[colors.primaryDim, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalBtn}
              >
                <Text style={[styles.modalBtnText, { color: colors.onPrimary }]}>
                  {editIndex !== null ? 'Update Tier' : 'Add Tier'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav navigation={navigation} activeScreen="DonationsFeed" theme={theme} />
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
  sub: { fontSize: sc(13), marginBottom: sc(16), lineHeight: sc(20) },

  emptyState: {
    alignItems: 'center', paddingVertical: sc(32), borderRadius: sc(16),
    borderWidth: 1, borderStyle: 'dashed', marginBottom: sc(16),
  },
  emptyTitle: { fontSize: sc(18), fontWeight: '700', marginTop: sc(8), marginBottom: sc(4) },
  emptySub: { fontSize: sc(13), textAlign: 'center' },

  tierCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    borderRadius: sc(12), padding: sc(14), marginBottom: sc(8),
  },
  tierLeft: { flexDirection: 'row', gap: sc(12), flex: 1 },
  tierImage: { width: sc(48), height: sc(48), borderRadius: sc(10), resizeMode: 'cover' },
  tierImagePlaceholder: { width: sc(48), height: sc(48), borderRadius: sc(10), alignItems: 'center', justifyContent: 'center' },
  tierTitle: { fontSize: sc(13), fontWeight: '700', marginBottom: sc(2) },
  tierDesc: { fontSize: sc(11), lineHeight: sc(16), marginBottom: sc(4) },
  tierMin: { fontSize: sc(11), fontWeight: '700' },
  tierActions: { alignItems: 'flex-end', gap: sc(6) },
  actionBtn: { padding: sc(4) },

  addBtnWrap: { borderRadius: sc(24), overflow: 'hidden', marginTop: sc(16) },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(14), minHeight: sc(48),
  },
  addBtnText: { fontSize: sc(14), fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#00000080', justifyContent: 'flex-end' },
  modalContent: { borderRadius: sc(24), padding: sc(20), paddingBottom: sc(32) },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sc(16) },
  modalTitle: { fontSize: sc(18), fontWeight: '800' },
  modalField: { marginBottom: sc(12) },
  modalLabel: { fontSize: sc(12), fontWeight: '600', marginBottom: sc(6) },
  modalInput: {
    borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14),
    paddingVertical: sc(12), fontSize: sc(14),
  },
  modalTextArea: { minHeight: sc(60), textAlignVertical: 'top' },
  imagePreviewWrap: { flexDirection: 'row', alignItems: 'center', gap: sc(10), marginBottom: sc(8) },
  imagePreview: { width: sc(60), height: sc(60), borderRadius: sc(12), resizeMode: 'cover' },
  imageClearBtn: { padding: sc(2) },
  imagePickBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8),
    borderRadius: sc(12), borderWidth: 1, paddingVertical: sc(12),
  },
  imagePickText: { fontSize: sc(13), fontWeight: '600' },
  modalBtnWrap: { borderRadius: sc(20), overflow: 'hidden', marginTop: sc(12) },
  modalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: sc(14), minHeight: sc(48),
  },
  modalBtnText: { fontSize: sc(15), fontWeight: '700' },
});
