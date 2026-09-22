import "./globals.css";
import { GarageProvider } from "../context/garageContext";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "AutoScope",
  description: ""
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <GarageProvider>
          <AppShell>{children}</AppShell>
        </GarageProvider>
      </body>
    </html>
  ); }
