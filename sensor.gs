function recordSensorData() {
  var deviceData = getNatureRemoData("devices");　　　　//data取得
  var lastSensorData = getLastData("sensor");　　　　　//最終data取得
  var weatherData = getWeatherData();　　　　//data取得
  const absoluteZero = -273.15
  
  var arg = {
    te:deviceData[0].newest_events.te.val,　　//温度
    hu:deviceData[0].newest_events.hu.val,　　//湿度
    il:deviceData[0].newest_events.il.val,　　//照度
    ote:(weatherData.main.temp + absoluteZero),　　
    ohu:weatherData.main.humidity,　　
    opr:weatherData.main.pressure,
    icon:weatherData.weather[0].icon,
    desc:weatherData.weather[0].description,
  }
  
  if('rain' in weatherData){
    arg["rain"] = weatherData.rain["1h"];
  }
      
  setSensorData(arg, lastSensorData + 1);
  postSensorData(arg, lastSensorData + 1);
}

function setSensorData(data, row) {  
  getSheet('sensor').getRange(row, 1, 1, 8).setValues([[new Date(), data.te, data.hu, data.il, data.ote, data.ohu, data.opr, data.rain]])
}

function postSensorData(data, row){
  var lastTe = getSheet('sensor').getRange(row - 1, 2).getValue();
  var lastHu = getSheet('sensor').getRange(row - 1, 3).getValue();
  var lastOte = getSheet('sensor').getRange(row - 1, 5).getValue();
  var lastOhu = getSheet('sensor').getRange(row - 1, 6).getValue();
  var lastOpr = getSheet('sensor').getRange(row - 1, 7).getValue();

  var lastRain = 0;
  if (!getSheet('sensor').getRange(row -1 , 8).isBlank()){
    lastRain = getSheet('sensor').getRange(row - 1 , 8).getValue();
  }
  
  var tweet = "🏠" 
  + generateFloatingPointValueString (lastTe, data.te, "℃") + ', ' 
  + generateIntegerValueString (lastHu, data.hu, "%") + "\n"
  + "⛺" + generateFloatingPointValueString (lastOte, data.ote, "℃") + ', ' 
  + generateIntegerValueString (lastOhu, data.ohu, "%") + ", " 
  + generateIntegerValueString (lastOpr, data.opr, "hPa") 
  
  if ('rain' in data){
    tweet += ", "  + generateFloatingPointValueString (lastRain, data.rain, "mm") 
  }
  
  tweet += "\n" + getWeatherEmoji(data.icon) + data.desc + "\n"  
  
  var range = getSheet('sensor').getRange(row-23, 1, 24, 3) 
  var chart = getTEMPandHUMChart(range);
  var encodedImage = Utilities.base64Encode(chart.getBlob().getBytes())  
  postTweetWithImage(tweet, encodedImage)
}

function generateFloatingPointValueString (last, current, unit){
  var string = Utilities.formatString("%2.1f%s", current, unit)
  
  if (Math.round(current * 10) - Math.round(last * 10) >= 1 
  || Math.round(current * 10) - Math.round(last * 10) <= -1){
    string +=  Utilities.formatString(" (%+2.1f)", (Math.round(current * 10) - Math.round(last * 10))/10)  
  }
  
  return string;
}

function generateIntegerValueString (last, current, unit){
  if (current - last >= 1 || current - last <= -1){
    return current + Utilities.formatString("%s (%+d)", unit, current - last) 
  }else{
    return current + unit
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