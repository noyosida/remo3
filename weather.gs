function postForecast(){
  var url = "http://api.openweathermap.org/data/2.5/onecall?lat=34.98&lon=135.75&exclude=daily,current,minutely&" + PropertiesService.getScriptProperties().getProperty("ZIP_CODE") + "&APPID=" + PropertiesService.getScriptProperties().getProperty("WEATHER_API_KEY");
  var response = UrlFetchApp.fetch(url);
  var forecastData = JSON.parse(response);

  var tweet = "Today's forecast: \n"
  
  for( var i = 0; i < 12; i++) { 
    date = new Date(forecastData.hourly[i].dt * 1000)
    tweet += Utilities.formatDate(date,"JST", "ha: ")
    if('rain' in forecastData.hourly[i]){
      tweet += Utilities.formatString("%2.1f", forecastData.hourly[i].rain["1h"])
    }else{
      tweet += "0"
    }    
     
    tweet += Utilities.formatString("mm (%2.0f%)\n", forecastData.hourly[i].pop * 100)
  }

  postTweet(tweet)
}

function getWeatherData(){
  var url = "http://api.openweathermap.org/data/2.5/weather?zip=" + PropertiesService.getScriptProperties().getProperty("ZIP_CODE") + "&APPID=" + PropertiesService.getScriptProperties().getProperty("WEATHER_API_KEY");
  var response = UrlFetchApp.fetch(url);
  
  return JSON.parse(response);
}

function getWeatherEmoji(id){

  Logger.log(id);
  
  if(id == "01d"){
    return "☀️"
  }
  else if(id == "01n"){
    return "⭐️️"
  }
  else if(id.indexOf("03") || id.indexOf("04")){
    return "☁️"
  }
  else if(id.indexOf("50")){
    return "🌫"
  }  
  else if(id.indexOf("13")){
    return "⛄️"
  }  
  else if(id.indexOf("09") || id.indexOf("10")){
    return "☔️"
  }  
  else if(id.indexOf("11")){
    return "⛈"
  }
  else
    return ""; //OpenWeatherMap側に大幅な仕様変更がない限り，ここにはこない
}