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

## 6. Task 2 公共内容配置与安全默认值

新增 `Kirameku-backend/app/public_site.py` 作为第三阶段公共内容配置的单一解析层。配置只从进程环境读取，不依赖数据库，也不会读取或回写本地 `.env`。安全默认值如下：

| 环境变量 | 默认值 | 作用 |
|---|---|---|
| `PUBLIC_POSTS_ENABLED` | `false` | 关闭公共文章入口。 |
| `PUBLIC_POST_SLUG_ALLOWLIST` | 空 | 未明确列出的历史文章不公开。解析时去除空项、首尾空格和重复 slug，并保留顺序。 |
| `PUBLIC_CHATTERS_ENABLED` | `false` | 关闭公共动态入口。 |
| `PUBLIC_ALBUMS_ENABLED` | `false` | 关闭公共相册入口。 |
| `PUBLIC_STATS_NAMESPACE` | `kirameku-wan-v1` | 为后续统计隔离提供服务端 namespace；不通过公开接口下发。 |
| `SITE_LAUNCH_DATE` | 空 | 可选 ISO 日期；非法值按未配置处理。 |

新增无鉴权、无数据库依赖的 `GET /api/site/public-config`。响应模型严格限定为三个内容可见性布尔值与 `launchDateConfigured`，不暴露文章 allowlist、统计 namespace、环境变量、管理员信息、数据库地址或密钥。现有数据库型 `/api/site-config` 保持不变，避免扩大接口兼容范围。

同时把 `CORS_ORIGINS` 的代码默认值收敛为 `http://localhost:3000,http://localhost:5173`，移除原作者线上域名；部署域名仍须由环境显式配置。

### 6.1 测试证据

| 命令 | 退出码 | 结果 |
|---|---:|---|
| `venv\Scripts\python.exe -m unittest tests.test_public_site_config -v`（实现前） | 1 | 5 项按预期失败：配置模块缺失，公开接口返回 404。 |
| `venv\Scripts\python.exe -m unittest tests.test_public_site_config -v`（实现后） | 0 | 5/5 通过，覆盖安全默认值、allowlist 解析、布尔解析、日期校验和最小公开响应。 |
| `venv\Scripts\python.exe -m unittest discover -s tests -v` | 0 | 15/15 通过，第二阶段 10 项回归未受影响。 |
| `venv\Scripts\python.exe -m compileall -q app tests` | 0 | 后端应用与测试模块均可编译。 |

以上测试均显式设置 `PYTHON_DOTENV_DISABLED=1`、测试专用数据库 URL 和测试专用密钥，未读取真实凭据。

## 7. Task 3 统一公共内容访问控制

新增 `Kirameku-backend/app/content_visibility.py`，以 `is_post_public(post, settings)` 作为文章公开性的唯一对象级判断入口：非 `published` 永不公开；显式启用文章模块时公开已发布文章；未启用时仅公开 allowlist 命中且已发布的文章。公共列表先完成统一判断再分页，查询参数中的 `status` 不能绕过规则。

### 7.1 已收敛的真实公共出口

| 内容 | 公共行为 | 管理行为 |
|---|---|---|
| 文章列表、分页、分类筛选、标签筛选、首页最新文章、RSS | 复用受控 `GET /api/posts`；默认返回空集合。 | 新增鉴权 `GET /api/posts/admin`。 |
| 文章计数与首页 Dashboard | `GET /api/posts/count` 只统计公开文章。 | 新增鉴权 `GET /api/posts/admin/count`，保留完整状态统计。 |
| 文章详情、页面 metadata 数据源 | `GET /api/posts/{slug}` 对不存在和非公开文章统一返回 404。 | 新增鉴权的 `/api/posts/admin/detail/{post_id}` 与 `/api/posts/admin/slug/{slug}`；旧 `/detail/{post_id}` 同样增加管理员鉴权以阻断直读。 |
| 文章点赞 | 按文章 ID 操作前复用公开性判断，非公开文章返回 404。 | 文章创建、更新、删除接口保持原管理员鉴权。 |
| 文章评论 | 评论列表、创建、点赞/取消点赞均先验证关联文章公开性；关闭态返回 404，回复目标还必须属于同一文章。 | 既有评论审核、状态更新和删除接口保持管理员鉴权。 |
| 分类与标签 | 只返回至少含一篇公开文章的项，`post_count` 由公开文章实时重算。 | 新增鉴权 `/api/categories/admin`、`/api/tags/admin`，保留完整历史集合与存储计数。 |
| 动态 | 关闭时列表为空、计数为 0，详情、评论读取/创建、动态与评论点赞均返回 404；启用时仍只读取 `published`。 | 既有 `/api/chatters/admin` 保留，并新增鉴权详情 `/api/chatters/admin/{chatter_id}`。 |
| 相册 | 关闭时列表为空，详情和照片列表返回 404；启用时行为保持。 | 新增鉴权 `/api/albums/admin`、详情和照片读取端点。 |

管理后台五个 API 客户端已切换到对应 `/admin` 读取路径。公共前台无需复制可见性条件：文章页、首页、花园页、时间线、动态页、相册页和 RSS 都继续调用受控公共 API。仓库不存在 sitemap、文章搜索建议接口、独立分类/标签页面或相关文章接口，因此按任务约束未新建这些功能。

### 7.2 测试与数据保护

新增测试使用内存 SQLite 构造 published、draft、allowlist 命中/未命中以及历史动态、相册数据；测试结束后销毁内存数据库。没有连接、迁移、覆盖或删除现有 PostgreSQL 数据。

| 命令 | 退出码 | 结果 |
|---|---:|---|
| `venv\Scripts\python.exe -m unittest tests.test_public_content_visibility -v`（实现前） | 1 | 8 项按预期失败：统一可见性模块与设置依赖缺失。 |
| `venv\Scripts\python.exe -m unittest tests.test_public_content_visibility -v`（核心实现后） | 0 | 8/8 通过。 |
| `venv\Scripts\python.exe -m unittest tests.test_public_content_visibility -v`（边界补全后） | 0 | 最终 15/15 通过，包含评论旁路与无 Token 管理读取 401 用例。 |
| `venv\Scripts\python.exe -m unittest discover -s tests -v` | 0 | 最终 30/30 通过，包含 15 项 Task 3 内容与鉴权回归。 |
| `venv\Scripts\python.exe -m compileall -q app tests` | 0 | Task 3 后端源码与测试均可编译。 |
| `pnpm typecheck` | 0 | 管理后台 API 路径变更类型检查通过。 |
| `pnpm build`（管理后台） | 0 | Vite 生产构建通过，3349 模块。 |
| `pnpm exec eslint --max-warnings 0 src/api/album.ts src/api/category.ts src/api/chatter.ts src/api/post.ts src/api/tag.ts`（格式化前） | 1 | 仅 19 个 CRLF/Prettier 格式项，无行为或类型错误。 |
| `pnpm exec prettier --write ...` | 0 | 只格式化本任务修改的五个管理后台 API 文件。 |
| 同一条定向 ESLint（格式化后） | 0 | 本任务修改的管理后台文件 0 errors、0 warnings。 |
| `pnpm build`（公共前台） | 0 | 39 个路由构建成功；后端未启动时 RSS 保留既知非阻塞 `ECONNREFUSED` 日志。 |

人工脚本对 10 个新增管理读取 URL 进行了无 Token 请求，均返回 401；该行为随后加入自动化回归测试。未读取本地 `.env`，未写入真实 Token、密码或数据库凭据。

## 8. Task 4 隔离公开访问统计

新增 `public_visitor_stat` 计数表，以 `namespace` 为主键保存公开访问量。没有给旧 `visitor` 表增加列，也没有迁移、覆盖或删除旧访客明细：

- `PUBLIC_STATS_NAMESPACE` 不存在或为空时使用 `kirameku-wan-v1`。
- 当前 namespace 尚无计数行时，公开访问量为 0。
- `POST /api/visitors/record` 在同一事务中保留管理员可见的访客明细，并只递增当前 namespace。
- legacy namespace 或旧 `visitor` 明细不影响 `GET /api/visitors/count`。
- 管理后台访客列表与 dashboard 继续读取完整 `visitor` 历史。
- `init_db.sql` 只增加幂等的 `CREATE TABLE IF NOT EXISTS public_visitor_stat`，没有修改旧表或数据。

公开统计响应固定为 `code`、`count`、`launchDate`、`runningDays`。namespace 和文章、草稿、动态、相册、分类、标签数量均不下发。`SITE_LAUNCH_DATE` 为空或非法时，日期与运行天数均为 `null`；有效时运行天数由服务端日期计算并钳制为非负值，避免客户端时区造成负数或跳变。

公共前台新增类型化访客统计 API。`SiteDashboard` 与 `/garden` 不再使用 `siteConfig.buildDate` 或代码内回退日期：只有响应包含 `runningDays` 时才显示运行时间。首页统计同时展示新 namespace 访问量。访客 session key 更新为新站点版本标识，不再沿用原站会话键。

### 8.1 测试与环境限制

| 命令 | 退出码 | 结果 |
|---|---:|---|
| `venv\Scripts\python.exe -m unittest tests.test_public_site_statistics -v`（有效红灯） | 1 | 5 项中 3 failures、1 error：旧公开 count 泄漏历史值、namespace 模型与日期字段缺失。此前一次运行被 Python 3.9 测试注解兼容问题阻断，修正测试后才计为有效红灯。 |
| 同一专项命令（实现后） | 0 | 最终 6/6 通过，覆盖初始 0、legacy 隔离、当前 namespace 递增、有效/无效日期和响应字段收敛。 |
| `venv\Scripts\python.exe -m unittest discover -s tests -v` | 0 | 36/36 通过。 |
| `venv\Scripts\python.exe -m compileall -q app tests` | 0 | 后端源码与测试均可编译。 |
| `pnpm build`（公共前台） | 0 | TypeScript 与 39 个路由构建成功；后端未启动时 RSS 仍有既知非阻塞 `ECONNREFUSED`。 |
| `pnpm exec eslint app/api/visitors.ts components/layout/VisitorTracker.tsx components/widgets/SiteDashboard.tsx app/garden/page.tsx` | 0 | 0 errors；`/garden` 的 2 个既有 unused warnings 未在本阶段清理。 |

当前环境没有可连接的 PostgreSQL，未对真实库执行 DDL 或业务联调。既有部署在更新代码后必须执行幂等的 `public_visitor_stat` 建表语句（或按项目既有初始化流程执行更新后的 `init_db.sql`）；这是环境执行项，不影响内存数据库自动化验证，也不要求删除旧统计。

## 9. Task 5 安全管理员引导

`Kirameku-backend/init_db.sql` 已删除默认管理员插入语句、固定用户名、固定邮箱和示例密码哈希，只保留表结构与幂等初始化。没有删除或修改数据库中的历史文章、动态、相册、访客明细和统计数据。

新增 `app.services.user_service.create_admin` 作为管理员创建的单一服务入口，复用现有 `hash_password`，并执行用户名/邮箱规范化、12 字符最小密码长度、用户名与邮箱大小写不敏感去重以及事务回滚。新增 `python -m app.scripts.create_admin` 交互命令：用户名和邮箱由标准输入读取，密码由 `getpass` 隐藏读取两次；命令拒绝全部命令行参数，不输出密码、哈希、数据库地址或异常详情。`DATABASE.md` 已补齐初始化数据库、创建管理员、启动后台和访问 `/admin` 的顺序，并明确仓库不提供默认凭据。

管理后台登录表单不再预填账号和密码；旧角色演示页不再用固定密码静默切换身份；fake server 生产模式已关闭，模拟登录固定拒绝且不签发 Token。真实代码路径确认 FastAPI 仅挂载忽略的 `admin/dist`，Task 1 识别的 `admin/build/static` 实为误提交的旧编译快照而非当前挂载目录，因此删除该静态快照及同目录生成的 HTML/图标/版本文件，只保留 `admin/build/*.ts` 构建配置。正式构建仍由 `pnpm build` 生成忽略的 `admin/dist`，未提交构建产物。

### 9.1 测试与安全验证

| 命令 | 退出码 | 结果 |
|---|---:|---|
| `venv\Scripts\python.exe -m unittest tests.test_admin_bootstrap.AdminBootstrapTests.test_admin_frontend_has_no_default_credentials_or_mock_login`（实现前） | 1 | 按预期命中登录页预填默认账号与密码。 |
| `venv\Scripts\python.exe -m unittest tests.test_admin_bootstrap` | 0 | 8/8 通过：SQL 无 seed、管理员创建/哈希/角色、重复用户名、重复邮箱、密码不一致、隐藏输入、安全输出、参数拒绝和后台默认凭据扫描。 |
| `venv\Scripts\python.exe -m compileall -q app` | 0 | 后端应用模块可编译。 |
| `venv\Scripts\python.exe -m unittest discover -s tests -v` | 0 | 44/44 通过。 |
| `venv\Scripts\python.exe -m app.scripts.create_admin --password DoNotEchoThisValue` | 2 | 参数被拒绝；输出仅包含固定错误信息，未回显参数值。 |
| `git grep -n -I 'admin123' -- ':!docs/**' ':!DATABASE.md'` | 1 | 运行源码和被跟踪资产无默认密码命中。 |
| `pnpm typecheck`（管理后台） | 0 | Vue/TypeScript 类型检查通过。 |
| `pnpm build`（管理后台） | 0 | Vite 生产构建通过，生成物仅位于忽略的 `admin/dist`。 |
| 定向 ESLint（首次） | 1 | 仅 26 条 CRLF/Prettier 格式错误，无类型或行为错误。 |
| `pnpm exec prettier --write build/plugins.ts mock/login.ts src/views/login/index.vue src/views/permission/page/index.vue` | 0 | 只格式化本任务修改的四个管理后台文件。 |
| 同一组文件定向 ESLint（格式化后） | 0 | 0 errors，0 warnings。 |

当前环境没有可连接的 PostgreSQL，因此没有执行真实交互创建；成功写入、重复冲突、哈希和回滚由内存 SQLite 自动化测试覆盖。生产或验收环境仍需由操作者在后端目录运行 `python -m app.scripts.create_admin` 并自行输入本地凭据。

## 10. Task 6 私有 Markdown 草稿导入

新增 `python -m app.scripts.import_post_draft "<本地 Markdown 路径>"`。命令只读取调用者显式传入的单个文件，不扫描目录、不访问 second-brain 仓库，也不复制 Markdown 到当前仓库。YAML Front Matter 使用 `PyYAML.safe_load` 解析，因此在 `requirements.txt` 中显式声明当前已验证的 `PyYAML==6.0.3`。

解析和写入规则如下：

- Front Matter 必须是 YAML 对象，`slug` 必填且只接受小写字母、数字和连字符。
- `title` 优先取 Front Matter；缺失时取正文第一个一级标题；两者均缺失则终止。
- `summary` 写入文章描述，`category` 和 `tags` 按名称复用或创建，并同步关联计数。
- 首次导入按 slug 创建 `draft`；再次导入更新同一 draft ID，不创建重复文章。
- slug 已对应 `published` 文章时拒绝覆盖；所有创建和更新都再次强制 `status=draft`、`published_at=null`。
- 分类、标签、文章和关联写入位于同一事务，任何数据库异常均回滚。
- 命令成功只输出文章 ID、slug 与 `created`/`updated`；错误输出不包含文件路径、正文或 Front Matter 内容。
- 导入器不读取或修改 `PUBLIC_POST_SLUG_ALLOWLIST`，不会自动公开文章。

测试仅在 `tempfile.TemporaryDirectory` 中创建虚构英文正文，不含用户真实笔记、私有目录结构或私有仓库地址。当前环境未连接真实 PostgreSQL，也未执行真实私有笔记导入；该部分保留为人工验收步骤。

### 10.1 测试证据

| 命令 | 退出码 | 结果 |
|---|---:|---|
| `venv\Scripts\python.exe -m unittest tests.test_post_draft_import -v`（实现前） | 1 | 10/10 按预期失败，导入服务与命令尚不存在。 |
| `venv\Scripts\python.exe -m unittest tests.test_post_draft_import -v`（实现后） | 0 | 最终 12/12 通过，覆盖文件缺失、YAML 无效、slug 缺失、标题缺失/H1 回退、首次创建、重复更新、无重复文章、已发布拒绝、事务回滚、安全输出、参数校验和公开白名单不变。 |
| `venv\Scripts\python.exe -m unittest discover -s tests -v` | 0 | 56/56 通过。 |
| `venv\Scripts\python.exe -m compileall -q app tests` | 0 | 应用与测试模块可编译。 |
| `venv\Scripts\python.exe -m pip check` | 0 | `No broken requirements found.` |

## 11. Task 7 前台品牌与项目配置

新增 `Kirameku/config/site.ts`，集中保存锁定的公开站点身份、GitHub、邮箱、关闭状态的简历入口和三项状态快照。手机号、学校、具体年级均保持 `undefined`；配置中没有管理员登录名、私有仓库地址或简历文件。`getVisibleStatusSnapshotItems` 会裁剪文本并自动隐藏空项。

新增 `Kirameku/config/projects.ts`，三张项目卡片与后续详情页共享 `ProjectConfig`：

- `intern-pilot`：`已上线 · 持续迭代`，公开仓库和站内详情地址已配置，未虚构线上 demo 地址。
- `intern-pilot-harmonyos-agent`：`最小 Demo 验证中`，文案明确当前是 DevEco / HarmonyOS 最小链路验证，不包装成完整产品。
- `second-brain`：`文章整理中`，`repositoryPublic=false`，无仓库、详情或 demo 地址，当前不可点击。

配置模块提供启动时静态校验：slug 不得重复；公开仓库项目必须有有效 HTTP(S) 仓库地址；私有项目不得暴露仓库地址；demo 必须是有效外链，详情必须是站内路径；SecondBrain 必须保持私有且无跳转目标。`getProjectPrimaryAction` 严格按“有效 demo → 有效详情 → 无按钮”返回，`getProjectRepositoryUrl` 同时检查公开标记和 URL。

原 `app/projects/projectsData.ts` 已改为新配置的兼容导出，现有 `/projects` 页面同步使用新字段和仓库可见性函数，因此旧 HAXAtom、StarVid、原作者 Gitee/站点项目不再进入项目列表。旧 `siteConfig.ts` 作为尚未完成页面迁移的兼容层，身份、GitHub、邮箱、域名和备案字段已经引用或收敛到新品牌安全值；背景、音乐、头像等素材按任务边界留到 Task 12 集中处理。

项目封面路径预留在 `/brand/projects/`；Task 7 的现有项目页不渲染封面，因此构建无 404。真实 InternPilot 截图尚未选取或脱敏，不在本任务中提交；后续视觉任务不得用原作者封面或未脱敏截图替代。

### 11.1 测试证据

| 命令 | 退出码 | 结果 |
|---|---:|---|
| `pnpm test:config`（实现前） | 1 | 按预期失败：`config/site.ts` 与 `config/projects.ts` 尚不存在。 |
| `pnpm test:config`（实现后） | 0 | Node 内置测试 5/5 通过；有一条 `.ts` ESM 模块类型性能提示，不影响行为，未为消除提示而改变全项目模块类型。 |
| `pnpm exec tsc --noEmit` | 0 | 前台 TypeScript 检查通过。 |
| `pnpm exec eslint config/site.ts config/projects.ts app/projects/projectsData.ts app/projects/page.tsx tests/project-config.test.mjs` | 0 | 本任务文件 0 errors、0 warnings。 |
| `pnpm build` | 0 | Next.js 生产构建成功，39 个路由生成；后端未启动时 RSS 保留既有非阻塞 `ECONNREFUSED 127.0.0.1:8000` 日志。 |
