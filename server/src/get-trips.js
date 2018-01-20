const timeHelper = require('./time');

function flatten(acc, items) {
  return [...acc, ...items];
}

function getWeekDayName() {
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ];

  return days[new Date().getDay()];
}

function getNextStopTime(stopTimes) {
  const nowSecs = timeHelper.getSecondsFromMidnight(new Date());
  stopTimes.sort();

  for (const time of stopTimes) {
    // past
    if (time < nowSecs) {
      continue;
    }

    return time;
  }

  return null;
}

module.exports = db => {
  function getRouteId(name) {
    return db
      .prepare(
        `
      SELECT
        route_id AS routeId
      FROM
        routes
      WHERE
        route_short_name = $name
      `
      )
      .all({name})
      .map(result => result.routeId);
  }

  function getStopIds(name) {
    return db
      .prepare(
        `
        SELECT
          stop_id AS stopId
        FROM
          stops
        WHERE
          stop_name LIKE $name
        `
      )
      .all({name: `%${name}%`})
      .map(result => result.stopId);
  }

  function getTripsAtStop(stopId, direction) {
    return db
      .prepare(
        `
    SELECT
      trips.trip_id AS tripId,
      trips.route_id AS routeId
    FROM
      trips,
      stops,
      stop_times,
      calendar
    WHERE
      calendar.${getWeekDayName()} = 1
    AND
      trips.service_id = calendar.service_id
    AND
      trips.direction_id = $direction
    AND
      stops.stop_id = $stopId
    AND
      stop_times.stop_id = stops.stop_id
    AND
      trips.trip_id = stop_times.trip_id
  `
      )
      .all({stopId, direction});
  }

  function getStopTimes(tripId, stopId) {
    return db
      .prepare(
        `
        SELECT
          arrival_time AS time
        FROM
          stop_times
        WHERE
          trip_id = $tripId
        AND
          stop_id = $stopId
        `
      )
      .all({tripId, stopId})
      .map(result => result.time)
      .map(timeHelper.parseTime);
  }

  return query => {
    const {route, direction, stop} = query;
    const routes = getRouteId(route);
    const stopIds = getStopIds(stop);

    const isOfRoute = trip => routes.includes(trip.routeId);
    const addStop = stopId => trip => Object.assign({}, trip, {stopId});
    const addTime = trip => {
      const stopTimes = getStopTimes(trip.tripId, trip.stopId);
      return Object.assign({}, trip, {nextTime: getNextStopTime(stopTimes)});
    };
    const tripsOfStop = stopId =>
      getTripsAtStop(stopId, direction).map(addStop(stopId));

    const relevantTrips = stopIds
      .map(tripsOfStop)
      .reduce(flatten, [])
      .filter(isOfRoute)
      .map(addTime)
      .filter(trip => trip.nextTime);

    return relevantTrips;
  };
};
