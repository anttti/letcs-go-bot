const _ = require('lodash');
const moment = require('moment');
const logger = require('winston');

const PLAYERS_REQUIRED = process.env.PLAYERS_REQUIRED || 1;
const DEFAULT_TIMEOUT = process.env.DEFAULT_TIMEOUT || 240;
let players = [];

const _removeExpiredPlayers = (playerList) => {
  logger.info('removing expired players...');
  const now = moment();
  return playerList.filter(p => {
    if (!p.timeout || p.timeout.isAfter(now)) {
      return true;
    }
    logger.info(`removing player ${p.username}, timeout ${p.timeout.format('HH:mm')}`);
    return false;
  });
};

const _removePlayer = (playerList, username) => {
  const player = players.find(p => p.username === username);
  if (player) {
    return _.without(playerList, player);
  }
  return playerList;
};

const _upsertPlayer = (playerList, username, timeout) => {
  _removePlayer(playerList, username).push({
    username,
    timeout,
  });
  return playerList;
};

const register = (telegram, { message, timeout = DEFAULT_TIMEOUT }) => {
  const { username } = message.from;
  logger.info(`registering player ${username} with timeout ${timeout}`);
  players = _removeExpiredPlayers(players);

  const timeoutMoment = moment().add(timeout, 'minutes');
  players = _upsertPlayer(players, username, timeoutMoment);

  const msg = `Number of players registered: ${players.length} (including you). ` +
              `Your registration will expire at ${timeoutMoment.format('HH:mm')}`;
  telegram.sendMessage(message.chat.id, msg);

  if (players.length >= PLAYERS_REQUIRED) {
    logger.info(`${PLAYERS_REQUIRED} players registered, notifying and resetting`);
    const usernames = players.map(u => `@${u.username}`).join(', ');
    telegram.sendMessage(message.chat.id, `Letc's go, ${usernames}!`);
    players = [];
  }
};

const unregister = (telegram, { message }) => {
  const { username } = message.from;
  logger.info(`unregistering player ${username}`);
  const player = players.find(p => p.username === username);
  if (player) {
    players = _.without(players, player);
    telegram.sendMessage(message.chat.id, `Removed you from registered players. ${players.length} player${players.length === 1 ? '' : 's'} remain registered.`);
  } else {
    telegram.sendMessage(message.chat.id, `You were not registered in the first place!`);
  }
};

const status = (telegram, { message }) => {
  logger.info('returning status');
  const usernames = players.map(u => `${u.username}`).join(', ');
  if (players.length > 0) {
    telegram.sendMessage(message.chat.id, `${players.length} player${players.length === 1 ? '' : 's'} currently registered: ${usernames}`);
  } else {
    telegram.sendMessage(message.chat.id, 'No players currently registered.');
  }
};

module.exports = {
  register,
  unregister,
  status,
};
