
/* Set up defaults */
var start_scale = 1;
var pulse_rate = 2000;
var scale_factor = 120;

var colors = ["yellow", "red", "blue", "lightblue", "green", "orange"]

var mayor_race = ["@Quinn4NY", "@BilldeBlasio","@billthompsonnyc", "@anthonyweiner", "@johncliu", "@salalbanese2013"];
var comptroller_race = ["@stringer2013", "@spitzer2013"];
var public_advocate_race = ["@reshmasaujani", "@squadron4NY", "@tish2013"];
var manhatten_president_race = ["@galeforMBP", "@juliemenin", "@jesslappin", "@RJackson_NYC"];
var queens_president_race = ["@melindakatz", "@pfvjr"];
var brooklyn_da_race = ["@hynesforda", "@KenThompson4DA"];
var repub_mayor_primary_race = ["@joelhota", "@jcats2013", "@mcdonald4nyc"];

var mayor_race_name = ["Christine Quinn", "Bill de Blasio","Bill Thompson", "Anthony Weiner", "John Liu", "Sal Albanese"];
var comptroller_race_name = ["Scott Stringer", "Eliot Spitzer"];
var public_advocate_race_name = ["Reshma Saujani", "Daniel Squadron", "Letitia James"];
var manhatten_president_race_name = ["Gale Brewer", "Julie Menin", "Jessica Lappin", "Robert Jackson"];
var queens_president_race_name = ["Melinda Katz", "Peter Vallone"];
var brooklyn_da_race_name = ["Charles J. Hynes", "Ken Thompson"];
var repub_mayor_primary_race_name = ["Joe Lhota", "John Catsimatidis", "George McDonald"];

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

/* Fetch Data, create geo features */
function fetch_data(tag, current_race) {
  console.log("went into fetch data")

  d3.json('http://localhost:8000/tweets/' + tag, function(error,json) {
    console.log(json)
    json.forEach(function(evt){
      var url = "";

      //assign dot color
      var index = current_race.indexOf(tag);
      url = "/static/"+colors[index]+"_dot.png"

      if(evt.mid_lng == null){ //this is a tweet
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
            'person': evt.user.screen_name,
            'time': evt.created_time
            }
          };
        }
        else{
          console.log(evt)
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
            'text': evt.caption.text,
            'person': evt.user.screen_name,
            'time': evt.created_time
            }
          };
        }

        geoJson.push(geoPoint);
      });

    console.log(geoJson);

    d3.select('#event-window').classed('zoom', true);
    // event_loop(event_data, 0);

    map.markerLayer.on('layeradd', function(e) {
      var marker = e.layer,
      feature = marker.feature;

      var popupContent = null;

      // console.log(Date.now().getTime()/1000)
      // console.log(feature.properties.time)
      // console.log(Date.now().getTime()/1000 - feature.properties.time)

      var ago = Math.ceil(Date.now().getTime()/1000) - feature.properties.time;

      // Create custom popup content
      var popupContent =  '<a target="_blank" class="popup" href="' + feature.properties.url + '">' +
                          '<img src="/blue_dot.png">' +
                      '   <h2>' + feature.properties.text + '</h2>' +
                      '   <span id="user">   @' + feature.properties.person + '   </span>' + 
                      '   <span id="time_tool">' + ago + ' minutes ago</span>' +        
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

function update(race){
  geoJson = [];
  race.forEach(function(candidate){
    fetch_data(candidate, race);
  })
}

function banner(race, race_name){
  $("#banner").children().remove();

  var length = race.length;
  var width = ($(window).width()/length) - 40;

  race.forEach(function(candidate, i){
    var index = race.indexOf(candidate);

    var div = $("#banner").append("<div class='candidate " + candidate.substring(1)+ "' style='width: " + width + "'></div>");
    $("."+candidate.substring(1)+"").append("<div class='"+ candidate.substring(1) +"_img img'></div>")
    $("."+candidate.substring(1)+"_img").append("<img src='/static/"+ candidate.substring(1) +".jpg'>")
    $("."+candidate.substring(1)+"_img").append("<div class='color_banner' style='background-color:"+ colors[index] +"'>")


    $("."+candidate.substring(1)+"").append("<div class='"+candidate.substring(1)+"_text text_half'></div>")
    $("."+candidate.substring(1)+"_text").append("<text>"+race_name[i]+"</text>")
    $("."+candidate.substring(1)+"_text").append("<div class='stat_box'></div>")
    $("."+candidate.substring(1)+"_text").append("<span class='top_span'>Tweets & Photos</span>")
    $("."+candidate.substring(1)+"_text").append("<span class='bottom_span'>in the past hour</span>")
  })
}

function change_race(race, race_name){
  banner(race, race_name)
  update(race)
}

// JQuery for UI

$(document).ready(function () {
    $("#races").bind('change', function(d) {
        change_race(eval($(this).find('option:selected').attr("value")), eval($(this).find('option:selected').attr("value") + "_name"));
    });
});

// End JQuery for UI

banner(mayor_race, mayor_race_name);
// update(mayor_race);



