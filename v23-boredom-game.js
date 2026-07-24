(function () {
  'use strict';

  const BoredomGameV23 = {
    bank: [],
    session: [],
    index: 0,
    score: 0,
    answered: 0,
    mode: 'solo',
    companion: '',
    audioCtx: null,

    shuffle(list) {
      const copy = list.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },

    options(answer, pool) {
      const wrong = [...new Set(pool.filter(item => String(item) !== String(answer)))];
      return this.shuffle([answer, ...this.shuffle(wrong).slice(0, 3)]);
    },

    buildBank() {
      if (this.bank.length) return this.bank;
      const bank = [];
      const add = entry => bank.push({ id: `fun-${bank.length + 1}`, ...entry });

      /* 180 سؤال حساب سريع */
      for (let i = 1; i <= 60; i++) {
        const a = 8 + ((i * 7) % 53);
        const b = 4 + ((i * 11) % 37);
        const answer = a + b;
        add({
          category: 'حساب سريع', type: 'quiz',
          question: `من غير آلة حاسبة يا بطل: ${a} + ${b} يساوي كام؟`,
          answer: String(answer),
          choices: this.options(String(answer), [answer + 1, answer - 1, answer + 10, answer - 10].map(String)),
          explanation: `نجمع الآحاد ثم العشرات: الناتج ${answer}.`
        });
      }
      for (let i = 1; i <= 60; i++) {
        const a = 2 + ((i - 1) % 10);
        const b = 2 + Math.floor((i - 1) / 10);
        const answer = a * b;
        add({
          category: 'حساب سريع', type: 'quiz',
          question: `سؤال سرعة: ${a} × ${b} يساوي كام؟`,
          answer: String(answer),
          choices: this.options(String(answer), [answer + a, answer - a, answer + b, answer + 2].map(String)),
          explanation: `${a} مجموعات، في كل مجموعة ${b}؛ الناتج ${answer}.`
        });
      }
      for (let i = 1; i <= 60; i++) {
        const b = 5 + ((i * 5) % 31);
        const answer = 10 + ((i * 9) % 55);
        const a = answer + b;
        add({
          category: 'حساب سريع', type: 'quiz',
          question: `ركّز كده: ${a} - ${b} يساوي كام؟`,
          answer: String(answer),
          choices: this.options(String(answer), [answer + 1, answer - 1, answer + 5, answer - 5].map(String)),
          explanation: `بعد طرح ${b} من ${a} يتبقى ${answer}.`
        });
      }

      /* 80 سؤال أنماط */
      for (let i = 1; i <= 40; i++) {
        const start = 1 + (i % 13);
        const step = 2 + (i % 8);
        const seq = [0, 1, 2, 3].map(n => start + n * step);
        const answer = start + 4 * step;
        add({
          category: 'أنماط وأرقام', type: 'quiz',
          question: `إيه الرقم اللي يكمل النمط: ${seq.join('، ')}، ...؟`,
          answer: String(answer),
          choices: this.options(String(answer), [answer + step, answer - 1, answer + 1, answer - step].map(String)),
          explanation: `كل مرة بنزود ${step}؛ إذن الرقم التالي ${answer}.`
        });
      }
      for (let i = 1; i <= 20; i++) {
        const start = i;
        const ratio = 2 + (i % 2);
        const seq = [0, 1, 2, 3].map(n => start * Math.pow(ratio, n));
        const answer = start * Math.pow(ratio, 4);
        add({
          category: 'أنماط وأرقام', type: 'quiz',
          question: `كمل السلسلة دي: ${seq.join('، ')}، ...؟`,
          answer: String(answer),
          choices: this.options(String(answer), [answer / ratio, answer + ratio, answer - ratio, answer * 2].map(String)),
          explanation: `كل رقم بيتضرب في ${ratio}؛ الإجابة ${answer}.`
        });
      }
      for (let i = 1; i <= 20; i++) {
        const start = 2 + i;
        const seq = [start, start + 2, start + 6, start + 12];
        const answer = start + 20;
        add({
          category: 'أنماط وأرقام', type: 'quiz',
          question: `النمط بيزيد 2 ثم 4 ثم 6: ${seq.join('، ')}، ...؟`,
          answer: String(answer),
          choices: this.options(String(answer), [answer - 2, answer + 2, answer + 4, answer - 4].map(String)),
          explanation: `الزيادة التالية 8؛ لذلك ${seq[3]} + 8 = ${answer}.`
        });
      }

      /* 120 سؤال عواصم ودول */
      const capitals = [
        ['مصر','القاهرة'],['السعودية','الرياض'],['الإمارات','أبو ظبي'],['الكويت','مدينة الكويت'],
        ['البحرين','المنامة'],['قطر','الدوحة'],['عُمان','مسقط'],['الأردن','عمّان'],['لبنان','بيروت'],
        ['سوريا','دمشق'],['العراق','بغداد'],['فلسطين','القدس'],['المغرب','الرباط'],['الجزائر','الجزائر'],
        ['تونس','تونس'],['ليبيا','طرابلس'],['السودان','الخرطوم'],['الصومال','مقديشو'],['موريتانيا','نواكشوط'],
        ['تركيا','أنقرة'],['فرنسا','باريس'],['إيطاليا','روما'],['إسبانيا','مدريد'],['البرتغال','لشبونة'],
        ['ألمانيا','برلين'],['بلجيكا','بروكسل'],['هولندا','أمستردام'],['النمسا','فيينا'],['سويسرا','برن'],
        ['اليونان','أثينا'],['المملكة المتحدة','لندن'],['أيرلندا','دبلن'],['النرويج','أوسلو'],
        ['السويد','ستوكهولم'],['فنلندا','هلسنكي'],['الدنمارك','كوبنهاغن'],['بولندا','وارسو'],
        ['التشيك','براغ'],['المجر','بودابست'],['رومانيا','بوخارست'],['روسيا','موسكو'],['أوكرانيا','كييف'],
        ['الولايات المتحدة','واشنطن'],['كندا','أوتاوا'],['المكسيك','مكسيكو سيتي'],['البرازيل','برازيليا'],
        ['الأرجنتين','بوينس آيرس'],['تشيلي','سانتياغو'],['بيرو','ليما'],['الصين','بكين'],
        ['اليابان','طوكيو'],['كوريا الجنوبية','سيول'],['الهند','نيودلهي'],['باكستان','إسلام آباد'],
        ['إندونيسيا','جاكرتا'],['ماليزيا','كوالالمبور'],['تايلاند','بانكوك'],['أستراليا','كانبرا'],
        ['نيوزيلندا','ويلينغتون'],['كينيا','نيروبي']
      ];
      capitals.forEach(([country, capital], index) => {
        const capitalPool = capitals.map(item => item[1]);
        const countryPool = capitals.map(item => item[0]);
        add({
          category: 'عواصم ودول', type: 'quiz',
          question: `عاصمة ${country} إيه؟`,
          answer: capital,
          choices: this.options(capital, capitalPool.slice(index + 1).concat(capitalPool.slice(0, index))),
          explanation: `${capital} هي عاصمة ${country}.`
        });
        add({
          category: 'عواصم ودول', type: 'quiz',
          question: `${capital} عاصمة أنهي دولة؟`,
          answer: country,
          choices: this.options(country, countryPool.slice(index + 1).concat(countryPool.slice(0, index))),
          explanation: `${capital} هي عاصمة ${country}.`
        });
      });

      /* 100 سؤال لغة */
      const words = [
        ['سعيد','مسرور','حزين'],['شجاع','جريء','جبان'],['سريع','عاجل','بطيء'],['هادئ','ساكن','صاخب'],
        ['كريم','سخي','بخيل'],['واضح','جلي','غامض'],['صعب','عسير','سهل'],['قديم','عتيق','حديث'],
        ['قريب','داني','بعيد'],['قوي','متين','ضعيف'],['ذكي','فطن','غبي'],['جميل','حسن','قبيح'],
        ['نظيف','طاهر','متسخ'],['كبير','ضخم','صغير'],['بداية','مطلع','نهاية'],['حب','مودة','كراهية'],
        ['صمت','سكوت','ضجيج'],['نور','ضياء','ظلام'],['صدق','أمانة','كذب'],['اتفاق','توافق','اختلاف'],
        ['فوز','انتصار','هزيمة'],['نشاط','حيوية','كسل'],['أمل','رجاء','يأس'],['عدل','إنصاف','ظلم'],
        ['علم','معرفة','جهل'],['غنى','ثراء','فقر'],['لين','رفق','قسوة'],['فرح','بهجة','حزن'],
        ['غضب','سخط','رضا'],['أمان','طمأنينة','خوف'],['اجتهاد','مثابرة','إهمال'],['تعاون','مشاركة','أنانية'],
        ['شروق','طلوع','غروب'],['قبول','رضا','رفض'],['بناء','تشييد','هدم'],['دخول','ولوج','خروج'],
        ['حضور','قدوم','غياب'],['ارتفاع','صعود','هبوط'],['ربح','مكسب','خسارة'],['تذكّر','استرجاع','نسيان'],
        ['استقامة','اعتدال','اعوجاج'],['سماح','إذن','منع'],['مدح','ثناء','ذم'],['حكمة','رشد','سفه'],
        ['وفاء','إخلاص','غدر'],['كرامة','عزة','مهانة'],['رحمة','شفقة','قسوة'],['تواضع','بساطة','غرور'],
        ['ترتيب','تنظيم','فوضى'],['نجاح','تفوق','فشل']
      ];
      words.forEach(([word, synonym, antonym], index) => {
        const synonyms = words.map(item => item[1]);
        const antonyms = words.map(item => item[2]);
        add({
          category: 'كلمات ولغة', type: 'quiz',
          question: `إيه أقرب مرادف لكلمة «${word}»؟`,
          answer: synonym,
          choices: this.options(synonym, synonyms.slice(index + 1).concat(synonyms.slice(0, index))),
          explanation: `${synonym} من أقرب مرادفات ${word}.`
        });
        add({
          category: 'كلمات ولغة', type: 'quiz',
          question: `عكس كلمة «${word}» إيه؟`,
          answer: antonym,
          choices: this.options(antonym, antonyms.slice(index + 1).concat(antonyms.slice(0, index))),
          explanation: `${antonym} هو عكس ${word}.`
        });
      });

      /* 100 سؤال معلومات عامة وعلوم */
      const facts = [
        ['أكبر كوكب في المجموعة الشمسية إيه؟','المشتري','المشتري أكبر كواكب المجموعة الشمسية.'],
        ['الكوكب المعروف بالكوكب الأحمر إيه؟','المريخ','المريخ يبدو أحمر بسبب أكاسيد الحديد.'],
        ['أقرب كوكب للشمس إيه؟','عطارد','عطارد هو الأقرب للشمس.'],
        ['الغاز الأكثر وجودًا في الغلاف الجوي إيه؟','النيتروجين','النيتروجين يمثل النسبة الأكبر من الغلاف الجوي.'],
        ['الماء بيتجمد عند كام درجة مئوية؟','صفر','عند الضغط الجوي المعتاد يتجمد الماء عند صفر مئوية.'],
        ['الماء بيغلي عند كام درجة مئوية؟','100','عند الضغط الجوي المعتاد يغلي عند 100 مئوية.'],
        ['عدد عظام جسم الإنسان البالغ تقريبًا كام؟','206','العدد الشائع لعظام البالغ 206.'],
        ['العضو المسؤول عن ضخ الدم إيه؟','القلب','القلب يضخ الدم عبر الأوعية.'],
        ['أكبر عضو في جسم الإنسان إيه؟','الجلد','الجلد أكبر أعضاء الجسم مساحةً.'],
        ['وحدة قياس شدة التيار الكهربائي إيه؟','الأمبير','الأمبير وحدة شدة التيار.'],
        ['وحدة قياس القوة إيه؟','النيوتن','القوة تقاس بالنيوتن.'],
        ['سرعة الضوء أكبر ولا سرعة الصوت؟','سرعة الضوء','الضوء أسرع كثيرًا من الصوت.'],
        ['الحيوان الأسرع على اليابسة إيه؟','الفهد','الفهد أسرع حيوان بري لمسافات قصيرة.'],
        ['أكبر حيوان حي إيه؟','الحوت الأزرق','الحوت الأزرق أكبر حيوان معروف حيًا.'],
        ['الحيوان الذي يغيّر لونه للتمويه إيه؟','الحرباء','الحرباء معروفة بتغير اللون لأسباب منها التواصل والحرارة والتمويه.'],
        ['عدد قارات العالم كام؟','7','التقسيم الشائع يعتبرها سبع قارات.'],
        ['أكبر محيط في العالم إيه؟','المحيط الهادئ','المحيط الهادئ الأكبر مساحةً.'],
        ['أعلى جبل فوق سطح البحر إيه؟','إيفرست','إيفرست الأعلى فوق مستوى البحر.'],
        ['أطول نهر يُذكر غالبًا في المناهج العربية إيه؟','النيل','يُذكر النيل غالبًا بوصفه الأطول، مع نقاشات قياس تخص الأمازون.'],
        ['أكبر قارة مساحةً إيه؟','آسيا','آسيا أكبر القارات.'],
        ['أصغر قارة مساحةً إيه؟','أستراليا','أستراليا أصغر القارات في التقسيم الشائع.'],
        ['اللغة الرسمية في البرازيل إيه؟','البرتغالية','البرازيل تتحدث البرتغالية رسميًا.'],
        ['العملة الرسمية لليابان إيه؟','الين','عملة اليابان هي الين.'],
        ['العملة الرسمية للمملكة المتحدة إيه؟','الجنيه الإسترليني','العملة هي الجنيه الإسترليني.'],
        ['مخترع الهاتف الذي يُنسب إليه الاختراع غالبًا مين؟','ألكسندر غراهام بيل','يُنسب تسجيل براءة الهاتف لبيل غالبًا.'],
        ['العالم صاحب قوانين الحركة الشهيرة مين؟','إسحاق نيوتن','نيوتن صاغ قوانين الحركة الكلاسيكية.'],
        ['العالم المرتبط بنظرية النسبية مين؟','ألبرت أينشتاين','أينشتاين وضع نظريتي النسبية الخاصة والعامة.'],
        ['الجهاز المستخدم لرؤية الأجرام البعيدة إيه؟','التلسكوب','التلسكوب يجمع الضوء لرصد الأجرام البعيدة.'],
        ['الجهاز المستخدم لقياس درجة الحرارة إيه؟','الترمومتر','الترمومتر يقيس الحرارة.'],
        ['المادة الوراثية الأشهر اختصارها إيه؟','DNA','DNA يحمل المعلومات الوراثية في معظم الكائنات.'],
        ['النبات بيصنع غذاءه بعملية اسمها إيه؟','البناء الضوئي','البناء الضوئي يحول الطاقة الضوئية لطاقة كيميائية.'],
        ['الجزء الذي يمتص الماء غالبًا في النبات إيه؟','الجذور','الجذور تمتص الماء والأملاح.'],
        ['عدد أسنان الإنسان البالغ غالبًا كام؟','32','يشمل ذلك ضروس العقل عند اكتمالها.'],
        ['عدد حجرات قلب الإنسان كام؟','4','القلب أربع حجرات.'],
        ['فصيلة الدم المانح العام لخلايا الدم الحمراء إيه؟','O سالب','O سالب يُستخدم كمانح عام لخلايا الدم الحمراء.'],
        ['فيتامين يتكون في الجلد بمساعدة الشمس إيه؟','فيتامين د','التعرض المناسب للشمس يساعد تصنيع فيتامين د.'],
        ['الكوكب المشهور بحلقاته إيه؟','زحل','زحل يمتلك نظام حلقات بارزًا.'],
        ['القمر جسم مضيء بذاته ولا بيعكس الضوء؟','يعكس الضوء','القمر يعكس ضوء الشمس.'],
        ['مركز المجموعة الشمسية إيه؟','الشمس','الكواكب تدور حول الشمس.'],
        ['الخفاش من الطيور ولا الثدييات؟','الثدييات','الخفافيش ثدييات قادرة على الطيران.'],
        ['الدلفين من الأسماك ولا الثدييات؟','الثدييات','الدلافين ثدييات تتنفس الهواء.'],
        ['البطريق يطير ولا يسبح؟','يسبح','البطريق لا يطير لكنه سباح ماهر.'],
        ['الأخطبوط عنده كام ذراع؟','8','للأخطبوط ثمانية أذرع.'],
        ['النحل بيصنع إيه؟','العسل','النحل ينتج العسل من رحيق الأزهار.'],
        ['المعدن السائل في درجة حرارة الغرفة إيه؟','الزئبق','الزئبق سائل في درجة حرارة الغرفة.'],
        ['الرمز الكيميائي للأكسجين إيه؟','O','رمز عنصر الأكسجين O.'],
        ['الرمز الكيميائي للذهب إيه؟','Au','رمز الذهب Au.'],
        ['الكوكب الأقرب لحجم الأرض إيه؟','الزهرة','الزهرة قريب من الأرض في الحجم.'],
        ['العضو الأساسي للتنفس إيه؟','الرئتان','الرئتان تتبادلان الغازات.'],
        ['الجزء المسؤول عن التفكير والذاكرة إيه؟','الدماغ','الدماغ يدير التفكير والذاكرة ووظائف أخرى.']
      ];
      const factAnswers = facts.map(item => item[1]);
      facts.forEach(([question, answer, explanation], index) => {
        add({
          category: 'معلومات وعلوم', type: 'quiz', question, answer,
          choices: this.options(answer, factAnswers.slice(index + 1).concat(factAnswers.slice(0, index))),
          explanation
        });
        const truthful = index % 2 === 0;
        const shownAnswer = truthful ? answer : factAnswers[(index + 7) % factAnswers.length];
        add({
          category: 'معلومات وعلوم', type: 'quiz',
          question: `صح ولا غلط: إجابة سؤال «${question}» هي «${shownAnswer}».`,
          answer: truthful ? 'صح' : 'غلط',
          choices: ['صح', 'غلط'],
          explanation
        });
      });

      /* 100 لغز مصري */
      const riddles = [
        ['إيه الشيء اللي كل ما تاخد منه يكبر؟','الحفرة'],['إيه اللي له أسنان ومبيعضّش؟','المشط'],
        ['إيه اللي له عين ومبيشوفش؟','الإبرة'],['إيه اللي بيكتب ومبيقرأش؟','القلم'],
        ['إيه اللي بيمشي من غير رجلين وبيبكي من غير عينين؟','السحاب'],['إيه البيت اللي مفيهوش أبواب ولا شبابيك؟','بيت الشعر'],
        ['إيه اللي لو نطقت اسمه كسرته؟','الصمت'],['إيه اللي كل ما يزيد ينقص؟','العمر'],
        ['إيه اللي قدامك طول الوقت ومش بتشوفه؟','المستقبل'],['إيه اللي له رقبة من غير رأس؟','الزجاجة'],
        ['إيه اللي له أوراق ومش نبات؟','الكتاب'],['إيه اللي له مفاتيح ومبيفتحش أبواب؟','البيانو'],
        ['إيه اللي بيلف حوالين البيت ومش بيتحرك؟','السور'],['إيه اللي يدخل مبلول ويطلع ناشف؟','الخبز في الفرن'],
        ['إيه اللي بيجري ومبيمشيش؟','الماء'],['إيه اللي كل الناس تحتاجه لكن لما تاكله تموت؟','الجوع'],
        ['إيه اللي لو حطيته في التلاجة ميبردش؟','الفلفل الحار'],['إيه اللي ممكن تمسكه من غير ما تلمسه؟','نَفَسك'],
        ['إيه اللي بيزيد كل ما شاركته؟','المعرفة'],['إيه اللي له أربع رجلين ومبيمشيش؟','الكرسي'],
        ['إيه اللي له وجه ويدين من غير جسم؟','الساعة'],['إيه اللي بيسمع من غير ودان ويتكلم من غير لسان؟','الصدى'],
        ['إيه اللي لما يجوع يكذب ولما يشبع يصدق؟','الساعة'],['إيه اللي موجود في وسط مكة؟','حرف الكاف'],
        ['إيه اللي في القرن مرة وفي الدقيقة مرتين ومش موجود في الساعة؟','حرف القاف'],
        ['إيه اللي بين السماء والأرض؟','حرف الواو'],['إيه الكلمة اللي كل الناس بتنطقها غلط؟','كلمة غلط'],
        ['إيه اللي لو شلنا أوله طار ولو شلنا آخره عاش؟','قطار'],['إيه اللي يولد كبير ويموت صغير؟','الشمعة'],
        ['إيه اللي كل ما ينشف يبل؟','المنشفة'],['إيه اللي تقدر تكسره من غير ما تلمسه؟','الوعد'],
        ['إيه اللي له قلب ومبيدقش؟','الخس'],['إيه اللي لونه أسود ومبينفعش غير لما يبقى أحمر؟','الفحم'],
        ['إيه اللي بياكل ومبيشبعش ولو شرب يموت؟','النار'],['إيه اللي بيطلع وينزل من غير ما يتحرك؟','درجة الحرارة'],
        ['إيه اللي كل ما جرى مبتلحقوش؟','الوقت'],['إيه اللي يدخل الزجاج ولا يكسره؟','الضوء'],
        ['إيه اللي لو قطعته تبكي عليه؟','البصل'],['إيه اللي يقرصك ومتشوفوش؟','البرد'],
        ['إيه اللي له جناحان ولا يطير؟','المروحة'],['إيه اللي كل ما تنظفه يسود؟','السبورة'],
        ['إيه اللي بنشوفه في الليل ثلاث مرات وفي النهار مرة؟','حرف اللام'],
        ['إيه اللي اسمه على لونه؟','البيضة'],['إيه اللي لو دخل المية ميتبلش؟','الضوء'],
        ['إيه اللي لما تقلبه يزيد؟','الرقم 6 يصبح 9'],['إيه اللي تملكه والناس تستخدمه أكتر منك؟','اسمك'],
        ['إيه اللي ملوش بداية ولا نهاية؟','الدائرة'],['إيه اللي بيفتح لك الباب وهو مقفول؟','المفتاح'],
        ['إيه اللي لازم تكسره قبل ما تستخدمه؟','البيضة'],['إيه اللي له مدن بلا بيوت وأنهار بلا ماء؟','الخريطة']
      ];
      const riddleAnswers = riddles.map(item => item[1]);
      riddles.forEach(([question, answer], index) => {
        add({
          category: 'ألغاز مصرية', type: 'quiz', question, answer,
          choices: this.options(answer, riddleAnswers.slice(index + 1).concat(riddleAnswers.slice(0, index))),
          explanation: `الإجابة: ${answer}.`
        });
        add({
          category: 'ألغاز مصرية', type: 'quiz',
          question: `لغز رقم ${index + 1} لصاحبك: ${question}`,
          answer,
          choices: this.options(answer, riddleAnswers.slice(index + 5).concat(riddleAnswers.slice(0, index + 5))),
          explanation: `الإجابة ببساطة هي: ${answer}.`
        });
      });

      /* 140 سؤال حوار */
      const conversations = [
        'إيه أكتر موقف ضحكك من قلبك السنة دي؟','لو عندك يوم إجازة بلا مسؤوليات هتعمل فيه إيه؟',
        'إيه الصفة اللي بتحبها في نفسك ومش بتقولها كتير؟','مين الشخص اللي علّمك درسًا مهمًا من غير ما يقصد؟',
        'إيه ذكرى طفولة كل ما تفتكرها تبتسم؟','إيه أكتر حاجة بتحسسك بالأمان؟',
        'لو رجع بك الوقت خمس سنين، هتقول لنفسك إيه؟','إيه عادة صغيرة نفسك تثبت عليها؟',
        'إيه حلم مؤجله وعايز تبدأ له بخطوة؟','إيه أكتر مكان بتحس فيه براحة؟',
        'إيه أغنية مرتبطة عندك بذكرى حلوة؟','لو هتتعلم مهارة جديدة فورًا تختار إيه؟',
        'إيه أكتر حاجة بتقدّرها في الصداقة؟','إيه التصرف البسيط اللي بيفرق معاك جدًا؟',
        'إيه أكتر وجبة بتحسسك بلمة البيت؟','لو سافرت بكرة، أنهي بلد تختار وليه؟',
        'إيه موقف خلاك تكتشف إنك أقوى مما توقعت؟','إيه تعريفك لليوم الناجح؟',
        'إيه الشيء اللي محتاج تقلله في حياتك؟','إيه الشيء اللي محتاج تزوده في أسبوعك؟',
        'متى بتحس إنك مسموع ومفهوم؟','إيه أفضل نصيحة سمعتها؟',
        'إيه النصيحة اللي بطلت تصدقها؟','لو هتشكر شخصًا النهارده، هيكون مين وليه؟',
        'إيه إنجاز صغير فخور به؟','إيه أكثر شيء يخليك تفصل من ضغط اليوم؟',
        'لو حياتك فيلم، إيه اسم المرحلة الحالية؟','إيه أكتر موقف محرج بقى مضحك بعد وقت؟',
        'إيه أكتر صفة تحبها في الشخص اللي قدامك؟','إيه حاجة نفسك الناس تفهمها عنك؟',
        'إيه نوع الدعم اللي تحتاجه لما تكون مضايق؟','تحب النصيحة ولا السماع الأول؟',
        'إيه حدودك المهمة في أي علاقة؟','إيه علامة العلاقة المريحة بالنسبة لك؟',
        'إيه الموقف اللي يخليك تحس بالتقدير؟','إيه طريقة الاعتذار اللي تريحك؟',
        'لما تختلف مع حد، إيه اللي يساعدك تهدى؟','إيه أكثر شيء تعلمته من خلاف سابق؟',
        'إيه وعد واقعي تقدر توعده لنفسك الأسبوع ده؟','إيه حاجة نفسك تجربها لأول مرة؟',
        'لو كسبت وقتًا إضافيًا كل يوم، هتستخدمه في إيه؟','إيه كتاب أو فيلم غيّر طريقة تفكيرك؟',
        'إيه أكتر قرار صغير عمل فرقًا كبيرًا؟','إيه الشيء اللي يجعلك تقول إن البيت دافئ؟',
        'إيه أهم قيمة تحب تنقلها لأولادك؟','إيه موقف تمنيت فيه إن حد يسمعك بس؟',
        'إيه شيء كنت تخاف منه وبقيت تتعامل معه أحسن؟','إيه أحسن مفاجأة حصلت لك؟',
        'إيه معنى النجاح عندك بعيدًا عن رأي الناس؟','إيه الشيء اللي لا تحب تأجيله أكثر؟',
        'إيه أكتر حاجة بتشحن طاقتك؟','إيه أكتر حاجة بتستنزف طاقتك؟',
        'إيه النشاط اللي ينسيك الوقت؟','إيه مهارة تتمنى تعلمها من الشخص اللي معك؟',
        'لو هتختار عادة مشتركة، هتكون إيه؟','إيه أكتر شيء يضحكك في صاحبك؟',
        'إيه لحظة حسيت فيها إنك محبوب بصدق؟','إيه أجمل كلمة اتقالت لك؟',
        'إيه شيء بسيط نفسك تعمله بكرة؟','إيه حاجة كويسة حصلت النهارده ومخدتش بالك منها؟',
        'لو تقدر تصلح سوء فهم واحد، هيكون إيه؟','إيه أكتر موقف علّمك الصبر؟',
        'إيه فرق مهم بينك وبين الشخص اللي معك وبتقدّره؟','إيه عادة عائلية نفسك تحافظ عليها؟',
        'إيه أكتر حاجة بتخليك تثق في شخص؟','إيه التصرف اللي يهز الثقة عندك؟',
        'إيه سؤال كنت تتمنى حد يسأله لك؟','إيه شعورك الآن في كلمة واحدة؟',
        'إيه الخطوة اللي محتاج فيها تشجيع؟','إيه حاجة تحب تحتفل بها حتى لو صغيرة؟'
      ];
      conversations.forEach((question, index) => {
        add({
          category: 'أسئلة تقرّبكم', type: 'conversation',
          question,
          answer: 'مفيش إجابة صح أو غلط؛ اسمع للنهاية واسأل سؤالًا مكملًا باهتمام.',
          choices: [],
          explanation: 'الهدف من السؤال إنكم تعرفوا بعض أكتر، مش تقييم الإجابة.'
        });
        add({
          category: 'أسئلة تقرّبكم', type: 'conversation',
          question: `خدوا السؤال براحة ومن غير استعجال: ${question}`,
          answer: 'سيبوا لكل شخص مساحته في الإجابة، ومن غير مقاطعة أو سخرية.',
          choices: [],
          explanation: `سؤال الحوار رقم ${index + 1} هدفه القرب والفهم.`
        });
      });

      /* 100 اختيار مسلٍ */
      const left = [
        'تسافر كل شهر لمكان جديد','تعيش سنة بلا سوشيال ميديا','تتعلم لغة جديدة فورًا','تقرأ أفكار الناس ليوم واحد',
        'تملك وقتًا إضافيًا ساعتين يوميًا','تعيش قرب البحر','تكون مشهورًا جدًا','تأكل أكلك المفضل أسبوعًا',
        'ترجع يومًا واحدًا للماضي','تشاهد المستقبل لخمس دقائق'
      ];
      const right = [
        'تسكن في بيت أحلامك','تعيش شهرًا بلا تلفزيون','تعزف أي آلة بإتقان','تختفي عن الأنظار ليوم واحد',
        'تنام نومًا مثاليًا كل ليلة','تعيش وسط الجبال','تكون مجهولًا ومرتاحًا','تجرب أكلة جديدة كل يوم',
        'تقفز يومًا واحدًا للمستقبل','تعيد أجمل يوم في حياتك'
      ];
      left.forEach((first, i) => right.forEach((second, j) => add({
        category: 'تختار إيه؟', type: 'conversation',
        question: `اختيار رقم ${i + 1}-${j + 1}: تفضل ${first} ولا ${second}؟ وليه؟`,
        answer: 'مفيش اختيار صح؛ الحكاية كلها في سبب اختيارك.',
        choices: [],
        explanation: 'قارنوا الأسباب؛ غالبًا هتكتشفوا قيمًا واهتمامات مشتركة.'
      })));

      /* 80 سؤال عن مصر */
      const egyptFacts = [
        ['إيه عاصمة بلدنا مصر؟','القاهرة'],['النهر الرئيسي في مصر إيه؟','النيل'],
        ['الأهرامات الأشهر موجودة فين؟','الجيزة'],['معبد أبو سمبل موجود في أنهي محافظة؟','أسوان'],
        ['مدينة الأقصر مشهورة بإيه؟','الآثار والمعابد'],['البحر اللي على شمال مصر اسمه إيه؟','البحر المتوسط'],
        ['البحر اللي شرق مصر اسمه إيه؟','البحر الأحمر'],['القناة اللي بتربط البحرين الأحمر والمتوسط إيه؟','قناة السويس'],
        ['السد العالي موجود فين؟','أسوان'],['واحة سيوة تابعة لأنهي محافظة؟','مطروح'],
        ['الإسكندرية أسسها مين؟','الإسكندر الأكبر'],['مكتبة الإسكندرية الحديثة موجودة فين؟','الإسكندرية'],
        ['العملة المصرية إيه؟','الجنيه المصري'],['اللغة الرسمية في مصر إيه؟','العربية'],
        ['أكبر محافظة مصرية مساحةً إيه؟','الوادي الجديد'],['النشيد الوطني المصري اسمه إيه؟','بلادي بلادي'],
        ['العالم المصري الحاصل على نوبل في الكيمياء عام 1999 مين؟','أحمد زويل'],
        ['الأديب المصري الحاصل على نوبل في الأدب مين؟','نجيب محفوظ'],['أم كلثوم اشتهرت في مجال إيه؟','الغناء'],
        ['محمد صلاح مشهور في رياضة إيه؟','كرة القدم'],['الأهلي والزمالك بيلعبوا رياضة إيه أساسًا؟','كرة القدم'],
        ['الفول والطعمية مشهورين كإيه في مصر؟','أكلات شعبية'],['الملوخية بتتقدم غالبًا مع إيه؟','الأرز أو العيش'],
        ['شم النسيم مناسبة مرتبطة بأنهي فصل؟','الربيع'],['خان الخليلي موجود فين؟','القاهرة'],
        ['برج القاهرة موجود على أنهي جزيرة؟','الزمالك'],['قلعة قايتباي موجودة فين؟','الإسكندرية'],
        ['وادي الملوك موجود فين؟','الأقصر'],['معبد الكرنك موجود فين؟','الأقصر'],
        ['محافظة دمياط مشهورة بصناعة إيه؟','الأثاث'],['مدينة المحلة الكبرى مشهورة بصناعة إيه؟','الغزل والنسيج'],
        ['بورسعيد تقع عند مدخل أنهي قناة؟','قناة السويس'],['شرم الشيخ تقع في أنهي محافظة؟','جنوب سيناء'],
        ['الغردقة تقع على ساحل أنهي بحر؟','البحر الأحمر'],['جامعة الأزهر موجودة فين؟','القاهرة'],
        ['أول عاصمة لمصر الإسلامية كانت إيه؟','الفسطاط'],['المتحف المصري الكبير قريب من إيه؟','أهرامات الجيزة'],
        ['محافظة الفيوم مشهورة ببحيرة إيه؟','قارون'],['رأس البر موجودة في أنهي محافظة؟','دمياط'],
        ['مدينة المنصورة عاصمة أنهي محافظة؟','الدقهلية']
      ];
      const egyptAnswers = egyptFacts.map(item => item[1]);
      egyptFacts.forEach(([question, answer], index) => {
        add({
          category: 'مصر الجميلة', type: 'quiz', question, answer,
          choices: this.options(answer, egyptAnswers.slice(index + 1).concat(egyptAnswers.slice(0, index))),
          explanation: `الإجابة الصحيحة: ${answer}.`
        });
        const truthful = index % 2 === 0;
        const shown = truthful ? answer : egyptAnswers[(index + 9) % egyptAnswers.length];
        add({
          category: 'مصر الجميلة', type: 'quiz',
          question: `صح ولا غلط: «${shown}» هي إجابة سؤال: ${question}`,
          answer: truthful ? 'صح' : 'غلط',
          choices: ['صح', 'غلط'],
          explanation: `الإجابة الأصلية هي: ${answer}.`
        });
      });

      this.bank = bank;
      return bank;
    },

    categories() {
      const counts = {};
      this.bank.forEach(item => counts[item.category] = (counts[item.category] || 0) + 1);
      return counts;
    },

    open() {
      this.buildBank();
      Modal.open(`
        <div class="bored-v23">
          <div class="bored-hero-v23">
            <span>🎲</span>
            <div><h2>لو زهقان</h2><p>علشان تقضي وقتًا شيقًا مع شريك حياتك أو صاحبك… أو تختبر نفسك لوحدك.</p></div>
          </div>
          <div class="modal-title mt-3">مين معاك؟</div>
          <div class="bored-mode-grid">
            <button onclick="BoredomGameV23.setup('solo','')"><span>🧠</span><strong>لوحدي</strong><small>اختبر نفسك واكشف الإجابة</small></button>
            <button onclick="BoredomGameV23.setup('with','شريك حياتك')"><span>❤️</span><strong>شريك حياتي</strong><small>اسألوا بعض واتكلموا</small></button>
            <button onclick="BoredomGameV23.setup('with','صاحبك')"><span>🤝</span><strong>صاحبي</strong><small>تحدي وضحك ومعلومات</small></button>
          </div>
          <div class="bored-count-v23">بنك اللعبة: <strong>${this.bank.length.toLocaleString('ar-EG')}</strong> سؤال ولغز في ${Object.keys(this.categories()).length} مجالات</div>
          <button class="btn ghost block mt-3" onclick="Modal.close()">رجوع</button>
        </div>
      `);
    },

    setup(mode, companion) {
      this.mode = mode;
      this.companion = companion;
      const categories = this.categories();
      Modal.open(`
        <div class="modal-title">🎯 ظبّط الجولة</div>
        <div class="modal-sub">${mode === 'solo' ? 'هتختبر نفسك وتعرف نتيجتك في الآخر.' : `هتسأل ${Utils.escapeHTML(companion)} وتظهر الإجابة لما تكونوا جاهزين.`}</div>
        <div class="field">
          <label class="label">اختار المجال</label>
          <select class="select" id="boredCategoryV23">
            <option value="all">🎲 خليط من كل المجالات — ${this.bank.length}</option>
            ${Object.entries(categories).map(([name, count]) => `<option value="${Utils.escapeHTML(name)}">${Utils.escapeHTML(name)} — ${count}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label class="label">عدد أسئلة الجولة</label>
          <select class="select" id="boredCountV23">
            <option value="10">10 أسئلة — جولة سريعة</option>
            <option value="20">20 سؤالًا — جولة حلوة</option>
            <option value="30">30 سؤالًا — تحدي كبير</option>
          </select>
        </div>
        <button class="btn primary block lg" onclick="BoredomGameV23.start()">ابدأ اللعب 🎲</button>
        <button class="btn ghost block mt-2" onclick="BoredomGameV23.open()">رجوع</button>
      `);
    },

    start() {
      const category = document.getElementById('boredCategoryV23')?.value || 'all';
      const count = Number(document.getElementById('boredCountV23')?.value || 10);
      const pool = category === 'all' ? this.bank : this.bank.filter(item => item.category === category);
      this.session = this.shuffle(pool).slice(0, Math.min(count, pool.length));
      this.index = 0;
      this.score = 0;
      this.answered = 0;
      this.renderQuestion();
    },

    renderQuestion() {
      const item = this.session[this.index];
      if (!item) return this.finish();
      const isConversation = item.type === 'conversation';
      const partnerPrefix = this.mode === 'with'
        ? `<div class="bored-partner-v23">🎤 اسأل ${Utils.escapeHTML(this.companion)}</div>`
        : `<div class="bored-partner-v23">🧠 اختبر نفسك</div>`;

      Modal.open(`
        <div class="bored-progress-v23">
          <span>السؤال ${this.index + 1} من ${this.session.length}</span>
          <strong>${this.score} نقطة</strong>
        </div>
        <div class="progress mb-3"><div class="progress-bar" style="width:${((this.index + 1) / this.session.length) * 100}%"></div></div>
        ${partnerPrefix}
        <article class="bored-question-v23">
          <span class="badge teal">${Utils.escapeHTML(item.category)}</span>
          <h2>${Utils.escapeHTML(item.question)}</h2>
          ${isConversation ? `
            <div class="bored-conversation-tip">خدوا وقتكم في الإجابة… مفيش إجابة نموذجية هنا.</div>
            <button class="btn primary block" onclick="BoredomGameV23.reveal()">💬 افتح فكرة للنقاش</button>
          ` : this.mode === 'solo' ? `
            <div class="bored-choices-v23">
              ${item.choices.map((choice, index) => `<button data-choice="${index}" onclick="BoredomGameV23.answer(${index})">${Utils.escapeHTML(choice)}</button>`).join('')}
            </div>
            <button class="btn outline block mt-3" onclick="BoredomGameV23.reveal()">👀 إظهار الإجابة</button>
          ` : `
            <div class="bored-think-v23">فكّروا الأول… وممنوع الغش يا جماعة 😄</div>
            <button class="btn gold block" onclick="BoredomGameV23.reveal()">👀 أظهر الإجابة</button>
          `}
          <div id="boredAnswerV23"></div>
        </article>
        <button class="btn ghost block mt-3" onclick="BoredomGameV23.finish(true)">إنهاء الجولة</button>
      `);
    },

    answer(choiceIndex) {
      const item = this.session[this.index];
      const buttons = [...document.querySelectorAll('.bored-choices-v23 button')];
      if (!item || buttons.some(button => button.disabled)) return;
      const selected = item.choices[choiceIndex];
      const correct = String(selected) === String(item.answer);
      buttons.forEach((button, index) => {
        button.disabled = true;
        if (String(item.choices[index]) === String(item.answer)) button.classList.add('correct');
        else if (index === choiceIndex) button.classList.add('wrong');
      });
      this.answered += 1;
      if (correct) this.score += 1;
      this.playSound(correct);
      this.showResult(correct);
    },

    reveal() {
      const item = this.session[this.index];
      if (!item) return;
      const host = document.getElementById('boredAnswerV23');
      if (!host || host.innerHTML) return;
      if (item.type === 'conversation') {
        host.innerHTML = `
          <div class="bored-reveal-v23"><strong>💡 فكرة تساعد الحوار</strong><p>${Utils.escapeHTML(item.answer)}</p><small>${Utils.escapeHTML(item.explanation)}</small></div>
          <button class="btn primary block mt-2" onclick="BoredomGameV23.next()">السؤال اللي بعده ←</button>
        `;
        return;
      }
      host.innerHTML = `
        <div class="bored-reveal-v23"><strong>✅ الإجابة: ${Utils.escapeHTML(item.answer)}</strong><p>${Utils.escapeHTML(item.explanation)}</p></div>
        <div class="bored-manual-score-v23">
          <button class="btn green" onclick="BoredomGameV23.manualScore(true)">عرفتها صح ✅</button>
          <button class="btn rose" onclick="BoredomGameV23.manualScore(false)">مكنتش عارف ❌</button>
        </div>
      `;
    },

    manualScore(correct) {
      this.answered += 1;
      if (correct) this.score += 1;
      this.playSound(correct);
      this.showResult(correct);
    },

    showResult(correct) {
      const item = this.session[this.index];
      const host = document.getElementById('boredAnswerV23');
      if (!host) return;
      host.innerHTML = `
        <div class="bored-result-v23 ${correct ? 'correct' : 'wrong'}">
          <strong>${correct ? 'عاش! إجابة صح 👏' : 'ولا يهمك… المرة الجاية تتجاب 😄'}</strong>
          <p>الإجابة: ${Utils.escapeHTML(item.answer)}</p>
          <small>${Utils.escapeHTML(item.explanation)}</small>
        </div>
        <button class="btn primary block mt-2" onclick="BoredomGameV23.next()">السؤال اللي بعده ←</button>
      `;
    },

    next() {
      this.index += 1;
      if (this.index >= this.session.length) this.finish();
      else this.renderQuestion();
    },

    finish(early = false) {
      const total = this.answered;
      const percent = total ? Math.round((this.score / total) * 100) : 0;
      const message = percent >= 80 ? 'يا سلام على المخ اللي صاحي ده! 🔥' : percent >= 50 ? 'جولة حلوة… والمهم إننا اتبسطنا 😄' : 'المرة الجاية هنعمل شغل عالي… مفيش هروب 😂';
      const previous = Storage.get('boredom_stats_v23', { sessions: 0, questions: 0, correct: 0 });
      Storage.set('boredom_stats_v23', {
        sessions: previous.sessions + 1,
        questions: previous.questions + total,
        correct: previous.correct + this.score
      });
      Modal.open(`
        <div class="modal-title">🏁 ${early ? 'أنهيت الجولة' : 'الجولة خلصت'}</div>
        <div class="bored-summary-v23">
          <div>🎯</div><strong>${this.score} من ${total}</strong><span>${percent}%</span><p>${message}</p>
        </div>
        <button class="btn primary block" onclick="BoredomGameV23.open()">جولة جديدة 🎲</button>
        <button class="btn ghost block mt-2" onclick="Modal.close()">رجوع للتطبيق</button>
      `);
    },

    unlockAudio() {
      try {
        this.audioCtx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      } catch (_) {}
    },

    playSound(correct) {
      this.unlockAudio();
      if (!this.audioCtx || this.audioCtx.state !== 'running') return;
      const now = this.audioCtx.currentTime;
      const notes = correct ? [523, 659, 784] : [392, 330, 262];
      notes.forEach((frequency, index) => {
        const oscillator = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        oscillator.type = correct ? 'sine' : 'triangle';
        oscillator.frequency.setValueAtTime(frequency, now + index * 0.12);
        gain.gain.setValueAtTime(0.0001, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.28, now + index * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.2);
        oscillator.connect(gain);
        gain.connect(this.audioCtx.destination);
        oscillator.start(now + index * 0.12);
        oscillator.stop(now + index * 0.12 + 0.22);
      });
    },

    addHomeCard() {
      const container = document.getElementById('homeContent');
      if (!container || document.getElementById('boredomHomeV23')) return;
      const card = document.createElement('div');
      card.id = 'boredomHomeV23';
      card.className = 'card boredom-home-v23';
      card.innerHTML = `
        <div class="boredom-home-icon">🎲</div>
        <div class="boredom-home-copy">
          <div class="card-title">لو زهقان</div>
          <div class="card-sub">1000 سؤال ولغز علشان وقت شيق مع شريك حياتك أو صاحبك… أو تختبر نفسك لوحدك.</div>
        </div>
        <button class="btn gold" onclick="BoredomGameV23.open()">ابدأ اللعب</button>
      `;
      const friday = document.getElementById('fridayKahfV20');
      const companion = container.querySelector('.companion-msg');
      (friday || companion)?.insertAdjacentElement('afterend', card) || container.prepend(card);
    },

    installHome() {
      if (typeof UI === 'undefined') return;
      const originalRenderHome = UI.renderHome.bind(UI);
      UI.renderHome = async function (...args) {
        const result = await originalRenderHome(...args);
        BoredomGameV23.addHomeCard();
        return result;
      };
      setTimeout(() => this.addHomeCard(), 900);
    },

    installNow() {
      if (typeof SmartNowV13 === 'undefined') return;
      const originalItems = SmartNowV13.items.bind(SmartNowV13);
      SmartNowV13.items = async function (...args) {
        const result = await originalItems(...args);
        if (!result.items.some(item => item.action === 'boredom_game')) {
          const boredomItem = {
            icon: '🎲',
            title: 'لو زهقان',
            sub: 'أسئلة وألغاز وتحديات لوحدك أو مع حد',
            action: 'boredom_game'
          };
          const surveyIndex = result.items.findIndex(item => item.action === 'daily_survey');
          result.items.splice(surveyIndex >= 0 ? surveyIndex + 1 : result.items.length, 0, boredomItem);
        }
        return result;
      };
      const originalRun = SmartNowV13.run.bind(SmartNowV13);
      SmartNowV13.run = async function (action) {
        if (action === 'boredom_game') {
          BoredomGameV23.open();
          return;
        }
        return originalRun(action);
      };
    },

    install() {
      try { CONFIG.version = '2.3.0'; } catch (_) {}
      this.buildBank();
      this.installHome();
      this.installNow();
      document.addEventListener('pointerdown', () => this.unlockAudio(), { once: true, capture: true });
    }
  };

  window.BoredomGameV23 = BoredomGameV23;
  BoredomGameV23.install();

  const css = document.createElement('style');
  css.textContent = `
    .boredom-home-v23{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;border:2px solid var(--gold);background:linear-gradient(135deg,var(--gold-soft),var(--surface))}
    .boredom-home-icon{grid-row:1/3;width:54px;height:54px;display:grid;place-items:center;border-radius:17px;background:linear-gradient(135deg,var(--gold),var(--accent));font-size:28px;color:#fff}
    .boredom-home-v23>.btn{grid-column:1/-1;width:100%}
    .bored-hero-v23{display:flex;gap:12px;align-items:center;padding:16px;border-radius:20px;background:linear-gradient(135deg,#b7791f,#0f766e);color:#fff}.bored-hero-v23>span{font-size:48px}.bored-hero-v23 h2{font-size:21px}.bored-hero-v23 p{font-size:12.5px;line-height:1.75;opacity:.9}
    .bored-mode-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.bored-mode-grid button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:13px 7px;border:1px solid var(--border);border-radius:14px;background:var(--surface-2);text-align:center}.bored-mode-grid span{font-size:27px}.bored-mode-grid strong{font-size:13px}.bored-mode-grid small{font-size:10px;color:var(--text-muted)}
    .bored-count-v23{text-align:center;margin-top:13px;padding:9px;border-radius:12px;background:var(--accent-soft);font-size:12px;color:var(--accent-deep)}
    .bored-progress-v23{display:flex;justify-content:space-between;gap:10px;font-size:12px}.bored-progress-v23 strong{color:var(--accent-deep)}
    .bored-partner-v23{text-align:center;padding:7px;border-radius:99px;background:var(--accent-soft);color:var(--accent-deep);font-weight:700;font-size:12px;margin-bottom:10px}
    .bored-question-v23{padding:16px;border:1px solid var(--border);border-radius:18px;background:var(--surface);box-shadow:var(--shadow)}.bored-question-v23 h2{font-size:19px;line-height:1.8;margin:12px 0}
    .bored-choices-v23{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.bored-choices-v23 button{padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2);font-weight:700}.bored-choices-v23 button.correct{background:var(--green-soft);border-color:var(--green);color:var(--green)}.bored-choices-v23 button.wrong{background:var(--rose-soft);border-color:var(--rose);color:var(--rose)}
    .bored-think-v23,.bored-conversation-tip{text-align:center;padding:13px;margin-bottom:10px;border-radius:13px;background:var(--surface-2);color:var(--text-soft);font-size:13px}
    .bored-reveal-v23,.bored-result-v23{margin-top:12px;padding:13px;border-radius:13px;background:var(--accent-soft);line-height:1.8}.bored-result-v23.correct{background:var(--green-soft)}.bored-result-v23.wrong{background:var(--rose-soft)}.bored-reveal-v23 p,.bored-result-v23 p{margin-top:4px}.bored-reveal-v23 small,.bored-result-v23 small{color:var(--text-soft)}
    .bored-manual-score-v23{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}
    .bored-summary-v23{text-align:center;padding:24px;border-radius:20px;background:linear-gradient(135deg,var(--accent-soft),var(--gold-soft));margin-bottom:12px}.bored-summary-v23>div{font-size:48px}.bored-summary-v23 strong{display:block;font-size:30px}.bored-summary-v23 span{font-weight:800;color:var(--accent-deep)}.bored-summary-v23 p{margin-top:8px}
    @media(max-width:390px){.bored-mode-grid{grid-template-columns:1fr}.bored-mode-grid button{flex-direction:row;text-align:right}.bored-mode-grid small{margin-right:auto}.bored-choices-v23{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);
})();
