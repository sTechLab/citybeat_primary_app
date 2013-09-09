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

mayor_race = [["@Quinn4NY", "@ChrisCQuinn", "#quinn"], ["@BilldeBlasio", "@deblasionyc", "blasio", "#TeamdeBlasio", "#deblasio"],["@billthompsonnyc"], ["@anthonyweiner", "#anthonyweiner", "anthonyweiner"], ["@johncliu", "@JohnLiu2013", "#liu"], ["#albanese", "@salalbanese2013"]]
comptroller_race = [["@stringer2013", "#stringer", "@scottmstringer"], ["@spitzer2013", "#spitzer"]];
public_advocate_race = [["@reshmasaujani", "#saujani", "saujani"], ["@squadron4NY", "@danielsquadron"], ["@tish2013", "@tishjames", " #teamtish", "#tish"]];
manhatten_president_race = [["@galeforMBP", "@galeabrewer", "#gale", "#galebrewer"], ["@juliemenin", "#menin", "menin"], ["@jesslappin", "#lappin", "lappin"], ["@RJackson_NYC"]];
queens_president_race = [["@melindakatz", "#katz"], ["@pfvjr", "#vallone"]];
brooklyn_da_race = [["@hynesforda", "#hynes", "@brooklynda"], ["@KenThompson4DA", "#kenthompson"]];
repub_mayor_primary_race = [["@joelhota", "@joelhota4mayor"], ["@jcats2013"], ["@mcdonald4nyc"]];

print sys.argv

def get_document(list_name, ids):
    while True:
        print "60 SECONDS HAVE PASSED"
        print ids
        print list_name
        open("static/" + list_name + "_updating_2.json", 'w').close()
        f = open("static/" + list_name + "_updating_2.json", "w")

        timestamp = str(round(int(time.time()), 0) - 3600)
        timestamp = timestamp.replace(' ', '')[:-2].upper()
        print timestamp

        entities= ["["]

        for id in ids:
            print id
            for tag in id:
                print tag
                for post in db['tweets'].find({'text': {'$regex': '.*' + tag + '', '$options':'-i'}}):
                    entities.append(json.dumps(post))
                    entities.append(",")
                    print post
                for post in db['photos'].find({'caption.text': {'$regex': '.*' + tag + '', '$options':'-i'}}):
                    entities.append(json.dumps(post))
                    entities.append(",")
                    print "INSTAGRAM"
                    print post

        entities[len(entities)-1] = "]"
        if not entities:
            abort(404, 'No document with id %s' % tag)
        f.write(" ".join(entities))
        f.flush()
        f.close()

        shutil.copy2("static/" + list_name + "_updating_2.json", "static/" + list_name + "_2.json")
        time.sleep(200)

# def current():

#     timestamp = str(round(int(time.time()), 0))
#     print timestamp
#     entities= ["["]

#     for post in db['tweets'].find({'created_time': {'$gte': '"' + timestamp + '"'}}):
#         entities.append(json.dumps(post))
#         entities.append(",")
#         print post

#     entities[len(entities)-1] = "]"


# current()
get_document(sys.argv[1], eval(sys.argv[1]))

