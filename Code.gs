function recordSensorData() {
  var devicedata = getNatureRemoData("devices");　　　　//data取得
  var lastData = getLastData("sensor");　　　　　//最終data取得
  
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
    [
      Number(appliancedata[2].settings.temp),　　//リビングエアコンの温度設定
      appliancedata[2].settings.mode,　　//リビングエアコンのモード設定
      appliancedata[2].settings.button,　　//リビングエアコンのボタン
    ],[
      Number(appliancedata[4].settings.temp),　　//寝室エアコンの温度設定
      appliancedata[4].settings.mode,　　//寝室エアコンのモード設定
      appliancedata[4].settings.button,　　//寝室エアコンのボタン
    ],
      appliancedata[0].light.state.power,　　//キッチンの電灯の状態
      appliancedata[1].light.state.power,　　//リビングの電灯の状態
      appliancedata[3].light.state.power,　　//寝室の電灯の状態
      lastData.row + 1//最終data追加作業
  );
}

function getNatureRemoData(endpoint) {　　　　　　//Remoのapiをお借りします
  var url = "https://api.nature.global/1/" + endpoint;

  var headers = {
    "Content-Type" : "application/json;",
    'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty("REMO_ACCESS_TOKEN"),
  };

  var options = {
    "method" : "get",
    "headers" : headers,
  };

  return  JSON.parse(UrlFetchApp.fetch(url, options));
}



function setSensorData(data, row) {
  getSheet('sensor').getRange(row, 1, 1, 4).setValues([[new Date(), data.te, data.hu, data.il]])
  postTweet(Utilities.formatString("%2.1f", data.te) + "℃, " + Math.floor(data.hu) + "%");
}

function setApplianceStatus(livingData, bedData, kitchenLight, livingLight, bedLight, row) {
  var lastLivingData = JSON.stringify(getSheet('status').getRange(row-1, 2, 1, 3).getValues());
  var currentLivingData = JSON.stringify([livingData]);

  if (lastLivingData != currentLivingData)
    postACStatus(livingData, "living room");

  var lastBedData = JSON.stringify(getSheet('status').getRange(row-1, 5, 1, 3).getValues());
  var currentBedData = JSON.stringify([bedData]);

  if (lastBedData != currentBedData)
    postACStatus(bedData, "bedroom");

  var lastKitchenLight = getSheet('status').getRange(row-1, 8).getValue();
  if (lastKitchenLight != kitchenLight)
      postTweet("Light in the kitchen was turned " +  kitchenLight);      

  var lastLivingLight = getSheet('status').getRange(row-1, 9).getValue();　　
  if (lastLivingLight != livingLight)
      postTweet("Light in the living room was turned " +  livingLight);      

  var lastBedLight = getSheet('status').getRange(row-1, 10).getValue();　
  if (lastBedLight != bedLight)
      postTweet("Light in the bedroom was turned " +  bedLight);      
    
  if (lastLivingData != currentLivingData || lastBedData != currentBedData || 
      lastKitchenLight != kitchenLight || lastLivingLight != livingLight || lastBedLight != bedLight){
      getSheet('status').getRange(row, 1).setValue(new Date())//Aにゲットした日時ほりこむ
      getSheet('status').getRange(row, 2, 1, 3).setValues([livingData])　　
      getSheet('status').getRange(row, 5, 1, 3).setValues([bedData])　　
      getSheet('status').getRange(row, 8, 1, 3).setValues([[kitchenLight, livingLight, bedLight]])　　
  }
}
  
function postACStatus(sensorData, roomName){
  if(sensorData[2] == "power-off"){
    postTweet("AC in the " + roomName + " was turned off");      
  }else{
    postTweet("AC in the " + roomName + " is running at " + sensorData[0] + "℃ in " + sensorData[1] + " mode");
  }
}
  
  
