import type { Metadata } from "next";
import { Londrina_Solid } from "next/font/google";
import "./globals.css";
import { Provider } from "./_Provider";

const mainFont = Londrina_Solid({
  variable: "--font-londrina-solid",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Candor",
  description: "Unified fair donation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mainFont.variable} antialiased`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
