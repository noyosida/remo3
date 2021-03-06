function postMinutelyForecast(){
  const forecastData = getWeatherData('minutely');

  if (Array.isArray(forecastData.minutely) == false)
  {
    Logger.log(forecastData)
    return;
  }
  
  if (forecastData.minutely.length == 0){
    Logger.log(forecastData)
    return;
  }
     
  if (forecastData.minutely[0].precipitation >= 1.0){
    return;
  }
  
  let i = 1;  
  while(i < forecastData.minutely.length){
    if (forecastData.minutely[i].precipitation >= 1.0){
      break;
    }
    i++;
  }

  let tweet = ""
  
  for ( let j = 0; j < 12; j++){
    if(i == forecastData.minutely.length){
      break;
    }
    
    const date = new Date(forecastData.minutely[i].dt * 1000)

    if (j == 0){
      const current = new Date()
      const diff = Math.floor(date.getTime() / 1000 / 60) - Math.floor(current.getTime() / 1000 / 60)
      tweet += "It will rain in " +  Utilities.formatString("%d", diff) + " min.\n"
    }
    
    tweet += Utilities.formatDate(date, "JST", "h:mm a: ") 
    tweet += Utilities.formatString("%.1fmm\n", forecastData.minutely[i].precipitation)
    i++;
  }

  if(tweet){
    postTweet(tweet)
  }
}


function postHourlyForecast(){
  const forecastData = getWeatherData('hourly');
  let tweet = ""
  
  for( let i = 1; i <= 12; i++) { 
    let date = new Date(forecastData.hourly[i].dt * 1000)
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

  if(id == "01d"){
    return "☀️"
  }
  else if(id == "01n"){
    return "⭐️️"
  }
  else if(id.indexOf("02") != -1 || id.indexOf("03") != -1 || id.indexOf("04") != -1){
    return "☁️"
  }
  else if(id.indexOf("09") != -1 || id.indexOf("10") != -1){
    return "☔️"
  }  
  else if(id.indexOf("11") != -1){
    return "⛈"
  }
  else if(id.indexOf("13") != -1){
    return "⛄️"
  }  
  else if(id.indexOf("50") != -1){
    return "🌫"
  }  
  else
    return ""; //OpenWeatherMap側に大幅な仕様変更がない限り，ここにはこない
}