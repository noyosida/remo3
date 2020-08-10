function postTweet(tweet){

  var twitterService = getService();
  
  if (twitterService.hasAccess()) {
    // 投稿
    var currentdate = new Date();
    var twMethod = { method:"POST" };
    var tweet = tweet + " - " + Utilities.formatDate(currentdate, "JST", "MMM d (E) h:mm a");
    twMethod.payload = { status: tweet };
    var response = twitterService.fetch("https://api.twitter.com/1.1/statuses/update.json", twMethod);
    
    Logger.log(response.getContentText());
    
  } else {
    Logger.log(service.getLastError());
  }
    
}  
  
// 認証用URL取得
function getOAuthURL() {
  Logger.log(getService().authorize());
}
 
// サービス取得
function getService() {
  return OAuth1.createService('Twitter')
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
      // 設定した認証情報をセット
      .setConsumerKey(PropertiesService.getScriptProperties().getProperty("CONSUMER_API_KEY"))
      .setConsumerSecret(PropertiesService.getScriptProperties().getProperty("CONSUMER_API_SECRET"))
      .setCallbackFunction('authCallback')
      // 認証情報をプロパティストアにセット（これにより認証解除するまで再認証が不要になる）
      .setPropertyStore(PropertiesService.getUserProperties());
}
 
//  認証成功時に呼び出される処理を定義
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('success!!');
  } else {
    return HtmlService.createHtmlOutput('failed');
  }    
}
