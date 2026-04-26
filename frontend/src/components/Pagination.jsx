import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({ pagination, onPageChange, onLimitChange, loading }) => {
  if (!pagination || !pagination.totalPages) return null;

  const { totalPages = 1, currentPage = 1, totalItems = 0, itemsPerPage = 20 } = pagination;

  if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const handleLimitChange = (newLimit) => {
    if (!loading && onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/50 flex-wrap gap-4 bg-[#141418]/30">
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500">
          Showing{" "}
          <span className="font-medium text-zinc-300">
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
          </span>{" "}
          to{" "}
          <span className="font-medium text-zinc-300">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="font-medium text-zinc-300">{totalItems}</span> results
        </span>

        <select
          value={itemsPerPage}
          onChange={(e) => handleLimitChange(Number(e.target.value))}
          disabled={loading}
          className="text-sm px-3 py-1.5 bg-[#09090b] border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all cursor-pointer hover:border-zinc-700"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all mr-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            disabled={loading}
            className={`min-w-9 h-9 px-3 rounded-lg text-sm font-semibold transition-all disabled:cursor-not-allowed
              ${
                page === currentPage
                  ? "bg-blue-600/90 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                  : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200"
              }
            `}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all ml-2"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages || loading}
          className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;