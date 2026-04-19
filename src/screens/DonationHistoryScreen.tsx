import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { getDonationHistory, DonationRecord } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function DonationHistoryScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [selectedReward, setSelectedReward] = useState<DonationRecord | null>(null);
  const [zoomedImageUri, setZoomedImageUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getDonationHistory().then(setDonations);
    }, [])
  );

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleDownloadImage = async () => {
    if (!zoomedImageUri || downloading) return;
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library permission to save images.');
        return;
      }
      const asset = await MediaLibrary.createAssetAsync(zoomedImageUri);
      const album = await MediaLibrary.getAlbumAsync('download');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album);
      } else {
        await MediaLibrary.createAlbumAsync('download', asset, false);
      }
      Alert.alert('Saved', 'Image saved to your photo library.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save image');
    } finally {
      setDownloading(false);
    }
  };

  const openPost = (postId: string) => {
    navigation.navigate('DonationPostDetail', { postId });
  };

  if (donations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.onSurface }]}>My Donations</Text>
          <View style={{ width: sc(22) }} />
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={sc(48)} color={colors.outlineVariant} />
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No donations yet</Text>
          <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
            Start supporting causes you care about
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('DonationsFeed')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primaryDim, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyBtnInner}
            >
              <Ionicons name="search" size={sc(16)} color={colors.onPrimary} />
              <Text style={[styles.emptyBtnText, { color: colors.onPrimary }]}>Browse Fundraisers</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <BottomNav navigation={navigation} activeScreen="DonationsFeed" theme={theme} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>My Donations</Text>
        <View style={{ width: sc(22) }} />
      </View>

      {/* Donation Cards */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {donations.map((d) => {
          const isMoney = d.donationType === 'money';
          return (
            <TouchableOpacity
              key={d.id}
              style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}
              onPress={() => openPost(d.postId)}
              activeOpacity={0.6}
            >
              {/* Icon */}
              <View style={[styles.cardIcon, { backgroundColor: isMoney ? colors.primary + '15' : colors.tertiary + '15' }]}>
                <Ionicons name={isMoney ? 'cash' : 'play'} size={sc(18)} color={isMoney ? colors.primary : colors.tertiary} />
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text style={[styles.cardTitle, { color: colors.onSurface }]} numberOfLines={1}>
                    {d.postTitle}
                  </Text>
                  <Text style={[styles.cardAmount, { color: isMoney ? colors.primary : colors.tertiary }]}>
                    {isMoney ? `$${d.amount}` : 'Ad Watch'}
                  </Text>
                </View>

                <View style={styles.cardSubRow}>
                  <Text style={[styles.cardCreator, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                    {d.creatorName}
                  </Text>
                  <View style={[styles.dot, { backgroundColor: colors.outlineVariant }]} />
                  <Text style={[styles.cardTime, { color: colors.outlineVariant }]}>
                    {formatDate(d.timestamp)}
                  </Text>
                </View>

                {d.message ? (
                  <Text style={[styles.cardMsg, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                    "{d.message}"
                  </Text>
                ) : null}

                {/* Reward + Certificate chips */}
                <View style={styles.cardActions}>
                  {!!d.rewardTier && (
                    <TouchableOpacity
                      style={[styles.chip, { backgroundColor: colors.primary + '12' }]}
                      onPress={() => setSelectedReward(d)}
                      activeOpacity={0.7}
                    >
                      {d.rewardTier?.imageUrl ? (
                        <Image source={{ uri: d.rewardTier.imageUrl }} style={styles.chipImage} />
                      ) : (
                        <Ionicons name="gift-outline" size={sc(13)} color={colors.primary} />
                      )}
                      <Text style={[styles.chipText, { color: colors.primary }]} numberOfLines={1}>
                        {d.rewardTier?.title}
                      </Text>
                      <Ionicons name="chevron-forward" size={sc(12)} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  {!!d.certificateId && (
                    <TouchableOpacity
                      style={[styles.chip, { backgroundColor: colors.tertiary + '12' }]}
                      onPress={() => Alert.alert('Certificate', `Certificate ID: ${d.certificateId}`)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="download-outline" size={sc(13)} color={colors.tertiary} />
                      <Text style={[styles.chipText, { color: colors.tertiary }]}>Certificate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: sc(80) }} />
      </ScrollView>

      {/* Reward Detail Full Screen */}
      <Modal
        visible={!!selectedReward}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setSelectedReward(null)}
      >
        <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />

          {/* Full screen header */}
          <View style={[styles.fullScreenHeader, { paddingTop: insets.top }]}>
            <TouchableOpacity
              style={[styles.fullScreenBack, { backgroundColor: colors.surfaceContainerHigh }]}
              onPress={() => setSelectedReward(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.fullScreenTitle, { color: colors.onSurface }]}>Reward Details</Text>
            <View style={{ width: sc(38) }} />
          </View>

          <ScrollView contentContainerStyle={styles.fullScreenContent} showsVerticalScrollIndicator={false}>
            {selectedReward?.rewardTier && (
              <>
                {/* Reward image */}
                {selectedReward.rewardTier.imageUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setZoomedImageUri(selectedReward.rewardTier?.imageUrl || null)}
                  >
                    <Image source={{ uri: selectedReward.rewardTier.imageUrl }} style={styles.fullScreenImage} />
                    <View style={styles.zoomHint}>
                      <Ionicons name="expand-outline" size={sc(14)} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.fullScreenIconWrap, { backgroundColor: colors.primary + '12' }]}>
                    <Ionicons name="gift" size={sc(64)} color={colors.primary} />
                  </View>
                )}

                {/* Tier info */}
                <Text style={[styles.fullScreenTierTitle, { color: colors.onSurface }]}>
                  {selectedReward.rewardTier.title}
                </Text>
                <View style={[styles.fullScreenTierBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.fullScreenTierBadgeText, { color: colors.primary }]}>
                    Unlocked at ${selectedReward.rewardTier.minAmount}+
                  </Text>
                </View>
                {selectedReward.rewardTier.description ? (
                  <Text style={[styles.fullScreenTierDesc, { color: colors.onSurfaceVariant }]}>
                    {selectedReward.rewardTier.description}
                  </Text>
                ) : null}

                {/* Donation summary */}
                <View style={[styles.fullScreenSummary, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Text style={[styles.summarySectionTitle, { color: colors.onSurface }]}>Your Donation</Text>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Amount</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>
                      {selectedReward.donationType === 'money' ? `$${selectedReward.amount}` : 'Ad Watch'}
                    </Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: colors.outlineVariant + '30' }]} />
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>To</Text>
                    <Text style={[styles.summaryValue, { color: colors.onSurface }]}>
                      {selectedReward.postTitle}
                    </Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: colors.outlineVariant + '30' }]} />
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Date</Text>
                    <Text style={[styles.summaryValue, { color: colors.onSurface }]}>
                      {formatDate(selectedReward.timestamp)}
                    </Text>
                  </View>
                  {selectedReward.isAnonymous && (
                    <>
                      <View style={[styles.summaryDivider, { backgroundColor: colors.outlineVariant + '30' }]} />
                      <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Status</Text>
                        <View style={[styles.anonFullBadge, { backgroundColor: colors.outlineVariant + '15' }]}>
                          <Ionicons name="eye-off-outline" size={sc(14)} color={colors.onSurfaceVariant} />
                          <Text style={[styles.anonFullText, { color: colors.onSurfaceVariant }]}>Anonymous</Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>

                {/* Certificate */}
                {selectedReward.certificateId && (
                  <View style={[styles.fullScreenCert, { backgroundColor: colors.surfaceContainerLow }]}>
                    <Text style={[styles.summarySectionTitle, { color: colors.onSurface }]}>Certificate</Text>
                    <Text style={[styles.fullScreenCertId, { color: colors.onSurfaceVariant }]}>
                      ID: {selectedReward.certificateId}
                    </Text>
                  </View>
                )}
              </>
            )}
            <View style={{ height: sc(40) }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Zoomed image overlay */}
      <Modal visible={!!zoomedImageUri} transparent animationType="fade">
        <View style={styles.zoomOverlay}>
          <View style={styles.zoomTopBar}>
            <TouchableOpacity
              style={styles.zoomClose}
              onPress={() => setZoomedImageUri(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={sc(28)} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.zoomDownload, { opacity: downloading ? 0.5 : 1 }]}
              onPress={handleDownloadImage}
              disabled={downloading}
              activeOpacity={0.7}
            >
              <Ionicons name={downloading ? 'hourglass' : 'download-outline'} size={sc(28)} color="#fff" />
            </TouchableOpacity>
          </View>
          {zoomedImageUri && (
            <Image source={{ uri: zoomedImageUri }} style={styles.zoomedImage} resizeMode="contain" />
          )}
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
  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(12) },

  // Empty
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sc(32) },
  emptyTitle: { fontSize: sc(18), fontWeight: '700', marginTop: sc(12), marginBottom: sc(4) },
  emptySub: { fontSize: sc(13), textAlign: 'center', marginBottom: sc(20) },
  emptyBtn: { borderRadius: sc(16), overflow: 'hidden' },
  emptyBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(6), paddingVertical: sc(12), paddingHorizontal: sc(20), minHeight: sc(44),
  },
  emptyBtnText: { fontSize: sc(13), fontWeight: '700' },

  // Card
  card: {
    flexDirection: 'row', borderRadius: sc(14), marginBottom: sc(10),
    padding: sc(14), alignItems: 'flex-start',
  },
  cardIcon: {
    width: sc(36), height: sc(36), borderRadius: sc(18),
    alignItems: 'center', justifyContent: 'center', marginRight: sc(12), marginTop: sc(2),
  },
  cardContent: { flex: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: sc(14), fontWeight: '700', flex: 1, lineHeight: sc(20) },
  cardAmount: { fontSize: sc(15), fontWeight: '800', marginLeft: sc(10), textAlign: 'right' },
  cardSubRow: { flexDirection: 'row', alignItems: 'center', gap: sc(5), marginTop: sc(3) },
  cardCreator: { fontSize: sc(12), fontWeight: '500' },
  cardTime: { fontSize: sc(11) },
  dot: { width: sc(3), height: sc(3), borderRadius: sc(1.5) },
  cardMsg: { fontSize: sc(12), lineHeight: sc(18), marginTop: sc(8), fontStyle: 'italic', opacity: 0.7 },

  // Chips
  cardActions: { flexDirection: 'row', gap: sc(6), marginTop: sc(8) },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: sc(4),
    borderRadius: sc(10), paddingHorizontal: sc(10), paddingVertical: sc(5),
  },
  chipImage: { width: 14, height: 14, borderRadius: 7 },
  chipText: { fontSize: 11, fontWeight: '600' },

  // Full screen reward
  fullScreen: { flex: 1 },
  fullScreenHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sc(16), paddingBottom: sc(12),
  },
  fullScreenBack: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  fullScreenTitle: { fontSize: sc(16), fontWeight: '700' },
  fullScreenContent: { paddingHorizontal: sc(18), paddingTop: sc(16) },
  fullScreenImage: { width: '100%', height: sc(200), borderRadius: sc(16), resizeMode: 'cover', marginBottom: sc(20) },
  fullScreenIconWrap: {
    width: sc(100), height: sc(100), borderRadius: sc(50),
    alignItems: 'center', justifyContent: 'center', marginBottom: sc(20),
    alignSelf: 'center',
  },
  fullScreenTierTitle: { fontSize: sc(22), fontWeight: '800', textAlign: 'center', marginBottom: sc(8) },
  fullScreenTierBadge: {
    borderRadius: sc(10), paddingHorizontal: sc(14), paddingVertical: sc(6),
    alignSelf: 'center', marginBottom: sc(12),
  },
  fullScreenTierBadgeText: { fontSize: sc(12), fontWeight: '700' },
  fullScreenTierDesc: { fontSize: sc(14), lineHeight: sc(22), textAlign: 'center', marginBottom: sc(24), opacity: 0.8 },
  fullScreenSummary: { borderRadius: sc(14), padding: sc(16), marginBottom: sc(12) },
  summarySectionTitle: { fontSize: sc(13), fontWeight: '700', marginBottom: sc(10), textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sc(12) },
  summaryLabel: { fontSize: sc(13), fontWeight: '500' },
  summaryValue: { flex: 1, fontSize: sc(13), fontWeight: '700', textAlign: 'right' },
  summaryDivider: { height: 1, marginVertical: sc(8) },
  fullScreenCert: { borderRadius: sc(14), padding: sc(16) },
  fullScreenCertId: { fontSize: sc(12), fontFamily: 'monospace', marginTop: sc(4) },
  anonFullBadge: {
    flexDirection: 'row', alignItems: 'center', gap: sc(4),
    borderRadius: sc(10), paddingHorizontal: sc(10), paddingVertical: sc(4),
  },
  anonFullText: { fontSize: sc(11), fontWeight: '600' },
  zoomOverlay: {
    flex: 1, backgroundColor: '#000000ee', justifyContent: 'center', alignItems: 'center',
  },
  zoomedImage: { width: '90%', height: '60%', borderRadius: sc(16) },
  zoomTopBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    position: 'absolute', top: sc(56), left: sc(20), right: sc(20), zIndex: 1,
  },
  zoomClose: {
    backgroundColor: '#00000066', borderRadius: sc(16), padding: sc(6),
  },
  zoomDownload: {
    backgroundColor: '#00000066', borderRadius: sc(16), padding: sc(6),
  },
  zoomHint: {
    position: 'absolute', right: sc(6), top: sc(6),
    backgroundColor: '#00000066', borderRadius: sc(6),
    width: sc(20), height: sc(20), alignItems: 'center', justifyContent: 'center',
  },
});
