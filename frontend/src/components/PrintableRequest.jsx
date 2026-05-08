import React from "react";

const PrintableRequest = ({ request, currentUser }) => {
  if (!request) return null;

  const dateStr = new Date(request.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Try to safely access nested user details since the API may populate it
  // Fall back to currentUser if request.user is just an ID (newly created request) or missing fields
  const isUserPopulated = request.user && typeof request.user === 'object' && request.user.fullname;
  const user = isUserPopulated ? request.user : (currentUser || {});

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto printable-document">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h2 className="text-lg font-bold uppercase tracking-tight mb-1">
          Computer Center, IIT Patna
        </h2>
        <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">
          HARDWARE REQUEST
        </h1>
        <p className="text-sm font-semibold text-gray-600">
          Request ID: {request._id}
        </p>
      </div>

      {/* Requester Details */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 border-b border-gray-200 pb-1">
          Requester Details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold inline-block w-32">Name:</span>
            {user.fullname || "N/A"}
          </div>
          <div>
            <span className="font-semibold inline-block w-32">Email:</span>
            {user.instituteEmail || "N/A"}
          </div>
          <div>
            <span className="font-semibold inline-block w-32">Department:</span>
            {user.branch || "N/A"}
          </div>
          <div>
            <span className="font-semibold inline-block w-32">Date:</span>
            {dateStr}
          </div>
        </div>
      </div>

      {/* Beneficiary Details */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 border-b border-gray-200 pb-1">
          Beneficiary Details
        </h2>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
          <div>
            <span className="font-semibold inline-block w-40">
              {user.role === "Student" ? "STUDENT ID:" : "EMPLOYEE ID:"}
            </span>
            {(user.role === "Student" ? user.studentId : user.employeeId) || "N/A"}
          </div>
          <div>
            <span className="font-semibold inline-block w-40">Name:</span>
            {user.fullname || "N/A"}
          </div>
          <div>
            <span className="font-semibold inline-block w-40">Department:</span>
            {user.branch || "N/A"}
          </div>
          <div>
            <span className="font-semibold inline-block w-40">Location:</span>
            {request.location || "N/A"}
          </div>
          <div>
            <span className="font-semibold inline-block w-40">Mobile:</span>
            {user.phoneNumber || "N/A"}
          </div>
          <div>
            <span className="font-semibold inline-block w-40">Email-ID:</span>
            {user.instituteEmail || "N/A"}
          </div>
          <div>
            <span className="font-semibold inline-block w-40">Alternative Email:</span>
            {user.alternativeEmail || "N/A"}
          </div>
          {user.role === "Student" && (
            <div>
              <span className="font-semibold inline-block w-40">PhD Guide Name:</span>
              {user.phdGuide || "N/A"}
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12 border border-gray-300 rounded overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold w-24">Qty</th>
            </tr>
          </thead>
          <tbody>
            {request.items && request.items.length > 0 ? (
              request.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 last:border-0">
                  <td className="px-4 py-3">{item.itemType}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-4 py-3 text-center text-gray-500">
                  No items listed
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Facilities / Reason */}
      <div className="mb-16">
        <h3 className="font-semibold text-sm mb-1">Reason / Notes:</h3>
        <p className="text-sm text-gray-700 min-h-[3rem]">{request.reason}</p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-y-16 text-sm mt-20">
        <div className="flex flex-col items-start">
          <div className="w-64 border-b border-black mb-2"></div>
          <span className="font-semibold">Beneficiary Signature</span>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-64 border-b border-black mb-2"></div>
          <span className="font-semibold">Requester Signature</span>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-64 border-b border-black mb-2"></div>
          <span className="font-semibold">Department HOD Signature</span>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-64 border-b border-black mb-2"></div>
          <span className="font-semibold">HOD, CC Signature</span>
        </div>
      </div>
    </div>
  );
};

export default PrintableRequest;
