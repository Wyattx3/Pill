import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text as RNText } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { Colors } from './src/theme';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import SecureSetupScreen from './src/screens/SecureSetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import SafetyCenterScreen from './src/screens/SafetyCenterScreen';
import TalkModeScreen from './src/screens/TalkModeScreen';
import ListenerModeScreen from './src/screens/ListenerModeScreen';
import ListenerVerificationScreen from './src/screens/ListenerVerificationScreen';
import AvatarSelectorScreen from './src/screens/AvatarSelectorScreen';
import ListenerDashboardScreen from './src/screens/ListenerDashboardScreen';
import ActiveCallScreen from './src/screens/ActiveCallScreen';
import IncomingCallScreen from './src/screens/IncomingCallScreen';
import SafetyReportScreen from './src/screens/SafetyReportScreen';
import ReportConfirmationScreen from './src/screens/ReportConfirmationScreen';
import ReflectionScreen from './src/screens/ReflectionScreen';
import PasscodeEntryScreen from './src/screens/PasscodeEntryScreen';
import PasscodeCreateScreen from './src/screens/PasscodeCreateScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import RatingsScreen from './src/screens/RatingsScreen';
import AvailabilityScheduleScreen from './src/screens/AvailabilityScheduleScreen';
import DonationScreen from './src/screens/DonationScreen';
import ResourceDetailScreen from './src/screens/ResourceDetailScreen';
import AccountStatusScreen from './src/screens/AccountStatusScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import PrivacySecurityScreen from './src/screens/PrivacySecurityScreen';
import UpdatePINScreen from './src/screens/UpdatePINScreen';
import FAQScreen from './src/screens/FAQScreen';
import ContactSupportScreen from './src/screens/ContactSupportScreen';
import LiveChatScreen from './src/screens/LiveChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TrustSystemScreen from './src/screens/TrustSystemScreen';
import DonationsOnboardingScreen from './src/screens/DonationsOnboardingScreen';
import DonationsFeedScreen from './src/screens/DonationsFeedScreen';
import DonationPostDetailScreen from './src/screens/DonationPostDetailScreen';
import DonateScreen from './src/screens/DonateScreen';
import DonationHistoryScreen from './src/screens/DonationHistoryScreen';
import CreateFundraiserScreen from './src/screens/CreateFundraiserScreen';
import GiftTiersScreen from './src/screens/GiftTiersScreen';
import VerificationTypeScreen from './src/screens/VerificationTypeScreen';
import IndividualVerificationScreen from './src/screens/IndividualVerificationScreen';
import OrganizationVerificationScreen from './src/screens/OrganizationVerificationScreen';
import OrgDocumentsUploadScreen from './src/screens/OrgDocumentsUploadScreen';
import MyFundraiserScreen from './src/screens/MyFundraiserScreen';

import FundraiserEditScreen from './src/screens/FundraiserEditScreen';
import MyFundraiserAuthScreen from './src/screens/MyFundraiserAuthScreen';
import CommentReplyScreen from './src/screens/CommentReplyScreen';
import PayoutScreen from './src/screens/PayoutScreen';

import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import EditDisplayNameScreen from './src/screens/EditDisplayNameScreen';
import EditEmailScreen from './src/screens/EditEmailScreen';
import EditPhoneScreen from './src/screens/EditPhoneScreen';
import PaymentSetupScreen from './src/screens/PaymentSetupScreen';

const Stack = createNativeStackNavigator();

function ThemedScreen({ Component, ...props }: { Component: React.ComponentType<any> }) {
  const theme = useTheme();
  return <Component {...props} theme={theme} />;
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <StatusBar style="dark" />
      <View style={styles.loadingInner}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <RNText style={[styles.loadingText, { color: Colors.primary }]}>Pill</RNText>
      </View>
    </View>
  );
}

function ThemedApp() {
  const theme = useTheme();
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{
            headerShown: false,
            animation: 'none',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            presentation: 'card',
            navigationBarColor: theme.colors.surface,
          }}
        >
          <Stack.Screen name="PasscodeEntry">
            {(props) => <ThemedScreen {...props} Component={PasscodeEntryScreen} />}
          </Stack.Screen>
          <Stack.Screen name="PasscodeCreate">
            {(props) => <ThemedScreen {...props} Component={PasscodeCreateScreen} />}
          </Stack.Screen>
          <Stack.Screen name="Onboarding">
            {(props) => <ThemedScreen {...props} Component={OnboardingScreen} />}
          </Stack.Screen>
          <Stack.Screen name="SecureSetup">
            {(props) => <ThemedScreen {...props} Component={SecureSetupScreen} />}
          </Stack.Screen>
          <Stack.Screen name="Home">
            {(props) => <ThemedScreen {...props} Component={HomeScreen} />}
          </Stack.Screen>
          <Stack.Screen name="SafetyCenter">
            {(props) => <ThemedScreen {...props} Component={SafetyCenterScreen} />}
          </Stack.Screen>
          <Stack.Screen name="TalkMode">
            {(props) => <ThemedScreen {...props} Component={TalkModeScreen} />}
          </Stack.Screen>
          <Stack.Screen name="ListenerMode">
            {(props) => <ThemedScreen {...props} Component={ListenerModeScreen} />}
          </Stack.Screen>
          <Stack.Screen name="ListenerVerification">
            {(props) => <ThemedScreen {...props} Component={ListenerVerificationScreen} />}
          </Stack.Screen>
          <Stack.Screen name="AvatarSelector">
            {(props) => <ThemedScreen {...props} Component={AvatarSelectorScreen} />}
          </Stack.Screen>
          <Stack.Screen name="ListenerDashboard">
            {(props) => <ThemedScreen {...props} Component={ListenerDashboardScreen} />}
          </Stack.Screen>
          <Stack.Screen name="ActiveCall">
            {(props) => <ThemedScreen {...props} Component={ActiveCallScreen} />}
          </Stack.Screen>
          <Stack.Screen name="IncomingCall">
            {(props) => <ThemedScreen {...props} Component={IncomingCallScreen} />}
          </Stack.Screen>
          <Stack.Screen name="SafetyReport">
            {(props) => <ThemedScreen {...props} Component={SafetyReportScreen} />}
          </Stack.Screen>
          <Stack.Screen name="ReportConfirmation">
            {(props) => <ThemedScreen {...props} Component={ReportConfirmationScreen} />}
          </Stack.Screen>
          <Stack.Screen name="Reflection">
            {(props) => <ThemedScreen {...props} Component={ReflectionScreen} />}
          </Stack.Screen>
          <Stack.Screen name="Settings">
            {(props) => <ThemedScreen {...props} Component={SettingsScreen} />}
          </Stack.Screen>
          <Stack.Screen name="EarningsScreen">
            {(props) => <ThemedScreen {...props} Component={EarningsScreen} />}
          </Stack.Screen>
          <Stack.Screen name="RatingsScreen">
            {(props) => <ThemedScreen {...props} Component={RatingsScreen} />}
          </Stack.Screen>
          <Stack.Screen name="AvailabilitySchedule">
            {(props) => <ThemedScreen {...props} Component={AvailabilityScheduleScreen} />}
          </Stack.Screen>
          <Stack.Screen name="DonationScreen">
            {(props) => <ThemedScreen {...props} Component={DonationScreen} />}
          </Stack.Screen>
          <Stack.Screen name="ResourceDetail">
            {(props) => <ThemedScreen {...props} Component={ResourceDetailScreen} />}
          </Stack.Screen>
          <Stack.Screen name="FAQ">
            {(props) => <ThemedScreen {...props} Component={FAQScreen} />}
          </Stack.Screen>
          <Stack.Screen name="ContactSupport">
            {(props) => <ThemedScreen {...props} Component={ContactSupportScreen} />}
          </Stack.Screen>
          <Stack.Screen name="LiveChat">
            {(props) => <ThemedScreen {...props} Component={LiveChatScreen} />}
          </Stack.Screen>
          <Stack.Screen name="Profile">
            {(props) => <ThemedScreen {...props} Component={ProfileScreen} />}
          </Stack.Screen>
          <Stack.Screen name="AccountStatus">
            {(props) => <ThemedScreen {...props} Component={AccountStatusScreen} />}
          </Stack.Screen>
          <Stack.Screen name="EditProfile">
            {(props) => <ThemedScreen {...props} Component={EditProfileScreen} />}
          </Stack.Screen>
          <Stack.Screen name="PrivacySecurity">
            {(props) => <ThemedScreen {...props} Component={PrivacySecurityScreen} />}
          </Stack.Screen>
          <Stack.Screen name="UpdatePIN">
            {(props) => <ThemedScreen {...props} Component={UpdatePINScreen} />}
          </Stack.Screen>
          <Stack.Screen name="TrustSystem">
            {(props) => <ThemedScreen {...props} Component={TrustSystemScreen} />}
          </Stack.Screen>
          <Stack.Screen name="DonationsOnboarding">
            {(props) => <ThemedScreen {...props} Component={DonationsOnboardingScreen} />}
          </Stack.Screen>
          <Stack.Screen name="DonationsFeed">
            {(props) => <ThemedScreen {...props} Component={DonationsFeedScreen} />}
          </Stack.Screen>
          <Stack.Screen name="DonationPostDetail">
            {(props) => <ThemedScreen {...props} Component={DonationPostDetailScreen} />}
          </Stack.Screen>
          <Stack.Screen name="DonateScreen">
            {(props) => <ThemedScreen {...props} Component={DonateScreen} />}
          </Stack.Screen>
          <Stack.Screen name="DonationHistory">
            {(props) => <ThemedScreen {...props} Component={DonationHistoryScreen} />}
          </Stack.Screen>
          <Stack.Screen name="CreateFundraiser">
            {(props) => <ThemedScreen {...props} Component={CreateFundraiserScreen} />}
          </Stack.Screen>
          <Stack.Screen name="GiftTiers">
            {(props) => <ThemedScreen {...props} Component={GiftTiersScreen} />}
          </Stack.Screen>
          <Stack.Screen name="VerificationType">
            {(props) => <ThemedScreen {...props} Component={VerificationTypeScreen} />}
          </Stack.Screen>
          <Stack.Screen name="IndividualVerification">
            {(props) => <ThemedScreen {...props} Component={IndividualVerificationScreen} />}
          </Stack.Screen>
          <Stack.Screen name="OrganizationVerification">
            {(props) => <ThemedScreen {...props} Component={OrganizationVerificationScreen} />}
          </Stack.Screen>
          <Stack.Screen name="OrgDocumentsUpload">
            {(props) => <ThemedScreen {...props} Component={OrgDocumentsUploadScreen} />}
          </Stack.Screen>
          <Stack.Screen name="MyFundraiserAuth">
            {(props) => <ThemedScreen {...props} Component={MyFundraiserAuthScreen} />}
          </Stack.Screen>
          <Stack.Screen name="CommentReply">
            {(props) => <ThemedScreen {...props} Component={CommentReplyScreen} />}
          </Stack.Screen>
          <Stack.Screen name="Payout">
            {(props) => <ThemedScreen {...props} Component={PayoutScreen} />}
          </Stack.Screen>

          <Stack.Screen name="ProfileSettings">
            {(props) => <ThemedScreen {...props} Component={ProfileSettingsScreen} />}
          </Stack.Screen>
          <Stack.Screen name="EditDisplayName">
            {(props) => <ThemedScreen {...props} Component={EditDisplayNameScreen} />}
          </Stack.Screen>
          <Stack.Screen name="EditEmail">
            {(props) => <ThemedScreen {...props} Component={EditEmailScreen} />}
          </Stack.Screen>
          <Stack.Screen name="EditPhone">
            {(props) => <ThemedScreen {...props} Component={EditPhoneScreen} />}
          </Stack.Screen>
          <Stack.Screen name="PaymentSetup">
            {(props) => <ThemedScreen {...props} Component={PaymentSetupScreen} />}
          </Stack.Screen>
          <Stack.Screen name="MyFundraiser">
            {(props) => <ThemedScreen {...props} Component={MyFundraiserScreen} />}
          </Stack.Screen>
          <Stack.Screen name="FundraiserEdit">
            {(props) => <ThemedScreen {...props} Component={FundraiserEditScreen} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Manrope_400Regular: require('@expo-google-fonts/manrope/400Regular/Manrope_400Regular.ttf'),
          Manrope_700Bold: require('@expo-google-fonts/manrope/700Bold/Manrope_700Bold.ttf'),
          Manrope_800ExtraBold: require('@expo-google-fonts/manrope/800ExtraBold/Manrope_800ExtraBold.ttf'),
          PlusJakartaSans_300Light: require('@expo-google-fonts/plus-jakarta-sans/300Light/PlusJakartaSans_300Light.ttf'),
          PlusJakartaSans_400Regular: require('@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf'),
          PlusJakartaSans_500Medium: require('@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf'),
          PlusJakartaSans_600SemiBold: require('@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf'),
          PlusJakartaSans_700Bold: require('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Font loading error:', e);
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingInner: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
