import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { Button } from '@/components/common/Button';
import { reportError } from '@/services/common/errorReporting';
import { createStyles } from './ErrorBoundary.styles';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Themed fallback shown when a child render throws. */
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = useStyles(createStyles);
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t.common.error}</Text>
      <Button title={t.common.retry} onPress={onRetry} variant="outline" />
    </View>
  );
}

/** Class component — React error boundaries cannot be functional. */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) console.warn('[ErrorBoundary]', error.message);
    reportError(error, { componentStack: info.componentStack });
  }

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
