import type {Metadata} from "next"
import {Geist} from "next/font/google"
import "./globals.css"
import {BottomSheetProvider} from "@/components/shell/BottomSheet"
import {ScrollArea} from "@/components/ui/scroll-area";
import {HeaderSlotProvider, HeaderSlotRenderer} from "@/components/shell/HeaderSlot";
import {ToolBarSlotProvider} from "@/components/shell/ToolBarSlot";
import {SearchShortcut} from "@/components/search/SearchSheet";
import {GlobalToolBarButtons} from "@/components/shell/GlobalToolBarButtons";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
    title: "Chiết Tự — Từ điển nguồn gốc chữ Hán",
    description: "Từ điển mở về nguồn gốc và chiết tự chữ Hán. Curated, cộng đồng đóng góp.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" className={`${geist.variable} h-full antialiased overscroll-none`}>
        <body className="app_body h-dvh bg-[#ECEAE6] md:p-2 flex justify-center overscroll-none">
        <div
            className="app_inner min-h-full overscroll-none
        md:rounded-xl w-full md:max-w-[680px] flex flex-col relative bg-[#F8F7F5] overflow-hidden shadow-lg">
            <HeaderSlotProvider>
                <ToolBarSlotProvider>
                    <BottomSheetProvider>
                        <SearchShortcut />
                        <GlobalToolBarButtons />
                        <ScrollArea className="app_scroll" style={{height: '100%'}}>
                            <header className="app_header sticky top-0 left-0 w-full border border-white shadow backdrop-blur bg-white/50 px-4 py-3 z-20">
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
        </body>
        </html>
    )
}
