import { ChevronLeft, ChevronRight } from "lucide-react";
import Select from "./Select";
import Button from "./Button";

export default function Pagination({ 
  pagination,
  page: propPage, 
  pageSize: propPageSize, 
  total: propTotal, 
  totalItems: propTotalItems,
  onPageChange, 
  onLimitChange,
  onPageSizeChange,
  itemName = "records",
  disabled = false,
}) {
  const page = pagination?.page ?? propPage ?? 1;
  const limit = pagination?.limit ?? propPageSize ?? 10;
  const total = pagination?.total ?? propTotalItems ?? propTotal ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const handleLimitChange = (val) => {
    const num = Number(val);
    onLimitChange?.(num);
    onPageSizeChange?.(num);
  };

  return (
    <div className="flex-none flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-theme bg-surface">
      <p className="text-xs sm:text-sm text-secondary">
        Showing <span className="font-semibold text-theme">{startItem}</span>–<span className="font-semibold text-theme">{endItem}</span> of <span className="font-semibold text-theme">{total}</span> {itemName}
      </p>
      
      <div className="flex items-center gap-3">
        {(onLimitChange || onPageSizeChange) && (
          <Select 
            value={String(limit)} 
            onChange={handleLimitChange} 
            options={[
              { value: "10", label: "10 / page" },
              { value: "20", label: "20 / page" },
              { value: "50", label: "50 / page" },
            ]} 
            className="w-28 sm:w-32"
          />
        )}
        
        <div className="flex items-center gap-1">
          <Button 
            variant="secondary" 
            size="sm" 
            disabled={disabled || page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            className="px-2"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <span className="px-2.5 py-1 text-xs sm:text-sm text-theme font-medium whitespace-nowrap">
            Page {page} of {totalPages}
          </span>
          
          <Button 
            variant="secondary" 
            size="sm" 
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
            className="px-2"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
