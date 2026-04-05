import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../lib/constants';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('VEIL boundary error', error);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>VEIL</Text>
          <Text style={styles.body}>Something went wrong. The app kept your place.</Text>
          <TouchableOpacity style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonText}>Reload screen</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: COLORS.white, fontSize: 34, fontWeight: '800', marginBottom: 10 },
  body: { color: COLORS.muted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 18 },
  button: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: COLORS.white, fontWeight: '700' },
});
