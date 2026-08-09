class Live2DWidget {
  constructor(containerId, engine) {
    this.container = document.getElementById(containerId);
    this.engine = engine;
    this.state = { group: '', name: '' };
    this.MODELS = {
      '罗小黑': { 'default': '../assets/xiaohei/model0.model3.json' },
      '哔哩哔哩 22娘': {
        'default': '../assets/bilibili-22/model.default.json',
        '2018.bls-winter': '../assets/bilibili-22/model.2018.bls-winter.json',
        '2018.bls-summer': '../assets/bilibili-22/model.2018.bls-summer.json',
        '2018.spring': '../assets/bilibili-22/model.2018.spring.json',
        '2018.lover': '../assets/bilibili-22/model.2018.lover.json',
        '2017.cba-normal': '../assets/bilibili-22/model.2017.cba-normal.json',
        '2017.cba-super': '../assets/bilibili-22/model.2017.cba-super.json',
        '2017.valley': '../assets/bilibili-22/model.2017.valley.json',
        '2017.vdays': '../assets/bilibili-22/model.2017.vdays.json',
        '2017.tomo-bukatsu.low': '../assets/bilibili-22/model.2017.tomo-bukatsu.low.json',
        '2017.tomo-bukatsu.high': '../assets/bilibili-22/model.2017.tomo-bukatsu.high.json',
        '2017.summer.normal.1': '../assets/bilibili-22/model.2017.summer.normal.1.json',
        '2017.summer.normal.2': '../assets/bilibili-22/model.2017.summer.normal.2.json',
        '2017.summer.super.1': '../assets/bilibili-22/model.2017.summer.super.1.json',
        '2017.summer.super.2': '../assets/bilibili-22/model.2017.summer.super.2.json',
        '2017.school': '../assets/bilibili-22/model.2017.school.json',
        '2017.newyear': '../assets/bilibili-22/model.2017.newyear.json',
        '2016.xmas.1': '../assets/bilibili-22/model.2016.xmas.1.json',
        '2016.xmas.2': '../assets/bilibili-22/model.2016.xmas.2.json'
      },
      '哔哩哔哩 33娘': {
        'default': '../assets/bilibili-33/model.default.json',
        '2018.bls-winter': '../assets/bilibili-33/model.2018.bls-winter.json',
        '2018.bls-summer': '../assets/bilibili-33/model.2018.bls-summer.json',
        '2018.spring': '../assets/bilibili-33/model.2018.spring.json',
        '2018.lover': '../assets/bilibili-33/model.2018.lover.json',
        '2017.cba-normal': '../assets/bilibili-33/model.2017.cba-normal.json',
        '2017.cba-super': '../assets/bilibili-33/model.2017.cba-super.json',
        '2017.valley': '../assets/bilibili-33/model.2017.valley.json',
        '2017.vdays': '../assets/bilibili-33/model.2017.vdays.json',
        '2017.tomo-bukatsu.low': '../assets/bilibili-33/model.2017.tomo-bukatsu.low.json',
        '2017.tomo-bukatsu.high': '../assets/bilibili-33/model.2017.tomo-bukatsu.high.json',
        '2017.summer.normal.1': '../assets/bilibili-33/model.2017.summer.normal.1.json',
        '2017.summer.super.1': '../assets/bilibili-33/model.2017.summer.super.1.json',
        '2017.summer.super.2': '../assets/bilibili-33/model.2017.summer.super.2.json',
        '2017.school': '../assets/bilibili-33/model.2017.school.json',
        '2017.newyear': '../assets/bilibili-33/model.2017.newyear.json',
        '2016.xmas.1': '../assets/bilibili-33/model.2016.xmas.1.json',
        '2016.xmas.2': '../assets/bilibili-33/model.2016.xmas.2.json'
      }
    };
    this.init();
  }

  init() {
    this.render();
    this.bind();
    this.setup();
  }

  render() {
    this.container.innerHTML = Object.entries(this.MODELS).map(([g, ms]) => `
      <div class="list-col">
        <div class="group-title">${g}</div>
        <div class="btn-col">
          ${Object.keys(ms).map(n => `
            <span class="btn${this.active(g,n)}" data-group="${g}" data-name="${n}" title="${n}">${n}</span>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  bind() {
    this.container.addEventListener('click', e => {
      const b = e.target.closest('.btn');
      b && this.select(b.dataset.group, b.dataset.name);
    });
  }

  setup(){
    const g = Object.keys(this.MODELS)[0];
    this.select(g, Object.keys(this.MODELS[g])[0]);
  }

  async select(g, n) {
    const u = this.MODELS[g]?.[n];
    if (!u) return;
    try {
      await this.engine.load(u);
      this.state = { group: g, name: n };
      this.sync();
    } catch (e) {
      console.error('[Live2D] 模型加载失败:', e);
    }
  }

  active(g, n) {
    return this.state.group === g && this.state.name === n ? ' active' : '';
  }

  sync() {
    this.container.querySelectorAll('.btn').forEach(b =>
      b.classList.toggle('active', this.active(b.dataset.group, b.dataset.name))
    );
  }
}

globalThis.Live2DWidget = Live2DWidget;