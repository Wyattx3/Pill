import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const botResponses: Record<string, string> = {
  'hello': "Hi there! Welcome to The Sanctuary support chat. How can I help you today?",
  'hi': "Hello! I'm here to help. What do you need assistance with?",
  'hey': "Hey! How can I help you today?",
  'earnings': "For earnings questions: payouts are processed monthly. You can view your balance in the Earnings screen. Need me to connect you to a human agent?",
  'payment': "Payment issues can be resolved in Settings > Earnings & Payouts. Make sure your bank details are up to date. Would you like me to escalate this?",
  'listener': "To become a listener, go to Listener Mode on the Home screen and complete the verification process. It takes about 5 minutes. Any other questions?",
  'report': "To report someone, go to Safety Center > Safety Report. Our team reviews all reports within 24 hours. Would you like me to connect you to a human agent?",
  'bug': "Sorry to hear about the bug! Can you describe what happened? I'll log it for our engineering team.",
  'crisis': "If you or someone is in immediate danger, please call 988 or go to the Safety Center for crisis resources. I can also connect you to a human agent right away.",
  'account': "For account issues, try logging out and back in. If the problem persists, I can connect you to a human agent. Would you like that?",
  'deactivate': "You can deactivate your account in Settings > Account > Deactivate. Your data will be preserved for 30 days. Want me to walk you through it?",
  'thanks': "You're welcome! Is there anything else I can help you with?",
  'thank you': "Happy to help! Anything else you need?",
  'bye': "Take care! Remember, we're here whenever you need support. 🌿",
  'help': "I can assist with: Earnings & Payouts, Account Issues, Listener Setup, Bug Reports, Safety Concerns, and more. Just type your question!",
  'human': "Connecting you to a human agent now... Please wait, an agent will be with you shortly. Estimated wait time: 2-5 minutes.",
  'agent': "Sure! I'm escalating this to a human agent. You'll be connected shortly.",
  'safety': "Safety is our top priority. Go to Safety Center for immediate resources, or I can connect you to our safety team directly. What do you need?",
};

const defaultBotResponse = "I appreciate your message. I'm an AI assistant and I may not have the answer to that specific question. Would you like me to connect you to a human agent instead?";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
}

const quickReplies = [
  'Earnings & Payouts',
  'Account Issues',
  'Report a Problem',
  'Safety Concern',
  'Talk to Human',
];

export default function LiveChatScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        addBotMessage("Hi! I'm Sanctuary's AI support assistant. I can help you with common questions or connect you to a human agent. What do you need help with?");
      }, 500);
    }
  }, []);

  const addBotMessage = (text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
  };

  const getBotResponse = (userText: string): string => {
    const lower = userText.toLowerCase();
    for (const [key, response] of Object.entries(botResponses)) {
      if (lower.includes(key)) {
        return response;
      }
    }
    return defaultBotResponse;
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText.trim();
    setInputText('');

    // Bot response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response = getBotResponse(currentInput);
      addBotMessage(response);

      if (currentInput.toLowerCase().includes('human') || currentInput.toLowerCase().includes('agent')) {
        setTimeout(() => {
          setAgentConnected(true);
          addBotMessage("A human agent has joined the chat. How can we help you further?");
        }, 1500);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    setTimeout(() => {
      const userMsg: Message = {
        id: Date.now().toString(),
        text: reply,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(getBotResponse(reply));
      }, 800 + Math.random() * 800);
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {!isUser && (
          <View style={[styles.msgAvatar, { backgroundColor: item.sender === 'bot' ? colors.primaryContainer : colors.tertiaryContainer }]}>
            <Ionicons
              name={item.sender === 'bot' ? 'hardware-chip' : 'person'}
              size={sc(14)}
              color={item.sender === 'bot' ? colors.primary : colors.tertiary}
            />
          </View>
        )}
        <View style={[styles.msgBubble, { backgroundColor: isUser ? colors.primary : colors.surfaceContainerLow }]}>
          <Text style={[styles.msgText, { color: isUser ? colors.onPrimary : colors.onSurface }]}>{item.text}</Text>
          <Text style={[styles.msgTime, { color: isUser ? colors.onPrimary + '99' : colors.onSurfaceVariant }]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isUser && <View style={styles.msgSpacer} />}
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.msgRow, styles.msgRowBot]}>
      <View style={[styles.msgAvatar, { backgroundColor: colors.primaryContainer }]}>
        <Ionicons name="hardware-chip" size={sc(14)} color={colors.primary} />
      </View>
      <View style={[styles.msgBubble, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, { backgroundColor: colors.onSurfaceVariant }]} />
          <View style={[styles.dot, styles.dotMiddle, { backgroundColor: colors.onSurfaceVariant }]} />
          <View style={[styles.dot, { backgroundColor: colors.onSurfaceVariant }]} />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.bottom + 60}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8), backgroundColor: colors.surface + 'E6' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <View style={styles.chatHeaderLeft}>
            <View style={[styles.chatAvatar, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="hardware-chip" size={sc(16)} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.chatTitle, { color: colors.onSurface }]}>Sanctuary Support</Text>
              <Text style={[styles.chatStatus, { color: agentConnected ? '#4CAF50' : colors.onSurfaceVariant }]}>
                {agentConnected ? 'Agent connected' : 'AI Assistant • Online'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.closeButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="close" size={sc(20)} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        ListFooterComponent={isTyping ? renderTypingIndicator : null}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Quick Replies */}
      {!agentConnected && messages.length < 4 && (
        <View style={[styles.quickReplies, { backgroundColor: colors.surface + 'E6' }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRepliesInner}>
            {quickReplies.map((reply, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.quickReplyBtn, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant + '33' }]}
                onPress={() => handleQuickReply(reply)}
                activeOpacity={0.7}
              >
                <Text style={[styles.quickReplyText, { color: colors.onSurface }]}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: colors.surface + 'E6', borderTopColor: colors.outlineVariant + '22', paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surfaceContainerHigh, color: colors.onSurface }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.onSurfaceVariant + '66'}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.surfaceContainerHigh }]}
          onPress={sendMessage}
          activeOpacity={inputText.trim() ? 0.8 : 0.5}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={sc(18)}
            color={inputText.trim() ? colors.onPrimary : colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(12), paddingBottom: sc(8) },
  backButton: { width: sc(34), height: sc(34), borderRadius: sc(17), alignItems: 'center', justifyContent: 'center' },
  closeButton: { width: sc(34), height: sc(34), borderRadius: sc(17), alignItems: 'center', justifyContent: 'center' },
  chatHeaderInfo: { flex: 1 },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(8), paddingHorizontal: sc(8) },
  chatAvatar: { width: sc(32), height: sc(32), borderRadius: sc(16), alignItems: 'center', justifyContent: 'center' },
  chatTitle: { fontSize: sc(14), fontWeight: '700' },
  chatStatus: { fontSize: sc(10), marginTop: 1 },

  msgList: { paddingHorizontal: sc(12), paddingVertical: sc(8), flexGrow: 1 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: sc(8), maxWidth: '100%' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot: { justifyContent: 'flex-start' },
  msgAvatar: { width: sc(26), height: sc(26), borderRadius: sc(13), alignItems: 'center', justifyContent: 'center', marginRight: sc(6), marginBottom: sc(2) },
  msgBubble: { borderRadius: sc(16), paddingHorizontal: sc(14), paddingVertical: sc(8), maxWidth: '75%', minWidth: sc(60) },
  msgText: { fontSize: sc(13), lineHeight: sc(18) },
  msgTime: { fontSize: sc(9), marginTop: sc(2), alignSelf: 'flex-end' },
  msgSpacer: { width: sc(26), marginRight: sc(6), marginBottom: sc(2) },

  typingDots: { flexDirection: 'row', alignItems: 'center', gap: sc(4), paddingVertical: sc(4) },
  dot: { width: sc(6), height: sc(6), borderRadius: sc(3) },
  dotMiddle: { opacity: 0.5 },

  quickReplies: { paddingHorizontal: sc(12), paddingVertical: sc(8) },
  quickRepliesInner: { gap: sc(8) },
  quickReplyBtn: { paddingHorizontal: sc(14), paddingVertical: sc(7), borderRadius: sc(20), borderWidth: 1 },
  quickReplyText: { fontSize: sc(11), fontWeight: '600' },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: sc(10), paddingVertical: sc(8), borderTopWidth: 1, gap: sc(8) },
  textInput: { flex: 1, borderRadius: sc(24), paddingHorizontal: sc(16), paddingVertical: sc(10), fontSize: sc(13), maxHeight: sc(100), minHeight: sc(40) },
  sendButton: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center', marginBottom: sc(2) },
});
