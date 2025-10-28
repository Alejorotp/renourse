import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Redirect } from 'expo-router';
import { useAuthSession } from '../auth/context/auth_context';

const lilac = 'rgba(124, 77, 255, 1)';
const blue = 'rgba(43, 213, 243, 1)';

const TextFieldGeneral = ({ labelText, value, onChangeText, keyboardType = 'default', secureTextEntry = false }: { labelText: string, value: string, onChangeText: (text: string) => void, keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad', secureTextEntry?: boolean }) => (
  <View style={styles.textFieldContainer}>
    <TextInput
      style={styles.input}
      placeholder={labelText}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#888"
    />
  </View>
);
 
export default function LoginPage() {
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');

  const colorAnimation = useSharedValue(isLogin ? 1 : 0);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      color: colorAnimation.value === 1 ? lilac : blue,
    };
  });

    const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: colorAnimation.value === 1 ? lilac : blue,
    };
  });

  const { login, signUp, error, isLoggedIn, user, checkLoggedIn, isLoading } = useAuthSession();

  useEffect(() => {
    checkLoggedIn();
  }, [checkLoggedIn]);

  if (isLoggedIn && user) {
    return <Redirect href="/home" />;
  }

  const clearAllFields = () => {
    setEmail('');
    setPassword('');
    setUserName('');
  };

  const handleTabPress = (loginMode: boolean) => {
    clearAllFields();
    setIsLogin(loginMode);
    colorAnimation.value = withTiming(loginMode ? 1 : 0, { duration: 300 });
  };

  const onLoginAction = async (stayLoggedIn: boolean) => {
    try {
      // In a real app, you'd use a secure storage for the token if stayLoggedIn is true
      console.log(`User chose to stay logged in: ${stayLoggedIn}`);
      await login({ email, password });
      Alert.alert("Success", "Login successful");
    } catch (err: any) {
      const message = err instanceof Error ? err.message : err?.toString?.() ?? 'Login failed';
      Alert.alert("Error", message);
    }
  };

  const onSignUpAction = async () => {
    if (!email || !password || !userName) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    try {
      await signUp({ email, password, name: userName });
      Alert.alert("Success", "User created successfully");
      clearAllFields();
      handleTabPress(true);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : err?.toString?.() ?? 'Sign up failed';
      Alert.alert("Error", message);
    }
  };

  const handleAuthAction = () => {
    if (isLogin) {
      Alert.alert(
        "Stay Logged In",
        "Do you want to stay logged in?",
        [
          { text: "Yes", onPress: () => onLoginAction(true) },
          { text: "No", onPress: () => onLoginAction(false) },
        ]
      );
    } else {
      onSignUpAction();
    }
  };

  const TabButton = ({ text, active, onPress, loginMode }: { text: string, active: boolean, onPress: () => void, loginMode: boolean }) => {
    const animatedTabStyle = useAnimatedStyle(() => {
        const targetColor = loginMode ? lilac : blue;
        return {
            backgroundColor: withTiming(active ? targetColor : 'transparent', { duration: 300 }),
        };
    });

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={[styles.tabButton, animatedTabStyle]}>
                <Text style={[styles.tabButtonText, { color: active ? 'white' : 'black' }]}>{text}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={[{ marginBottom: 10 }]}>
          <Ionicons name="school" size={60} style={animatedIconStyle} />
        </Animated.View>
        <Text style={styles.title}>FLOURSE</Text>
        <Text style={styles.subtitle}>A Flutter app to manage courses</Text>

        <View style={styles.tabContainer}>
          <TabButton text="Sign In" active={isLogin} onPress={() => handleTabPress(true)} loginMode={true} />
          <TabButton text="Sign Up" active={!isLogin} onPress={() => handleTabPress(false)} loginMode={false} />
        </View>

        <TextFieldGeneral labelText="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextFieldGeneral labelText="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {!isLogin && (
          <TextFieldGeneral labelText="Username" value={userName} onChangeText={setUserName} />
        )}

        <TouchableOpacity onPress={handleAuthAction} disabled={isLoading}>
          <Animated.View style={[styles.button, animatedButtonStyle, isLoading && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Please wait…' : isLogin ? 'Sign In' : 'Sign Up'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F4FA',
    paddingVertical: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: 'black',
    marginBottom: 25,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 40,
    padding: 6,
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 25,
  },
  tabButton: {
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textFieldContainer: {
    width: '80%',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});
