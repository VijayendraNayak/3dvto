"use client"
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import Background from "./components/Background";
import { Provider } from "react-redux";
import { store } from "../../store";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider store={store}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Background />
          <Navbar />
          {children}
        </body>
      </Provider>
    </html>
  );
}
