function recordSensorData() {
  var devicedata = getNatureRemoData("devices");　　　　//data取得
  var lastData = getLastData("sensor");　　　　　//最終data取得

  postSensorData(
    {
      te:devicedata[0].newest_events.te.val,　　//温度
      hu:devicedata[0].newest_events.hu.val,　　//湿度
    },
    lastData.row
  );
  
  setSensorData(
      {
        te:devicedata[0].newest_events.te.val,　　//温度
        hu:devicedata[0].newest_events.hu.val,　　//湿度
        il:devicedata[0].newest_events.il.val,　　//照度
      },
    lastData.row + 1//最終data追加作業
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

function setSensorData(data, row) {  
  getSheet('sensor').getRange(row, 1, 1, 4).setValues([[new Date(), data.te, data.hu, data.il]])
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
 
  var tweet = Utilities.formatString("%2.1f", data.te);
  
  if (Math.round(data.te * 10) - Math.round(lastTe * 10) >= 1){
    tweet +=  Utilities.formatString("℃ (+%2.1f), ", data.te - lastTe)  
  }
  else if (Math.round(data.te * 10) - Math.round(lastTe * 10) <= -1){
    tweet += Utilities.formatString("℃ (%2.1f), ", data.te - lastTe) 
  }
  else{
    tweet += "℃, "
  }
  
  if (data.hu - lastHu >= 1){
    tweet += data.hu + Utilities.formatString("% (+%d)", data.hu - lastHu) 
  }
  else if (data.hu - lastHu <= -1){
    tweet += data.hu + Utilities.formatString("% (%d)", data.hu - lastHu)
  }
  else{
    tweet += data.hu + "%"
  }
  
  var range = getSheet('sensor').getRange(row-24, 1, 24, 3)  
  var chart = getSheet('sensor').newChart()
  .setChartType(Charts.ChartType.LINE) 
  .addRange(range)
  .setPosition(1,5,0,0)
  .setOption("series", {
    0: {targetAxisIndex:0, labelInLegend: "TEMP"}, // 第1系列は左のY軸を使用
    1: {targetAxisIndex:1, labelInLegend: "HUM"}, // 第2系列は右のY軸を使用 
  })
  .setOption("vAxes", {
    0: {title:'℃',viewWindow: {min:25}}, 
    1: {title:'%',viewWindow: {min:40}}, 
  })
  .build();
  
  var image64 = Utilities.base64Encode(chart.getBlob().getBytes())  
  var imageOption = {
    'method':"POST",
    'payload':{'media_data':image64}
  };
  /*
  /  media/uploadに画像をbase64にエンコードしてPOSTし
  /  statusesのin_replay_to_status_idパラメータに戻ってきたJSONのmedia_id_stringを指定する
  /
  */
  var twitterService = getService();
  if (twitterService.hasAccess()) {
  
    var image_upload = JSON.parse(twitterService.fetch("https://upload.twitter.com/1.1/media/upload.json",imageOption));
    tweet = tweet + " - " + Utilities.formatDate(new Date(), "JST", "MMM d (E) h:mm a");
    var sendOption = {
      'method':"POST", 
      'payload':{status: tweet, 'media_ids':image_upload['media_id_string']}
    }
    twitterService.fetch("https://api.twitter.com/1.1/statuses/update.json", sendOption);
  } else {
    Logger.log(service.getLastError());
  }
    
//  postTweet(tweet);
}

function postACStatus(ac){
  if(ac.settings.button == "power-off"){
    postTweet(toEnglish(ac.nickname) + " was turned off");      
  }else{
    postTweet(toEnglish(ac.nickname) + " is running at " + ac.settings.temp + "℃ in " + ac.settings.mode + " mode");
  }
}
