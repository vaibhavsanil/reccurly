import { colors } from "@/constants/theme";
import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress ?? "user@example.com";
  const displayName =
    user?.fullName ||
    user?.firstName ||
    email.split("@")[0] ||
    "Recurly User";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Recurly?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setIsSigningOut(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await signOut();
            router.replace("/(auth)/sign-in");
          } catch (error) {
            console.error("Failed to sign out:", error);
            Alert.alert("Error", "Could not sign out. Please try again.");
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        <Text className="mb-6 font-sans-bold text-3xl text-primary">Settings</Text>

        {/* Profile Card */}
        <View className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <View className="flex-row items-center gap-4">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="size-16 rounded-full border-2 border-accent"
              />
            ) : (
              <View className="size-16 items-center justify-center rounded-full bg-accent">
                <Text className="font-sans-extrabold text-2xl text-white">
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="font-sans-bold text-xl text-primary">
                {displayName}
              </Text>
              <Text className="mt-0.5 font-sans-medium text-sm text-muted-foreground">
                {email}
              </Text>
              <View className="mt-2 self-start rounded-full bg-accent/15 px-2.5 py-0.5">
                <Text className="font-sans-bold text-[11px] text-accent">
                  Standard Member
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <Text className="mb-4 font-sans-bold text-base text-primary">
            Preferences
          </Text>

          <View className="gap-4">
            <View className="flex-row items-center justify-between border-b border-border/50 pb-3">
              <View className="flex-row items-center gap-3">
                <Ionicons name="cash-outline" size={20} color="#081126" />
                <Text className="font-sans-medium text-sm text-primary">
                  Currency
                </Text>
              </View>
              <Text className="font-sans-semibold text-sm text-muted-foreground">
                USD ($)
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-b border-border/50 pb-3">
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#081126"
                />
                <Text className="font-sans-medium text-sm text-primary">
                  Renewal Reminders
                </Text>
              </View>
              <Text className="font-sans-semibold text-sm text-accent">
                3 days before
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#081126"
                />
                <Text className="font-sans-medium text-sm text-primary">
                  Security
                </Text>
              </View>
              <Text className="font-sans-semibold text-sm text-muted-foreground">
                Protected
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-4 active:bg-destructive/20"
        >
          {isSigningOut ? (
            <ActivityIndicator color="#dc2626" size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text className="font-sans-bold text-base text-destructive">
                Sign Out
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}