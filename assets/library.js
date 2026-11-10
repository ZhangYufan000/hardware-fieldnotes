'use strict';

(() => {
  const topics = new Map([
    ['power', '电源设计'],
    ['analog', '模拟电路与运放'],
    ['pcb', 'PCB 设计'],
    ['signal', '高速电路与接口'],
    ['integrity', '信号完整性'],
    ['emc', 'EMC 与 ESD'],
    ['parts', '元器件'],
    ['simulation', '仿真工具'],
    ['reliability', '可靠性'],
    ['vendor', '厂商参考'],
    ['other', '其他资料']
  ]);
  const directories = new Map([
    ['AC-DC', 'power'], ['DC-DC', 'power'], ['LDO', 'power'],
    ['运算放大器和模拟电路书籍', 'analog'], ['PCB', 'pcb'],
    ['信号类', 'signal'], ['高速电路', 'signal'], ['EMC', 'emc'],
    ['元器件', 'parts'], ['ADS', 'simulation'], ['Matlab', 'simulation'],
    ['PSpipce参考书籍', 'simulation'], ['可靠性', 'reliability'], ['ADI参考书籍', 'vendor']
  ]);
  const supported = /\.(pdf|epub|mobi|azw3|djvu|chm|docx?|pptx?|txt)$/i;
  const nameOf = (path) => path.split('/').at(-1);
  const normalize = (value) => value.normalize('NFKC').toLowerCase();
  const classify = (path) => {
    const name = nameOf(path);
    const mapped = path.split('/').slice(0, -1).map((part) => directories.get(part)).find(Boolean);
    if (mapped === 'analog') {
      if (/电力电子.*仿真/i.test(name)) return 'simulation';
      if (/电力电子技术|输入输出电容/i.test(name)) return 'power';
      if (/图解高频电路/i.test(name)) return 'signal';
    }
    if (mapped) return mapped;
    if (/仿真|pspice|matlab/i.test(name)) return 'simulation';
    if (/干扰|电磁兼容|emc|esd/i.test(name)) return 'emc';
    if (/pcb|印制电路板|fpc/i.test(name)) return 'pcb';
    if (/电源|转换器|热插拔|buck|ldo/i.test(name)) return 'power';
    if (/运放|运算放大器|模拟电路/i.test(name)) return 'analog';
    if (/信号|高速|接口|射频/i.test(name)) return 'signal';
    if (/可靠性|失效/i.test(name)) return 'reliability';
    if (/元器件|电感|电容|电阻/i.test(name)) return 'parts';
    return 'other';
  };

  const list = document.querySelector('#book-list');
  const shelf = document.querySelector('#shelf');
  const query = document.querySelector('#book-query');
  const count = document.querySelector('#book-count');
  const heading = document.querySelector('#library-title');
  const empty = document.querySelector('#book-empty');
  const picker = document.querySelector('#local-folder');
  const status = document.querySelector('#folder-status');
  const restore = document.querySelector('#restore-library');
  const sourceControls = document.querySelector('#resource-sources');
  const sourceButtons = [...sourceControls.querySelectorAll('[data-source]')];
  const publicItems = Array.from(list.querySelectorAll('li'), (row) => {
    const link = row.querySelector('a');
    const code = row.dataset.code;
    return {
      title: link.textContent, topic: row.dataset.topic, href: link.href,
      type: row.dataset.format, code, source: code ? 'baidu' : 'official'
    };
  });
  const localIndex = location.protocol === 'file:' ? window.fieldnotesLocalBooks : null;
  const makeLocal = (path, bytes, file, href) => ({
    title: nameOf(path).replace(supported, ''),
    path, bytes, file, href,
    type: path.match(supported)[1].toUpperCase(),
    topic: classify(path)
  });
  const localItems = localIndex ? localIndex.items.map(({ path, bytes }) =>
    makeLocal(path, bytes, null, localIndex.base + path.split('/').map(encodeURIComponent).join('/'))) : [];
  const sources = { public: publicItems, local: localItems, selected: [] };
  let mode = 'public';
  let topic = 'all';
  let source = 'all';
  let objectUrls = new WeakMap();

  const sourceItems = () => sources[mode].filter((book) => source === 'all' || book.source === source);

  function renderBooks() {
    const terms = normalize(query.value).trim().split(/\s+/).filter(Boolean);
    const visible = sourceItems().filter((book) =>
      (topic === 'all' || book.topic === topic) && terms.every((term) =>
        normalize([book.title, book.type, topics.get(book.topic), book.path, book.code,
          book.source === 'baidu' ? '百度网盘' : ''].join(' ')).includes(term)));
    count.textContent = `${visible.length} 份资料`;
    empty.hidden = visible.length !== 0;
    const rows = document.createDocumentFragment();
    for (const book of visible) {
      const row = document.createElement('li');
      const badge = document.createElement('span');
      badge.className = 'book-type';
      badge.textContent = book.type;
      const detail = document.createElement('div');
      const title = document.createElement('p');
      title.className = 'book-name';
      title.textContent = book.title;
      const meta = document.createElement('p');
      meta.className = 'book-meta';
      meta.textContent = [topics.get(book.topic), book.code ? `百度网盘 · 提取码 ${book.code}` :
        book.source === 'official' ? '官方资料' :
        book.bytes >= 1024 * 1024 ? `${(book.bytes / (1024 * 1024)).toFixed(1)} MiB` :
          `${Math.max(1, Math.round(book.bytes / 1024))} KiB`].join(' · ');
      detail.append(title, meta);
      const link = document.createElement('a');
      link.className = 'book-open';
      link.href = book.href || '#book-list';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const action = book.source === 'baidu' ? '打开网盘' : book.type === 'PDF' ? '打开 PDF' :
        book.type === '下载页' ? '去官网下载' : book.source === 'official' ? '访问官网' : '打开';
      link.textContent = `${action} ↗`;
      link.setAttribute('aria-label', `${action}：${book.title}`);
      if (book.file) {
        link.addEventListener('click', () => {
          if (!objectUrls.has(book.file)) objectUrls.set(book.file, URL.createObjectURL(book.file));
          link.href = objectUrls.get(book.file);
          if (book.type !== 'PDF') link.download = book.file.name;
        });
      }
      row.append(badge, detail, link);
      rows.append(row);
    }
    list.replaceChildren(rows);
  }

  function setTopic(next) {
    topic = next;
    for (const button of shelf.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.topic === topic));
    }
    renderBooks();
  }

  function renderTopics() {
    const books = sourceItems();
    const totals = new Map([['all', books.length]]);
    for (const book of books) totals.set(book.topic, (totals.get(book.topic) || 0) + 1);
    shelf.replaceChildren();
    for (const [key, label] of [['all', '全部主题'], ...topics]) {
      if (!totals.has(key)) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.topic = key;
      const name = document.createElement('span');
      name.textContent = label;
      const total = document.createElement('span');
      total.textContent = totals.get(key);
      button.append(name, total);
      button.addEventListener('click', () => setTopic(key));
      shelf.append(button);
    }
    setTopic(totals.has(topic) ? topic : 'all');
    return totals.size - 1;
  }

  function setSource(nextSource) {
    source = nextSource;
    for (const button of sourceButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.source === source));
    }
    return renderTopics();
  }

  function show(nextMode) {
    mode = nextMode;
    query.value = '';
    topic = 'all';
    sourceControls.hidden = mode !== 'public';
    const topicCount = setSource('all');
    heading.textContent = mode === 'public' ? '公开资料' : '本机参考书';
    restore.hidden = mode === 'public' && !localItems.length;
    restore.textContent = mode === 'public' ? '查看已整理参考书' : '查看公开资料';
    status.textContent = mode === 'public' ? '按主题和来源查找资料' :
      `已整理 ${sources[mode].length} 份资料 · ${topicCount} 个主题`;
  }

  document.querySelector('#local-access').hidden = false;
  document.querySelector('#library-tools').hidden = false;
  shelf.hidden = false;
  if (localItems.length) {
    document.querySelector('#local-access-note').textContent = '参考书已按主题整理。可以直接打开原件，也可以选择另一份书籍目录。';
  }
  document.querySelector('#choose-folder').addEventListener('click', () => picker.click());
  picker.addEventListener('change', () => {
    if (!picker.files.length) return;
    const files = Array.from(picker.files).filter((file) => supported.test(file.name) && !file.name.startsWith('~$'));
    if (!files.length) {
      status.textContent = '这个目录没有识别到支持的书籍格式。请另选一个文件夹。';
      picker.value = '';
      return;
    }
    for (const book of sources.selected) {
      const url = objectUrls.get(book.file);
      if (url) URL.revokeObjectURL(url);
    }
    objectUrls = new WeakMap();
    sources.selected = files.map((file) => makeLocal(file.webkitRelativePath || file.name, file.size, file))
      .sort((a, b) => a.path.localeCompare(b.path, 'zh-CN', { numeric: true }));
    show('selected');
    picker.value = '';
  });
  restore.addEventListener('click', () => show(mode === 'public' ? 'local' : 'public'));
  for (const button of sourceButtons) {
    button.addEventListener('click', () => setSource(button.dataset.source));
  }
  query.addEventListener('input', renderBooks);
  document.querySelector('#book-search').addEventListener('submit', (event) => event.preventDefault());
  document.querySelector('#reset-books').addEventListener('click', () => {
    query.value = '';
    topic = 'all';
    setSource('all');
    query.focus();
  });
  show(localItems.length ? 'local' : 'public');
})();
