# 硬件手记

面向做板子、调板子和学习硬件的读者。首发有六篇笔记，覆盖纹波测量、去耦、PCB 回流、I²C、首次上电和 UART。内容以原创入门笔记为主，涉及规范和厂商方法的文章附原始资料链接。

## 本地预览

直接打开 `index.html`。也可以在本目录启动静态服务器，再访问 `http://127.0.0.1:8000/`。

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

首页按 `/` 聚焦搜索。分类和关键词可以一起使用。夜间模式与上电清单进度保存在当前浏览器，换浏览器或更换发布域名后会重新开始。

## 资源库

主导航的「资源库」提供公开资料链接。点「选择本地书籍文件夹」可按书名搜索并分类浏览选中的参考书。PDF 可在浏览器打开，其他支持的格式可以下载副本。选择目录后，文件由浏览器在当前设备读取，刷新页面需重新选择。

已整理的本机书库放在网站目录旁的 `hardware-fieldnotes-local-library`，在本机直接打开其中的 `index.html` 可以浏览和打开原件。它依赖原书籍目录和本站的样式文件。

公开站发布包仅包含网站代码、原创文章和公开资料链接。若添加可公开分发的书籍，可在资源库中加入出版社或作者提供的链接；书籍原件适合存放在有相应容量和访问设置的文件服务上。

## 发布到 GitHub Pages

1. 创建一个用于这个网站的 GitHub 仓库。使用 GitHub Free 时，选择公开仓库。普通仓库可以取名 `hardware-fieldnotes`。
2. 将**本目录内的文件**放在目标仓库的根目录，保留 `assets/`、`notes/` 和 `.nojekyll`。仓库第一层应能看到 `index.html`。如果通过 GitHub 网页上传，漏掉隐藏的 `.nojekyll` 时，可以在仓库根目录创建同名空文件。
3. 提交到 `main`。进入仓库 **Settings → Pages**，选择 **Deploy from a branch → main → /(root) → Save**。
4. 部署完成后，在 Pages 设置页点 **Visit site**。普通仓库的地址形如 `https://你的用户名.github.io/hardware-fieldnotes/`。

网站使用相对路径，适用于用户主页和项目子路径。部署只需静态文件。步骤可对照 [GitHub Pages 发布源文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 更新内容

在 `notes/` 复制一篇文章作为起点，更新标题、正文、目录锚点和参考资料。再在 `index.html` 的 `note-list` 添加一张卡片，选择已有的 `data-topic`，并用 `data-keywords` 补上常用叫法。列表与搜索由卡片读取内容。

`assets/site.css` 管页面样式，`assets/site.js` 管搜索、主题和清单。`assets/workbench.webp` 是本次用内置 imagegen 创作的工作台插画，画面中的波形为插画元素。
