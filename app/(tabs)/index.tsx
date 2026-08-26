import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import LISTHEADING from "@/components/LISTHEADING";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React, { useState } from "react";
import { FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function HomeScreen() {
  const { user } = useUser();
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const userName =
    user?.firstName ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    HOME_USER.name;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        <View className="home-header">
          <View className="home-user">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="home-avatar"
              />
            ) : (
              <Image source={images.avatar} className="home-avatar" />
            )}
            <Text className="home-user-name">{userName}</Text>
          </View>
          <Pressable
            onPress={() => setIsCreateModalOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add Subscription"
          >
            <Image source={icons.add} className="home-add-icon" />
          </Pressable>
        </View>

        <View className="home-balance-card">
          <Text className="home-balance-label">Total Balance</Text>
          <View className="home-balance-row">
            <Text className="home-balance-amount">
              {formatCurrency(HOME_BALANCE.amount)}
            </Text>
            <Text className="home-balance-date">
              {dayjs(HOME_BALANCE.nextRenewalDate).format("MMM DD, YYYY")}
            </Text>
          </View>
        </View>

        <View>
          <LISTHEADING title="Upcoming Subscriptions" />
          <FlatList
            data={UPCOMING_SUBSCRIPTIONS}
            renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Text className="home-empty-state">
                No Upcoming Subscriptions
              </Text>
            )}
          />
        </View>

        <View>
          <LISTHEADING title="All Subscriptions" />
          <FlatList
            data={subscriptions}
            renderItem={({ item }) => (
              <SubscriptionCard
                {...item}
                expanded={expandedId === item.id}
                onPress={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 12 }}
            ListEmptyComponent={() => (
              <Text className="home-empty-state">
                No Subscriptions
              </Text>
            )}
          />
        </View>
      </ScrollView>

      <CreateSubscriptionModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSubscription={(newSubscription) => {
          setSubscriptions((prev) => [newSubscription, ...prev]);
        }}
      />
    </SafeAreaView>
  );
}
