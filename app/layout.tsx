import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
import { OG_IMAGE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "NoteHub",
  description: "NoteHub is a simple and efficient application for managing personal notes.",
  openGraph: {
    title: "NoteHub",
    description: "NoteHub is a simple and efficient application for managing personal notes.",
    url: SITE_URL,
    images: [OG_IMAGE],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function RootLayout({ children, modal }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body className={roboto.variable}>
        <TanStackProvider>
          <AuthProvider>
            <Header />
            {children}
            {modal}
            <Footer />
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
