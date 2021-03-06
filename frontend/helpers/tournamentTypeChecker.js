import constants from '../constants/constants';
import { TournamentType } from '../components/types';
import { isToday, isTomorrow } from './date';

import prizeChecker from './prizes/prize-type-checker';

function isStreamTournament(t: TournamentType) {
  return t.settings && t.settings.regularity === constants.REGULARITY_STREAM;
}

function isRma(t: TournamentType) {
  return t.settings && t.settings.tag === 'rma';
}

function hasPrizes(t: TournamentType) {
  return t.Prizes.length;
}

export default {
  isStreamTournament,
  isRegularTournament: (t: TournamentType) => {
    return t.settings && t.settings.regularity === constants.REGULARITY_REGULAR;
  },
  isFreeTournament: (t: TournamentType) => {
    return t.buyIn === 0 && !isStreamTournament(t);
  },
  willRunToday: (t: TournamentType) => {
    return t.startDate && isToday(t.startDate);
  },
  willRunTomorrow: (t: TournamentType) => {
    return t.startDate && isTomorrow(t.startDate);
  },
  isNeedsToHoldTournament: (t) => {
    return t.settings && t.settings.hold;
  },

  isEliteTournament: (t: TournamentType) => {
    return t.buyIn >= 100;
  },
  isCrowdTournament: (t: TournamentType) => {
    return t.goNext[0] >= 20;
  },
  isPrizeTournament: (t: TournamentType) => {
    return hasPrizes(t) && !prizeChecker.isMoneyPrize(t.Prizes[0]);
  },
  isRma,
  isRmaRound: (t: TournamentType, i) => {
    return isRma(t) && t.rounds === i;
  },
  isRmaFinal: (t: TournamentType) => {
    return isRma(t) && t.rounds === 4;
  }
}
