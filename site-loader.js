/**
 * Supabase Content Loader
 * يجلب المحتوى المنشور ويستبدل الأقسام المقابلة له.
 * عند فشل الاتصال، يحتفظ الموقع بمحتواه الثابت.
 */

(function () {
  'use strict';

  const config = window.SB;

  // التحقق من إعدادات الاتصال
  if (!config?.url || !config?.key) {
    console.info('Supabase غير مهيأ؛ سيتم استخدام المحتوى الثابت.');
    return;
  }

  // تحديد الأقسام القابلة للتحديث
  function getSections() {
    const sections = {};
    const doc = document;

    const selectors = {
      hero: '.hero-wrap',
      stats: '.stats-row',
      contact: '#contact',
      footer: 'footer'
    };

    Object.entries(selectors).forEach(([id, selector]) => {
      const element = doc.querySelector(selector);
      if (element) sections[id] = element;
    });

    doc.querySelectorAll('.main > .card').forEach((element, index) => {
      sections[`card-${index}`] = element;
    });

    return sections;
  }

  // تحميل المحتوى من Supabase
  async function loadContent() {
    try {
      const response = await fetch(
        `${config.url}/rest/v1/site_content?select=id,html`,
        {
          method: 'GET',
          headers: {
            apikey: config.key,
            Authorization: `Bearer ${config.key}`,
            Accept: 'application/json'
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error(`Supabase HTTP ${response.status}`);
      }

      const rows = await response.json();
      const sections = getSections();

      // تطبيق المحتوى المنشور
      rows.forEach(({ id, html }) => {
        const element = sections[id];

        if (element && typeof html === 'string' && html.trim()) {
          element.innerHTML = html;
        }
      });

      console.info('تم تحميل محتوى الموقع بنجاح.');

    } catch (error) {
      console.warn(
        'تعذّر تحميل المحتوى المنشور؛ سيستمر الموقع بالمحتوى الثابت.',
        error
      );
    }
  }

  // إتاحة وعد التحميل لبقية سكربتات الموقع عند الحاجة
  window.siteContentReady = loadContent();

})();
