import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/providers/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Rubies Unleashed | Indie Games & App Marketplace for Rising Creators",
  description:
    "Discover indie games, apps, and creative digital projects on Rubies Unleashed — a curated marketplace built to showcase rising creators and hidden gems.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}