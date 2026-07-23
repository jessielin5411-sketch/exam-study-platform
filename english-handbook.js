/*
 * ExamMate 英文四大單元會考整理
 * ---------------------------------------------------------------
 * 每個單元都有核心觀念、題型、策略、陷阱，以及可直接複習的講義內容。
 */
(function () {
  "use strict";

  const reviews = window.examMateUnitReviews || {};
  const englishReviews = {
    "en-grammar": {
      summary:"會考文法不是單獨背公式，而是把時態、句型、連接詞與整段語意一起判斷。",
      mustKnow:["時間線索與事件先後決定時態","先找主詞與主要動詞，再判斷句子是否完整","關係子句、被動、比較與連接詞都要回到語意"],
      examPatterns:["對話或短文中的動詞、連接詞與句型選擇","用兩個事件的時間關係考完成式或進行式","將生活情境改寫成被動、關係子句或間接問句"],
      strategy:["圈出時間詞、連接詞與主詞","先判斷空格需要哪一種詞或句型","放回整句朗讀，檢查形式與意思是否都合理"],
      traps:["看到時間詞就套公式，未比較事件先後","只看文法正確，忽略選入後語意不通","直接問句改成間接問句後仍使用倒裝語序"],
      example:{question:"By the time the bus arrived, we ____ for forty minutes. 應選哪一類時態？",answer:"等待早於公車到達且持續一段時間，用過去完成進行式 had been waiting。"},
      handbook:{
        focus:["先判斷句子想表達什麼，再決定文法形式。","一題若有兩個動作，先畫出時間線最穩定。","選入答案後一定從句首重讀到句尾。"],
        comparison:{title:"常考時態判斷",columns:["線索","常見時態","核心判斷"],rows:[["every day／usually","現在簡單式","規律習慣或事實"],["now／at the moment","現在進行式","此刻持續動作"],["for／since＋持續至今","現在完成式","過去開始且與現在有關"],["by the time＋過去事件","過去完成式","較早完成的過去事件"]]},
        workedExample:{prompt:"When Nora reached the theater, the movie ____. A starts B has started C had already started D will start",steps:["兩件事都在過去：電影開始、Nora 到達。","電影 7:00 開始，Nora 7:10 才到，電影較早。","較早的過去事件用 had＋過去分詞。"],answer:"C had already started。"},
        memoryTip:"不要只背『看到 by the time 就選完成式』；要先確認哪一件事較早發生。"
      }
    },
    "en-short-reading": {
      summary:"短文閱讀以訊息、公告、廣告、圖表與短對話為主，重點是快速定位資訊並完整核對限制。",
      mustKnow:["日期、時間、地點、資格與費用常同時出現","題目常把原文換成同義說法，不會只複製相同單字","說話目的與自然回應需看整段互動"],
      examPatterns:["從公告或活動表找出唯一符合條件的選項","由簡訊、電子郵件推論下一步或寫作目的","在短段落中判斷字義、指涉與連接關係"],
      strategy:["先讀題目，圈出要找的人、時間或限制","回到文本逐項核對，不要只看到一個相同字","遇到 NOT／EXCEPT 先標記，避免答反"],
      traps:["只符合一項條件就作答","把 optional 的資訊誤當成必要條件","選到主題相關，卻沒有真正回答問題的句子"],
      example:{question:"公告寫 Bring a tablet if you have one，沒有平板能參加嗎？",answer:"可以；if you have one 表示有的話再帶，不是必要資格。"},
      handbook:{
        focus:["短文題不一定容易，限制條件常藏在 but、only、by、until 後面。","公告題先看題目，再回文本定位，速度會比從頭翻譯更快。","每個選項都要做完整條件檢核。"],
        comparison:{title:"公告常見時間語",columns:["用語","正確理解","易錯點"],rows:[["by Thursday","最晚星期四","不是星期四之後"],["until 5 p.m.","持續到下午五點","不是五點才開始"],["before noon","中午以前","不包含中午後"],["from 2 to 4","二點到四點之間","需核對整個時段"]]},
        workedExample:{prompt:"活動限七至九年級、週六上午、週四前報名；哪位學生符合？",steps:["先查年級資格。","再查日期與時段。","最後查報名期限及攜帶物是否為必要條件。"],answer:"選唯一三項必要條件都符合者。"},
        memoryTip:"看到 only、must、by、not provided，立刻圈起來；它們常是淘汰錯誤選項的關鍵。"
      }
    },
    "en-long-reading": {
      summary:"長文閱讀評量段落統整、主旨、人物態度、合理推論與跨文本比較，不需要逐字翻譯。",
      mustKnow:["每一段通常有功能：提出問題、舉例、轉折、解法或結論","主旨要涵蓋全文，不能只說一個例子","推論必須能指出至少一項文本證據"],
      examPatterns:["故事中的人物改變、原因與下一步","說明或議論文章的主旨、目的與證據","比較兩則短文的共同點、差異或立場關係"],
      strategy:["先快速讀首段、各段首句與結尾建立架構","依題目回到指定段落找證據","主旨題排除太絕對、太局部或超出文章的選項"],
      traps:["用自己的常識代替文本內容","看到相同單字就選，忽略選項整句意思","把作者提出的限制誤讀成完全反對"],
      example:{question:"甲文支持提早公告，乙文說『有幫助，但要更新變動』，兩文關係為何？",answer:"兩文都支持提早提供資訊；乙文補充處理變動的方法，不是完全反對。"},
      handbook:{
        focus:["第一遍讀文章結構，第二遍才依題目找細節。","but、however、therefore 後面常是作者真正要推進的觀點。","主旨答案通常能同時包住問題、發展與結論。"],
        comparison:{title:"閱讀題型對應證據",columns:["題型","要找什麼","不能怎麼答"],rows:[["細節","文中明確資訊或同義改寫","只憑印象"],["推論","兩個以上線索共同支持","加入文本沒有的常識"],["主旨","全文反覆或最後收束的核心","只選單一例子"],["作者目的","文章為何這樣安排與說明","只回答文章主題"]]},
        workedExample:{prompt:"文章先談長時間讀書會失焦，再說明有效短休息能恢復注意力，主旨為何？",steps:["第一段提出問題：注意力會變弱。","中段比較無效與有效的休息。","結尾說目標是帶著注意力回到學習。"],answer:"適當且真正休息大腦的短暫休息，有助於恢復學習注意力。"},
        memoryTip:"選項若出現 always、everyone、never，先檢查原文是否真的支持這麼絕對的範圍。"
      }
    },
    "en-listening": {
      summary:"聽力以基本問答、簡短對話與短篇言談為主，重點是抓人物、地點、時間、目的、轉折和下一步。",
      mustKnow:["播放前看選項可預測要聽地點、數字或態度","第一遍抓主旨，第二遍核對關鍵細節","but、so、before、instead 等詞會改變答案方向"],
      examPatterns:["聽問句選最自然回應","由對話推論地點、問題、目的或下一步","聽廣播與短文整合時間、數量及先後順序"],
      strategy:["先掃過選項，判斷差異集中在哪裡","聽到時間、數字與轉折時在心中做短記號","若漏聽一字，不要停下，繼續追蹤後面的修正訊息"],
      traps:["直接選第一個聽到的名詞或數字","只記住轉折前內容","先閱讀逐字稿，失去真正聽力練習效果"],
      example:{question:"活動 2:30 開始，meet fifteen minutes earlier，幾點集合？",answer:"2:15；先抓 earlier 的方向，再做 30－15 的換算。"},
      handbook:{
        focus:["播放前先看選項，讓耳朵知道要找哪種資訊。","不必逐字翻譯，只需抓住能區分四個選項的關鍵線索。","平台可重播；先聽兩次，再把逐字稿當補救工具。"],
        comparison:{title:"常見聽力線索",columns:["題目要問","優先聽的線索","常見關鍵語"],rows:[["地點","物品、服務、動作","platform、check out、menu"],["時間","起點、提前、延後","earlier、later、still"],["態度","轉折後的形容與願望","but、however、wish"],["下一步","建議、同意與指令順序","let's、good、then"]]},
        workedExample:{prompt:"I thought the tour would be boring, but... I wish we had another hour. 說話者最後的態度？",steps:["thought...boring 是原先預期。","but 表示後面要修正前面的想法。","希望再多一小時表示喜歡並想繼續。"],answer:"最後感到有興趣且滿意。"},
        memoryTip:"會考常把錯誤答案放在轉折前；聽到 but、actually、instead，注意力要立刻提高。"
      }
    }
  };

  Object.entries(englishReviews).forEach(([unitId, review]) => {
    reviews[unitId] = review;
  });
})();
