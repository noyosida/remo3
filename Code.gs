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
    appliancedata,
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

function setApplianceStatus(data, row) {
  
  var numAC = 0;
  var numLight = 0;
  var changed = false;
  var newStatus = [];
  
  data.forEach(function(appliance) {
    if (appliance.type == "AC"){
      if (Number(appliance.settings.temp) != getSheet('status').getRange(row-1, 2 + numAC * 3).getValue()
        || appliance.settings.mode !=  getSheet('status').getRange(row-1, 2 + numAC * 3 + 1) .getValue()
        || appliance.settings.button !=  getSheet('status').getRange(row-1, 2 + numAC * 3 + 2) .getValue()){
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
      if (appliance.light.state.power != getSheet('status').getRange(row-1, 2 + numAC * 3 + numLight).getValue()){
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
  
function postACStatus(ac){
  if(ac.settings.button == "power-off"){
    postTweet(toEnglish(ac.nickname) + " was turned off");      
  }else{
    postTweet(toEnglish(ac.nickname) + " is running at " + ac.settings.temp + "℃ in " + ac.settings.mode + " mode");
  }
}
