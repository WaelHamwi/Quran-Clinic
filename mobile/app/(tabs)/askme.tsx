import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { selectNetworkOnline } from '@/store/slices/uiSlice';
import { askAi, type ChatMessage, type NavAction } from '@/services/content/aiService';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/askme.styles';

interface Bubble extends ChatMessage {
  id: string;
  time: string;
  actions?: NavAction[];
}

function nowTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function AskMeScreen() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  const online = useAppSelector(selectNetworkOnline);
  const listRef = useRef<FlatList<Bubble>>(null);

  const [messages, setMessages] = useState<Bubble[]>([
    { id: 'greeting', role: 'assistant', content: t.askMe.greeting, time: nowTime() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const saved = await AsyncStorage.getItem('askme_messages');
        if (saved) {
          setMessages(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem('askme_messages', JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    };
    if (messages.length > 1) saveMessages();
  }, [messages]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const clearChat = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('askme_messages');
      setMessages([{ id: 'greeting', role: 'assistant', content: t.askMe.greeting, time: nowTime() }]);
    } catch (e) {
      console.error('Failed to clear chat:', e);
    }
  }, [t]);

  const send = useCallback(
    async (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || loading) return;
      setInput('');

      const userBubble: Bubble = { id: `u${Date.now()}`, role: 'user', content: msg, time: nowTime() };
      const withUser = [...messages, userBubble];
      setMessages(withUser);
      scrollToEnd();

      if (!online) {
        setMessages((m) => [
          ...m,
          { id: `a${Date.now()}`, role: 'assistant', content: t.askMe.offline, time: nowTime() },
        ]);
        scrollToEnd();
        return;
      }

      setLoading(true);
      try {
        const history: ChatMessage[] = withUser.map((b) => ({ role: b.role, content: b.content }));
        const { text: reply, actions } = await askAi(history);
        setMessages((m) => [
          ...m,
          { id: `a${Date.now()}`, role: 'assistant', content: reply, time: nowTime(), actions },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          { id: `e${Date.now()}`, role: 'assistant', content: t.askMe.error, time: nowTime() },
        ]);
      } finally {
        setLoading(false);
        scrollToEnd();
      }
    },
    [input, loading, messages, online, t, scrollToEnd],
  );

  const renderItem = useCallback<ListRenderItem<Bubble>>(
    ({ item }) => {
      if (item.role === 'user') {
        return (
          <View style={s.userRow}>
            <View style={s.userBubble}>
              <Text style={s.userBubbleText}>{item.content}</Text>
              <Text style={s.userTimestamp}>{item.time}</Text>
            </View>
            <View style={s.userAvatar}>
              <Ionicons name="person" size={16} color={theme.textOnBrand} />
            </View>
          </View>
        );
      }
      return (
        <View style={s.aiRow}>
          <View style={s.aiAvatar}>
            <Ionicons name="leaf" size={14} color={theme.success} />
          </View>
          <View style={s.aiBubble}>
            <Text style={s.aiBubbleText}>{item.content}</Text>
            <Text style={s.aiTimestamp}>{item.time}</Text>
            {item.actions && item.actions.length > 0 && (
              <View style={s.actionsRow}>
                {item.actions.map((action) => (
                  <Pressable
                    key={action.href}
                    style={s.actionBtn}
                    onPress={() => router.push(action.href as never)}
                  >
                    <Text style={s.actionBtnText}>{action.label[language]}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      );
    },
    [language, s, theme],
  );

  const suggestions = [
    t.askMe.suggestRuqyah,
    t.askMe.suggestDhikr,
    t.askMe.suggestHowTo,
    t.askMe.suggestExperience,
  ];

  return (
    <LinearGradient
      colors={theme.chatGradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={s.container}
    >
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top }]}>
          <View style={s.headerInner}>
            <Pressable onPress={clearChat}>
              <Ionicons name="refresh" size={20} color={theme.primary} />
            </Pressable>
            <Text style={s.headerTitle}>{t.askMe.title}</Text>
            <View style={s.headerSide} />
          </View>
        </View>

        {/* Messages */}
        <FlatList<Bubble>
          ref={listRef}
          style={s.flex}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          onContentSizeChange={scrollToEnd}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={s.dateBadge}>
              <Text style={s.dateBadgeText}>{t.askMe.today}</Text>
            </View>
          }
        />

        {/* Thinking indicator */}
        {loading ? (
          <View style={s.thinking}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={s.thinkingText}>{t.askMe.thinking}</Text>
          </View>
        ) : null}

        {/* Input area */}
        <View style={[s.inputArea, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {/* Suggestion chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipsContent}
          >
            {suggestions.map((chip) => (
              <Pressable key={chip} style={s.chip} onPress={() => send(chip)}>
                <Text style={s.chipText}>{chip}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Send button + input row */}
          <View style={s.inputRow}>
            <Pressable
              onPress={() => send()}
              disabled={loading || input.trim().length === 0}
              style={[s.sendBtn, (loading || input.trim().length === 0) && s.sendBtnDisabled]}
            >
              <Ionicons name="send" size={20} color={theme.textOnBrand} style={{ transform: [{ rotate: '180deg' }] }} />
            </Pressable>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t.askMe.placeholder}
              placeholderTextColor={theme.textPlaceholder}
              style={s.inputField}
              textAlign={language === 'ar' ? 'right' : 'left'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
