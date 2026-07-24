(function () {
  'use strict';

  const FeelingsWirdV22 = {
    feelings: [
      ['😟', 'قلقان', 'أنا قلقان ومش عارف أهدى، أعمل إيه؟', 'anxiety-what-is-anxiety'],
      ['😔', 'زعلان', 'أنا زعلان ومخنوق، أتعامل مع إحساسي إزاي؟', 'sadness-what-is-normal'],
      ['😣', 'متوتر', 'أنا متوتر وجسمي مشدود، أهدى إزاي؟', 'stress-management-techniques'],
      ['😡', 'غضبان', 'أنا غضبان جدًا وخايف أتصرف غلط، أعمل إيه؟', 'anger-management-techniques'],
      ['😨', 'خايف', 'أنا خايف ومش عارف أسيطر على الخوف، أعمل إيه؟', 'fear-what-is-fear'],
      ['🥺', 'وحيد', 'حاسس بالوحدة ومحتاج حد يفهمني، أعمل إيه؟', 'loneliness-alone-vs-lonely'],
      ['💔', 'متعلق', 'أنا متعلق بشخص وخايف يسيبني، أتعامل إزاي؟', 'anxious-attachment-becoming-secure'],
      ['🪫', 'فاقد الطاقة', 'أنا فاقد الطاقة والشغف ومش قادر أبدأ، أعمل إيه؟', 'burnout-what-is']
    ],

    installFeelings() {
      if (typeof AskAttachedV18 === 'undefined') return;

      const originalOpen = AskAttachedV18.open.bind(AskAttachedV18);
      AskAttachedV18.open = function (...args) {
        const result = originalOpen(...args);
        FeelingsWirdV22.injectFeelings();
        return result;
      };

      AskAttachedV18.openFeelings = () => {
        AskAttachedV18.open();
        FeelingsWirdV22.focusFeelings();
      };

      if (typeof App !== 'undefined') {
        App.openEmotionPicker = () => AskAttachedV18.openFeelings();
      }
    },

    injectFeelings() {
      const root = document.querySelector('.ask18');
      if (!root || root.querySelector('#askFeelingsV22')) return;
      const welcome = root.querySelector('.ask18-welcome');
      const panel = document.createElement('section');
      panel.id = 'askFeelingsV22';
      panel.className = 'ask-feelings-v22';
      panel.innerHTML = `
        <div class="ask-feelings-title">
          <div><strong>💚 شعورك إيه دلوقتي؟</strong><small>اختار الأقرب، ورفيقك هيجيب لك إجابة مناسبة.</small></div>
        </div>
        <div class="ask-feelings-grid">
          ${this.feelings.map(([icon, label, question], index) => `
            <button onclick="FeelingsWirdV22.choose(${index})">
              <span>${icon}</span><strong>${Utils.escapeHTML(label)}</strong>
            </button>
          `).join('')}
        </div>
      `;
      if (welcome) welcome.insertAdjacentElement('afterend', panel);
      else root.prepend(panel);
    },

    focusFeelings() {
      setTimeout(() => {
        const panel = document.getElementById('askFeelingsV22');
        panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    },

    choose(index) {
      const feeling = this.feelings[Number(index)];
      if (!feeling) return;
      AskAttachedV18.openEntry(feeling[3]);
      const input = document.getElementById('ask18Input');
      if (input) input.value = feeling[2];
    },

    async openWird() {
      Modal.close();
      const ready = await RafeeqV20.ensureMushaf();
      if (!ready) {
        Toast.show('المصحف لسه بيحمّل… جرّب مرة تانية بعد لحظات', 'info', 7000);
        Nav.go('quran');
        return;
      }
      const page = await MushafEngine.getLastReadPage();
      await MushafReader.open(page || 1);
    },

    installWird() {
      if (typeof SmartNowV13 === 'undefined') return;

      const originalItems = SmartNowV13.items.bind(SmartNowV13);
      SmartNowV13.items = async function (...args) {
        const result = await originalItems(...args);
        if (!result.items.some(item => item.action === 'daily_wird')) {
          let progress = null;
          try { progress = await WirdLink.getTodayProgress(); } catch (_) {}
          const item = {
            icon: '📖',
            title: 'قراءة وردك',
            sub: progress
              ? `قرأت ${progress.pages} من ${progress.goal} صفحة — كمّل من آخر موضع`
              : 'كمّل من آخر موضع وقفت عنده في المصحف',
            action: 'daily_wird'
          };
          const baqarahIndex = result.items.findIndex(existing => existing.action === 'read_baqarah');
          result.items.splice(baqarahIndex >= 0 ? baqarahIndex + 1 : 0, 0, item);
        }
        return result;
      };

      const originalRun = SmartNowV13.run.bind(SmartNowV13);
      SmartNowV13.run = async function (action) {
        if (action === 'daily_wird') {
          await FeelingsWirdV22.openWird();
          return;
        }
        return originalRun(action);
      };
    },

    install() {
      try { CONFIG.version = '2.2.0'; } catch (_) {}
      this.installFeelings();
      this.installWird();
    }
  };

  window.FeelingsWirdV22 = FeelingsWirdV22;
  FeelingsWirdV22.install();

  const css = document.createElement('style');
  css.textContent = `
    .ask-feelings-v22{padding:12px;border:1px solid var(--accent);border-radius:16px;background:linear-gradient(135deg,var(--accent-soft),var(--surface));scroll-margin-top:12px}
    .ask-feelings-title strong{display:block;font-size:14px}.ask-feelings-title small{display:block;color:var(--text-soft);font-size:11.5px;margin-top:2px}
    .ask-feelings-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:10px}
    .ask-feelings-grid button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:68px;padding:7px 4px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
    .ask-feelings-grid button span{font-size:23px}.ask-feelings-grid button strong{font-size:11px}
    @media(max-width:390px){.ask-feelings-grid{grid-template-columns:repeat(4,1fr)}.ask-feelings-grid button{min-height:62px}}
  `;
  document.head.appendChild(css);
})();
