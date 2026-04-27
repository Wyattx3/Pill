import React, { useState, useRef, useEffect } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const AVATAR_OPTIONS = [
  { name: 'Calm', accent: '#9CAF88', image: require('../../assets/avatars/otter-avatar-calm.png') },
  { name: 'Kind', accent: '#D9C7AD', image: require('../../assets/avatars/otter-avatar-kind.png') },
  { name: 'Sage', accent: '#91A77E', image: require('../../assets/avatars/otter-avatar-sage.png') },
  { name: 'Ember', accent: '#C97558', image: require('../../assets/avatars/otter-avatar-ember.png') },
  { name: 'River', accent: '#4E9A94', image: require('../../assets/avatars/otter-avatar-river.png') },
  { name: 'Dawn', accent: '#D4A24C', image: require('../../assets/avatars/otter-avatar-dawn.png') },
  { name: 'Luna', accent: '#77908A', image: require('../../assets/avatars/otter-avatar-luna.png') },
  { name: 'Cedar', accent: '#526D4D', image: require('../../assets/avatars/otter-avatar-cedar.png') },
] as const;

export default function EditProfileScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  const [accountName, setAccountName] = useState('Stone');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const selected = AVATAR_OPTIONS[selectedAvatar];

  // Animations
  const focusAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleAvatarSelect = (index: number) => {
    setSelectedAvatar(index);
    Animated.sequence([
      Animated.timing(avatarScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleSave = () => {
    navigation.goBack();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outlineVariant + '40', selected.accent],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Dynamic Header Background */}
      <View style={styles.headerBackgroundContainer}>
        <LinearGradient
          colors={[selected.accent, colors.background]}
          style={styles.headerGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={[styles.headerOverlay, { backgroundColor: colors.background, opacity: isDark ? 0.6 : 0.8 }]} />
      </View>

      {/* Top Navigation Bar with Glassmorphism */}
      <View style={[styles.topBar, { paddingTop: insets.top + sc(12) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} activeOpacity={0.7}>
          <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={styles.blurIcon}>
            <Ionicons name="chevron-back" size={sc(24)} color={colors.onSurface} />
          </BlurView>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Edit Profile</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + sc(100) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Preview Section */}
          <View style={styles.previewSection}>
            <Animated.View style={[styles.previewAvatarContainer, { transform: [{ scale: avatarScale }] }]}>
              <View style={[styles.previewGlow, { backgroundColor: selected.accent, shadowColor: selected.accent }]} />
              <View style={[styles.previewAvatar, { backgroundColor: colors.surfaceContainerLowest }]}>
                <Image source={selected.image} style={styles.previewImage} />
              </View>
              <View style={[styles.previewBadge, { backgroundColor: selected.accent, borderColor: colors.background }]}>
                <Ionicons name="pencil" size={sc(16)} color="#fff" />
              </View>
            </Animated.View>
            
            <View style={styles.nameContainer}>
              <Text style={[styles.profileName, { color: colors.onSurface }]} numberOfLines={1}>
                {accountName || 'Your Name'}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: selected.accent + '20' }]}>
                <Text style={[styles.roleText, { color: selected.accent }]}>{selected.name} Otter</Text>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Display Name</Text>
              <Animated.View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: borderColor,
                  shadowColor: isFocused ? selected.accent : 'transparent',
                }
              ]}>
                <Ionicons name="person-outline" size={sc(20)} color={isFocused ? selected.accent : colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: colors.onSurface }]}
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.onSurfaceVariant + '80'}
                  maxLength={20}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                {accountName.length > 0 && (
                  <TouchableOpacity onPress={() => setAccountName('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={sc(18)} color={colors.onSurfaceVariant + '80'} />
                  </TouchableOpacity>
                )}
              </Animated.View>
              <Text style={[styles.charCount, { color: colors.onSurfaceVariant }]}>{accountName.length}/20</Text>
            </View>

            {/* Avatar Selector */}
            <View style={styles.avatarSelectorContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Select Avatar</Text>
                <Text style={[styles.sectionCount, { color: selected.accent }]}>{selectedAvatar + 1} of {AVATAR_OPTIONS.length}</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarScrollContent}
              >
                {AVATAR_OPTIONS.map((avatar, index) => {
                  const isSelected = selectedAvatar === index;
                  return (
                    <TouchableOpacity
                      key={avatar.name}
                      style={styles.avatarOptionWrapper}
                      onPress={() => handleAvatarSelect(index)}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.avatarOption,
                        {
                          backgroundColor: isSelected ? avatar.accent + '15' : colors.surfaceContainerLow,
                          borderColor: isSelected ? avatar.accent : 'transparent',
                        }
                      ]}>
                        <View style={[styles.avatarBubble, { backgroundColor: avatar.accent + '20' }]}>
                          <Image source={avatar.image} style={styles.avatarOptionImage} />
                        </View>
                        <Text style={[
                          styles.avatarOptionName, 
                          { color: isSelected ? colors.onSurface : colors.onSurfaceVariant, fontWeight: isSelected ? '800' : '600' }
                        ]}>
                          {avatar.name}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={[styles.checkBadge, { backgroundColor: avatar.accent }]}>
                          <Ionicons name="checkmark-sharp" size={sc(12)} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Save Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, sc(20)) }]}>
        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.bottomGradient}
        />
        <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
          <LinearGradient
            colors={[selected.accent, selected.accent + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
            <Ionicons name="arrow-forward" size={sc(20)} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: sc(300),
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: sc(16), 
    paddingBottom: sc(16),
    zIndex: 10,
  },
  iconButton: { width: sc(40), height: sc(40), borderRadius: sc(20), overflow: 'hidden' },
  blurIcon: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconButtonPlaceholder: { width: sc(40) },
  topBarTitle: { fontSize: sc(18), fontWeight: '800', letterSpacing: 0.5 },

  scrollContent: { paddingTop: sc(10) },

  previewSection: { alignItems: 'center', marginBottom: sc(32) },
  previewAvatarContainer: { 
    position: 'relative', 
    marginBottom: sc(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewGlow: {
    position: 'absolute',
    width: sc(130),
    height: sc(130),
    borderRadius: sc(65),
    opacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: sc(20),
    elevation: 10,
  },
  previewAvatar: { 
    width: sc(136), 
    height: sc(136), 
    borderRadius: sc(68), 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewImage: { width: sc(146), height: sc(146), resizeMode: 'contain', marginTop: sc(20) },
  previewBadge: { 
    position: 'absolute', 
    right: sc(5), 
    bottom: sc(5), 
    width: sc(36), 
    height: sc(36), 
    borderRadius: sc(18), 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sc(4) },
    shadowOpacity: 0.2,
    shadowRadius: sc(5),
    elevation: 5,
  },
  nameContainer: { alignItems: 'center' },
  profileName: { fontSize: sc(28), fontWeight: '900', letterSpacing: -0.5, marginBottom: sc(8) },
  roleBadge: { paddingHorizontal: sc(12), paddingVertical: sc(4), borderRadius: sc(12) },
  roleText: { fontSize: sc(13), fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },

  formSection: { paddingHorizontal: sc(20) },
  
  inputGroup: { marginBottom: sc(30) },
  inputLabel: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(8), marginLeft: sc(4) },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: sc(16),
    borderWidth: 1.5,
    paddingHorizontal: sc(16),
    height: sc(56),
    shadowOffset: { width: 0, height: sc(4) },
    shadowOpacity: 0.1,
    shadowRadius: sc(8),
    elevation: 3,
  },
  inputIcon: { marginRight: sc(12) },
  textInput: { flex: 1, fontSize: sc(16), fontWeight: '600', height: '100%' },
  clearButton: { padding: sc(4) },
  charCount: { fontSize: sc(12), textAlign: 'right', marginTop: sc(6), marginRight: sc(4), fontWeight: '600' },

  avatarSelectorContainer: { marginBottom: sc(20) },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: sc(16), paddingHorizontal: sc(4) },
  sectionTitle: { fontSize: sc(18), fontWeight: '800' },
  sectionCount: { fontSize: sc(14), fontWeight: '700' },
  
  avatarScrollContent: { paddingRight: sc(20), gap: sc(12) },
  avatarOptionWrapper: { position: 'relative' },
  avatarOption: { 
    width: sc(100), 
    height: sc(120), 
    borderRadius: sc(20), 
    borderWidth: 2, 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: sc(10),
  },
  avatarBubble: { 
    width: sc(64), 
    height: sc(64), 
    borderRadius: sc(32), 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden', 
    marginBottom: sc(12) 
  },
  avatarOptionImage: { width: sc(76), height: sc(76), resizeMode: 'contain', marginTop: sc(16) },
  avatarOptionName: { fontSize: sc(13) },
  checkBadge: { 
    position: 'absolute', 
    top: -sc(6), 
    right: -sc(6), 
    width: sc(24), 
    height: sc(24), 
    borderRadius: sc(12), 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: sc(20),
    paddingTop: sc(20),
  },
  bottomGradient: {
    position: 'absolute',
    top: -sc(40),
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
  saveButton: {
    flexDirection: 'row',
    height: sc(56),
    borderRadius: sc(28),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sc(6) },
    shadowOpacity: 0.2,
    shadowRadius: sc(8),
    elevation: 6,
    gap: sc(8),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: sc(17),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

