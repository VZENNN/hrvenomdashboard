import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";

export const metadata = {
  title: "HR Dashboard VENOM",
  description: "Human Resource Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
