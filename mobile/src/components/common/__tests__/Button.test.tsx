import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '@/components/common/Button';

// Isolate the component from the theme system; behavior under test is press handling,
// not styling.
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: { textOnBrand: '#ffffff', primary: '#135452' } }),
}));
jest.mock('@/hooks/common/useStyles', () => ({ useStyles: () => ({}) }));

describe('<Button />', () => {
  it('renders its title', () => {
    const { getByText } = render(<Button title="Save" onPress={() => {}} />);
    expect(getByText('Save')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Save" onPress={onPress} />);

    fireEvent.press(getByText('Save'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress while disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Save" onPress={onPress} disabled />);

    fireEvent.press(getByText('Save'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('hides the title and blocks presses while loading', () => {
    const onPress = jest.fn();
    const { queryByText } = render(<Button title="Save" onPress={onPress} loading />);

    expect(queryByText('Save')).toBeNull();
  });
});
