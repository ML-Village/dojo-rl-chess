import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setup } from "./dojo/setup.ts";
import { DojoProvider } from "./dojo/DojoContext.tsx";
import { dojoConfig } from "../dojoConfig.ts";
import {
  StarknetConfig,
  voyager,
  jsonRpcProvider,
  Connector,
} from "@starknet-react/core";
import { Chain, sepolia } from "@starknet-react/chains";
import { ControllerOptions } from "@cartridge/controller";
import CartridgeConnector from "@cartridge/connector";
import { shortString } from "starknet";


async function init() {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("React root not found");
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  
  function rpc(_chain: Chain) {
    return {
      nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    };
  }
  const options: ControllerOptions = {
    paymaster: {
      caller: shortString.encodeShortString("ANY_CALLER"),
    },
  };

  // const policies = [
  //   {
  //     target: import.meta.env.VITE_ACTIONS_CONTRACT,
  //     method: "create_game",
  //   },
  //   {
  //     target: import.meta.env.VITE_ACTIONS_CONTRACT,
  //     method: "set_slot",
  //   },
  // ];

  const connectors = [
    new CartridgeConnector([], options) as never as Connector,
  ];

  const setupResult = await setup(dojoConfig);

  !setupResult && <div>Loading....</div>;

  root.render(
    <React.StrictMode>
      <StarknetConfig
          autoConnect
          chains={[sepolia]}
          connectors={connectors}
          explorer={voyager}
          provider={jsonRpcProvider({ rpc })}
        >
        <DojoProvider value={setupResult}>
          <App />
        </DojoProvider>
      </StarknetConfig>
    </React.StrictMode>
  );
}

init();
