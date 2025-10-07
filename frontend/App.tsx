import { BrowserRouter, Route, Routes } from "react-router";
import "./App.less";
import { GameBoard } from "./GameBoard/GameBoard";
import { BaseProvider } from "./Providers/BaseProvider";
import { Admin } from "./Admin/Admin";

function App() {
  return (
    <BaseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameBoard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </BaseProvider>
  );
}

export default App;
