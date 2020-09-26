function postTweet(tweet){

  const twitterService = getService();
  if (twitterService.hasAccess()) {
    // 投稿
    var tweet = tweet + " - " + Utilities.formatDate(new Date(), "JST", "MMM d (E) h:mm a");
    var sendOption = {
      'method':"POST", 
      'payload':{status: tweet}
    }
    twitterService.fetch("https://api.twitter.com/1.1/statuses/update.json", sendOption);   
  } else {
    Logger.log(twitterService.getLastError());
  }
}  

function postTweetWithImage(tweet, image){

  const twitterService = getService();
  if (twitterService.hasAccess()) {
     var imageOption = {
       'method':"POST",
       'payload':{'media_data':image}
     };
    var image_upload = JSON.parse(twitterService.fetch("https://upload.twitter.com/1.1/media/upload.json",imageOption));
    tweet = tweet + " - " + Utilities.formatDate(new Date(), "JST", "MMM d (E) h:mm a");
    var sendOption = {
      'method':"POST", 
      'payload':{status: tweet, 'media_ids':image_upload['media_id_string']}
    }
    twitterService.fetch("https://api.twitter.com/1.1/statuses/update.json", sendOption);
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
  const service = getService();
  const authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('success!!');
  } else {
    return HtmlService.createHtmlOutput('failed');
  }    
}
