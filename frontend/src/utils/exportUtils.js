import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = (data, filename, sheetName = "Sheet1") => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
};

export const exportAuditLogs = async (api, filename = "audit_logs", filters = {}) => {
  try {
    let url = "/history/global?limit=1000";
    if (filters.fromDate) url += `&fromDate=${filters.fromDate}`;
    if (filters.toDate) url += `&toDate=${filters.toDate}`;
    if (filters.actionFilter && filters.actionFilter !== "All") url += `&action=${filters.actionFilter}`;
    const response = await api.get(url);
    const logs = response.data.logs || [];
    
    const formattedData = logs.map(log => ({
      Action: log.action || "",
      Item: log.item?.name || "Unknown",
      ItemID: log.item?.identifier || "",
      User: log.targetUser?.fullname || "",
      UserEmail: log.targetUser?.instituteEmail || "",
      AuthorizedBy: log.authorizedBy?.fullname || "System",
      Date: log.createdAt ? new Date(log.createdAt).toLocaleString() : "",
      Notes: log.notes || "",
    }));
    
    exportToExcel(formattedData, filename, "Audit Logs");
  } catch (error) {
    throw error;
  }
};

export const exportAllotmentReport = async (api, filename = "allotment_report") => {
  try {
    const [itemsRes, usersRes] = await Promise.all([
      api.get("/items"),
      api.get("/users"),
    ]);
    
    const items = itemsRes.data.items || [];
    const users = usersRes.data.users || [];
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id] = user;
    });
    
    const assignedItems = items.filter(item => item.assignedTo);
    
    const reportData = [];
    assignedItems.forEach(item => {
      const user = userMap[item.assignedTo._id] || item.assignedTo;
      reportData.push({
        Name: user?.fullname || "",
        Email: user?.instituteEmail || "",
        Department: user?.role || "",
        ItemName: item.name,
        ItemID: item.identifier,
        Status: item.status,
        AssignedDate: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "",
      });
    });
    
    exportToExcel(reportData, filename, "Allotment Report");
  } catch (error) {
    throw error;
  }
};

export const exportDepartmentReport = async (api, filename = "department_report") => {
  try {
    const [itemsRes, usersRes] = await Promise.all([
      api.get("/items"),
      api.get("/users"),
    ]);
    
    const items = itemsRes.data.items || [];
    const users = usersRes.data.users || [];
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id] = user;
    });
    
    const assignedItems = items.filter(item => item.assignedTo);
    
    const reportData = assignedItems.map(item => {
      const user = userMap[item.assignedTo._id] || item.assignedTo;
      return {
        Department: user?.role || "Unknown",
        Name: user?.fullname || "",
        Email: user?.instituteEmail || "",
        ItemName: item.name,
        ItemID: item.identifier,
        Status: item.status,
      };
    }).sort((a, b) => a.Department.localeCompare(b.Department));
    
    exportToExcel(reportData, filename, "Department Report");
  } catch (error) {
    throw error;
  }
};

export const importAssignmentsFromExcel = async (file, api) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        const assignments = jsonData.map(row => ({
          email: row.Email || row.email || row.UserEmail || row.userEmail || row.Name || "",
          itemIdentifier: row.ItemID || row.itemID || row["Item ID"] || row.identifier || row.ItemName || "",
        })).filter(row => row.email && row.itemIdentifier);
        
        if (assignments.length === 0) {
          reject(new Error("No valid assignments found in file. Expected columns: Email, ItemID"));
          return;
        }
        
        const results = [];
        
        for (const assignment of assignments) {
          try {
            const userRes = await api.get(`/users?search=${encodeURIComponent(assignment.email)}`);
            const users = userRes.data.users || [];
            const user = users.find(u => u.instituteEmail.toLowerCase() === assignment.email.toLowerCase()) || users[0];
            
            if (!user) {
              results.push({ ...assignment, status: "failed", error: "User not found" });
              continue;
            }
            
            const itemRes = await api.get(`/items?search=${encodeURIComponent(assignment.itemIdentifier)}`);
            const items = itemRes.data.items || [];
            const item = items.find(i => i.identifier.toLowerCase() === assignment.itemIdentifier.toLowerCase()) || items[0];
            
            if (!item) {
              results.push({ ...assignment, status: "failed", error: "Item not found" });
              continue;
            }
            
            if (item.status !== "Available") {
              results.push({ ...assignment, status: "failed", error: "Item not available" });
              continue;
            }
            
            await api.post(`/items/${item._id}/assign`, {
              userId: user._id,
            });
            
            results.push({ ...assignment, status: "success", userId: user._id, itemId: item._id });
          } catch (err) {
            results.push({ ...assignment, status: "failed", error: err.message });
          }
        }
        
        const successCount = results.filter(r => r.status === "success").length;
        const successData = results.filter(r => r.status === "success");
        
        if (successData.length > 0) {
          exportToExcel(successData, `import_results_${new Date().toISOString().split("T")[0]}`, "Import Results");
        }
        
        resolve({ total: assignments.length, success: successCount, failed: assignments.length - successCount, results });
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};