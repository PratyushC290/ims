/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
  History,
  MonitorSmartphone,
  User,
  Loader2,
  Search,
  ArrowRight,
  Clock,
  X,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Pagination from "../components/Pagination";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .al-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

  @keyframes al-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes al-row-in {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .al-card {
    background: rgba(20,20,24,0.95);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
  }

  .al-header-animate { animation: al-fade-up 0.45s cubic-bezier(.16,1,.3,1) both; }
  .al-card-animate   { animation: al-fade-up 0.5s  cubic-bezier(.16,1,.3,1) 0.08s both; }

  .al-row {
    transition: background 0.15s ease;
    animation: al-row-in 0.35s cubic-bezier(.16,1,.3,1) both;
  }
  .al-row:hover { background: rgba(255,255,255,0.03) !important; }

  .al-th {
    padding: 13px 20px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: #52525b;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    white-space: nowrap;
  }
  .al-td {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
  }

  .dark-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #e4e4e7; font-size: 13px;
    padding: 10px 14px; outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .dark-input::placeholder { color: #52525b; }
  .dark-input:focus {
    background: rgba(255,255,255,0.07);
    border-color: rgba(37,99,235,0.6);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }

  .action-assigned   { background: rgba(37,99,235,0.12);  color: #60a5fa; border: 1px solid rgba(37,99,235,0.2); }
  .action-returned   { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
  .action-maintenance{ background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }
  .action-fixed      { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
  .action-default    { background: rgba(113,113,122,0.12);color: #a1a1aa; border: 1px solid rgba(113,113,122,0.2); }

  .icon-cell {
    height: 34px; width: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
  }
`;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/history/global?page=${page}&limit=20`);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.item?.itemType?.name?.toLowerCase().includes(term) ||
      log.item?.identifier?.toLowerCase().includes(term) ||
      log.targetUser?.fullname?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const actionBadgeCls = (action) => {
    switch (action) {
      case "Assigned": return "action-assigned";
      case "Returned": return "action-returned";
      case "Sent to Maintenance": return "action-maintenance";
      case "Removed from Maintenance": return "action-fixed";
      default: return "action-default";
    }
  };

  const actionDot = (action) => {
    switch (action) {
      case "Assigned": return "#60a5fa";
      case "Returned": return "#34d399";
      case "Sent to Maintenance": return "#fbbf24";
      case "Removed from Maintenance": return "#34d399";
      default: return "#a1a1aa";
    }
  };

  if (loading) {
    return (
      <div className="al-root h-full w-full flex items-center justify-center" style={{ minHeight: 300 }}>
        <style>{css}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ height: 32, width: 32, border: "2.5px solid rgba(96,165,250,0.2)", borderTopColor: "#60a5fa", borderRadius: "50%", animation: "spin 0.85s linear infinite" }} />
          <p style={{ color: "#52525b", fontSize: 13 }}>Loading audit logs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="al-root" style={{ maxWidth: 1280, margin: "0 auto" }}>
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="al-header-animate" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f4f4f5", margin: 0, letterSpacing: "-0.01em" }}>
            Audit Logs
          </h1>
          <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>
            Complete history of all inventory actions.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "7px 13px" }}>
          <ShieldCheck style={{ height: 13, width: 13, color: "#52525b" }} />
          <span style={{ fontSize: 12, color: "#52525b", fontWeight: 500 }}>Tamper-proof record</span>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="al-card al-card-animate">
        {/* Toolbar */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", width: 300 }}>
            <Search style={{ height: 14, width: 14, color: "#52525b", position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search by item, user, or action…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark-input"
              style={{ paddingLeft: 34 }}
            />
          </div>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} style={{ fontSize: 12, color: "#71717a", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <X style={{ height: 12, width: 12 }} /> Clear
            </button>
          )}
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#3f3f46" }}>
            {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Action", "Item", "User", "Authorized By", "Date & Time"].map((h) => (
                  <th key={h} className="al-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "52px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <div style={{ height: 44, width: 44, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <History style={{ height: 20, width: 20, color: "#52525b" }} />
                      </div>
                      <p style={{ color: "#52525b", fontSize: 13 }}>No audit logs found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log._id} className="al-row" style={{ animationDelay: `${idx * 0.03}s` }}>
                    {/* Action */}
                    <td className="al-td">
                      <span
                        className={actionBadgeCls(log.action)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}
                      >
                        <span style={{ height: 6, width: 6, borderRadius: "50%", background: actionDot(log.action), flexShrink: 0 }} />
                        {log.action}
                      </span>
                    </td>
                    {/* Item */}
                    <td className="al-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="icon-cell">
                          <MonitorSmartphone style={{ height: 15, width: 15, color: "#60a5fa" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>{log.item?.itemType?.name || "Unknown"}</div>
                          <div style={{ fontSize: 11, color: "#52525b", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{log.item?.identifier || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    {/* User */}
                    <td className="al-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ height: 28, width: 28, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#71717a", flexShrink: 0 }}>
                          {log.targetUser?.fullname?.charAt(0) || "?"}
                        </div>
                        <span style={{ fontSize: 13, color: "#d4d4d8", fontWeight: 500 }}>{log.targetUser?.fullname || "Unknown"}</span>
                      </div>
                    </td>
                    {/* Authorized by */}
                    <td className="al-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ShieldCheck style={{ height: 13, width: 13, color: "#3f3f46", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#71717a" }}>{log.authorizedBy?.fullname || "System"}</span>
                      </div>
                    </td>
                    {/* Timestamp */}
                    <td className="al-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock style={{ height: 13, width: 13, color: "#3f3f46" }} />
                        <span style={{ fontSize: 12, color: "#52525b", fontFamily: "'JetBrains Mono', monospace" }}>
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Pagination pagination={pagination} onPageChange={setPage} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;