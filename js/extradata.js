var myMap = L.map('map', {
    center: [36.16273,-86.7816],
    zoom: 13
})

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

var limit = 10000

url = "https://data.nashville.gov/OData.svc/3wb6-xy3j"
// `https://data.nashville.gov/resource/3wb6-xy3j.geojson`


d3.xml(url, (data) => {
  console.log(data)

  function xmlToJson(xml) {
    // Create the return object
    var obj = {};
  
    if (xml.nodeType == 1) {
      // element
      // do attributes
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType == 3) {
      // text
      obj = xml.nodeValue;
    }
  
    // do children
    // If all text nodes inside, get concatenated text from them.
    var textNodes = [].slice.call(xml.childNodes).filter(function(node) {
      return node.nodeType === 3;
    });
    if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
      obj = [].slice.call(xml.childNodes).reduce(function(text, node) {
        return text + node.nodeValue;
      }, "");
    } else if (xml.hasChildNodes()) {
      for (var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = item.nodeName;
        if (typeof obj[nodeName] == "undefined") {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof obj[nodeName].push == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  }


  wer= xmlToJson(data)

  console.log(wer)
// Date lookup: data.properties.date_issued (YYYY-MM-DDT00:00:00.000)

  // features = data.features
  // var arrHeat = []

  // features.forEach(feature => {
  //   if (feature.geometry !== null) {

  //     var lat = feature.geometry.coordinates[1]
  //     var lng = feature.geometry.coordinates[0]

  //     console.log(lat, lng)
  //     var location = [lat, lng]
      
  //     if (lat && lng) { arrHeat.push(location) }

  //     }
  // })

  // var mapHeat = L.heatLayer(arrHeat, {
  //     radius: 25,
  //     blur: 20,
  //     maxZoom: 15
      
  // }).addTo(myMap)



})