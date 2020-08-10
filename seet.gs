function getSheet(name){
  var SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID")
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name)
}

function getLastData(name) {
  var datas = getSheet(name).getDataRange().getValues()　　//logシートをゲットする
  var data = datas[datas.length - 1]

  return {
    totalpoint:data[1],
    coupon:data[2],
    row:datas.length,
  }
}
