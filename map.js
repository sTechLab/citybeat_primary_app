/* Set up defaults */
var start_scale = 1;
var pulse_rate = 2000;
var scale_factor = 120;

/* Figure out what the data pulse rate is based on deviation */
var data_pulse_prop = function(deviation, scale_function, pulse_function) {
  var props = {"start_scale": start_scale, "pulse_rate": pulse_rate,
               "pulse_time": 1};

  scale_function = function(start, dev) {
    //return start + Math.pow(Math.E, dev) * 20;
    return start + (Math.pow(2, dev) - 1) * scale_factor;
  };

  props.max_scale = scale_function(start_scale, deviation);

  props.pulse_time /= deviation;
  
  return props;
};

/* Fetch Data, create geo features */
var fetch_data = function(cb) {

  var pulse_data = [];
  var event_data = [];

  d3.json('data2.json', function(error, json) {
    if(error) {
      console.log(error);
      cb(error);
      return;
    }

      console.log(json)


    for(var i = 0; i < json.length; i++) {
      var eve = json[i];
      console.log(eve)

      var lat = (eve.location.latitude)/2;
      var lng = (eve.location.longitude)/2;

      /* Pulse */
      var deviation = eve.urgency/100;

      var geo = {"geometry": {"type": "Point", "coordinates": [lng, lat] }, "id": eve._id,
        "properties": data_pulse_prop(deviation) };
      pulse_data.push(geo);
      /* Pulse END */

      /* Event */
      var evnt = {};
      // evnt.id = eve._id;
      // evnt.keywords = ["Lorem", "Ipsum", "Filler"];
      // evnt.photos = [];
      // for(var j = 0; (j < eve.images.length) && (j < 5); j++) {
      //   var photo = eve.images[j];
      //   var caption = '';
      //   if(photo.caption) {
      //     caption = photo.caption.text;
      //     //Remove emoji
      //     caption = caption.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
      //   }
      //   evnt.photos.push({img: photo.images.standard_resolution.url, 
      //       caption: caption});
      // }

      /* TEMP */

      // evnt.stats = eve.stats;

      // console.log(eve)
      // console.log(evnt)
      // evnt.stats.tweets = 38;
      // evnt.stats.checkins = 56;

      evnt.lng = lng;
      evnt.lat = lat;
      
      event_data.push(evnt);
      /* Event END */
    }

    cb(null, pulse_data, event_data);
  });

};

/* Map Initiating Pulse Layer */
// var pulseLayer = PulseLayer(); 

/* MAP */
  var map = L.mapbox.map('map', 'raziku.map-6nox10c2').setView([40.75275880391166,-73.97139047965452],13);
  window.map = map;

  var geoJson = [];

  fetch_data(function(error, pulse_data, event_data) {
    if(error) { 
      console.log(error);
      return;
    } else if(event_data.length < 1) {
      console.log("No events found");
      return;
    }

    function event_loop(event_data, event_idx) {

      event_data.forEach(function(evt){
        console.log(evt)
        console.log(evt.lng*2)
        console.log(evt.lat*2)

        var geoPoint = {
          'type': 'Feature',
          'geometry': {
              'type': 'Point',
              // coordinates here are in longitude, latitude order because
              // x, y is the standard for GeoJSON and many formats
              'coordinates': [evt.lng*2,evt.lat*2]
          },
          'properties': {        
            'title': "blue",
            'icon': {
                  'iconUrl': "/blue_dot.jpg",
                  'iconSize': [5, 5]
              }
          }
        };

        geoJson.push(geoPoint);

        console.log("this is the geo json")
        console.log(geoJson);
      });
    

      map.markerLayer.on('layeradd', function(e) {
        var marker = e.layer,
        feature = marker.feature;

        marker.setIcon(L.icon(feature.properties.icon));
      });

      map.markerLayer.setGeoJSON(geoJson);
  }

    d3.select('#event-window').classed('zoom', true);
    event_loop(event_data, 0);

  });
/* MAP */




