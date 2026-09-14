# 给 fxy 的生日影像

一个以电影、星河与像素游戏回忆为视觉语言的生日页面。

线上地址：<https://xiaoleiwang-study.github.io/fxy-birthday/>

## 本地开发

```bash
cd app-source
npm install
npm run dev
```

更新根目录的 GitHub Pages 文件：

```bash
npm run publish:local
```

## 手机粒子版

保留原照片、音乐和七年故事，新增点击式粒子蛋糕、星光爱心、回放与可关闭信件。手机不需要摄像头或麦克风权限，缺少必要渲染能力时保留原蛋糕。

```sh
cd app-source
npm ci
npm test
npm run dev
```

`npm run publish:local` 只构建并同步本地根目录静态文件，不会推送 GitHub。根目录是 GitHub Pages 产物，源码在 `app-source/`，修改后需重新构建。

GitHub Pages 使用 `main` 分支的根目录发布。获准发布后，将构建后的源码和根目录静态文件一并提交、推送到 `main`，等待 Pages 构建完成并核对线上内容。

验证详情与手机真机测试边界见 [学习卡](docs/learning-cards/2026-09-15-mobile-particle-birthday.md)。
