import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const moodOptions = [
  { icon: 'leaf-outline' as const, label: 'Calm', activeIcon: 'leaf' as const },
  { icon: 'happy-outline' as const, label: 'Heard', activeIcon: 'happy' as const },
  { icon: 'cloud-outline' as const, label: 'Neutral', activeIcon: 'cloud' as const },
];

const experienceTags = ['Warm interaction', 'Very helpful', 'Quick response'];
const negativeTag = 'Uncomfortable';

export default function ReflectionScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Call Ended Confirmation */}
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.surfaceContainerHigh }]}>
          <Ionicons name="call" size={sc(30)} color={colors.primary} style={{ transform: [{ rotate: '135deg' }] }} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.onBackground }]}>The call has ended.</Text>
        <Text style={[styles.heroDesc, { color: colors.onSurfaceVariant }]}>Thank you for sharing your time with us. Take a moment to breathe before moving forward.</Text>
      </View>

      {/* Mood Check-in */}
      <View style={[styles.moodCard, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={styles.moodHeader}>
          <Ionicons name="happy-outline" size={sc(22)} color={colors.primary} />
          <Text style={[styles.moodTitle, { color: colors.onSurface }]}>How are you feeling?</Text>
        </View>
        <View style={styles.moodGrid}>
          {moodOptions.map((mood, i) => (
            <TouchableOpacity key={i} style={[styles.moodButton, { backgroundColor: colors.surface }, selectedMood === i && { backgroundColor: colors.primaryContainer }]} onPress={() => setSelectedMood(i)} activeOpacity={0.7}>
              <Ionicons name={selectedMood === i ? mood.activeIcon : mood.icon} size={sc(26)} color={selectedMood === i ? colors.primary : colors.onSurfaceVariant} />
              <Text style={[styles.moodLabel, { color: selectedMood === i ? colors.primary : colors.onSurfaceVariant }]}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Experience Feedback */}
      <View style={[styles.feedbackCard, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={styles.moodHeader}>
          <Ionicons name="people-outline" size={sc(22)} color={colors.primary} />
          <Text style={[styles.moodTitle, { color: colors.onSurface }]}>How was your experience?</Text>
        </View>
        <View style={styles.tagsRow}>
          {experienceTags.map((tag, i) => (
            <TouchableOpacity key={i} style={[styles.tag, { backgroundColor: colors.surface }, selectedTags.includes(tag) && { backgroundColor: colors.primaryContainer }]} onPress={() => toggleTag(tag)} activeOpacity={0.7}>
              <Text style={[styles.tagText, { color: selectedTags.includes(tag) ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>{tag}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.tag, styles.tagNegative, { backgroundColor: colors.surface, borderColor: colors.error + '33' }, selectedTags.includes(negativeTag) && { backgroundColor: colors.errorContainer }]} onPress={() => toggleTag(negativeTag)} activeOpacity={0.7}>
            <Text style={[styles.tagTextNegative, { color: selectedTags.includes(negativeTag) ? colors.onErrorContainer : colors.error }]}>{negativeTag}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.noteInput, { backgroundColor: colors.surfaceContainerHigh, color: colors.onSurface }]}
          placeholder="Add a private note (optional)..."
          placeholderTextColor={colors.onSurfaceVariant + '80'}
          value={note}
          onChangeText={setNote}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Inspirational Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWT-vTKj77meNSeeaC7ui5wzgtbA92mjZA2AUpH00zXBjwAkLeg_-GrZ98oSSTebpSXVGQ5asfLShgyqWFClOPIAu8MQ33LlT0AEk2QOBQ941fjr6OSyiKYjnSbVifTfG-nCEU_ejNrooaYUOr2PBtm9jB56X3bON3uk3XZZbr-BwL5k4wb7aWBQySx-HfUiphwyDSTa9cOtrSiDDaq4sAmSILBkodJmYSUG7uZk_jfVqJG61aB5n0kRrBYxdJSeKrVolTQPqr' }}
          style={styles.image}
        />
        <View style={styles.imageOverlay} />
        <Text style={styles.imageQuote}>"Peace begins with a single breath."</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.returnButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
          <Text style={[styles.returnButtonText, { color: colors.onPrimary }]}>Return Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.returnButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('ListenerDashboard')} activeOpacity={0.8}>
          <Text style={[styles.returnButtonText, { color: colors.onPrimary }]}>Go to Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('SafetyReport')} activeOpacity={0.7}>
          <Ionicons name="shield-outline" size={sc(20)} color={colors.error} />
          <Text style={[styles.reportButtonText, { color: colors.error }]}>Block & Report</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: sc(20), paddingHorizontal: sc(18), paddingBottom: sc(30) },
  hero: { alignItems: 'center', marginBottom: sc(20) },
  heroIcon: { width: sc(56), height: sc(56), borderRadius: sc(28), alignItems: 'center', justifyContent: 'center', marginBottom: sc(16) },
  heroTitle: { fontSize: sc(22), fontWeight: '800', textAlign: 'center', marginBottom: sc(8), letterSpacing: -0.3 },
  heroDesc: { fontSize: sc(13), lineHeight: sc(20), textAlign: 'center', fontWeight: '500' },
  moodCard: { borderRadius: sc(14), padding: sc(20), marginBottom: sc(10) },
  moodHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(6), marginBottom: sc(16) },
  moodTitle: { fontSize: sc(16), fontWeight: '700' },
  moodGrid: { flexDirection: 'row', gap: sc(10) },
  moodButton: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sc(12), borderRadius: sc(10), gap: sc(6), minHeight: 64 },
  moodLabel: { fontSize: sc(11), fontWeight: '600' },
  feedbackCard: { borderRadius: sc(14), padding: sc(20), marginBottom: sc(10) },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(8), marginBottom: sc(14) },
  tag: { paddingHorizontal: sc(16), paddingVertical: 6, borderRadius: sc(20), minHeight: 32, justifyContent: 'center' },
  tagText: { fontSize: sc(12), fontWeight: '500' },
  tagNegative: { borderWidth: 1 },
  tagTextNegative: { fontSize: sc(12), fontWeight: '500' },
  noteInput: { width: '100%', borderRadius: sc(10), padding: sc(12), fontSize: sc(13), minHeight: sc(72), textAlignVertical: 'top' },
  imageContainer: { height: sc(140), borderRadius: sc(14), overflow: 'hidden', marginBottom: sc(14) },
  image: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  imageQuote: { position: 'absolute', bottom: sc(10), left: sc(16), right: sc(16), fontSize: sc(15), fontWeight: '700', color: '#fff', fontStyle: 'italic', opacity: 0.9 },
  actions: { gap: sc(10), marginBottom: sc(30) },
  returnButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: sc(16), borderRadius: sc(26), minHeight: 52 },
  returnButtonText: { fontSize: sc(15), fontWeight: '700' },
  reportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(12), minHeight: 44 },
  reportButtonText: { fontSize: sc(12), fontWeight: '700', letterSpacing: 1 },
});
