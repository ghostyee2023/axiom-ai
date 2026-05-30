import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "决策回响 · AI决策力大富翁沙盘",
  description: "用与AI的深度对话，在模拟场景中反复练习结构化对话能力，获得即时反馈。",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .glass-card {
                backdrop-filter: blur(16px) !important;
                -webkit-backdrop-filter: blur(16px) !important;
              }
              .glass-card-light {
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
              }
            `,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
