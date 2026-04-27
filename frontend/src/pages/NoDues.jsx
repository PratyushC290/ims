import { useState, useEffect } from "react";
import { Search, Package, User, CheckCircle, XCircle, Printer, Loader2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const NoDues = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [student, setStudent] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchStudent = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      const res = await api.get(`/users?search=${encodeURIComponent(searchTerm)}`);
      const users = res.data.users || [];
      
      if (users.length === 0) {
        toast.error("No student found");
        setStudent(null);
        setItems([]);
        return;
      }

      const foundStudent = users.find(u => u.role === "Student") || users[0];
      setStudent(foundStudent);

      const itemsRes = await api.get("/items");
      const allItems = itemsRes.data.items || [];
      const studentItems = allItems.filter(item => 
        item.assignedTo && item.assignedTo._id === foundStudent._id
      );
      setItems(studentItems);
    } catch (error) {
      toast.error("Failed to search student");
    } finally {
      setSearching(false);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  const getPrintStyles = () => (
    <style>{`
      @media print {
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        body { background: white !important; }
        .print-container { 
          padding: 40px; 
          max-width: 800px; 
          margin: 0 auto;
        }
      }
    `}</style>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {getPrintStyles()}
      
      <div className="mb-8 no-print">
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">No Dues Certificate</h1>
        <p className="text-sm text-[var(--theme-text-muted)] mt-1">
          Check if a student has any pending items to return
        </p>
      </div>

      <form onSubmit={searchStudent} className="mb-8 no-print">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            placeholder="Search by Student Name or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[var(--theme-panel)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>
      </form>

      {searching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" />
        </div>
      )}

      {student && !searching && (
        <div className="print-container">
          <div className="bg-[var(--theme-panel)] rounded-3xl border border-[var(--theme-border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--theme-border)] bg-[var(--theme-bg)]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--theme-text)]">{student.fullname}</h2>
                  <p className="text-[var(--theme-text-muted)]">{student.instituteEmail}</p>
                  <p className="text-sm text-[var(--theme-text-muted)]">Role: {student.role}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-500 mb-2">CLEAR - NO DUES</h3>
                  <p className="text-[var(--theme-text-muted)] mb-6">
                    This student has no pending items to return.
                  </p>
                  <button
                    onClick={printCertificate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors no-print"
                  >
                    <Printer className="h-5 w-5" />
                    Print Certificate
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <h3 className="text-xl font-bold text-red-500">
                      {items.length} Item{items.length !== 1 ? 's' : ''} Pending Return
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map(item => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-red-400" />
                          <div>
                            <p className="font-medium text-[var(--theme-text)]">{item.name}</p>
                            <p className="text-sm text-[var(--theme-text-muted)]">{item.identifier}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-4 bg-[var(--theme-bg)] border-t border-[var(--theme-border)] flex items-center justify-between print-only hidden">
              <div className="text-sm text-gray-500">
                Generated on {new Date().toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                IMS - Inventory Management System
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoDues;