/* ExamMate 國文題庫擴充：10 單元各新增 6 題，共 60 題原創會考練習。 */
(function () {
  "use strict";
  const questions = [
    // 字音：重視詞義、多音字與固定語詞。
    {id:"chx-phon-01",unitId:"ch-phon",unit:"字音",level:"cap",ability:"辨認常用詞語的正確讀音",difficulty:3,prompt:"下列引號內的字，讀音標示何者正確？",options:["『剽』悍：ㄆㄧㄠˋ","『愜』意：ㄒㄧㄚˊ","『踽』踽獨行：ㄩˇ","『揠』苗助長：ㄧㄢˋ"],answer:0,explanation:"剽悍的「剽」讀ㄆㄧㄠˋ。愜讀ㄑㄧㄝˋ；踽讀ㄐㄩˇ；揠讀ㄧㄚˋ。",commonError:"依字形相近或口語印象猜測，沒有連同詞語記憶。"},
    {id:"chx-phon-02",unitId:"ch-phon",unit:"字音",level:"cap",ability:"比較多音字在不同語境中的讀音",difficulty:4,prompt:"下列各組『參』字，前後讀音相同的是哪一組？",options:["參加／人參","參與／參考","參差／參拜","人參／參差"],answer:1,explanation:"參與、參考的「參」都讀ㄘㄢ。人參讀ㄕㄣ；參差讀ㄘㄣ。",commonError:"只記得「參」的一種讀音。"},
    {id:"chx-phon-03",unitId:"ch-phon",unit:"字音",level:"cap",ability:"辨認文言詞語中的特殊讀音",difficulty:4,prompt:"下列文句引號內的字，讀音何者錯誤？",options:["不亦『說』乎：ㄩㄝˋ","『好』學深思：ㄏㄠˋ","風吹草『低』見牛羊：ㄒㄧㄢˋ","學而不『思』則罔：ㄙˋ"],answer:3,explanation:"「思」讀ㄙ。其餘分別為喜悅的說ㄩㄝˋ、喜好的好ㄏㄠˋ、同「現」的見ㄒㄧㄢˋ。",commonError:"看到文言文便把所有字都想成特殊讀音。"},
    {id:"chx-phon-04",unitId:"ch-phon",unit:"字音",level:"cap",ability:"依詞義判斷多音字",difficulty:4,prompt:"下列『薄』字的讀音，何者與其他三者不同？",options:["日薄西山","妄自菲薄","如履薄冰","薄荷清香"],answer:3,explanation:"薄荷的「薄」讀ㄅㄛˋ；其餘皆讀ㄅㄛˊ。",commonError:"忽略「薄荷」是固定詞語的特殊讀音。"},
    {id:"chx-phon-05",unitId:"ch-phon",unit:"字音",level:"cap",ability:"比較多音字在不同詞語中的讀音",difficulty:5,prompt:"下列各組引號內的字，前後讀音相同的是哪一組？",options:["『便』利／『便』宜","『鮮』明／『鮮』為人知","『應』答／呼『應』","『調』查／『調』整"],answer:2,explanation:"應答與呼應的「應」都讀ㄧㄥˋ。便利讀ㄅㄧㄢˋ、便宜讀ㄆㄧㄢˊ；鮮明讀ㄒㄧㄢ、鮮少讀ㄒㄧㄢˇ；調查讀ㄉㄧㄠˋ、調整讀ㄊㄧㄠˊ。",commonError:"只記住一個讀音，沒有把字放回完整詞語。"},
    {id:"chx-phon-06",unitId:"ch-phon",unit:"字音",level:"cap",ability:"從成語語境判斷特殊讀音",difficulty:5,prompt:"下列成語引號內的字，何者讀音與標示不相符？",options:["封妻『蔭』子：ㄧㄣˋ","縱橫『捭』闔：ㄅㄞˇ","咬文『嚼』字：ㄐㄩㄝˊ","一丘之『貉』：ㄏㄜˊ"],answer:2,explanation:"咬文嚼字的「嚼」讀ㄐㄧㄠˊ。其餘標音正確。",commonError:"把「咀嚼」的ㄐㄩㄝˊ直接套入「咬文嚼字」。"},

    // 字形：回到字義、固定搭配與完整校對。
    {id:"chx-form-01",unitId:"ch-form",unit:"字形",level:"cap",ability:"辨認成語的正確字形",difficulty:3,prompt:"下列成語何者字形完全正確？",options:["按步就班","相形見絀","如法泡製","變本加利"],answer:1,explanation:"正確為相形見絀。其餘應為按部就班、如法炮製、變本加厲。",commonError:"依讀音選字，忽略成語原始字義。"},
    {id:"chx-form-02",unitId:"ch-form",unit:"字形",level:"cap",ability:"計算段落中的錯別字",difficulty:4,prompt:"「他不但沒有推卸責任，反而勇於承擔，這分氣度令人由衷配服。」共有幾個錯別字？",options:["0個","1個","2個","3個"],answer:2,explanation:"「這分氣度」應為「這份氣度」；「配服」應為「佩服」，共2個。",commonError:"整句意思通順便快速略過，沒有逐詞檢查。"},
    {id:"chx-form-03",unitId:"ch-form",unit:"字形",level:"cap",ability:"由字義辨別形近字",difficulty:4,prompt:"下列句子引號內的字，何者使用正確？",options:["他『緘』默不語，不願說明","溪水清『徹』見底，毫無混濁","消息不『逕』而走，很快傳開","這份報告內容詳實，數據『翔』盡"],answer:0,explanation:"「緘默」使用正確。其餘應分別改為清澈、不脛而走、詳盡。",commonError:"只看部首或讀音相近便判斷，沒有回到詞義。"},
    {id:"chx-form-04",unitId:"ch-form",unit:"字形",level:"cap",ability:"校對公告文字中的錯字",difficulty:4,context:"公告：為維護閱覽品質，請勿高聲喧嘩；離席時，請將座椅規位，並隨手帶走個人物品，以免防礙他人。",prompt:"公告中共有幾個錯別字？",options:["0個","1個","2個","3個"],answer:2,explanation:"「規位」應為「歸位」；「防礙」應為「妨礙」，共2個。",commonError:"公告語氣正式便假設文字一定正確。"},
    {id:"chx-form-05",unitId:"ch-form",unit:"字形",level:"cap",ability:"選用符合語意的同音字",difficulty:3,prompt:"「面對突發狀況，他依然保持鎮定，臨危不＿＿。」空格中應填入哪個字？",options:["亂","欒","孿","鑾"],answer:0,explanation:"「臨危不亂」指面臨危險仍不慌亂，應用「亂」。",commonError:"只看讀音相同，未核對詞義。"},
    {id:"chx-form-06",unitId:"ch-form",unit:"字形",level:"cap",ability:"辨識固定詞語與一般用字",difficulty:5,prompt:"下列哪一句完全沒有錯別字？",options:["與其怨天尤人，不如反求諸己","他引經據典，說得頭頭是到","面對誘惑，仍能堅守原則、潔身自艾","兩隊實力旗鼓相當，勝負難以預枓"],answer:0,explanation:"正確句使用「怨天尤人、反求諸己」。其餘應分別改為頭頭是道、潔身自愛或潔身自好、預料。",commonError:"把常見口語寫法或同音字當成固定詞語。"},

    // 成語：完整詞義、感情色彩與語境限制。
    {id:"chx-idiom-01",unitId:"ch-idiom",unit:"成語",level:"cap",ability:"依上下文選用成語",difficulty:3,prompt:"經過多次討論，兩組終於找到彼此都能接受的方案，原先的爭議也＿＿。",options:["迎刃而解","雪上加霜","故步自封","捨本逐末"],answer:0,explanation:"迎刃而解比喻問題順利解決，符合找到共同方案的結果。",commonError:"只看字面熟悉，沒有比對前後因果。"},
    {id:"chx-idiom-02",unitId:"ch-idiom",unit:"成語",level:"cap",ability:"判斷成語使用是否恰當",difficulty:4,prompt:"下列句子中的成語，使用何者最恰當？",options:["他第一次上台就駕輕就熟，完全不需準備","這份研究旁徵博引，論證相當完整","颱風造成停電，真是蔚為奇觀","他犯錯後自我反省，卻仍怙惡不悛"],answer:1,explanation:"旁徵博引指廣泛引用材料作為依據。其餘選項的成語與情境或前後語意衝突。",commonError:"看到正面語境就選含有正面字眼的成語。"},
    {id:"chx-idiom-03",unitId:"ch-idiom",unit:"成語",level:"cap",ability:"區分近義成語的使用情境",difficulty:4,prompt:"老師提醒：閱讀資料時不能只挑支持自己看法的內容，否則容易＿＿，看不見其他可能。",options:["見賢思齊","以偏概全","集腋成裘","觸類旁通"],answer:1,explanation:"以偏概全指用局部推論全部，符合只選單一立場資料的問題。",commonError:"將「挑選資料」誤解為累積資料而選集腋成裘。"},
    {id:"chx-idiom-04",unitId:"ch-idiom",unit:"成語",level:"cap",ability:"辨認成語的感情色彩",difficulty:4,prompt:"下列何者屬於正面評價？",options:["沽名釣譽","從善如流","好高騖遠","巧言令色"],answer:1,explanation:"從善如流形容樂於接受正確意見，屬正面評價。其餘皆含貶義。",commonError:"只因成語中出現「名、巧」等字便判為正面。"},
    {id:"chx-idiom-05",unitId:"ch-idiom",unit:"成語",level:"cap",ability:"用成語概括人物行動",difficulty:5,context:"小組取得一份網路資料後，沒有立刻引用，而是查找作者背景、原始數據與其他研究，確認內容可靠才放入報告。",prompt:"這種做法最適合用哪個成語形容？",options:["囫圇吞棗","慎重其事","人云亦云","削足適履"],answer:1,explanation:"慎重其事指以慎重態度處理事情，符合多方查證後才採用。",commonError:"看到網路資料便選人云亦云，忽略人物其實有查證。"},
    {id:"chx-idiom-06",unitId:"ch-idiom",unit:"成語",level:"cap",ability:"發現成語與語境的邏輯衝突",difficulty:5,prompt:"下列句子何者語意前後一致？",options:["他墨守成規，因此能隨情勢靈活調整","她不恥下問，遇到不懂便主動請教","這場演說空洞無物，內容可謂鞭辟入裡","他做事敷衍塞責，總是精益求精"],answer:1,explanation:"不恥下問指不以向地位或學問不如自己者請教為可恥，與主動請教一致。",commonError:"只判斷成語本身，沒有檢查前後敘述是否互相矛盾。"},

    // 國學常識：以真實溝通情境評量。
    {id:"chx-culture-01",unitId:"ch-culture",unit:"國學常識",level:"cap",ability:"辨認年齡代稱",difficulty:3,prompt:"下列年齡代稱與歲數的配對何者正確？",options:["弱冠—男子二十歲","而立—四十歲","不惑—五十歲","花甲—七十歲"],answer:0,explanation:"弱冠指男子二十歲；而立三十、不惑四十、知命五十、花甲六十。",commonError:"只依排列順序猜測，沒有建立年齡序列。"},
    {id:"chx-culture-02",unitId:"ch-culture",unit:"國學常識",level:"cap",ability:"依季節意象判斷時令",difficulty:4,prompt:"下列詩句所描寫的季節，何者與其他三者不同？",options:["接天蓮葉無窮碧","稻花香裡說豐年","小荷才露尖尖角","忽如一夜春風來，千樹萬樹梨花開"],answer:3,explanation:"「千樹萬樹梨花開」以梨花比喻雪景，描寫冬季；其餘皆可聯想到夏季景物。",commonError:"看到「春風、梨花」便只按字面判為春季。"},
    {id:"chx-culture-03",unitId:"ch-culture",unit:"國學常識",level:"cap",ability:"選擇得體的書信結尾",difficulty:4,prompt:"學生寫信請老師指導報告，結尾最適合使用哪一句？",options:["敬請查照，毋須回覆","尚祈指正，不勝感激","恭候大駕，務必參加","順頌商祺，生意興隆"],answer:1,explanation:"「尚祈指正」符合學生請教師長給予指導的情境。",commonError:"只看用語正式，忽略對象與書信目的。"},
    {id:"chx-culture-04",unitId:"ch-culture",unit:"國學常識",level:"cap",ability:"辨認文體與作品特色",difficulty:4,prompt:"下列關於古典文學的敘述何者正確？",options:["《論語》主要記錄孔子及弟子言行","《史記》是我國第一部編年體通史","唐詩以散曲最具代表性","《世說新語》是長篇章回小說"],answer:0,explanation:"《論語》記錄孔子及弟子言行。《史記》為紀傳體通史；散曲以元代具代表性；《世說新語》為筆記小說。",commonError:"混淆史書體例與各朝代代表文類。"},
    {id:"chx-culture-05",unitId:"ch-culture",unit:"國學常識",level:"cap",ability:"依場合選擇題辭",difficulty:3,prompt:"朋友新婚，賀卡上最適合寫哪個題辭？",options:["杏林春暖","琴瑟和鳴","桃李芬芳","高山仰止"],answer:1,explanation:"琴瑟和鳴比喻夫妻感情和諧，適合新婚祝賀。",commonError:"只看字面優美，未辨認題辭使用場合。"},
    {id:"chx-culture-06",unitId:"ch-culture",unit:"國學常識",level:"cap",ability:"判斷稱謂是否符合人物關係",difficulty:5,context:"小明向老師介紹自己的妹妹。",prompt:"下列說法何者最得體？",options:["這是令妹，請老師多指教","這是舍妹，請老師多指教","這是令愛，請老師多指教","這是小犬，請老師多指教"],answer:1,explanation:"「舍妹」是對外謙稱自己的妹妹。令妹稱對方妹妹；令愛稱對方女兒；小犬謙稱自己的兒子。",commonError:"誤以為對自己的家人也應使用敬辭。"},

    // 修辭：辨認形式並分析效果。
    {id:"chx-rhetoric-01",unitId:"ch-rhetoric",unit:"修辭",level:"cap",ability:"辨認借代",difficulty:3,prompt:"「教室裡三十雙眼睛都望向講臺。」以「三十雙眼睛」代替三十位學生，主要使用何種修辭？",options:["借代","設問","映襯","頂真"],answer:0,explanation:"以人物具有代表性的部分「眼睛」代替學生整體，屬借代。",commonError:"看到具體形象便一律判成譬喻。"},
    {id:"chx-rhetoric-02",unitId:"ch-rhetoric",unit:"修辭",level:"cap",ability:"區分設問與反問",difficulty:4,prompt:"「難道一次失敗，就能決定一個人的全部嗎？」這句話的主要作用為何？",options:["真正不知道答案而提出疑問","以反問強調一次失敗不能決定全部","列出失敗的完整原因","用誇張表現失敗次數很多"],answer:1,explanation:"句中答案明確是否定，藉反問加強語氣。",commonError:"只要出現問號就判為一般疑問。"},
    {id:"chx-rhetoric-03",unitId:"ch-rhetoric",unit:"修辭",level:"cap",ability:"分析映襯的表達效果",difficulty:4,context:"操場上的喧鬧逐漸遠去，圖書館裡只剩翻頁的細響。",prompt:"句中以喧鬧襯托翻頁聲，主要效果為何？",options:["突出圖書館的安靜與專注","說明操場距離很遠","誇張翻頁聲像雷聲","暗示學生都不喜歡運動"],answer:0,explanation:"喧鬧與細響形成對比，突顯環境轉為安靜及專注。",commonError:"將背景細節推論成作者對運動的態度。"},
    {id:"chx-rhetoric-04",unitId:"ch-rhetoric",unit:"修辭",level:"cap",ability:"分析排比的情感效果",difficulty:4,prompt:"「我們一起讀過清晨，一起熬過挫折，一起走到今天。」主要表達效果為何？",options:["交代精確時間表","以排比累積共同經歷與情感","使用引用增加可信度","以設問引導讀者回答"],answer:1,explanation:"三個結構相近的「一起」句形成排比，累積共同經驗與情感。",commonError:"只認出重複，卻說不出它突顯的內容。"},
    {id:"chx-rhetoric-05",unitId:"ch-rhetoric",unit:"修辭",level:"cap",ability:"辨認誇飾及其限制",difficulty:3,prompt:"「等成績的十分鐘，彷彿比整個冬天還長。」主要使用哪種修辭？",options:["誇飾","引用","借代","雙關"],answer:0,explanation:"把十分鐘形容得比冬天還長，誇張呈現等待時的焦急。",commonError:"看到「彷彿」便一定判為譬喻，忽略程度誇大。"},
    {id:"chx-rhetoric-06",unitId:"ch-rhetoric",unit:"修辭",level:"cap",ability:"比較同一意象在段落中的作用",difficulty:5,context:"開頭寫：「那扇門一直關著，我以為裡面只有失敗。」結尾寫：「我伸手推門，才發現門後是另一條路。」",prompt:"「門」的意象在前後文主要產生什麼效果？",options:["說明建築物設計改變","由阻礙轉為可能，呈現人物觀點轉變","證明失敗不存在","交代人物忘記帶鑰匙"],answer:1,explanation:"同一扇門先象徵封閉與失敗，後象徵新可能，對照出人物態度轉變。",commonError:"只理解門的字面功能，未連結抽象象徵。"},

    // 文意理解：連接詞、比喻、指涉與範圍。
    {id:"chx-meaning-01",unitId:"ch-meaning",unit:"文意理解",level:"cap",ability:"掌握轉折後的核心觀點",difficulty:3,prompt:"「速度能讓我們更快抵達，但是方向錯了，越快只會離目標越遠。」重點為何？",options:["速度完全沒有價值","方向正確比單純追求速度更重要","目標越遠越應放棄","所有人都應慢慢行動"],answer:1,explanation:"「但是」後指出速度必須建立在方向正確的前提上。",commonError:"把相對重要性解讀成全面否定速度。"},
    {id:"chx-meaning-02",unitId:"ch-meaning",unit:"文意理解",level:"cap",ability:"理解比喻句的共同關係",difficulty:4,prompt:"「錯題像路標，不是要我們停在原地，而是提醒下一次在哪裡轉彎。」意思最接近哪一項？",options:["錯題應該永久保留不再作答","錯誤能指出需要調整的方法","只要看答案就不會再錯","學習應避免任何失敗"],answer:1,explanation:"路標提醒轉彎，比喻錯題能提供調整策略的線索。",commonError:"只看「停在原地」而誤認作者主張停止練習。"},
    {id:"chx-meaning-03",unitId:"ch-meaning",unit:"文意理解",level:"cap",ability:"判斷代詞指涉",difficulty:4,context:"老師沒有直接公布解法，而是讓各組比較不同算式。這個安排雖花時間，卻讓學生發現自己的推理缺口。",prompt:"「這個安排」指的是什麼？",options:["公布標準答案","各組比較不同算式","縮短討論時間","記錄所有成績"],answer:1,explanation:"代詞需回找前一句最近且語意完整的行動，即讓各組比較不同算式。",commonError:"只找最近名詞，不檢查語意是否能被「安排」。"},
    {id:"chx-meaning-04",unitId:"ch-meaning",unit:"文意理解",level:"cap",ability:"理解條件與限制",difficulty:4,prompt:"「只有把錯誤原因說清楚，訂正才不只是把答案抄對。」可推出什麼？",options:["只要抄到正確答案就完成訂正","有效訂正需要理解錯誤原因","所有錯題都源自粗心","說明原因比重新作答浪費時間"],answer:1,explanation:"「只有」指出理解錯因是有效訂正的重要必要條件。",commonError:"忽略條件詞，將句子理解成一般建議。"},
    {id:"chx-meaning-05",unitId:"ch-meaning",unit:"文意理解",level:"cap",ability:"辨別合理推論與過度推論",difficulty:5,context:"調查顯示，受訪的八年級學生中，每週固定閱讀三次者，自評專注度較高。",prompt:"下列推論何者最恰當？",options:["固定閱讀必定使所有學生專注度提升","在這批受訪者中，閱讀頻率與自評專注度呈現關聯","不閱讀的學生都無法專心","閱讀是影響專注度的唯一因素"],answer:1,explanation:"資料只能描述受訪者中的關聯，不能證明因果或推廣到所有人。",commonError:"把相關關係、主觀自評與因果結論混在一起。"},
    {id:"chx-meaning-06",unitId:"ch-meaning",unit:"文意理解",level:"cap",ability:"概括句群的共同核心",difficulty:5,context:"有人用計時器維持專注，有人以完成一個小節為休息點，也有人先關閉通知。方法不同，目的都是減少注意力被切碎。",prompt:"這段話的重點為何？",options:["計時器是唯一有效方法","每個人都應關閉手機","可依個人情況選擇方法以維持完整注意力","休息會破壞所有學習效率"],answer:2,explanation:"段落列舉不同方法，最後以共同目的「減少注意力被切碎」統整。",commonError:"把其中一個例子誤當成全文主旨。"},

    // 閱讀理解：雙文本、證據、圖表與作者目的。
    {id:"chx-reading-01",unitId:"ch-reading",unit:"閱讀理解",level:"cap",ability:"統整雙文本共同觀點",difficulty:4,context:"甲：紙本閱讀較少受到通知打斷，適合長時間理解。\n乙：電子閱讀便於搜尋與放大，但使用者需要主動管理通知。",prompt:"兩文共同支持哪一觀點？",options:["紙本在所有情況都優於電子閱讀","閱讀工具的效果與使用方式有關","電子閱讀一定無法專注","所有通知都應永久關閉"],answer:1,explanation:"甲指出紙本優勢，乙指出電子工具優勢與條件，共同說明媒介與使用方式都會影響閱讀。",commonError:"只抓兩文差異，未找能同時涵蓋的共同觀點。"},
    {id:"chx-reading-02",unitId:"ch-reading",unit:"閱讀理解",level:"cap",ability:"評估研究資料能支持的結論",difficulty:5,visual:{type:"table",title:"兩組學生四週紀錄",columns:["組別","人數","每週閱讀時間","測驗平均進步"],rows:[["甲組","18","60分鐘","5分"],["乙組","20","120分鐘","9分"]]},prompt:"依據兩組學生的紀錄，下列敘述何者最恰當？",options:["閱讀120分鐘必定進步9分","乙組平均進步較多，但不能僅憑此表確定唯一原因","甲組的閱讀完全無效","人數較多必然造成分數較高"],answer:1,explanation:"資料呈現差異，但未說明分組、起點及其他因素，不能直接推論唯一因果。",commonError:"看到數據同向變化就斷言因果。"},
    {id:"chx-reading-03",unitId:"ch-reading",unit:"閱讀理解",level:"cap",ability:"分析例證在議論中的功能",difficulty:4,context:"文章主張「便利不一定等於有效率」，接著舉出同學為了整理筆記下載五個應用程式，反而花更多時間切換工具。",prompt:"作者舉這個例子的主要目的為何？",options:["介紹五種應用程式的操作方法","具體說明工具增加可能帶來額外負擔","證明所有數位工具都無用","比較不同同學的成績"],answer:1,explanation:"例子用來支持便利工具過多可能增加切換成本，並非全面否定工具。",commonError:"把例證中的負面結果擴大成作者反對所有工具。"},
    {id:"chx-reading-04",unitId:"ch-reading",unit:"閱讀理解",level:"cap",ability:"從人物行動推論態度轉變",difficulty:4,context:"起初，宜庭只把社區訪談當成作業。聽完老店主談街道變化後，她回家查找舊地圖，還主動把資料整理給社區展覽使用。",prompt:"宜庭的態度有何轉變？",options:["被動完成作業轉為主動投入議題","喜歡歷史轉為只關心成績","相信訪談轉為拒絕查證","熱心參與轉為敷衍了事"],answer:0,explanation:"她從把訪談當作業，轉為主動查資料並貢獻展覽。",commonError:"只看到她一開始也有訪談，就忽略投入程度的改變。"},
    {id:"chx-reading-05",unitId:"ch-reading",unit:"閱讀理解",level:"cap",ability:"判斷標題與全文主旨的關係",difficulty:5,context:"文章先談人們害怕犯錯，接著說明錯誤能暴露推理缺口，最後提出『記錄錯因、隔日重答、改變條件再練習』三步驟。",prompt:"哪個標題最適合？",options:["如何一次答對所有題目","把錯誤變成下一次的學習線索","為什麼練習題越多越好","不要記錄任何失敗"],answer:1,explanation:"「把錯誤變成下一次的學習線索」同時涵蓋錯誤的價值與後續利用方法。",commonError:"只依其中一段選標題，或被絕對化用語吸引。"},
    {id:"chx-reading-06",unitId:"ch-reading",unit:"閱讀理解",level:"cap",ability:"辨認不同資料來源的限制",difficulty:5,context:"甲資料是校方公布的借閱總量；乙資料是二十名學生的閱讀感受訪談；丙資料是社群平台上的匿名留言。",prompt:"若要了解「學生為何不使用圖書館」，最合適的做法為何？",options:["只看甲，因數字一定能解釋原因","以乙了解可能原因，再用更廣泛調查與其他資料檢證","只看丙，因匿名留言最真實","三種資料互相不同，所以都不能使用"],answer:1,explanation:"訪談能提供原因線索，但樣本有限，應再擴大調查並與使用紀錄等資料互證。",commonError:"把某種資料形式視為絕對可靠或完全無用。"},

    // 文言文：詞義、事件、人物與寓意。
    {id:"chx-classical-01",unitId:"ch-classical",unit:"文言文",level:"cap",ability:"理解文言實詞",difficulty:3,context:"客至，主人「延」之入室，設茶相待。",prompt:"句中「延」的意思最接近哪一項？",options:["延長","邀請","遲到","拖延"],answer:1,explanation:"「延之入室」意為邀請他進入室內。",commonError:"直接套用現代常見的「延長、拖延」義。"},
    {id:"chx-classical-02",unitId:"ch-classical",unit:"文言文",level:"cap",ability:"判斷代詞指涉",difficulty:4,context:"農夫得良種，鄰人欲借之。農夫惜而不與，明年鄰田花粉雜至，其穀亦不純。",prompt:"文中「其穀亦不純」的「其」指誰的？",options:["鄰人","農夫","買種者","無法判斷"],answer:1,explanation:"前文主語回到農夫；鄰田花粉影響的是農夫所種的穀物。",commonError:"只找最近出現的「鄰田」而忽略事件邏輯。"},
    {id:"chx-classical-03",unitId:"ch-classical",unit:"文言文",level:"cap",ability:"由事件因果推論寓意",difficulty:4,context:"農夫得良種，鄰人欲借之。農夫惜而不與，明年鄰田花粉雜至，其穀亦不純。乃悟曰：『欲自善者，亦當助人善。』",prompt:"本文寓意最接近哪一項？",options:["保守祕密才能維持優勢","個人利益有時與群體環境相互影響","農作完全取決於運氣","借出所有物品才是善良"],answer:1,explanation:"農夫不助鄰人，最後自己的作物也受影響，說明個人與群體利益可能相連。",commonError:"把單一故事具體行動擴大成任何物品都必須借出。"},
    {id:"chx-classical-04",unitId:"ch-classical",unit:"文言文",level:"cap",ability:"比較人物處事方法",difficulty:5,context:"甲生讀書，遇疑輒略之，以求篇數。乙生每遇疑，記於紙，問師友而後進。歲終，甲所讀倍於乙，試之，乙能通其義。",prompt:"這段文字主要比較什麼？",options:["讀書環境的安靜程度","閱讀數量與理解方法的差異","師友學問高低","紙張記錄是否浪費時間"],answer:1,explanation:"甲求篇數而略疑，乙處理疑問後再進，結果乙能通義，重點在數量與理解方法。",commonError:"只看甲讀得多便判定甲較成功。"},
    {id:"chx-classical-05",unitId:"ch-classical",unit:"文言文",level:"cap",ability:"翻譯關鍵文句",difficulty:4,context:"甲生讀書，遇疑輒略之，以求篇數。",prompt:"「遇疑輒略之」最適合的翻譯是什麼？",options:["遇到疑問就立刻簡略帶過","因為懷疑所以停止讀書","遇到疑問便寫下完整答案","把所有文章都縮寫一遍"],answer:0,explanation:"輒是總是、立即；略之指略過它。",commonError:"把「略」只理解成摘要，而未放回語境。"},
    {id:"chx-classical-06",unitId:"ch-classical",unit:"文言文",level:"cap",ability:"由人物言行判斷性格",difficulty:5,context:"邑人爭水，相持不下。里長不先斷，乃量田之遠近、察渠之高下，使眾各陳所需，定時分水。眾服其平。",prompt:"里長最主要展現哪一特質？",options:["果斷卻不查資料","重視證據與公平協調","畏懼衝突而逃避決定","只聽從人數較多的一方"],answer:1,explanation:"他測量環境、聽取需求並制定分配，展現蒐集證據與公平協調。",commonError:"看到「不先斷」就誤認為沒有決斷能力。"},

    // 白話文：記敘、說明、議論與媒體識讀。
    {id:"chx-vernacular-01",unitId:"ch-vernacular",unit:"白話文",level:"cap",ability:"概括說明文核心概念",difficulty:3,context:"間隔學習不是把同一內容在一天內重複十次，而是在即將遺忘時重新提取。每次提取都使記憶路徑更穩固。",prompt:"這段話主要說明什麼？",options:["一天重複越多次越好","間隔學習利用分散提取鞏固記憶","遺忘表示學習完全失敗","所有內容都應只讀一次"],answer:1,explanation:"段落定義間隔學習並說明它透過分散提取強化記憶。",commonError:"只看到重複，忽略「分散時間、重新提取」的重點。"},
    {id:"chx-vernacular-02",unitId:"ch-vernacular",unit:"白話文",level:"cap",ability:"分析論點與理由",difficulty:4,context:"作者主張學校不應只公布閱讀冊數排行榜，因為冊數無法反映文本難度與理解深度，還可能鼓勵學生只挑短書。",prompt:"作者的主要理由為何？",options:["學生都討厭閱讀","冊數是無法記錄的資料","單一數量指標可能扭曲學習行為","短書一定沒有價值"],answer:2,explanation:"作者認為冊數不能代表品質，且可能誘導只追求數字。",commonError:"把「可能鼓勵」誇大為所有學生一定如此。"},
    {id:"chx-vernacular-03",unitId:"ch-vernacular",unit:"白話文",level:"cap",ability:"判斷證據是否支持主張",difficulty:5,context:"廣告宣稱某筆記法能使成績提升，證據是三位高分學生都使用該筆記法。",prompt:"下列哪項最能指出證據的不足？",options:["高分學生不能做筆記","三人的例子無法排除原有能力與其他學習因素","只要三人同意就代表全校","筆記法一定使成績下降"],answer:1,explanation:"少數高分者使用某方法，不代表方法造成高分，也未排除其他因素。",commonError:"只質疑人數，未說明因果與選樣偏誤。"},
    {id:"chx-vernacular-04",unitId:"ch-vernacular",unit:"白話文",level:"cap",ability:"理解人物情感轉折",difficulty:4,context:"阿公總把舊收音機擦得發亮。小哲原先覺得它占空間，直到阿公說那是全家第一次聽見登月消息的地方。小哲沒有再催促丟棄，反而請阿公教他調頻。",prompt:"小哲的態度如何改變？",options:["嫌棄舊物轉為理解其記憶價值","喜歡科技轉為排斥歷史","尊重阿公轉為強迫丟棄","不懂調頻轉為購買新機"],answer:0,explanation:"得知收音機承載家庭記憶後，他從嫌占空間轉為主動理解。",commonError:"只看到學調頻，忽略促成改變的情感原因。"},
    {id:"chx-vernacular-05",unitId:"ch-vernacular",unit:"白話文",level:"cap",ability:"分析作者使用限制語的作用",difficulty:5,context:"文章寫道：『規律運動可能改善專注，但效果會受睡眠、強度與個人狀況影響，因此不能把運動當成唯一解方。』",prompt:"作者加入「可能、不能當成唯一解方」的作用為何？",options:["使文章完全沒有立場","限制主張範圍，避免過度推論","否定運動的所有好處","證明睡眠不影響專注"],answer:1,explanation:"限制語呈現證據的適用範圍，使主張更精確。",commonError:"把保留條件誤認為作者沒有任何結論。"},
    {id:"chx-vernacular-06",unitId:"ch-vernacular",unit:"白話文",level:"cap",ability:"辨識文章結構",difficulty:4,context:"第一段描述校門口塞車；第二段分析家長接送、路口設計與公車班次；第三段提出分流、步行區與增班方案。",prompt:"文章的主要結構為何？",options:["提出問題—分析原因—提出方案","時間順序—人物對話—抒發情感","比較人物—轉折結局—說明寓意","提出結論—刪除證據—重複結論"],answer:0,explanation:"三段依序呈現問題、原因與解決方案。",commonError:"看到第二段有多項因素便誤判為單純分類說明。"},

    // 綜合測驗：圖文、多條件、句序與資訊轉譯。
    {id:"chx-integrated-01",unitId:"ch-integrated",unit:"綜合測驗",level:"cap",ability:"整合時間與資格條件",difficulty:4,visual:{type:"table",title:"國文複習講座",columns:["講座","時間","對象","內容"],rows:[["甲","週二16:30–17:20","全體","文意推論"],["乙","週二17:40–18:40","進階","文言比較"],["丙","週四16:50–17:50","全體","圖表閱讀"],["丁","週四17:30–18:10","基礎","成語運用"]]},context:"小真只有週四有空，必須在18:00前結束，且未參加分級課程。",prompt:"小真可以完整參加哪一場？",options:["甲","乙","丙","丁"],answer:2,explanation:"丙在週四、18:00前結束且對象為全體，符合所有條件。",commonError:"只核對星期，忽略結束時間與資格。"},
    {id:"chx-integrated-02",unitId:"ch-integrated",unit:"綜合測驗",level:"cap",ability:"利用連接詞排列句序",difficulty:5,prompt:"排列句序：甲、然而，資訊多不等於理解深。乙、數位工具讓搜尋資料變得容易。丙、因此，蒐集之後仍要比較來源、整理關係。丁、若只是複製連結，資料只會越堆越高。",options:["乙→甲→丁→丙","甲→乙→丙→丁","乙→丁→甲→丙","丙→乙→甲→丁"],answer:0,explanation:"乙先談便利，甲以然而轉折，丁具體說明問題，丙以因此提出做法。",commonError:"忽略「然而、因此」及語意推進。"},
    {id:"chx-integrated-03",unitId:"ch-integrated",unit:"綜合測驗",level:"cap",ability:"比較圖表資料與文字主張",difficulty:5,visual:{type:"bar",title:"四週借閱人次",items:[{label:"第一週",value:80},{label:"第二週",value:92},{label:"第三週",value:88},{label:"第四週",value:110}]},context:"自治會說：「借閱人次每週都持續上升。」",prompt:"根據圖表，如何評估這項說法？",options:["完全正確，第四週最高","不完全正確，第三週比第二週下降","完全錯誤，四週都下降","無法比較，因為圖表沒有數字"],answer:1,explanation:"第二週92人次，第三週88人次，並非每週持續上升。",commonError:"只看起點和終點，忽略中間變化。"},
    {id:"chx-integrated-04",unitId:"ch-integrated",unit:"綜合測驗",level:"cap",ability:"選擇符合對象與目的的訊息",difficulty:4,context:"圖書館要通知七年級學生：週五第五節舉行新生導覽，請攜帶學生證，並於週三前線上報名。",prompt:"下列通知何者資訊最完整且語氣適切？",options:["大家記得來圖書館，有重要的事","七年級同學請於週三前線上報名，週五第五節攜學生證參加圖書館導覽","週五帶證件，沒來後果自負","圖書館導覽很好玩，請所有年級隨時參加"],answer:1,explanation:"完整通知應包含對象、期限、時間、攜帶物品與活動內容，語氣也要清楚適切。",commonError:"只看文句通順，未核對必要資訊是否完整。"},
    {id:"chx-integrated-05",unitId:"ch-integrated",unit:"綜合測驗",level:"cap",ability:"整合雙文本形成建議",difficulty:5,context:"甲：長時間連續閱讀容易使注意力下降。乙：頻繁查看通知會增加重新進入任務的時間。",prompt:"綜合兩則資料，哪項讀書建議最合理？",options:["整晚不休息並保持通知開啟","安排適度休息，專注時關閉非必要通知","每讀一分鐘就查看一次手機","只要關通知就永遠不需休息"],answer:1,explanation:"安排適度休息並關閉非必要通知，同時回應閱讀疲勞與通知干擾。",commonError:"只處理其中一則資料，或提出過度絕對的方法。"},
    {id:"chx-integrated-06",unitId:"ch-integrated",unit:"綜合測驗",level:"cap",ability:"依條件判斷最適摘要",difficulty:5,context:"短文說明：錯題紀錄若只有題號與答案，複習時仍不知道為何出錯；有效紀錄應包括錯誤判斷、正確觀念與下次檢查方式，並在數日後重答。",prompt:"下列摘要何者最完整？",options:["錯題本越厚越有效","記下答案即可避免再錯","有效錯題紀錄需分析錯因、整理觀念並安排重答","所有錯題都應在當天重做十次"],answer:2,explanation:"完整摘要要涵蓋錯因、正確觀念、檢查方式與間隔重答，且不能加入原文沒有的絕對要求。",commonError:"只抓到其中一個步驟，未統整全文。"}
  ];

  // 調整新增題目的正確答案位置，使國文完整題庫的 A／B／C／D 分布各為 25 題。
  const desiredAnswers = [3,0,3,2,0,3, 0,3,2,2,0,3, 3,0,0,3,2,3, 0,3,2,1,3,0, 3,2,0,3,1,3, 0,3,2,3,0,1, 3,0,1,3,2,3, 0,3,2,1,3,0, 3,0,2,3,1,3, 0,3,2,3,0,1];
  questions.forEach((question, index) => {
    const desired = desiredAnswers[index];
    const shift = (desired - question.answer + 4) % 4;
    if (shift) question.options = question.options.map((_, newIndex, source) => source[(newIndex - shift + 4) % 4]);
    question.answer = desired;
  });

  const chinese = window.examMateQuestionBank?.chinese;
  if (!chinese || !Array.isArray(chinese.questions)) return;
  const existing = new Set(chinese.questions.map((question) => question.id));
  questions.forEach((question) => {
    if (!existing.has(question.id)) chinese.questions.push(question);
  });
})();
