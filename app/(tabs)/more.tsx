import React, { useCallback, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Share, Text, View } from 'react-native';
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
import { useFeatureVisibility } from '@/hooks/useFeatures';
import { FEATURE_KEYS } from '@/constants/features';
import { palette } from '@/theme/colors';
import {
  moreScreenStyles as s,
  BANNER_CLOSE_COLOR,
  BANNER_ICON_COLOR,
} from '@/styles/moreScreen.styles';

export default function MoreScreen() {
  const { t, isArabic } = useLanguage();
  const router = useRouter();
  const { user, signOut, deleteAccount } = useAuth();
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

  const userName = user?.name ?? user?.email ?? t.more.guest;
  const userEmail = user?.email ?? '';

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
          <UserAvatar uri={user?.avatar_path} name={userName} size={56} />
          <Text style={s.moreScreen__profileName}>{userName}</Text>
          {userEmail ? <Text style={s.moreScreen__profileEmail}>{userEmail}</Text> : null}
        </Pressable>

        {bannerVisible ? (
          <Pressable style={s.moreScreen__banner} onPress={openSubSheet}>
            <View style={[s.moreScreen__bannerHeader, isArabic && s.moreScreen__bannerHeaderRtl]}>
              <Pressable style={s.moreScreen__bannerCloseBtn} onPress={dismissBanner} hitSlop={10}>
                <Ionicons name="close" size={14} color={BANNER_CLOSE_COLOR} />
              </Pressable>
              <View style={[s.moreScreen__bannerRow, isArabic && s.moreScreen__bannerRowRtl]}>
                <View style={s.moreScreen__bannerIconWrap}>
                  <Ionicons name="school-outline" size={30} color={BANNER_ICON_COLOR} />
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

        <View style={s.moreScreen__group}>
          <MenuRow
            icon="log-out-outline"
            label={t.more.logout}
            onPress={signOut}
            danger
          />
          <View style={s.moreScreen__separator} />
          <MenuRow
            icon="trash-outline"
            label={t.more.deleteAccount}
            onPress={() => setDeleteConfirmOpen(true)}
            danger
          />
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
              <Ionicons name="trash-outline" size={28} color={palette.system.error[500]} />
            </View>
            <Text style={s.moreScreen__modalTitle}>{t.more.deleteAccountConfirmTitle}</Text>
            <Text style={s.moreScreen__modalBody}>{t.more.deleteAccountConfirmBody}</Text>
            <Pressable
              style={[s.moreScreen__modalBtnDanger, deleting && s.moreScreen__modalBtnDisabled]}
              onPress={onConfirmDelete}
              disabled={deleting}
            >
              <Text style={s.moreScreen__modalBtnDangerText}>
                {deleting ? '...' : t.more.deleteAccountConfirm}
              </Text>
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
