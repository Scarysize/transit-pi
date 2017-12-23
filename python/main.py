import atexit
import json
import requests
import threading
import time

from os import path
from papirus import PapirusComposite


def getAbsPath(file):
    base = path.dirname(__file__)
    return path.abspath(path.join(base, file))


URL = 'http://localhost:3000/trips'
LINE_HEIGHT = 22
FONT_REGULAR = getAbsPath('FiraMono-Regular.ttf')
FONT_BOLD = getAbsPath('FiraMono-Bold.ttf')
FONT_SIZE = 14
ICONS = {
    'ferry':  getAbsPath('ferry-icon.png'),
    'bus':  getAbsPath('bus-icon.png'),
    'train':  getAbsPath('train-icon.png'),
    'subway':  getAbsPath('train-icon.png')
}
ICON_SIZE = (17, 17)
UPDATE_INTERVAL = 30


state = {
    'items': []
}
configFile = open(getAbsPath('config.json'))
queries = json.load(configFile)

# Request new items from the REST api
def requestItems():
    response = requests.post(URL, json=queries)
    return response.json()

# Setup all position and size of text & icon elements
def setupLayout(canvas):
    layout = {
        'routes': [],
        'times': [],
        'icons': []
    }

    for index in range(0, 9):
        yOffset = index * LINE_HEIGHT + 2

        routeId = 'route-' + str(index)
        timeId = 'time-' + str(index)
        iconId = 'icon-' + str(index)

        layout['routes'].append(routeId)
        layout['times'].append(timeId)
        layout['icons'].append(iconId)

        canvas.AddText(
            '',
            2,
            yOffset,
            size=FONT_SIZE,
            fontPath=FONT_REGULAR,
            Id=routeId
        )
        canvas.AddText(
            '',
            32,
            yOffset,
            size=FONT_SIZE,
            fontPath=FONT_BOLD,
            Id=timeId
        )
        canvas.AddImg(
            ICONS['bus'],
            77,
            yOffset,
            ICON_SIZE,
            Id=iconId
        )

    return layout

# Call a function in a given interval
def set_interval(func, sec):
    def func_wrapper():
        set_interval(func, sec)
        func()
    t = threading.Timer(sec, func_wrapper)
    t.start()

# Render items to the canvas
def render(items, canvas, layout):
    for index, item in enumerate(items):
        routeId = layout['routes'][index]
        timeId = layout['times'][index]
        iconId = layout['icons'][index]

        canvas.UpdateText(routeId, item['route'], fontPath=FONT_REGULAR)
        canvas.UpdateText(timeId, item['time'], fontPath=FONT_BOLD)
        canvas.UpdateImg(iconId, ICONS[item['type']])
    canvas.WriteAll()

# Trigger item update & re-rendering
def update(canvas, layout):
    render(state['items'], canvas, layout)
    state['items'] = requestItems()

# Show startup screen
def startup(canvas):
    canvas.AddImg(getAbsPath('startup.png'), 0, 0, (96, 200))
    canvas.WriteAll()
    time.sleep(3)
    canvas.Clear()


def main():
    state['items'] = requestItems()
    canvas = PapirusComposite(False, rotation=90)

    startup(canvas)

    layout = setupLayout(canvas)

    def loop():
        update(canvas, layout)

    set_interval(loop, UPDATE_INTERVAL)
    loop()

    def clear():
        canvas.Clear()

    atexit.register(clear)


main()
