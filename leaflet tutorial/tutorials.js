//Create map logistics (view, div call). Set it as variable so it can be called/added to with other functions
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
//var mymap = L.map('mapid').setView([-100, 40], 13);
//Code in the actual basemap, what will be the basic map display. Make sure to have proper citations for credit. Add it to the variable created above
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap)
//Create a marker variable to point out a location of interest at a specified latitude and longitude
var marker = L.marker([51.5, -0.09]).addTo(mymap);
//Create circle variable to buffer around an area, essentially. Center it on a long/lat point, then size it approptiately, color it
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);
//Create polygon variable to bound an area, set points to define the corners/number of sides
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);
//create a popup info attached to the marker
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
//Create popup info attached to circle
circle.bindPopup("I am a circle.");
//Create popup info for polygon
polygon.bindPopup("I am a polygon.");
//creates a popup that loads whenever mappage is opened, layer is accessed
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);
//Function that creates a full screen alert, overlays entire page that displays coordinates of clicked location
    function onMapClick(e) {
        alert("You clicked the map at " + e.latlng);
    }
    //Enables clicks to work on map, for functions specified. Redundant, as code lower down accomplishes same task
    mymap.on('click', onMapClick);
//Creates popup again (since this is the same code as before, above, to display a different method of displaying same information of notice of click and long/lat)
    var popup = L.popup();
//function that brings up information that user has clicked a specific lat/long coordinate. Uses a popup instead of an alert to display info
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}
//As previously noted, slightly redundant code due to the two examples being about slightly different ways to accomplish the same task, code blocks
//Personally I would say remove the above line that ties onMapClick function to the map div data, but decided to keep both here just in case
mymap.on('click', onMapClick);


var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(mymap);

var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

L.geoJSON(myLines, {
    style: myStyle
}).addTo(mymap);

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJSON(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(mymap);

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(mymap);

var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(mymap);