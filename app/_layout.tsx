import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/auth/context/auth_context';
import { CategoryProvider } from '@/categories/context/category_context';
import { CourseProvider } from '@/courses/context/course_context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

    return (
      <AuthProvider>
        <CourseProvider>
          <CategoryProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="courses" options={{ headerShown: false }} />
              <Stack.Screen name="current_course" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
          </CategoryProvider>
      </CourseProvider>
    </AuthProvider>
  );
}
