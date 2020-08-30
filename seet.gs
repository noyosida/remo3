function getSheet(name){
  var active = SpreadsheetApp.getActive();
  
  if (active){
    return active.getSheetByName(name);
  }else{
    Logger.log("new:", sheet.getName());
    var SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID")  
    return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name)
  }
}

function getLastData(name) {
  return getSheet(name).getDataRange().getValues().length;　
}
