import { getSyncEntities } from "@dojoengine/state";
import { DojoConfig, DojoProvider } from "@dojoengine/core";
import * as torii from "@dojoengine/torii-client";
import { createClientComponents } from "../createClientComponents";
import { createSystemCalls } from "../createSystemCalls";
import { defineContractComponents } from "./contractComponents";
import { world } from "./world";
import { setupWorld } from "./generated";
import { Account, WeierstrassSignatureType } from "starknet";
import { BurnerManager } from "@dojoengine/create-burner";

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
        toriiUrl: 
            import.meta.env.VITE_DEPLOYMENT == 'slot' ?
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

    // fetch all existing entities from torii

    // create dojo provider
    const dojoProvider = new DojoProvider(config.manifest, config.rpcUrl);

    // setup world
    const client = await setupWorld(dojoProvider);
    
    console.log("rpc url: ", 
        config.rpcUrl
    );
    // create burner manager
    const burnerManager = new BurnerManager({
        masterAccount: new Account(
            {
                nodeUrl: config.rpcUrl,
            },
            import.meta.env.VITE_DEPLOYMENT == 'slot' ?
            import.meta.env.VITE_MASTER_ADDRESS
            :config.masterAddress,

            import.meta.env.VITE_DEPLOYMENT == 'slot' ?
            import.meta.env.VITE_MASTER_PRIVATE_KEY
            :
            config.masterPrivateKey
        ),
        accountClassHash: config.accountClassHash,
        rpcProvider: dojoProvider.provider,
        feeTokenAddress: config.feeTokenAddress,
    });

    if(import.meta.env.VITE_DEPLOYMENT == 'local'){
        try {
            await burnerManager.init();
            if (burnerManager.list().length === 0) {
                await burnerManager.create();
            }
            //console.log("burnerManager.list():", burnerManager.list());
        } catch (e) {
            console.error(e);
        }
    }

    return {
        client,
        clientComponents,
        contractComponents,
        systemCalls: createSystemCalls({ client }, clientComponents, world),
        publish: (typedData: string, signature: WeierstrassSignatureType) => {
            toriiClient.publishMessage(typedData, {
                r: signature.r.toString(),
                s: signature.s.toString(),
            });
        },
        config,
        dojoProvider,
        burnerManager,
        toriiClient,
        // sync,
    };
}
