/*
  +--------------+                  +--------------+              +-------------+
  |              |                  |              |              |             |
  |  stop_times  <------------------+     trips    <--------------+    routes   |
  |              |                  |              |              |             |
  +-------+------+                  +------+-------+              +-------------+
          |                                |
          |                                |
          |                                |
          |                                |
          |                                |
  +-------v------+                  +------v-------+
  |              |                  |              |
  |    stops     |                  |    shapes    |
  |              |                  |              |
+--------------+                  +--------------+
*/

-- enable CSV import mode
.mode csv

-- define the CSV separator
.separator ','

-- import & create tables, this will not insert the header line of a CSV file as a row
.import input/stops.txt stops
.import input/stop_times.txt stop_times
.import input/trips.txt trips
.import input/routes.txt routes
.import input/calendar.txt calendar

-- create indices to speed up queries

-- TRIPS
create index trips_trip_id on trips (trip_id);
create index trips_service_id on trips (service_id);

-- STOP_TIMES
create index stop_times_trips on stop_times (trip_id);
create index stop_times_stop_id on stop_times (stop_id);

-- STOPS
create index stops_stop_id on stops (stop_id);

-- CALENDAR
create index calendar_service_id on calendar (service_id);
