/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SUBSCRIPTION_CONTRACT_POLYGON?: string;
  readonly VITE_POLYGON_TESTNET_USDC_ADDRESS?: string;
  readonly VITE_POLYGON_TESTNET_USDT_ADDRESS?: string;
  readonly POLYGON_TESTNET_USDC_ADDRESS?: string;
  readonly POLYGON_TESTNET_USDT_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
