import { Inter, Edu_NSW_ACT_Cursive } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Script from "next/script";
import { Providers } from './providers';
import ClientLayout from './ClientLayout';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ["latin"] });
const eduCursive = Edu_NSW_ACT_Cursive({
  subsets: ["latin"],
  variable: "--font-edu-cursive",
});

export const metadata: Metadata = {
  title: "Kidpreneur - Young Innovators Platform",
  description: "A platform for young entrepreneurs to share and fund innovative ideas",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Edu+NSW+ACT+Cursive:wght@400..700&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://kit.fontawesome.com/dd02391768.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} ${eduCursive.variable} bg-gray-50`}>
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
