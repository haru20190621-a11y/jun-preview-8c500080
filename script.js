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
