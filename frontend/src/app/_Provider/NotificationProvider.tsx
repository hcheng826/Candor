// import { ReactNode, useEffect, useState } from "react";
// import { CONSTANTS, PushAPI } from "@pushprotocol/restapi";
// import { useSmartWalletStore } from "./WalletProvider";
// import { APP_CONFIG } from "@/config";
// import { PushStream } from "@pushprotocol/restapi/src/lib/pushstream/PushStream";

// export const NotificationProvider = ({ children }: { children: ReactNode }) => {
//   const { signer } = useSmartWalletStore((state) => ({
//     signer: state.signer,
//   }));
//   const [stream, setStream] = useState<PushStream | null>(null);

//   // useEffect(() => {
//   //   initPushProtocol();

//   //   return () => {
//   //     stream?.disconnect();
//   //   };
//   // }, [signer]);

//   const initPushProtocol = async () => {
//     const user = await PushAPI.initialize(signer, {
//       env: CONSTANTS.ENV.STAGING,
//     });
//     const inboxNotifications = await user.notification.list("INBOX");
//     const pushChannelAdress = APP_CONFIG.pushChannelAddress;

//     // Subscribe to push channel
//     await user.notification.subscribe(
//       `eip155:11155111:${pushChannelAdress}` // channel address in CAIP format
//     );

//     // To listen to real time notifications
//     const stream = await user.initStream([CONSTANTS.STREAM.NOTIF]);

//     // Set stream event handling
//     stream.on(CONSTANTS.STREAM.NOTIF, (data) => {
//       console.log("Streaming notif: ", data);
//     });

//     // Connect to stream
//     stream.connect();
//     setStream(stream);

//     //     // Send notification, provided userAlice has a channel
//     // const response = await userAlice.channel.send(['*'], {
//     //     notification: {
//     //       title: 'You awesome notification',
//     //       body: 'from your amazing protocol',
//     //     },
//   };

//   return <>{children}</>;
// };
