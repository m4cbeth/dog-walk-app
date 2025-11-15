import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import CustomerProfile from '@/components/CustomerProfile';
export default async function ProfilePage() {
  const { user } = useAuth(); // Fetches user on the server
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <CustomerProfile />;
}