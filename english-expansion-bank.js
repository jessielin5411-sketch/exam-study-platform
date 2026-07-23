/*
 * ExamMate 英文科第一版擴充
 * ---------------------------------------------------------------
 * 英文科先聚焦四個會考核心入口：文法、短文閱讀、長文閱讀、聽力。
 * 題目皆為原創內容，依生活情境、篇章理解與推論能力設計。
 */
(function () {
  "use strict";

  const bank = window.examMateQuestionBank?.english;
  if (!bank) return;

  bank.description = "文法、短文、長文與聽力理解";
  bank.units = [
    { id:"en-grammar", name:"文法", review:["先找時間、主詞與事件先後","文法必須同時符合整句語意","完成後重讀前後文檢查自然度"] },
    { id:"en-short-reading", name:"短文閱讀", review:["先看題目要找哪一項資訊","留意公告、訊息與表格中的限制","用上下文判斷字義與說話目的"] },
    { id:"en-long-reading", name:"長文閱讀", review:["先掌握各段功能再統整主旨","推論必須有文中證據","比較人物觀點、原因與結果"] },
    { id:"en-listening", name:"聽力", review:["播放前先看選項預測重點","第一遍抓主旨，第二遍核對細節","留意時間、地點、目的與轉折"] }
  ];

  // 將舊版題目整理進新的四單元，保留題號以維持既有錯題紀錄。
  const shortReadingSources = new Set(["en-vocab", "en-communication", "en-cloze"]);
  bank.questions.forEach((question) => {
    if (question.unitId === "en-grammar") question.unit = "文法";
    if (shortReadingSources.has(question.unitId)) {
      question.unitId = "en-short-reading";
      question.unit = "短文閱讀";
    }
    if (question.unitId === "en-reading") {
      question.unitId = "en-long-reading";
      question.unit = "長文閱讀";
    }
    if (question.unitId === "en-listening") question.unit = "聽力";
  });

  // 第一版直接以瀏覽器內建英文語音播放，不需要 API 或金鑰。
  const legacyAudio = {
    "en-listening-01":"One ticket to Tainan, please. The next train leaves from Platform two.",
    "en-listening-02":"It's nine fifty. You can play for ten more minutes, and then it's bedtime.",
    "en-listening-03":"Would you like some more soup?",
    "en-listening-04":"Why are you taking the bus today? My bike has a flat tire, and the repair shop opens at ten."
  };
  bank.questions.forEach((question) => {
    if (legacyAudio[question.id]) {
      question.audioText = legacyAudio[question.id];
      question.transcript = legacyAudio[question.id];
      delete question.context;
    }
  });

  const additions = [
    {id:"enx-g01",unitId:"en-grammar",unit:"文法",level:"cap",ability:"依先行詞與句子結構選擇關係代名詞",difficulty:3,prompt:"The student ____ found the wallet took it to the school office.",options:["who","which","where","when"],answer:0,explanation:"先行詞 the student 是人，且空格在關係子句中作主詞，因此用 who。",commonError:"看到後面有完整事件就選 where，卻沒有先判斷先行詞是人。"},
    {id:"enx-g02",unitId:"en-grammar",unit:"文法",level:"cap",ability:"依真實可能條件選擇時態",difficulty:3,prompt:"If the rain ____ before noon, we will hold the game outside.",options:["stops","stopped","will stop","has stopping"],answer:0,explanation:"這是未來仍可能發生的條件；if 子句用現在簡單式 stops，主要子句用 will。",commonError:"因主要子句談未來，就在 if 子句也使用 will。"},
    {id:"enx-g03",unitId:"en-grammar",unit:"文法",level:"cap",ability:"依動作承受者判斷被動語態",difficulty:4,context:"The art club made twenty lanterns last week. They will hang them in the hall tomorrow.",prompt:"Which sentence correctly combines the information?",options:["Twenty lanterns will hang the art club tomorrow.","The hall will be hung twenty lanterns.","Twenty lanterns will be hung in the hall tomorrow.","The art club was hung in the hall."],answer:2,explanation:"燈籠是被懸掛的對象，未來被動式為 will be hung；地點用 in the hall。",commonError:"只看到 will 就選主動句，或把地點誤當成被動句主詞。"},
    {id:"enx-g04",unitId:"en-grammar",unit:"文法",level:"cap",ability:"辨識動名詞與不定詞搭配",difficulty:3,prompt:"Mina enjoys ____ new recipes with her grandmother on weekends.",options:["try","to tried","trying","tried"],answer:2,explanation:"enjoy 後面接動名詞，因此使用 trying。",commonError:"把所有兩個動詞連用都套成 to＋原形。"},
    {id:"enx-g05",unitId:"en-grammar",unit:"文法",level:"cap",ability:"使用間接問句的直述語序",difficulty:4,prompt:"Could you tell me ____?",options:["where is the nearest bus stop","where the nearest bus stop is","the nearest bus stop is where","where does the bus stop"],answer:1,explanation:"間接問句保留疑問詞，但後面使用主詞＋動詞的直述語序。",commonError:"受到直接問句 Where is...? 影響，仍把 be 動詞放在主詞前。"},
    {id:"enx-g06",unitId:"en-grammar",unit:"文法",level:"cap",ability:"由比較範圍判斷最高級",difficulty:3,context:"Four routes take 28, 34, 31, and 26 minutes.",prompt:"Route D takes ____ time of the four.",options:["little","less","the least","the fewer"],answer:2,explanation:"比較四條路線，D 的 26 分鐘最少，需用最高級 the least 修飾不可數名詞 time。",commonError:"看到數字較小就選比較級 less，忽略比較範圍是四者。"},
    {id:"enx-g07",unitId:"en-grammar",unit:"文法",level:"cap",ability:"整合結果句型與語意",difficulty:4,prompt:"The box was ____ heavy for one student to carry, so two students moved it together.",options:["so","too","very","enough"],answer:1,explanation:"too＋形容詞＋for someone＋to V 表示太……而無法……，與後面需要兩人搬相符。",commonError:"選 very 只表示很重，無法形成後面的 for one student to carry 結構。"},
    {id:"enx-g08",unitId:"en-grammar",unit:"文法",level:"cap",ability:"依長短動作關係使用過去進行式",difficulty:4,prompt:"While I ____ for the bus, I saw a rainbow above the school.",options:["wait","was waiting","have waited","will wait"],answer:1,explanation:"等公車是當時持續中的背景動作，看到彩虹是短暫事件，因此用 was waiting。",commonError:"看到 saw 就讓兩個動作都用過去簡單式，忽略 while 的持續背景。"},
    {id:"enx-g09",unitId:"en-grammar",unit:"文法",level:"cap",ability:"依目的關係選擇連接語",difficulty:4,prompt:"Please write your name on the bottle ____ no one takes it by mistake.",options:["even though","so that","as soon as","unless"],answer:1,explanation:"寫名字的目的是避免別人拿錯，so that 可連接行動與目的。",commonError:"只翻譯單一連接詞，沒有確認前後句是目的而非讓步。"},
    {id:"enx-g10",unitId:"en-grammar",unit:"文法",level:"cap",ability:"判斷 neither...nor 的主詞動詞一致",difficulty:5,prompt:"Neither the teachers nor Kevin ____ the key to the music room.",options:["have","has","having","are having"],answer:1,explanation:"neither A nor B 的動詞通常與較近的主詞一致；Kevin 為第三人稱單數，用 has。",commonError:"看到 teachers 是複數就直接選 have，沒有檢查靠近動詞的主詞。"},
    {id:"enx-g11",unitId:"en-grammar",unit:"文法",level:"cap",ability:"依兩個過去事件的先後選擇完成式",difficulty:5,context:"Nora reached the theater at 7:10. The movie started at 7:00.",prompt:"When Nora reached the theater, the movie ____.",options:["starts","has started","had already started","will start"],answer:2,explanation:"電影開始發生在 Nora 到達之前，兩者都是過去事件，較早者用過去完成式 had started。",commonError:"只看句中 reached 是過去式，忽略還要表達另一件更早發生的事。"},

    {id:"enx-s01",unitId:"en-short-reading",unit:"短文閱讀",level:"cap",ability:"整合簡訊中的時間與行動",difficulty:4,context:"3:40 Leo: I left my science notebook in Room 203.\n3:43 May: The room is locked now. Ms. Wu will open it again at 4:10.\n3:45 Leo: Thanks. My bus leaves at 4:20, so I'll wait by the office.",prompt:"What will Leo most likely do at 4:10?",options:["Take the bus home","Meet May in Room 203","Get his notebook before his bus leaves","Ask Ms. Wu to bring the notebook tomorrow"],answer:2,explanation:"教室 4:10 會再開，公車 4:20 才離開，因此 Leo 最可能先取回筆記本再搭車。",commonError:"只看到 bus leaves at 4:20 就選回家，沒有整合教室重新開門的時間。"},
    {id:"enx-s02",unitId:"en-short-reading",unit:"短文閱讀",level:"cap",ability:"依公告核對多項參加條件",difficulty:4,context:"ROBOT DAY\nSaturday, 9:00–12:00\nFor students in Grades 7–9\nBring a tablet if you have one. Lunch is not provided.\nSign up by Thursday. Only 24 seats are available.",prompt:"Which student can follow all the information in the notice?",options:["A Grade 6 student who signs up Wednesday","A Grade 8 student who expects free lunch","A Grade 9 student who signs up Thursday and has no tablet","A Grade 7 student who arrives Saturday afternoon"],answer:2,explanation:"平板是有則攜帶，不是必要條件；九年級、週四前報名且上午參加都符合公告。",commonError:"把 Bring a tablet if you have one 誤讀為沒有平板就不能參加。"},
    {id:"enx-s03",unitId:"en-short-reading",unit:"短文閱讀",level:"cap",ability:"交叉比對表格與個人限制",difficulty:5,visual:{type:"table",title:"After-school Workshops",columns:["Workshop","Day","Time","Note"],rows:[["Podcast","Tue.","4:20–5:20","Bring earphones"],["Cooking","Wed.","4:00–5:30","Fee: NT$80"],["Photography","Thu.","4:30–5:30","Beginners welcome"]]},context:"Ivy is free on Tuesday and Thursday, but she must leave school by 5:25. She wants an activity for beginners and does not have earphones.",prompt:"Which workshop is the best choice for Ivy?",options:["Podcast","Cooking","Photography","No workshop fits"],answer:3,explanation:"Podcast 需要耳機且她沒有，Cooking 的星期不符，Photography 到 5:30 才結束，也超過她 5:25 的離校時間，因此沒有活動完全符合。",commonError:"只看 Beginners welcome 就選 Photography，沒有核對最晚離校時間。"},

    {id:"enx-l01",unitId:"en-long-reading",unit:"長文閱讀",level:"cap",ability:"統整段落功能判斷主旨",difficulty:4,context:"Many students believe that studying longer always leads to better results. However, the brain's attention becomes weaker after working without a break. A short pause can help, but only when it truly rests the mind. Watching several fast videos may feel relaxing, yet it keeps the brain busy. Walking, stretching, or drinking water is often more helpful. The goal is not to study less. It is to return to the task with enough attention to learn well.",prompt:"Which sentence best states the writer's main point?",options:["Students should stop studying whenever work feels difficult","Useful breaks can help students return to study with better attention","Fast videos are the best reward after studying","Long study hours always produce poor results"],answer:1,explanation:"文章先指出長時間不休息的限制，再說明真正讓大腦休息的短暫休息有助於恢復注意力。",commonError:"只記住 fast videos 的例子，沒有統整作者對『有效休息』的完整觀點。"},
    {id:"enx-l02",unitId:"en-long-reading",unit:"長文閱讀",level:"cap",ability:"比較兩則文本的觀點與證據",difficulty:5,context:"Text A — Our school should post the lunch menu one week earlier. Students with allergies would have more time to ask questions, and families could plan meals.\n\nText B — Posting early is useful, but the menu sometimes changes when food deliveries are late. The school should mark the menu as a plan and send an update when anything changes.",prompt:"Which statement best describes the relationship between the two texts?",options:["Text B completely disagrees with posting the menu early","Both support early information, while Text B adds a way to handle changes","Text A discusses health, but Text B only discusses food prices","Both believe the menu should never be changed"],answer:1,explanation:"兩文都認為提早公布有幫助；乙文不是反對，而是補充標示暫定內容並更新的做法。",commonError:"看到 but 就以為乙文完全反對甲文。"},
    {id:"enx-l03",unitId:"en-long-reading",unit:"長文閱讀",level:"cap",ability:"由行動與前後變化推論人物成長",difficulty:5,context:"On her first day as the class plant keeper, Zoe watered every pot until water ran onto the floor. A week later, some leaves had turned yellow. She wanted to add more water, but first she read the care cards beside the plants. She learned that each plant needed a different amount. Zoe then made a small chart and checked the soil before watering. By the end of the month, new leaves had appeared.",prompt:"What did Zoe learn from the experience?",options:["Plants grow fastest when they receive the same care","Reading directions is less useful than working quickly","Good care requires observing needs and adjusting actions","Yellow leaves always mean a plant needs more water"],answer:2,explanation:"Zoe 從一律大量澆水，改成閱讀資料、觀察土壤並依植物調整，說明有效照顧需要觀察與修正。",commonError:"把一開始的錯誤行動當成結論，或用常識取代文中變化。"},
    {id:"enx-l04",unitId:"en-long-reading",unit:"長文閱讀",level:"cap",ability:"評估資料能支持的結論範圍",difficulty:5,context:"A class wanted to know whether background music helps students remember words. Ten students studied one word list with music on Monday and a different list without music on Friday. Eight students scored higher on Monday. The class concluded that music improves everyone's memory. Their teacher asked them to think about the two word lists, the days of the week, and the small number of students.",prompt:"Why did the teacher question the conclusion?",options:["The study compared too many schools","The test did not include any words","Other differences besides music may have affected the scores","Eight students are never enough to take a test"],answer:2,explanation:"字表不同、測驗日不同且樣本小，音樂不是唯一差異，因此不能直接推論音樂提升所有人的記憶。",commonError:"只看 8 人較高就接受結論，忽略研究設計中的其他變因。"},

    {id:"enx-a01",unitId:"en-listening",unit:"聽力",level:"cap",ability:"辨識請求與自然回應",difficulty:2,audioText:"Could you save me a seat near the front?",transcript:"Could you save me a seat near the front?",prompt:"What should the listener say?",options:["Sure. I'll put my bag on the chair next to me.","The front door is closed.","I saved the file yesterday.","This seat is made of wood."],answer:0,explanation:"對方請求保留前排座位，最自然的回應是答應並說明會保留旁邊的椅子。逐字稿：Could you save me a seat near the front?",commonError:"聽到 save 就誤選與儲存檔案有關的句子。"},
    {id:"enx-a02",unitId:"en-listening",unit:"聽力",level:"cap",ability:"由場所詞彙推論對話地點",difficulty:3,audioText:"Please place your books on the counter. You can return them here, but new books are checked out on the second floor.",transcript:"Please place your books on the counter. You can return them here, but new books are checked out on the second floor.",prompt:"Where is the speaker most likely?",options:["At a library","At a bakery","At a train station","At a sports center"],answer:0,explanation:"return books、checked out、second floor 等線索都指向圖書館。",commonError:"只聽到 counter 就聯想到商店，忽略借還書的關鍵語。"},
    {id:"enx-a03",unitId:"en-listening",unit:"聽力",level:"cap",ability:"整合時間與先後順序",difficulty:4,audioText:"The talk starts at two thirty. Let's meet fifteen minutes earlier by the main gate, because it takes five minutes to walk to the room.",transcript:"The talk starts at 2:30. Let's meet fifteen minutes earlier by the main gate, because it takes five minutes to walk to the room.",prompt:"What time will the speakers meet?",options:["2:05","2:10","2:15","2:25"],answer:2,explanation:"活動 2:30 開始，約定提早 15 分鐘集合，因此是 2:15；步行 5 分鐘是補充理由。",commonError:"把步行 5 分鐘也從集合時間再扣一次。"},
    {id:"enx-a04",unitId:"en-listening",unit:"聽力",level:"cap",ability:"理解說話者的主要目的",difficulty:4,audioText:"Hi, this is Sam. I borrowed your umbrella yesterday. I left it with Ms. Chen because you had already gone home. Please pick it up from her desk tomorrow.",transcript:"Hi, this is Sam. I borrowed your umbrella yesterday. I left it with Ms. Chen because you had already gone home. Please pick it up from her desk tomorrow.",prompt:"Why is Sam leaving the message?",options:["To ask to borrow an umbrella","To explain where the umbrella is","To invite Ms. Chen to go home","To buy a new umbrella tomorrow"],answer:1,explanation:"Sam 主要告知雨傘已放在陳老師桌上，請對方明天領取。",commonError:"聽到 borrowed 就選借傘，沒有追蹤訊息最後要對方採取的行動。"},
    {id:"enx-a05",unitId:"en-listening",unit:"聽力",level:"cap",ability:"由語氣與轉折推論態度",difficulty:4,audioText:"I thought the history tour would be boring, but the guide let us open copies of old letters and solve a mystery. I wish we had another hour.",transcript:"I thought the history tour would be boring, but the guide let us open copies of old letters and solve a mystery. I wish we had another hour.",prompt:"How does the speaker feel about the tour at the end?",options:["Interested and pleased","Still bored","Angry with the guide","Worried about the letters"],answer:0,explanation:"but 後描述有趣活動，I wish we had another hour 表示希望能繼續，態度正面。",commonError:"只記住開頭 boring，忽略轉折後才是最後態度。"},
    {id:"enx-a06",unitId:"en-listening",unit:"聽力",level:"cap",ability:"依多步驟指示判斷下一步",difficulty:4,audioText:"First, write your group number on the cup. Then add two spoons of soil. Do not add the seeds until your teacher checks the amount.",transcript:"First, write your group number on the cup. Then add two spoons of soil. Do not add the seeds until your teacher checks the amount.",prompt:"The student has written the group number. What should the student do next?",options:["Add the seeds","Ask the teacher to water the cup","Put two spoons of soil in the cup","Erase the group number"],answer:2,explanation:"完成寫號碼後，下一步是加入兩匙土；種子要等老師檢查後才放。",commonError:"選到最後聽見的 seeds，卻沒有依 first、then 的順序作答。"},
    {id:"enx-a07",unitId:"en-listening",unit:"聽力",level:"cap",ability:"擷取校園廣播中的關鍵變更",difficulty:4,audioText:"Attention, runners. Because of the wet field, today's race will begin at the gym entrance, not beside the playground. The starting time is still four o'clock.",transcript:"Attention, runners. Because of the wet field, today's race will begin at the gym entrance, not beside the playground. The starting time is still 4:00.",prompt:"What has changed about the race?",options:["Its date","Its starting place","Its starting time","The people who can join"],answer:1,explanation:"時間仍是四點，改變的是起點：由操場旁改為體育館入口。",commonError:"聽到 wet field 就猜活動取消，或忽略 not... 的修正訊息。"},
    {id:"enx-a08",unitId:"en-listening",unit:"聽力",level:"cap",ability:"從建議推論原先問題",difficulty:5,audioText:"The pictures are clear, but the words at the bottom are too small for people in the back. Why don't we shorten the sentences and use a larger font?",transcript:"The pictures are clear, but the words at the bottom are too small for people in the back. Why don't we shorten the sentences and use a larger font?",prompt:"What problem are the speakers discussing?",options:["The poster has no pictures","The presentation is too short","Some audience members cannot read the text easily","The font file is missing from the computer"],answer:2,explanation:"後排看不清底部小字，因此建議縮短句子並放大字體。",commonError:"聽到 pictures are clear 就誤以為問題與圖片有關。"},
    {id:"enx-a09",unitId:"en-listening",unit:"聽力",level:"cap",ability:"理解數量與剩餘資訊",difficulty:4,audioText:"We need thirty name cards. I printed eighteen before lunch and seven more just now. Could you print the rest?",transcript:"We need 30 name cards. I printed 18 before lunch and 7 more just now. Could you print the rest?",prompt:"How many more name cards are needed?",options:["5","7","11","12"],answer:0,explanation:"已印 18＋7＝25 張，總共要 30 張，還差 5 張。",commonError:"直接選最後聽到的數字 7，沒有完成加減運算。"},
    {id:"enx-a10",unitId:"en-listening",unit:"聽力",level:"cap",ability:"掌握簡短言談的主旨",difficulty:5,audioText:"Keeping a study notebook does not mean copying every sentence from class. Write down one key idea, one question you still have, and one example in your own words. This makes the notebook useful when you review later.",transcript:"Keeping a study notebook does not mean copying every sentence from class. Write down one key idea, one question you still have, and one example in your own words. This makes the notebook useful when you review later.",prompt:"What is the speaker mainly explaining?",options:["Why students should write faster","How to make study notes useful","When teachers should collect notebooks","Why every class sentence is important"],answer:1,explanation:"說話者用三項具體做法說明如何寫出之後真正有用的複習筆記。",commonError:"抓到 opening 的 copying every sentence，卻把被否定的做法當成主旨。"},
    {id:"enx-a11",unitId:"en-listening",unit:"聽力",level:"cap",ability:"由對話判斷下一個行動",difficulty:5,audioText:"Girl: The website says the workshop is full. Boy: It also says to email them if we want to join the waiting list. Girl: Good. Let's do that before we choose another activity.",transcript:"Girl: The website says the workshop is full. Boy: It also says to email them if we want to join the waiting list. Girl: Good. Let's do that before we choose another activity.",prompt:"What will the speakers most likely do next?",options:["Go directly to the workshop","Send an email to join the waiting list","Remove the workshop from the website","Choose another activity without contacting anyone"],answer:1,explanation:"女孩同意先照網站說明寄信加入候補名單，再考慮其他活動。",commonError:"只聽到 workshop is full 就認為他們會立刻放棄。"}
  ];

  const existingIds = new Set(bank.questions.map((question) => question.id));
  additions.forEach((question) => {
    if (!existingIds.has(question.id)) bank.questions.push(question);
  });

  // 平衡四個答案位置，避免學生從選項位置猜答案；60 題各 15 題為 A、B、C、D。
  bank.questions.forEach((question, index) => {
    const targetAnswer = index % 4;
    if (question.answer === targetAnswer) return;
    const correctOption = question.options[question.answer];
    const distractors = question.options.filter((_, optionIndex) => optionIndex !== question.answer);
    let distractorIndex = 0;
    question.options = question.options.map((_, optionIndex) => (
      optionIndex === targetAnswer ? correctOption : distractors[distractorIndex++]
    ));
    question.answer = targetAnswer;
  });
})();
