# vCard Avatar Generator

> [English](README.md) | 简体中文

## 📌 简介

> TODO: 补充项目简介

批量为 vCard 通讯录联系人生成指定风格的随机头像工具。

## ✨ 功能特点

> TODO: 补充具体功能描述

- 批量处理：一次导入 vCard 文件，自动为所有联系人生成头像
- 多种风格：支持指定头像风格（几何、卡通、渐变色等）
- 稳定输出：支持种子（seed）参数，相同联系人每次都生成一致头像
- 轻量快速：纯前端运行，不依赖外部 API

## 📦 技术栈

- Vite + Svelte 5 + TypeScript
- Tailwind CSS v4
- 头像生成基于 Canvas API

## 🚀 快速开始

### 环境要求

- Node.js >= 18

### 安装与运行

```bash
npm install
npm run dev
```

### 构建

```bash
npm run build
```

## 📖 使用指南

> TODO: 补充详细使用步骤

- 输入：标准的 `.vcf` 文件
- 操作步骤（导入 → 选择风格 → 生成 → 导出）
- 输出：包含头像图片的 vCard 文件或 Zip 包

## 🏗️ 项目结构

> TODO: 补充实际项目结构

```
src/
├── main.ts          # 入口
├── App.svelte       # 主界面
├── app.css          # 全局样式
├── lib/             # 核心逻辑
│   ├── parser/      # vCard 解析
│   ├── generator/   # 头像生成器
│   └── export/      # 导出处理
├── components/      # UI 组件
└── types/           # 类型定义
```

## ⚙️ 配置说明

> TODO: 补充可配置项

- 支持自定义头像风格列表
- 输出图片尺寸、格式配置
- 种子生成规则

## 🧪 开发命令

| 命令                 | 说明                  |
| -------------------- | --------------------- |
| `npm run dev`        | 启动开发服务器        |
| `npm run build`      | 构建生产版本          |
| `npm run lint`       | ESLint 检查           |
| `npm run lint:fix`   | ESLint 检查并自动修复 |
| `npm run format`     | Prettier 格式检查     |
| `npm run format:fix` | Prettier 格式化并写入 |
| `npm run check`      | Svelte/TS 类型检查    |

## 📄 开源协议

MIT
