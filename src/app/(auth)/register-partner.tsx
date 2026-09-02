import { Redirect } from 'expo-router';

/** Partner creation is authenticated by the backend; registration first creates a user. */
export default function RegisterPartnerScreen() { return <Redirect href="/(auth)/register" />; }
