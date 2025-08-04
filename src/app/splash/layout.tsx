import { Geist } from "next/font/google";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function SplashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geistSans.variable} w-full h-full`}>
      {children}
      <Toaster closeButton position="top-right" richColors />
    </div>
  );
}
