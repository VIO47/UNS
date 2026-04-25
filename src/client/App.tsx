import { AppBar, Toolbar, Box } from "@mui/material";
import { DesignOptionsPage } from "./DesignOptionsPage";
import "./style/App.css";

function App() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <span style={{ color: "white", fontSize: 20 }}>
            Design Comparison
          </span>
        </Toolbar>
      </AppBar>

      <DesignOptionsPage />
    </Box>
  );
}

export default App;
