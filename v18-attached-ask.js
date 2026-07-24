(function () {
  'use strict';

  const AskAttachedV18 = {
    data: Array.isArray(window.RAFEEQ_ATTACHED_KNOWLEDGE) ? window.RAFEEQ_ATTACHED_KNOWLEDGE : [],
    resultLimit: 6,
    index: null,
    stopWords: new Set([
      'انا','اني','هو','هي','ده','دي','دا','في','من','على','عن','مع','لو','طب','طيب','ممكن',
      'عايز','عاوزه','عايزة','ازاي','ليه','ايه','يعني','قول','قولي','اشرح','اعمل','دلوقتي',
      'هل','ما','ماذا','كيف','لماذا','الى','أريد','اريد','عندي','عندى','حاسس','حاسة'
    ]),
    crisisWords: [
      'انتحر','الانتحار','اقتل نفسي','أقتل نفسي','اموت نفسي','أموت نفسي','مش عايز اعيش',
      'مش عايزة اعيش','اؤذي نفسي','أؤذي نفسي','إيذاء نفسي','انهي حياتي','أنهى حياتي'
    ],

    normalize(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[إأآٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/ـ/g, '')
        .replace(/[^\u0600-\u06ffa-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    },

    stem(value) {
      let word = this.normalize(value);
      if (word.startsWith('ال') && word.length > 4) word = word.slice(2);
      for (const prefix of ['وال','بال','كال','فال','لل']) {
        if (word.startsWith(prefix) && word.length > prefix.length + 3) {
          word = word.slice(prefix.length);
          break;
        }
      }
      for (const suffix of ['يات','ات','يون','يين','ون','ين','ان','يه','ية','ها','هم','نا']) {
        if (word.endsWith(suffix) && word.length > suffix.length + 2) {
          word = word.slice(0, -suffix.length);
          break;
        }
      }
      return word;
    },

    tokens(value) {
      return [...new Set(
        this.normalize(value)
          .split(' ')
          .map(word => this.stem(word))
          .filter(word => word.length > 1 && !this.stopWords.has(word))
      )];
    },

    canonicalize(value) {
      let text = this.normalize(value);
      const aliases = [
        [/(انام|منام|بنوم|ارقد)/g, 'نوم ارق'],
        [/(عصبي|عصبيه|متعصب|بتعصب|بعصب)/g, 'غضب اداره الغضب'],
        [/(يسيبني|تسيبني|هيسيبني|تهجرني)/g, 'هجر تعلق قلق'],
        [/(سابني|سيبني|بعد عني)/g, 'انفصال فراق تعلق'],
        [/(مخنوق|مضايق|نفسيتي وحشه)/g, 'حزن ضيق'],
        [/(مرعوب|بترعب)/g, 'خوف رهاب'],
        [/(موسوس|بوسوس)/g, 'وسواس'],
        [/(بغير|غيران|غيرانه)/g, 'غيره'],
        [/(مش واثق في نفسي|شايف نفسي وحش)/g, 'ثقه بالنفس تقدير الذات'],
        [/(مش قادر انسي|مش قادره انسي)/g, 'انفصال فراق تعلق'],
        [/(بانك|بانيك)/g, 'نوبه هلع']
      ];
      aliases.forEach(([pattern, replacement]) => {
        text = text.replace(pattern, replacement);
      });
      return text;
    },

    isCrisis(value) {
      const normalized = this.normalize(value);
      return this.crisisWords.some(word => normalized.includes(this.normalize(word)));
    },

    scoreText(queryTokens, value, weight) {
      const fieldTokens = Array.isArray(value) ? value : this.tokens(value);
      let score = 0;
      let matches = 0;
      queryTokens.forEach(queryToken => {
        let matched = false;
        if (fieldTokens.includes(queryToken)) {
          score += 12 * weight;
          matched = true;
        } else {
          for (const fieldToken of fieldTokens) {
            if (
              queryToken.length > 2 &&
              fieldToken.length > 2 &&
              (fieldToken.startsWith(queryToken) || queryToken.startsWith(fieldToken))
            ) {
              score += 6 * weight;
              matched = true;
              break;
            }
          }
        }
        if (matched) matches += 1;
      });
      return { score, matches };
    },

    ensureIndex() {
      if (this.index) return this.index;
      this.index = this.data.map(entry => {
        const rawFields = [
          [entry.question, 12],
          [(entry.alternative_questions || []).join(' '), 10],
          [entry.title, 8],
          [(entry.keywords || []).join(' '), 7],
          [entry.category, 5],
          [entry.subcategory, 4],
          [(entry.tags || []).join(' '), 4],
          [entry.short_answer, 3],
          [entry.answer, 1]
        ];
        return {
          entry,
          fields: rawFields.map(([text, weight]) => [this.tokens(text), weight]),
          questions: [entry.question, ...(entry.alternative_questions || [])]
            .map(item => this.normalize(item))
        };
      });
      return this.index;
    },

    search(query, limit = this.resultLimit) {
      const normalizedQuery = this.normalize(query);
      const queryTokens = this.tokens(this.canonicalize(query));
      if (!queryTokens.length) return [];

      return this.ensureIndex()
        .map(indexed => {
          const entry = indexed.entry;
          let score = 0;
          let matchedTokens = new Set();
          indexed.fields.forEach(([fieldTokens, weight]) => {
            const field = this.scoreText(queryTokens, fieldTokens, weight);
            score += field.score;
            queryTokens.forEach(token => {
              if (fieldTokens.some(fieldToken =>
                fieldToken === token ||
                (token.length > 2 && (fieldToken.startsWith(token) || token.startsWith(fieldToken)))
              )) matchedTokens.add(token);
            });
          });
          if (indexed.questions.includes(normalizedQuery)) score += 500;
          else if (indexed.questions.some(item => item.includes(normalizedQuery) || normalizedQuery.includes(item))) score += 120;
          const coverage = matchedTokens.size / queryTokens.length;
          score *= 0.55 + (coverage * 0.9);
          if (coverage < 0.34) score *= 0.35;
          return { entry, score, coverage };
        })
        .filter(result => result.score >= 20 && result.coverage >= 0.25)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },

    categories() {
      const counts = new Map();
      this.data.forEach(entry => counts.set(entry.category, (counts.get(entry.category) || 0) + 1));
      return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ar'));
    },

    open() {
      const name = window.UserProfile?.getDisplayName?.() || 'يا صديقي';
      Modal.open(`
        <div class="ask18">
          <div class="ask18-hero">
            <div class="ask18-icon">💬</div>
            <div>
              <h2>اسأل رفيقك مايندست</h2>
              <p>إجابات نفسية وعملية من قاعدة المعرفة المرفقة</p>
            </div>
          </div>

          <div class="ask18-welcome">
            أهلًا ${Utils.escapeHTML(name)} 🤍 اكتب سؤالك بطريقتك، بالعامية أو بالفصحى.
          </div>

          <div class="ask18-search">
            <textarea id="ask18Input" class="textarea" rows="2"
              placeholder="اكتب سؤالك هنا… مثال: ليه بخاف يسيبني؟"></textarea>
            <button id="ask18Send" class="btn primary" onclick="AskAttachedV18.ask()">ابحث</button>
          </div>

          <div class="ask18-meta">
            <span>📚 ${this.data.length} إجابة</span>
            <span>🧭 ${this.categories().length} مجالًا</span>
            <span>🔒 يعمل داخل التطبيق</span>
          </div>

          <details class="ask18-categories">
            <summary>تصفح المجالات</summary>
            <div class="ask18-category-grid">
              ${this.categories().map(([category, count]) => `
                <button onclick="AskAttachedV18.openCategory('${this.escapeJs(category)}')">
                  <span>${Utils.escapeHTML(category)}</span><small>${count}</small>
                </button>
              `).join('')}
            </div>
          </details>

          <div id="ask18Results" class="ask18-results">
            ${this.suggestionCards()}
          </div>

          <div class="psy-disclaimer">
            هذا المحتوى للتثقيف والدعم العام، وليس تشخيصًا أو بديلًا عن الطبيب أو الأخصائي.
          </div>
          <button class="btn ghost block" onclick="Modal.close()">رجوع</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('ask18Input')?.addEventListener('keydown', event => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.ask();
          }
        });
      }, 0);
    },

    suggestionCards() {
      const preferred = ['القلق', 'الاكتئاب', 'التعلق القلق', 'العلاقات', 'الثقة بالنفس', 'إدارة الغضب'];
      const selected = [];
      preferred.forEach(category => {
        const entry = this.data.find(item => item.category === category);
        if (entry && !selected.includes(entry)) selected.push(entry);
      });
      this.data.forEach(entry => {
        if (selected.length < 6 && !selected.includes(entry)) selected.push(entry);
      });
      return `
        <div class="ask18-section-title">أسئلة مقترحة</div>
        <div class="ask18-suggestions">
          ${selected.slice(0, 6).map(entry => `
            <button onclick="AskAttachedV18.openEntry('${this.escapeJs(entry.id)}')">
              ${Utils.escapeHTML(entry.question)}
            </button>
          `).join('')}
        </div>
      `;
    },

    async ask(questionOverride) {
      const input = document.getElementById('ask18Input');
      const query = String(questionOverride || input?.value || '').trim();
      if (!query) {
        Toast.show('اكتب سؤالك الأول', 'info');
        input?.focus();
        return;
      }
      if (input) input.value = query;
      if (this.isCrisis(query)) {
        this.renderCrisis();
        return;
      }
      const button = document.getElementById('ask18Send');
      if (button) button.disabled = true;
      const results = this.search(query);
      this.renderResults(query, results);
      if (button) button.disabled = false;
    },

    renderResults(query, results) {
      const host = document.getElementById('ask18Results');
      if (!host) return;
      if (!results.length) {
        host.innerHTML = `
          <div class="ask18-empty">
            <div>🤔</div>
            <h3>لم أجد إجابة دقيقة داخل القاعدة المرفقة</h3>
            <p>جرّب اختصار السؤال إلى الفكرة الأساسية، مثل: «القلق»، «الخيانة»، «التعلق» أو «الغضب».</p>
          </div>
        `;
        return;
      }
      host.innerHTML = `
        <div class="ask18-section-title">أقرب إجابة لسؤالك</div>
        ${this.entryCard(results[0].entry, true)}
        ${results.length > 1 ? `
          <details class="ask18-more">
            <summary>إجابات أخرى قريبة (${results.length - 1})</summary>
            <div class="ask18-related-list">
              ${results.slice(1).map(result => `
                <button onclick="AskAttachedV18.openEntry('${this.escapeJs(result.entry.id)}')">
                  <strong>${Utils.escapeHTML(result.entry.title)}</strong>
                  <small>${Utils.escapeHTML(result.entry.question)}</small>
                </button>
              `).join('')}
            </div>
          </details>
        ` : ''}
      `;
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    entryCard(entry, expanded) {
      const riskLabels = { low: 'تثقيف عام', medium: 'يستحق الانتباه', high: 'اطلب دعمًا', crisis: 'أولوية للسلامة' };
      return `
        <article class="ask18-answer ${entry.risk_level === 'crisis' ? 'is-crisis' : ''}">
          <div class="ask18-answer-head">
            <div>
              <span class="ask18-category">${Utils.escapeHTML(entry.category)}</span>
              <h3>${Utils.escapeHTML(entry.title)}</h3>
            </div>
            <span class="ask18-risk risk-${Utils.escapeHTML(entry.risk_level)}">
              ${Utils.escapeHTML(riskLabels[entry.risk_level] || 'معلومة')}
            </span>
          </div>
          <p class="ask18-short">${Utils.escapeHTML(entry.short_answer)}</p>
          <div class="ask18-full">${this.formatText(entry.answer)}</div>

          ${(entry.practical_steps || []).length ? `
            <section class="ask18-panel practical">
              <h4>✅ خطوات عملية</h4>
              <ol>${entry.practical_steps.map(step => `<li>${Utils.escapeHTML(step)}</li>`).join('')}</ol>
            </section>
          ` : ''}

          ${(entry.common_mistakes || []).length ? `
            <details class="ask18-panel mistakes" ${expanded ? '' : 'open'}>
              <summary>⚠️ أخطاء شائعة</summary>
              <ul>${entry.common_mistakes.map(item => `<li>${Utils.escapeHTML(item)}</li>`).join('')}</ul>
            </details>
          ` : ''}

          ${entry.when_to_seek_help ? `
            <section class="ask18-panel help">
              <h4>🧑‍⚕️ متى تطلب مساعدة؟</h4>
              <p>${Utils.escapeHTML(entry.when_to_seek_help)}</p>
            </section>
          ` : ''}

          ${(entry.related_questions || []).length ? `
            <section class="ask18-follow">
              <h4>أسئلة مرتبطة</h4>
              <div>
                ${entry.related_questions.map(question => `
                  <button onclick="AskAttachedV18.askRelated('${this.escapeJs(question)}')">
                    ${Utils.escapeHTML(question)}
                  </button>
                `).join('')}
              </div>
            </section>
          ` : ''}
        </article>
      `;
    },

    openEntry(id) {
      const entry = this.data.find(item => item.id === id);
      const host = document.getElementById('ask18Results');
      if (!entry || !host) return;
      host.innerHTML = this.entryCard(entry, true);
      const input = document.getElementById('ask18Input');
      if (input) input.value = entry.question;
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    askRelated(question) {
      const input = document.getElementById('ask18Input');
      if (input) input.value = question;
      this.ask(question);
    },

    openCategory(category) {
      const entries = this.data.filter(entry => entry.category === category);
      const host = document.getElementById('ask18Results');
      if (!host) return;
      host.innerHTML = `
        <div class="ask18-section-title">${Utils.escapeHTML(category)} <span>(${entries.length})</span></div>
        <div class="ask18-related-list">
          ${entries.map(entry => `
            <button onclick="AskAttachedV18.openEntry('${this.escapeJs(entry.id)}')">
              <strong>${Utils.escapeHTML(entry.title)}</strong>
              <small>${Utils.escapeHTML(entry.question)}</small>
            </button>
          `).join('')}
        </div>
      `;
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    renderCrisis() {
      const host = document.getElementById('ask18Results');
      if (!host) return;
      host.innerHTML = `
        <div class="ask18-crisis">
          <h3>سلامتك أهم شيء الآن</h3>
          <p>لو فيه احتمال تؤذي نفسك الآن: ابعد عن أي وسيلة مؤذية، وخليك مع شخص تثق فيه، واتصل بالطوارئ المحلية فورًا.</p>
          <p>لا تبقَ وحدك في اللحظة دي. اطلب من شخص قريب أن يظل معك ويساعدك للوصول إلى رعاية عاجلة.</p>
          <button class="btn rose block" onclick="Modal.close();Nav.go('mental')">
            افتح خطة الأمان والدعم داخل التطبيق
          </button>
        </div>
      `;
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    formatText(value) {
      return Utils.escapeHTML(value || '').replace(/\n/g, '<br>');
    },

    escapeJs(value) {
      return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '')
        .replace(/\n/g, '\\n');
    }
  };

  window.AskAttachedV18 = AskAttachedV18;

  if (window.AskMindsetV16) {
    window.AskMindsetV16.open = () => AskAttachedV18.open();
  }
  if (window.App) {
    App.openAskMindset = () => AskAttachedV18.open();
  }

  const css = document.createElement('style');
  css.textContent = `
    .ask18{display:flex;flex-direction:column;gap:12px}
    .ask18-hero{display:flex;align-items:center;gap:12px;padding:16px;border-radius:20px;background:linear-gradient(135deg,#0f766e,#134e4a);color:#fff}
    .ask18-icon{width:54px;height:54px;display:grid;place-items:center;flex:none;border-radius:17px;background:rgba(255,255,255,.16);font-size:28px}
    .ask18-hero h2{font-size:20px;margin:0}.ask18-hero p{font-size:12.5px;opacity:.86;margin-top:3px}
    .ask18-welcome{padding:12px 14px;border:1px solid var(--border);border-radius:14px;background:var(--accent-soft);line-height:1.8}
    .ask18-search{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:stretch}
    .ask18-search textarea{min-height:58px}.ask18-search .btn{min-width:82px}
    .ask18-meta{display:flex;gap:7px;flex-wrap:wrap}.ask18-meta span{padding:5px 9px;border-radius:99px;background:var(--surface-2);border:1px solid var(--border);font-size:11px;color:var(--text-soft)}
    .ask18-categories,.ask18-more{border:1px solid var(--border);border-radius:14px;background:var(--surface-2);overflow:hidden}
    .ask18-categories>summary,.ask18-more>summary{cursor:pointer;padding:12px 14px;font-weight:700}
    .ask18-category-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:0 10px 12px}
    .ask18-category-grid button{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:9px;border:1px solid var(--border);border-radius:11px;background:var(--surface);text-align:right;font-size:12px}
    .ask18-category-grid small{display:grid;place-items:center;min-width:24px;height:24px;border-radius:99px;background:var(--accent-soft);color:var(--accent-deep)}
    .ask18-results{display:flex;flex-direction:column;gap:10px;scroll-margin-top:15px}
    .ask18-section-title{font-size:14px;font-weight:800;color:var(--accent-deep)}.ask18-section-title span{color:var(--text-muted)}
    .ask18-suggestions{display:grid;gap:7px}.ask18-suggestions button{padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);text-align:right;line-height:1.55}
    .ask18-answer{padding:15px;border:1px solid var(--border);border-radius:18px;background:var(--surface);box-shadow:var(--shadow-sm)}
    .ask18-answer.is-crisis{border-color:var(--rose)}
    .ask18-answer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.ask18-answer-head h3{font-size:19px;margin:5px 0 0;color:var(--text)}
    .ask18-category{font-size:11px;color:var(--accent-deep);font-weight:700}.ask18-risk{font-size:10px;padding:4px 8px;border-radius:99px;background:var(--surface-3);white-space:nowrap}
    .risk-medium{background:var(--amber-soft);color:var(--amber)}.risk-high,.risk-crisis{background:var(--rose-soft);color:var(--rose)}
    .ask18-short{margin:12px 0;padding:11px;border-right:4px solid var(--accent);border-radius:10px;background:var(--accent-soft);font-weight:700;line-height:1.8}
    .ask18-full{line-height:2;white-space:normal;color:var(--text)}
    .ask18-panel{margin-top:12px;padding:12px;border-radius:13px;border:1px solid var(--border);line-height:1.8}.ask18-panel h4,.ask18-panel summary{font-size:14px;font-weight:800;margin-bottom:7px}.ask18-panel ol,.ask18-panel ul{padding-right:21px}.ask18-panel li+li{margin-top:6px}
    .ask18-panel.practical{background:var(--green-soft)}.ask18-panel.mistakes{background:var(--amber-soft)}.ask18-panel.help{background:var(--rose-soft)}
    .ask18-follow{margin-top:14px;padding-top:12px;border-top:1px solid var(--border)}.ask18-follow h4{font-size:13px;margin-bottom:8px}.ask18-follow>div{display:grid;gap:6px}
    .ask18-follow button{padding:9px;border-radius:10px;border:1px solid var(--accent);background:transparent;color:var(--accent-deep);text-align:right;font-size:12px}
    .ask18-related-list{display:grid;gap:7px;padding:0 10px 12px}.ask18-related-list button{display:flex;flex-direction:column;gap:3px;padding:11px;border:1px solid var(--border);border-radius:11px;background:var(--surface);text-align:right}.ask18-related-list small{color:var(--text-muted)}
    .ask18-empty,.ask18-crisis{text-align:center;padding:18px;border:1px solid var(--border);border-radius:16px;background:var(--surface-2)}.ask18-empty>div{font-size:38px}.ask18-empty h3,.ask18-crisis h3{margin:5px 0}.ask18-empty p,.ask18-crisis p{font-size:13px;line-height:1.8;color:var(--text-soft)}.ask18-crisis{border-color:var(--rose);background:var(--rose-soft)}.ask18-crisis .btn{margin-top:10px}
    @media(max-width:420px){.ask18-search{grid-template-columns:1fr}.ask18-search .btn{width:100%}.ask18-category-grid{grid-template-columns:1fr}.ask18-answer-head{flex-direction:column}}
  `;
  document.head.appendChild(css);
})();
