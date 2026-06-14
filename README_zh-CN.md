# vCard Avatar Generator

> [English](README.md) | 简体中文

## 简介

一个纯浏览器端的工具，用于为 vCard 通讯录联系人生成头像。上传 `.vcf` 或 `.xlsx` 文件，预览和编辑联系人信息，然后下载包含头像的 vCard 文件。所有处理仅在本地完成，数据不会上传到任何服务器。

## 功能特点

- **导入 .vcf / .xlsx** — 支持拖拽或点击上传 vCard 2.1/3.0/4.0 格式文件（基于 [ical.js](https://github.com/kewisch/ical.js) 解析）
- **XLSX 模板** — 提供可直接下载的 Excel 模板，方便在电子表格中管理联系人
- **中文姓名性别识别** — 基于朴素贝叶斯算法，利用约 200 万条姓名数据（~9,442 个汉字）自动推断性别
- **联系人编辑表格** — 以表格形式展示所有联系人，支持编辑姓名、性别，并预览头像
- **vCard 3.0 导出** — 生成标准的 `.vcf` 文件，包含 `PHOTO`、`GENDER`、`ORG`、`TEL` 以及结构化的 `N`/`FN` 字段
- **隐私安全** — 纯前端运行，所有数据不上传服务器，关闭页面即清除

## 技术栈

- **构建工具**: Vite + Svelte 5 + TypeScript
- **样式方案**: Tailwind CSS v4 + [daisyUI](https://daisyui.com/) 5
- **图标库**: [Iconify](https://iconify.design/)（`@iconify/svelte` + `line-md` 图标集）
- **vCard 解析**: [ical.js](https://github.com/kewisch/ical.js)
- **代码质量**: ESLint + Prettier + Husky + commitlint + lint-staged

## 快速开始

### 环境要求

- Node.js >= 18

### 安装与运行

```bash
npm install
npm run dev
```

### 构建

```bash
npm run build          # 生产构建（base: /）
npm run build:demo     # Demo 构建（base: /vcard-avatar-generator/，需配置 .env.demo）
```

## 使用指南

1. **上传文件** — 在首页拖拽或点击选择 `.vcf` 或 `.xlsx` 文件
2. **编辑联系人** — 解析后的联系人以表格形式展示，可编辑姓名和性别
3. **导出 vCard** — 点击下载按钮，获取包含头像的 vCard 3.0 文件

> 如果你习惯使用 Excel，可以下载页面提供的 [XLSX 模板](/template/vcard-template.xlsx)，填写联系人信息后再导入。

## 项目结构

```
src/
├── main.ts                     # 入口文件
├── App.svelte                  # 根组件，包含页面路由
├── app.css                     # 全局样式
├── types.ts                    # Contact / Tel / Gender 类型定义
├── config/
│   └── ads.ts                  # 广告位配置（图片、链接）
├── components/
│   ├── Header.svelte           # 顶栏（标题 + GitHub 链接）
│   ├── Footer.svelte           # 底栏（版权信息）
│   └── FileUploader.svelte     # 文件上传组件（拖拽/选择/解析）
├── pages/
│   ├── Upload.svelte           # 文件上传页（三栏布局 + 广告位）
│   └── Editor.svelte           # 联系人编辑页（表格排序、固定列）
└── utils/
    ├── contact-reader.ts       # 统一文件读取入口（.vcf / .xlsx）
    ├── contact-writer.ts       # vCard 3.0 序列化（含 base64 头像）
    ├── chinese-gender-guesser.ts   # 朴素贝叶斯性别预测
    ├── chinese-gender-data.ts      # 约 9,442 个汉字的频率数据
    └── reader/
        ├── reader-vcard.ts     # 基于 ical.js 的 vCard 解析器
        └── reader-xlsx.ts      # XLSX 解析器
```

## 配置说明

- 应用完全在客户端运行，无需任何服务器配置
- 支持的文件类型：`.vcf`、`.xlsx`
- 性别识别结果可在编辑器中手动覆盖
- 导出的 vCard 遵循 vCard 3.0 标准，头像以 base64 编码的 PNG 格式嵌入

## 开发命令

| 命令                 | 说明                     |
| -------------------- | ------------------------ |
| `npm run dev`        | 启动开发服务器           |
| `npm run build`      | 生产构建                 |
| `npm run build:demo` | Demo 构建（自定义 base） |
| `npm run preview`    | 预览生产构建             |
| `npm run lint`       | ESLint 检查              |
| `npm run lint:fix`   | ESLint 检查并自动修复    |
| `npm run format`     | Prettier 格式检查        |
| `npm run format:fix` | Prettier 格式化并写入    |
| `npm run check`      | Svelte/TS 类型检查       |

## 开源协议

MIT
