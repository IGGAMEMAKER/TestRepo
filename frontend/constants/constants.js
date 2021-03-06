const constants = {
  NOTIFICATION_GIVE_ACCELERATOR: 1,
  NOTIFICATION_GIVE_MONEY: 2,
  NOTIFICATION_ACCEPT_MONEY: 3, // give money to a user if he clicks on button

  NOTIFICATION_MARATHON_PRIZE: 4,
  NOTIFICATION_FORCE_PLAYING: 5,
  NOTIFICATION_CUSTOM: 6,
  NOTIFICATION_UPDATE: 7,

  NOTIFICATION_FIRST_MESSAGE: 8,
  NOTIFICATION_MARATHON_CURRENT: 9,

  NOTIFICATION_AUTOREG: 10,
  NOTIFICATION_JOIN_VK: 11,

  NOTIFICATION_WIN_MONEY: 12,
  NOTIFICATION_LOSE_TOURNAMENT: 13,

  NOTIFICATION_ADVICE: 14,
  NOTIFICATION_CARD_GIVEN: 15,
  NOTIFICATION_GIVE_PACK: 16,

  NOTIFICATION_TOURNAMENT_START: 17,

  RARITY_RARE: 0,
  RARITY_LOW: 1,
  RARITY_MID: 2,
  RARITY_HIGH: 3,


  PRIZE_TYPE_MONEY: 1,
  PRIZE_TYPE_GIFT: 2,
  PRIZE_TYPE_POINTS: 3,
  PRIZE_TYPE_TICKETS: 4,
  PRIZE_TYPE_CUSTOM: 5,

  // CARD_COLOUR_RED: 1,
  // CARD_COLOUR_BLUE: 2,
  // CARD_COLOUR_GREEN: 3,
  // CARD_COLOUR_GRAY: 4,
  CARD_COLOUR_RED: 0,
  CARD_COLOUR_BLUE: 1,
  CARD_COLOUR_GREEN: 2,
  CARD_COLOUR_GRAY: 3,

  PAYMENT_TOURNAMENT: 0,
  PAYMENT_ACCELERATOR: 1,
  PAYMENT_FULLFILL: 2,
  PAYMENT_PACK: 3,

  UPDATE_TOURNAMENTS: 'UPDATE_TOURNAMENTS',

  ACTION_INITIALIZE: 'ACTION_INITIALIZE',
  ACTION_REGISTER_IN_TOURNAMENT: 'ACTION_REGISTER_IN_TOURNAMENT',
  ACTION_UNREGISTER_FROM_TOURNAMENT: 'ACTION_UNREGISTER_FROM_TOURNAMENT',
  ACTION_TEST: 'ACTION_TEST',
  ACTION_START_TOURNAMENT: 'ACTION_START_TOURNAMENT',
  ACTION_FINISH_TOURNAMENT: 'ACTION_FINISH_TOURNAMENT',
  ACTION_LOAD_NEWS: 'ACTION_LOAD_NEWS',
  ACTION_ADD_MESSAGE: 'ACTION_ADD_MESSAGE', // notification or pay modals
  ACTION_ADD_CHAT_MESSAGE: 'ACTION_ADD_CHAT_MESSAGE',
  ACTION_SET_MESSAGES: 'ACTION_SET_MESSAGES',
  ACTION_SET_SUPPORT_MESSAGES: 'ACTION_SET_SUPPORT_MESSAGES',
  SET_TOURNAMENT_DATA: 'SET_TOURNAMENT_DATA',
  CLEAR_TOURNAMENT_DATA: 'CLEAR_TOURNAMENT_DATA',

  ACTION_ADD_NOTIFICATION: 'ACTION_ADD_NOTIFICATION',

  MODAL_NO_PACK_MONEY: 'MODAL_NO_PACK_MONEY',
  MODAL_NO_TOURNAMENT_MONEY: 'MODAL_NO_TOURNAMENT_MONEY',

  TREG_NO_MONEY: 'TREG_NO_MONEY',
  TREG_FULL: 'TREG_FULL',
  TREG_ALREADY: 'Registered',

  TOURNAMENT_FILTER_FREE: 1,
  TOURNAMENT_FILTER_CROWD: 2,
  TOURNAMENT_FILTER_ELITE: 3,

  REGULARITY_NONE : 0,
  REGULARITY_REGULAR : 1,
  REGULARITY_STREAM : 2,

  GET_GIFTS: 'GET_GIFTS',
  GET_PACKS: 'GET_PACKS',

};

module.exports = constants;
