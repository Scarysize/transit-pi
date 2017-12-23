const Database = require('better-sqlite3');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const {formatSeconds} = require('./src/time');

function flatten(acc = [], items = []) {
  return [...acc, ...items];
}

function sortByTime(a, b) {
  return a.time - b.time;
}

function formatByQuery(query) {
  return trip => ({
    type: query.type,
    route: query.route,
    stop: query.stop,
    time: trip.nextTime
  });
}

const app = express();

app.use(bodyParser.json());
app.use(require('cors')());

const dbFile = path.resolve(__dirname, 'gtfs.db');
const db = new Database(dbFile, {fileMustExist: true});
const getTrips = require('./src/get-trips')(db);

app.post('/trips', (request, response) => {
  const queries = request.body;
  const trips = queries
    .map(query => getTrips(query).map(formatByQuery(query)))
    .reduce(flatten)
    .sort(sortByTime)
    .map(trip => Object.assign({}, trip, {time: formatSeconds(trip.time)}))
    .slice(0, 9);

  response.json(trips);
});

app.listen('3000', () => console.log('up and running'));
