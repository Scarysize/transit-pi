# transit-pi

A raspberry pi offline transit schedule, showing the upcoming departures for selected train & bus stations on a 2" e-ink display.

https://twitter.com/Scarysize/status/942024967562162176

![](https://i.imgur.com/1neyuvm.jpg)

## Prerequisites

You need:

- Raspberry Pi Zero W (https://www.raspberrypi.org/products/raspberry-pi-zero-w/)
  - https://shop.pimoroni.de/products/raspberry-pi-zero-w
  - ~10€
- PaPiRus Zero – ePaper / eInk Screen pHAT for Pi Zero
  - https://shop.pimoroni.com/products/papirus-zero-epaper-eink-screen-phat-for-pi-zero
  - ~36€
- Pin Headers for the Pi
  - https://shop.pimoroni.de/products/male-40-pin-2x20-hat-header
  - ~1€
- Micro SD card for the Pi
- Micro USB Cable to power the Pi
- Soldering Iron
- GTFS Data for your city: https://transitfeeds.com/
  - You at least need: `stop_times.txt, trips.txt, routes.txt, calendar.txt`
- sqlite3
- node.js
- python

## Hardware

1. Solder the Header to your Pi (or use solderless headers)
  - https://www.raspberrypi.org/blog/getting-started-soldering/
2. Setup the display
  - https://www.pi-supply.com/make/papirus-assembly-tips-and-gotchas/

## Software

1. Install an operating system on your Pi:
  - https://www.raspberrypi.org/documentation/installation/installing-images/
2. Headless Pi setup (Wifi & SSH)
  - https://learn.adafruit.com/raspberry-pi-zero-creation/overview
3. Install the PaPirus library, including the python 2 API
  - https://github.com/PiSupply/PaPiRus
  - Run some included test programs to check if you display works

## Create the SQLite3 database

Copy your GTFS files into the `input/` directory. Then in the project root run:

```sh
sqlite3 server/gtfs.db < import-gtfs.sql
```

This will import the CSV files into a databse and create some indices. It may take a few minutes.

## Config file

In `python/` you will find a `config.json` file. This is configured for some stations in Hamburg, Germany. Adapt this file depending on what you want to display. You need to supply a `route`, `stop`, `direction` and `type` (bus, ferry, train) for each "query". To figure out the correct values, you can simply search around in your GTFS CSV files. If you want to learn more about the GTFS format, check out my blog post: https://medium.com/@Scarysize/gently-gutting-gtfs-part-1-7a7f54a36ba0

## Deploying

Just rsync everything over to the pi. If your pi broadcasts itself on the local network as `raspberrypi.local`, you can just use the `deploy.sh` script to copy the files over. Once everything is on the pi, open up a ssh session:

```sh
ssh pi@raspberrypi.local
cd transit-pi
npm install # this will take a long f*cking time (~2 hrs), because the sqlite3 module needs to be re-compiled
```

## Running

Start up the node server:

```sh
node server/index.js
```

Start up the python program, responsible for rendering on the display

```sh
python python/main.py
```

You can just use something like [forever](https://github.com/foreverjs/forever) to run both as background tasks.

Done.

Both the node server & pyhton script consist of very few lines of code, I encourage you to read and understand it. It isn't thoroughly tested, so if an issue arrises, you should be able to fix it on your own. I won't respond to any issues/PRs in this repository.



