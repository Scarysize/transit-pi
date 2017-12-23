#!/bin/sh

# make sure the raspi is broadcasted as "raspberrypi.local"
rsync -avz \
  --exclude node_modules \
  --exclude deploy.sh \
  ./server \
  ./python \
   pi@raspberrypi.local:/home/pi/transit-pi