import { useState } from "react";
import { trpc } from "./trpc";
import { DesignOptionsTable } from "./components/DesignOptionsTable.tsx";
import AddOptionOverlay from "./components/AddOptionOverlay.tsx";
import OptionView from "./components/OptionView.tsx";
import ManualImportOverlay from "./components/ManualImportOverlay.tsx";
import Button from "@mui/material/Button";
import type { Option } from "./index/type.ts";
import "./style/DesignOptionsPage.css";
import CompareDialog from "./components/CompareDialog.tsx";

export function DesignOptionsPage() {
  const [addOverlayOpen, setAddOverlayOpen] = useState<boolean>(false);
  const [viewOverlayOpen, setViewOverlayOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [importOverlayOpen, setImportOverlayOpen] = useState<boolean>(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = trpc.getOptions.useQuery({
    page,
    limit,
    search: search || undefined,
  });

  const utils = trpc.useUtils();
  const deleteOption = trpc.deleteOption.useMutation({
    onSuccess: () => utils.getOptions.invalidate(),
  });

  const compareOptions = (data?.data ?? []).filter((o) =>
    selectedIds.includes(o.id),
  );

  function openViewOverlay(option: Option) {
    setSelectedOption(option);
    setViewOverlayOpen(true);
  }

  return (
    <div>
      <h1>Design Options</h1>

      <div className="actions">
        <Button
          variant="contained"
          disabled={selectedIds.length < 0}
          onClick={() => setCompareDialogOpen(true)}
        >
          Compare {selectedIds.length >= 2 ? `(${selectedIds.length})` : ""}
        </Button>
        <Button variant="contained" onClick={() => setImportOverlayOpen(true)}>
          Import
        </Button>
        <Button variant="outlined" onClick={() => setAddOverlayOpen(true)}>
          Manually Add Design Option
        </Button>
      </div>

      <DesignOptionsTable
        data={data?.data ?? []}
        pagination={data?.pagination}
        isLoading={isLoading}
        error={error}
        onRowClick={openViewOverlay}
        onSelectionChange={setSelectedIds}
        onSearch={setSearch}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onDeleteClick={(id: number) => deleteOption.mutate(id)}
      />

      <AddOptionOverlay
        open={addOverlayOpen}
        onClose={() => setAddOverlayOpen(false)}
      />
      {selectedOption && (
        <OptionView
          open={viewOverlayOpen}
          onClose={() => setViewOverlayOpen(false)}
          option={selectedOption}
        />
      )}
      <ManualImportOverlay
        open={importOverlayOpen}
        onClose={() => setImportOverlayOpen(false)}
      />
      <CompareDialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        options={compareOptions}
        allOptions={data?.data ?? []}
      />
    </div>
  );
}
