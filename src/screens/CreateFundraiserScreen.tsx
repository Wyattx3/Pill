import React, { useState } from 'react';
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
import BottomNav from '../components/BottomNav';
import OtterMascot from '../components/OtterMascot';
import { createFundraiser, addMyFundraiser, FundraiserMedia, GiftTier } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function CreateFundraiserScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [media, setMedia] = useState<FundraiserMedia[]>([]);
  const [giftTiers, setGiftTiers] = useState<GiftTier[]>([]);

  const canSubmit = title.trim().length >= 5 && description.trim().length >= 20 && parseInt(goalAmount, 10) > 0;

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      const newMedia: FundraiserMedia[] = result.assets.map((a) => {
        const ext = a.uri.split('.').pop()?.toLowerCase();
        const isVideo = ext === 'mp4' || ext === 'mov' || ext === 'webm' || ext === 'avi';
        return {
          id: `media-${Date.now()}-${Math.random()}`,
          uri: a.uri,
          type: isVideo ? ('video' as const) : ('image' as const),
        };
      });
      setMedia((prev) => [...prev, ...newMedia]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) {
      const item: FundraiserMedia = {
        id: `media-${Date.now()}`,
        uri: result.assets[0].uri,
        type: 'image',
      };
      setMedia((prev) => [...prev, item]);
    }
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleTiersReturn = (tiers: GiftTier[]) => {
    setGiftTiers(tiers);
  };

  const openGiftTiers = () => {
    navigation.navigate('GiftTiers', { tiers: giftTiers, onTiersComplete: handleTiersReturn });
  };

  const handleSubmit = async () => {
    if (title.trim().length < 5) {
      Alert.alert('Invalid Title', 'Please enter at least 5 characters for the title.');
      return;
    }
    if (description.trim().length < 20) {
      Alert.alert('Invalid Description', 'Please enter at least 20 characters for the description.');
      return;
    }
    if (!goalAmount || parseInt(goalAmount, 10) <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid goal amount greater than 0.');
      return;
    }
    try {
      const fundraiser = await createFundraiser({
        title: title.trim(),
        description: description.trim(),
        goalAmount: parseInt(goalAmount, 10),
        imageUrl: media.length > 0 ? media[0].uri : '',
        media,
        giftTiers,
        creatorName: 'You',
        creatorType: 'individual',
        verificationStatus: 'approved',
        isPublished: true,
      });
      await addMyFundraiser({
        id: fundraiser.id,
        title: title.trim(),
        description: description.trim(),
        goalAmount: parseInt(goalAmount, 10),
        imageUrl: media.length > 0 ? media[0].uri : '',
        media,
      });
      Alert.alert('Success!', 'Your fundraiser has been published.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to create fundraiser. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Create Fundraiser</Text>
        <View style={{ width: sc(22) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Media Section */}
        <Text style={[styles.sectionLabel, { color: colors.onSurface }]}>Photos & Videos</Text>
        {media.length === 0 ? (
          <View style={[styles.mediaEmpty, { backgroundColor: colors.surfaceContainerLow }]}>
            <OtterMascot name="fundraiserCreate" size={sc(116)} containerStyle={styles.mediaMascot} />
            <Text style={[styles.mediaEmptyText, { color: colors.onSurfaceVariant }]}>
              Add photos or videos to your fundraiser
            </Text>
            <View style={styles.mediaBtnRow}>
              <TouchableOpacity style={[styles.mediaPickBtn, { backgroundColor: colors.primary }]} onPress={pickMedia}>
                <Ionicons name="folder" size={sc(18)} color={colors.onPrimary} />
                <Text style={[styles.mediaPickText, { color: colors.onPrimary }]}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mediaPickBtn, { backgroundColor: colors.primary }]} onPress={takePhoto}>
                <Ionicons name="camera" size={sc(18)} color={colors.onPrimary} />
                <Text style={[styles.mediaPickText, { color: colors.onPrimary }]}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.mediaThumbRow}>
              {media.map((m) => (
                <View key={m.id} style={styles.mediaThumb}>
                  {m.type === 'video' ? (
                    <View style={[styles.mediaThumbVideo, { backgroundColor: colors.surfaceContainerHigh }]}>
                      <Ionicons name="play-circle" size={sc(32)} color={colors.primary} />
                      <Text style={[styles.mediaThumbLabel, { color: colors.onSurfaceVariant }]}>Video</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: m.uri }} style={styles.mediaThumbImg} />
                  )}
                  <TouchableOpacity
                    style={[styles.thumbRemove, { backgroundColor: colors.error }]}
                    onPress={() => removeMedia(m.id)}
                  >
                    <Ionicons name="close" size={sc(12)} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.addMoreBtn, { borderColor: colors.primary }]}
              onPress={pickMedia}
            >
              <Ionicons name="add" size={sc(16)} color={colors.primary} />
              <Text style={[styles.addMoreText, { color: colors.primary }]}>Add more photos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            Title <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surfaceContainerLow,
              color: colors.onSurface,
              borderColor: colors.outlineVariant,
            }]}
            placeholder="Give your fundraiser a name"
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
            style={[styles.textArea, {
              backgroundColor: colors.surfaceContainerLow,
              color: colors.onSurface,
              borderColor: colors.outlineVariant,
            }]}
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
          <View style={[styles.currencyInput, {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: colors.outlineVariant,
          }]}>
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

        {/* Gift Tiers - Navigation card */}
        <TouchableOpacity
          style={[styles.giftNavCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}
          onPress={openGiftTiers}
          activeOpacity={0.7}
        >
          <View style={styles.giftNavLeft}>
            <Ionicons name="gift-outline" size={sc(22)} color={colors.primary} />
            <View>
              <Text style={[styles.giftNavTitle, { color: colors.onSurface }]}>
                Gift Rewards
                {giftTiers.length > 0 && (
                  <Text style={[styles.giftCount, { color: colors.primary }]}> ({giftTiers.length})</Text>
                )}
              </Text>
              <Text style={[styles.giftNavSub, { color: colors.onSurfaceVariant }]}>
                {giftTiers.length > 0
                  ? `${giftTiers.length} reward tier${giftTiers.length > 1 ? 's' : ''} set up`
                  : 'Tap to add custom rewards for donors'
                }
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={sc(20)} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitWrap, { opacity: canSubmit ? 1 : 0.5 }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            <Ionicons name="heart" size={sc(18)} color={colors.onPrimary} />
            <Text style={[styles.submitBtnText, { color: colors.onPrimary }]}>Publish Fundraiser</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: sc(40) }} />
      </ScrollView>

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
  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },

  sectionLabel: { fontSize: sc(13), fontWeight: '700', marginBottom: sc(8) },

  // Media
  mediaEmpty: {
    borderRadius: sc(16), padding: sc(20), alignItems: 'center', marginBottom: sc(16),
  },
  mediaMascot: { marginBottom: sc(4) },
  mediaEmptyText: { fontSize: sc(13), textAlign: 'center', marginVertical: sc(8) },
  mediaBtnRow: { flexDirection: 'row', gap: sc(8), marginTop: sc(8) },
  mediaPickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(6), borderRadius: sc(14), paddingVertical: sc(12),
  },
  mediaPickText: { fontSize: sc(13), fontWeight: '700' },
  mediaThumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(8), marginBottom: sc(8) },
  mediaThumb: { position: 'relative' },
  mediaThumbImg: { width: sc(100), height: sc(100), borderRadius: sc(12), resizeMode: 'cover' },
  mediaThumbVideo: {
    width: sc(100), height: sc(100), borderRadius: sc(12),
    alignItems: 'center', justifyContent: 'center',
  },
  mediaThumbLabel: { fontSize: sc(10), marginTop: sc(4) },
  thumbRemove: {
    position: 'absolute', top: -sc(4), right: -sc(4),
    width: sc(22), height: sc(22), borderRadius: sc(11),
    alignItems: 'center', justifyContent: 'center',
  },
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(6), borderRadius: sc(14), borderWidth: 1, paddingVertical: sc(10),
  },
  addMoreText: { fontSize: sc(13), fontWeight: '600' },

  // Fields
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

  // Gift navigation card
  giftNavCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: sc(14), padding: sc(14), marginBottom: sc(16), borderWidth: 1,
  },
  giftNavLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(10), flex: 1 },
  giftNavTitle: { fontSize: sc(14), fontWeight: '700' },
  giftCount: { fontSize: sc(14) },
  giftNavSub: { fontSize: sc(11), marginTop: sc(2) },

  // Submit
  submitWrap: { borderRadius: sc(24), overflow: 'hidden', marginTop: sc(8) },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(15), minHeight: sc(52),
  },
  submitBtnText: { fontSize: sc(15), fontWeight: '700' },
});
