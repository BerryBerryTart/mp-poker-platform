enum HandType {
  ROYAL_FLUSH = "ROYAL_FLUSH",
  STRAIGHT_FLUSH = "STRAIGHT_FLUSH",
  FOUR_OF_A_KIND = "FOUR_OF_A_KIND",
  FULL_HOUSE = "FULL_HOUSE",
  FLUSH = "FLUSH",
  STRAIGHT = "STRAIGHT",
  THREE_OF_A_KIND = "THREE_OF_A_KIND",
  TWO_PAIR = "TWO_PAIR",
  ONE_PAIR = "ONE_PAIR",
  HIGH_CARD = "HIGH_CARD",
  NONE = "NONE",
}

enum SocketEvent {
  NEW_CONNECTION = "connection",
  CLIENT_CONNECT = "connect",
  CLIENT_DISCONNECT = "disconnect",
  SEND_GAME_STATE = "send_game_state",
  PLACE_BET = "place_bet",
  CHECK = "player_check",
  FOLD = "player_fold",
  ADMIN_SEND_GAME_STATE = "admin_send_game_state",
  SEND_GAME_CONFIG = "send_game_config",
  ADMIN_START_GAME = "admin_start_game",
  ADMIN_RESET_GAME = "admin_reset_game",
  ADMIN_NEXT_ROUND = "admin_next_round",
  ADMIN_DISCONNECT_USER = "admin_disconnect_user",
  ADMIN_UPDATE_GAME_CONFIG = "admin_update_game_config",
  REFRESH_DATA = "refresh_data",
  ERROR = "error_message",
}

enum GameState {
  PRE_GAME = "PRE_GAME",
  PLAYERS_BETTING = "PLAYERS_BETTING",
  ROUND_END = "ROUND_END",
  GAME_END = "GAME_END",
}

enum PlayerState {
  FOLDED = "FOLDED",
  BETTING = "BETTING",
  CHECKED = "CHECKED",
  SPECTATING = "SPECTATING",
  OUT = "OUT",
}

enum Theme {
  DARK = "DARK",
  LIGHT = "LIGHT",
}

enum PlayerType {
  HUMAN = "HUMAN",
  ROBOT = "ROBOT",
}

enum ActionColour {
  DEFAULT = "#6050DC",
  CHECK = "#FFBF00",
  RAISE = "#80FF00",
  FOLD = "#6CB4EE",
  WINNER = "#FF0800",
}

export {
  HandType,
  SocketEvent,
  GameState,
  PlayerState,
  Theme,
  PlayerType,
  ActionColour,
};
