import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trash2,
} from "lucide-react";

// --- TYPE DEFINITIONS ---
export interface Column<T> {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
}

export interface ColumnFilter<T> {
  id: keyof T;
  label: string;
  options: { value: string | number; label: string }[];
}

interface DataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  columnFilters?: ColumnFilter<T>[];
  emptyText?: string;
  striped?: boolean;
  hoverEffect?: boolean;
  rowHeight?: "sm" | "md" | "lg";
  headerStyle?: "light" | "dark" | "primary";
  onRowClick?: (row: T) => void;
  className?: string;
  initialPageSize?: number;
  // Optional bulk delete handler prop
  onBulkDelete?: (selectedIds: T["id"][]) => void;
}

// --- REUSABLE DATA TABLE COMPONENT ---
export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  columnFilters = [],
  emptyText = "No data available",
  striped = true,
  hoverEffect = true,
  rowHeight = "md",
  headerStyle = "light",
  onRowClick,
  className = "",
  initialPageSize = 10,
  onBulkDelete,
}: DataTableProps<T>) {
  // --- STATE MANAGEMENT ---
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | string;
    direction: "asc" | "desc";
  } | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(
    {}
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialPageSize);

  // --- Selection state ---
  const [selectedRows, setSelectedRows] = React.useState<T["id"][]>([]);

  // --- DATA PROCESSING & FILTERING ---
  const processedData = React.useMemo(() => {
    let filteredData = [...data];
    // 1. Apply Global Text Search
    if (globalFilter) {
      filteredData = filteredData.filter((row) =>
        columns.some((col) =>
          String(row[col.key as keyof T] ?? "")
            .toLowerCase()
            .includes(globalFilter.toLowerCase())
        )
      );
    }
    // 2. Apply all active Dropdown Filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter(
          (row) => String(row[key as keyof T] ?? "") === value
        );
      }
    });
    // 3. Apply Sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        if (aValue === bValue) return 0;
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }
    return filteredData;
  }, [data, globalFilter, filterValues, sortConfig, columns]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  // --- SELECTION HANDLERS ---
  const onSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all visible rows (processedData)
      const allIds = processedData.map((row) => row.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const onSelectRow = (row: T, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, row.id]);
    } else {
      setSelectedRows((prev) => prev.filter((id) => id !== row.id));
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedRows);
    }
    setSelectedRows([]);
  };

  // --- EVENT HANDLERS ---
  const requestSort = (key: keyof T | string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleGlobalFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGlobalFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterValueChange = (id: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [id]: value === "all" ? "" : value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setGlobalFilter("");
    setFilterValues({});
    setCurrentPage(1);
  };

  // --- STYLE HELPERS ---
  const getRowHeightClass = () =>
    ({ sm: "h-10", md: "h-12", lg: "h-14" }[rowHeight] || "h-12");
  const getHeaderStyleClass = () =>
    (
      {
        light: "bg-gray-50 text-gray-700",
        dark: "bg-gray-800 text-white",
        primary: "bg-gray-300 text-white",
      } as const
    )[headerStyle] || "bg-gray-50 text-gray-700";

  // --- RENDER ---
  return (
    <div className={`space-y-4 ${className}`}>
      {/* CONTROLS: SEARCH AND FILTERS */}
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <label
              htmlFor="global-search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom du Partenaire
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="global-search"
                placeholder="Rechercher..."
                value={globalFilter}
                onChange={handleGlobalFilterChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Mapped Dropdown Filters */}
          {columnFilters.map((filter) => (
            <div key={String(filter.id)} className="w-full md:w-auto md:min-w-[180px]">
              <label
                htmlFor={`filter-${String(filter.id)}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {filter.label}
              </label>
              <Select
                value={filterValues[String(filter.id)] || "all"}
                onValueChange={(value) => handleFilterValueChange(String(filter.id), value)}
              >
                <SelectTrigger id={`filter-${String(filter.id)}`} className="w-full">
                  <SelectValue placeholder={`Tout...`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{`Tout ${filter.label
                    .split(" ")[0]
                    .toLowerCase()}`}</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Reset Button - Pushed to the right on desktop */}
          <div className="w-full md:w-auto md:ml-auto pt-0 md:pt-5">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-2 text-gray-700"
            >
              <RotateCw size={14} /> Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className={`${getHeaderStyleClass()} border-b border-gray-200`}>
              {/* Checkbox for select all */}
              <TableCell className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === processedData.length &&
                    processedData.length > 0
                  }
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </TableCell>
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                  style={{ width: col.width }}
                >
                  <div
                    className={`flex items-center ${
                      col.sortable ? "cursor-pointer hover:text-gray-900" : ""
                    } ${
                      col.align === "center"
                        ? "justify-center"
                        : col.align === "right"
                        ? "justify-end"
                        : ""
                    }`}
                    onClick={() => col.sortable && requestSort(col.key)}
                  >
                    {col.header}
                    {col.sortable && (
                      <span className="ml-1">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-16 bg-gray-50">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="bg-gray-200 rounded-full p-3 mb-3">
                      <Search className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-medium">{emptyText}</p>
                    <p className="mt-1 text-sm max-w-md">
                      Try adjusting your search or filter to find what you're looking
                      for
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow
                  key={row.id}
                  className={`${getRowHeightClass()} ${
                    striped ? (i % 2 === 0 ? "bg-white" : "bg-gray-50") : "bg-white"
                  } ${hoverEffect ? "hover:bg-gray-100 transition-colors" : ""} ${
                    onRowClick ? "cursor-pointer" : ""
                  } border-b border-gray-100 last:border-b-0`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  <TableCell className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => onSelectRow(row, e.target.checked)}
                      onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
                    />
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={`px-4 py-3 text-sm font-medium text-gray-800 ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* BULK DELETE BUTTON */}
      {selectedRows.length > 0 && (
        <div className="flex justify-end my-2">
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} /> Supprimer la sélection ({selectedRows.length})
          </Button>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      <div className="flex items-center justify-between text-sm font-medium text-gray-600">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder={String(rowsPerPage)} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          <span>
            Page {totalPages > 0 ? currentPage : 0} of {totalPages}
          </span>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
