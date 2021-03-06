var Promise = require('bluebird');
var request = require('../requestSender');

var domain = 'localhost';
console.warn('get host from config file');

var PromisifiedRequest = (url, data, target, host) => (
  new Promise((resolve, reject) => {
    request.sendRequest(url, data, host || domain, target, null, (err, response, body, res) => {
      if (err) throw err;

      resolve(body);
    }, null);
  })
);

module.exports = {
  TS: (url, data) => {
    return PromisifiedRequest(url, data, 'TournamentServer')
  },
  GFS: (url, data) => {
    return PromisifiedRequest(url, data, 'GameFrontendServer')
  },
  frontend: (url, data) => {
    return PromisifiedRequest(url, data, 'site')
  }
};
