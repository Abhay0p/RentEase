"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Users, Building2, CalendarCheck, IndianRupee, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  total_users: number;
  active_properties: number;
  total_bookings: number;
  total_revenue: number;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  date_joined: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get("/platform-admin/stats/"),
          api.get("/platform-admin/users/")
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/platform-admin/users/${userId}/`, {
        is_verified: !currentStatus
      });
      setUsers(users.map(u => u.id === userId ? { ...u, is_verified: !currentStatus } : u));
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-foreground mb-2">Platform Administration</h1>
        <p className="text-muted-foreground">Monitor platform health, financials, and manage users.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-card border border-border/40 arch-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-serif text-foreground">₹{stats?.total_revenue?.toLocaleString() || 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-card border border-border/40 arch-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-serif text-foreground">{stats?.total_users || 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-card border border-border/40 arch-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Properties</p>
              <h3 className="text-2xl font-serif text-foreground">{stats?.active_properties || 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-card border border-border/40 arch-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Bookings</p>
              <h3 className="text-2xl font-serif text-foreground">{stats?.total_bookings || 0}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Management Table */}
      <div className="bg-card border border-border/40 rounded-2xl arch-shadow overflow-hidden">
        <div className="p-6 border-b border-border/40 bg-secondary/30">
          <h2 className="text-xl font-serif text-foreground">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-sm uppercase tracking-wider border-b border-border/40">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-medium text-foreground">{u.first_name} {u.last_name}</p>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-foreground">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(u.date_joined).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {u.is_verified ? (
                        <><ShieldCheck className="w-4 h-4 text-green-500" /><span className="text-xs text-green-500 font-medium">Verified</span></>
                      ) : (
                        <><ShieldAlert className="w-4 h-4 text-amber-500" /><span className="text-xs text-amber-500 font-medium">Unverified</span></>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleVerification(u.id, u.is_verified)}
                      className="text-xs font-medium px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                      {u.is_verified ? 'Revoke' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
