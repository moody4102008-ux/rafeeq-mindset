(function () {
  'use strict';

  const RafeeqV20 = {
    observer: null,
    prayerTimer: null,

    isFriday(date = new Date()) {
      return date.getDay() === 5;
    },

    cleanName() {
      const raw = String(UserProfile.getDisplayName?.() || 'صاحبي').trim();
      return raw.replace(/^يا\s+/, '') || 'صاحبي';
    },

    greeting() {
      const period = TimedGreetingsV19.getPeriod();
      const config = TimedGreetingsV19.periods[period];
      return `${config.label} يا ${this.cleanName()} ${config.icon}\n\n${TimedGreetingsV19.pick(period)}`;
    },

    installGreeting() {
      if (typeof TimeContext !== 'undefined') {
        TimeContext.getGreeting = () => RafeeqV20.greeting();
      }
    },

    fridayBanner() {
      return `
        <div class="card friday-kahf-v20" id="fridayKahfV20">
          <div class="friday-kahf-icon">📖</div>
          <div class="friday-kahf-copy">
            <span>تذكير الجمعة</span>
            <h3>النهارده الجمعة… متنساش سورة الكهف 🤍</h3>
            <p>اضغط هنا وهتروح مباشرةً لسورة الكهف داخل المصحف.</p>
          </div>
          <button class="btn gold" onclick="RafeeqV20.openSurah(18)">افتح سورة الكهف</button>
        </div>
      `;
    },

    async enhanceHome() {
      const container = document.getElementById('homeContent');
      if (!container) return;

      /* إزالة بطاقات الترحيب الإضافية القديمة؛ التحية الآن داخل رسالة رفيق الأصلية. */
      container.querySelectorAll('.timed-greeting-v19,.opening-v14,.v13-hero,.home-welcome')
        .forEach(element => element.remove());

      if (this.isFriday() && !document.getElementById('fridayKahfV20')) {
        const companion = container.querySelector('.companion-msg');
        if (companion) companion.insertAdjacentHTML('afterend', this.fridayBanner());
        else container.insertAdjacentHTML('afterbegin', this.fridayBanner());
        this.notifyFridayOnce();
      }

      this.addBaqarahButtons(container);
      await this.markUnconfirmedPrayers(container);
    },

    notifyFridayOnce() {
      const key = `friday_kahf_notice_${Utils.todayKey()}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      setTimeout(() => {
        Toast.show('📖 النهارده الجمعة… متنساش تقرأ سورة الكهف', 'info', 8500);
      }, 900);
      try {
        if (State.settings?.notifPermission === 'granted') {
          Notifications.show('📖 تذكير الجمعة', 'النهارده الجمعة… متنساش قراءة سورة الكهف 🤍');
        }
      } catch (_) {}
    },

    async ensureMushaf() {
      if (window.QURAN_DATA) return true;
      try {
        if (typeof QuranFinalLoader !== 'undefined') return await QuranFinalLoader.load();
        if (App._loadQuranData) return await App._loadQuranData();
      } catch (_) {}
      return !!window.QURAN_DATA;
    },

    async openSurah(number) {
      Modal.close();
      const ready = await this.ensureMushaf();
      if (!ready || typeof MushafReader === 'undefined') {
        Toast.show('المصحف لسه بيحمّل… جرّب تاني بعد لحظات', 'info', 7000);
        Nav.go('quran');
        return;
      }
      await MushafReader.goToSurah(Number(number));
      setTimeout(() => {
        try {
          const surah = MushafEngine.getSurah(Number(number));
          const modal = document.getElementById('modal');
          if (!surah || !modal) return;
          const sub = modal.querySelector('.modal-sub');
          if (sub) sub.textContent = `${surah.name} — بداية السورة`;
          const heading = [...modal.querySelectorAll('div')]
            .find(element => element.children.length === 0 && element.textContent.trim() === surah.name);
          if (heading) {
            heading.style.background = 'var(--accent-soft)';
            heading.style.borderRadius = '12px';
            heading.style.padding = '8px';
            heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (_) {}
      }, 500);
    },

    addBaqarahButtons(root = document) {
      root.querySelectorAll('button[onclick*="App.openBaqarah()"]').forEach(button => {
        const parent = button.parentElement;
        if (!parent || parent.querySelector('.baqarah-mushaf-v20')) return;
        const direct = document.createElement('button');
        direct.className = 'btn primary block mt-2 baqarah-mushaf-v20';
        direct.innerHTML = '📖 افتح سورة البقرة في المصحف';
        direct.onclick = () => this.openSurah(2);
        button.insertAdjacentElement('afterend', direct);
      });
    },

    installBaqarahLink() {
      if (typeof App === 'undefined' || typeof App.openBaqarah !== 'function') return;
      const originalOpenBaqarah = App.openBaqarah.bind(App);
      App.openBaqarah = async function (...args) {
        const result = await originalOpenBaqarah(...args);
        const modal = document.getElementById('modal');
        if (modal && !modal.querySelector('.baqarah-mushaf-v20')) {
          const button = document.createElement('button');
          button.className = 'btn primary block mt-2 baqarah-mushaf-v20';
          button.innerHTML = '📖 ابدأ أو كمّل سورة البقرة من المصحف';
          button.onclick = () => RafeeqV20.openSurah(2);
          modal.appendChild(button);
        }
        return result;
      };
    },

    installFridaySuggestion() {
      if (typeof SmartNowV13 === 'undefined') return;
      const originalItems = SmartNowV13.items.bind(SmartNowV13);
      SmartNowV13.items = async function (...args) {
        const result = await originalItems(...args);
        if (RafeeqV20.isFriday() && !result.items.some(item => item.action === 'friday_kahf')) {
          result.items.unshift({
            icon: '📖',
            title: 'قراءة سورة الكهف',
            sub: 'تذكير الجمعة — افتحها مباشرةً في المصحف',
            action: 'friday_kahf',
            urgent: false
          });
        }
        return result;
      };

      const originalRun = SmartNowV13.run.bind(SmartNowV13);
      SmartNowV13.run = async function (action) {
        if (action === 'friday_kahf') {
          await RafeeqV20.openSurah(18);
          return;
        }
        return originalRun(action);
      };
    },

    async markUnconfirmedPrayers(root = document) {
      if (typeof PrayerStatusEngine === 'undefined') return;
      let timeline;
      try {
        timeline = await PrayerStatusEngine.getTimeline();
      } catch (_) {
        return;
      }

      root.querySelectorAll('.prayer-times-row').forEach(row => {
        const pills = [...row.querySelectorAll('.prayer-pill')];
        if (pills.length !== CONFIG.prayerOrder.length) return;
        timeline.forEach((prayer, index) => {
          const pill = pills[index];
          if (!pill) return;
          pill.querySelectorAll('.prayer-question-v20').forEach(mark => mark.remove());
          pill.classList.remove('prayer-unconfirmed-v20');
          if (!prayer.entered || prayer.status === 'done') return;

          pill.classList.add('prayer-unconfirmed-v20');
          const oldStatus = pill.querySelector('.text-xs');
          if (oldStatus) {
            oldStatus.textContent = '❓';
            oldStatus.setAttribute('aria-label', 'لم يتم تسجيل الصلاة');
          } else {
            const mark = document.createElement('span');
            mark.className = 'prayer-question-v20';
            mark.textContent = '❓';
            mark.title = 'لم يتم تسجيل أنك صليتها';
            pill.appendChild(mark);
          }
        });
      });
    },

    installLoudTone() {
      if (typeof NotificationAudioV12 === 'undefined') return;
      NotificationAudioV12.play = function (type = 'info') {
        if (!this.enabled) return;
        this.unlock();
        if (!this.ctx || this.ctx.state !== 'running') return;

        const now = this.ctx.currentTime;
        const notes = type === 'error'
          ? [784, 622, 523, 392]
          : type === 'success'
            ? [659, 784, 988, 1047]
            : [740, 880, 1047, 880];

        notes.forEach((frequency, index) => {
          const oscillator = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          oscillator.type = index % 2 ? 'triangle' : 'sine';
          oscillator.frequency.setValueAtTime(frequency, now + index * 0.15);
          gain.gain.setValueAtTime(0.0001, now + index * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.38, now + index * 0.15 + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.15 + 0.28);
          oscillator.connect(gain);
          gain.connect(this.ctx.destination);
          oscillator.start(now + index * 0.15);
          oscillator.stop(now + index * 0.15 + 0.3);
        });
      };
    },

    installHomeHook() {
      if (typeof UI === 'undefined' || typeof UI.renderHome !== 'function') return;
      const originalRenderHome = UI.renderHome.bind(UI);
      UI.renderHome = async function (...args) {
        const result = await originalRenderHome(...args);
        await RafeeqV20.enhanceHome();
        return result;
      };
    },

    observeUI() {
      if (this.observer || !document.body) return;
      this.observer = new MutationObserver(() => {
        clearTimeout(this.prayerTimer);
        this.prayerTimer = setTimeout(async () => {
          if (document.getElementById('screen-home')?.classList.contains('active')) {
            await this.enhanceHome();
          } else {
            this.addBaqarahButtons(document);
            await this.markUnconfirmedPrayers(document);
          }
        }, 80);
      });
      this.observer.observe(document.body, { childList: true, subtree: true });
    },

    install() {
      try { CONFIG.version = '2.0.0'; } catch (_) {}
      this.installGreeting();
      this.installHomeHook();
      this.installFridaySuggestion();
      this.installBaqarahLink();
      this.installLoudTone();
      this.observeUI();
      setTimeout(() => this.enhanceHome(), 700);
    }
  };

  window.RafeeqV20 = RafeeqV20;

  const css = document.createElement('style');
  css.textContent = `
    .friday-kahf-v20{display:grid;grid-template-columns:auto 1fr;gap:12px;border:2px solid var(--gold);background:linear-gradient(135deg,var(--gold-soft),var(--surface));align-items:center}
    .friday-kahf-v20 .friday-kahf-icon{grid-row:1/3;width:54px;height:54px;display:grid;place-items:center;border-radius:17px;background:var(--gold);color:#fff;font-size:27px}
    .friday-kahf-copy span{font-size:11px;color:var(--gold);font-weight:800}.friday-kahf-copy h3{font-size:16px;line-height:1.6;margin:2px 0}.friday-kahf-copy p{font-size:12px;color:var(--text-soft)}
    .friday-kahf-v20>.btn{grid-column:1/-1;width:100%}
    .prayer-pill{position:relative}.prayer-pill.prayer-unconfirmed-v20{border:2px solid var(--amber);background:var(--amber-soft)}
    .prayer-pill.prayer-unconfirmed-v20 .pp-name,.prayer-pill.prayer-unconfirmed-v20 .pp-time{color:var(--text)}
    .prayer-question-v20{position:absolute;top:-7px;left:-5px;width:25px;height:25px;display:grid;place-items:center;border-radius:50%;background:var(--amber);color:#fff;font-size:14px;box-shadow:var(--shadow-sm)}
    @media(max-width:380px){.friday-kahf-v20{grid-template-columns:1fr}.friday-kahf-v20 .friday-kahf-icon{display:none}}
  `;
  document.head.appendChild(css);

  RafeeqV20.install();
})();
