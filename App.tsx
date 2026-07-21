import { StatusBar } from 'expo-status-bar';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Venus</Text>
        <Text style={styles.subtitle}>Hello, world 👋</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C25',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 260,
    height: 217,
  },
  title: {
    color: '#FAFAFA',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#C9C9E0',
    fontSize: 17,
  },
});
