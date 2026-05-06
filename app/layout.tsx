import type {Metadata, Viewport} from "next"
import {Geist} from "next/font/google"
import "./globals.css"
import {BottomSheetProvider} from "@/components/shell/BottomSheet"
import {ScrollArea} from "@/components/ui/scroll-area";
import {HeaderSlotProvider, HeaderSlotRenderer} from "@/components/shell/HeaderSlot";
import {ToolBarSlotProvider} from "@/components/shell/ToolBarSlot";
import {SearchShortcut} from "@/components/search/SearchSheet";
import {GlobalToolBarButtons} from "@/components/shell/GlobalToolBarButtons";
import {SerwistProvider} from "./serwist";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const APP_NAME = "Chiết Tự";
const APP_DESCRIPTION = "Từ điển mở về nguồn gốc và chiết tự chữ Hán. Curated, cộng đồng đóng góp.";

export const metadata: Metadata = {
    applicationName: APP_NAME,
    title: "Chiết Tự — Từ điển nguồn gốc chữ Hán",
    description: APP_DESCRIPTION,
    icons: { icon: "/icon.png" },
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: APP_NAME,
    },
    formatDetection: { telephone: false },
}

export const viewport: Viewport = {
    themeColor: "#F8F7F5",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" className={`${geist.variable} h-full antialiased overscroll-none`}>
        <body className="app_body h-dvh bg-[#ECEAE6] md:p-2 flex justify-center overscroll-none">
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
        <div
            className="app_inner min-h-full overscroll-none
        md:rounded-xl w-full md:max-w-[680px] flex flex-col relative bg-[#F8F7F5] overflow-hidden shadow-lg">
            <HeaderSlotProvider>
                <ToolBarSlotProvider>
                    <BottomSheetProvider>
                        <SearchShortcut />
                        <GlobalToolBarButtons />
                        <ScrollArea className="app_scroll" style={{height: '100%'}}>
                            <header className="app_header min-h-[60px] sticky top-0 left-0 w-full border border-white shadow backdrop-blur bg-white/50 px-4 py-3 z-20">
                                <HeaderSlotRenderer />
                            </header>

                            <div className="app_content px-4 pt-6 pb-24">
                                {children}
                            </div>
                        </ScrollArea>
                    </BottomSheetProvider>
                </ToolBarSlotProvider>
            </HeaderSlotProvider>
        </div>
        </SerwistProvider>
        </body>
        </html>
    )
}
