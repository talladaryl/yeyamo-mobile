import { Redirect } from 'expo-router';

/** Legacy alias retained for deep links; avoids a second fake pre-auth KYC flow. */
export default function RegisterPartnerMultiStepScreen() { return <Redirect href="/(auth)/register" />; }
