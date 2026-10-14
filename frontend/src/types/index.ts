export type UserRole = 'ADMIN' | 'RESIDENT';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'LOCKED';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  cpf?: string;
  block?: string;
  apartment?: string;
  phone?: string;
  isFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  active: boolean;
  openingTime: string;
  closingTime: string;
  operatingDays: number[];
  reservationDurationMinutes: number;
  advanceBookingDays: number;
  requiresApproval: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  residentId: string;
  resident?: { id: string; fullName: string; block?: string; apartment?: string; role: UserRole };
  areaId: string;
  area?: Area;
  startsAt: string;
  endsAt: string;
  guestCount: number;
  purpose?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  qrCode?: { token: string; expiresAt: string; usedAt?: string };
}

export interface BookingCreate {
  areaId: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginData {
  cpf: string;
  password: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  eventType: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  deliveredAt?: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (cpf: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  updatePassword: (current: string, newPassword: string) => Promise<void>;
}
