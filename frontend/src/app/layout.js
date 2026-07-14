import './globals.css';

export const metadata = {
  title: 'InstantNodes',
  description: 'Interactive network lab emulation platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main style={{ margin: 0, padding: 0 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
