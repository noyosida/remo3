function doPost(data) {
  // パラメータ取り出し
  const CO2 = data.parameter.CO2;
  
  // パラメータがそろっていなければ終了
  if(co2){
    try{
      // スプレッドシート情報収集
      const sheet = getSheet('post')
          date = new Date();
      // スプレッドシートへ書き込み
      sheet.appendRow([date, CO2]); 
      
    }catch(e){
      console.log(e);
    }
  }
}

function getCO2Concentration(){
  const lastRow = getLastData('post');
  
  return getSheet('post').getRange(lastRow, 2).getValue(); 
}