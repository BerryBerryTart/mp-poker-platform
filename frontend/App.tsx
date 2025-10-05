import "./App.less";
import { GameBoard } from "./GameBoard/GameBoard";
import { BaseProvider } from "./Providers/BaseProvider";

function App() {
  return (
    <BaseProvider>
      <GameBoard />
    </BaseProvider>
  );
}

export default App;
