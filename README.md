# 機能
Nature Remo APIを使って，センサ情報や家電の状態変化をGoogleスプレッドシートに記録し，ツィッターでつぶやく

# 注意
- https://api.nature.global/1/appliances から取得できる家電の情報は，0:ライト，1:ライト, 2:エアコン，3：ライト，4：エアコンの順になっているので，環境にあわせて適宜checkdApplianceStatus()関数およびsetApplianceStatus()関数を書き換える必要がある．
- 以下のプロパティをScript Editorから設定する必要がある．
  - SPREADSHEET_ID （スプレッドシート）
  - CONSUMER_API_SECRET (Twitter) 
  - CONSUMER_API_KEY (Twitter) 
  - REMO_ACCESS_TOKEN (REMO) 
 
# 謝辞
Nature Remo APIとの連携およびGoogleスプレッドシートやGoogle Studioとの連携部分については，以下のサイトのコードを利用させていただきました．
https://qiita.com/t-chi/items/01b9a9b98fbccef880c3
