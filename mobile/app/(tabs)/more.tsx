import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, Share, Switch, Text, View } from 'react-native';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { MenuRow } from '@/components/common/MenuRow';
import { DisclaimerPopup } from '@/components/common/DisclaimerPopup';
import { LanguagePickerSheet } from '@/components/common/LanguagePickerSheet';
import { SubscriptionSheet } from '@/components/common/SubscriptionSheet';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { accountService } from '@/services/auth/accountService';
import { formatBytes } from '@/utils/formatters';
import { useFeatureVisibility } from '@/hooks/common/useFeatures';
import { FEATURE_KEYS } from '@/constants/features';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/moreScreen.styles';

export default function MoreScreen() {
  const { t, isArabic } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const s = useStyles(createStyles);
  const router = useRouter();
  const { profile, isGuest, signOut, deleteAccount } = useAuth();
  const isVisible = useFeatureVisibility();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const [bannerVisible, setBannerVisible] = useState(true);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [subSheetOpen, setSubSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const goEditProfile = useCallback(() => router.push('/edit-profile'), [router]);
  const goNotifications = useCallback(() => router.push('/notifications'), [router]);
  const goDownloads = useCallback(() => router.push('/downloads'), [router]);
  const goAboutUs = useCallback(() => router.push('/about-us'), [router]);
  const goSponsors = useCallback(() => router.push('/sponsors'), [router]);
  const openSubSheet = useCallback(() => setSubSheetOpen(true), []);
  const openLangSheet = useCallback(() => setLangSheetOpen(true), []);
  const openDisclaimer = useCallback(() => setDisclaimerOpen(true), []);
  const dismissBanner = useCallback(() => setBannerVisible(false), []);
  const goContactUs = useCallback(() => router.push('/contact-us'), [router]);
  const goReportBug = useCallback(() => router.push('/report-bug'), [router]);
  const onRateApp = useCallback(() => void Linking.openURL('https://apps.apple.com'), []);
  const onShareApp = useCallback(async () => {
    try { await Share.share({ message: t.more.appName }); } catch {}
  }, [t.more.appName]);

  const onConfirmDelete = useCallback(async () => {
    setDeleting(true);
    try { await deleteAccount(); } finally { setDeleting(false); setDeleteConfirmOpen(false); }
  }, [deleteAccount]);

  // A real session loses its downloads on sign-out (gated audio must not
  // outlive the entitled account), so warn before proceeding when any exist.
  const onLogout = useCallback(() => {
    const { count, size } = accountService.getDownloadStats();
    if (isGuest || count === 0) {
      void signOut();
      return;
    }
    Alert.alert(
      t.more.logoutConfirmTitle,
      t.more.logoutConfirmBody(count, formatBytes(size)),
      [
        { text: t.more.logoutKeepDownloads, style: 'cancel' },
        { text: t.more.logoutConfirm, style: 'destructive', onPress: () => void signOut() },
      ],
    );
  }, [isGuest, signOut, t]);

  const [deleteStats, setDeleteStats] = useState<{ count: number; size: number }>({ count: 0, size: 0 });
  const openDeleteConfirm = useCallback(() => {
    setDeleteStats(accountService.getDownloadStats());
    setDeleteConfirmOpen(true);
  }, []);

  const userName = profile?.name ?? profile?.email ?? t.more.guest;
  const userEmail = profile?.email ?? '';

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.more.title} showBack={false} />
      <ScrollView
        contentContainerStyle={s.moreScreen__content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <Pressable style={s.moreScreen__profileCard} onPress={goEditProfile}>
          <UserAvatar uri={profile?.avatar_path} name={userName} size={56} />
          <Text style={s.moreScreen__profileName}>{userName}</Text>
          {userEmail ? <Text style={s.moreScreen__profileEmail}>{userEmail}</Text> : null}
        </Pressable>

        {bannerVisible ? (
          <Pressable style={s.moreScreen__banner} onPress={openSubSheet}>
            <View style={[s.moreScreen__bannerHeader, isArabic && s.moreScreen__bannerHeaderRtl]}>
              <Pressable style={s.moreScreen__bannerCloseBtn} onPress={dismissBanner} hitSlop={10}>
                <Ionicons name="close" size={14} color={theme.textOnBrand} />
              </Pressable>
              <View style={[s.moreScreen__bannerRow, isArabic && s.moreScreen__bannerRowRtl]}>
                <View style={s.moreScreen__bannerIconWrap}>
                  <Ionicons name="school-outline" size={30} color={theme.textOnBrand} />
                </View>
                <View style={s.moreScreen__bannerTexts}>
                  <Text style={s.moreScreen__bannerTitle}>{t.more.upgradeBannerTitle}</Text>
                  <Text style={s.moreScreen__bannerSub}>{t.more.upgradeBannerSubtitle}</Text>
                  <Pressable style={s.moreScreen__bannerCta} onPress={openSubSheet}>
                    <Text style={s.moreScreen__bannerCtaText}>{t.more.getFreeMonth}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Pressable>
        ) : null}

        <Text style={s.moreScreen__sectionTitle}>{t.more.account}</Text>
        <View style={s.moreScreen__group}>
          <MenuRow
            icon="person-outline"
            label={t.editProfile.title}
            description={t.more.freeVersion}
            onPress={goEditProfile}
            showChevron
          />
          {isVisible(FEATURE_KEYS.SPONSORS) && (
            <>
              <View style={s.moreScreen__separator} />
              <MenuRow
                icon="gift-outline"
                label={t.more.officialSponsors}
                onPress={goSponsors}
                showChevron
              />
            </>
          )}
          <View style={s.moreScreen__separator} />
          <MenuRow
            icon="globe-outline"
            label={t.more.appLanguage}
            onPress={openLangSheet}
            showChevron
          />
          <View style={s.moreScreen__separator} />
          <MenuRow
            icon={isDark ? 'moon' : 'moon-outline'}
            label={t.more.darkMode}
            onPress={toggleTheme}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primaryMid }}
                thumbColor={isDark ? theme.primary : theme.surface}
              />
            }
          />
          <View style={s.moreScreen__separator} />
          <MenuRow
            icon="notifications-outline"
            label={t.more.notifications}
            onPress={goNotifications}
            showChevron
          />
          <View style={s.moreScreen__separator} />
          <MenuRow
            icon="download-outline"
            label={t.more.downloads}
            description={t.more.downloadsSub}
            onPress={goDownloads}
            showChevron
          />
        </View>

        <Text style={s.moreScreen__sectionTitle}>{t.more.information}</Text>
        <View style={s.moreScreen__group}>
          <MenuRow
            icon="information-circle-outline"
            label={t.more.aboutUs}
            onPress={goAboutUs}
            showChevron
          />
          <View style={s.moreScreen__separator} />
          <MenuRow
            icon="chatbubble-outline"
            label={t.more.contactUs}
            onPress={goContactUs}
            showChevron
          />
          <View style={s.moreScreen__separator} />
          <MenuRow
            icon="document-text-outline"
            label={t.more.terms}
            onPress={openDisclaimer}
            showChevron
          />
        </View>

        <Text style={s.moreScreen__sectionTitle}>{t.more.ratingsAndFeedback}</Text>
        <View style={s.moreScreen__group}>
          <MenuRow
            icon="star-outline"
            label={t.more.rateApp}
            onPress={onRateApp}
            showChevron
          />
          <View style={s.moreScreen__separator} />
          <MenuRow
            icon="warning-outline"
            label={t.more.reportBug}
            onPress={goReportBug}
            showChevron
          />
          <View style={s.moreScreen__separator} />
          <MenuRow
            icon="share-social-outline"
            label={t.more.shareApp}
            onPress={onShareApp}
            showChevron
          />
        </View>

        {/* Logout shows for everyone — for a guest it exits guest mode back to the login
            gate. Delete only applies to a real account. */}
        <View style={s.moreScreen__group}>
          <MenuRow
            icon="log-out-outline"
            label={t.more.logout}
            onPress={onLogout}
            danger
          />
          {!isGuest && (
            <>
              <View style={s.moreScreen__separator} />
              <MenuRow
                icon="trash-outline"
                label={t.more.deleteAccount}
                onPress={openDeleteConfirm}
                danger
              />
            </>
          )}
        </View>

        <View style={s.moreScreen__footer}>
          <Text style={s.moreScreen__appName}>{t.more.appName}</Text>
          <Text style={s.moreScreen__versionText}>{t.more.version} {version}</Text>
        </View>
      </ScrollView>

      <DisclaimerPopup visible={disclaimerOpen} onAccept={() => setDisclaimerOpen(false)} />
      <LanguagePickerSheet visible={langSheetOpen} onClose={() => setLangSheetOpen(false)} />
      <SubscriptionSheet visible={subSheetOpen} onClose={() => setSubSheetOpen(false)} />

      {/* Delete account confirmation */}
      <Modal visible={deleteConfirmOpen} transparent animationType="fade" onRequestClose={() => setDeleteConfirmOpen(false)}>
        <View style={s.moreScreen__modalOverlay}>
          <View style={s.moreScreen__modalCard}>
            <View style={s.moreScreen__modalIconWrap}>
              <Ionicons name="trash-outline" size={28} color={theme.error} />
            </View>
            <Text style={s.moreScreen__modalTitle}>{t.more.deleteAccountConfirmTitle}</Text>
            <Text style={s.moreScreen__modalBody}>
              {t.more.deleteAccountConfirmBody}
              {deleteStats.count > 0
                ? ` ${t.more.deleteAccountDownloadsNote(deleteStats.count, formatBytes(deleteStats.size))}`
                : ''}
            </Text>
            <Pressable
              style={[s.moreScreen__modalBtnDanger, deleting && s.moreScreen__modalBtnDisabled]}
              onPress={onConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={theme.textOnBrand} />
              ) : (
                <Text style={s.moreScreen__modalBtnDangerText}>
                  {t.more.deleteAccountConfirm}
                </Text>
              )}
            </Pressable>
            <Pressable style={s.moreScreen__modalBtnCancel} onPress={() => setDeleteConfirmOpen(false)} disabled={deleting}>
              <Text style={s.moreScreen__modalBtnCancelText}>{t.more.deleteAccountCancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
