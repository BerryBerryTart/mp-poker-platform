import { ReactNode } from "react";
import { CardDisplay } from "../CardDisplay/CardDisplay";
import { SerialisedGame } from "../../utils/types";
import { Typography } from "../antdES";

import "./CommunityCards.less";
import { GameState } from "../../utils/enums";

interface CommunityCardsProps {
  gameState: SerialisedGame | undefined;
  userID?: string;
}

export const CommunityCards = (props: CommunityCardsProps) => {
  const { gameState, userID } = props;

  const getCurrentPlayerName = () => {
    // game over
    if (
      (gameState?.gameState === GameState.ROUND_END ||
        gameState?.gameState === GameState.GAME_END) &&
      gameState.winnerID
    ) {
      const u = gameState.players.find(
        (el) => el.userID === gameState.winnerID
      );
      return u?.userName + " Won!";
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
    const c = gameState?.flop ?? [];
    const components: ReactNode[] = [];

    for (let i = 0; i < 5; i++) {
      components.push(
        <CardDisplay key={i.toString()} card={c[i] ? c[i] : undefined} />
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
