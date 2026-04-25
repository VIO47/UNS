import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  TablePagination,
  Checkbox,
} from "@mui/material";
import SearchField from "./SearchField";
import "../style/Table.css";
import type { Option } from "../index/type.ts";

const COLUMNS = [
  "Title",
  "Area",
  "Cost Estimate",
  "Embodied Carbon",
  "Daylight Score",
];

interface DesignOptionsTableProps {
  data: Option[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  isLoading: boolean;
  error?: any;
  onRowClick?: (row: Option) => void;
  onSelectionChange?: (ids: number[]) => void;
  onSearch?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onDeleteClick?: (id: number) => void;
}

export function DesignOptionsTable({
  data,
  pagination,
  isLoading,
  error,
  onRowClick,
  onSelectionChange,
  onSearch,
  onPageChange,
  onLimitChange,
  onDeleteClick,
}: DesignOptionsTableProps) {
  const [searchInput, setSearchInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => onSearch?.(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const isSelected = (id: number) => selectedIds.includes(id);

  const toggleRow = (id: number) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
    onSelectionChange?.(next);
  };

  const toggleAll = () => {
    const next =
      selectedIds.length === data.length ? [] : data.map((row) => row.id);
    setSelectedIds(next);
    onSelectionChange?.(next);
  };

  const handlePageChange = (_: any, newPage: number) =>
    onPageChange?.(newPage + 1);

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLimitChange?.(parseInt(e.target.value, 10));
    onPageChange?.(1);
  };

  if (isLoading)
    return (
      <div className="table__loading">
        <CircularProgress />
      </div>
    );
  if (error) return <div className="table__error">Error: {error.message}</div>;

  return (
    <div>
      <div className="table__header">
        <SearchField onSearch={(v: string) => setSearchInput(v)} />
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 && selectedIds.length < data.length
                  }
                  checked={
                    data.length > 0 && selectedIds.length === data.length
                  }
                  onChange={toggleAll}
                />
              </TableCell>
              {COLUMNS.map((col) => (
                <TableCell key={col} sx={{ fontWeight: "bold" }}>
                  {col}
                </TableCell>
              ))}
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row) => (
                <TableRow key={row.id} hover sx={{ cursor: "default" }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(row.id)}
                      onChange={() => toggleRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.area ?? "—"}</TableCell>
                  <TableCell>{row.cost_estimate ?? "—"}</TableCell>
                  <TableCell>{row.embodied_carbon ?? "—"}</TableCell>
                  <TableCell>{row.daylight_score ?? "—"}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick?.(row);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick?.(row.id);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={COLUMNS.length + 2} align="center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page - 1}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
        />
      )}
    </div>
  );
}
