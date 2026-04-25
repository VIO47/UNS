import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { trpc } from "../trpc";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const OPTION_FIELDS = [
  { key: "title", label: "Title" },
  { key: "area", label: "Area" },
  { key: "cost_estimate", label: "Cost estimate" },
  { key: "embodied_carbon", label: "Embodied carbon" },
  { key: "daylight_score", label: "Daylight score" },
  { key: "description", label: "Description" },
] as const;

type OptionFieldKey = (typeof OPTION_FIELDS)[number]["key"];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": { padding: theme.spacing(2) },
  "& .MuiDialogActions-root": { padding: theme.spacing(1) },
}));

interface ManualImportOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function ManualImportOverlay({
  open,
  onClose,
}: ManualImportOverlayProps) {
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [endpointKeys, setEndpointKeys] = useState<string[]>([]);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<
    Partial<Record<OptionFieldKey, string>>
  >({});

  const utils = trpc.useUtils();
  const createOption = trpc.createOption.useMutation({
    onSuccess: () => utils.getOptions.invalidate(),
  });

  function reset() {
    setUrl("");
    setIsFetching(false);
    setError(null);
    setSuccessMsg(null);
    setEndpointKeys([]);
    setFetchedData([]);
    setMapping({});
  }

  function autoMapFields(
    keys: string[],
  ): Partial<Record<OptionFieldKey, string>> {
    const mapping: Partial<Record<OptionFieldKey, string>> = {};
    OPTION_FIELDS.forEach(({ key }) => {
      const match = keys.find(
        (k) =>
          k.toLowerCase() === key ||
          k.toLowerCase().replace(/_/g, "") === key.replace(/_/g, ""),
      );
      if (match) mapping[key] = match;
    });
    return mapping;
  }

  async function handleFetch() {
    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }
    setIsFetching(true);
    setError(null);
    setSuccessMsg(null);
    setEndpointKeys([]);
    setFetchedData([]);
    setMapping({});
    try {
      const res = await fetch(url.trim());
      if (!res.ok)
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      const json = await res.json();
      const arr = Array.isArray(json)
        ? json
        : (json.data ??
          json.results ??
          json.items ??
          Object.values(json).find(Array.isArray));
      if (!arr || !(arr as any[]).length)
        throw new Error("No array of records found in response.");
      const data = arr as any[];
      const keys = Object.keys(data[0]);
      setFetchedData(data);
      setEndpointKeys(keys);
      setMapping(autoMapFields(keys));
      setSuccessMsg(
        `Fetched ${data.length} record${data.length !== 1 ? "s" : ""}.`,
      );
    } catch (e: any) {
      setError(`Could not fetch: ${e.message}`);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleImport() {
    const promises = fetchedData.map((row) => {
      const mapped: any = {};
      (Object.entries(mapping) as [OptionFieldKey, string][]).forEach(
        ([optKey, endKey]) => {
          mapped[optKey] = row[endKey];
        },
      );
      return createOption.mutateAsync(mapped);
    });
    await Promise.all(promises);
    reset();
    onClose();
  }

  const mappedCount = Object.values(mapping).filter(Boolean).length;
  const previewRows = fetchedData.slice(0, 3);
  const mappedFields = OPTION_FIELDS.filter((f) => mapping[f.key]);

  return (
    <BootstrapDialog
      fullWidth
      open={open}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>Import from URL</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers>
        <TextField
          fullWidth
          label="URL"
          placeholder="https://api.example.com/options"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          margin="normal"
          onKeyDown={(e) => e.key === "Enter" && handleFetch()}
        />

        {error && <p style={{ color: "red", margin: "8px 0 0" }}>{error}</p>}
        {successMsg && (
          <p style={{ color: "green", margin: "8px 0 0" }}>{successMsg}</p>
        )}

        {/* Field mapping */}
        {endpointKeys.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13, marginBottom: 8, color: "#666" }}>
              Map fields to design option data
            </p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontWeight: 500,
                    }}
                  >
                    Option field
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontWeight: 500,
                    }}
                  >
                    URL field
                  </th>
                </tr>
              </thead>
              <tbody>
                {OPTION_FIELDS.map(({ key, label }) => (
                  <tr key={key} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: "8px 12px" }}>{label}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <select
                        value={mapping[key] ?? ""}
                        onChange={(e) =>
                          setMapping((prev) => ({
                            ...prev,
                            [key]: e.target.value || undefined,
                          }))
                        }
                        style={{
                          width: "100%",
                          fontSize: 13,
                          padding: "4px 6px",
                        }}
                      >
                        <option value="">— skip —</option>
                        {endpointKeys.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mappedFields.length > 0 && previewRows.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13, marginBottom: 8, color: "#666" }}>
              Preview (first {previewRows.length} of {fetchedData.length} rows)
            </p>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {mappedFields.map(({ key, label }) => (
                      <TableCell key={key} sx={{ fontWeight: 500 }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewRows.map((row, i) => (
                    <TableRow key={i}>
                      {mappedFields.map(({ key }) => (
                        <TableCell key={key}>
                          {mapping[key]
                            ? String(row[mapping[key]!] ?? "—")
                            : "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleFetch} disabled={isFetching}>
          {isFetching ? "Fetching..." : "Fetch"}
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={mappedCount === 0 || createOption.isPending}
        >
          {createOption.isPending
            ? "Importing..."
            : `Import ${fetchedData.length || ""}`}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}
