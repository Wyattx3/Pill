import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const presetAmounts = [1, 3, 5, 10, 20, 50];

export default function DonationScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [donated, setDonated] = useState(false);

  // Entrance animations
  const fadeAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const slideAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(50))).current;

  useEffect(() => {
    fadeAnims.forEach((fade, i) => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 500,
          delay: i * 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: 500,
          delay: i * 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  // Heart pulse animation for success state
  const heartPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (donated) {
      Animated.sequence([
        Animated.timing(heartPulse, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(heartPulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]).start(() => {});
    }
  }, [donated]);

  const handleDonate = () => {
    setDonated(true);
    setTimeout(() => {
      navigation.navigate('Home');
    }, 2000);
  };

  const AnimatedCard = ({ children, index }: { children: React.ReactNode; index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnims[index],
        transform: [{ translateY: slideAnims[index] }],
      }}
    >
      {children}
    </Animated.View>
  );

  if (donated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.successContent}>
          <Animated.View style={{ transform: [{ scale: heartPulse }] }}>
            <OtterMascot name="donationThanks" size={sc(146)} containerStyle={styles.successIcon} />
          </Animated.View>
          <Text style={[styles.successTitle, { color: colors.primary }]}>Thank You</Text>
          <Text style={[styles.successDesc, { color: colors.onSurfaceVariant }]}>Your generosity helps keep this space safe and free for everyone.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]}
          activeOpacity={0.5}
        >
          <Ionicons name="close" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Support This Space</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rate Your Listener */}
        <AnimatedCard index={0}>
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
            <OtterMascot name="homeStatus" size={sc(96)} containerStyle={styles.listenerMascot} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>How was your listener?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={sc(32)}
                    color={star <= rating ? colors.tertiary : colors.outlineVariant}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.ratingLabel, { color: colors.onSurfaceVariant }]}>
              {rating === 0 ? 'Tap to rate' : rating === 5 ? 'Amazing!' : rating >= 3 ? 'Good' : 'Could be better'}
            </Text>
          </View>
        </AnimatedCard>

        {/* Donation */}
        <AnimatedCard index={1}>
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Support Pill</Text>
            <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>
              This app is free and always will be. Your donation helps us keep the lights on and the listeners ready.
            </Text>

            <View style={styles.presetGrid}>
              {presetAmounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.presetBtn, { backgroundColor: colors.surface, borderColor: colors.surfaceContainerHigh }, selectedAmount === amt && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}
                  onPress={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetText, { color: selectedAmount === amt ? colors.onPrimaryContainer : colors.onSurface }]}>
                    ${amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.customAmountRow, { backgroundColor: colors.surface }]}>
              <Text style={[styles.customLabel, { color: colors.onSurfaceVariant }]}>$</Text>
              <TextInput
                style={[styles.customInput, { color: colors.onSurface }]}
                placeholder="Custom amount"
                placeholderTextColor={colors.onSurfaceVariant + '66'}
                keyboardType="decimal-pad"
                value={customAmount}
                onChangeText={setCustomAmount}
              />
            </View>
          </View>
        </AnimatedCard>

        {/* Comment */}
        <AnimatedCard index={2}>
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Leave a Comment (Optional)</Text>
            <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>
              Your feedback helps our listeners improve and grow.
            </Text>
            <TextInput
              style={[styles.commentInput, { backgroundColor: colors.surface, color: colors.onSurface }]}
              placeholder="What did you appreciate? What could be better?"
              placeholderTextColor={colors.onSurfaceVariant + '66'}
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
            />
          </View>
        </AnimatedCard>

        {/* Donate Button */}
        <AnimatedCard index={3}>
          <TouchableOpacity
            style={[styles.donateButton, (selectedAmount === null && customAmount === '') && { opacity: 0.6 }]}
            onPress={handleDonate}
            activeOpacity={(selectedAmount === null && customAmount === '') ? 0.5 : 0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
              pointerEvents="none"
            >
              <Ionicons name="heart" size={sc(20)} color={colors.onPrimary} />
              <Text style={[styles.donateButtonText, { color: colors.onPrimary }]}>
                {selectedAmount ? `Donate $${selectedAmount}` : customAmount ? `Donate $${customAmount}` : 'Continue Without Donating'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </AnimatedCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(12), paddingTop: sc(8) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(40) },

  card: { borderRadius: sc(16), padding: sc(18), marginBottom: sc(12) },
  listenerMascot: { alignItems: 'center', marginBottom: sc(4) },
  cardTitle: { fontSize: sc(16), fontWeight: '700', marginBottom: sc(6) },
  cardDesc: { fontSize: sc(12), lineHeight: sc(18), marginBottom: sc(14) },

  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: sc(6), marginTop: sc(8), marginBottom: sc(8) },
  ratingLabel: { fontSize: sc(12), fontWeight: '600', textAlign: 'center' },

  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(8), marginBottom: sc(12) },
  presetBtn: { width: '30%', borderRadius: sc(12), paddingVertical: sc(14), alignItems: 'center', borderWidth: 2, minHeight: 48, justifyContent: 'center' },
  presetText: { fontSize: sc(16), fontWeight: '700' },

  customAmountRow: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(10), paddingHorizontal: sc(14), minHeight: 48 },
  customLabel: { fontSize: sc(18), fontWeight: '700' },
  customInput: { flex: 1, fontSize: sc(16), paddingVertical: sc(12), marginLeft: sc(4) },

  commentInput: { width: '100%', borderRadius: sc(10), padding: sc(12), fontSize: sc(13), minHeight: sc(80), textAlignVertical: 'top' },

  donateButton: { borderRadius: sc(26), overflow: 'hidden', marginBottom: sc(20) },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(16), minHeight: 52 },
  donateButtonText: { fontSize: sc(15), fontWeight: '700' },

  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: sc(30) },
  successIcon: { marginBottom: sc(20) },
  successTitle: { fontSize: sc(28), fontWeight: '800', marginBottom: sc(10) },
  successDesc: { fontSize: sc(14), lineHeight: sc(22), textAlign: 'center' },
});
