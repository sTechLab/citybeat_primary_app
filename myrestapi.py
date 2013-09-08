import json
import datetime
import bottle
import time
from bottle import route, run, request, abort, template, static_file
from pymongo import Connection
from bson.objectid import ObjectId

connection = Connection('grande.rutgers.edu', 27017)
db = connection['citybeat_production']

@route('/')
def index():
    output = template('index.html')
    return output

@route('/tweets/:id', method='GET')
def get_document(id):
    ids = id.split("@")
    print "these are the ids"
    print ids

    ids.pop(0)
    print ids

    entities= ["["]

    for id in ids:
        print "went in"
        for post in db['tweets'].find({'text': {'$regex':'^(?=.*'+ id + ').*'}}):
            entities.append(json.dumps(post))
            entities.append(",")
        for post in db['photos'].find({'caption.text': {'$regex':'^(?=.*'+ id + ').*'}}):
            entities.append(json.dumps(post))
            entities.append(",")
            print "INSTAGRAM"
            print post

    entities[len(entities)-1] = "]"
    if not entities:
        abort(404, 'No document with id %s' % id)
    return entities
 
@route('/static/<filename>')
def server_static(filename):
    return static_file(filename, root='static')

@route('/current_tweets', method='GET')
def get_tweets():
    print "went in to currnet tweets"

    gen_time = datetime.datetime(2013, 1, 1)
    dummy_id = ObjectId.from_datetime(gen_time)

    # end = time.mktime(ti.timetuple())
    # start = time.mktime(ti.timetuple()) - 3600

    # print start
    # print end

    entities= ["["]

    for post in db['tweets'].find({"_id": {"$gt": dummy_id}}):
        entities.append(json.dumps(post))
        entities.append(",")
        print post


    entities[len(entities)-1] = "]"
    return entities

run(host='localhost', port=8000)
