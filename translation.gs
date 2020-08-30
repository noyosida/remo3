const translationMap = new Map([["寝室照明", "Light in the bedroom"], 
                     ["キッチン照明", "Light in the kitchen"], 
                     ["リビング照明", "Light in the living room"],
                     ["寝室エアコン", "AC in the bedroom"],
                     ["リビングエアコン", "AC in the living room"],
                    ]);  

                                
function toEnglish(nickname){
  const translation = translationMap.get(nickname);
  if (!translation){
    return nickname;
  }
  else{
    return translation;
  }
}
                                
