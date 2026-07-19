# Kirameku-li 第三阶段执行报告

- 执行分支：`feat/original-author-cleanup-basic-personalization`
- 阶段基线：`main@68ecd1e86bdca6a8cd8bc4c55f36b1f9e7294d83`
- 计划提交：`3d4957a docs: add phase three design and execution plan`
- 执行环境：Windows PowerShell、Node.js 24.15.0、pnpm 11.9.0、Python 3.9.1

## 1. Task 1 执行摘要

Task 1 只完成路径映射、原作者信息审计和三端基线验证，尚未修改业务代码、运行时配置、数据库或静态素材。任务开始时当前分支符合要求，`git status --short` 为空；未重新创建分支，也未切换到 `main`。

已完整阅读第三阶段设计、Codex 执行任务和品牌视觉参考图，并复核 README、前两阶段设计/报告、三端依赖清单、环境变量模板及启动脚本。品牌展示板仅作为方向参考，正式 Logo 和插画不得从该图裁切。

## 2. 真实路径映射

| 能力 | 计划中的概念路径 | 仓库真实路径 | 说明 |
|---|---|---|---|
| 公共前台根目录 | 公共前台 | `Kirameku/` | Next.js App Router，pnpm 11。 |
| 后端根目录 | FastAPI 后端 | `Kirameku-backend/` | FastAPI、SQLModel、PostgreSQL。 |
| 管理后台根目录 | 独立管理后台 | `Kirameku-backend/admin/` | Vue 3、Vite、Pure Admin，构建后由 FastAPI 挂载。 |
| 前台站点配置 | 站点配置 | `Kirameku/siteConfig.ts` | 当前集中保存原作者身份、歌单、备案和背景配置。 |
| 全局 metadata | metadata / favicon | `Kirameku/app/layout.tsx`、`Kirameku/app/icon.png` | metadata 读取 `siteConfig`；没有 manifest 文件。 |
| Header | Header | `Kirameku/components/layout/Navbar.tsx` | 桌面和移动导航共用；包含原作者 Logo 文案和彩蛋。 |
| Footer | Footer | 无独立 Footer | 当前站点底部信息由 `Kirameku/components/widgets/SiteDashboard.tsx` 承担；第三阶段需新增或重组真实 Footer。 |
| 首页服务端入口 | 首页 | `Kirameku/app/page.tsx` | 当前直接聚合文章、动态、相册历史计数。 |
| 首页客户端布局 | 首页组件 | `Kirameku/app/HomeClient.tsx` | 聚合 Profile、音乐、文章、动态、照片墙、DogDiary、Dashboard。 |
| 首页个人资料 | Hero / Profile | `Kirameku/components/home/ProfileCard.tsx` | 当前展示原头像、原社交链接和三类历史计数。 |
| 首页文章/动态/相册 | 首页模块 | `components/home/LatestPostsCarousel.tsx`、`LatestChatterCarousel.tsx`、`PhotoWallPreview.tsx` | 后续由首页模块配置和后端公共配置控制。 |
| 公共文章列表 | 文章列表 | `Kirameku/app/posts/page.tsx` | 调用 `app/api/posts.ts` 与 `app/api/categories.ts`。 |
| 公共文章详情 | 文章详情 | `Kirameku/app/posts/[slug]/page.tsx` | 动态路由；后端非公开详情必须统一 404。 |
| RSS | RSS | `Kirameku/app/feed/route.ts` | 当前包含原作者邮件，并调用文章出口。 |
| 动态列表/详情 | 动态 | `Kirameku/app/moments/page.tsx` | 列表和详情交互位于同一页面；没有独立详情页面文件。 |
| 相册列表/详情 | 相册 | `Kirameku/app/photowall/page.tsx` | 相册及照片详情交互位于同一页面；没有独立相册详情路由。 |
| 项目列表 | 项目 | `Kirameku/app/projects/page.tsx`、`projectsData.ts` | 当前使用原作者 fallback 项目数据。 |
| 关于页 | 关于 | `Kirameku/app/about/page.tsx`、`about/about.md` | Markdown 与页面框架均引用原作者内容/素材。 |
| 前台主题 | 主题 | `components/providers/ThemeProvider.tsx`、`app/globals.css` | 已有主题持久化基础，后续按品牌色和 reduced-motion 收敛。 |
| 音乐 | 音乐 | `siteConfig.ts`、`components/providers/MusicProvider.tsx`、`components/music/*`、`app/api/music/route.ts` | 当前配置原网易云歌单。 |
| 访客统计前台 | 公共统计 | `components/layout/VisitorTracker.tsx`、`components/widgets/SiteDashboard.tsx` | 当前没有 namespace 隔离。 |
| 后端路由聚合 | public/admin 路由 | `Kirameku-backend/app/api/router.py` | public/admin 并非独立目录，而是按同一 router 内路径和鉴权区分。 |
| 文章 API/服务 | 文章访问控制 | `app/api/posts.py`、`app/services/post_service.py` | 列表、详情、后台详情共享服务，后续需明确 public/admin 查询。 |
| 分类/标签 API | 分类和标签 | `app/api/categories.py`、`tags.py` 及对应 service | 当前公共集合会暴露历史计数。 |
| 动态 API/服务 | 动态访问控制 | `app/api/chatters.py`、`app/services/chatter_service.py` | public/admin 端点位于同一文件。 |
| 相册 API/服务 | 相册访问控制 | `app/api/albums.py`、`app/services/album_service.py` | public/admin 端点位于同一文件。 |
| 公共站点配置 | 配置接口 | 现有 `app/api/site_config.py` 是数据库配置 CRUD | 第三阶段建议的 `/api/site/public-config` 当前不存在，不能误用会暴露完整配置的旧接口。 |
| 公共统计后端 | 访问统计 | `app/api/visitors.py`、`app/services/visitor_service.py`、`app/api/dashboard.py` | 管理 dashboard 已鉴权；公共 count/record 尚无 namespace。 |
| 用户模型 | 管理员用户 | `app/models/user.py` | `username`、`hashed_password`、`email`、`is_admin`。 |
| 初始化 SQL | seed / 初始化 | `Kirameku-backend/init_db.sql` | 含默认管理员插入；不存在独立 seed 目录或迁移工具。 |
| 前台静态资源 | 品牌/个人素材 | `Kirameku/public/`、`Kirameku/app/icon.png` | `public/live2d/` 共 1178 文件、约 224 MB。 |
| 管理后台静态资源 | 后台品牌 | `admin/src/assets/`、`admin/public/`、`admin/index.html`、`admin/public/platform-config.json` | `admin/build/` 是已跟踪构建快照，源文件修改后需按计划处理。 |
| 项目素材暂存 | 项目封面候选 | `项目图片/` | 文件名缺少语义，版权和隐私均需人工逐图判断。 |
| 项目文档 | README / LICENSE / NOTICE | `README.md`、`LICENSE` | `NOTICE` 不存在；LICENSE 必须保留。 |

## 3. 原作者信息审计

### 3.1 必须删除的运行时身份

| 位置 | 命中类型 | 后续动作 |
|---|---|---|
| `Kirameku/siteConfig.ts` | `Starhiro`、原站域名、原头像、原歌单、原 GitHub/Gitee/邮箱、备案信息 | Task 7/8/12 替换为锁定品牌配置或安全空值。 |
| `Kirameku/components/layout/Navbar.tsx` | 原站名称与彩蛋身份 | Task 8 重做品牌 Header，删除身份彩蛋。 |
| `Kirameku/app/about/about.md`、`app/about/page.tsx` | 原作者自述、账号、头像和封面 | Task 11 完整替换。 |
| `Kirameku/app/moments/page.tsx` | `/images/hong.jpg` 和原作者名 | Task 12 关闭公共入口并移除素材引用。 |
| `Kirameku/app/feed/route.ts` | 原作者邮箱 | Task 3/12 改为新品牌并服从文章可见性。 |
| `Kirameku/app/projects/projectsData.ts` | 原作者项目和外链 | Task 7/10 使用新的统一项目配置。 |
| `Kirameku/next.config.ts` | 原作者图片域名和 OSS 域名 | Task 12 删除不再使用的远程图片白名单。 |
| `Kirameku-backend/app/config.py` | CORS 默认包含原站域名 | Task 2 改为 localhost 安全默认。 |
| `Kirameku-backend/app/api/github_auth.py` | OAuth 回跳默认原站域名 | Task 12 改为安全本地默认/环境配置。 |
| `Kirameku/public/live2d/**/waifu-tips.js` | 原作者站点外链 | Task 12 随不再授权使用的 Live2D 素材一并处理。 |
| `Kirameku-backend/init_db.sql` | 默认管理员初始化 | Task 5 删除默认账号，保留表结构和非破坏性历史数据策略。 |

### 3.2 必须替换的个性化内容

- `Kirameku/public/images/hong.jpg`：原作者头像，替换为原创 `logo-icon.svg` 用途，不复用图片。
- `Kirameku/public/images/*.webp`、默认封面和照片墙图片：当前作为背景/演示素材，逐引用替换为原创品牌素材或安全空状态。
- `Kirameku/public/live2d/`：原作者/第三方专属资源且授权未确认，本阶段不继续使用。
- `Kirameku-backend/admin/src/assets/user.jpg`、登录页插画、Logo、favicon：按 Task 13 统一品牌；Pure Admin 通用来源信息不得冒充自有素材。
- `DEPLOY_NOTES.md`、`nginx-cache-debug.md`：包含原域名和原部署叙述，不是运行时配置；Task 14 评估精简或明确标记历史上游记录。
- `Kirameku/content/posts/`：包含原作者历史文章与域名，不删除数据库历史数据；Task 3 先从公共出口隔离，仓库内示例 Markdown 后续按运行引用和署名分别处理。

### 3.3 允许保留的上游信息

- 根目录 `LICENSE`。
- Git 历史。
- `upstream https://github.com/Xinghongia/Kirameku.git` 远程与 README 中必要的上游致谢。
- `docs/01-*`、`docs/02-*`、`docs/audits/*` 和第三阶段设计/任务中的审计证据及搜索样例；它们不是运行时身份。
- Pure Admin 等第三方依赖、模板注释和许可证要求的来源链接，但不得作为当前站点个人社交入口。

### 3.4 需要人工判断的通用素材

- `项目图片/` 中 45 个无语义文件名图片：需要逐图确认项目归属、版权和脱敏，不直接作为封面。
- `Kirameku/public/images/` 中除明确头像外的 20 个图片：需结合引用和画面内容判断；未确认前不继续公开使用。
- 管理后台 `src/assets/login/`、`src/assets/status/` 等 Pure Admin 模板资源：可在保留模板许可的前提下使用，但品牌入口必须替换。
- `DEPLOY_NOTES.md`、`nginx-cache-debug.md` 和本地 Markdown 示例：需区分有复用价值的通用排障知识与原作者个人部署叙述。

## 4. Task 1 基线验证

| 命令 | 工作目录 | 退出码 | 结果 | 文件变化 |
|---|---|---:|---|---|
| `git status --short` | 仓库根目录 | 0 | 初始工作区干净。 | 无 |
| `pnpm install --frozen-lockfile` | `Kirameku/` | 0 | pnpm 11.9.0，锁文件未变化。 | 仅忽略的 `node_modules/` 状态 |
| `pnpm build` | `Kirameku/` | 0 | Next.js 16.2.4，39 个路由构建成功；后端未启动时 RSS 有已知非阻塞 `ECONNREFUSED`。 | 生成忽略的 `.next/` |
| `venv\Scripts\python.exe -m unittest discover -s tests -v` | `Kirameku-backend/` | 0 | 10/10 通过；显式禁用 dotenv 并使用测试变量。 | 仅忽略的缓存 |
| `pnpm install --frozen-lockfile` | `Kirameku-backend/admin/` | 0 | 锁文件未变化。 | 仅忽略的 `node_modules/` 状态 |
| `pnpm typecheck` | `Kirameku-backend/admin/` | 0 | Vue/TypeScript 类型检查通过。 | 无 |
| `pnpm build` | `Kirameku-backend/admin/` | 0 | 3349 模块构建成功。 | 生成忽略的 `dist/`，并刷新构建脚本产物 |

## 5. Task 1 路径与命令偏差

1. 用户已预先创建并切换到目标分支，因此没有执行任务文档中的创建分支命令。
2. Windows PowerShell 5 不支持 Bash 风格 `||`；审计搜索改为读取 `$LASTEXITCODE`，搜索规则本身未变。
3. 计划概念中的 Footer、动态详情页、相册详情页在真实仓库中不存在独立文件，映射到现有聚合组件/页面。
4. 现有 `/api/site-config` 是数据库配置 CRUD，不是设计要求的最小公开配置接口；后续将按现有路由规范新增 `/api/site/public-config`。
5. `NOTICE` 不存在；只保护实际存在的 `LICENSE`、Git 历史和必要上游署名。

Task 1 完成后，业务代码仍保持基线状态。后续 Task 将在各自测试、最小实现和独立提交中继续更新本报告。
