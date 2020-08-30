function checkdApplianceStatus() {
  const appliancedata = getNatureRemoData("appliances");　　　　//data取得
  const lastData = getLastData('status');　　　　　//最終data取得
    
  setApplianceStatus(
    appliancedata,
    lastData + 1//最終data追加作業
  );
}

function setApplianceStatus(data, row) {
  let numAC = 0;
  let numLight = 0;
  let changed = false;
  let newStatus = [];
  
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


function postACStatus(ac){
  if(ac.settings.button == "power-off"){
    postTweet(toEnglish(ac.nickname) + " was turned off");      
  }else{
    postTweet(toEnglish(ac.nickname) + " is running at " + ac.settings.temp + "℃ in " + ac.settings.mode + " mode");
  }
}
