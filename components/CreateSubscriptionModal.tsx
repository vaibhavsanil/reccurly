import { icons } from "@/constants/icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Frequency = "Monthly" | "Yearly";

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#ffccd5",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#c7d2fe",
  Music: "#fed7aa",
  Other: "#e2e8f0",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateSubscription?: (subscription: Subscription) => void;
  onCreate?: (subscription: Subscription) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreateSubscription,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Entertainment");

  const parsedPrice = parseFloat(price);
  const isPriceValid = !isNaN(parsedPrice) && parsedPrice > 0;
  const isNameValid = name.trim().length > 0;
  const isValid = isNameValid && isPriceValid;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) return;

    const startDate = dayjs().toISOString();
    const renewalDate = dayjs()
      .add(1, frequency === "Yearly" ? "year" : "month")
      .toISOString();

    const newSubscription: Subscription = {
      id: `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate,
      renewalDate,
      icon: icons.wallet,
      billing: frequency,
      color: CATEGORY_COLORS[category] || "#e2e8f0",
      currency: "USD",
    };

    if (onCreateSubscription) {
      onCreateSubscription(newSubscription);
    } else if (onCreate) {
      onCreate(newSubscription);
    }

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="modal-overlay justify-end">
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View className="modal-container">
                {/* Header */}
                <View className="modal-header">
                  <Text className="modal-title">New Subscription</Text>
                  <Pressable
                    onPress={handleClose}
                    className="modal-close"
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                  >
                    <Text className="modal-close-text">✕</Text>
                  </Pressable>
                </View>

                {/* Form Body */}
                <ScrollView
                  contentContainerStyle={{ padding: 20, gap: 20 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Name Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Name</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="e.g. Netflix, Spotify, AWS"
                      placeholderTextColor="rgba(8, 17, 38, 0.4)"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Price Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Price</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="0.00"
                      placeholderTextColor="rgba(8, 17, 38, 0.4)"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  {/* Frequency Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Frequency</Text>
                    <View className="picker-row">
                      <Pressable
                        onPress={() => setFrequency("Monthly")}
                        className={clsx(
                          "picker-option",
                          frequency === "Monthly" && "picker-option-active"
                        )}
                        accessibilityRole="button"
                        accessibilityState={{ selected: frequency === "Monthly" }}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            frequency === "Monthly" && "picker-option-text-active"
                          )}
                        >
                          Monthly
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setFrequency("Yearly")}
                        className={clsx(
                          "picker-option",
                          frequency === "Yearly" && "picker-option-active"
                        )}
                        accessibilityRole="button"
                        accessibilityState={{ selected: frequency === "Yearly" }}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            frequency === "Yearly" && "picker-option-text-active"
                          )}
                        >
                          Yearly
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Category Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Category</Text>
                    <View className="category-scroll">
                      {CATEGORIES.map((cat) => {
                        const isSelected = category === cat;
                        return (
                          <Pressable
                            key={cat}
                            onPress={() => setCategory(cat)}
                            className={clsx(
                              "category-chip",
                              isSelected && "category-chip-active"
                            )}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                          >
                            <Text
                              className={clsx(
                                "category-chip-text",
                                isSelected && "category-chip-text-active"
                              )}
                            >
                              {cat}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Submit Button */}
                  <Pressable
                    onPress={handleSubmit}
                    disabled={!isValid}
                    className={clsx(
                      "auth-button",
                      !isValid && "auth-button-disabled"
                    )}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !isValid }}
                  >
                    <Text className="auth-button-text">Add Subscription</Text>
                  </Pressable>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
