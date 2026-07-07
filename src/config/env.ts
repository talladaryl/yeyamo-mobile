const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.yeyamo.com',
  REVERB_HOST: process.env.EXPO_PUBLIC_REVERB_HOST ?? 'ws.yeyamo.com',
  REVERB_PORT: Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 443),
  REVERB_SCHEME: (process.env.EXPO_PUBLIC_REVERB_SCHEME ?? 'wss') as 'ws' | 'wss',
  USE_MOCKS: process.env.EXPO_PUBLIC_USE_MOCKS !== 'false',
  APP_ENV: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
    | 'development'
    | 'staging'
    | 'production',
};

export default ENV;
