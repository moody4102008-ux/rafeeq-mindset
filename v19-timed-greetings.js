(function () {
  'use strict';

  const TimedGreetingsV19 = {
    periods: {
      morning: {
        label: 'صباح الفل',
        icon: '☀️',
        lines: [
          'ربنا يوسّع رزقك النهارده، ويبارك لك في مالك وأولادك وحياتك يا رب.',
          'ربنا يجعل صباحك راحة وبركة، ويفتح لك أبواب الخير من حيث لا تحتسب.',
          'يا رب يومك يبدأ بخبر يفرّح قلبك، ويكمل برضا وستر وتوفيق.',
          'ربنا يقوّيك على اللي وراك، ويخفف عنك اللي شاغل بالك، ويرزقك راحة البال.',
          'ربنا يكتب لك في صباحك رزقًا حلالًا، وقلبًا مطمئنًا، وخطوات موفقة.',
          'يا رب صباحك يبقى أهدى من امبارح، وأجمل مما تتوقع، ومليان بركة.',
          'ربنا يحفظك ويحفظ أهلك، ويجعل يومكم كله خير وعافية ورضا.',
          'ربنا ينور طريقك، ويبارك في وقتك، ويعينك تعمل اللي عليك من غير ضغط على نفسك.'
        ]
      },
      afternoon: {
        label: 'إحنا دلوقتي بعد الظهر',
        icon: '🌤️',
        lines: [
          'ربنا يبارك لك في باقي يومك، ويتمّم لك أمورك على خير وراحة.',
          'يا رب اللي فات من يومك يكون خير، واللي جاي يكون أهدى وأجمل.',
          'ربنا يقوّيك ويجدد طاقتك، ويرزقك توفيقًا في كل خطوة لسه جاية.',
          'ربنا يسهّل لك الصعب، ويطمن قلبك، ويبارك لك في وقتك ومجهودك.',
          'يا رب نص يومك التاني يحمل لك خبرًا حلوًا وفرجًا قريبًا وراحة بال.',
          'ربنا يعوّض تعبك خير، ويجعل سعيك مباركًا ونتيجته تفرّح قلبك.',
          'ربنا يحفظ لك أهلك وبيتك، ويملأ باقي اليوم مودة وهدوءًا وبركة.',
          'يا رب تكمّل يومك من غير جلد للذات؛ بهدوء، وتوفيق، وخطوة حلوة وراء خطوة.'
        ]
      },
      evening: {
        label: 'مساء الخير',
        icon: '🌆',
        lines: [
          'ربنا يجعل مساءك سكينة، ويبعد عنك الهم والتفكير اللي مالوش آخر.',
          'يا رب مساءك يبقى راحة بعد التعب، ورضا بعد السعي، وبركة في بيتك وأهلك.',
          'ربنا يطمّن قلبك على كل حاجة شاغلاك، ويكتب لك الخير في اللي جاي.',
          'ربنا يبارك لك في مالك وأولادك وحياتك، ويحفظ لكم الستر والمحبة.',
          'يا رب اللي أتعبك النهارده يهون، واللي فرّحك يدوم، وبكرة يكون أجمل.',
          'ربنا يرزقك مساءً هادئًا، ونفسًا راضية، وقلبًا قريبًا منه.',
          'ربنا يجبر خاطرك، ويعوضك عن كل لحظة صعبة، ويرزقك نومًا مريحًا.',
          'يا رب تختم يومك وأنت شايف النعم اللي حواليك، ومطمن إن بكرة فرصة جديدة.'
        ]
      },
      night: {
        label: 'ليلة هادية',
        icon: '🌙',
        lines: [
          'ربنا يريح بالك، ويكفيك شر التفكير الزيادة، ويرزقك نومًا هاديًا.',
          'يا رب تسلّم له كل اللي شاغلك، وتنام مطمئنًا وتصحى على خير.',
          'ربنا يغفر لك ويستر عليك، ويحفظك ويحفظ أهلك طول الليل.',
          'يا رب بكرة ييجي ومعاه فرج وتوفيق ورزق أحسن مما تتمنى.',
          'ربنا يهدّي قلبك، ويبعد عنك القلق، ويكتب لجسمك ونفسك الراحة.',
          'يا رب يومك ينتهي بالرضا، وتبدأ يومًا جديدًا بقوة وأمل وبركة.'
        ]
      }
    },

    getPeriod() {
      const hour = new Date().getHours();
      if (hour < 12) return 'morning';
      if (hour < 17) return 'afternoon';
      if (hour < 22) return 'evening';
      return 'night';
    },

    pick(period) {
      const config = this.periods[period];
      const key = `rafeeq_timed_greeting_${period}`;
      let previous = Number(localStorage.getItem(key));
      let index = Math.floor(Math.random() * config.lines.length);
      if (config.lines.length > 1 && index === previous) {
        index = (index + 1 + Math.floor(Math.random() * (config.lines.length - 1))) % config.lines.length;
      }
      localStorage.setItem(key, String(index));
      return config.lines[index];
    },

    add() {
      const container = document.getElementById('homeContent');
      if (!container) return;
      container.querySelectorAll('.home-welcome,.v13-hero,.opening-v14,.timed-greeting-v19')
        .forEach(element => element.remove());

      const period = this.getPeriod();
      const config = this.periods[period];
      const name = Utils.escapeHTML(UserProfile.getDisplayName());
      const message = Utils.escapeHTML(this.pick(period));

      container.insertAdjacentHTML('afterbegin', `
        <div class="card timed-greeting-v19 period-${period}">
          <img src="app-hero-v2.png" alt="رفيق مايندست">
          <div class="timed-greeting-copy">
            <div class="timed-greeting-label">${config.icon} دعوة حلوة ليك</div>
            <h2>${config.label} يا ${name}</h2>
            <p>${message}</p>
            <small>خد نفسًا هاديًا… وابدأ من الخطوة اللي تقدر عليها 🤍</small>
          </div>
        </div>
      `);
    }
  };

  window.TimedGreetingsV19 = TimedGreetingsV19;

  if (window.OpeningV14) {
    OpeningV14.add = () => TimedGreetingsV19.add();
    OpeningV14.pick = () => TimedGreetingsV19.pick(TimedGreetingsV19.getPeriod());
  }

  /* OpeningV14 في بعض نسخ التطبيق موجود داخل نطاق مغلق؛
     لذلك نربط البطاقة الجديدة مباشرة بإعادة رسم الصفحة الرئيسية. */
  if (window.UI && typeof UI.renderHome === 'function') {
    const renderHomeBeforeTimedGreeting = UI.renderHome.bind(UI);
    UI.renderHome = async function (...args) {
      const result = await renderHomeBeforeTimedGreeting(...args);
      TimedGreetingsV19.add();
      return result;
    };
  }

  const css = document.createElement('style');
  css.textContent = `
    .timed-greeting-v19{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;border:0;color:#fff;background:linear-gradient(135deg,#0f766e,#134e4a)}
    .timed-greeting-v19.period-afternoon{background:linear-gradient(135deg,#b7791f,#0f766e)}
    .timed-greeting-v19.period-evening{background:linear-gradient(135deg,#7c3aed,#134e4a)}
    .timed-greeting-v19.period-night{background:linear-gradient(135deg,#1e3a5f,#111827)}
    .timed-greeting-v19::after{content:'';position:absolute;width:150px;height:150px;border-radius:50%;left:-55px;top:-75px;background:rgba(255,255,255,.09)}
    .timed-greeting-v19 img{width:82px;height:82px;object-fit:cover;border-radius:20px;flex:none;box-shadow:0 8px 24px rgba(0,0,0,.18)}
    .timed-greeting-copy{position:relative;z-index:1;flex:1}.timed-greeting-label{font-size:12px;font-weight:700;color:#fde68a;margin-bottom:3px}
    .timed-greeting-copy h2{font-size:19px;margin:0 0 5px}.timed-greeting-copy p{font-size:14.5px;line-height:1.9;margin:0}
    .timed-greeting-copy small{display:block;margin-top:7px;color:rgba(255,255,255,.76);font-size:11px}
    @media(max-width:390px){.timed-greeting-v19{align-items:flex-start}.timed-greeting-v19 img{width:58px;height:58px;border-radius:15px}.timed-greeting-copy h2{font-size:17px}}
  `;
  document.head.appendChild(css);

  /* لو كانت الرئيسية مرسومة بالفعل عند تحميل الملف، حدّثها فورًا. */
  setTimeout(() => {
    const home = document.getElementById('screen-home');
    if (home?.classList.contains('active') && document.getElementById('homeContent')) {
      TimedGreetingsV19.add();
    }
  }, 500);
})();
