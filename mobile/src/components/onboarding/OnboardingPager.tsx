import React, { useCallback, useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnbBgVector from '@/assets/figma/onb1-bg.svg';
import TickIcon from '@/assets/figma/tick.svg';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { FigmaTopBar } from '@/components/layout/FigmaTopBar';
import { useLanguage } from '@/context/LanguageContext';
import { onboardingPagerStyles as s } from './OnboardingPager.styles';

type Props = { onComplete: () => void };

const SLIDE_MS = 4200;
const SLIDE_COUNT = 4;

const SLIDE_ILLUSTRATIONS = [
  require('../../../assets/figma/onb1-illo.png'),
  require('../../../assets/figma/onb2-illo.png'),
  require('../../../assets/figma/onb3-illo.png'),
  require('../../../assets/figma/onb4-illo.png'),
];

export function OnboardingPager({ onComplete }: Props) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  const finish = useCallback(() => onComplete(), [onComplete]);

  // FR-2.2: slides auto-transition with no navigation buttons; after the last
  // slide we auto-advance straight into the next flow step.
  useEffect(() => {
    const id = setTimeout(() => {
      if (index >= SLIDE_COUNT - 1) {
        finish();
      } else {
        setIndex((i) => i + 1);
      }
    }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, finish]);

  return (
    <View style={s.root}>
      <PatternedBackground />

      <FigmaTopBar showBrandLogo />
      <SafeAreaView style={s.safe} edges={['bottom']}>

        <View style={s.illoBlock}>
          <View style={s.bgVector}>
            <OnbBgVector width="100%" height="100%" />
          </View>
          <View style={s.illoImageWrap} pointerEvents="none">
            <Image
              source={SLIDE_ILLUSTRATIONS[index]}
              style={s.illoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={s.bottom}>
          <View style={s.dots}>
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => {
              const isActive = SLIDE_COUNT - 1 - i === index;
              return (
                <View key={i} style={isActive ? s.dotActive : s.dotInactive} />
              );
            })}
          </View>

          <View style={s.textBlock}>
            {index === 0 && (
              <Text style={s.titleText}>{t.onboarding.slide1Title}</Text>
            )}

            {index === 1 && (
              <View style={s.verseBlock}>
                <Text style={s.titleText}>{t.onboarding.slide2Title}</Text>
                <Text style={s.refText}>{t.onboarding.slide2Desc}</Text>
              </View>
            )}

            {index === 2 && (
              <View style={s.checklist}>
                <View style={s.checkRow}>
                  <Text style={s.titleText} numberOfLines={2}>
                    {t.onboarding.slide3Title}
                  </Text>
                  <View style={s.tick}>
                    <TickIcon width={20} height={20} />
                  </View>
                </View>
                <View style={s.checkRow}>
                  <Text style={s.titleText} numberOfLines={2}>
                    {t.onboarding.slide3Desc}
                  </Text>
                  <View style={s.tick}>
                    <TickIcon width={20} height={20} />
                  </View>
                </View>
              </View>
            )}

            {index === 3 && (
              <View style={s.privacyBlock}>
                <Text style={s.titleText}>{t.onboarding.slide4Title}</Text>
                <Text style={s.bodyText}>{t.onboarding.slide4Desc}</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
