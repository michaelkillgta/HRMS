import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'HRMS – Human Resource Management System',
  description: 'R & A Associates HRMS with Face Recognition Attendance',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Sidebar />
        <main className="main">
          {children}
        </main>
      </body>
    </html>
  );
}
