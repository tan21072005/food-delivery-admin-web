"use client";

import { useEffect, useMemo, useState } from "react";
import { listUsers } from "@/services/userService";

const roles = ["admin", "customer", "restaurant_owner", "driver"];
const statuses = ["active", "inactive", "banned", "pending_verify"];

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function UserTable() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      setLoading(true);
      const result = await listUsers();

      if (!mounted) {
        return;
      }

      setUsers(result.data);
      setError(result.error);
      setLoading(false);
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.full_name?.toLowerCase().includes(normalizedQuery) ||
        user.email?.toLowerCase().includes(normalizedQuery) ||
        user.phone_number?.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, or phone"
          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
        />
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
        >
          <option value="all">All roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : null}

              {!loading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : null}

              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-4 py-4">
                    <div className="font-medium text-white">{user.full_name}</div>
                    <div className="mt-1 text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{user.phone_number ?? "-"}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{user.status}</td>
                  <td className="px-4 py-4 text-slate-300">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}