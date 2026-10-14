import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-semibold text-gray-900">Condomínio Flórida</Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.fullName}</span>
            <button onClick={logout} className="text-sm text-gray-700 hover:text-gray-900">Sair</button>
          </div>
        </div>
      </div>
    </header>
  );
}
