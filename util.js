/* Funções compartilhadas entre o conector, o popup do cartão e o dashboard.
 *
 * Formato salvo em cada cartão (t.set('card','shared','tl', data)):
 *   { u: { "<idMembro>": { "260919": 90, "260918": 45, "m2606": 600 } } }
 *   - chave "yymmdd" = minutos lançados naquele dia
 *   - chave "mYYMM"  = resumo mensal (dias antigos são compactados para caber no limite de 4096 caracteres do Trello)
 */
(function (root) {
  var KEY = 'tl';
  var LIMIT = 3900; // margem de segurança sob os 4096 caracteres do Trello

  function pad(n) { return String(n).padStart(2, '0'); }

  function dayKey(d) {
    return pad(d.getFullYear() % 100) + pad(d.getMonth() + 1) + pad(d.getDate());
  }

  function keyToDate(k) {
    if (k[0] === 'm') return new Date(2000 + Number(k.slice(1, 3)), Number(k.slice(3, 5)) - 1, 1);
    return new Date(2000 + Number(k.slice(0, 2)), Number(k.slice(2, 4)) - 1, Number(k.slice(4, 6)));
  }

  function dateToInput(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function inputToDate(s) {
    var p = s.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  // Semana começa na segunda-feira
  function weekStart(d) {
    var x = startOfDay(d);
    var dow = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - dow);
    return x;
  }

  function monthStart(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }

  /* "1h30", "1:30", "90m", "45min", "1,5h", "1.5", "2" (número puro = horas) -> minutos (ou null) */
  function parseDuration(str) {
    if (!str) return null;
    var s = String(str).trim().toLowerCase().replace(',', '.');
    var m;
    if ((m = s.match(/^(\d+):(\d{1,2})$/))) return Number(m[1]) * 60 + Number(m[2]);
    if ((m = s.match(/^(\d+(?:\.\d+)?)\s*h(?:oras?)?\s*(?:e\s*)?(?:(\d+)\s*(?:m|min|minutos?)?)?$/))) {
      return Math.round(Number(m[1]) * 60 + (m[2] ? Number(m[2]) : 0));
    }
    if ((m = s.match(/^(\d+)\s*(?:m|min|minutos?)$/))) return Number(m[1]);
    if ((m = s.match(/^\d+(?:\.\d+)?$/))) return Math.round(Number(s) * 60);
    return null;
  }

  function fmt(min) {
    min = Math.round(min || 0);
    if (min <= 0) return '0min';
    var h = Math.floor(min / 60), m = min % 60;
    if (h === 0) return m + 'min';
    return h + 'h' + (m ? pad(m) : '');
  }

  function fmtDec(min) { return (Math.round(((min || 0) / 60) * 100) / 100).toString().replace('.', ',') + ' h'; }

  function totalOf(data) {
    var t = 0;
    if (!data || !data.u) return 0;
    Object.keys(data.u).forEach(function (mid) {
      Object.keys(data.u[mid]).forEach(function (k) { t += data.u[mid][k]; });
    });
    return t;
  }

  function rollup(data, days) {
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    Object.keys(data.u).forEach(function (mid) {
      var mine = data.u[mid];
      Object.keys(mine).forEach(function (k) {
        if (k[0] === 'm') return;
        var d = keyToDate(k);
        if (d < cutoff) {
          var mk = 'm' + k.slice(0, 4);
          mine[mk] = (mine[mk] || 0) + mine[k];
          delete mine[k];
        }
      });
    });
  }

  /* Garante que cabe no limite: compacta dias com mais de 90 dias, depois 30, depois 0 */
  function compact(data) {
    var steps = [90, 30, 0];
    for (var i = 0; i < steps.length && JSON.stringify(data).length > LIMIT; i++) rollup(data, steps[i]);
    if (JSON.stringify(data).length > 4090) {
      throw new Error('Este cartão atingiu o limite de armazenamento do Trello (muitos membros/lançamentos).');
    }
    return data;
  }

  function addEntry(data, memberId, key, minutes) {
    data = data && data.u ? data : { u: {} };
    data.u[memberId] = data.u[memberId] || {};
    data.u[memberId][key] = (data.u[memberId][key] || 0) + minutes;
    return compact(data);
  }

  function removeEntry(data, memberId, key) {
    if (data && data.u && data.u[memberId]) {
      delete data.u[memberId][key];
      if (!Object.keys(data.u[memberId]).length) delete data.u[memberId];
    }
    return data;
  }

  /* Achata os dados de um cartão em registros { member, key, date, min, monthly } */
  function flatten(data) {
    var out = [];
    if (!data || !data.u) return out;
    Object.keys(data.u).forEach(function (mid) {
      Object.keys(data.u[mid]).forEach(function (k) {
        out.push({ member: mid, key: k, date: keyToDate(k), min: data.u[mid][k], monthly: k[0] === 'm' });
      });
    });
    return out;
  }

  root.TH = {
    KEY: KEY, dayKey: dayKey, keyToDate: keyToDate, dateToInput: dateToInput, inputToDate: inputToDate,
    startOfDay: startOfDay, weekStart: weekStart, monthStart: monthStart, parseDuration: parseDuration,
    fmt: fmt, fmtDec: fmtDec, totalOf: totalOf, addEntry: addEntry, removeEntry: removeEntry,
    compact: compact, flatten: flatten, pad: pad
  };
  if (typeof module !== 'undefined') module.exports = root.TH;
})(typeof window !== 'undefined' ? window : globalThis);
