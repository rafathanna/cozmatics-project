import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Cozmatics | Premium Skin & Body Care",
    template: "%s | Cozmatics",
  },
  description: "Experience the ultimate in skin and body care with Cozmatics. Shop our curated collection of luxury beauty products, skincare, haircare & bodycare in Egypt.",
  keywords: ["cozmatics", "skincare", "bodycare", "haircare", "beauty products", "Egypt", "premium beauty", "organic skincare"],
  authors: [{ name: "Cozmatics" }],
  creator: "Cozmatics",
  metadataBase: new URL("https://cozmatics.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Cozmatics",
    title: "Cozmatics | Premium Skin & Body Care",
    description: "Experience the ultimate in skin and body care with Cozmatics. Shop our curated collection of luxury beauty products.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cozmatics — Premium Beauty Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cozmatics | Premium Skin & Body Care",
    description: "Experience the ultimate in skin and body care with Cozmatics.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a1a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Layout>
                  {children}
                </Layout>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
