import './globals.css'

export const metadata = {
  title: 'ScreenAssist',
  description: 'NBA TV Guide - Which channel is this NBA game on tonight?',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
