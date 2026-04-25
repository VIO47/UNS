import { useEffect, useState } from "react";
import { trpc } from "../trpc";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";

interface AddOptionOverlayProps {
  open: boolean;
  onClose: () => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function AddOptionOverlay({
  open,
  onClose,
}: AddOptionOverlayProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [costEstimate, setCostEstimate] = useState("");
  const [embodiedCarbon, setEmbodiedCarbon] = useState("");
  const [daylightScore, setDaylightScore] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setArea("");
    setCostEstimate("");
    setEmbodiedCarbon("");
    setDaylightScore("");
  }

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  // utils declared before the mutation that uses it
  const utils = trpc.useUtils();

  const createOption = trpc.createOption.useMutation({
    onSuccess: () => {
      utils.getOptions.invalidate();
      reset();
      onClose();
    },
  });

  const handleCreate = () => {
    if (!title.trim()) return;
    createOption.mutate({
      title,
      description,
      area: area ? parseFloat(area) : undefined,
      cost_estimate: costEstimate ? parseFloat(costEstimate) : undefined,
      embodied_carbon: embodiedCarbon ? parseFloat(embodiedCarbon) : undefined,
      daylight_score: daylightScore ? parseFloat(daylightScore) : undefined,
    });
  };

  return (
    <BootstrapDialog
      maxWidth="sm"
      fullWidth
      open={open}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Create New Design Option
      </DialogTitle>
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
          label="Title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          placeholder="Design option label"
        />
        <TextField
          fullWidth
          label="Area (sq m)"
          type="number"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          margin="normal"
          placeholder="Area in square meters"
        />
        <TextField
          fullWidth
          label="Embodied carbon (kg CO2e)"
          type="number"
          value={embodiedCarbon}
          onChange={(e) => setEmbodiedCarbon(e.target.value)}
          margin="normal"
          placeholder="Embodied carbon in kg CO2e"
        />
        <TextField
          fullWidth
          label="Daylight score"
          type="number"
          value={daylightScore}
          onChange={(e) => setDaylightScore(e.target.value)}
          margin="normal"
          placeholder="Daylight score"
        />
        <TextField
          fullWidth
          label="Cost estimate (€)"
          type="number"
          value={costEstimate}
          onChange={(e) => setCostEstimate(e.target.value)}
          margin="normal"
          placeholder="Cost estimate in Euros"
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          placeholder="Optional description"
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={createOption.isPending}
        >
          Create
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}
