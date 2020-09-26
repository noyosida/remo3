# 機能
- Nature Remo APIを使って，センサ情報や家電の状態変化をGoogleスプレッドシートに記録し，ツィッターでつぶやく
- OpenWeatherMapを使って，現在の気候や天気予報をツィッターでつぶやく
- CO2センサが計測したデータをHTTP POSTで受け取り，ツィッターでつぶやく

# 注意
- 家電はエアコンとライトのみ
- 以下のプロパティをScript Editorから設定する必要がある．
  - SPREADSHEET_ID （スプレッドシート）
  - CONSUMER_API_SECRET (Twitter) 
  - CONSUMER_API_KEY (Twitter) 
  - REMO_ACCESS_TOKEN (REMO) 
  - WEATHER_API_KEY (OpenWeatherMap)
  - ZIP_CODE (OpenWeatherMap)
  - LON (OpenWeatherMap) ※経度
  - LAT (OpenWeatherMap) ※緯度
 - co2sensor.gsのdoPost()は，WebAppとして公開する．
 - CO2センサの情報をHTTP POSTでGoogleスプレッドシートに追加するArduinoのコードはこちら　https://github.com/noyosida/POSTCO2byMH-Z19
 
# 謝辞
Nature Remo APIとの連携およびGoogleスプレッドシートの連携部分については，以下のサイトのコードを利用させていただきました．
https://qiita.com/t-chi/items/01b9a9b98fbccef880c3

HTTP POSTからのGoogleスプレッドシートへの書き込み部分は，以下のサイトのコードを利用させていただきました．
http://soiyadakara.hatenablog.com/entry/2018/10/31/233424
