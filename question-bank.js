/*
 * ExamMate 五科原創題庫 v2
 * 題型參考國中教育會考官方歷屆試題的生活情境、資料判讀與素養導向，
 * 但題幹、數字、素材、選項與解析均重新設計，不直接改寫歷屆題目。
 */
window.examMateQuestionBank = {
  chinese: {
    id: "chinese", name: "國文", glyph: "文", theme: "chinese",
    description: "字詞、語文常識與文本統整",
    units: [
      { id: "ch-phon", name: "字音", review: ["先判斷詞義，再決定多音字讀音", "留意成語中的特殊讀音", "形近字要連同詞語一起記"] },
      { id: "ch-form", name: "字形", review: ["同音字要回到語意判斷", "固定成語不可只靠讀音猜字", "檢查時逐詞核對，不只看句子通順"] },
      { id: "ch-idiom", name: "成語", review: ["掌握完整意思與感情色彩", "注意適用對象與情境", "小心差強人意等常見誤用"] },
      { id: "ch-culture", name: "國學常識", review: ["敬辭用於對方，謙辭用於自己", "熟悉年齡與季節代稱", "題辭要配合人物、行業與場合"] },
      { id: "ch-rhetoric", name: "修辭", review: ["先辨認句子形式，再說明效果", "譬喻是兩事物相似，轉化是物人格化", "排比常用來加強節奏與情感"] },
      { id: "ch-meaning", name: "文意理解", review: ["轉折後常是作者重點", "代詞要回找前文指涉", "推論必須有文本證據"] },
      { id: "ch-reading", name: "閱讀理解", review: ["先找寫作目的與中心問題", "區分文本明說與合理推論", "避免自行加入文中沒有的資訊"] },
      { id: "ch-classical", name: "文言文", review: ["常用實詞要放回句中判斷", "先整理人物、行動與結果", "寓意通常來自前後變化"] },
      { id: "ch-vernacular", name: "白話文", review: ["記敘文注意人物態度轉變", "說明文區分主旨與例子", "議論文找論點、理由與限制"] },
      { id: "ch-integrated", name: "綜合測驗", review: ["同時核對文字、表格與限制條件", "排序題注意連接詞與代詞", "做決策時所有條件都要符合"] }
    ],
    questions: [
      { id:"ch-phon-01", unitId:"ch-phon", unit:"字音", ability:"辨認成語中的特殊讀音", difficulty:2, prompt:"下列「　」內的字，讀音標示何者正確？", options:["『鍥』而不捨：ㄑㄧˋ","自怨自『艾』：ㄞˋ","一『曝』十寒：ㄆㄨˋ","乳『臭』未乾：ㄔㄡˋ"], answer:2, explanation:"「曝」在一曝十寒中讀ㄆㄨˋ。鍥讀ㄑㄧㄝˋ；艾讀ㄧˋ；臭讀ㄒㄧㄡˋ。", commonError:"只用單字最常見的讀音判斷，沒有放回成語。" },
      { id:"ch-phon-02", unitId:"ch-phon", unit:"字音", ability:"比較多音字在不同詞語中的讀音", difficulty:2, prompt:"下列各組「給、和、看、便」，前後讀音相同的是哪一組？", options:["供給／給予","和平／附和","看見／看守","便利／便宜"], answer:0, explanation:"供給與給予的「給」都讀ㄐㄧˇ；其餘三組前後讀音不同。", commonError:"受口語影響，把「給予」誤讀成ㄍㄟˇㄩˇ。" },
      { id:"ch-form-01", unitId:"ch-form", unit:"字形", ability:"辨認常用成語的正確字形", difficulty:1, prompt:"下列成語的字形何者完全正確？", options:["穿流不息","再接再厲","一愁莫展","名列前矛"], answer:1, explanation:"正確為再接再厲。其他應為川流不息、一籌莫展、名列前茅。", commonError:"依讀音選字，忽略成語本義。" },
      { id:"ch-form-02", unitId:"ch-form", unit:"字形", ability:"在句子中辨識錯別字", difficulty:3, prompt:"「同學們迫不急待地布置會場，最後的成果另人驚豔。」共有幾個錯別字？", options:["0個","1個","2個","3個"], answer:2, explanation:"共有兩處：「迫不急待」應為「迫不及待」；「另人」應為「令人」。", commonError:"只看句意通順，沒有逐詞核對固定用法。" },
      { id:"ch-idiom-01", unitId:"ch-idiom", unit:"成語", ability:"依語境選用成語", difficulty:2, prompt:"他事前做過多種演練，即使臨時換題仍能＿＿地完成報告。", options:["一籌莫展","胸有成竹","望梅止渴","緣木求魚"], answer:1, explanation:"胸有成竹比喻事前已有完整計畫與把握，符合充分演練的情境。", commonError:"只憑熟悉度選成語，未比對上下文。" },
      { id:"ch-idiom-02", unitId:"ch-idiom", unit:"成語", ability:"判斷易混淆成語是否使用恰當", difficulty:4, prompt:"下列成語的使用何者最不恰當？", options:["整修後的圖書館美輪美奐","他犯錯後仍文過飾非","演出差強人意，觀眾失望透頂","消息不脛而走，很快傳遍校園"], answer:2, explanation:"差強人意指大致令人滿意，與「失望透頂」互相衝突。", commonError:"把「差」直接理解為不好。" },
      { id:"ch-culture-01", unitId:"ch-culture", unit:"國學常識", ability:"正確使用敬辭與謙辭", difficulty:2, prompt:"想禮貌詢問朋友的父親是否在家，最適合怎麼說？", options:["請問家父在家嗎","請問令尊在家嗎","請問先父在家嗎","請問小犬在家嗎"], answer:1, explanation:"令尊是尊稱對方父親；家父是自己的父親；先父指已故父親；小犬是自己的兒子。", commonError:"不清楚敬辭用於對方、謙辭用於自己。" },
      { id:"ch-culture-02", unitId:"ch-culture", unit:"國學常識", ability:"依場合選擇適切題辭", difficulty:3, prompt:"朋友新開診所，賀卡上最適合寫哪一個題辭？", options:["杏林春暖","桃李滿門","琴瑟和鳴","近悅遠來"], answer:0, explanation:"杏林代稱醫界，杏林春暖可用於祝賀醫療事業。", commonError:"只看字面吉祥，未辨識題辭適用場合。" },
      { id:"ch-rhetoric-01", unitId:"ch-rhetoric", unit:"修辭", ability:"辨認譬喻與轉化", difficulty:2, prompt:"「夜裡的風在窗外反覆敲門，催著我把書闔上。」主要使用哪種修辭？", options:["映襯","轉化","層遞","引用"], answer:1, explanation:"風被賦予敲門、催促等人的動作，屬於轉化中的擬人。", commonError:"把所有生動描寫都判成譬喻。" },
      { id:"ch-rhetoric-02", unitId:"ch-rhetoric", unit:"修辭", ability:"說明排比的表達效果", difficulty:4, prompt:"「我想記住清晨的光，記住同學的腳步，記住最後一次鐘聲。」反覆使用「記住」的主要效果是什麼？", options:["交代事件順序","強化節奏並突出珍惜回憶","說明因果關係","誇張表現生活忙碌"], answer:1, explanation:"結構相近的句子形成排比，反覆「記住」集中語勢與珍惜回憶的情感。", commonError:"只認出排比名稱，沒有分析它的作用。" },
      { id:"ch-meaning-01", unitId:"ch-meaning", unit:"文意理解", ability:"概括句段核心觀點", difficulty:2, prompt:"「真正的休息，不是把所有空檔交給螢幕，而是讓疲憊的注意力重新安定。」重點為何？", options:["螢幕一定造成疲勞","空閒應全部睡覺","休息要能恢復注意力","停止讀書就是休息"], answer:2, explanation:"「不是……而是……」後半句指出休息的目的在恢復注意力。", commonError:"只抓到醒目的「螢幕」，忽略轉折後的重點。" },
      { id:"ch-meaning-02", unitId:"ch-meaning", unit:"文意理解", ability:"理解比喻句的深層意義", difficulty:4, prompt:"「計畫像地圖，能指出方向，卻不能代替我們走完道路。」最想提醒什麼？", options:["計畫會限制行動","方向正確必定成功","計畫需要配合實際行動","面對問題不必規劃"], answer:2, explanation:"地圖不能代替行走，表示計畫只有配合執行才會產生結果。", commonError:"只理解地圖字面功能，未對應到計畫與行動。" },
      { id:"ch-reading-01", unitId:"ch-reading", unit:"閱讀理解", ability:"統整文本中的問題與方案", difficulty:3, context:"校門口常有學生下雨忘帶傘，過去借出的雨傘也常未歸還。自治會設置刷學生證借用、七日內歸還的共享傘站，一個月後歸還率由六成提升至九成。", prompt:"共享傘站主要同時處理哪兩個問題？", options:["雨傘不足與服務太少","忘記帶傘與借後不還","學生證不便與價格太高","下雨太多與空間不足"], answer:1, explanation:"方案保留臨時借傘，也用借用紀錄與期限改善未歸還問題。", commonError:"只記執行細節，沒回看方案前的兩個問題。" },
      { id:"ch-reading-02", unitId:"ch-reading", unit:"閱讀理解", ability:"區分合理推論與過度推論", difficulty:4, context:"共享傘站實施後，雨傘歸還率由六成提升至九成。制度包括刷卡紀錄、歸還期限與逾期提醒。", prompt:"下列推論何者最合理？", options:["所有學生都曾逾期","提醒是唯一有效原因","明確紀錄與規則可能改善歸還","雨傘數量增加三成"], answer:2, explanation:"制度實施後歸還率上升，可推論紀錄與規則可能有幫助；其他選項過度或無資料。", commonError:"把「可能促成」誤說成唯一原因，或自行加入數據。" },
      { id:"ch-classical-01", unitId:"ch-classical", unit:"文言文", ability:"理解常用文言詞語", difficulty:2, context:"里有少年欲學射，日張弓百次而多不中。老者示其立、視、呼吸之法，令每發必察前失。旬日，發十矢而八中。", prompt:"文中「旬日」最接近多久？", options:["一日","三日","十日","一個月"], answer:2, explanation:"「旬」通常指十日，因此旬日是十天左右。", commonError:"依現代口語猜測，或把旬與月混淆。" },
      { id:"ch-classical-02", unitId:"ch-classical", unit:"文言文", ability:"由人物前後變化概括寓意", difficulty:4, context:"少年起初每日射箭百次卻少有命中；老者教他每次都檢查站姿、視線與呼吸，十日後十箭中八。", prompt:"這段文字最適合說明哪個道理？", options:["工具比方法重要","學習不只求多，更要檢查並修正","力氣能取代技巧","師長應代替學生練習"], answer:1, explanation:"前後差異顯示有意識地檢查錯誤，比盲目增加練習次數有效。", commonError:"只看到射箭就選工具相關說法。" },
      { id:"ch-vernacular-01", unitId:"ch-vernacular", unit:"白話文", ability:"分析人物態度的轉變", difficulty:3, context:"子豪原本認為閱讀角不會有人使用，仍依分工完成書架。幾週後，他看到午休常有人交換心得，便主動製作借閱表。", prompt:"子豪的態度有何轉變？", options:["積極支持轉為反對","懷疑成效轉為主動投入","在意美觀轉為在意成績","服從分工轉為反對規定"], answer:1, explanation:"他起初懷疑，看到實際成效後主動改善閱讀角。", commonError:"只看到他一開始也參與，忽略內在看法與主動程度。" },
      { id:"ch-vernacular-02", unitId:"ch-vernacular", unit:"白話文", ability:"評估議論文的論點與理由", difficulty:5, context:"讀書時間長短不一定等於學習品質；公開排名可能使人只追求計時數字。比較合適的是記錄完成內容與遇到的困難，再調整下一次任務。", prompt:"作者反對只公布讀書時間排名的主要依據是什麼？", options:["時間無法記錄","所有人都會造假","時間未必反映學習品質","學生不必記錄成果"], answer:2, explanation:"作者認為單一時間數字不能代表投入與成果，還可能扭曲學習行為。", commonError:"把可能風險誇大成所有人一定造假。" },
      { id:"ch-integrated-01", unitId:"ch-integrated", unit:"綜合測驗", ability:"整合表格與限制條件做決策", difficulty:4, context:"小文只能在週二、週四16:40～18:00參加活動，並想加強數學或自然。甲：週二16:50自然實驗；乙：週三16:30數學；丙：週四17:10英文；丁：週二17:30閱讀。", prompt:"小文最適合選哪一項？", options:["甲","乙","丙","丁"], answer:0, explanation:"甲同時符合科目、星期與完整活動時段。", commonError:"只核對科目或星期一項，沒有檢查全部條件。" },
      { id:"ch-integrated-02", unitId:"ch-integrated", unit:"綜合測驗", ability:"依連接詞判斷句序", difficulty:5, prompt:"將下列句子排序：甲只抄錯題卻不找原因，筆記很快堆積。乙因此重點不在數量，而在找出錯誤判斷。丙找到原因後，要隔一段時間重答。丁許多人以為錯題本越厚越扎實。", options:["丁→甲→乙→丙","甲→丁→丙→乙","丁→乙→甲→丙","乙→丙→丁→甲"], answer:0, explanation:"丁提出常見看法，甲指出問題，乙以「因此」歸納，丙承接「找到原因後」。", commonError:"忽略「因此」「找到原因後」等銜接詞。" }
    ]
  },

  english: {
    id:"english", name:"英文", glyph:"A", theme:"english", description:"字彙、溝通與篇章理解",
    units:[
      {id:"en-vocab",name:"核心單字",review:["先看整句語意再選字","注意常見搭配與詞性","用上下文推測陌生字"]},
      {id:"en-grammar",name:"基礎文法",review:["先找時間線索與主詞","連接詞決定句意關係","文法服務語意，不只背規則"]},
      {id:"en-communication",name:"溝通功能",review:["回應要符合情境與語氣","先判斷說話者的目的","注意禮貌與人際關係"]},
      {id:"en-cloze",name:"克漏字",review:["讀完整段再看空格","留意代名詞與連接詞","前後句要語意連貫"]},
      {id:"en-reading",name:"閱讀理解",review:["區分明確細節與推論","主旨要涵蓋全文","比較公告、圖表與短文條件"]},
      {id:"en-listening",name:"聽力理解",review:["先抓人物、地點與目的","基本問答選最自然回應","言談理解留意時間與轉折"]}
    ],
    questions:[
      {id:"en-vocab-01",unitId:"en-vocab",unit:"核心單字",ability:"依語境選擇核心字彙",difficulty:1,prompt:"Amy was tired, so she decided to take a short ____ before studying.",options:["rest","race","rule","road"],answer:0,explanation:"take a rest 是休息一下，符合 tired 的語境。",commonError:"只看字首相同，未讀完整句意。"},
      {id:"en-vocab-02",unitId:"en-vocab",unit:"核心單字",ability:"由上下文推測字義",difficulty:3,context:"The trail was slippery after the rain, so everyone walked slowly and carefully.",prompt:"What does “slippery” most likely mean?",options:["easy to fall on","full of flowers","very crowded","hard to see"],answer:0,explanation:"雨後大家慢慢小心走，表示路面容易滑倒。",commonError:"只憑單字外形猜測，沒有利用行為線索。"},
      {id:"en-grammar-01",unitId:"en-grammar",unit:"基礎文法",ability:"依主詞與時間線索使用動詞",difficulty:2,prompt:"Kevin ____ basketball every Saturday.",options:["play","plays","played","playing"],answer:1,explanation:"every Saturday 表示習慣；Kevin 為第三人稱單數，用 plays。",commonError:"看到 every 就選原形，忽略主詞。"},
      {id:"en-grammar-02",unitId:"en-grammar",unit:"基礎文法",ability:"依語意選擇連接詞",difficulty:3,prompt:"Mia brought an umbrella ____ the sky looked clear in the morning.",options:["because","although","so","until"],answer:1,explanation:"帶傘與天空晴朗形成讓步關係，用 although。",commonError:"只翻譯單一詞，未判斷前後邏輯。"},
      {id:"en-communication-01",unitId:"en-communication",unit:"溝通功能",ability:"選擇適當的請求回應",difficulty:1,prompt:"Could you help me carry these books?",options:["Sure. Where should I put them?","I carried them yesterday.","They are on the desk.","Books are useful."],answer:0,explanation:"對方提出請求，最自然的回應是答應並詢問放置位置。",commonError:"選到與 books 有關、但沒有回應請求的句子。"},
      {id:"en-communication-02",unitId:"en-communication",unit:"溝通功能",ability:"理解建議與婉拒",difficulty:3,prompt:"A: Why don't we practice after school? B: I'd love to, but I have a dentist appointment.",options:["B accepts the plan.","B politely refuses the plan.","B asks for directions.","B changes the appointment."],answer:1,explanation:"I'd love to, but... 是先表達意願再說明無法參加的婉拒。",commonError:"只看到 I'd love to 就判斷為接受。"},
      {id:"en-cloze-01",unitId:"en-cloze",unit:"克漏字",ability:"依篇章關係選擇連接詞",difficulty:2,context:"Leo missed the bus. ____ he called his father and asked for a ride.",prompt:"Which word best fits the blank?",options:["However","Therefore","Before","Unless"],answer:1,explanation:"錯過公車是原因，打電話請父親載是結果，用 Therefore。",commonError:"忽略因果關係，只選熟悉的連接詞。"},
      {id:"en-cloze-02",unitId:"en-cloze",unit:"克漏字",ability:"理解代名詞指涉",difficulty:3,context:"Nina found a wallet near the gym. She took it to the school office because she hoped its owner could get it back.",prompt:"What does “it” in “get it back” refer to?",options:["the gym","the office","the wallet","the owner"],answer:2,explanation:"owner 要取回的是前文的 wallet。",commonError:"只找最近的名詞，沒有確認語意是否合理。"},
      {id:"en-reading-01",unitId:"en-reading",unit:"閱讀理解",ability:"擷取公告中的時間資訊",difficulty:2,context:"The library closes at 6 p.m. on weekdays, but it stays open until 8 p.m. on Friday.",prompt:"When does the library close on Friday?",options:["At 5 p.m.","At 6 p.m.","At 7 p.m.","At 8 p.m."],answer:3,explanation:"Friday 是例外，開放到 8 p.m.。",commonError:"只記住 weekdays 的 6 p.m.，忽略 but 後例外。"},
      {id:"en-reading-02",unitId:"en-reading",unit:"閱讀理解",ability:"整合多項條件選擇方案",difficulty:4,context:"Club A meets Tuesday and needs no experience. Club B meets Thursday but requires one year of training. Jay is free only Tuesday and is a beginner.",prompt:"Which club is better for Jay?",options:["Club A","Club B","Both clubs","Neither club"],answer:0,explanation:"Jay 只有週二有空且是初學者，只有 Club A 同時符合。",commonError:"只檢查時間或程度其中一項。"},
      {id:"en-listening-01",unitId:"en-listening",unit:"聽力理解",ability:"從對話推論地點",difficulty:2,context:"你會聽到：‘One ticket to Tainan, please.’ ‘The next train leaves from Platform 2.’",prompt:"Where are the speakers most likely?",options:["At a station","At a hospital","At a restaurant","At a museum"],answer:0,explanation:"ticket、train、platform 都指向車站情境。",commonError:"只聽到地名，忽略關鍵場所詞。"},
      {id:"en-listening-02",unitId:"en-listening",unit:"聽力理解",ability:"整合時間資訊進行推論",difficulty:4,context:"你會聽到：‘It's nine fifty. You can play for ten more minutes, and then it's bedtime.’",prompt:"What time is bedtime?",options:["9:50","10:00","10:10","10:20"],answer:1,explanation:"9:50 再過 10 分鐘是 10:00。",commonError:"直接選聽到的第一個時間，沒有做時間推算。"},
      {id:"en-vocab-03",unitId:"en-vocab",unit:"核心單字",ability:"由標示與情境理解字義",difficulty:3,context:"A box has a sign saying: FRAGILE — HANDLE WITH CARE.",prompt:"What does “fragile” most likely mean?",options:["easy to break","too heavy to move","safe to open","ready to recycle"],answer:0,explanation:"handle with care 表示要小心拿取，因此 fragile 指容易破損。",commonError:"只看到 box 就猜重量，沒有利用警示語。"},
      {id:"en-grammar-03",unitId:"en-grammar",unit:"基礎文法",ability:"依時間長度使用現在完成式",difficulty:4,prompt:"Lena ____ in Tainan for three years, and she still lives there now.",options:["lives","lived","has lived","will live"],answer:2,explanation:"for three years 且現在仍住在當地，應使用現在完成式 has lived。",commonError:"看到過去的時間長度便選過去式，忽略狀態持續至今。"},
      {id:"en-communication-03",unitId:"en-communication",unit:"溝通功能",ability:"選擇合宜的道歉回應",difficulty:2,prompt:"A: I'm sorry I stepped on your foot. B: ____",options:["That's all right.","You are welcome.","Here you are.","Good luck."],answer:0,explanation:"That's all right 可用來接受對方道歉，表示沒關係。",commonError:"看到禮貌情境就選 You are welcome，但那通常回應感謝。"},
      {id:"en-cloze-03",unitId:"en-cloze",unit:"克漏字",ability:"依上下文選擇承接句",difficulty:4,context:"This water bottle can be used many times. ____. That means fewer plastic bottles are thrown away.",prompt:"Which sentence best fits the blank?",options:["It also costs more every day.","Using it again helps reduce waste.","Plastic is always easy to break.","Water tastes different at school."],answer:1,explanation:"後句說較少塑膠瓶被丟棄，因此空格應承接重複使用能減少廢棄物。",commonError:"只選與 bottle 有關的句子，沒有檢查前後因果。"},
      {id:"en-reading-03",unitId:"en-reading",unit:"閱讀理解",ability:"閱讀活動表並比對限制",difficulty:4,context:"Art Club: Tue. 4:30–5:30, beginners welcome. Music Club: Thu. 4:00–5:30, bring your own instrument. Bo is free only Tuesday and has never taken an art class.",prompt:"Which statement is true?",options:["Bo can join Art Club.","Bo must bring an instrument.","Bo can join only Music Club.","Bo cannot join either club."],answer:0,explanation:"Bo 週二有空，且 Art Club 歡迎初學者，兩項條件都符合。",commonError:"只看是否有經驗，忽略活動日期。"},
      {id:"en-reading-04",unitId:"en-reading",unit:"閱讀理解",ability:"推論作者態度",difficulty:5,context:"Our class tried a phone-free lunch for one week. At first, many students felt bored. By Friday, however, more people were talking, sharing food, and even planning games together. I did not expect such a small change to make lunch so lively.",prompt:"How does the writer feel about the phone-free lunch at the end?",options:["Surprised and positive","Angry and worried","Bored and disappointed","Uninterested and confused"],answer:0,explanation:"作者以 did not expect 表達驚訝，並用 lively 描述正面結果。",commonError:"只記住開頭 felt bored，忽略 however 後的態度轉折。"},
      {id:"en-listening-03",unitId:"en-listening",unit:"聽力理解",ability:"辨識適當回應",difficulty:2,context:"你會聽到：‘Would you like some more soup?’",prompt:"Which is the best response?",options:["Yes, please.","It is in the kitchen.","I cooked yesterday.","The bowl is blue."],answer:0,explanation:"Would you like...? 是提供或邀請，Yes, please 是自然接受。",commonError:"選到與 soup 有關、卻沒有回應邀請的句子。"},
      {id:"en-listening-04",unitId:"en-listening",unit:"聽力理解",ability:"從對話推論行動原因",difficulty:4,context:"你會聽到：‘Why are you taking the bus today?’ ‘My bike has a flat tire, and the repair shop opens at ten.’",prompt:"Why is the speaker taking the bus?",options:["The weather is bad.","The bike needs repair.","The bus is free today.","The shop is too far away."],answer:1,explanation:"flat tire 表示腳踏車輪胎沒氣，需要修理，所以改搭公車。",commonError:"聽到 repair shop opens at ten 就誤以為原因是時間，而非輪胎故障。"}
    ]
  },

  math: {
    id:"math",name:"數學",glyph:"∑",theme:"math",description:"概念、推理與情境解題",
    units:[
      {id:"ma-number",name:"數與量",review:["百分率先找部分量與全量","單位要先統一","估算可用來檢查答案"]},
      {id:"ma-shape",name:"空間與形狀",review:["先辨認圖形性質與已知條件","面積與周長不要混淆","相似圖形的對應邊要一致"]},
      {id:"ma-coordinate",name:"坐標幾何",review:["先判斷象限與正負號","水平垂直距離看坐標差","圖形面積可拆成基本圖形"]},
      {id:"ma-algebra",name:"代數",review:["移項本質是等式兩邊同作運算","列式前先定義未知數","解完要代回檢查"]},
      {id:"ma-function",name:"函數",review:["表格、圖形與式子互相轉換","斜率表示每單位變化量","注意截距的情境意義"]},
      {id:"ma-data",name:"資料與不確定性",review:["平均數易受極端值影響","機率分母是所有等可能結果","圖表刻度會影響視覺判斷"]},
      {id:"ma-literacy",name:"素養與表達",review:["先列出限制條件","答案要回到真實情境解釋","策略與推理過程同樣重要"]}
    ],
    questions:[
      {id:"ma-number-01",unitId:"ma-number",unit:"數與量",ability:"計算百分率",difficulty:1,prompt:"某班30人，其中18人完成任務。完成率是多少？",options:["40%","50%","60%","80%"],answer:2,explanation:"18÷30＝0.6＝60%。",commonError:"用全量除以部分量，或忘記轉成百分率。"},
      {id:"ma-number-02",unitId:"ma-number",unit:"數與量",ability:"統一單位後比較速率",difficulty:3,prompt:"小光12分鐘走900公尺，平均每分鐘走多少公尺？",options:["60","70","75","90"],answer:2,explanation:"900÷12＝75公尺／分。",commonError:"把時間與距離相乘，或除法順序顛倒。"},
      {id:"ma-shape-01",unitId:"ma-shape",unit:"空間與形狀",ability:"計算長方形面積",difficulty:1,prompt:"長方形長8公分、寬5公分，面積是多少平方公分？",options:["13","26","40","80"],answer:2,explanation:"面積＝長×寬＝8×5＝40。",commonError:"誤算成周長。"},
      {id:"ma-shape-02",unitId:"ma-shape",unit:"空間與形狀",ability:"利用相似比例求邊長",difficulty:4,prompt:"兩個相似三角形對應邊長比為2：3。小三角形一邊長8，大三角形對應邊長為何？",options:["10","12","16","24"],answer:1,explanation:"8×3÷2＝12。",commonError:"把比例方向倒置，或直接加上差值1。"},
      {id:"ma-coordinate-01",unitId:"ma-coordinate",unit:"坐標幾何",ability:"判斷坐標所在象限",difficulty:1,prompt:"點P（－3，4）位於第幾象限？",options:["第一象限","第二象限","第三象限","第四象限"],answer:1,explanation:"x為負、y為正，位於第二象限。",commonError:"把（x，y）順序看反。"},
      {id:"ma-coordinate-02",unitId:"ma-coordinate",unit:"坐標幾何",ability:"由坐標計算水平距離",difficulty:3,prompt:"A（－2，3）與B（5，3）的距離是多少？",options:["3","5","7","8"],answer:2,explanation:"兩點y相同，水平距離為|5－（－2）|＝7。",commonError:"忽略負號，算成5－2。"},
      {id:"ma-algebra-01",unitId:"ma-algebra",unit:"代數",ability:"解一元一次方程式",difficulty:2,prompt:"若3x＋5＝20，x為何？",options:["3","5","8","15"],answer:1,explanation:"兩邊減5得3x＝15，再除以3得x＝5。",commonError:"移項時符號或運算錯誤。"},
      {id:"ma-algebra-02",unitId:"ma-algebra",unit:"代數",ability:"將生活情境列成方程式",difficulty:4,prompt:"筆記本每本25元，買x本再付運費40元，共165元。下列方程式何者正確？",options:["25x＝165","25x＋40＝165","40x＋25＝165","25（x＋40）＝165"],answer:1,explanation:"商品總價25x，再加固定運費40，等於165。",commonError:"把固定費用誤當成每本都要支付。"},
      {id:"ma-function-01",unitId:"ma-function",unit:"函數",ability:"由情境辨認線型關係",difficulty:2,context:"影印店收基本費10元，每印一張再收2元。",prompt:"印x張的費用y應為何？",options:["y＝2x","y＝10x＋2","y＝2x＋10","y＝12x"],answer:2,explanation:"每張2元是2x，固定基本費再加10。",commonError:"把固定費與單價位置互換。"},
      {id:"ma-function-02",unitId:"ma-function",unit:"函數",ability:"解讀函數變化率",difficulty:4,context:"水箱原有20公升，每分鐘流入3公升。",prompt:"經過5分鐘後水量是多少？",options:["15","23","35","100"],answer:2,explanation:"20＋3×5＝35公升。",commonError:"只算流入量，忘記原有水量。"},
      {id:"ma-data-01",unitId:"ma-data",unit:"資料與不確定性",ability:"計算平均數",difficulty:2,prompt:"四次小考為70、80、80、90分，平均多少？",options:["75","80","82.5","85"],answer:1,explanation:"（70＋80＋80＋90）÷4＝80。",commonError:"除以錯誤次數，或把眾數當平均。"},
      {id:"ma-data-02",unitId:"ma-data",unit:"資料與不確定性",ability:"判斷簡單機率",difficulty:3,prompt:"袋中有3顆紅球、2顆藍球，隨機取1顆，取到藍球的機率為何？",options:["1/5","2/5","2/3","3/5"],answer:1,explanation:"共有5顆，其中2顆藍球，機率為2/5。",commonError:"把紅球數當分母，或只看較少的一類。"},
      {id:"ma-literacy-01",unitId:"ma-literacy",unit:"素養與表達",ability:"依限制條件選擇最省方案",difficulty:4,context:"方案甲月費100元，每次20元；方案乙無月費，每次35元。小恩每月使用8次。",prompt:"哪個方案較省？相差多少？",options:["甲省20元","甲省40元","乙省20元","乙省40元"],answer:0,explanation:"甲100＋20×8＝260；乙35×8＝280，甲省20元。",commonError:"只比較單次費用，忘記月費與使用次數。"},
      {id:"ma-literacy-02",unitId:"ma-literacy",unit:"素養與表達",ability:"檢查答案的情境合理性",difficulty:5,prompt:"每輛車最多坐6人，35人至少需要幾輛車？",options:["5","5.8","6","7"],answer:2,explanation:"35÷6＝5餘5，5輛不夠，必須進位為6輛。",commonError:"只四捨五入或保留小數，沒有回到車輛必須是整數的情境。"},
      {id:"ma-number-03",unitId:"ma-number",unit:"數與量",ability:"理解科學記號",difficulty:3,prompt:"0.00042以科學記號表示，何者正確？",options:["4.2×10⁻⁴","4.2×10⁻³","42×10⁻⁴","0.42×10⁻⁴"],answer:0,explanation:"小數點向右移4位得到4.2，因此乘以10⁻⁴。",commonError:"指數正負號判斷錯誤，或首數沒有介於1與10之間。"},
      {id:"ma-shape-03",unitId:"ma-shape",unit:"空間與形狀",ability:"應用畢氏定理解題",difficulty:3,prompt:"直角三角形兩股長為6與8，斜邊長為何？",options:["7","10","12","14"],answer:1,explanation:"斜邊平方＝6²＋8²＝100，所以斜邊為10。",commonError:"直接把兩股相加，或忘記最後開平方。"},
      {id:"ma-coordinate-03",unitId:"ma-coordinate",unit:"坐標幾何",ability:"求線段中點坐標",difficulty:3,prompt:"A（2，－1）與B（6，3）的中點坐標為何？",options:["（4，1）","（4，2）","（8，2）","（2，4）"],answer:0,explanation:"中點為（（2＋6）÷2，（－1＋3）÷2）＝（4，1）。",commonError:"只算其中一個坐標平均，或把坐標相加後未除以2。"},
      {id:"ma-algebra-03",unitId:"ma-algebra",unit:"代數",ability:"利用平方差公式因式分解",difficulty:4,prompt:"x²－25的因式分解為何？",options:["（x－5）²","（x＋5）²","（x－5）（x＋5）","x（x－25）"],answer:2,explanation:"x²－25＝x²－5²，使用平方差公式得到（x－5）（x＋5）。",commonError:"誤套完全平方公式。"},
      {id:"ma-function-03",unitId:"ma-function",unit:"函數",ability:"由表格判斷一次函數變化",difficulty:4,context:"表格中x依序為0、1、2，y依序為5、8、11。",prompt:"y與x的關係式最可能是？",options:["y＝3x＋5","y＝5x＋3","y＝3x","y＝x＋5"],answer:0,explanation:"x每增加1，y增加3，且x＝0時y＝5，所以y＝3x＋5。",commonError:"把初始值5與變化量3的位置互換。"},
      {id:"ma-data-03",unitId:"ma-data",unit:"資料與不確定性",ability:"判斷極端值對統計量的影響",difficulty:5,prompt:"資料10、11、11、12、56中，哪個統計量較能代表多數資料的中心？",options:["平均數20","中位數11","全距46","最大值56"],answer:1,explanation:"56是極端值，會拉高平均數；中位數11較能代表多數集中位置。",commonError:"習慣一律使用平均數，未觀察極端值。"}
    ]
  },

  science: {
    id:"science",name:"自然",glyph:"科",theme:"science",description:"科學概念、資料判讀與探究",
    units:[
      {id:"sc-life",name:"生物與生命",review:["構造與功能要配對理解","生理系統彼此合作維持恆定","生態題留意能量與物質流向"]},
      {id:"sc-matter",name:"物質與化學",review:["物理變化不產生新物質","化學反應前後質量守恆","酸鹼判斷要看實驗證據"]},
      {id:"sc-physics",name:"物理現象",review:["先分清速率、力與能量","能量會轉換但總量守恆","聲音需介質、光可在真空傳播"]},
      {id:"sc-earth",name:"地球科學",review:["自轉造成晝夜，公轉配合傾斜造成季節","天氣是短期，氣候是長期統計","板塊運動與地震火山相關"]},
      {id:"sc-sustain",name:"永續發展",review:["比較方案要看完整生命週期","節能同時看效率與需求","環境議題需權衡證據與影響"]},
      {id:"sc-inquiry",name:"科學探究",review:["一次只改變一個自變因","測量要重複並記錄","結論不能超出資料支持範圍"]}
    ],
    questions:[
      {id:"sc-life-01",unitId:"sc-life",unit:"生物與生命",ability:"理解光合作用所需物質",difficulty:1,prompt:"植物進行光合作用時主要吸收哪種氣體？",options:["氧氣","二氧化碳","氮氣","氫氣"],answer:1,explanation:"植物利用光能，以二氧化碳和水製造養分並釋放氧氣。",commonError:"把呼吸作用吸收氧氣與光合作用混淆。"},
      {id:"sc-life-02",unitId:"sc-life",unit:"生物與生命",ability:"解讀食物鏈中的能量流動",difficulty:3,context:"草→蚱蜢→青蛙→蛇",prompt:"若蚱蜢數量大幅減少，最先直接受到食物不足影響的生物是？",options:["草","青蛙","蛇","分解者"],answer:1,explanation:"青蛙直接以蚱蜢為食，因此最先受到直接影響。",commonError:"只看食物鏈最上層，忽略「直接」關係。"},
      {id:"sc-matter-01",unitId:"sc-matter",unit:"物質與化學",ability:"區分物理變化與化學變化",difficulty:2,prompt:"下列何者最可能產生新物質？",options:["冰融化","紙張燃燒","食鹽溶於水","玻璃破裂"],answer:1,explanation:"紙張燃燒會形成灰燼與氣體等新物質，屬化學變化。",commonError:"把外觀改變都判為化學變化。"},
      {id:"sc-matter-02",unitId:"sc-matter",unit:"物質與化學",ability:"應用質量守恆解釋實驗",difficulty:4,context:"密閉容器內讓兩種溶液反應並產生沉澱。",prompt:"反應前後容器內總質量如何變化？",options:["增加","減少","不變","無法判斷"],answer:2,explanation:"密閉系統沒有物質進出，化學反應前後總質量守恆。",commonError:"看到沉澱便以為質量增加。"},
      {id:"sc-physics-01",unitId:"sc-physics",unit:"物理現象",ability:"理解聲音傳播條件",difficulty:1,prompt:"聲音無法在哪一種環境中傳播？",options:["空氣","水中","鋼鐵","真空"],answer:3,explanation:"聲音需要介質傳遞振動，真空中沒有介質。",commonError:"以為所有波都可在真空傳播。"},
      {id:"sc-physics-02",unitId:"sc-physics",unit:"物理現象",ability:"理解重力位能與動能轉換",difficulty:3,prompt:"球從高處落下且忽略空氣阻力，下降過程中何者正確？",options:["動能減少、位能增加","動能增加、位能減少","兩者都增加","兩者都不變"],answer:1,explanation:"下降時重力位能轉換為動能，因此位能減少、動能增加。",commonError:"把速度增加誤認為所有能量都增加。"},
      {id:"sc-earth-01",unitId:"sc-earth",unit:"地球科學",ability:"辨認晝夜成因",difficulty:1,prompt:"造成白天與黑夜交替的主要原因是？",options:["地球自轉","地球公轉","月球公轉","太陽自轉"],answer:0,explanation:"地球約24小時自轉一周，不同地區輪流面向太陽。",commonError:"把晝夜與四季成因混淆。"},
      {id:"sc-earth-02",unitId:"sc-earth",unit:"地球科學",ability:"區分天氣與氣候資料",difficulty:3,prompt:"下列哪項最適合用來描述某地氣候？",options:["今天下午下大雨","明早可能起霧","近30年冬季平均溫度","颱風兩小時後登陸"],answer:2,explanation:"氣候描述長期統計特徵，近30年平均最符合。",commonError:"把任何大氣現象都當作氣候。"},
      {id:"sc-sustain-01",unitId:"sc-sustain",unit:"永續發展",ability:"比較能源選擇的多面向影響",difficulty:3,prompt:"評估發電方式是否永續時，最完整的做法是？",options:["只看發電價格","只看是否排碳","同時考量效率、污染、穩定與資源","只看設備外觀"],answer:2,explanation:"永續決策需綜合環境、經濟、供電穩定與資源等面向。",commonError:"用單一優點或缺點判斷整個方案。"},
      {id:"sc-sustain-02",unitId:"sc-sustain",unit:"永續發展",ability:"判斷有效節能行動",difficulty:4,prompt:"教室冷氣設定26℃並搭配電風扇，主要節能理由是？",options:["風扇會製造冷空氣","提高空氣流動可維持舒適並降低冷氣負擔","26℃時冷氣不耗電","風扇可降低室外溫度"],answer:1,explanation:"氣流增加體感散熱，可在較高設定溫度維持舒適，減少冷氣耗能。",commonError:"把體感降溫誤解為空氣實際降溫。"},
      {id:"sc-inquiry-01",unitId:"sc-inquiry",unit:"科學探究",ability:"辨認控制變因",difficulty:3,context:"想研究光照時間對豆苗高度的影響。",prompt:"下列哪項最適合作為實驗設計？",options:["不同光照、不同水量","不同光照、相同品種與水量","相同光照、不同土壤與水量","每組只測一天且不記錄"],answer:1,explanation:"只改變光照時間，其他條件盡量相同，才能公平比較。",commonError:"同時改變多個條件，無法判斷原因。"},
      {id:"sc-inquiry-02",unitId:"sc-inquiry",unit:"科學探究",ability:"由資料判斷結論範圍",difficulty:5,context:"三次測量某橡皮擦落下時間為0.62、0.61、0.63秒。",prompt:"下列結論何者最合理？",options:["每次落下必定0.62秒","平均約0.62秒且測量有小幅差異","所有物體落下時間都相同","儀器完全沒有誤差"],answer:1,explanation:"三次數值接近但不完全相同，平均約0.62秒；不能推論所有情況。",commonError:"把有限測量結果說成絕對定律。"},
      {id:"sc-life-03",unitId:"sc-life",unit:"生物與生命",ability:"理解細胞構造與功能",difficulty:3,prompt:"植物細胞通常具有、動物細胞通常沒有的構造是？",options:["細胞膜","細胞質","細胞壁","細胞核"],answer:2,explanation:"植物細胞外具有細胞壁，可支持與保護細胞；其餘構造兩者通常都有。",commonError:"把細胞膜與細胞壁混為一談。"},
      {id:"sc-life-04",unitId:"sc-life",unit:"生物與生命",ability:"由遺傳與環境解釋性狀",difficulty:5,prompt:"同一品種植物分種在日照充足與陰暗處，長成高度不同。最合理的解釋是？",options:["基因一定完全改變","環境可能影響性狀表現","陰暗處植物不是同種","高度只由土壤顏色決定"],answer:1,explanation:"相同品種仍可能因光照等環境差異而呈現不同性狀。",commonError:"把性狀差異全部歸因於基因，忽略環境作用。"},
      {id:"sc-matter-03",unitId:"sc-matter",unit:"物質與化學",ability:"利用指示劑判斷酸鹼性",difficulty:3,context:"某溶液使藍色石蕊試紙變紅。",prompt:"此溶液最可能具有什麼性質？",options:["酸性","鹼性","中性","一定是純水"],answer:0,explanation:"酸性溶液可使藍色石蕊試紙變紅。",commonError:"把紅變藍與藍變紅的規則記反。"},
      {id:"sc-physics-03",unitId:"sc-physics",unit:"物理現象",ability:"判斷串聯電路的電流路徑",difficulty:4,prompt:"兩燈泡串聯時，若其中一顆燈泡斷路，另一顆通常會如何？",options:["更亮","仍正常發光","也熄滅","變成電池"],answer:2,explanation:"串聯電路只有一條電流路徑，一處斷路便使整個迴路無電流。",commonError:"把串聯與並聯電路的故障情形混淆。"},
      {id:"sc-earth-03",unitId:"sc-earth",unit:"地球科學",ability:"理解板塊運動與地質現象",difficulty:4,prompt:"臺灣地震頻繁，與下列哪項關係最密切？",options:["位於板塊交界附近","距赤道較近","四面環海","冬季受季風影響"],answer:0,explanation:"臺灣鄰近歐亞板塊與菲律賓海板塊交界，板塊作用使地震頻繁。",commonError:"把氣候或海島位置誤當成地震主因。"},
      {id:"sc-sustain-03",unitId:"sc-sustain",unit:"永續發展",ability:"以生命週期觀點比較環境影響",difficulty:5,prompt:"比較紙杯與環保杯的環境影響時，最完整的資料應包含什麼？",options:["只看購買價格","只看使用時重量","原料、生產、使用次數與廢棄處理","只問一位使用者喜好"],answer:2,explanation:"生命週期評估需涵蓋原料取得、生產、使用與最終處理。",commonError:"只比較使用當下，忽略生產與重複使用次數。"},
      {id:"sc-inquiry-03",unitId:"sc-inquiry",unit:"科學探究",ability:"由實驗資料找出趨勢",difficulty:4,context:"水溫20、40、60、80℃時，糖完全溶解所需時間分別為180、120、70、45秒。",prompt:"在此範圍內，資料最支持哪個結論？",options:["溫度越高溶解越慢","溫度越高溶解所需時間越短","糖量越多溫度越低","任何物質都會有相同結果"],answer:1,explanation:"溫度提高時，紀錄的溶解時間持續縮短；結論限於此實驗條件。",commonError:"把相關趨勢擴大成所有物質的絕對規律。"},
      {id:"sc-inquiry-04",unitId:"sc-inquiry",unit:"科學探究",ability:"評估實驗誤差與改進方法",difficulty:5,prompt:"只測量一次便宣稱結果完全正確，最適合如何改進？",options:["改用較漂亮的表格","重複測量並計算代表值","刪除不喜歡的數據","同時改變更多變因"],answer:1,explanation:"重複測量可觀察變異並降低單次偶然誤差的影響。",commonError:"以為整理外觀或刪除數據能提升證據品質。"}
    ]
  },

  social: {
    id:"social",name:"社會",glyph:"地",theme:"social",description:"歷史、地理、公民與資料判讀",
    units:[
      {id:"so-history",name:"歷史",review:["先建立時間順序再談因果","史料要比較來源與立場","事件影響需區分短期與長期"]},
      {id:"so-geography",name:"地理",review:["地圖題先看圖例、方向與比例尺","區域差異要連結自然與人文因素","圖表資料需注意單位與時間"]},
      {id:"so-civics",name:"公民與社會",review:["權利與責任要放入制度理解","民主重視程序與多元意見","經濟選擇包含機會成本"]},
      {id:"so-integrated",name:"跨科整合",review:["同時運用歷史、地理與公民概念","比較資料來源與可信度","公共議題要分析不同群體影響"]}
    ],
    questions:[
      {id:"so-history-01",unitId:"so-history",unit:"歷史",ability:"比較多種史料以交叉檢證",difficulty:2,prompt:"研究歷史事件時，降低單一資料偏誤的最佳方法是？",options:["只看一篇文章","比較不同來源史料","只背事件年份","依個人想像判斷"],answer:1,explanation:"比較不同來源與立場，可交叉檢證並形成較完整理解。",commonError:"把資料多寡當成背誦量，忽略來源比較。"},
      {id:"so-history-02",unitId:"so-history",unit:"歷史",ability:"依時代特徵判斷先後順序",difficulty:4,context:"甲：工廠大量使用蒸汽動力。乙：網際網路改變全球溝通。丙：活字印刷促進書籍流通。",prompt:"三項發展的先後順序為何？",options:["甲→丙→乙","丙→甲→乙","丙→乙→甲","乙→甲→丙"],answer:1,explanation:"活字印刷早於工業革命的蒸汽動力，網際網路則最晚。",commonError:"只憑科技熟悉度，未建立歷史時間軸。"},
      {id:"so-geography-01",unitId:"so-geography",unit:"地理",ability:"應用比例尺換算距離",difficulty:2,prompt:"比例尺1：100,000的地圖上1公分，代表實際多少公里？",options:["0.1","1","10","100"],answer:1,explanation:"100,000公分＝1,000公尺＝1公里。",commonError:"公分換公里時少換或多換一個位數。"},
      {id:"so-geography-02",unitId:"so-geography",unit:"地理",ability:"由人地關係解釋產業分布",difficulty:4,context:"某地地勢平坦、日照充足、年雨量少，但可取得穩定灌溉水源。",prompt:"此地最可能發展哪種活動？",options:["高山林業","灌溉農業","深海漁業","寒帶畜牧"],answer:1,explanation:"平坦、日照與灌溉水源有利農業，少雨使灌溉特別重要。",commonError:"只看少雨就認為完全不能農耕。"},
      {id:"so-civics-01",unitId:"so-civics",unit:"公民與社會",ability:"理解民主討論程序",difficulty:2,prompt:"班級制定共同規範時，哪種做法最符合民主精神？",options:["由一人決定","多數不必聽少數意見","充分討論後共同決定","有意見者退出"],answer:2,explanation:"民主重視資訊、表達、討論、決定與尊重不同意見。",commonError:"把民主簡化成多數人可以忽略少數。"},
      {id:"so-civics-02",unitId:"so-civics",unit:"公民與社會",ability:"理解機會成本",difficulty:3,context:"小芸週六下午只能選擇參加籃球賽或科展講座，她最後選擇籃球賽。",prompt:"她這項選擇的機會成本是？",options:["籃球賽門票","參加科展講座的機會","週六上午時間","兩項活動全部費用"],answer:1,explanation:"機會成本是放棄選項中價值最高者，此處是科展講座。",commonError:"把實際支付金額直接當作機會成本。"},
      {id:"so-integrated-01",unitId:"so-integrated",unit:"跨科整合",ability:"評估公共議題的多元影響",difficulty:4,context:"市府規劃在河岸增設自行車道，部分居民支持減碳，部分商家擔心停車位減少。",prompt:"討論此政策最適合的做法是？",options:["只採支持者意見","只看建設成本","比較交通、環境與不同群體影響","先建設再禁止討論"],answer:2,explanation:"公共政策需同時分析多面向證據與不同利害關係人的影響。",commonError:"只從單一價值或單一群體判斷。"},
      {id:"so-integrated-02",unitId:"so-integrated",unit:"跨科整合",ability:"判斷資訊來源可信度",difficulty:5,prompt:"研究某地人口變化時，哪組資料最適合交叉檢證？",options:["匿名留言與單一照片","政府統計、地方紀錄與多次調查","一位居民的回憶","沒有日期的轉傳圖卡"],answer:1,explanation:"具日期、方法與不同來源的資料較能相互檢驗。",commonError:"把生動的個人經驗當成足以代表整體。"},
      {id:"so-history-03",unitId:"so-history",unit:"歷史",ability:"分析歷史事件的因果關係",difficulty:3,context:"港口開放後，外國商人增加，茶與樟腦出口成長，港口附近人口也逐漸增加。",prompt:"下列哪項最適合描述這段變化？",options:["對外貿易帶動地方發展","人口增加造成港口關閉","農業完全被禁止","外國商人減少出口"],answer:0,explanation:"開港、出口與人口增加形成貿易帶動地方發展的因果鏈。",commonError:"只看到單一現象，沒有串聯前後關係。"},
      {id:"so-history-04",unitId:"so-history",unit:"歷史",ability:"辨識史料立場與限制",difficulty:5,context:"甲資料是政府發布的政策成果；乙資料是受政策影響居民的日記。",prompt:"研究該政策時，最適當的做法是？",options:["只採甲，因為是官方資料","只採乙，因為是親身經歷","比較兩者的目的、立場與內容","兩者立場不同所以都不能用"],answer:2,explanation:"兩份資料各有價值與限制，應比較來源、目的及立場後交叉判讀。",commonError:"把官方或親身經歷視為一定完全客觀。"},
      {id:"so-history-05",unitId:"so-history",unit:"歷史",ability:"依制度特徵判斷時代背景",difficulty:4,context:"某時期臺灣居民須接受日語教育，行政制度由殖民政府主導，同時鐵路與現代衛生設施逐步建設。",prompt:"這段描述最可能屬於哪個時期？",options:["荷西時期","清帝國統治時期","日本統治時期","戰後民主化完成後"],answer:2,explanation:"日語教育、殖民政府與近代基礎建設是日本統治時期的重要特徵。",commonError:"只看到鐵路建設就判斷為任何近代時期。"},
      {id:"so-geography-03",unitId:"so-geography",unit:"地理",ability:"分析地形對降水的影響",difficulty:4,prompt:"潮溼氣流遇到高山後，迎風坡通常比背風坡降水多，主要原因是？",options:["迎風坡空氣上升冷卻凝結","背風坡距海一定較遠","高山會製造水氣","迎風坡全年沒有陽光"],answer:0,explanation:"潮溼空氣被地形抬升後冷卻，水氣凝結形成較多降水。",commonError:"只記迎風坡多雨，卻不理解空氣抬升的機制。"},
      {id:"so-geography-04",unitId:"so-geography",unit:"地理",ability:"解讀人口結構變化",difficulty:4,context:"某地0～14歲人口比例下降，65歲以上人口比例持續上升。",prompt:"該地最可能面臨哪項問題？",options:["幼兒數量快速增加","高齡照護需求提高","勞動人口必定立即歸零","學校數量一定增加"],answer:1,explanation:"老年人口比例上升通常使醫療、照護與社會支持需求增加。",commonError:"用「必定」「立即」做過度推論。"},
      {id:"so-geography-05",unitId:"so-geography",unit:"地理",ability:"應用方位判讀移動方向",difficulty:2,prompt:"小明先向東走2公里，再向北走1公里。他目前位於出發點的哪個方向？",options:["東北方","東南方","西北方","西南方"],answer:0,explanation:"向東再向北，合成位置在出發點東北方。",commonError:"只看最後一次移動方向，忽略整體位置。"},
      {id:"so-civics-03",unitId:"so-civics",unit:"公民與社會",ability:"理解消費者權益與契約",difficulty:3,prompt:"網購商品與網站描述明顯不符時，最適合先採取哪項行動？",options:["自行公開賣家個資","保存訂單與商品資料並聯絡退換貨","立刻丟棄所有證據","要求同學代替付款"],answer:1,explanation:"保存交易與商品證據，再依規定聯絡業者，是合理維護權益的第一步。",commonError:"情緒性採取報復行動，忽略證據與正式程序。"},
      {id:"so-civics-04",unitId:"so-civics",unit:"公民與社會",ability:"理解供需變化對價格的影響",difficulty:4,context:"颱風後蔬菜產量大幅減少，但市場需求短期內變化不大。",prompt:"其他條件不變時，蔬菜價格最可能如何？",options:["下降","上升","完全不變","一定變成零"],answer:1,explanation:"供給減少、需求大致不變時，市場價格通常上升。",commonError:"只把價格變動歸因於商家，不看供需關係。"},
      {id:"so-civics-05",unitId:"so-civics",unit:"公民與社會",ability:"運用媒體識讀查證訊息",difficulty:5,prompt:"收到「明天全市停課」的轉傳訊息時，最適合怎麼做？",options:["立刻轉傳所有群組","查看政府正式公告與發布時間","只看留言數量","相信最早傳訊息的人"],answer:1,explanation:"停課資訊應以權責機關最新正式公告為準，並確認日期與適用區域。",commonError:"把轉傳次數或熟人說法當成可信度。"},
      {id:"so-integrated-03",unitId:"so-integrated",unit:"跨科整合",ability:"整合人口與公共服務資料",difficulty:4,context:"某區高齡人口增加，公車班次少，醫療院所集中在市中心。",prompt:"哪項政策最直接回應上述問題？",options:["增加偏遠地區接駁與巡迴醫療","縮短所有圖書館開放時間","取消人行道","只增加觀光廣告"],answer:0,explanation:"接駁與巡迴醫療同時改善高齡者交通與醫療可近性。",commonError:"只選一般建設，未對應資料指出的需求。"},
      {id:"so-integrated-04",unitId:"so-integrated",unit:"跨科整合",ability:"比較政策對不同群體的影響",difficulty:5,context:"城市中心提高停車費，希望減少車流。通勤者擔心成本增加，居民則期待空氣改善。",prompt:"評估政策成效還需要哪項資料？",options:["市長喜歡的顏色","車流量、空氣品質與大眾運輸使用變化","停車場招牌字體","單一居民的心情"],answer:1,explanation:"需用政策前後的交通、環境與替代運具資料，才能評估多面向效果。",commonError:"只看支持或反對意見，沒有要求可比較的證據。"},
      {id:"so-integrated-05",unitId:"so-integrated",unit:"跨科整合",ability:"理解全球化下的生產與消費關係",difficulty:4,context:"一件衣服在甲國設計、乙國製造，再運到丙國販售。",prompt:"這個例子最能說明什麼？",options:["各國經濟完全彼此隔離","生產流程可能跨越多個國家","產品只能在製造國銷售","運輸與貿易已不再重要"],answer:1,explanation:"設計、生產與銷售分布不同國家，呈現全球化分工與跨國連結。",commonError:"只把全球化理解為商品進口，未看到生產鏈分工。"}
    ]
  }
};
