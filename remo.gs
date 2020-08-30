function getNatureRemoData(endpoint) {　　　　　　//Remoのapiをお借りします
  var headers = {
    "Content-Type" : "application/json;",
    'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty("REMO_ACCESS_TOKEN"),
  };

  var options = {
    "method" : "get",
    "headers" : headers,
  };

  return JSON.parse(UrlFetchApp.fetch("https://api.nature.global/1/" + endpoint, options));
}