import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import { useState, useEffect } from "react";
import type { Option } from "../index/type.ts";

interface CompareDialogProps {
  open: boolean;
  onClose: () => void;
  options: Option[];
  allOptions: Option[];
}

const FIELDS: {
  key: keyof Option;
  label: string;
  format: (v: any) => string;
}[] = [
  {
    key: "area",
    label: "Area",
    format: (v) => (v != null ? `${v} sq m` : "—"),
  },
  {
    key: "cost_estimate",
    label: "Cost estimate",
    format: (v) => (v != null ? `€${v.toLocaleString()}` : "—"),
  },
  {
    key: "embodied_carbon",
    label: "Embodied carbon",
    format: (v) => (v != null ? `${v} kg CO₂e` : "—"),
  },
  {
    key: "daylight_score",
    label: "Daylight score",
    format: (v) => (v != null ? String(v) : "—"),
  },
  { key: "description", label: "Description", format: (v) => v ?? "—" },
];

export default function CompareDialog({
  open,
  onClose,
  options,
  allOptions,
}: CompareDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<(Option | null)[]>(
    () => {
      const opts: (Option | null)[] = options.map((o) => o);
      while (opts.length < 2) opts.push(null);
      return opts;
    },
  );

  useEffect(() => {
    const opts: (Option | null)[] = options.map((o) => o);
    while (opts.length < 2) opts.push(null);
    setSelectedOptions(opts);
  }, [options]);

  const updateSlot = (slot: number, id: number | "") => {
    const next = [...selectedOptions];
    next[slot] =
      id === "" ? null : (allOptions.find((o) => o.id === id) ?? null);
    setSelectedOptions(next);
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      disableRestoreFocus={false}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            Compare design options
          </Typography>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DialogContent sx={{ p: 3 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${selectedOptions.length}, 1fr)`,
            gap: 16,
            marginBottom: 24,
          }}
        >
          {selectedOptions.map((opt, slot) => (
            <FormControl key={slot} fullWidth size="small">
              <InputLabel>Option {String.fromCharCode(65 + slot)}</InputLabel>
              <Select
                value={opt?.id ?? ""}
                label={`Option ${String.fromCharCode(65 + slot)}`}
                onChange={(e) => {
                  const value = e.target.value;
                  updateSlot(slot, value);
                }}
              >
                <MenuItem value="">— select —</MenuItem>
                {allOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${selectedOptions.length}, 1fr)`,
            gap: 16,
            marginBottom: 8,
          }}
        >
          {selectedOptions.map((opt, i) => (
            <Typography key={i} variant="h6" sx={{ fontWeight: 500 }}>
              {opt?.title ?? "—"}
            </Typography>
          ))}
        </div>

        <Divider sx={{ mb: 2 }} />

        {/* Comparison rows */}
        {FIELDS.map(({ key, label, format }) => (
          <div
            key={label}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${selectedOptions.length}, 1fr)`,
              gap: 16,
              marginBottom: 8,
            }}
          >
            {selectedOptions.map((opt, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {format(opt?.[key])}
                </Typography>
              </Paper>
            ))}
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}
