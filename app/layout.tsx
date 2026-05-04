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
      <body className="h-full bg-[#ECEAE6] text-[#0F0F0F]">
        <div className="min-h-dvh flex justify-center">
          <div className="w-full max-w-[600px] h-dvh flex flex-col relative bg-[#F8F7F5] overflow-hidden">
            <BottomSheetProvider>
              {children}
            </BottomSheetProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
