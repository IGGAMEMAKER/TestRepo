var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('Leagues');
});

router.get('/Calendar', function (req, res) {
  res.render('LeagueCalendar');
});

module.exports = router;