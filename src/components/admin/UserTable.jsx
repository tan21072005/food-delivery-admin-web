"use client";

import { useEffect, useState } from "react";
import { PaginationControls } from "@/components/PaginationControls";
import { TableEmptyStateRow, TableSkeletonRows } from "@/components/TableStateRows";
import { USER_STATUSES, listUsers, updateUserStatus } from "@/services/userService";

const roles = ["admin", "customer", "restaurant_owner", "driver"];

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      setLoading(true);
      const result = await listUsers({ page, query, role: roleFilter, status: statusFilter });

      if (!mounted) {
        return;
      }

      setUsers(result.data);
      if (selectedUser && !result.data.some((user) => user.id === selectedUser.id)) {
        setSelectedUser(null);
      }
      setPageSize(result.pageSize);
      setTotal(result.count);
      setError(result.error);
      setLoading(false);
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [page, query, roleFilter, selectedUser, statusFilter]);

  function updateQuery(value) {
    setQuery(value);
    setPage(1);
  }

  function updateRoleFilter(value) {
    setRoleFilter(value);
    setPage(1);
  }

  function updateStatusFilter(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function selectUser(user) {
    setSelectedUser(user);
    setSelectedStatus(user.status);
    setNotice(null);
  }

  async function handleStatusSubmit(event) {
    event.preventDefault();

    if (!selectedUser || selectedUser.status === selectedStatus) {
      return;
    }

    if (!window.confirm(`Change ${selectedUser.email} status to ${selectedStatus}?`)) {
      return;
    }

    setSaving(true);
    const result = await updateUserStatus(selectedUser.id, selectedStatus);
    setSaving(false);

    if (result.error) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    setUsers((current) => current.map((user) => (user.id === result.data.id ? result.data : user)));
    setSelectedUser(result.data);
    setSelectedStatus(result.data.status);
    setNotice({ type: "success", message: "User status updated." });
  }

  return (
    <div className="space-y-5">
      {notice ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
              : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
        <input
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search name, email, or phone"
          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
        />
        <select
          value={roleFilter}
          onChange={(event) => updateRoleFilter(event.target.value)}
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
          onChange={(event) => updateStatusFilter(event.target.value)}
          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
        >
          <option value="all">All statuses</option>
          {USER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
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
                  <TableSkeletonRows columns={5} />
                ) : null}

                {!loading && users.length === 0 ? (
                  <TableEmptyStateRow
                    colSpan={5}
                    title="No users found"
                    description="Try a different search, role, or status filter."
                  />
                ) : null}

                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={`cursor-pointer transition hover:bg-white/[0.03] ${
                      selectedUser?.id === user.id ? "bg-emerald-400/10" : ""
                    }`}
                  >
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
          <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={setPage} disabled={loading} />
        </div>

        <form onSubmit={handleStatusSubmit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-base font-semibold text-white">
            {selectedUser ? "User status" : "Select a user"}
          </h2>
          {selectedUser ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-medium text-white">{selectedUser.full_name}</p>
                <p className="mt-1 text-sm text-slate-400">{selectedUser.email}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{selectedUser.role}</p>
              </div>
              <label className="block text-sm text-slate-300">
                Status
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
                >
                  {USER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Select a row to review or update account status.</p>
          )}

          <button
            type="submit"
            disabled={!selectedUser || selectedUser.status === selectedStatus || saving}
            className="mt-5 w-full rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {saving ? "Saving..." : "Save status"}
          </button>
        </form>
      </div>
    </div>
  );
}
