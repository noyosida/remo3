function getNatureRemoData(endpoint) {　　　　　　//Remoのapiをお借りします
  const headers = {
    "Content-Type" : "application/json;",
    'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty("REMO_ACCESS_TOKEN"),
  };

  const options = {
    "method" : "get",
    "headers" : headers,
  };

  return JSON.parse(UrlFetchApp.fetch("https://api.nature.global/1/" + endpoint, options));
}