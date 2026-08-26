import { BrandLogo } from "@/components/BrandLogo";
import { colors } from "@/constants/theme";
import { getAuthErrorMessage, isValidEmail } from "@/lib/auth";
import { useAuth, useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignInScreen() {
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!isLoaded || isSubmitting) return;

    const trimmedEmail = email.trim();

    // Client-side validation
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const { error } = await signIn.password({
        identifier: trimmedEmail,
        password,
      });

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrorMessage(getAuthErrorMessage(error));
        return;
      }

      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrorMessage(getAuthErrorMessage(finalizeError));
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="w-full">
              {/* Brand Header */}
              <View className="mb-6 items-center">
                <BrandLogo size="large" />
              </View>

              {/* Welcome Titles */}
              <View className="mb-6 items-center">
                <Text className="text-center font-sans-bold text-3xl text-primary">
                  Welcome back
                </Text>
                <Text className="mt-2 text-center font-sans-medium text-base text-muted-foreground">
                  Sign in to continue managing your subscriptions
                </Text>
              </View>

          {/* Form Card */}
          <View className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            {errorMessage ? (
              <View className="mb-5 flex-row items-center rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5">
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color="#dc2626"
                  style={{ marginRight: 8 }}
                />
                <Text className="flex-1 font-sans-medium text-xs text-destructive">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View className="mb-4">
              <Text className="mb-2 font-sans-semibold text-sm text-primary">
                Email
              </Text>
              <View className="flex-row items-center rounded-2xl border border-border bg-background px-4 py-3.5">
                <TextInput
                  className="flex-1 font-sans-medium text-base text-primary"
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="mb-2 font-sans-semibold text-sm text-primary">
                Password
              </Text>
              <View className="flex-row items-center rounded-2xl border border-border bg-background px-4 py-3.5">
                <TextInput
                  className="flex-1 font-sans-medium text-base text-primary"
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  editable={!isSubmitting}
                  onSubmitEditing={handleSignIn}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={10}
                  className="ml-2"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="rgba(8, 17, 38, 0.5)"
                  />
                </Pressable>
              </View>
            </View>

            {/* Sign In Button */}
            <Pressable
              onPress={handleSignIn}
              disabled={isSubmitting || !isLoaded}
              className={`items-center justify-center rounded-2xl bg-accent py-4 ${
                isSubmitting || !isLoaded ? "opacity-70" : "active:opacity-90"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="font-sans-bold text-base text-white">
                  Sign in
                </Text>
              )}
            </Pressable>

            {/* Switch to Sign Up */}
            <View className="mt-6 flex-row items-center justify-center">
              <Text className="font-sans-medium text-sm text-muted-foreground">
                New to Recurly?{" "}
              </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable hitSlop={8}>
                  <Text className="font-sans-bold text-sm text-accent">
                    Create an account
                  </Text>
                </Pressable>
              </Link>
              </View>
            </View>
          </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}