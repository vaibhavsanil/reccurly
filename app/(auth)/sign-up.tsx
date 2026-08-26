import { BrandLogo } from "@/components/BrandLogo";
import { colors } from "@/constants/theme";
import { getAuthErrorMessage, isValidEmail, isValidPassword } from "@/lib/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useEffect, useState } from "react";
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

export default function SignUpScreen() {
  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();
  const router = useRouter();

  // Step state: false = registration form, true = email verification
  const [isVerifying, setIsVerifying] = useState(false);

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend code
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  // Handle Initial Registration
  const handleSignUp = async () => {
    if (!isLoaded || isSubmitting) return;

    const trimmedEmail = email.trim();

    // Validation
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
      setErrorMessage("Please enter a password.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMessage("Password must be at least 8 characters long.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Create sign-up with Clerk
      const { error } = await signUp.password({
        emailAddress: trimmedEmail,
        password,
      });

      if (error) {
        console.error("Clerk sign-up error:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrorMessage(getAuthErrorMessage(error));
        return;
      }

      // Prepare email verification code
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        console.error("Clerk sendEmailCode error:", sendError);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrorMessage(getAuthErrorMessage(sendError));
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsVerifying(true);
      setResendCooldown(60);
    } catch (err: unknown) {
      console.error("Clerk sign-up exception:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Verification Code Submission
  const handleVerifyCode = async () => {
    if (!isLoaded || isSubmitting) return;

    const trimmedCode = verificationCode.trim();

    if (!trimmedCode) {
      setVerificationError("Please enter the 6-digit verification code.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setIsSubmitting(true);
      setVerificationError(null);

      const { error } = await signUp.verifications.verifyEmailCode({
        code: trimmedCode,
      });

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setVerificationError(getAuthErrorMessage(error));
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setVerificationError(getAuthErrorMessage(finalizeError));
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setVerificationError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend Code
  const handleResendCode = async () => {
    if (!isLoaded || isResending || resendCooldown > 0) return;

    try {
      setIsResending(true);
      setVerificationError(null);

      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setVerificationError(getAuthErrorMessage(error));
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResendCooldown(60);
    } catch (err: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setVerificationError(getAuthErrorMessage(err));
    } finally {
      setIsResending(false);
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

          {isVerifying ? (
            /* Stage 2: Email Verification UI */
            <View>
              <View className="mb-6 items-center">
                <Text className="text-center font-sans-bold text-3xl text-primary">
                  Verify your email
                </Text>
                <Text className="mt-2 text-center font-sans-medium text-base text-muted-foreground">
                  We{"'"}ve sent a 6-digit code to{"\n"}
                  <Text className="font-sans-bold text-primary">{email}</Text>
                </Text>
              </View>

              <View className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                {verificationError ? (
                  <View className="mb-5 flex-row items-center rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5">
                    <Ionicons
                      name="alert-circle"
                      size={20}
                      color="#dc2626"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="flex-1 font-sans-medium text-xs text-destructive">
                      {verificationError}
                    </Text>
                  </View>
                ) : null}

                {/* Verification Code Input */}
                <View className="mb-6">
                  <Text className="mb-2 font-sans-semibold text-sm text-primary">
                    Verification Code
                  </Text>
                  <View className="flex-row items-center rounded-2xl border border-border bg-background px-4 py-4">
                    <TextInput
                      className="flex-1 text-center font-sans-bold text-2xl tracking-[8px] text-primary"
                      placeholder="000000"
                      placeholderTextColor="rgba(8, 17, 38, 0.3)"
                      value={verificationCode}
                      onChangeText={(val) => {
                        setVerificationCode(val);
                        if (verificationError) setVerificationError(null);
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                      editable={!isSubmitting}
                      onSubmitEditing={handleVerifyCode}
                    />
                  </View>
                </View>

                {/* Verify Button */}
                <Pressable
                  onPress={handleVerifyCode}
                  disabled={isSubmitting || !isLoaded}
                  className={`items-center justify-center rounded-2xl bg-accent py-4 ${
                    isSubmitting || !isLoaded
                      ? "opacity-70"
                      : "active:opacity-90"
                  }`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text className="font-sans-bold text-base text-white">
                      Verify & Continue
                    </Text>
                  )}
                </Pressable>

                {/* Resend Code Option */}
                <View className="mt-5 items-center justify-center">
                  {resendCooldown > 0 ? (
                    <Text className="font-sans-medium text-sm text-muted-foreground">
                      Resend code in{" "}
                      <Text className="font-sans-bold text-primary">
                        {resendCooldown}s
                      </Text>
                    </Text>
                  ) : (
                    <Pressable
                      onPress={handleResendCode}
                      disabled={isResending}
                      hitSlop={8}
                    >
                      {isResending ? (
                        <ActivityIndicator color="#ea7a53" size="small" />
                      ) : (
                        <Text className="font-sans-bold text-sm text-accent">
                          Didn{"'"}t receive code? Resend
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>

                {/* Back to change email */}
                <Pressable
                  onPress={() => {
                    setIsVerifying(false);
                    setVerificationCode("");
                    setVerificationError(null);
                  }}
                  className="mt-4 items-center"
                  hitSlop={8}
                >
                  <Text className="font-sans-medium text-xs text-muted-foreground underline">
                    Use a different email address
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* Stage 1: Registration Form UI */
            <View>
              <View className="mb-6 items-center">
                <Text className="text-center font-sans-bold text-3xl text-primary">
                  Create account
                </Text>
                <Text className="mt-2 text-center font-sans-medium text-base text-muted-foreground">
                  Start tracking and saving on your subscriptions today
                </Text>
              </View>

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
                      placeholder="At least 8 characters"
                      placeholderTextColor="rgba(8, 17, 38, 0.4)"
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password-new"
                      textContentType="newPassword"
                      editable={!isSubmitting}
                      onSubmitEditing={handleSignUp}
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
                  <Text className="mt-1.5 font-sans-medium text-[11px] text-muted-foreground">
                    Must be at least 8 characters.
                  </Text>
                </View>

                {/* Sign Up Button */}
                <Pressable
                  onPress={handleSignUp}
                  disabled={isSubmitting || !isLoaded}
                  className={`items-center justify-center rounded-2xl bg-accent py-4 ${
                    isSubmitting || !isLoaded
                      ? "opacity-70"
                      : "active:opacity-90"
                  }`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text className="font-sans-bold text-base text-white">
                      Create account
                    </Text>
                  )}
                </Pressable>

                {/* Required for web captcha if used in web mode */}
                <View nativeID="clerk-captcha" />

                {/* Switch to Sign In */}
                <View className="mt-6 flex-row items-center justify-center">
                  <Text className="font-sans-medium text-sm text-muted-foreground">
                    Already have an account?{" "}
                  </Text>
                  <Link href="/(auth)/sign-in" asChild>
                    <Pressable hitSlop={8}>
                      <Text className="font-sans-bold text-sm text-accent">
                        Sign in
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
);
}