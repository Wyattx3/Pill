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
import ViewShot from 'react-native-view-shot';
import BottomNav from '../components/BottomNav';
import { getDonationHistory, DonationRecord } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));
const CERTIFICATE_WIDTH = Math.min(W - sc(28), sc(360));
const CERTIFICATE_HEIGHT = Math.round(CERTIFICATE_WIDTH * 1.42);
const logoMark = require('../../assets/brand/logo-mark.png');
const logoText = require('../../assets/brand/logo-text.png');

export default function DonationHistoryScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [selectedReward, setSelectedReward] = useState<DonationRecord | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<DonationRecord | null>(null);
  const [zoomedImageUri, setZoomedImageUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<ViewShot | null>(null);

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

  const formatCertificateAmount = (donation: DonationRecord) => {
    if (donation.donationType === 'money') {
      return `$${donation.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `$${donation.amount.toLocaleString('en-US')} ad-funded gift`;
  };

  const getCertificateId = (donation: DonationRecord) => {
    if (donation.certificateId) return donation.certificateId;
    const suffix = donation.id.replace(/[^a-z0-9]/gi, '').slice(-6).toLowerCase() || 'gift';
    return `cert-${donation.timestamp}-${suffix}`;
  };

  const makeVerificationCode = (donation: DonationRecord) => {
    const raw = `${getCertificateId(donation)}-${donation.postId}-${donation.amount}-${donation.timestamp}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16).toUpperCase().padStart(8, '0');
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

  const handleSaveCertificatePhoto = async () => {
    if (!selectedCertificate || downloading) return;
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library permission to save certificates.');
        return;
      }

      const uri = await certificateRef.current?.capture?.();
      if (!uri) {
        throw new Error('Certificate preview is not ready yet.');
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('Pill Certificates');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album);
      } else {
        await MediaLibrary.createAlbumAsync('Pill Certificates', asset, false);
      }
      Alert.alert('Saved', 'Donation certificate saved to your photo library.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save certificate');
    } finally {
      setDownloading(false);
    }
  };

  const openPost = (postId: string) => {
    navigation.navigate('DonationPostDetail', { postId });
  };

  const renderCertificate = (donation: DonationRecord) => {
    const certId = getCertificateId(donation);
    const verificationCode = makeVerificationCode(donation);
    const donorDisplay = donation.donorName || 'Anonymous Supporter';
    const contributionType = donation.donationType === 'money' ? 'Direct donation' : 'Ad watch donation';
    const issuedAt = new Date(donation.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <ViewShot
        ref={certificateRef}
        options={{ format: 'png', quality: 1, result: 'tmpfile' }}
        style={styles.certificateShot}
      >
        <View collapsable={false} style={styles.donationDocument}>
          <LinearGradient
            colors={['#fdfbfb', '#ebedee']}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Hologram Effect Background Layers */}
          <LinearGradient
            colors={['rgba(255,154,158,0.06)', 'rgba(254,207,239,0.06)', 'rgba(253,203,110,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['rgba(161,196,253,0.06)', 'rgba(194,233,251,0.06)', 'rgba(207,217,223,0.06)']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <View pointerEvents="none" style={styles.certificateWatermark}>
            {Array.from({ length: 48 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.watermarkTile,
                  {
                    left: -sc(20) + (i % 6) * sc(60),
                    top: -sc(20) + Math.floor(i / 6) * sc(65),
                    opacity: (i % 3 === 0) ? 0.06 : 0.03,
                    transform: [{ rotate: i % 2 === 0 ? '-15deg' : '15deg' }, { scale: i % 2 === 0 ? 0.8 : 1.2 }],
                  },
                ]}
              >
                <Image source={logoMark} style={[styles.watermarkMark, { tintColor: i % 3 === 0 ? '#007AFF' : '#5856D6' }]} resizeMode="contain" />
                <Image source={logoText} style={[styles.watermarkTextLogo, { tintColor: i % 3 === 0 ? '#34C759' : '#FF9500' }]} resizeMode="contain" />
              </View>
            ))}
            <Image source={logoMark} style={styles.centerWatermarkMark} resizeMode="contain" />
            <Image source={logoText} style={styles.centerWatermarkText} resizeMode="contain" />
          </View>

          <Text style={styles.microTextTop} numberOfLines={1}>
            SECURE DONATION RECORD • {verificationCode} • {certId.toUpperCase()} • SECURE DONATION RECORD
          </Text>
          <Text style={styles.microTextBottom} numberOfLines={1}>
            {certId.toUpperCase()} • PILL LEDGER • AUTHENTICATED • {verificationCode}
          </Text>

          <View style={styles.documentContent}>
            <View style={styles.documentHeader}>
              <View style={styles.documentBrand}>
                <Image source={logoMark} style={styles.documentLogoMark} resizeMode="contain" />
                <Image source={logoText} style={styles.documentLogoText} resizeMode="contain" />
              </View>
              <View style={styles.documentIssueBox}>
                <Text style={styles.issueLabel}>CERTIFICATE NO.</Text>
                <Text style={styles.issueValue} numberOfLines={2}>{certId.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.officialTitle}>Certificate of Donation</Text>
              <Text style={styles.officialSubtitle}>This is to certify that</Text>
            </View>

            <View style={styles.donorPanel}>
              <Text style={styles.certDonor} numberOfLines={1}>{donorDisplay}</Text>
            </View>

            <Text style={styles.certStatement}>has generously donated</Text>
            <Text style={styles.certAmount}>{formatCertificateAmount(donation)}</Text>
            <Text style={styles.certStatement}>to support the cause</Text>
            <Text style={styles.certFundraiser} numberOfLines={2}>{donation.postTitle}</Text>

            <View style={styles.documentTable}>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableLabel}>Organizer</Text>
                  <Text style={styles.tableValue} numberOfLines={1}>{donation.creatorName}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableLabel}>Date</Text>
                  <Text style={styles.tableValue}>{formatDate(donation.timestamp)}</Text>
                </View>
              </View>
              <View style={styles.tableDivider} />
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableLabel}>Type</Text>
                  <Text style={styles.tableValue}>{contributionType}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableLabel}>Time</Text>
                  <Text style={styles.tableValue}>{issuedAt}</Text>
                </View>
              </View>
            </View>

            <View style={styles.securityBand}>
              <View style={styles.securitySealWrapper}>
                <Image source={logoMark} style={styles.officialSealLogo} resizeMode="contain" />
              </View>
              <View style={styles.securityTextBlock}>
                <Text style={styles.securityLabel}>AUTHENTICITY HASH</Text>
                <Text style={styles.securityCode}>{verificationCode}</Text>
              </View>
            </View>
          </View>
        </View>
      </ViewShot>
    );
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
                  <TouchableOpacity
                    style={[styles.chip, { backgroundColor: colors.tertiary + '12' }]}
                    onPress={() => setSelectedCertificate(d)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="ribbon-outline" size={sc(13)} color={colors.tertiary} />
                    <Text style={[styles.chipText, { color: colors.tertiary }]}>Certificate</Text>
                    <Ionicons name="chevron-forward" size={sc(12)} color={colors.tertiary} />
                  </TouchableOpacity>
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

                <TouchableOpacity
                  style={[styles.fullScreenCert, { backgroundColor: colors.surfaceContainerLow }]}
                  onPress={() => {
                    setSelectedCertificate(selectedReward);
                    setSelectedReward(null);
                  }}
                  activeOpacity={0.72}
                >
                  <View style={styles.certOpenRow}>
                    <View>
                      <Text style={[styles.summarySectionTitle, { color: colors.onSurface }]}>Certificate</Text>
                      <Text style={[styles.fullScreenCertId, { color: colors.onSurfaceVariant }]}>
                        ID: {getCertificateId(selectedReward)}
                      </Text>
                    </View>
                    <Ionicons name="ribbon-outline" size={sc(22)} color={colors.tertiary} />
                  </View>
                </TouchableOpacity>
              </>
            )}
            <View style={{ height: sc(40) }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Certificate document preview */}
      <Modal
        visible={!!selectedCertificate}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setSelectedCertificate(null)}
      >
        <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <View style={[styles.fullScreenHeader, { paddingTop: insets.top }]}>
            <TouchableOpacity
              style={[styles.fullScreenBack, { backgroundColor: colors.surfaceContainerHigh }]}
              onPress={() => setSelectedCertificate(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.fullScreenTitle, { color: colors.onSurface }]}>Certificate</Text>
            <TouchableOpacity
              style={[styles.saveCertButton, { backgroundColor: colors.primary, opacity: downloading ? 0.6 : 1 }]}
              onPress={handleSaveCertificatePhoto}
              disabled={downloading}
              activeOpacity={0.78}
            >
              <Ionicons name={downloading ? 'hourglass' : 'download-outline'} size={sc(18)} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.certificateModalContent}
            showsVerticalScrollIndicator={false}
          >
            {selectedCertificate && renderCertificate(selectedCertificate)}
            <View style={[styles.certificateNotice, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '24' }]}>
              <Ionicons name="shield-checkmark-outline" size={sc(17)} color={colors.primary} />
              <Text style={[styles.certificateNoticeText, { color: colors.onSurfaceVariant }]}>
                The saved certificate includes a Pill and otter monogram watermark, unique certificate number, and verification code.
              </Text>
            </View>
            <View style={{ height: sc(34) }} />
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
  certOpenRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sc(12) },
  anonFullBadge: {
    flexDirection: 'row', alignItems: 'center', gap: sc(4),
    borderRadius: sc(10), paddingHorizontal: sc(10), paddingVertical: sc(4),
  },
  anonFullText: { fontSize: sc(11), fontWeight: '600' },
  saveCertButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  certificateModalContent: { paddingHorizontal: sc(14), paddingTop: sc(12), alignItems: 'center' },
  certificateShot: {
    width: CERTIFICATE_WIDTH,
    height: CERTIFICATE_HEIGHT,
    backgroundColor: '#FFFFFF',
  },
  donationDocument: {
    width: CERTIFICATE_WIDTH,
    height: CERTIFICATE_HEIGHT,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  documentContent: {
    flex: 1,
    padding: sc(20),
    backgroundColor: 'transparent',
  },
  certificateWatermark: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkTile: {
    position: 'absolute',
    width: sc(60),
    height: sc(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkMark: { width: sc(24), height: sc(24), marginBottom: sc(2) },
  watermarkTextLogo: { width: sc(36), height: sc(14) },
  centerWatermarkMark: {
    position: 'absolute',
    width: sc(180),
    height: sc(180),
    opacity: 0.04,
  },
  centerWatermarkText: {
    position: 'absolute',
    width: sc(160),
    height: sc(60),
    top: '60%',
    opacity: 0.04,
  },
  microTextTop: {
    position: 'absolute',
    top: sc(4),
    left: sc(10),
    right: sc(10),
    color: '#86868B',
    opacity: 0.5,
    fontSize: sc(5),
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  microTextBottom: {
    position: 'absolute',
    bottom: sc(4),
    left: sc(10),
    right: sc(10),
    color: '#86868B',
    opacity: 0.5,
    fontSize: sc(5),
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  documentHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  documentBrand: { flexDirection: 'row', alignItems: 'center', gap: sc(8) },
  documentLogoMark: { width: sc(32), height: sc(32) },
  documentLogoText: { width: sc(64), height: sc(28) },
  documentIssueBox: { alignItems: 'flex-end', justifyContent: 'center', height: sc(32) },
  issueLabel: { fontSize: sc(6), color: '#86868B', fontWeight: '700', letterSpacing: 0.5 },
  issueValue: { fontSize: sc(9), color: '#1D1D1F', fontWeight: '600', fontFamily: 'monospace', marginTop: sc(2) },

  titleBlock: { alignItems: 'center', marginTop: sc(36), marginBottom: sc(24) },
  officialTitle: { fontSize: sc(26), color: '#1D1D1F', fontWeight: '600', textAlign: 'center', letterSpacing: -0.5 },
  officialSubtitle: { fontSize: sc(12), color: '#86868B', textAlign: 'center', fontWeight: '400', marginTop: sc(8) },

  donorPanel: { alignItems: 'center', marginBottom: sc(16) },
  certDonor: { fontSize: sc(30), color: '#1D1D1F', textAlign: 'center', fontWeight: '600', letterSpacing: -0.5 },

  certStatement: { fontSize: sc(12), color: '#86868B', textAlign: 'center', fontWeight: '400', marginTop: sc(4) },
  certAmount: { fontSize: sc(38), color: '#1D1D1F', textAlign: 'center', fontWeight: '700', marginTop: sc(8), letterSpacing: -1 },
  certFundraiser: { fontSize: sc(18), color: '#1D1D1F', textAlign: 'center', fontWeight: '500', lineHeight: sc(24), marginTop: sc(8), paddingHorizontal: sc(12) },

  documentTable: {
    marginTop: sc(32),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  tableRow: { flexDirection: 'row' },
  tableCell: { flex: 1, paddingVertical: sc(12), paddingHorizontal: sc(4) },
  tableDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA' },
  tableLabel: { fontSize: sc(8), color: '#86868B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableValue: { fontSize: sc(12), color: '#1D1D1F', fontWeight: '500', marginTop: sc(4) },

  securityBand: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(16),
    paddingTop: sc(16),
  },
  securitySealWrapper: {
    width: sc(40),
    height: sc(40),
    borderRadius: sc(20),
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialSealLogo: { width: sc(22), height: sc(22), opacity: 0.8 },
  securityTextBlock: { flex: 1 },
  securityLabel: { fontSize: sc(7), color: '#86868B', fontWeight: '600', letterSpacing: 0.5 },
  securityCode: { fontSize: sc(12), color: '#1D1D1F', fontWeight: '500', fontFamily: 'monospace', marginTop: sc(2) },
  certificateNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: sc(9), borderWidth: 1, borderRadius: sc(14), padding: sc(12), marginTop: sc(12), width: CERTIFICATE_WIDTH },
  certificateNoticeText: { flex: 1, fontSize: sc(11), lineHeight: sc(17), fontWeight: '700' },
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
