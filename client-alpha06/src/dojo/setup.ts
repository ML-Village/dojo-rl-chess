import { DojoConfig, DojoProvider } from "@dojoengine/core";
import * as torii from "@dojoengine/torii-client";

import { Account, WeierstrassSignatureType, 
  RpcProvider, ArraySignatureType } from "starknet";


import { createClientComponents } from "./createClientComponents";
import { createSystemCalls } from "./createSystemCalls";
import { defineContractComponents } from "./typescript/models.gen";
import { world } from "./world";
import { setupWorld } from "./typescript/contracts.gen";
//import { Account, ArraySignatureType } from "starknet";
import { BurnerManager } from "@dojoengine/create-burner";
import { getSyncEntities } from "@dojoengine/state";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup({ ...config }: DojoConfig) {
  console.log("toriiUrl:", 
    import.meta.env.VITE_DEPLOYMENT == 'slot' ?
        import.meta.env.VITE_TORII_ADDRESS 
        :
        config.toriiUrl
      );
  // torii client
  const toriiClient = await torii.createClient({
    rpcUrl: config.rpcUrl,
    // check if using wsl2 in windows (if so, use "http://localhost:8080")
    toriiUrl: import.meta.env.VITE_DEPLOYMENT == 'slot' ?
    import.meta.env.VITE_TORII_ADDRESS 
    :
    (((import.meta.env.VITE_DEPLOYMENT == 'local')&&(location.hostname=="localhost"||location.hostname=="127.0.0.1")) ? 
    "http://localhost:8080": config.toriiUrl),
    relayUrl: "",
    worldAddress: config.manifest.world.address || "",
  });

  // create contract components
  const contractComponents = defineContractComponents(world);

  // create client components
  const clientComponents = createClientComponents({ contractComponents });

  // create dojo provider
  const dojoProvider = new DojoProvider(config.manifest, config.rpcUrl);

  const sync = await getSyncEntities(
    toriiClient,
    contractComponents as any,
    []
  );

  // setup world
  const client = await setupWorld(dojoProvider);

  console.log("rpc url: ",
    import.meta.env.VITE_DEPLOYMENT == 'slot' ?
        import.meta.env.VITE_KATANA_ADDRESS 
        :
        config.rpcUrl
  );
  const rpcProvider = new RpcProvider({
    nodeUrl: 
        import.meta.env.VITE_DEPLOYMENT == 'slot' ?
          import.meta.env.VITE_KATANA_ADDRESS 
        :
        config.rpcUrl,
  });


  // create burner manager
  const burnerManager = new BurnerManager({
    masterAccount: new Account(
      // {
      //   nodeUrl: config.rpcUrl,
      // },
      rpcProvider,

      
      import.meta.env.VITE_DEPLOYMENT == 'slot' ?
        import.meta.env.VITE_MASTER_ADDRESS 
        :config.masterAddress,

      import.meta.env.VITE_DEPLOYMENT == 'slot' ?
        import.meta.env.VITE_MASTER_PRIVATE_KEY 
        :config.masterPrivateKey
    ),
    accountClassHash: config.accountClassHash,
    rpcProvider: dojoProvider.provider,
    feeTokenAddress: config.feeTokenAddress,
  });

  await burnerManager.init();

  if (import.meta.env.VITE_DEPLOYMENT == 'local') {
    if (burnerManager.list().length === 0) {
      await burnerManager.create();
    }
  }


  return {
    client,
    clientComponents,
    contractComponents,
    systemCalls: createSystemCalls({ client }, clientComponents, world),
    publish: (typedData: string, signature: ArraySignatureType) => {
      toriiClient.publishMessage(typedData, signature);
    },
    config,
    dojoProvider,
    burnerManager,
    toriiClient,
    sync,
  };
}
