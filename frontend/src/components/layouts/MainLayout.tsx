import { Outlet } from 'react-router-dom';
import Header from '@/components/layouts/Header';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
