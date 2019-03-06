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
    overlay(map);////call overlay function to use it, add the fifth operator. Call here so everything else should be done.
};
////Create function to calculate the radius of proportional symbols to be called later
function calcCircleRadius(attValue) {
    var scaleFactor = 8;////Set scale factor to multiply data by. Here it's small because my data is in millions of USD, so most table values have five digits, some six. UPDATE: Changed table to billions, so the scale factor is a bit bigger
    var area = (attValue*scaleFactor);
    var radius = Math.sqrt(area/Math.PI);//use Math to calculate the radius based on scale and attribute value, then return value so it can be used later
    return radius;
};

function processData(data){////Function to process data for sequencing
    //empty array to hold attributes////array to hold the year values
    var attributes = [];

    //properties of the first feature in the dataset////set property variable to 0 so it can start at first feature, proceed from there
    var properties = data.features[0].properties;

    //push each attribute name into attributes array////add attributes to array, specify Amt so js knows to pull those values only
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Amt") > -1){
            attributes.push(attribute);
        };
    };
    return attributes;////return the attributes to fill the array
}
////REWORK START
////So originally, my code looked/was structured differently than the canvas examples. I was thinking if I kept it that way I could understand the logic a bit more.
////But towards the end it got too complicated for me to keep track and understand how to make it work, so I reworked it all from the canvas examples. I kept my old code down past the functional code for posterity or something.
//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //create marker options////Circle markers, define the color and size of the marks. Use this section of code to control the marks
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute////Pull the numbers from the geojson data
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value////Call the circle radius function defined above to determine the radius of the symbols
    options.radius = calcCircleRadius(attValue);

    //create circle marker layer////use circles instead of markers so they can make nice proportional symbols
    var circleMark = L.circleMarker(latlng, options);

    //build popup content string////Create informative text for popup, format it so it looks nice and readable
    var popupContent = "<p><b>Country:</b> " + feature.properties.Country + "</p>";
    var year = attribute.split("_")[1];////split the attribute by the underscore so it appears as someone would write it
    popupContent += "<p><b>Military Spending in " + year + ":</b> " + feature.properties[attribute] + " Billion USD</p>";////Note the change to Billion USD from the original Million
    //bind the popup to the circle marker////Give each circle its identifying information
    circleMark.bindPopup(popupContent, {
        offset: new L.Point(0, -calcCircleRadius(attValue)) ////offset the popup so it appears above the cirlce by passing the radius as a measurement, won't appear on the symbol
    });
    circleMark.on({////set the event listener for mousing over the proportional symbols
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){////open or close popup based on where the mouse is located
            this.closePopup();
        }
    });
    //return the circle marker to the L.geoJson pointToLayer option////Send the result back to make the symbols
    return circleMark;
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data////use ajax to simplify, load the data efficiently
    $.ajax("data/militarySpend.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
            createPropSymbols(response, map, attributes);////Call functions for making the proportional symbols and sequence bar
            createSequenceControls(map, attributes);////Most of the code branches from here, runs all the necessary functions/blocks, then sends it to the map at the end
        }
    });
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){////Create the proportional symbols with this function
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {////acquire data from geojson, then send it to point to layer function to get the data in format that we can manipulate on map
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};
        
function createSequenceControls(map,attributes){////Create the sequence bar slider, skip buttons. Add attributes keyword so it can be passed to the updatePropSymbols later
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');////Create panel, append slider to it so it can be visible on web page
    //set slider attributes
    $('.range-slider').attr({////attributes of slider bar, max of 7 from 0 because I have 8 years (2010-2017). Start at 0, move through data one unit at a time (step value of 1)
        max: 7,
        min: 0,
        value: 0,
        step: 1
     });
     
    $('#panel').append('<button class="skip" id="reverse">Previous</button>');//Add forward and reverse buttons to panel for additional attribute navigation
    $('#panel').append('<button class="skip" id="forward">Next</button>');
    //$('#reverse').html('<img src="img/reverse.png">'); ////Images weren't working for me, so commented them out. The clickable bounding boxes would resize, but the images themselves would not
    //$('#forward').html('<img src="img/forward.png">');
    //Step 5: click listener for buttons
    $('.skip').click(function(){////skip for button, range-slider for sequence bar
        //get the old index value
        var index = $('.range-slider').val();////set variable so it can be changed later

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;////if forward button clicked, increase index value by one, move range slider
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 7 ? 0 : index;////loop index value from last attribute (Amt_2017) to first attribute (Amt_2010)
        } else if ($(this).attr('id') == 'reverse'){
            index--;////Reverse button click will decrease index value by 1, move range slider
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 7 : index;////As before, reversed- loops from 0 to 7, Amt_2010 to Amt_2017
        };
        
        //Step 8: update slider
        $('.range-slider').val(index);////pass new index value to range slider so it updates correctly
        updatePropSymbols(map, attributes[index]);////Call function to change proportional symbols on map to appropriate values based on the attribute value
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){////similar to above, get input from direct manipulation of sequence bar
        //Step 6: get the new index value
        var index = $(this).val();
        updatePropSymbols(map, attributes[index]);////pass new index to function so it can use it to generate new proportional symbols
    });
};
function updatePropSymbols(map, attribute){////Function to update proportional symbols based on index attribute given just above
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){////If the layer feature has the attribute selected, function proceeds. Avoids bad/null values
            //access feature properties
            var props = layer.feature.properties;////set variable to be used next for calculation

            //update each feature's radius based on new attribute values
            var radius = calcCircleRadius(props[attribute]);////Call the circle radius function again to update the proportional symbols
            layer.setRadius(radius);////set the new radius for the layer

            //add city to popup content string
            var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";////create new popup info based on attribute. This section is the same, since only time is changing in my data, not country

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];////split Amt_201X so it looks nicer
            popupContent += "<p><b>Military Spending in " + year + ":</b> " + props[attribute] + " Billion USD</p>";////use new attribute to determine year, budget
            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)////bind new popup to the layer, set it to float above points nicely
            });
        }
    });
}

function overlay(map){////Create overlay function for fifth operator
    var US = L.marker([ 38.7586,-98.0759 ]).bindPopup("The United States has 6,450 nuclear warheads")////define each variable so we can combine them later
    var Russia = L.marker([ 61.9962,75.6874 ]).bindPopup("Russia has 6,850 nuclear warheads")
    var UK = L.marker([ 52.5788,-1.4835 ]).bindPopup("The United Kingdom has 215 nuclear warheads")////create marker with long/lat coordinates, popup information about nuclear warheads
    var China = L.marker([ 34.5925,103.7905 ]).bindPopup("China has 280 nuclear warheads")
    var France = L.marker([ 46.7358,2.6598 ]).bindPopup("France has 300 nuclear warheads")
    var Germany = L.marker([ 51.0643,9.927 ]).bindPopup("Germany has 20 US nuclear warheads")
    var India = L.marker([ 22.7515, 79.2198 ]).bindPopup("India has 140 nuclear warheads")
    var Israel = L.marker([ 31.0298,34.8071 ]).bindPopup("Israel has 80 nuclear warheads")
    var Pakistan = L.marker([ 29.018692, 68.336617 ]).bindPopup("Pakistan has 150 nuclear warheads")
    var NK = L.marker([ 39.642926, 126.592786 ]).bindPopup("North Korea has 20 nuclear warheads")
    var Belgium = L.marker([ 50.641905, 4.0 ]).bindPopup("Belgium has 20 US nuclear warheads")
    var Italy = L.marker([ 42.640176, 12.321944 ]).bindPopup("Italy has 90 US nuclear warheads")
    var Netherlands = L.marker([ 51.986475, 5.75 ]).bindPopup("The Netherlands has 22 US nuclear warheads")
    var Turkey = L.marker([ 38.617838, 35.060134 ]).bindPopup("Turkey has 70 US nuclear warheads")
 
    var nukes = L.layerGroup([US, Russia, UK, China, France, Germany, India, Israel, Pakistan, NK, Belgium, Italy, Netherlands, Turkey]);////create variable of all the just previously defined variables, pull them into a layer to be overlayed onto map
    var overlayMap = {"Nuclear Warheads": nukes};////Create variable to display on map & map controls. Give title to legend/overlay control, specify layer variable created above to be added to map
    L.control.layers(null,overlayMap).addTo(map);////Create controls for the overlay layer, add the controls and data to the map
};

 $(document).ready(createMap);////Call the functions to create the map, add it to the webpage/document
////REWORK END


/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*Don't reactivate this stuff
/*Just for posterity/reference for how bad it was

//function to retrieve the data and place it on the map
function getData(map){
    //load the data////use ajax to simplify, load the data efficiently
    $.ajax("data/militarySpend.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
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
                    var circleMark = L.circleMarker(latlng, geojsonMarkerOptions);
                    var popupContent = "<p><b>Country:</b> " + feature.properties.Country + "</p>";
                    var year = attribute.split("_")[1];
                    popupContent += "<p><b>Military Spending in " + year + ":</b> " + feature.properties[attribute] + " Billion USD</p>";
                    circleMark.bindPopup(popupContent, {
                        offset: new L.Point(0, -calcCircleRadius(attValue)) 
                    });
                    circleMark.on({
                        mouseover: function(){
                            this.openPopup();
                        },
                        mouseout: function(){
                            this.closePopup();
                        }
                    });
                    return circleMark;
                }
                
            }).addTo(map);
            createSequenceControls(map);
        }
    });
};
*/