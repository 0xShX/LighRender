class Live2DRenderEngine {
  constructor(options = {}) {
    this.options = {
      scale: 1,
      modelX: 0.5,
      modelY: 0.5,
      draggable: false,
      clickable: false,
      audible: false,
      ...options,
    };
    PIXI?.live2d?.config && (PIXI.live2d.config.sound = this.options.audible);
    this.container = document.getElementById('live2d-widget-container');
    this.canvas = document.getElementById('live2d-widget-canvas');
    this.app = null;
  }

  async load(modelUrl) {
    this.cleanup();

    const [json] = await Promise.all([
      fetch(modelUrl).then(r => r.json()),
      (() => {
        if (this.app) return Promise.resolve();
        this.app = new PIXI.Application({
          view: this.canvas,
          width: this.container.clientWidth,
          height: this.container.clientHeight,
          backgroundAlpha: 0,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
      })(),
    ]);

    const motions = json.FileReferences?.Motions ?? json.motions ?? {};
    const Model = PIXI.live2d?.Live2DModel || Live2DModel;
    const model = await Model.from(modelUrl);

    model.anchor.set(0.5);
    const scale = (() => {
      const b = model.getLocalBounds();
      return Math.min(
        this.container.clientWidth / b.width,
        this.container.clientHeight / b.height
      ) * 0.95;
    })() * this.options.scale;
    model.scale.set(scale);
    model.x = this.container.clientWidth * this.options.modelX;
    model.y = this.container.clientHeight * this.options.modelY;

    this.app.stage.addChild(model);
    model.internalModel?.audioManager &&
      (model.internalModel.audioManager.volume = this.options.audible ? 1 : 0);

    (() => {
      const { draggable, clickable } = this.options;
      if (!draggable && !clickable) return;

      Object.assign(model, { eventMode: 'static', cursor: 'pointer' });

      let dragData = null;

      if (draggable) {
        model.on('pointerdown', e => {
          const { x, y } = e.data.global;
          dragData = { sx: model.x, sy: model.y, gx: x, gy: y };
        });
        model.on('pointermove', e => {
          if (!dragData) return;
          const { x, y } = e.data.global;
          model.x = dragData.sx + (x - dragData.gx);
          model.y = dragData.sy + (y - dragData.gy);
        });
        ['pointerup', 'pointerupoutside'].forEach(ev =>
          model.on(ev, () => (dragData = null))
        );
      }

      if (clickable) {
        model.on('hit', areas => {
          if (dragData) return;
          const list = motions[areas[0]];
          if (list?.length) {
            model.motion(areas[0], Math.floor(Math.random() * list.length));
          }
        });
      }
    })();

    const focusCtrl =
      model.internalModel?.root?.__focusController ||
      model.internalModel?.focusController;

    if (focusCtrl) {
      const hw = this.canvas.width / 2;
      const hh = this.canvas.height / 2;

      const pointerMove = e => {
        const p = e.touches?.[0] || e;
        if (p.clientX == null) return;

        const r = this.canvas.getBoundingClientRect();
        const px = Math.max(-1, Math.min(1, (p.clientX - r.left - hw) / hw));
        const py = Math.max(-1, Math.min(1, -(p.clientY - r.top - hh) / hh));
        focusCtrl.focus(px, py);
      };

      document.addEventListener('mousemove', pointerMove);
      document.addEventListener('touchmove', pointerMove);

      this._pointerMoveHandler = pointerMove;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!model) return;

      const { clientWidth: w, clientHeight: h } = this.container;
      this.app.renderer.resize(w, h);

      const s = (() => {
        const b = model.getLocalBounds();
        return Math.min(w / b.width, h / b.height) * 0.95;
      })() * this.options.scale;
      model.scale.set(s);
      model.x = w * this.options.modelX;
      model.y = h * this.options.modelY;
    });

    resizeObserver.observe(this.container);
    this._resizeObserver = resizeObserver;

    this._model = model;
    return model;
  }

  cleanup() {
    if (this._model) {
      this.app?.stage.removeChild(this._model);
      this._model.destroy({ children: true, texture: true });
    }

    PIXI.utils.clearTextureCache();

    this._resizeObserver?.disconnect();
    if (this._pointerMoveHandler) {
      document.removeEventListener('mousemove', this._pointerMoveHandler);
      document.removeEventListener('touchmove', this._pointerMoveHandler);
    }

    this._model = null;
    this._resizeObserver = null;
    this._pointerMoveHandler = null;
  }

  destroy() {
    this.cleanup();
    this.app?.destroy(true, { children: true, texture: true });
    this.app = null;
  }
}

globalThis.Live2DRenderEngine = Live2DRenderEngine;