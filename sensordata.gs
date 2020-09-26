function recordSensorData() {
  const deviceData = getNatureRemoData("devices");　　　　//data取得
  const lastSensorData = getLastData("sensor");　　　　　//最終data取得
  const weatherData = getWeatherData('current');　　　　//data取得
  const absoluteZero = -273.15
  
  var arg = {
    te:deviceData[0].newest_events.te.val,　　//温度
    hu:deviceData[0].newest_events.hu.val,　　//湿度
    il:deviceData[0].newest_events.il.val,　　//照度
    ote:(weatherData.current.temp + absoluteZero),　　
    ohu:weatherData.current.humidity,　　
    opr:weatherData.current.pressure,
    icon:weatherData.current.weather[0].icon,
    desc:weatherData.current.weather[0].description,
    CO2:getCO2Concentration(),
  }
  
  if('rain' in weatherData.current){
    if (weatherData.current.rain["1h"]){
      arg["rain"] = weatherData.current.rain["1h"];
    }
  }
  
  setSensorData(arg, lastSensorData + 1);
  postSensorData(arg, lastSensorData + 1);
}

function setSensorData(data, row) {  
  getSheet('sensor').getRange(row, 1, 1, 9).setValues([[new Date(), data.te, data.hu, data.il, data.ote, data.ohu, data.opr, data.rain, data.CO2]])
}

function postSensorData(data, row){
  const lastTe = getSheet('sensor').getRange(row - 1, 2).getValue();
  const lastHu = getSheet('sensor').getRange(row - 1, 3).getValue();
  const lastOte = getSheet('sensor').getRange(row - 1, 5).getValue();
  const lastOhu = getSheet('sensor').getRange(row - 1, 6).getValue();
  const lastOpr = getSheet('sensor').getRange(row - 1, 7).getValue();
  
  let lastRain = 0;
  if (!getSheet('sensor').getRange(row -1 , 8).isBlank()){
    lastRain = getSheet('sensor').getRange(row - 1 , 8).getValue();
  }

  const lastCO2 = getSheet('sensor').getRange(row - 1, 9).getValue();

  
  let tweet = "🏠" 
  + generateFloatingPointValueString (lastTe, data.te, "℃") + ', ' 
  + generateIntegerValueString (lastHu, data.hu, "%") + "\n"
  + "⛺" + generateFloatingPointValueString (lastOte, data.ote, "℃") + ', ' 
  + generateIntegerValueString (lastOhu, data.ohu, "%") + ", " 
  + generateIntegerValueString (lastOpr, data.opr, "hPa") + ", "
  + generateIntegerValueString (lastCO2, data.CO2, "ppm") + ", "
  
  
  if ('rain' in data){
    tweet += ", "  + generateFloatingPointValueString (lastRain, data.rain, "mm") 
  }
  
  tweet += "\n" + getWeatherEmoji(data.icon) + data.desc + "\n"  
  
  const range = getSheet('sensor').getRange(row-23, 1, 24, 3) 
  const chart = getTEMPandHUMChart(range);
  const encodedImage = Utilities.base64Encode(chart.getBlob().getBytes())  
  postTweetWithImage(tweet, encodedImage)
}

function generateFloatingPointValueString (last, current, unit){
  let string = Utilities.formatString("%2.1f%s", current, unit)
  
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
  return getSheet('sensor').newChart()
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
}