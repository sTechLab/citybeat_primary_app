
/* Fetch Data, create geo features */
var fetch_data = function(cb) {

  var pulse_data = [];
  var event_data = [];

  d3.json('http://ec2-23-22-67-45.compute-1.amazonaws.com/citybeat-backend/getAllEvents', function(error, json) {
    if(error) {
      console.log(error);
      cb(error);
      return;
    }

    for(var i = 0; i < json.length; i++) {
      var eve = json[i];

      var lat = (eve.region.max_lat + eve.region.min_lat)/2;
      var lng = (eve.region.max_lng + eve.region.min_lng)/2;

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
      for(var j = 0; (j < eve.photos.length) && (j < 5); j++) {
        var photo = eve.photos[j];
        var caption = '';
        if(photo.caption) {
          caption = photo.caption.text;
          //Remove emoji
          caption = caption.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
        }
        evnt.photos.push({img: photo.images.standard_resolution.url, 
            caption: caption});
      }
      evnt.tweets = [];
      /* TEMP until we get tweets */
      evnt.tweets.push({text:"Lorem ipsum. Filler tweet. Long tweet. Short response.", author: "@RiverTam"});
      evnt.tweets.push({text:"Fillers Fillers Fillers everywhere.", author: "@MalReynolds"});
      /* TEMP */

      evnt.stats = eve.stats;

      evnt.stats.tweets = 38;
      evnt.stats.checkins = 56;

      evnt.lng = lng;
      evnt.lat = lat;
      
      event_data.push(evnt);
      /* Event END */
    }

    cb(null, pulse_data, event_data);
  });

};


/* MAP */
  var layer = mapbox.layer().id('raziku.map-6nox10c2');


  var map = mapbox.map('map', layer, null, []);
  window.map = map;
  map.center({ lat: 40.75275880391166, lon: -73.97139047965452 });
  map.zoom(13, true);

  fetch_data(function(error, pulse_data, event_data) {
    if(error) { 
      console.log(error);
      return;
    } else if(event_data.length < 1) {
      console.log("No events found");
      return;
    }

    pulseLayer.data(pulse_data);
    pulseLayer.animate(earthquake);
    map.addLayer(pulseLayer);
    map.extent(pulseLayer.extent());

  /* EVENT LOOP */
    var events = new Event();

    function whichTransitionEvent(){
      var t;
      var el = document.createElement('fakeelement');
      var transitions = {
        'transition':'transitionend',
        'OTransition':'oTransitionEnd',
        'MozTransition':'transitionend',
        'WebkitTransition':'webkitTransitionEnd'
      }

      for(t in transitions){
        if( el.style[t] !== undefined ){
          return transitions[t];
        }
      }
    }

    var transitionEnd = whichTransitionEvent();

    function event_loop(event_data, event_idx) {
      var ev = event_data[event_idx];

      //Activate new active pulse
      var new_pulse = pulseLayer.findPulseByID(ev.id);
      new_pulse.classed('active-pulse', true).classed('inactive-pulse', false);


      //map.centerzoom({lat: ev.lat, lon: ev.lng}, 12, true);

      //Wait for map zoom
      //setTimeout(function() {
        map.centerzoom({lat: ev.lat + 0.004, lon: ev.lng}, 15, true);

        events.loadNewData(ev);

        d3.select('#event-window').classed('zoom', false);

        events.animate();
        
        //Deactivates event and runs next animation
        setTimeout(function() { 
          //Deactivate old pulse
          pulseLayer.findPulseByID(ev.id)
            .classed('active-pulse', false).classed('inactive-pulse', true);

          events.stopAnimation();

          d3.select('#event-window').classed('zoom', true);

          d3.select('#event-window').on(transitionEnd, function() {
            if(d3.select(this).classed('zoom')) {
              event_idx = (event_idx+1) % event_data.length;
              event_loop(event_data, event_idx);

              pulseLayer.findPulseByID(ev.id)
                .classed('active-pulse', false).classed('inactive-pulse', true);

              //Cleanup leaks
              ev = null;
              new_pulse = null;
            }
          });


        }, 14000);
      //}, 2000);

    }
    
    d3.select('#event-window').classed('zoom', true);
    event_loop(event_data, 0);

  /* EVENT */
  });
/* MAP */




