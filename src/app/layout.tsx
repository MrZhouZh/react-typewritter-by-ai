import './globals.css';
import ThemeProvider from '../components/ThemeProvider';

export const metadata = {
  title: 'TypeWriter Chat',
  description: 'A chat interface with typewriter effect',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-sans antialiased h-full" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
