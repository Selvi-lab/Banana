
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import SiteChrome from "@/components/SiteChrome";

export const metadata = {
  title: "BANANAFIBRE | Sustainable Living",
  description: "Discover beautiful banana fibre products."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
