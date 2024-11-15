import { APP_CONFIG } from "@/config";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import {
  SdkViewSectionType,
  SdkViewType,
  SdkViewSectionAlignment,
} from "@dynamic-labs/sdk-api";
import { ReactNode } from "react";

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const locale = {
    en: {
      dyn_login: {
        title: {
          all: ``,
        },
      },
    },
  };

  const overrides = {
    views: [
      {
        type: SdkViewType.Login,
        sections: [
          {
            type: SdkViewSectionType.Wallet,
            alignment: SdkViewSectionAlignment.Center,
          },
        ],
      },
      {
        type: SdkViewType.Login,
        sections: [
          {
            type: SdkViewSectionType.Social,
            defaultItem: "google",
            alignment: SdkViewSectionAlignment.Center,
          },
          {
            type: SdkViewSectionType.Separator,
            label: "Or",
          },
          {
            type: SdkViewSectionType.Email,
          },
        ],
      },
    ],
  };

  return (
    <DynamicContextProvider
      settings={{
        environmentId: APP_CONFIG.dynamicEnvironmentId,
        walletConnectors: [EthereumWalletConnectors] as any,
        // overrides: overrides,
      }}
      locale={locale}
    >
      {children}
      {/* <SmartWalletProvider>{children}</SmartWalletProvider> */}
    </DynamicContextProvider>
  );
};

// interface SmartWalletState {
//   nexusClient: any | undefined;
//   signer: JsonRpcSigner | undefined;
//   setNexusClient: (nexusClient: any) => void;
//   setSigner: (signer: JsonRpcSigner) => void;
// }
// export const useSmartWalletStore = create<SmartWalletState>((set) => ({
//   nexusClient: undefined,
//   signer: undefined,
//   setNexusClient: (nexusClient: any) => set({ nexusClient }),
//   setSigner: (signer: JsonRpcSigner) => set({ signer }),
// }));

// const SmartWalletProvider = ({ children }: { children: ReactNode }) => {
//   const { embeddedWallet,  walletAddress, connectedChain } = useWallet();
//   const { setNexusClient, setSigner } = useSmartWalletStore((state) => ({
//     setNexusClient: state.setNexusClient,
//     setSigner: state.setSigner,
//   }));

//   useEffect(() => {
//     console.log('init smart wallet')
//     initSmartWallet();
//   }, [walletAddress, connectedChain?.chainIdNum]);

//   const initSmartWallet = async () => {
//     if (!embeddedWallet || !connectedChain) return;
//     const signer = await getSigner(embeddedWallet);

//     const biconomyConfig =
//       APP_CONFIG.biconomyConfig[
//         connectedChain.chainIdNum as keyof typeof APP_CONFIG.biconomyConfig
//       ];
//     if (!biconomyConfig) return;

//     const viemChain = getChain(connectedChain.chainIdNum);

//     const nexusClient = await createNexusClient({
//       signer,
//       chain: viemChain,
//       transport: http(),
//       bundlerTransport: http(biconomyConfig.bundlerUrl),
//       paymaster: createBicoPaymasterClient({
//         paymasterUrl: biconomyConfig.paymasterUrl,
//       }),
//     });

//     setNexusClient(nexusClient);
//     setSigner(signer);
//   };

//   return <>{children}</>;
// };

/**
 example
 const hash = await nexusClient.sendTransaction({ 
    calls: [ 
        {
            to: '0xf5715961C550FC497832063a98eA34673ad7C816', 
            value: parseEther('0.0001'), 
        },
        {
            to: '0xf5715961C550FC497832063a98eA34673ad7C816',
            value: parseEther('0.0002'), 
        },
    ], 
}); 
const receipt = await nexusClient.waitForTransactionReceipt({ hash }); 
 */
