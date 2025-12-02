import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider } from '@/auth/context/auth_context';
import { CategoryProvider } from '@/categories/context/category_context';
import { CourseProvider } from '@/courses/context/course_context';
import { EvaluationProvider } from '@/evaluations/context/evaluation_context';
import { GroupProvider } from '@/groups/context/group_context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ReportProvider } from '@/reports/context/report_context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CourseProvider>
          <CategoryProvider>
            <GroupProvider>
              <EvaluationProvider>
                <ReportProvider>
                  <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack>
                      <Stack.Screen name="login" options={{ headerShown: false }} />
                      <Stack.Screen name="home" options={{ headerShown: false }} />
                      <Stack.Screen name="modal" options={{ headerShown: false }} />
                      {/* Put index before dynamic to avoid /groups/index being captured as id = "index" */}
                      <Stack.Screen name="courses/index" options={{ headerShown: false }} />
                      <Stack.Screen name="courses/[id]" options={{ headerShown: false }} />
                      <Stack.Screen name="groups/index" options={{ headerShown: false }} />
                      <Stack.Screen name="groups/[id]" options={{ headerShown: false }} />
                      <Stack.Screen name="evaluations/index" options={{ headerShown: false }} />
                      <Stack.Screen name="evaluations/[id]" options={{ headerShown: false }} />
                      <Stack.Screen name="evaluations/create" options={{ headerShown: false }} />
                      <Stack.Screen name="evaluations/evaluate" options={{ headerShown: false }} />
                    </Stack>
                    <StatusBar style="auto" />
                  </ThemeProvider>
                </ReportProvider>
              </EvaluationProvider>
            </GroupProvider>
          </CategoryProvider>
        </CourseProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
