import React from 'react';
import { Inter } from 'next/font/google';
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Providers } from './providers';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ["latin"] });

/** @type {import('next').Metadata} */
export const metadata = {
  title: "Kidpreneur - Young Innovators Platform",
  description: "A platform for young entrepreneurs to share and fund innovative ideas",
  icons: {
    icon: '/favicon.ico',
  },
};

// Viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f59e0b',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin={"anonymous"}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Edu+NSW+ACT+Cursive:wght@400..700&display=swap"
          rel="stylesheet"
        ></link>
        <script
          src="https://kit.fontawesome.com/dd02391768.js"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </Providers>
      </body>
    </html>
  );
}