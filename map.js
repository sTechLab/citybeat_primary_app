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

  d3.json('data.json', function(error, json) {
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
      evnt.id = eve._id;
      evnt.keywords = ["Lorem", "Ipsum", "Filler"];
      evnt.photos = [];
      for(var j = 0; (j < eve.images.length) && (j < 5); j++) {
        var photo = eve.images[j];
        var caption = '';
        if(photo.caption) {
          caption = photo.caption.text;
          //Remove emoji
          caption = caption.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
        }
        evnt.photos.push({img: photo.images.standard_resolution.url, 
            caption: caption});
      }

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
  // var layer = mapbox.layer().id('raziku.map-6nox10c2');

  var map = L.mapbox.map('map', 'raziku.map-6nox10c2').setView([40.75275880391166,-73.97139047965452],13);
  window.map = map;
  // map.center({ lat: 40.75275880391166, lon: -73.97139047965452 });
  // map.zoom(13, true);

  fetch_data(function(error, pulse_data, event_data) {
    if(error) { 
      console.log(error);
      return;
    } else if(event_data.length < 1) {
      console.log("No events found");
      return;
    }

    // console.log(pulse_data)

    // pulseLayer.data(pulse_data);
    // // pulseLayer.animate(earthquake);
    // map.addLayer(pulseLayer);
    // map.extent(pulseLayer.extent());

  /* EVENT LOOP */
    // var events = new Event();

    // function whichTransitionEvent(){
    //   var t;
    //   var el = document.createElement('fakeelement');
    //   var transitions = {
    //     'transition':'transitionend',
    //     'OTransition':'oTransitionEnd',
    //     'MozTransition':'transitionend',
    //     'WebkitTransition':'webkitTransitionEnd'
    //   }

    //   for(t in transitions){
    //     if( el.style[t] !== undefined ){
    //       return transitions[t];
    //     }
    //   }
    // }

    // var transitionEnd = whichTransitionEvent();

    function event_loop(event_data, event_idx) {

      console.log(event_data)

      // var ev = event_data[event_idx];

      // //Activate new active pulse
      // var new_pulse = pulseLayer.findPulseByID(ev.id);
      // new_pulse.classed('active-pulse', true).classed('inactive-pulse', false);


      // //map.centerzoom({lat: ev.lat, lon: ev.lng}, 12, true);

      // //Wait for map zoom
      // //setTimeout(function() {
      //   map.centerzoom({lat: ev.lat + 0.004, lon: ev.lng}, 15, true);

      //   events.loadNewData(ev);

      //   d3.select('#event-window').classed('zoom', false);

      //   events.animate();
        
      //   //Deactivates event and runs next animation
      //   setTimeout(function() { 
      //     //Deactivate old pulse
      //     pulseLayer.findPulseByID(ev.id)
      //       .classed('active-pulse', false).classed('inactive-pulse', true);

      //     events.stopAnimation();

      //     d3.select('#event-window').classed('zoom', true);

      //     d3.select('#event-window').on(transitionEnd, function() {
      //       if(d3.select(this).classed('zoom')) {
      //         event_idx = (event_idx+1) % event_data.length;
      //         event_loop(event_data, event_idx);

      //         pulseLayer.findPulseByID(ev.id)
      //           .classed('active-pulse', false).classed('inactive-pulse', true);

      //         //Cleanup leaks
      //         ev = null;
      //         new_pulse = null;
      //       }
      //     });


      //   }, 14000);
      // //}, 2000);

    }

    L.mapbox.markerLayer({
    // this feature is in the GeoJSON format: see geojson.org
    // for the full specification
    type: 'Feature',
    geometry: {
        type: 'Point',
        // coordinates here are in longitude, latitude order because
        // x, y is the standard for GeoJSON and many formats
        coordinates: [-73.97139047965452,40.75275880391166]
    },
    properties: {
        title: 'A Single Marker',
        description: 'Just one of me',
        'marker-size': 'small',
        'marker-color': '#f0a'
    }
  }).addTo(map);
    
    d3.select('#event-window').classed('zoom', true);
    event_loop(event_data, 0);

  /* EVENT */
  });
/* MAP */




