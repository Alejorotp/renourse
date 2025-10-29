import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/auth/context/auth_context';
import { CourseProvider } from '@/courses/context/course_context';
import { GroupProvider } from '@/groups/context/group_context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <CourseProvider>
        <GroupProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="courses/index" options={{ headerShown: false }} />
              <Stack.Screen name="courses/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="groups/index" options={{ headerShown: false }} />
              <Stack.Screen name="groups/[id]" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </GroupProvider>
      </CourseProvider>
    </AuthProvider>
  );
}
