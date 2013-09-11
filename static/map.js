
/* Set up defaults */
var start_scale = 1;
var pulse_rate = 2000;
var scale_factor = 120;
var tickerOn = false;

var colors = ["yellow", "red", "blue", "lightblue", "green", "orange"]

var races = [
  {
    office: 'mayor',
    candidates: [
      {
        name: "Christine Quinn",
        search_terms: ["@Quinn4NY", "@ChrisCQuinn", "#quinn", "quinn"]
      },
      {
        name: "Bill de Blasio",
        search_terms: ["@BilldeBlasio", "@deblasionyc", "blasio", "#TeamdeBlasio", "#deblasio"]
      },
      {
        name: "Bill Thompson",
        search_terms: ["@billthompsonnyc", "#thompson"]
      },
      {
        name: "Anthony Weiner",
        search_terms: ["@anthonyweiner", "#weiner"]
      },
      {
        name: "John Liu",
        search_terms: ["@johncliu", "@JohnLiu2013", "#liu"]
      },
      {
        name: "Sal Albanese",
        search_terms: ["#albanese", "@salalbanese2013"]
      }
    ]
  },
  {
    office: 'comptroller',
    candidates: [
      {
        name: "Scott Stringer",
        search_terms: ["@stringer2013", "#stringer", "@scottmstringer"]
      },
      {
        name: "Eliot Spitzer",
        search_terms: ["@spitzer2013", "#spitzer"]
      }
    ]
  },
  {
    office: 'public_advocate',
    candidates: [
      {
        name: "Reshma Saujani",
        search_terms: ["@reshmasaujani", "#saujani", "saujani"]
      },
      {
        name: "Daniel Squadron",
        search_terms: ["@squadron4NY", "@danielsquadron", "#squadron"]

      },
      {
        name: "Letitia James",
        search_terms: ["@tish2013", "@tishjames", " #teamtish", "#tish"]
      }
    ]
  },
  {
    office: 'manhattan_president',
    candidates: [
      {
        name: "Gale Brewer",
        search_terms: ["@galeforMBP", "@galeabrewer", "#gale", "#galebrewer", "#brewer"]
      },
      {
        name: "Julie Menin",
        search_terms: ["@juliemenin", "#menin", "menin"]
      },
      {
        name: "Jessica Lappin",
        search_terms: ["@jesslappin", "#lappin", "lappin"]
      },
      {
        name: "Robert Jackson",
        search_terms: ["@RJackson_NYC", "#jackson"]
      }
    ]
  },
  {
    office: 'queens_president',
    candidates: [
      {
        name: "Melinda Katz",
        search_terms: ["@melindakatz", "#katz"]
      },
      {
        name: "Peter Vallone",
        search_terms: ["@pfvjr", "#vallone"]
      }
    ]
  },
  {
    office: 'brooklyn_da',
    candidates: [
      {
        name: "Charles J. Hynes",
        search_terms: ["@hynesforda", "#hynes", "@brooklynda"]
      },
      {
        name: "Ken Thompson",
        search_terms: ["@KenThompson4DA", "#kenthompson"]
      }
    ]
  },
  {
    office: 'repub_mayor_primary',
    candidates: [
      {
        name: "Joe Lhota",
        search_terms: ["@joelhota", "@joelhota4mayor"]
      },
      {
        name: "John Catsimatidis",
        search_terms: ["@jcats2013"]
      },
      {
        name: "George McDonald",
        search_terms: ["@mcdonald4nyc"]
      }
    ]
  }
]

var geoJson = [];

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



/* TICKER */

  //Random async handling stuff
  var when = function() {
    var args = arguments;  // the functions to execute first
    return {
      then: function(done) {
        var counter = 0;
        for(var i = 0; i < args.length; i++) {
          // call each function with a function to call on done
          args[i](function() {
            counter++;
            if(counter === args.length) {  // all functions have notified they're done
              done();
            }
          });
        }
      }
    };
  };

  var venue_data = [];
  var trend_data = [];

  //Build Ticker
  when(
    function(done) {
      $.getJSON(location.origin + '/jet/foursquare/trending', function(data) {

        var venues = data.response.venues;
        for(var i in venues) {
          var venue = venues[i];
          venue_data.push({name: venue.name, hereNow: venue.hereNow ? venue.hereNow.count : 0});
        }
        done();
      });
    },
    function(done) {
      $.getJSON(location.origin + '/jet/twitter/trending', function(data) {

        var trends = data[0].trends;
        for(var i in trends) {
          var trend = trends[i];
          trend_data.push({name: trend.name, url: trend.url});
        }
        done(trend_data);
      });
    }
  ).then(function() {

    var li_list = "";

    li_list += $('<li></li>').text('Foursquare Trending Venues:').addClass('ticker-topic').prop('outerHTML');
    for(var i in venue_data) {
      li_list += $('<li></li>').text(venue_data[i].name).prop('outerHTML');
    }

    li_list += $('<li></li>').text("Twitter Trending Topics:").addClass('ticker-topic').prop('outerHTML');
    for(var i in trend_data) {
      li_list += $('<li></li>').text(trend_data[i].name).prop('outerHTML');
    }

    $('#ticker').append(li_list);
    $('#ticker').webTicker({
      startEmpty: true
    });
  });


/* TICKER */


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


  var map = L.mapbox.map('map', 'raziku.map-6nox10c2').setView([40.75275880391166,-73.97139047965452],13);
  window.map = map;

  MapCenterOffsetMixin = {
    UIOffset: [0, 600], // x, y
    getBounds: function(){
        var a=this.getPixelBounds(),
            b=this.unproject(new L.Point(a.min.x+this.UIOffset[0],a.max.y+this.UIOffset[1]), this._zoom,!0),
            c=this.unproject(new L.Point(a.max.x,a.min.y),this._zoom,!0);
            return new L.LatLngBounds(b,c)
    },
    _latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
        var targetPoint = this.project(newCenter, newCenter).subtract([this.UIOffset[0]/2, this.UIOffset[1]/2]),
            newCenter = this.unproject(targetPoint, newZoom);
        var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
        return this.project(latlng, newZoom)._subtract(topLeft);
    },
    _getCenterLayerPoint: function () {
        return this.containerPointToLayerPoint(this.getSize().divideBy(2).add([this.UIOffset[0]/2, this.UIOffset[1]/2]));
    },
    _resetView: function (a, b, c, d) {
        var e = this._zoom !== b;
        // Change the center
        var targetPoint = this.project(a, b).subtract([this.UIOffset[0] / 2, this.UIOffset[1]/2]),
            a = this.unproject(targetPoint, b);
        d || (this.fire("movestart"), e && this.fire("zoomstart")), this._zoom = b, this._initialTopLeftPoint = this._getNewTopLeftPoint(a);
        if (!c) L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
        else {
            var f = L.DomUtil.getPosition(this._mapPane);
            this._initialTopLeftPoint._add(f)
        }
        this._tileLayersToLoad = this._tileLayersNum, this.fire("viewreset", {
            hard: !c
        }), this.fire("move"), (e || d) && this.fire("zoomend"), this.fire("moveend"), this._loaded || (this._loaded = !0, this.fire("load"))
    }
}

L.Map.include(MapCenterOffsetMixin);


var getDotColor = function(race, text) {
  var color = '';
  race.candidates.some(function(c, i){
    return c.search_terms.some(function(term){
      if (~(text.indexOf(term))) {
        color = "static/dots/" + colors[i] + "_dot.png"
        return true;
      }
    });
  });
  return color;
};

var getTweetGeoPoint = function(evt, url) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      // x, y is the standard for GeoJSON and many formats
      coordinates: [evt.location.longitude, evt.location.latitude]
    },
    properties: {
      icon: {
        iconUrl: url,
        iconSize: [5, 5]
      },
      text: evt.text,
      person: "@" + evt.user.screen_name,
      time: evt.created_time,
      image: ""
    }
  };
};

var getFSQGeoPoint = function(evt, url) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      // x, y is the standard for GeoJSON and many formats
      coordinates: [evt.location.longitude, evt.location.latitude]
    },
    properties: {
      icon: {
        iconUrl: url,
        iconSize: [5, 5]
      },
      text: evt.caption.text,
      person: evt.user.username,
      time: evt.created_time,
      image: evt.images.low_resolution.url
    }
  };
}


/* Fetch Data, create geo features */
function fetch_data(race) {
  d3.json('static/'+ race.office + '_race_2.json', function(error,json) {
    geoJson = json.map(function(evt) {
      var geoPoint, icon_url = "";
      if (evt.mid_lng == null) { //this is a tweet
        icon_url = getDotColor(race, evt.text) || "static/dots/orange_dot.png";
        geoPoint = getTweetGeoPoint(evt, icon_url);
      } else {
        icon_url = getDotColor(race, evt.caption.text) || "static/dots/orange_dot.png";
        geoPoint = getFSQGeoPoint(evt, icon_url);
      }
      return geoPoint;
    });


    d3.select('#event-window').classed('zoom', true);
    // event_loop(event_data, 0);

    map.markerLayer.on('layeradd', function(e) {
      var marker = e.layer,
      feature = marker.feature;

      var popupContent = null;

      var date_obj = new Date(feature.properties.time * 1000);
      var day = date_obj.toString("dddd");
      var date = date_obj.toString("MMMM d, yyyy");

      var time = date_obj.toString("h:mm tt");
      // Create custom popup content
      var popupContent =  '<a target="_blank" class="popup" href="' + feature.properties.url + '">' +
                          '<img src="' + feature.properties.image + '">' +
                      '   <h2>' + feature.properties.text + '</h2>' +
                      '   <span id="user">   ' + feature.properties.person + '   </span>' +
                      '   <span id="time_tool">' + day + " " + date + " " + time + '</span>' +
                      '</a>';

      // http://leafletjs.com/reference.html#popup
      marker.bindPopup(popupContent,{
        closeButton: false,
        minWidth: 320
      });

      marker.setIcon(L.icon(feature.properties.icon));
    });

    map.markerLayer.on('click', function(e) {
        map.panTo(e.layer.getLatLng());
        // var markers = [];
        // this.eachLayer(function(marker) { markers.push(marker); });
        // cycle(markers);
    });

  //   function cycle(markers) {
  //     var i = 0;
  //     function run() {
  //         // if (++i > markers.length - 1) i = 0;
  //         i = Math.floor((Math.random()*markers.length)+1)
  //         map.setView(markers[i].getLatLng(), 13);
  //         markers[i].openPopup();
  //         window.setTimeout(run, 3000);
  //     }
  //     run();
  // }

    map.markerLayer.setGeoJSON(geoJson);
  });
}

var getRaceData = function(race_name) {
  var result;
  races.some(function(race) {
    if (race.office === race_name){
      result = race;
      return true;
    }
  })
  return result;
}

var update = function(race_name) {
  var race = getRaceData(race_name);
  update_banner(race)
  geoJson = [];
  map.markerLayer.setGeoJSON(geoJson);
  fetch_data(race);
}

var update_banner = function(race){
  $("#banner").children().remove();

  var width = $(window).width() / race.candidates.length - 40;

  race.candidates.forEach(function(candidate, i){
    var color = colors[i];
    var twitter_handle = candidate.search_terms[0].substring(1);

    $("#banner").append("<li class='candidate " + twitter_handle + "' style='width: " + width + "'></li>");
    $("." + twitter_handle).append("<div class='"+ twitter_handle +"_img img'></div>")
    $("." + twitter_handle + "_img").append("<img src='/static/candidates/" + twitter_handle + ".jpg'>" +
                                       "<div class='color_banner' style='background-color:"+ color + "'>")


    $("." + twitter_handle).append("<div class='" + twitter_handle + "_text text_half'></div>");
    $("." + twitter_handle + "_text").append("<text>" + candidate.name + "</text>" +
                                        "<div class='stat_box'></div>");
  });
}

// JQuery for UI

$(document).ready(function () {
  $("#races").on('change', function(d) {
    var race_name = $(this).find('option:selected').attr("value");
    update(race_name);
  });
});
update('mayor');
