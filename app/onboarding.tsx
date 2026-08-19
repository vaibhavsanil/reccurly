import React from 'react';
import { Text } from 'react-native';

import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const Onboarding = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>Onboarding</Text>
    </SafeAreaView>
  );
};

export default Onboarding;
