/* Conector do Power-Up: registra o botão no cartão, os badges e o botão do dashboard. */
(function () {
  var abs = function (p) { return new URL(p, window.location.href).href; };
  var ICON = abs('./icon.svg');
  var ICON_WHITE = abs('./icon-white.svg');

  function loadCard(t) {
    return Promise.all([
      t.get('card', 'shared', TH.KEY),
      t.get('card', 'private', 'timer')
    ]).then(function (r) { return { data: r[0], timer: r[1] }; });
  }

  function openLog(t) {
    return t.popup({ title: 'Registrar horas', url: './log.html', height: 460 });
  }

  window.TrelloPowerUp.initialize({
    'card-buttons': function () {
      return [{ icon: ICON, text: 'Horas', callback: openLog }];
    },

    'card-badges': function (t) {
      return loadCard(t).then(function (s) {
        var total = TH.totalOf(s.data);
        var badges = [];
        if (s.timer) badges.push({ text: 'Timer ativo', color: 'red' });
        if (total > 0) badges.push({ icon: ICON, text: TH.fmt(total) });
        return badges;
      });
    },

    'card-detail-badges': function (t) {
      return loadCard(t).then(function (s) {
        var total = TH.totalOf(s.data);
        return [{
          title: 'Horas',
          text: total > 0 ? TH.fmt(total) + (s.timer ? ' (timer ativo)' : '') : 'Registrar',
          color: s.timer ? 'red' : null,
          callback: openLog
        }];
      });
    },

    'board-buttons': function () {
      return [{
        icon: { dark: ICON_WHITE, light: ICON },
        text: 'Dashboard de horas',
        callback: function (t) {
          return t.modal({ url: './dashboard.html', fullscreen: true, title: 'Dashboard de horas' });
        }
      }];
    }
  }, {
    appKey: window.TH_CONFIG.appKey,
    appName: window.TH_CONFIG.appName
  });
})();
