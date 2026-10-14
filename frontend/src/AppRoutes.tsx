import { Navigate, Outlet, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginLayout from '@/components/layouts/LoginLayout';
import MainLayout from '@/components/layouts/MainLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import AreasPage from '@/pages/AreasPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import BookingFormPage from '@/pages/BookingFormPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminBookingsPage from '@/pages/AdminBookingsPage';
import AdminMaintenancePage from '@/pages/AdminMaintenancePage';
import AreaDetailPage from '@/pages/AreaDetailPage';
import BookingQrCodePage from '@/pages/BookingQrCodePage';

const RequireAuth = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const RequireAdmin = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginLayout />}>
        <Route index element={<LoginPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/areas" element={<AreasPage />} />
          <Route path="/areas/:id" element={<AreaDetailPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/new/:areaId" element={<BookingFormPage />} />
          <Route path="/bookings/:id/qr-code" element={<BookingQrCodePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route element={<RequireAdmin />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/maintenance" element={<AdminMaintenancePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
