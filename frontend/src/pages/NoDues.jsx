import { useState, useEffect } from "react";
import { Search, Package, User, CheckCircle, XCircle, Printer, Loader2, RotateCcw, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const NoDues = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [student, setStudent] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [returning, setReturning] = useState(null);
  const [recentlyReturnedItems, setRecentlyReturnedItems] = useState([]);
  const [adminName, setAdminName] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setAllUsers(res.data.users || []);
    } catch (error) {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminName(payload.name || payload.fullname || "Admin");
      }
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, []);

  const filteredUsers = allUsers.filter(u => 
    u.role === "Student" && (
      !searchTerm ||
      u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.instituteEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const selectStudent = async (user) => {
    try {
      setSearching(true);
      setStudent(user);
      setRecentlyReturnedItems([]);
      const issuedRes = await api.get(`/items/user/${user._id}/issued`);
      setItems(issuedRes.data.issuedAssets || []);
      
      try {
        const verRes = await api.get(`/no-dues/verifications?search=${user.instituteEmail}`);
        if (verRes.data.verifications?.length > 0) {
          const latestVerification = verRes.data.verifications[0];
          if (latestVerification.returnedItemsAtVerification?.length > 0) {
            setRecentlyReturnedItems(latestVerification.returnedItemsAtVerification.map(item => ({
              _id: item._id || item.itemId,
              catalogItem: { name: item.itemName },
              identifier: item.identifier,
            })));
          }
        }
      } catch (verError) {
        console.log("No existing verification found");
      }
    } catch (error) {
      toast.error("Failed to load student data");
    } finally {
      setSearching(false);
    }
  };

  const handleReturnAll = async () => {
    if (!confirm(`Return all pending items for ${student.fullname}?`)) return;
    try {
      setReturning("all");
      const res = await api.put(`/items/user/${student._id}/return-all`);
      setRecentlyReturnedItems(res.data.returnedAssets || []);
      toast.success("All items returned successfully");
      const issuedRes = await api.get(`/items/user/${student._id}/issued`);
      setItems(issuedRes.data.issuedAssets || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return items");
    } finally {
      setReturning(null);
    }
  };

  const handleVerifyAndSave = async () => {
    try {
      setReturning("verifying");
      const returnedItems = recentlyReturnedItems.map(item => ({
        itemName: item.catalogItem?.name,
        itemId: item.catalogItem?._id,
        identifier: item.identifier,
      }));
      await api.post("/no-dues/verify", { 
        studentId: student._id,
        returnedItems
      });
      toast.success("Verification saved!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save verification");
    } finally {
      setReturning(null);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="mb-8 no-print">
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">No Dues Certificate</h1>
        <p className="text-sm text-[var(--theme-text-muted)] mt-1">
          Check if a student has any pending items to return
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" />
        </div>
      ) : !student ? (
        <div className="no-print">
          <div className="mb-4">
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
          </div>

          <div className="bg-[var(--theme-panel)] rounded-2xl border border-[var(--theme-border)] overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-[var(--theme-text-muted)]">
                  No students found
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user._id}
                    onClick={() => selectStudent(user)}
                    className="flex items-center gap-4 p-4 border-b border-[var(--theme-border)] last:border-0 hover:bg-[var(--theme-bg)] cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[var(--theme-text)]">{user.fullname}</div>
                      <div className="text-sm text-[var(--theme-text-muted)]">{user.instituteEmail}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : searching ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" />
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              setStudent(null);
              setRecentlyReturnedItems([]);
            }}
            className="flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] mb-4 no-print"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </button>

          {items.length === 0 ? (
            <div className="print-area bg-white p-4">
              <div className="border-2 border-black rounded-lg p-8 md:p-12 max-w-[210mm] mx-auto">
                <div className="text-center border-b-2 border-black pb-6 mb-6">
                  <h2 className="text-2xl font-bold text-black uppercase tracking-wide">
                    Inventory Management System
                  </h2>
                  <h3 className="text-lg font-semibold text-black mt-1">
                    No Dues Certificate
                  </h3>
                </div>

                <div className="mb-8">
                  <p className="text-black text-sm text-right mb-4">
                    Date: {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  
                  <div className="mb-4">
                    <p className="text-black mb-1"><span className="font-semibold">Name:</span> {student.fullname}</p>
                    <p className="text-black mb-1"><span className="font-semibold">Roll Number:</span> {student.studentId || "N/A"}</p>
                    <p className="text-black mb-1"><span className="font-semibold">Institute Email:</span> {student.instituteEmail}</p>
                    <p className="text-black mb-1"><span className="font-semibold">Department:</span> {student.branch || student.role || "N/A"}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-black leading-relaxed text-justify">
                    This is to certify that <span className="font-semibold">{student.fullname}</span> has returned all issued hardware 
                    and has no pending dues towards the department. All items assigned to this student have been properly 
                    accounted for and returned in good condition.
                  </p>
                </div>

                {recentlyReturnedItems.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-black mb-3">Items Returned:</h4>
                    <table className="w-full border-collapse border border-gray-400 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-400 p-2 text-left">S.No</th>
                          <th className="border border-gray-400 p-2 text-left">Item Name</th>
                          <th className="border border-gray-400 p-2 text-left">Serial No./Model No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentlyReturnedItems.map((item, idx) => (
                          <tr key={item._id}>
                            <td className="border border-gray-400 p-2 text-black">{idx + 1}</td>
                            <td className="border border-gray-400 p-2 text-black">{item.catalogItem?.name || "Unknown Item"}</td>
                            <td className="border border-gray-400 p-2 text-black">{item.identifier}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-between pt-8 mt-12">
                  <div className="text-center flex flex-col items-center justify-end">
                    <div className="h-20"></div>
                    <div className="w-48 border-b-2 border-black mb-2"></div>
                    <p className="text-black text-sm font-semibold">Signature of Student</p>
                  </div>
                  <div className="text-center flex flex-col items-center justify-end">
                    <div className="h-20 flex items-end justify-center mb-1 w-full">
                      {adminName && (
                        <div className="relative text-left text-[11px] text-black leading-tight p-1 inline-block font-sans">
                          <svg className="absolute inset-0 m-auto w-12 h-12 text-green-500 opacity-40 -z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <p>Digitally Signed by:</p>
                          <p className="font-semibold text-sm my-0.5">{adminName}</p>
                          <p>Date: {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
                          <p>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                    <div className="w-48 border-b-2 border-black mb-2"></div>
                    <p className="text-black text-sm font-semibold">Verified By</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-300">
                  <p className="text-gray-500 text-xs text-center">
                    IMS - Inventory Management System | Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <h3 className="text-xl font-bold text-red-500">
                    {items.length} Item{items.length !== 1 ? 's' : ''} Pending Return
                  </h3>
                </div>
                <button
                  onClick={handleReturnAll}
                  disabled={returning === "all"}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {returning === "all" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Return All Items
                </button>
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
                        <p className="font-medium text-[var(--theme-text)]">{item.catalogItem?.name || "Unknown Item"}</p>
                        <p className="text-sm text-[var(--theme-text-muted)]">{item.identifier}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 no-print">
              <button
                onClick={printCertificate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                <Printer className="h-5 w-5" />
                Print Certificate
              </button>
              <button
                onClick={handleVerifyAndSave}
                disabled={returning === "verifying"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {returning === "verifying" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                Verify & Save
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoDues;