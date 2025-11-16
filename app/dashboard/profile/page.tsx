"use client";

import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import CustomerProfile from '@/components/CustomerProfile';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-6 w-full" />
        <div className="skeleton h-6 w-full" />
        <div className="skeleton h-6 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        <span>Please sign in to access your profile.</span>
      </div>
    );
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <CustomerProfile />;
}