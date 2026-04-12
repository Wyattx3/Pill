import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const supportChannels = [
  { icon: 'mail-outline', title: 'Email Support', desc: 'support@thesanctuary.app', action: () => Linking.openURL('mailto:support@thesanctuary.app') },
  { icon: 'shield-checkmark-outline', title: 'Safety Concern', desc: 'Priority response for safety issues', action: () => Linking.openURL('mailto:safety@thesanctuary.app') },
  { icon: 'chatbubble-ellipses-outline', title: 'Live Chat', desc: 'Available Mon–Fri, 9 AM–6 PM' },
  { icon: 'call-outline', title: 'Phone Support', desc: 'Mon–Fri, 9 AM–5 PM', action: () => Linking.openURL('tel:+18005551234') },
];

const commonIssues = [
  'I can\'t log in to my account',
  'I need to update my payment method',
  'I want to report inappropriate behavior',
  'My listener was disrespectful or unprofessional',
  'I have a technical bug to report',
  'I need help withdrawing my earnings',
  'I want to deactivate my account',
  'I have a question about community guidelines',
];

export default function ContactSupportScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState('');

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing Info', 'Please fill in both the subject and message fields.');
      return;
    }
    Alert.alert(
      'Support Request Sent',
      'We have received your message and will respond within 24–48 hours. For urgent matters, please use the Safety Center.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleSelectIssue = (issue: string) => {
    if (selectedIssue === issue) {
      setSelectedIssue('');
      setSubject('');
    } else {
      setSelectedIssue(issue);
      setSubject(issue);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Contact Support</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Quick Channels */}
        <Text style={[styles.sectionLabel, { color: colors.onSurface }]}>Reach Us At</Text>
        <View style={styles.channelsGrid}>
          {supportChannels.map((ch, i) => {
            const onPress = ch.title === 'Live Chat' ? () => navigation.navigate('LiveChat') : ch.action;
            return (
              <TouchableOpacity key={i} style={[styles.channelCard, { backgroundColor: colors.surfaceContainerLow }]} onPress={onPress} activeOpacity={0.7}>
                <View style={[styles.channelIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
                  <Ionicons name={ch.icon as any} size={sc(22)} color={colors.primary} />
                </View>
                <Text style={[styles.channelTitle, { color: colors.onSurface }]}>{ch.title}</Text>
                <Text style={[styles.channelDesc, { color: colors.onSurfaceVariant }]}>{ch.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Common Issues */}
        <Text style={[styles.sectionLabel, { color: colors.onSurface, marginTop: sc(16) }]}>Common Issues</Text>
        <Text style={[styles.sectionHint, { color: colors.onSurfaceVariant }]}>Tap one to auto-fill your ticket</Text>
        <View style={styles.issuesList}>
          {commonIssues.map((issue, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.issueItem,
                { backgroundColor: selectedIssue === issue ? colors.primaryContainer + '22' : colors.surfaceContainerLow },
                selectedIssue === issue && { borderColor: colors.primary + '44' },
              ]}
              onPress={() => handleSelectIssue(issue)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={selectedIssue === issue ? 'checkmark-circle' : 'help-circle-outline'}
                size={sc(16)}
                color={selectedIssue === issue ? colors.primary : colors.onSurfaceVariant}
              />
              <Text style={[styles.issueText, { color: colors.onSurface }]}>{issue}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Form */}
        <Text style={[styles.sectionLabel, { color: colors.onSurface, marginTop: sc(16) }]}>Send Us a Message</Text>
        <View style={[styles.formCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Subject</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceContainerHigh, color: colors.onSurface }]}
            placeholder="What is this about?"
            placeholderTextColor={colors.onSurfaceVariant + '66'}
            value={subject}
            onChangeText={setSubject}
            onFocus={() => setSubjectFocused(true)}
            onBlur={() => setSubjectFocused(false)}
          />

          <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Message</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surfaceContainerHigh, color: colors.onSurface }]}
            placeholder="Describe your issue in detail..."
            placeholderTextColor={colors.onSurfaceVariant + '66'}
            value={message}
            onChangeText={setMessage}
            onFocus={() => setMessageFocused(true)}
            onBlur={() => setMessageFocused(false)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary, opacity: subject.trim() && message.trim() ? 1 : 0.5 }]}
            onPress={handleSubmit}
            activeOpacity={subject.trim() && message.trim() ? 0.8 : 0.5}
          >
            <Ionicons name="send" size={sc(18)} color={colors.onPrimary} />
            <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>Submit Support Request</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(16), paddingBottom: sc(10) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(14), fontWeight: '700', maxWidth: '70%' },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(40) },

  sectionLabel: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(10) },
  sectionHint: { fontSize: sc(11), marginBottom: sc(8) },

  channelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(10) },
  channelCard: { width: (W - sc(36) - sc(10)) / 2, borderRadius: sc(14), padding: sc(14), marginBottom: sc(4) },
  channelIcon: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center', marginBottom: sc(8) },
  channelTitle: { fontSize: sc(12), fontWeight: '700', marginBottom: sc(2) },
  channelDesc: { fontSize: sc(10) },

  issuesList: { gap: sc(8), marginBottom: sc(8) },
  issueItem: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(10), padding: sc(12), gap: sc(10), borderWidth: 1, borderColor: 'transparent' },
  issueText: { fontSize: sc(12), fontWeight: '500', flex: 1 },

  formCard: { borderRadius: sc(16), padding: sc(18) },
  inputLabel: { fontSize: sc(11), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: sc(6), marginTop: sc(10) },
  input: { width: '100%', borderRadius: sc(10), padding: sc(12), fontSize: sc(14), minHeight: sc(44) },
  textArea: { width: '100%', borderRadius: sc(10), padding: sc(12), fontSize: sc(14), minHeight: sc(120) },

  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), borderRadius: sc(26), paddingVertical: sc(14), marginTop: sc(18), minHeight: 50 },
  submitButtonText: { fontSize: sc(14), fontWeight: '700' },
});
