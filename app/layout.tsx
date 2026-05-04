import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { BottomSheetProvider } from "@/components/shell/BottomSheet"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Chiết Tự — Từ điển nguồn gốc chữ Hán",
  description: "Từ điển mở về nguồn gốc và chiết tự chữ Hán. Curated, cộng đồng đóng góp.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full bg-[#F8F7F5] text-[#0F0F0F] overflow-hidden">
        <BottomSheetProvider>
          {children}
        </BottomSheetProvider>
      </body>
    </html>
  )
}
