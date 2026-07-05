import './globals.css';

export const metadata = {
  title: 'NetLabX - Advanced Network Emulator',
  description: 'Interactive network lab emulation platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
