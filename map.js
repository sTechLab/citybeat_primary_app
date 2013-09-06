
/* Set up defaults */
var start_scale = 1;
var pulse_rate = 2000;
var scale_factor = 120;

/* Set up map, add pulse layer, get data, animate data */
// $(window).ready(function() {

/* Header */
  /* Weather */
  $.getJSON(location.origin + '/jet/weather/NYC',
    function(data) {
      var temp = parseInt(data.current_observation.temp_f);
      var type = data.current_observation.weather;
      $('#weather-temp').text(temp);
      $('#weather-type').text(type);
    }
  );
  /* Weather */

  /* Time */
  function set_time() {
    var date_obj = Date.now();
    var day = date_obj.toString("dddd");
    var date = date_obj.toString("MMMM d, yyyy");
    $('#date-day').text(day);
    $('#date').text(date);

    
    var time = date_obj.toString("h:mm tt");
    $('#time').text(time);
  }

  set_time();
  setInterval(set_time, 10)
  /* Time */



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
  function fetch_data() {
    var geoJson = [];

    var map = L.mapbox.map('map', 'raziku.map-6nox10c2').setView([40.75275880391166,-73.97139047965452],13);
    window.map = map;

    d3.json('data2.json', function(error, json) {
      if(error) {
        console.log(error);
        cb(error);
        return;
      }
      json.forEach(function(evt){
        var url = "";

        if(evt.text.indexOf("Quinn4NY") != -1 || evt.text.indexOf("ChrisCQuinn") != -1 ){
          url = "/red_dot.png";
        }
        else if(evt.text.indexOf("deblasionyc") != -1 || evt.text.indexOf("BilldeBlasio") != -1){
          url = "/green_dot.png";
        }
        else if(evt.text.indexOf("billthompsonnyc") != -1){
          url = "/blue_dot.png";
        }
        else if(evt.text.indexOf("anthonyweiner") != -1){
          url = "/yellow_dot.png";
        }
        else if(evt.text.indexOf("JohnLiu2013") != -1 || evt.text.indexOf("johncliu") != -1){
          url = "/orange_dot.png";
        }
        else if(evt.text.indexOf("salalbanese2013") != -1){
          url = "/lightblue_dot.png";
        }

        console.log(evt);
        console.log(evt.location.longitude);
        console.log(evt.location.latitude);

        var geoPoint = {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
              // coordinates here are in longitude, latitude order because
              // x, y is the standard for GeoJSON and many formats
              'coordinates': [evt.location.longitude,evt.location.latitude]
            },
            'properties': {        
              'icon': {
                'iconUrl': url,
                'iconSize': [5, 5]
              },
            'text': evt.text,
            'person': evt.entities.user_mentions[0],
            'time': evt.created_time
            }
          };

          geoJson.push(geoPoint);
        });

      d3.select('#event-window').classed('zoom', true);
      // event_loop(event_data, 0);

      map.markerLayer.on('layeradd', function(e) {
        var marker = e.layer,
        feature = marker.feature;

        console.log("these are the features")
        console.log(feature)

        var popupContent = null;

        // Create custom popup content
        var popupContent =  '<a target="_blank" class="popup" href="' + feature.properties.url + '">' +
                            '<img src="/blue_dot.png">' +
                        '   <h2>' + feature.properties.text + '</h2>' +
                        '</a>';

        // http://leafletjs.com/reference.html#popup
        marker.bindPopup(popupContent,{
          closeButton: false,
          minWidth: 320
        });

        marker.setIcon(L.icon(feature.properties.icon));
      });

      map.markerLayer.setGeoJSON(geoJson);

    });

}

/* MAP */
fetch_data();



