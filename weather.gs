const openWeatherMapURL = "http://api.openweathermap.org/data/2.5/"

function postForecast(){
  const forecastData = getHourlyForecastData();
  let tweet = ""
  
  for( var i = 1; i <= 12; i++) { 
    date = new Date(forecastData.hourly[i].dt * 1000)
    tweet += Utilities.formatDate(date,"JST", "ha: ") 
    + getWeatherEmoji(forecastData.hourly[i].weather[0].icon)

    if('rain' in forecastData.hourly[i]){
      tweet += Utilities.formatString("%.1f", forecastData.hourly[i].rain["1h"])
    }else{
      tweet += "0"
    }    
     
    tweet += Utilities.formatString("mm (%.0f%)\n", forecastData.hourly[i].pop * 100)
  }

  postTweet(tweet)
}

function getHourlyForecastData(){
  const url = openWeatherMapURL 
  + "onecall?lat=" 
  + PropertiesService.getScriptProperties().getProperty("LAT")
  + "&lon=" 
  + PropertiesService.getScriptProperties().getProperty("LON") 
  + "&exclude=daily,current,minutely&" 
  + "&APPID=" 
  + PropertiesService.getScriptProperties().getProperty("WEATHER_API_KEY");
  const response = UrlFetchApp.fetch(url);
  
  return JSON.parse(response);  
}

function getWeatherData(){
  const url = openWeatherMapURL 
  + "weather?zip=" 
  + PropertiesService.getScriptProperties().getProperty("ZIP_CODE") 
  + "&APPID="
  + PropertiesService.getScriptProperties().getProperty("WEATHER_API_KEY");
  const response = UrlFetchApp.fetch(url);
  
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