import React from 'react';
import { render } from '@testing-library/react-native';
import { WirdReader } from '@/components/players/WirdReader';
import type { AccessibleRecording } from '@/types/recording';

jest.mock('@/hooks/player/usePlayer', () => ({
  usePlayer: () => ({ position: 0, duration: 60000, isDarkMode: false }),
}));

jest.mock('@/hooks/player/useReadingSurface', () => ({
  useReadingSurface: () => ({ textColor: '#000', fontSize: 16 }),
}));

jest.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({ isArabic: true, t: {} }),
}));

jest.mock('@/hooks/common/useStyles', () => ({
  useStyles: (factory: (theme: unknown) => unknown) =>
    factory({ textMuted: '#888', text: '#000' }),
}));

const session = (id: number, ar: string, attachmentId = id): AccessibleRecording =>
  ({
    id,
    attachment_id: attachmentId,
    type: 'summarized',
    requires_subscription: false,
    session_number: attachmentId,
    description: { ar, en: `English ${id}` },
    segments: null,
    accessible: true,
  }) as unknown as AccessibleRecording;

describe('WirdReader', () => {
  it('renders every session text, not just the playing one', () => {
    // The sessions of one tab are a single ruqyah — all of their text belongs
    // on screen, so the whole thing can be read ahead of the audio.
    const { getByText } = render(
      <WirdReader
        recordings={[session(1, 'النص الأول'), session(2, 'النص الثاني'), session(3, 'النص الثالث')]}
        playingKey="a1"
      />,
    );

    expect(getByText('النص الأول')).toBeTruthy();
    expect(getByText('النص الثاني')).toBeTruthy();
    expect(getByText('النص الثالث')).toBeTruthy();
  });

  it('still renders the later sessions while the first is playing', () => {
    const { getByText } = render(
      <WirdReader recordings={[session(1, 'أول'), session(2, 'ثانٍ')]} playingKey="a1" />,
    );

    expect(getByText('ثانٍ')).toBeTruthy();
  });

  it('renders a repeated recording once per occurrence', () => {
    // A ruqyah that opens on a passage and returns to it at the end sends that
    // recording twice. Both blocks belong on screen — keying them by recording
    // id would collapse them into one.
    const opening = session(1, 'الافتتاح', 1);
    const middle = session(2, 'الوسط', 2);
    const closing = session(1, 'الافتتاح', 3);

    const { getAllByText } = render(
      <WirdReader recordings={[opening, middle, closing]} playingKey="a3" />,
    );

    expect(getAllByText('الافتتاح')).toHaveLength(2);
  });

  it('renders a session with no text at all as nothing, without dropping the others', () => {
    const blank = { ...session(2, ''), description: null, segments: null } as AccessibleRecording;

    const { getByText, queryByText } = render(
      <WirdReader recordings={[session(1, 'موجود'), blank, session(3, 'كذلك')]} playingKey="a1" />,
    );

    expect(getByText('موجود')).toBeTruthy();
    expect(getByText('كذلك')).toBeTruthy();
    expect(queryByText('English 2')).toBeNull();
  });

  it('renders nothing when there are no sessions', () => {
    const { toJSON } = render(<WirdReader recordings={[]} />);

    expect(JSON.stringify(toJSON())).not.toContain('النص');
  });
});
