import { memo, useEffect, useState } from "react";
import { TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "../style/Table.css";

const SearchField = memo(({ onSearch }: { onSearch: (v: string) => void }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <TextField
      placeholder="Search options..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      variant="outlined"
      size="small"
      slotProps={{
        input: {
          startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
        },
      }}
      className="table__header__search-field"
    />
  );
});

export default SearchField;
