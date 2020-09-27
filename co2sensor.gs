function doPost(data) {
  // パラメータ取り出し
  const CO2 = data.parameter.CO2;
  
  // パラメータがそろっていなければ終了
  if(CO2){
    try{
      // スプレッドシート情報収集
      const sheet = getSheet('post')
      // スプレッドシートへ書き込み
      sheet.appendRow([new Date(), CO2]);       
    }catch(e){
      console.log(e);
    }
  }
}

function getCO2Concentration(){
  const lastRow = getLastData('post');
  
  return getSheet('post').getRange(lastRow, 2).getValue(); 
}