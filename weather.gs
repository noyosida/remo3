function postHourlyForecast(){
  const forecastData = getWeatherData('hourly');
  let tweet = ""
  
  for( var i = 1; i <= 12; i++) { 
    date = new Date(forecastData.hourly[i].dt * 1000)
    tweet += Utilities.formatDate(date, "JST", "ha: ") 
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

function postDailyForecast(){
  const forecastData = getWeatherData('daily');
  let tweet = ""
  
  for( var i = 1; i <= 7; i++) { 
    date = new Date(forecastData.daily[i].dt * 1000)
    tweet += Utilities.formatDate(date, "JST", "MMM dd (E): ") 
    + getWeatherEmoji(forecastData.daily[i].weather[0].icon)

    if('rain' in forecastData.daily[i]){
      tweet += Utilities.formatString("%.1f", forecastData.daily[i].rain)
    }else{
      tweet += "0"
    }    
     
    tweet += Utilities.formatString("mm (%.0f%)\n", forecastData.daily[i].pop * 100)
  }

  postTweet(tweet)
}

function getWeatherData(type){
  let url = "http://api.openweathermap.org/data/2.5/onecall?lat=" 
  + PropertiesService.getScriptProperties().getProperty("LAT")
  + "&lon=" 
  + PropertiesService.getScriptProperties().getProperty("LON") 

  switch(type){
    case 'daily':
      url += "&exclude=hourly,current,minutely&" 
      break;
    case 'hourly':
      url += "&exclude=daily,current,minutely&" 
      break;
    case 'current':
      url += "&exclude=daily,hourly,minutely&" 
      break;
  }
  
  url += "&APPID=" + PropertiesService.getScriptProperties().getProperty("WEATHER_API_KEY");
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