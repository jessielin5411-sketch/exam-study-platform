/*
 * ExamMate 108～114 會考實戰題庫
 * ----------------------------------------------------------------
 * 每一題對應民國 108～114 年國中教育會考的命題能力與題型趨勢，
 * 但題幹、情境、數字、選項和解析均為 ExamMate 原創，不重製官方試卷文字。
 * 官方歷屆題本請由國中教育會考網站取得：
 * https://cap.rcpet.edu.tw/examination.html
 */
(function () {
  "use strict";

  const additions = {
    chinese: [
      {id:"history-108-ch-01",referenceYear:108,unitId:"ch-meaning",unit:"文意理解",level:"cap",ability:"由轉折語氣掌握作者的主張",difficulty:4,context:"有人說，讀書筆記越精美越有效；但筆記真正的價值，不在色彩是否整齊，而在能否留下自己的疑問與修正。",prompt:"這段文字主要想提醒讀者什麼？",options:["筆記必須使用多種顏色","筆記的外觀比內容重要","筆記要幫助自己思考與修正","只要有疑問就不必讀書"],answer:2,explanation:"「但」後指出重點：筆記的價值在思考與修正，不在外觀。",commonError:"只注意前半段的精美筆記，忽略轉折後的作者觀點。"},
      {id:"history-109-ch-01",referenceYear:109,unitId:"ch-rhetoric",unit:"修辭",level:"cap",ability:"辨識轉化並說明表達效果",difficulty:4,prompt:"「午後的陽光沿著走廊慢慢爬，替每一扇窗鍍上一層金邊。」主要使用哪種修辭？",options:["借代","轉化","設問","引用"],answer:1,explanation:"陽光被寫成會「爬」的生命，屬轉化中的擬人，使光線移動的畫面更具體。",commonError:"看見「金邊」便誤判為譬喻，忽略關鍵的人類動作「爬」。"},
      {id:"history-110-ch-01",referenceYear:110,unitId:"ch-classical",unit:"文言文",level:"cap",ability:"由文言情境推論人物行事原則",difficulty:5,context:"郡守問吏曰：「民訟紛然，何以決之？」吏請速斷。守曰：「速未必明。當先聽其辭，驗其證，而後定。」",prompt:"郡守處理爭訟最重視的是什麼？",options:["盡快做出決定","只相信官吏意見","蒐集雙方說法與證據後判斷","讓所有案件延後處理"],answer:2,explanation:"「聽其辭，驗其證，而後定」表示先理解雙方說法並核對證據，才能判斷。",commonError:"把「不求速斷」誤解成拖延，而沒有看到他強調的是程序與證據。"},
      {id:"history-111-ch-01",referenceYear:111,unitId:"ch-reading",unit:"閱讀理解",level:"cap",ability:"比較兩段文字的共同觀點",difficulty:5,context:"甲：社團活動讓學生練習合作，但若只追求熱鬧，容易忽略每個人的角色。\n乙：分組報告不必由最會說話的人完成；清楚分工，才能讓不同專長都被看見。",prompt:"甲、乙兩段文字共同強調什麼？",options:["合作時只需要一位領導者","活動人數越多越好","合作要有清楚分工與角色參與","安靜的學生不適合分組"],answer:2,explanation:"兩段都指出合作的價值在於角色分工，讓每個人能實際參與。",commonError:"只從甲看到「熱鬧」或只從乙看到「報告」，未統整兩段共同主張。"},
      {id:"history-112-ch-01",referenceYear:112,unitId:"ch-idiom",unit:"成語",level:"cap",ability:"依語境判斷成語使用是否恰當",difficulty:4,prompt:"下列文句中，成語使用最恰當的是哪一項？",options:["這次比賽他雖獲得第一名，仍感到差強人意。","老師循循善誘，讓原本害怕發問的同學願意開口。","小華完全沒有準備，卻胸有成竹地四處查資料。","這項工作迫在眉睫，因此可以從長計議。"],answer:1,explanation:"「循循善誘」指善於有步驟地引導，符合老師鼓勵同學發問的情境。",commonError:"把「差強人意」誤當不滿意，或未檢查成語是否與前後語意衝突。"},
      {id:"history-113-ch-01",referenceYear:113,unitId:"ch-vernacular",unit:"白話文",level:"cap",ability:"判斷論點能否被證據支持",difficulty:5,context:"校刊調查 80 位學生的午休安排，發現有 52 位會到操場散步。編輯據此寫道：「散步一定能提高全校學生下午的考試成績。」",prompt:"這個結論最主要的問題是什麼？",options:["受訪學生太多","調查沒有記錄午休時間","散步人數不能直接證明成績因果，也不能代表所有學生","下午不可能有考試"],answer:2,explanation:"資料只顯示部分學生的行為，沒有測量成績或控制其他因素，不能推出因果與全體結論。",commonError:"只注意樣本數，沒有檢查調查內容是否真的支持結論。"},
      {id:"history-114-ch-01",referenceYear:114,unitId:"ch-integrated",unit:"綜合測驗",level:"cap",ability:"整合公告條件做出適切選擇",difficulty:4,visual:{type:"table",title:"校園講座報名資訊",columns:["講座","日期","時間","對象"],rows:[["甲：閱讀策略","週三","16:20－17:20","七、八年級"],["乙：寫作練習","週四","16:30－18:00","八、九年級"],["丙：科展入門","週四","16:10－17:00","全校"]]},context:"小安是九年級，週四 17:10 前必須離校，想參加和語文有關的講座。",prompt:"他最適合報名哪一場？",options:["甲","乙","丙","三場都不適合"],answer:3,explanation:"甲不符年級與日期；乙雖是語文相關但 18:00 才結束；丙不符語文需求，因此沒有符合全部條件的選項。",commonError:"只比對「九年級」或「週四」其中一項，沒有逐一核對全部限制。"}
    ],
    english: [
      {id:"history-108-en-01",referenceYear:108,unitId:"en-grammar",unit:"文法",level:"cap",ability:"依時間線索選擇正確時態",difficulty:4,prompt:"Mina ____ her homework before she went to bed last night.",options:["finishes","has finished","had finished","is finishing"],answer:2,explanation:"完成作業發生在「上床睡覺」之前的過去，使用過去完成式 had finished。",commonError:"看到 last night 就只選過去式，忽略兩個過去事件的先後。"},
      {id:"history-109-en-01",referenceYear:109,unitId:"en-reading-short",unit:"短文閱讀",level:"cap",ability:"依公告資訊判斷可行安排",difficulty:4,context:"Library Notice\nMon.–Thu.: 8:00 a.m.–6:00 p.m.\nFriday: 8:00 a.m.–8:00 p.m.\nThe study rooms must be booked one day early.",prompt:"Which student can use a study room at 7 p.m. this Friday?",options:["Amy, who books it on Thursday.","Ben, who books it at 6:30 p.m. on Friday.","Cindy, who comes on Monday at 7 p.m.","David, who does not make a booking."],answer:0,explanation:"週五圖書館開到晚上八點，且研討室要提前一天預約；只有 Amy 同時符合。",commonError:"只看營業時間，漏掉必須提前一天預約的條件。"},
      {id:"history-110-en-01",referenceYear:110,unitId:"en-vocabulary",unit:"核心單字",level:"cap",ability:"依上下文選擇詞義相符的單字",difficulty:4,prompt:"The bridge was closed because it was not ____ for people to walk on after the storm.",options:["safe","busy","cheap","quiet"],answer:0,explanation:"暴風雨後橋梁關閉的原因是安全性，safe 最符合語意。",commonError:"只把 storm 與 busy 等常見單字連結，沒有讀完整句意。"},
      {id:"history-111-en-01",referenceYear:111,unitId:"en-reading-long",unit:"長文閱讀",level:"cap",ability:"找出代名詞指涉對象",difficulty:5,context:"At first, Leo wanted to throw away his old bike. His neighbor suggested fixing it and giving it to the community center. The center later lent the bike to children who needed one. This made Leo realize that useful things can have a second life.",prompt:"What does “This” refer to?",options:["Throwing away the bike","The neighbor moving away","The bike being repaired and used by children","Leo buying a new bike"],answer:2,explanation:"This 指前一句提到的自行車被社區中心借給需要的孩子使用。",commonError:"只抓最近的單字 bike，而沒有回看前面完整事件。"},
      {id:"history-112-en-01",referenceYear:112,unitId:"en-grammar",unit:"文法",level:"cap",ability:"辨識關係代名詞在句中的功能",difficulty:5,prompt:"The student ____ won the science contest will share her project tomorrow.",options:["which","whose","who","where"],answer:2,explanation:"先行詞是人 student，且關係代名詞在子句中作主詞，因此用 who。",commonError:"看見 science contest 就猜 which，忽略先行詞是人及子句中的位置。"},
      {id:"history-113-en-01",referenceYear:113,unitId:"en-listening",unit:"聽力",level:"cap",ability:"從對話推論說話者的下一步",difficulty:4,audioText:"Woman: Are you going to the movie at six? Man: I want to, but I have to finish my report first. If I am done by seven, I will meet you there.",transcript:"Woman: Are you going to the movie at six? Man: I want to, but I have to finish my report first. If I am done by seven, I will meet you there.",prompt:"What will the man probably do first?",options:["Go to the movie at six.","Finish his report.","Buy tickets for the woman.","Call the teacher."],answer:1,explanation:"男生說必須先完成報告，若七點前完成才會去電影院。",commonError:"只聽到 movie 就選看電影，忽略 but 後的轉折與條件。"},
      {id:"history-114-en-01",referenceYear:114,unitId:"en-reading-long",unit:"長文閱讀",level:"cap",ability:"統整文章目的與細節",difficulty:5,context:"Our school started a “Walk-and-Read” program. Students choose a short article, walk slowly around the track for ten minutes, and then discuss one idea from it. Teachers do not expect students to read quickly. Instead, they hope students will connect reading with a calm daily habit.",prompt:"What is the main purpose of the program?",options:["To train students to run faster.","To make students finish more articles.","To help students build a relaxed reading habit.","To replace all classroom reading."],answer:2,explanation:"文章說明重點不是快速閱讀，而是把閱讀連結到平靜的日常習慣。",commonError:"只看到 track 便誤以為計畫重點是運動。"}
    ],
    math: [
      {id:"history-108-ma-01",referenceYear:108,unitId:"ma-algebra",unit:"代數",level:"cap",ability:"由生活情境建立一次方程式",difficulty:4,context:"影印店收取基本費 12 元，每張黑白影印 2 元。小芸共付 46 元。",prompt:"小芸影印了幾張？",options:["12 張","15 張","17 張","23 張"],answer:2,explanation:"設影印 x 張，12＋2x＝46，得 x＝17。",commonError:"忘記先扣掉基本費，直接用 46 ÷ 2。"},
      {id:"history-109-ma-01",referenceYear:109,unitId:"ma-geometry",unit:"幾何",level:"cap",ability:"由面積條件求未知長度",difficulty:4,context:"一個長方形花圃的長比寬多 5 公尺，面積為 84 平方公尺。",prompt:"花圃的寬最可能是多少公尺？",options:["6","7","8","9"],answer:1,explanation:"設寬為 x，則 x(x＋5)=84；7×12=84，所以寬是 7。",commonError:"只找接近 84 的數字，未同時符合長比寬多 5。"},
      {id:"history-110-ma-01",referenceYear:110,unitId:"ma-statistics",unit:"統計與機率",level:"cap",ability:"由資料判斷平均數變化",difficulty:5,visual:{type:"table",title:"四次小考分數",columns:["次數","甲","乙"],rows:[["第一次","70","80"],["第二次","80","70"],["第三次","90","60"],["第四次","60","90"]]},prompt:"依表格判斷，下列敘述何者正確？",options:["甲的平均分數較高","乙的平均分數較高","兩人的平均分數相同","無法計算平均分數"],answer:2,explanation:"甲與乙的總分皆為 300，平均都是 75。",commonError:"只看到最高分或最後一次成績，沒有加總全部資料。"},
      {id:"history-111-ma-01",referenceYear:111,unitId:"ma-function",unit:"函數",level:"cap",ability:"閱讀線性關係的變化率",difficulty:5,context:"計程車車資 y 元與行駛公里數 x 的關係為 y＝85＋12x。",prompt:"下列何者最能說明 12 的意義？",options:["上車基本費 12 元","每多行駛 1 公里增加 12 元","行駛 12 公里不用錢","總車資固定是 12 元"],answer:1,explanation:"式中的常數 85 是基本費，x 的係數 12 表示每增加 1 公里增加的車資。",commonError:"把常數項與 x 的係數意義互換。"},
      {id:"history-112-ma-01",referenceYear:112,unitId:"ma-number",unit:"數與量",level:"cap",ability:"比較百分率變化",difficulty:4,context:"一件商品先打八折，再折抵原價的 10%。原價是 500 元。",prompt:"最後售價是多少元？",options:["350","360","400","450"],answer:0,explanation:"先打八折為 400 元，再折抵原價 500 的 10%＝50 元，售價 350 元。",commonError:"把第二次折扣誤當成對折後價格再打九折。"},
      {id:"history-113-ma-01",referenceYear:113,unitId:"ma-geometry",unit:"幾何",level:"cap",ability:"利用相似形比例求長度",difficulty:5,context:"一根 1.5 公尺高的竿子在陽光下影長 2 公尺；同一時間一棵樹影長 8 公尺。",prompt:"這棵樹高多少公尺？",options:["4","5","6","10"],answer:2,explanation:"同一時間太陽角度相同，高與影長成比例：1.5／2＝x／8，x＝6。",commonError:"把 8 除以 1.5，卻忘記影長也要對應。"},
      {id:"history-114-ma-01",referenceYear:114,unitId:"ma-algebra",unit:"代數",level:"cap",ability:"檢查解是否符合原題限制",difficulty:5,context:"某活動每組至少 3 人、至多 5 人。共有 28 人要平均分組，且每組人數相同。",prompt:"下列哪一種分組方式可行？",options:["4 組，每組 7 人","5 組，每組 5 人","7 組，每組 4 人","9 組，每組 3 人"],answer:2,explanation:"7 組×4 人＝28，且每組 4 人落在 3 到 5 人的限制內。",commonError:"只檢查每組人數是否符合範圍，忘了總人數必須剛好 28。"}
    ],
    science: [
      {id:"history-108-sc-01",referenceYear:108,unitId:"sc-physics",unit:"物理",level:"cap",ability:"由控制變因設計判斷實驗",difficulty:4,context:"小婷想探究斜面角度是否影響小車滑到底端所需時間。",prompt:"下列哪一項應保持相同，才能公平比較？",options:["斜面角度","小車釋放位置與小車質量","每次量到的時間","是否記錄結果"],answer:1,explanation:"研究斜面角度時，其他可能影響時間的條件，如小車、起點，應保持一致。",commonError:"把要改變的變因也選成控制變因。"},
      {id:"history-109-sc-01",referenceYear:109,unitId:"sc-biology",unit:"生物",level:"cap",ability:"由構造功能推論物質運輸",difficulty:4,context:"植物根部吸收的水分，會經由一種管道向上運送到葉片。",prompt:"此管道最主要的功能是什麼？",options:["運送水分和礦物質","製造養分","吸收氧氣","儲存遺傳物質"],answer:0,explanation:"根吸收的水與礦物質主要經木質部向上運輸。",commonError:"把葉片製造養分的功能誤放到根部運輸管道。"},
      {id:"history-110-sc-01",referenceYear:110,unitId:"sc-chemistry",unit:"化學",level:"cap",ability:"判斷反應前後質量守恆的條件",difficulty:5,context:"密閉瓶中裝有醋與小蘇打，混合後產生氣泡；用天平測量混合前後整個密閉瓶的質量。",prompt:"下列何者最合理？",options:["反應後質量一定變小","反應後質量一定變大","混合前後整個系統質量相同","因為有氣泡所以無法測量"],answer:2,explanation:"在密閉系統中，物質沒有進出，反應前後總質量守恆。",commonError:"看到氣體產生就以為質量消失，忽略瓶子是密閉的。"},
      {id:"history-111-sc-01",referenceYear:111,unitId:"sc-earth",unit:"地球科學",level:"cap",ability:"由天氣圖資訊推論降雨機率",difficulty:4,context:"氣象報告指出：某地上空有較厚雲層，空氣上升並逐漸冷卻。",prompt:"最可能發生哪一種現象？",options:["水氣凝結，降雨機率提高","空氣永遠不含水氣","地表立刻停止受熱","風一定完全靜止"],answer:0,explanation:"空氣上升冷卻後，水氣容易凝結形成雲滴，增加降雨可能。",commonError:"把雲層與完全無風或無水氣混為一談。"},
      {id:"history-112-sc-01",referenceYear:112,unitId:"sc-physics",unit:"物理",level:"cap",ability:"用能量轉換解釋生活現象",difficulty:4,context:"手電筒開啟後，電池讓燈泡發亮並發熱。",prompt:"其中最主要的能量轉換為何？",options:["光能轉為化學能","化學能轉為電能，再轉為光能與熱能","熱能轉為電能","機械能轉為核能"],answer:1,explanation:"電池中的化學能先提供電能，燈泡再轉成光與熱。",commonError:"只看到發光就忽略電池與電路中間的電能轉換。"},
      {id:"history-113-sc-01",referenceYear:113,unitId:"sc-biology",unit:"生物",level:"cap",ability:"由生態資料判斷族群關係",difficulty:5,visual:{type:"flow",title:"草原食物關係",steps:["草","蝗蟲","青蛙","蛇"]},prompt:"若青蛙數量明顯減少，短期內最可能先增加的是哪一種生物？",options:["草","蝗蟲","蛇","所有生物都減少"],answer:1,explanation:"青蛙以蝗蟲為食，青蛙減少時蝗蟲受到的捕食壓力下降，數量可能先增加。",commonError:"只記得食物鏈方向，未判斷誰吃誰。"},
      {id:"history-114-sc-01",referenceYear:114,unitId:"sc-chemistry",unit:"化學",level:"cap",ability:"依粒子觀點比較物質狀態",difficulty:5,prompt:"同一種物質由液態變為氣態時，下列敘述何者正確？",options:["分子本身變得更大","分子間距離通常增加","分子數量一定增加","原子種類改變"],answer:1,explanation:"液體變氣體時，粒子本身仍是同種物質，但間距增大、排列更鬆散。",commonError:"把狀態改變誤當成產生新物質。"}
    ],
    social: [
      {id:"history-108-so-01",referenceYear:108,unitId:"so-history",unit:"歷史",level:"cap",ability:"由史料判斷資料觀點與限制",difficulty:4,context:"一則由商人寫的日記記錄新港口開通後貨物運送更快；另一則漁民訪談提到部分作業海域受到限制。",prompt:"研究者面對兩則資料最適合採取何種態度？",options:["只相信日記，因為是當時寫的","只相信訪談，因為有生活經驗","比較來源立場，並尋找其他資料互相驗證","把兩則內容各刪一半後合併"],answer:2,explanation:"不同來源呈現不同利益與經驗，應分析觀點並以其他證據互證。",commonError:"用資料形式直接判定真偽，忽略來源目的。"},
      {id:"history-109-so-01",referenceYear:109,unitId:"so-geography",unit:"地理",level:"cap",ability:"由產業條件推論區位選擇",difficulty:4,context:"某食品工廠需要大量新鮮水果，產品又必須快速送到都市市場。",prompt:"工廠選址時最應優先考量哪一項？",options:["靠近原料產地與交通節點","只選地價最高的地方","遠離所有消費者","只看當地是否有觀光景點"],answer:0,explanation:"新鮮原料需要穩定供應，產品也要快速配送，原料地與交通條件最關鍵。",commonError:"只用單一條件，如地價或觀光，判斷所有產業選址。"},
      {id:"history-110-so-01",referenceYear:110,unitId:"so-civics",unit:"公民與社會",level:"cap",ability:"區分權利與責任的關係",difficulty:4,context:"班級要使用公共平板。大家可以借用，但必須登記、準時歸還，也不能任意刪除他人檔案。",prompt:"這項規定最能說明什麼？",options:["有權使用公共資源就不必遵守規則","權利的行使要兼顧他人與共同責任","只有老師可以使用公共資源","登記制度會取消所有人的權利"],answer:1,explanation:"可借用是權利，登記、歸還與尊重他人資料則是使用共同資源時的責任。",commonError:"把「有權利」理解成完全不受規範。"},
      {id:"history-111-so-01",referenceYear:111,unitId:"so-geography",unit:"地理",level:"cap",ability:"判讀人口資料的變化趨勢",difficulty:5,visual:{type:"table",title:"某鄉鎮人口資料",columns:["年份","出生人數","死亡人數","遷入人數","遷出人數"],rows:[["甲年","120","90","300","260"],["乙年","100","110","240","310"]]},prompt:"依資料判斷，乙年人口變化最可能為何？",options:["自然增加且社會增加","自然減少且社會減少","自然增加且社會減少","無法判斷"],answer:1,explanation:"乙年出生少於死亡，為自然減少；遷入少於遷出，為社會減少。",commonError:"只比較出生與遷入，忘了各自都要和死亡、遷出比較。"},
      {id:"history-112-so-01",referenceYear:112,unitId:"so-history",unit:"歷史",level:"cap",ability:"依時間順序理解制度變遷",difficulty:5,context:"某地先開放港口貿易，後來興建鐵路連接內陸，最後出現以工廠生產為主的新聚落。",prompt:"最合理的歷史解釋是什麼？",options:["工廠一定先於交通出現","交通與貿易發展可能帶動人口與產業集中","港口開放會讓所有農業消失","制度變遷不會影響聚落"],answer:1,explanation:"港口、鐵路改善流通，可能吸引人口與工業聚集；其餘選項過度絕對或違反時間順序。",commonError:"把單一事件當成唯一原因，或忽略題目給出的先後脈絡。"},
      {id:"history-113-so-01",referenceYear:113,unitId:"so-civics",unit:"公民與社會",level:"cap",ability:"判斷市場供需對價格的影響",difficulty:5,context:"連日豪雨使蔬菜產量減少，同時中秋節前餐廳大量採購蔬菜。",prompt:"在其他條件不變下，蔬菜價格最可能如何變化？",options:["下降，因為供給減少","上升，因為供給減少且需求增加","不變，因為市場不能調整","無法判斷，因為有節日"],answer:1,explanation:"產量減少使供給下降，餐廳採購使需求增加，兩者皆推升價格。",commonError:"只分析供給或需求其中一項，沒有綜合題目兩個條件。"},
      {id:"history-114-so-01",referenceYear:114,unitId:"so-integrated",unit:"跨科整合",level:"cap",ability:"依公共政策目標比較方案",difficulty:5,visual:{type:"table",title:"通學改善方案",columns:["方案","主要受益者","可能限制"],rows:[["甲：增設人行道","步行學生","施工期間交通調整"],["乙：免費停車","開車家長","可能增加校門車流"],["丙：縮短圖書館時間","所有學生","學習資源減少"]]},context:"學校希望提升沒有汽車學生的通學安全，同時減少校門口壅塞。",prompt:"最值得優先評估的方案是哪一項？",options:["甲","乙","丙","三案效果相同"],answer:0,explanation:"增設人行道直接提升步行學生安全，也不會鼓勵更多汽車進入校門口。",commonError:"只看方案名稱的便利性，沒有回扣題目的兩個政策目標。"}
    ]
  };

  const bank = window.examMateQuestionBank;
  if (!bank) return;
  Object.entries(additions).forEach(([subjectId, questions]) => {
    if (!bank[subjectId] || !Array.isArray(bank[subjectId].questions)) return;
    const existingIds = new Set(bank[subjectId].questions.map((question) => question.id));
    questions.forEach((question) => {
      if (!existingIds.has(question.id)) bank[subjectId].questions.push(question);
    });
  });

  // 額外保留年度與官方題本入口，供日後做年度篩選、正式題本連結或授權內容管理。
  window.examMateHistoricalExamInfo = {
    officialArchiveUrl: "https://cap.rcpet.edu.tw/examination.html",
    years: [108, 109, 110, 111, 112, 113, 114]
  };
})();
