import { ReactNode } from "react";
import { CardDisplay } from "../CardDisplay/CardDisplay";
import { GameConfigType, SerialisedGame } from "../../utils/types";
import { Typography } from "../antdES";

import "./CommunityCards.less";
import { GameState } from "../../utils/enums";
import { flopSum } from "../../utils/utils";

interface CommunityCardsProps {
  gameState: SerialisedGame | undefined;
  userID?: string;
  gameConfig?: GameConfigType;
}

export const CommunityCards = (props: CommunityCardsProps) => {
  const { gameState, userID, gameConfig } = props;

  const getCurrentPlayerName = () => {
    // game over
    if (
      (gameState?.gameState === GameState.ROUND_END ||
        gameState?.gameState === GameState.GAME_END) &&
      gameState.winnerIDs.length > 0
    ) {
      if (gameState.winnerIDs.length === 1) {
        const u = gameState.players.find(
          (el) => el.userID === gameState.winnerIDs[0]
        );
        return u?.userName + " Won!";
      }
      return "Tie.";
    }

    const currPlayerID = gameState?.playerQueue && gameState?.playerQueue[0];
    if (!currPlayerID) return "";
    if (currPlayerID === userID) return "Your Turn!";
    const currPlayer = gameState.players.find(
      (el) => el.userID === currPlayerID
    );
    if (!currPlayer) return "";
    return currPlayer.userName + "'s Turn";
  };

  const renderCommunityCards = (): ReactNode[] => {
    const flopLen = flopSum(gameConfig?.drawPhases as number[] ?? [])
    const c = gameState?.flop ?? [];
    const components: ReactNode[] = [];

    for (let i = 0; i < flopLen; i++) {
      components.push(
        <CardDisplay key={i.toString()} card={c[i] ? c[i] : ""} gameConfig={gameConfig}/>
      );
    }

    return components;
  };
  return (
    <div id="community-hand-container">
      <Typography.Text>{getCurrentPlayerName()}</Typography.Text>
      <div id="community-cards">{renderCommunityCards()}</div>
      <Typography.Text italic type="secondary">
        Community Cards
      </Typography.Text>
      <br />
      <Typography>Prize Pot: {gameState?.pot ?? 0}</Typography>
    </div>
  );
};
