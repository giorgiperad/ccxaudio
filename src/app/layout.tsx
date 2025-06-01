export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AudioBooks</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4536a0" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}