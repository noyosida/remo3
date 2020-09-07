function getSheet(name){
  
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() == name){
    console.log(sheet.getName());
    return sheet
  }else{
    const active = SpreadsheetApp.getActive(); 
    if (active){
      return active.getSheetByName(name);
    }else{
      Logger.log("new:", sheet.getName());
      const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID")  
      return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name)
    }
  }
}

function getLastData(name) {
  return getSheet(name).getDataRange().getValues().length;　
}
