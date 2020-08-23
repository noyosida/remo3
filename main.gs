function recordSensorData() {
  var deviceData = getNatureRemoData("devices");　　　　//data取得
  var lastSensorData = getLastData("sensor");　　　　　//最終data取得
  var weatherData = getWeatherData();　　　　//data取得

  postSensorData(
    {
      te:deviceData[0].newest_events.te.val,　　//温度
      hu:deviceData[0].newest_events.hu.val,　　//湿度
      ote:(weatherData.main.temp-273.15),　　
      ohu:weatherData.main.humidity,　　
      opr:weatherData.main.pressure,
    },
    lastSensorData.row
  );
  
  
  setSensorData(
      {
        te:deviceData[0].newest_events.te.val,　　//温度
        hu:deviceData[0].newest_events.hu.val,　　//湿度
        il:deviceData[0].newest_events.il.val,　　//照度
        ote:(weatherData.main.temp-273.15),　　
        ohu:weatherData.main.humidity,　　
        opr:weatherData.main.pressure,　
      },
    lastSensorData.row + 1//最終data追加作業
  );
}

function checkdApplianceStatus() {
  var appliancedata = getNatureRemoData("appliances");　　　　//data取得
  var lastData = getLastData('status');　　　　　//最終data取得
    
  setApplianceStatus(
    appliancedata,
    lastData.row + 1//最終data追加作業
  );
}

function getNatureRemoData(endpoint) {　　　　　　//Remoのapiをお借りします
  var headers = {
    "Content-Type" : "application/json;",
    'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty("REMO_ACCESS_TOKEN"),
  };

  var options = {
    "method" : "get",
    "headers" : headers,
  };

  return  JSON.parse(UrlFetchApp.fetch("https://api.nature.global/1/" + endpoint, options));
}

function getWeatherData(){
  var url = "http://api.openweathermap.org/data/2.5/weather?zip=" + PropertiesService.getScriptProperties().getProperty("ZIP_CODE") + "&APPID=" + PropertiesService.getScriptProperties().getProperty("WEATHER_API_KEY");
  var response = UrlFetchApp.fetch(url);
  
  return JSON.parse(response);
}

function setSensorData(data, row) {  
  getSheet('sensor').getRange(row, 1, 1, 7).setValues([[new Date(), data.te, data.hu, data.il, data.ote, data.ohu, data.opr]])
}

function setApplianceStatus(data, row) {
  var numAC = 0;
  var numLight = 0;
  var changed = false;
  var newStatus = [];
  
  data.forEach(function(appliance) {
    if (appliance.type == "AC"){
      if (Number(appliance.settings.temp) != getSheet('status').getRange(row - 1, 2 + numAC * 3).getValue()
        || appliance.settings.mode !=  getSheet('status').getRange(row - 1, 2 + numAC * 3 + 1) .getValue()
        || appliance.settings.button !=  getSheet('status').getRange(row - 1, 2 + numAC * 3 + 2) .getValue()){
          postACStatus(appliance)
          changed = true;
        }
      newStatus.push(Number(appliance.settings.temp));
      newStatus.push(appliance.settings.mode);
      newStatus.push(appliance.settings.button);
      numAC++;
    }      
  });

  data.forEach(function(appliance) {
    if (appliance.type == "LIGHT"){
      if (appliance.light.state.power != getSheet('status').getRange(row - 1, 2 + numAC * 3 + numLight).getValue()){
        postTweet(toEnglish(appliance.nickname) + " was turned " +  appliance.light.state.power);      
        changed = true;
        }
      
      newStatus.push(appliance.light.state.power);
      numLight++;
    }      
  });

  if (changed){
    getSheet('status').getRange(row, 1).setValue(new Date())//Aにゲットした日時ほりこむ
    getSheet('status').getRange(row, 2, 1, 9).setValues([newStatus])　　
  }
}
 
function postSensorData(data, row){
  lastTe = getSheet('sensor').getRange(row, 2).getValue();
  lastHu = getSheet('sensor').getRange(row, 3).getValue();
  lastOte = getSheet('sensor').getRange(row, 5).getValue();
  lastOhu = getSheet('sensor').getRange(row, 6).getValue();
  lastOpr = getSheet('sensor').getRange(row, 7).getValue();
 
  var tweet = "🏠" + generateTEMPString (lastTe, data.te) + ', ' + generateHUMString (lastHu, data.hu) + "\n"
  
  tweet += "⛺" + generateTEMPString (lastOte, data.ote) + ', ' + generateHUMString (lastOhu, data.ohu) + ", "

  if (data.opr - lastOpr >= 1 || data.opr - lastOpr <= -1){
    tweet += data.opr + Utilities.formatString("hPa (%+d)", data.opr - lastOpr) 
  }else{
    tweet += data.opr + "hPa"
  }
  tweet += "\n"  
  
  var range = getSheet('sensor').getRange(row-24, 1, 24, 3) 
  var chart = getTEMPandHUMChart(range);
  var encodedImage = Utilities.base64Encode(chart.getBlob().getBytes())  
  
  postTweetWithImage(tweet, encodedImage)
}

function generateTEMPString (last, current){
  var string = Utilities.formatString("%2.1f℃", current)
  
  if (Math.round(current * 10) - Math.round(last * 10) >= 1 
  || Math.round(current * 10) - Math.round(last * 10) <= -1){
    string +=  Utilities.formatString(" (%+2.1f)", (Math.round(current * 10) - Math.round(last * 10))/10)  
  }
  
  return string;
}

function generateHUMString (last, current){
  if (current - last >= 1 || current - last <= -1){
    return current + Utilities.formatString("% (%+d)", current - last) 
  }else{
    return current + "%"
  }
}

function getTEMPandHUMChart(range){
  var chart = getSheet('sensor').newChart()
  .setChartType(Charts.ChartType.LINE) 
  .addRange(range)
  .setOption("series", {
    0: {targetAxisIndex:0, labelInLegend: "TEMP", color: 'red'}, // 第1系列は左のY軸を使用
    1: {targetAxisIndex:1, labelInLegend: "HUM", color: 'blue'}, // 第2系列は右のY軸を使用 
  })
  .setOption("vAxes", {
    0: {title:'℃'}, 
    1: {title:'%'}, 
  })
  .build();

  return chart;
}

function postACStatus(ac){
  if(ac.settings.button == "power-off"){
    postTweet(toEnglish(ac.nickname) + " was turned off");      
  }else{
    postTweet(toEnglish(ac.nickname) + " is running at " + ac.settings.temp + "℃ in " + ac.settings.mode + " mode");
  }
}
