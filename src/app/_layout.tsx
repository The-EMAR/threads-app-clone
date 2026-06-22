import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import {
	DMSans_400Regular,
	DMSans_500Medium,
	DMSans_700Bold,
	useFonts,
} from '@expo-google-fonts/dm-sans';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, useColorScheme } from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

LogBox.ignoreLogs(['Clerk: Clerk has been loaded with development keys.']);

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // 1. Менажиране на Splash Screen (Крие се само когато И шрифтовете, И Clerk са готови)
  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded]);

  // 2. Автоматично пренасочване според състоянието на логване
  useEffect(() => {
    if (!isLoaded || !fontsLoaded) return;

    // Проверяваме дали потребителят в момента се намира в папка (auth)
    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && !inAuthGroup) {
      // Ако е логнат, но е на логин екрана -> пращаме го директно във фийда
      // Смени '(tabs)/feed' с точния път до началния ти екран вътре в (auth) ако е различен
      router.replace('/(auth)/(tabs)/feed'); 
    } else if (!isSignedIn && inAuthGroup) {
      // Ако не е логнат, а се опитва да влезе в защитен екран -> връщаме го на логина
      router.replace('/(public)');
    }
  }, [isLoaded, fontsLoaded, isSignedIn, segments]);

  // Докато трае първоначалното зареждане, не рендерираме нищо (Splash-а се вижда)
  if (!fontsLoaded || !isLoaded) {
    return null;
  }

  // Вместо чист Slot, използваме Stack, за да дефинираме групите ни като root екрани
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(public)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <InitialLayout />
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}