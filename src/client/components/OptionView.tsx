import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import type { Option } from "../index/type.ts";

interface OptionOverlayProps {
  open: boolean;
  onClose: () => void;
  option: Option;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function OptionOverlay({
  open,
  onClose,
  option,
}: OptionOverlayProps) {
  const {
    title,
    description,
    area,
    cost_estimate,
    embodied_carbon,
    daylight_score,
  } = option;

  return (
    <BootstrapDialog
      maxWidth="sm"
      fullWidth
      open={open}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {title}
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
        <p>
          <b>Area:</b> {area} sq m
        </p>
        <p>
          <b>Cost Estimate:</b> €{cost_estimate}
        </p>
        <p>
          <b>Embodied Carbon:</b> {embodied_carbon} kg CO2e
        </p>
        <p>
          <b>Daylight Score:</b> {daylight_score}
        </p>
        <p>
          <b>Description:</b>{" "}
          {description ? description : "No description available."}
        </p>
      </DialogContent>
      <DialogActions>
        <Button> Edit</Button>
      </DialogActions>
    </BootstrapDialog>
  );
}
