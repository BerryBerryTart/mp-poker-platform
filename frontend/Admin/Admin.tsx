import { useContext, useEffect } from "react";
import { AdminContext, AdminContextType } from "../Providers/AdminProvider";

import "./Admin.less";
import { Button, Space, Typography } from "../antdES";

export const Admin = () => {
  const adminContext = useContext(AdminContext) as AdminContextType;
  const { adminGameState, gameConfig } = adminContext.state;
  const { adminConnect, startGame, resetGame } = adminContext.actions;

  useEffect(() => {
    adminConnect();
  }, []);

  useEffect(() => {
    console.log(adminGameState);
  }, [adminGameState]);

  const handleStartGame = () => {
    console.log("STARTING GAME");
    startGame();
  };

  const reset = () => {
    console.log("RESET GAME");
    resetGame();
  };

  return (
    <div id="admin-container">
      <div id="info">
        <Typography>
          Tie Breaker Enabled: {gameConfig?.enableTieBreaker?.toString() ?? "?"}
        </Typography>
        <Typography>
          Initial Hand Amount: {gameConfig?.intialHandAmt ?? "?"}
        </Typography>
        <Typography>Minimum Buy In: {gameConfig?.minBuyIn ?? "?"}</Typography>
        <Button>CONFIG GAME</Button>
      </div>
      <Space>
        <Button onClick={handleStartGame}>START GAME</Button>
        <Button onClick={reset}>RESET GAME</Button>
      </Space>
    </div>
  );
};
