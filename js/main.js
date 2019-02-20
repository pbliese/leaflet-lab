//main.js

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapdiv', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};
//function to retrieve the data and place it on the map
function getData(map){
    //load the data////use ajax to simplify, load the data efficiently
    $.ajax("data/militarySpend.geojson", {
        dataType: "json",
        success: function(response){
            //create marker options////Circle markers, define the color and size of the marks. Use this section of code to control the marks
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //create a Leaflet GeoJSON layer and add it to the map////Use response from ajax to loop for each mega city
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        }
    });
};
$(document).ready(createMap);////Call the functions to create the map, add it to the webpage/document
