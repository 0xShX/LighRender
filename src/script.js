(function () {
  let engine, widget;

  const wait = () => new Promise(r => {
    const ok = () => document.getElementById('live2d-widget-container') && document.getElementById('live2d-widget-canvas');
    ok() ? r() : requestAnimationFrame(() => wait().then(r));
  });

  wait().then(() => {
    engine = new Live2DRenderEngine({
      scale: 0.5,
      modelX: 0.5,
      modelY: 0.5,
      draggable: true,
      clickable: true,
      audible: false,
    });
    widget = new Live2DWidget('menu-container', engine);
  });

  window.addEventListener('beforeunload', () => engine?.destroy());
})();