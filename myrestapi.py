import json
import bottle
from bottle import route, run, request, abort, template, static_file
from pymongo import Connection
 
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

    entities= ["["]
    for post in db['tweets'].find({'text': {'$regex':'^(?=.*'+ id + ').*'}}):
        entities.append(json.dumps(post))
        entities.append(",")

    entities[len(entities)-1] = "]"
    # print length
    # entities.append("]")
    # length = length.replace(length[len(length)-1], ']')
    # entities[len(entities)-1] = length

    # print '{"something":"1","mode":true,"number":1234}'

    if not entities:
        abort(404, 'No document with id %s' % id)
    return entities
 
@route('/static/<filename>')
def server_static(filename):
    return static_file(filename, root='static')

run(host='localhost', port=8000)
