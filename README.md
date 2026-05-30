# 决策回响 · AI决策力大富翁沙盘

一个基于 Next.js 的单人 AI 决策推演游戏。玩家选择角色后，通过任务、事件、危机、机遇、商店和复盘报告完成一轮经营决策训练。

## 技术栈

- Next.js 16
- React 19
- Tailwind CSS 4
- Zustand
- Prisma / SQLite
- DeepSeek API 或内置 `z-ai-web-dev-sdk` fallback

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

如果在国内网络环境安装依赖较慢，可以使用：

```bash
npm install --registry=https://registry.npmmirror.com/
```

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
DATABASE_URL="file:./db/custom.db"
```

游戏内也支持输入 DeepSeek API Key。不要把真实 `.env` 文件提交到仓库。

## 常用命令

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:push
```

## 目录说明

- `src/app`：Next.js App Router 页面和 API Routes
- `src/components/game`：游戏核心 UI 组件
- `src/store/gameStore.ts`：Zustand 游戏状态机
- `src/data/scenario.ts`：剧本、角色、任务、事件、商店、评分维度等配置
- `prisma/schema.prisma`：Prisma schema
- `upload`：需求与数据文档
- `agent-ctx`：开发过程上下文记录
