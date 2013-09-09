import json
import datetime
import bottle
import time
import sys
import shutil
from bottle import route, run, request, abort, template, static_file
from pymongo import Connection
from bson.objectid import ObjectId

connection = Connection('grande.rutgers.edu', 27017)
db = connection['citybeat_production']

def current():

    timestamp = str(round(int(time.time()), 0) - 3600)
    timestamp = timestamp.replace(' ', '')[:-2].upper()

    print timestamp
    entities= ["["]

    for post in db['tweets'].find({'created_time': {'$gte': timestamp }}):
        entities.append(json.dumps(post))
        entities.append(",")
        print post

    entities[len(entities)-1] = "]"


current()