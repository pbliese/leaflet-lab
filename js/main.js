//main.js

//function to instantiate the Leaflet map
function createMap(){
    //create the map////Set map so that whole world can be viewed at the start
    var map = L.map('mapdiv', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer////OSM to ease use, avoid having to go through keys
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function////Main function of code, processes data and adds it to map
    getData(map);
};
////Create function to calculate the radius of proportional symbols to be called later
function calcCircleRadius(attValue) {
    var scaleFactor = .01;////Set scale factor to multiply data by. Here it's small because my data is in millions of USD, so most table values have five digits, some six
    var area = (attValue*scaleFactor);
    var radius = Math.sqrt(area/Math.PI);//use Math to calculate the radius based on scale and attribute value, then return value so it can be used later
    return radius;
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data////use ajax to simplify, load the data efficiently
    $.ajax("data/militarySpend.geojson", {
        dataType: "json",
        success: function(response){
            //create marker options////Circle markers, define the color and size of the marks. Use this section of code to control the marks
            var attribute = "Amt_2017"////Define whice column of data we are accessing for symbols
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
                    var attValue = Number(feature.properties[attribute]);////Get string from feature, then convert it to Number
                    geojsonMarkerOptions.radius = calcCircleRadius(attValue);////Alter the radius by calling the function from above, supply desired attribute as keyword
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        }
    });
};
$(document).ready(createMap);////Call the functions to create the map, add it to the webpage/document
