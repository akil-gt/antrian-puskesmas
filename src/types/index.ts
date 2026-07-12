export type QueueStatus = 'menunggu' | 'dipanggil' | 'sedang_berobat' | 'selesai' | 'hangus';

export interface User {
  id: string;
  nama: string;
  nik: string;
  alamat: string;
  noHp: string;
  tanggalLahir: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface QueueEntry {
  id: string;
  userId: string;
  nama: string;
  nomor: string;
  status: QueueStatus;
  createdAt: string;
  calledAt: string | null;
  calledExpired: boolean;
}

export interface QueueData {
  date: string;
  counter: number;
  queues: QueueEntry[];
}

export interface AdminData {
  username: string;
  password: string;
}

export interface MonitorResponse {
  date: string;
  totalQueue: number;
  currentNumber: string;
  menunggu: number;
  dipanggil: number;
  sedangBerobat: number;
  selesai: number;
  menungguList: { id: string; nomor: string; nama: string; createdAt: string }[];
  dipanggilList: { id: string; nomor: string; nama: string; calledAt: string | null }[];
  sedangBerobatList: { id: string; nomor: string; nama: string }[];
  selesaiList: { id: string; nomor: string; nama: string }[];
}

export interface LoginResponse {
  message: string;
  token: string;
  user: { id: string; nama: string; username: string };
}

export interface MyQueueResponse {
  queue: QueueEntry | null;
}

export interface TakeQueueResponse {
  message: string;
  queue: QueueEntry;
}

export interface AdminQueuesResponse {
  date: string;
  totalQueue: number;
  all: (QueueEntry & { nik: string; noHp: string })[];
  menunggu: QueueEntry[];
  dipanggil: QueueEntry[];
  sedangBerobat: QueueEntry[];
  selesai: QueueEntry[];
  hangus: QueueEntry[];
}

export interface AdminUsersResponse {
  users: Omit<User, 'password'>[];
}

export interface PatientJwtPayload {
  id: string;
  username: string;
  nama: string;
  role: 'patient';
}

export interface AdminJwtPayload {
  id?: string;
  username: string;
  role: 'admin';
}

export type JwtPayload = PatientJwtPayload | AdminJwtPayload;

export interface AuthContextUser {
  id: string;
  nama: string;
  username: string;
}

export interface AuthContextType {
  user: AuthContextUser | null;
  admin: boolean;
  loading: boolean;
  loginUser: (token: string, userData: AuthContextUser) => void;
  loginAdmin: (token: string) => void;
  logoutUser: () => void;
  logoutAdmin: () => void;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  message: string;
  type: ToastType;
}

export interface StatsData {
  menunggu: number;
  dipanggil: number;
  sedangBerobat: number;
  selesai: number;
}
