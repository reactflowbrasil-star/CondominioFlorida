import { Outlet } from 'react-router-dom';

export default function LoginLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
      <Outlet />
    </div>
  );
}
