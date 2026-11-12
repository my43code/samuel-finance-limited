import "./globals.css";
import "./readability.css";
export const metadata = {
  metadataBase: new URL("https://samuelfinancelimited.com"),
  title: {
    default: "Samuel Finance Limited | A foundation for progress",
    template: "%s | Samuel Finance Limited",
  },
  description:
    "Company information, news, careers and loan application resources from Samuel Finance Limited, Papua New Guinea.",
  icons: { icon: "/assets/logo.png" },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
