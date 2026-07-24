(function () {
  'use strict';

  const NowActionsV21 = {
    install() {
      try { CONFIG.version = '2.1.0'; } catch (_) {}
      if (typeof SmartNowV13 === 'undefined') return;

      const originalItems = SmartNowV13.items.bind(SmartNowV13);
      SmartNowV13.items = async function (...args) {
        const result = await originalItems(...args);
        const items = result.items || [];

        const addIfMissing = item => {
          if (!items.some(existing => existing.action === item.action)) items.push(item);
        };

        addIfMissing({
          icon: '🌅',
          title: 'أذكار الصباح',
          sub: result.s?.adhkar?.morning === 'complete'
            ? 'مكتملة اليوم — تقدر ترجع لها في أي وقت'
            : 'ابدأ أو كمّل أذكار الصباح',
          action: 'morning'
        });

        addIfMissing({
          icon: '🌙',
          title: 'أذكار المساء',
          sub: result.s?.adhkar?.evening === 'complete'
            ? 'مكتملة اليوم — تقدر ترجع لها في أي وقت'
            : 'ابدأ أو كمّل أذكار المساء',
          action: 'evening'
        });

        addIfMissing({
          icon: '📖',
          title: 'قراءة سورة البقرة',
          sub: 'اذهب مباشرةً إلى سورة البقرة في المصحف',
          action: 'read_baqarah'
        });

        addIfMissing({
          icon: '📞',
          title: 'اتصل بشخص محتاج تكلّمه',
          sub: 'مكالمة صغيرة ممكن تفرق معاك ومعاه',
          action: 'contact_person'
        });

        addIfMissing({
          icon: '📋',
          title: 'اعمل اختبارًا ليومك',
          sub: 'اختر استبيانًا مناسبًا من قسم نفسيتك',
          action: 'daily_survey'
        });

        /* الصلاة الفائتة تظهر أولًا، ثم تذكير الجمعة، ثم بقية الاختيارات. */
        const order = {
          missed_prayer: 0,
          friday_kahf: 1,
          morning: 2,
          evening: 3,
          read_baqarah: 4,
          contact_person: 5,
          daily_survey: 6
        };
        result.items = items
          .map((item, index) => ({ item, index }))
          .sort((a, b) => {
            const first = order[a.item.action] ?? 50;
            const second = order[b.item.action] ?? 50;
            return first === second ? a.index - b.index : first - second;
          })
          .map(record => record.item);

        return result;
      };

      const originalRun = SmartNowV13.run.bind(SmartNowV13);
      SmartNowV13.run = async function (action) {
        if (action === 'read_baqarah') {
          await RafeeqV20.openSurah(2);
          return;
        }
        if (action === 'contact_person') {
          NowActionsV21.openContact();
          return;
        }
        if (action === 'daily_survey') {
          Modal.close();
          if (typeof SurveysV14 !== 'undefined' && typeof SurveysV14.open === 'function') {
            SurveysV14.open();
          } else {
            Nav.go('mental');
            Toast.show('افتح قسم الاستبيانات في نفسيتك', 'info', 6000);
          }
          return;
        }
        return originalRun(action);
      };
    },

    openContact() {
      Modal.open(`
        <div class="modal-title">📞 اتصل بشخص محتاج تكلّمه</div>
        <div class="modal-sub">افتكر شخصًا غايب عنك، أو حد محتاج تطمّن عليه، أو شخص محتاج يسمع صوتك.</div>

        <div class="card contact-prompt-v21">
          <div class="card-title">قبل المكالمة</div>
          <ul>
            <li>ابدأ بسؤال بسيط: عامل إيه بجد؟</li>
            <li>اسمع من غير استعجال أو محاولة حل كل شيء.</li>
            <li>لو بينكم خلاف، ابدأ بهدوء ومن غير عتاب طويل.</li>
          </ul>
        </div>

        <div class="field">
          <label class="label">رقم الهاتف (اختياري)</label>
          <input id="contactPhoneV21" class="input" type="tel" inputmode="tel"
            placeholder="اكتب الرقم لو عايز تبدأ المكالمة الآن">
        </div>

        <button class="btn primary block" onclick="NowActionsV21.call()">📞 ابدأ المكالمة</button>
        <button class="btn outline block mt-2" onclick="Modal.close();Nav.go('relationships')">❤️ افتح قسم علاقاتي</button>
        <button class="btn ghost block mt-2" onclick="SmartNowV13.open()">رجوع للاقتراحات</button>
      `);
      setTimeout(() => document.getElementById('contactPhoneV21')?.focus(), 100);
    },

    call() {
      const input = document.getElementById('contactPhoneV21');
      const number = String(input?.value || '').replace(/[^\d+]/g, '');
      if (!number || number.length < 5) {
        Toast.show('اكتب رقم الهاتف أولًا، أو افتح قسم علاقاتي', 'info', 6500);
        input?.focus();
        return;
      }
      window.location.href = `tel:${number}`;
    }
  };

  window.NowActionsV21 = NowActionsV21;
  NowActionsV21.install();

  const css = document.createElement('style');
  css.textContent = `
    .contact-prompt-v21{background:linear-gradient(135deg,var(--accent-soft),var(--surface));border:1px solid var(--accent)}
    .contact-prompt-v21 ul{padding-right:20px;line-height:1.9;font-size:13px}
    .contact-prompt-v21 li+li{margin-top:5px}
  `;
  document.head.appendChild(css);
})();
