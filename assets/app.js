/* 蓝海加速 — 轻量化原生交互脚本（零依赖，严格控制在 150 行内） */
(function () {
  'use strict';

  /* 1. 移动端导航切换 */
  var menuBtn = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* 2. 交互式全球航线切换器（声呐脉冲 + 弧线更新 + 平滑数字滚动） */
  var routes = {
    hk: { name: '中国香港专线', lat: 18, bw: 960, loss: '0.0%', x: 268, y: 158, arc: 'M 238 142 Q 256 120 268 158' },
    jp: { name: '东京海缆骨干', lat: 36, bw: 920, loss: '0.0%', x: 334, y: 112, arc: 'M 238 142 Q 290 88 334 112' },
    sg: { name: '新加坡南海专线', lat: 48, bw: 880, loss: '0.1%', x: 256, y: 204, arc: 'M 238 142 Q 218 178 256 204' },
    us: { name: '洛杉矶跨太平洋', lat: 132, bw: 760, loss: '0.1%', x: 432, y: 126, arc: 'M 238 142 Q 340 42 432 126' },
    de: { name: '法兰克福欧亚环线', lat: 158, bw: 710, loss: '0.2%', x: 96, y: 92, arc: 'M 238 142 Q 168 58 96 92' }
  };

  function rollNumber(el, target, suffix) {
    if (!el) return;
    var start = parseInt(el.getAttribute('data-val') || '0', 10);
    var startTime = performance.now();
    var duration = 380;
    function tick(now) {
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.setAttribute('data-val', String(target));
      }
    }
    requestAnimationFrame(tick);
  }

  var nodeButtons = document.querySelectorAll('.node-btn[data-node]');
  var arcMain = document.getElementById('sonarArc');
  var arcGlow = document.getElementById('sonarArcGlow');
  var targetDot = document.getElementById('targetDot');
  var ripple = document.getElementById('sonarRipple');
  var latEl = document.getElementById('telemetryLat');
  var bwEl = document.getElementById('telemetryBw');
  var lossEl = document.getElementById('telemetryLoss');
  var routeTitle = document.getElementById('routeName');

  nodeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-node');
      var cfg = routes[key];
      if (!cfg) return;
      nodeButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (arcMain) arcMain.setAttribute('d', cfg.arc);
      if (arcGlow) arcGlow.setAttribute('d', cfg.arc);
      if (targetDot) {
        targetDot.setAttribute('cx', cfg.x);
        targetDot.setAttribute('cy', cfg.y);
      }
      if (ripple) {
        ripple.setAttribute('cx', cfg.x);
        ripple.setAttribute('cy', cfg.y);
        ripple.classList.remove('active');
        void ripple.getBoundingClientRect();
        ripple.classList.add('active');
      }
      if (routeTitle) routeTitle.textContent = cfg.name;
      rollNumber(latEl, cfg.lat, ' 毫秒');
      rollNumber(bwEl, cfg.bw, ' 兆');
      if (lossEl) lossEl.textContent = cfg.loss;
    });
  });

  /* 3. 交互式计费周期切换器（月付 / 季付 / 年付） */
  var billingBtns = document.querySelectorAll('.billing-btn[data-cycle]');
  var slider = document.getElementById('billingSlider');
  var priceCards = document.querySelectorAll('.price-card[data-plan]');

  var pricingData = {
    monthly: {
      unit: '/ 月',
      pro: { now: '20', orig: '25', save: '新人 8 折', note: '原价 25 元，新人注册 8 折仅需 20 元' },
      plus: { now: '38', orig: '48', save: '新人 8 折', note: '原价 48 元，新人注册 8 折实付 38 元' },
      ultra: { now: '70', orig: '88', save: '新人 8 折', note: '原价 88 元，新人注册 8 折实付 70 元' }
    },
    quarterly: {
      unit: '/ 季',
      pro: { now: '68', orig: '75', save: '立省 7 元', note: '折合每月 22.6 元，主力畅享专线' },
      plus: { now: '128', orig: '144', save: '立省 16 元', note: '折合每月 42.6 元，高频办公无忧' },
      ultra: { now: '238', orig: '264', save: '立省 26 元', note: '折合每月 79.3 元，团队多端共享' }
    },
    yearly: {
      unit: '/ 年',
      pro: { now: '240', orig: '300', save: '立省 60 元', note: '折合每月 20 元，全年锁定 8 折特惠' },
      plus: { now: '460', orig: '576', save: '立省 116 元', note: '折合每月 38.3 元，进阶年付优选' },
      ultra: { now: '840', orig: '1056', save: '立省 216 元', note: '折合每月 70 元，尊享独享级带宽' }
    }
  };

  billingBtns.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      var cycle = btn.getAttribute('data-cycle');
      var cfg = pricingData[cycle];
      if (!cfg) return;
      billingBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (slider) slider.style.transform = 'translateX(' + (idx * 100) + '%)';
      priceCards.forEach(function (card) {
        var plan = card.getAttribute('data-plan');
        var item = cfg[plan];
        if (!item) return;
        card.querySelector('.price-now').textContent = '¥' + item.now;
        card.querySelector('.price-unit').textContent = cfg.unit;
        card.querySelector('.price-orig').textContent = '原价 ¥' + item.orig;
        card.querySelector('.save-badge').textContent = item.save;
        card.querySelector('.price-note').textContent = item.note;
      });
    });
  });

  /* 4. 桌面端克制鼠标跟随边缘微光 */
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.glow-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }
})();
