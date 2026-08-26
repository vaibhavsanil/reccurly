import React from "react";
import { Text, View } from "react-native";

interface BrandLogoProps {
  size?: "default" | "large";
}

export function BrandLogo({ size = "default" }: BrandLogoProps) {
  const isLarge = size === "large";

  return (
    <View className="items-center">
      <View className="flex-row items-center gap-3.5">
        <View
          style={{
            shadowColor: "#ea7a53",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 3,
          }}
          className={`${
            isLarge ? "size-14 rounded-2xl" : "size-12 rounded-xl"
          } items-center justify-center bg-accent`}
        >
          <Text
            className={`${
              isLarge ? "text-3xl" : "text-2xl"
            } font-sans-extrabold text-white`}
          >
            R
          </Text>
        </View>
        <View>
          <Text
            className={`${
              isLarge ? "text-3xl" : "text-2xl"
            } font-sans-bold tracking-tight text-primary`}
          >
            Recurly
          </Text>
          <Text className="font-sans-bold text-[10px] uppercase tracking-[1.5px] text-muted-foreground">
            SMART BILLING
          </Text>
        </View>
      </View>
    </View>
  );
}

export default BrandLogo;
