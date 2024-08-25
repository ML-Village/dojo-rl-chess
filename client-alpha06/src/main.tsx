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
import { Chain, sepolia,  } from "@starknet-react/chains";
import { ControllerOptions } from "@cartridge/controller";
import CartridgeConnector from "@cartridge/connector";
import { shortString } from "starknet";


async function init() {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("React root not found");
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  
  function rpc(_chain: Chain) {
    return {
      //nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia",
      //nodeUrl: "https://localhost:5050",
      nodeUrl: "https://api.cartridge.gg/x/mlv-rl-chess/katana",
    };
  }
  const options: ControllerOptions = {
    paymaster: {
      caller: shortString.encodeShortString("ANY_CALLER"),
    },
    rpc: "https://api.cartridge.gg/x/mlv-rl-chess/katana",
    //rpc: 'http://localhost:5050',
  };

  const policies = [
    {
      target: "0x02ff688f2ac96d256f3f09c91159cdcc41089de4e59649ff1806a821074eb99f",
      method: "register_player",
    },
  ];

  const connectors = [
    new CartridgeConnector(policies, options) as never as Connector,
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
