(function () {
  'use strict';

  /* ---- モバイルのメニュー開閉 ---- */
  var burger = document.querySelector('.burger');
  var drawer = document.getElementById('drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
      drawer.hidden = open;
      document.body.classList.toggle('no-scroll', !open);
    });
  }

  /* ---- スクロール出現（scroll直接判定＋setInterval保険＋5秒フェイルセーフ） ---- */
  var els = document.querySelectorAll('.reveal');
  var scrolled = false;
  function showAll() {
    Array.prototype.forEach.call(els, function (el) { el.classList.add('on'); });
  }
  function check() {
    var vh = window.innerHeight;
    Array.prototype.forEach.call(els, function (el) {
      if (!el.classList.contains('on') && el.getBoundingClientRect().top < vh * 0.88) {
        el.classList.add('on');
      }
    });
  }
  window.addEventListener('scroll', function () { scrolled = true; check(); }, { passive: true });
  window.addEventListener('load', check);
  var timer = setInterval(function () {
    check();
    if (!document.querySelector('.reveal:not(.on)')) { clearInterval(timer); }
  }, 700);
  // 埋め込みビューア等でscrollイベントが一度も来ない環境では、演出をあきらめて全部表示する
  setTimeout(function () {
    if (!scrolled && window.scrollY === 0) { showAll(); }
  }, 5000);
  check();
  // 撮影・確認用: ?review=1 を付けて開くと演出なしで全部表示する
  if (/[?&]review=1\b/.test(window.location.search)) {
    showAll();
    Array.prototype.forEach.call(document.querySelectorAll('img[loading="lazy"]'), function (img) { img.loading = 'eager'; });
  }

  /* ---- 横スワイプの写真: 矢印ボタンで1枚ずつ送る（スマホは指でスワイプ） ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-slider]'), function (slider) {
    var track = slider.querySelector('.slider__track');
    var btns = slider.querySelectorAll('.slider__btn');
    var items = track.querySelectorAll('.slider__item');
    // 各写真の左端に合わせたときの scrollLeft（1枚目＝0）
    function stops() {
      var max = track.scrollWidth - track.clientWidth;
      var base = items[0].offsetLeft;
      return Array.prototype.map.call(items, function (it) {
        return Math.min(it.offsetLeft - base, max);
      });
    }
    function update() {
      var s = stops();
      btns[0].disabled = track.scrollLeft <= 2;
      btns[1].disabled = track.scrollLeft >= s[s.length - 1] - 2;
    }
    function go(dir) {
      var s = stops();
      var x = track.scrollLeft;
      var target = null;
      s.forEach(function (left) {
        if (dir > 0 && left > x + 4 && target === null) { target = left; }
        if (dir < 0 && left < x - 4) { target = left; }
      });
      if (target === null) { return; }
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
      // なめらかなスクロールが効かない環境では、その場で送る
      setTimeout(function () {
        if (Math.abs(track.scrollLeft - x) < 2) { track.scrollLeft = target; }
        update();
      }, 600);
    }
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () { go(Number(b.getAttribute('data-dir'))); });
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
  });

  /* ---- 予約フォーム: 入力内容をメール本文にしてメールソフトを開く ---- */
  var form = document.getElementById('rform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var lines = [];
      fd.forEach(function (v, k) { lines.push(k + '：' + v); });
      var name = fd.get('お名前') || '';
      var subject = '【ご予約希望】' + name;
      window.location.href = 'mailto:' + form.getAttribute('data-mail') +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }
})();
