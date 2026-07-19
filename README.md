# Kirameku · 晚

一个围绕代码、灵感与生活记录持续建设的个人站点。仓库包含 Next.js 公共前台、FastAPI API 与 Vue 3 管理后台；公共内容采用显式开启和白名单策略，数据库中的历史文章、动态、相册及统计仍由受保护的后台管理。

## 当前重点

| 项目 | 状态 | 说明 |
|---|---|---|
| InternPilot | 已上线 · 持续迭代 | 面向求职流程的 AI 辅助工作台，站内提供项目详情和公开源码入口。 |
| InternPilot HarmonyOS Agent | 最小 Demo 验证中 | 在 DevEco / HarmonyOS 环境验证最小智能体交互链路，不代表完整产品。 |
| SecondBrain | 文章整理中 | 私有知识工作流的公开摘要；仓库地址、文件路径和正文不对外提供。 |

公共导航固定为首页、项目、文章和关于。`/moments` 与 `/photowall` 当前返回 404；历史动态、照片及其后台管理能力没有删除。音乐能力保留但歌单为空时只显示“歌单整理中”。

## 技术结构

```text
.
├── Kirameku/                 # Next.js 16 / React 19 公共前台
│   ├── app/                  # App Router 页面与接口代理
│   ├── components/           # 页面、布局与交互组件
│   ├── config/               # 品牌、导航、首页、项目与主题配置
│   └── public/brand/         # 第三阶段原创品牌与项目视觉
├── Kirameku-backend/         # FastAPI / SQLModel / PostgreSQL
│   ├── app/                  # API、模型、服务和维护命令
│   ├── admin/                # Vue 3 / Vite / Element Plus 管理后台
│   ├── init_db.sql           # 仅建表，不写入登录凭据
│   └── DATABASE.md           # 数据模型与初始化说明
├── docs/                     # 审计、设计与阶段执行记录
└── LICENSE
```

前台和管理后台统一使用 pnpm 11 与各自目录中的 `pnpm-lock.yaml`。不要生成或提交 npm、Yarn 锁文件。

## 本地启动

已验证的开发基线为 Node.js `24.15.0`、pnpm `11.9.0`、Python `3.9.1` 和 PostgreSQL 14+。下面以 PowerShell 为例；所有 `.env` 都只保留在本机。

### 1. 准备后端

```powershell
cd Kirameku-backend
python -m venv venv
venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

编辑本地 `.env`，至少设置可用的 `DATABASE_URL` 和随机生成的 `SECRET_KEY`。OSS、GitHub OAuth 与 reader 服务均可按需配置；OSS 留空不会阻止 FastAPI 启动，只会使上传接口不可用。

初始化空数据库：

```powershell
psql -d <database-name> -f init_db.sql
```

仓库不内置登录凭据。首次初始化后，交互创建管理员：

```powershell
python -m app.scripts.create_admin
```

命令会隐藏输入两次密码，不接受密码命令行参数，也不会输出密码或哈希。完整说明见 [`Kirameku-backend/DATABASE.md`](Kirameku-backend/DATABASE.md)。

### 2. 构建管理后台

FastAPI 从 `Kirameku-backend/admin/dist` 挂载 `/admin`，因此首次启动前先构建后台：

```powershell
cd admin
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
cd ..
```

单独开发后台时运行 `pnpm dev`；未登录访问业务路由会跳转到登录页。

### 3. 启动 FastAPI

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- API 文档：`http://127.0.0.1:8000/docs`
- 管理后台：`http://127.0.0.1:8000/admin`
- Liveness：`GET /api/health`
- Readiness：`GET /api/health/ready`

`/api/health` 不访问数据库或 OSS。数据库不可用时 FastAPI、文档和 liveness 仍可启动，readiness 会安全返回 503，依赖数据库的业务接口不可用。

### 4. 启动公共前台

另开一个终端：

```powershell
cd Kirameku
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1 --port 3000
```

生产构建与本地启动验证：

```powershell
pnpm exec tsc --noEmit
pnpm build
pnpm start --hostname 127.0.0.1 --port 3000
```

前台通过 `NEXT_PUBLIC_API_URL` 访问 FastAPI。后端暂不可用时，首页、文章页和站点统计使用安全空状态，不回退展示历史内容。

## 公开内容策略

所有历史数据继续保存在数据库中。文章、动态和相册默认关闭；是否公开由后端执行，前端隐藏不是访问控制：

| 变量 | 初始策略 | 作用 |
|---|---|---|
| `PUBLIC_POSTS_ENABLED` | `false` | `true` 会公开全部已发布文章；`false` 时只允许白名单内的已发布文章。 |
| `PUBLIC_POST_SLUG_ALLOWLIST` | 空 | 仅在全局文章开关为 `false` 时用于单篇公开；多个 slug 用逗号分隔。 |
| `PUBLIC_CHATTERS_ENABLED` | `false` | 动态公共接口开关；当前公共页面入口同时关闭。 |
| `PUBLIC_ALBUMS_ENABLED` | `false` | 相册公共接口开关；当前公共页面入口同时关闭。 |
| `PUBLIC_STATS_NAMESPACE` | `kirameku-wan-v1` | 新站访问统计命名空间，与历史统计隔离。 |
| `SITE_LAUNCH_DATE` | 空 | 可选 ISO 日期 `YYYY-MM-DD`；为空时前台不显示运行天数。 |

`PUBLIC_POSTS_ENABLED=false` 且白名单为空时，公共列表为空；`PUBLIC_POSTS_ENABLED=true` 会公开全部已发布文章，不能把它当作白名单开关。非公开详情统一返回 404。管理员接口仍要求有效 Token 和管理员身份，并可继续管理历史内容。

## 其他配置

后端完整变量模板位于 `Kirameku-backend/.env.example`，包括数据库、应用密钥、CORS、公共内容开关、GitHub OAuth、OAuth 回跳地址 `FRONTEND_ORIGIN` 和可选 OSS。前台模板位于 `Kirameku/.env.example`，主要包含 API 与可选 reader 地址。不要提交填有真实值的 `.env`。

音乐歌单目前不是环境变量，而是在 `Kirameku/config/home.ts` 的 `musicConfig.playlistId` / `songIds` 中配置；两者为空时不会请求旧歌单接口。简历入口位于 `Kirameku/config/site.ts`，只有 `resume.enabled` 为 `true` 且存在有效 URL 时才渲染。

## 内容维护

将单个本地 Markdown 文件导入为草稿：

```powershell
cd Kirameku-backend
python -m app.scripts.import_post_draft "<markdown-file>"
```

Front Matter 必须提供合法 `slug`；标题可来自 `title` 或正文第一个一级标题。同一 slug 再次导入会更新原草稿，已发布文章拒绝覆盖，导入结果始终保持 `draft`。命令只读取显式传入的文件，不扫描目录，不复制源文件，也不输出正文或私有路径。

## 验证入口

```powershell
# 后端
cd Kirameku-backend
venv\Scripts\python.exe -m unittest discover -s tests -v
venv\Scripts\python.exe -m compileall -q app tests

# 公共前台
cd ..\Kirameku
pnpm exec tsc --noEmit
pnpm build

# 管理后台
cd ..\Kirameku-backend\admin
pnpm test:brand
pnpm typecheck
pnpm build
```

第三阶段的完整命令、退出码、访问控制矩阵与人工验收步骤记录在 [`docs/03-original-author-cleanup-and-basic-personalization-report.md`](docs/03-original-author-cleanup-and-basic-personalization-report.md)。

## Upstream attribution

Kirameku-li is a personalized fork and continued development of Kirameku. The original license and upstream attribution are preserved.

Upstream repository: [Xinghongia/Kirameku](https://github.com/Xinghongia/Kirameku)

The Vue administration interface continues to use and credit the [pure-admin](https://github.com/pure-admin/vue-pure-admin) ecosystem. See [`LICENSE`](LICENSE) and package metadata for applicable notices and dependency licenses.

## License

This repository preserves the upstream MIT license. See [`LICENSE`](LICENSE).
