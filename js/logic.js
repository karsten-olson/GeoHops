// GeoHops
// Creation Date: 2020-03-24
// Authors: Drew McKinney, Nick Riff, Jon Disarufino, Karsten Olson


// DEVELOPER TOOLS
var limit = 10000
var url = `https://data.nashville.gov/resource/3wb6-xy3j.geojson?$limit=${limit}`

_KEYA = "pk.eyJ1IjoiYXJtY2siLCJhIjoiY2s3cnA4emV1M"

//////////////////////
//    Functions     //
//////////////////////

// Filtering Dataset based on Event Listener Dates
function filterDate(features, startDate, endDate) {
  var features = features
  var filteredFeatures = []
  var startDate = Date.parse(startDate)
  var endDate = Date.parse(endDate)

  features.forEach( (feature) => {

    var issuedDate = Date.parse(String(feature.properties.date_issued).split("T")[0])

    if (issuedDate) {
      if (issuedDate >= startDate && issuedDate <= endDate) {filteredFeatures.push(feature)}
    }
  })

  return filteredFeatures

}

// Field Count for different fields in feature set
function fieldCount(features, field) {
  featureCount = {}
  features.forEach( feature => {
    type = feature.properties[field]
    featureCount[type] = (featureCount[type]) ? featureCount[type] + 1 : 1
  })
  return featureCount
}

// Year Count for different years in feature set
function yearCount(features, field) {
  featureCount = {}

  features.forEach( feature => {
    if (feature.properties[field]) {
    type = feature.properties[field].split("-")[0]
    featureCount[type] = (featureCount[type]) ? featureCount[type] + 1 : 1
    }
  })
  return featureCount
}



//////////////////////
//    D3 OBJECTS    //
//////////////////////
var buttonFilter = d3.select('#filter-btn')
var startDateFilter = d3.select('#startdate')
var endDateFilter = d3.select('#enddate')
var totalViewed = d3.select('#totalviewed')

// Defining myMap Object
var myMap = L.map('map', {
    center: [36.16273,-86.7816],
    zoom: 13
})

_KEYB = "DV0bjNlbzV5MHV2ZzQzNyJ9.kMQ-hRjKZQof9z4eniqWwA"

// Generating Map from MapBox for myMap
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: _KEYA + _KEYB
}).addTo(myMap);


// Initiailization of Webpage
function init() {

  // Requesting geojson API call
  d3.json(url, (data) => {
    console.log(data)

    var features = data.features
    var filteredFeatures = features

    // Outputting total filtered viewed value to HTML
    totalViewed.text(String(filteredFeatures.length))

    //////////////////////
    //     HEAT MAP     //
    //////////////////////

    var arrHeat = []

    // Creating Location Array for Heat Map
    filteredFeatures.forEach(feature => {
      if (feature.geometry !== null) {

        var lat = feature.geometry.coordinates[1]
        var lng = feature.geometry.coordinates[0]
        var location = [lat, lng]
        
        if (lat && lng) { arrHeat.push(location) }
        }
    })

    console.log("Heat Map Data Count: " + arrHeat.length)

    // Plotting Heatmap
    var mapHeat = L.heatLayer(arrHeat, {
      radius: 25,
      blur: 20,
      maxZoom: 15
    }).addTo(myMap)



    //////////////////////
    //     Bar Chart    //
    //////////////////////
      
    // Grabbing bar plot data
      var yearCounts = yearCount(filteredFeatures, 'date_issued')
      var yearLabels = Object.keys(yearCounts)
      var yearValue = Object.values(yearCounts)
    
      //  Create the Traces
      var traceBar = {
        x: yearLabels,
        y: yearValue,
        type: "bar",
      }
    
      // Create the data array for the plot
      var dataBar = [traceBar]
    
      // Define the plot layout
      var layoutBar = {
        title: "Number Of Beer Permits",
        xaxis: { title: "Date" },
        yaxis: { title: "Number of Permits" }
      }
    
      // Plot the chart to a div tag with id "plot"
      Plotly.newPlot("plot", dataBar, layoutBar)



    //////////////////////
    //     Pie Chart    //
    //////////////////////

    // Values for pie chart
    pieValues = fieldCount(filteredFeatures, "permit_subtype")

    // Creating data trace for pie chart
    var tracePie = {
        labels: Object.keys(pieValues),
        values: Object.values(pieValues),
        type: 'pie',
        textinfo: "label+percent",
        insidetextorientation: "radial"
    }
    
    var dataPie = [tracePie]
    
    // creating layout for pie chart
    var layoutPie = {
      title: "Liquor Licence By Permit Type",
    }
    
    // Plotting pie chart
    Plotly.newPlot("pie", dataPie, layoutPie)
    
  })

}


// Update Visuals on Date Filtering
buttonFilter.on('click', function() {

  var startDate = startDateFilter.property('value')
  var endDate = endDateFilter.property('value')

  d3.json(url, (data) => {

    var features = data.features
    var filteredFeatures = filterDate(features, startDate, endDate)
    
    // Outputting total filtered viewed value to HTML
    totalViewed.text(String(filteredFeatures.length))
  
    //////////////////////
    //     HEAT MAP     //
    //////////////////////
  
    var arrHeat = []

    // Clearing all map layers except MapBox layer
    myMap.eachLayer(layer => { (layer._url) ? null : myMap.removeLayer(layer)} )

    // Creating Location Array for Heat Map
    filteredFeatures.forEach(feature => {
      if (feature.geometry !== null) {
  
        var lat = feature.geometry.coordinates[1]
        var lng = feature.geometry.coordinates[0]
        var location = [lat, lng]
        
        if (lat && lng) { arrHeat.push(location) }
        }
    })
  
    console.log("Heat Map Data Count: " + arrHeat.length)
  
    // Plotting Heatmap
    var mapHeat = L.heatLayer(arrHeat, {
      radius: 25,
      blur: 20,
      maxZoom: 15
    }).addTo(myMap)



  //////////////////////
  //     Bar Chart    //
  //////////////////////
    
    // Grabbing updated bar plot data
    yearCounts = yearCount(filteredFeatures, 'date_issued')
    yearLabels = Object.keys(yearCounts)
    yearValue = Object.values(yearCounts)
  
    //  Create the Traces
    var trace1 = {
      x: yearLabels,
      y: yearValue,
      type: "bar",
    };
  
    // Create the data array for the plot
    var data = [trace1];
  
    // Define the plot layout
    var layout = {
      title: "Number Of Beer Permits",
      xaxis: { title: "Date" },
      yaxis: { title: "Number of Permits" }
    };
  
    // Plot the chart to a div tag with id "plot"
    Plotly.newPlot("plot", data, layout);



  //////////////////////
  //     Pie Chart    //
  //////////////////////

  // Grabbing updated pie chart values
  newPieValues = fieldCount(filteredFeatures, "permit_subtype")
  
  // Creating data trace for pie chart
  var tracePie = {
    labels: Object.keys(newPieValues),
    values: Object.values(newPieValues),
    type: 'pie',
    textinfo: "label+percent",
    insidetextorientation: "radial"
  }

  var data = [tracePie]

  // Creating layout for pie chart
  var layout = {
    title: "Liquor Licence By Permit Type",
  }

  // Updating pie chart
  Plotly.newPlot("pie", data, layout);

  })

})



init()