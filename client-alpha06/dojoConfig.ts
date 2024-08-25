import manifest from "../rl_chess_contracts/manifests/dev/deployment/manifest.json";

import { createDojoConfig } from "@dojoengine/core";

export const dojoConfig = createDojoConfig({
  manifest,
  rpcUrl: import.meta.env.VITE_KATANA_ADDRESS,
  toriiUrl: import.meta.env.VITE_TORII_ADDRESS,
  masterAddress: import.meta.env.VITE_MASTER_ADDRESS,
  masterPrivateKey: import.meta.env.VITE_MASTER_PRIVATE_KEY,
  
});
