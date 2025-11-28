"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface User {
    uid: string;
    name: string;
    email: string;
    isVetted: boolean;
    walksPerWeek: number;
    createdAt: string | null;
}

export default function AdminUsersPage() {
    const { user, getIdToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const token = await getIdToken();
                const response = await fetch("/api/admin/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.status === 403) {
                    setError("You do not have permission to view this page.");
                    return;
                }
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error ?? "Unable to load users.");
                }
                const data = (await response.json()) as { users: User[] };
                setUsers(data.users ?? []);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Unable to load users."
                );
            } finally {
                setLoading(false);
            }
        };

        void loadUsers();
    }, [getIdToken, user]);

    const toggleVetted = async (uid: string, currentStatus: boolean) => {
        setUpdating(uid);
        try {
            const token = await getIdToken();
            const response = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    uid,
                    isVetted: !currentStatus,
                }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? "Unable to update user.");
            }
            setUsers((prev) =>
                prev.map((u) =>
                    u.uid === uid ? { ...u, isVetted: !currentStatus } : u
                )
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to update user."
            );
        } finally {
            setUpdating(null);
        }
    };

    if (!user) {
        return (
            <div className="alert alert-warning">
                <span>Please sign in to view admin users.</span>
            </div>
        );
    }

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

    if (error) {
        return (
            <div className="alert alert-error">
                <span>{error}</span>
            </div>
        );
    }

    const unvettedUsers = users.filter((u) => !u.isVetted);
    const vettedUsers = users.filter((u) => u.isVetted);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold">User Management</h1>
                <p className="text-sm text-base-content/70">
                    Manage user vetting status and subscriptions.
                </p>
            </div>

            {unvettedUsers.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">
                        New Users ({unvettedUsers.length})
                    </h2>
                    <div className="overflow-x-auto rounded-box border border-base-200 bg-base-100 shadow-sm">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Sign Up Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unvettedUsers.map((user) => (
                                    <tr key={user.uid}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td>
                                            <span className="badge badge-warning">Pending</span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => toggleVetted(user.uid, user.isVetted)}
                                                disabled={updating === user.uid}
                                            >
                                                {updating === user.uid
                                                    ? "Updating..."
                                                    : "Approve User"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {vettedUsers.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">
                        Vetted Users ({vettedUsers.length})
                    </h2>
                    <div className="overflow-x-auto rounded-box border border-base-200 bg-base-100 shadow-sm">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Walks/Week</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vettedUsers.map((user) => (
                                    <tr key={user.uid}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.walksPerWeek}</td>
                                        <td>
                                            <span className="badge badge-success">Vetted</span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => toggleVetted(user.uid, user.isVetted)}
                                                disabled={updating === user.uid}
                                            >
                                                {updating === user.uid
                                                    ? "Updating..."
                                                    : "Revoke Access"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {users.length === 0 && (
                <div className="alert">
                    <span>No users found.</span>
                </div>
            )}
        </div>
    );
}
