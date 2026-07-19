# Kirameku-li 第三阶段 Codex 执行任务

> **For agentic workers:** 按任务逐项执行，每个任务都必须完成“先验证现状或写失败测试 → 最小实现 → 测试 → 小提交”。  
> 必读设计：`docs/03-original-author-cleanup-and-basic-personalization-design.md`

**Goal:** 清理原作者运行时身份，建立后端统一的公共内容访问边界，并完成 `Kirameku · 晚` 的基础品牌、首页、项目页、关于页、后台品牌和本地管理工具。

**Architecture:** 后端是公共内容可见性的唯一安全边界；前端通过公共配置接口决定导航与模块显示；项目和个人状态使用类型化配置；历史数据保留在数据库和管理后台；私有 SecondBrain 只通过本地 Markdown 导入命令写入草稿。

**Tech Stack:** 现有 Next.js 前台、现有 Python/FastAPI 后端、现有独立管理后台、PostgreSQL、项目现有测试工具、pnpm。

---

## 0. 强制约束

- 从最新 `main` 创建新分支：`feat/original-author-cleanup-basic-personalization`
- 不直接在 `main` 开发。
- 不合并 `main`。
- 不修改或公开 `second-brain` 私有仓库。
- 不删除数据库历史文章、动态、相册和统计。
- 不把历史数据批量改成草稿。
- 不删除 LICENSE、NOTICE、Git 历史或必要上游署名。
- 不公开手机号、学校、具体年级、私有仓库和后台账号。
- 不保留默认管理员账号或密码。
- 不使用原作者歌单、头像、Logo、个人项目封面或 Live2D。
- 不使用《鸣潮》角色、Logo、截图或其他受版权保护素材。
- 包管理统一使用 `pnpm`，不得新增 npm/yarn lockfile。
- 不顺手重构无关模块。
- 不清理全仓库历史 lint 债务；只保证本次修改不新增错误。
- 每个阶段做独立提交，提交信息使用英文 Conventional Commits。
- 所有路径必须先按实际仓库核对；若与本计划示例不同，在执行报告中记录真实映射，不得凭空新建重复模块。

---

## Task 1：建立基线、路径映射和原作者信息审计

### 目标

确认三个子项目当前可运行命令，建立本阶段文件映射，并输出可复查的原作者信息清单。

### 操作

- [ ] 从最新 `main` 创建分支：

```powershell
git checkout main
git pull origin main
git checkout -b feat/original-author-cleanup-basic-personalization
```

- [ ] 检查工作区：

```powershell
git status --short
```

预期：没有未提交修改。

- [ ] 阅读：
  - 根目录 README
  - 现有 `docs` 中前两阶段设计与报告
  - 三个子项目的 package / dependency / env 文件
  - 现有启动与测试脚本

- [ ] 建立路径映射表，至少包含：
  - 公共前台根目录
  - 后端根目录
  - 管理后台根目录
  - 前台站点配置
  - Header / Footer
  - 首页组件
  - 文章列表和详情
  - 动态列表和详情
  - 相册列表和详情
  - 公共统计
  - 后端 public/admin 路由
  - 用户模型和初始化 SQL
  - 前端与后台静态资源
  - README / LICENSE / NOTICE

- [ ] 搜索原作者运行时信息：

```powershell
git grep -n -I -E "Starhiro|hiromu\.top|guh982719@gmail\.com|17943739323|hong\.jpg|gitee\.com/hongzyh|github\.com/Xinghongia"
```

- [ ] 搜索账号、默认密码和初始化用户：

```powershell
git grep -n -I -E "default.*admin|demo.*user|admin.*password|INSERT INTO.*user|create.*admin"
```

- [ ] 将结果分类为：
  1. 必须删除的运行时身份
  2. 必须替换的个性化内容
  3. 允许保留的 LICENSE / README 上游署名
  4. 需要人工判断的通用素材

- [ ] 运行当前基线验证。优先使用前两阶段已验证命令；至少覆盖：
  - 公共前台安装/构建
  - 后端测试
  - 管理后台类型检查/构建

- [ ] 把基线结果和路径映射写入执行报告草稿：
  `docs/03-original-author-cleanup-and-basic-personalization-report.md`

### 完成标准

- 路径映射完整。
- 原作者命中项全部分类。
- 基线命令和结果有记录。
- 尚未修改业务代码。

### Commit

```powershell
git add docs/03-original-author-cleanup-and-basic-personalization-report.md
git commit -m "docs: audit legacy author references"
```

---

## Task 2：增加后端公共站点配置

### 目标

后端成为文章、动态、相册公开开关的唯一配置源。

### 配置

在后端设置模型中增加：

```env
PUBLIC_POSTS_ENABLED=false
PUBLIC_POST_SLUG_ALLOWLIST=
PUBLIC_CHATTERS_ENABLED=false
PUBLIC_ALBUMS_ENABLED=false
PUBLIC_STATS_NAMESPACE=kirameku-wan-v1
SITE_LAUNCH_DATE=
```

### 接口

按项目现有路由规范新增只读接口，语义等价于：

```http
GET /api/site/public-config
```

响应只包含：

```json
{
  "contentVisibility": {
    "posts": false,
    "chatters": false,
    "albums": false
  },
  "siteStats": {
    "launchDateConfigured": false
  }
}
```

不要把白名单原值、环境变量名、管理员配置或后台信息返回前端。

### 测试

- [ ] 先写设置解析测试：
  - 布尔值默认 false
  - 白名单按逗号解析
  - 去除空格和空项
  - 重复 slug 去重
  - 空上线日期为未配置
  - 无效日期不导致应用崩溃

- [ ] 写接口测试：
  - 无认证可以读取
  - 响应没有敏感字段
  - 字段类型稳定

- [ ] 实现最小设置模型、解析器和接口。

- [ ] 更新 `.env.example`，每个变量写明语义和默认安全值。

### 完成标准

- 后端配置解析有测试。
- 公共接口可用。
- 不泄露白名单和后台设置。
- 前端尚未自行复制安全开关。

### Commit

```powershell
git add .
git commit -m "feat: add public site visibility config"
```

---

## Task 3：统一公共内容访问控制

### 目标

旧文章、动态和相册不能通过公共 API、页面详情、搜索、分类或统计绕过开关访问；管理员接口保持不变。

### 文章可见性函数

在后端公共内容服务层建立一个唯一判断入口，语义必须为：

```python
def is_post_public(post, settings) -> bool:
    if post.status != "published":
        return False
    if settings.public_posts_enabled:
        return True
    return post.slug in settings.public_post_slug_allowlist
```

实际代码必须适配现有文章状态和 ORM 类型，不允许在多个路由复制判断。

### 测试矩阵

- [ ] `posts=true` + published → 可见
- [ ] `posts=true` + draft → 不可见
- [ ] `posts=false` + allowlist 命中 + published → 可见
- [ ] `posts=false` + allowlist 命中 + draft → 不可见
- [ ] `posts=false` + allowlist 未命中 → 不可见
- [ ] 非公开详情 → 404
- [ ] 列表只返回公开文章
- [ ] 分类只返回有公开文章的分类
- [ ] 分类计数只计算公开文章
- [ ] 搜索只返回公开文章
- [ ] 首页最新文章只返回公开文章
- [ ] 公共统计不泄露历史文章数量
- [ ] 管理员列表与详情仍可读取历史内容

### 动态与相册

- [ ] 关闭时公共列表返回空集合或项目现有空分页结构。
- [ ] 关闭时公共详情返回 404。
- [ ] 关闭时公共统计不返回历史数量。
- [ ] 管理员 API 不受影响。

### 其他出口

检查并处理现有项目实际包含的：

- RSS
- sitemap
- metadata 生成
- 相关文章
- 标签页
- 分类页
- 搜索建议
- 首页 Dashboard

不存在的功能不要新建。

### 完成标准

- 所有公共出口复用统一判断。
- 旧内容无法通过直接 URL 或 API 读取。
- 管理员后台仍能访问历史数据。
- 关键矩阵自动化测试通过。

### Commit

```powershell
git add .
git commit -m "feat: enforce public content visibility"
```

---

## Task 4：隔离公开访问统计

### 目标

保留旧统计，但公开访问量从新命名空间重新累计。

### 规则

- 使用 `PUBLIC_STATS_NAMESPACE=kirameku-wan-v1`
- 公开计数的存储键或数据库维度必须包含 namespace
- 旧数据不迁移、不删除
- 管理员完整统计保持可用
- `SITE_LAUNCH_DATE` 为空或无效时，公共响应不返回可计算运行时间
- 有效日期才显示运行时间

### 测试

- [ ] 新 namespace 初始值为 0
- [ ] 旧 namespace 有值时不影响新 namespace
- [ ] 新访问只增加新 namespace
- [ ] 无日期时 `launchDate` 为 null 或明确未配置
- [ ] 有效日期正常
- [ ] 无效日期不会导致 500
- [ ] 公开统计不返回文章、动态、相册历史数量

### 完成标准

- 历史数据仍存在。
- 新公开访问量从 0 计数。
- 未配置日期时前端可隐藏运行时间。

### Commit

```powershell
git add .
git commit -m "feat: isolate public site statistics"
```

---

## Task 5：删除默认管理员并增加安全创建命令

### 目标

仓库不再包含原作者或演示管理员初始化，管理员由本地交互命令创建。

### 测试

- [ ] 检查初始化 SQL / seed 不再创建默认账号。
- [ ] 测试成功创建管理员。
- [ ] 测试重复用户名失败。
- [ ] 测试重复邮箱失败。
- [ ] 测试密码不一致失败。
- [ ] 测试密码哈希不是明文。
- [ ] 测试创建结果具有管理员标记或角色。
- [ ] 日志和输出不包含密码。

### 命令

```powershell
python -m app.scripts.create_admin
```

要求：

- 使用隐藏输入。
- 二次确认密码。
- 不接受密码命令行参数。
- 用户名、邮箱由用户输入。
- 成功只输出用户名、邮箱和创建结果。
- 使用项目现有用户服务和密码哈希实现，避免复制认证逻辑。

### 文档

在后端开发说明中加入：

1. 初始化数据库
2. 执行创建管理员命令
3. 启动后台
4. 登录 `/admin`

### 完成标准

- 无默认账号。
- 交互创建成功。
- 密码安全。
- 文档可照做。

### Commit

```powershell
git add .
git commit -m "feat: add secure admin bootstrap command"
```

---

## Task 6：增加私有 Markdown 草稿导入命令

### 目标

把 SecondBrain 中的本地 Markdown 安全导入数据库草稿，但不把 Markdown 提交到公开仓库。

### 命令

```powershell
python -m app.scripts.import_post_draft "D:\...\我的 SecondBrain 工作流.md"
```

### 解析规则

Front Matter：

```yaml
title: 我的 SecondBrain 工作流
slug: my-second-brain-workflow
summary: 我如何用 Obsidian、ChatGPT 与 Codex 管理学习和项目。
category: 方法与实践
tags:
  - SecondBrain
  - Obsidian
  - AI 协作
  - 开发工作流
```

- `slug` 首次导入必填。
- `title` 缺失时读取第一个 H1。
- `summary/category/tags` 从 Front Matter 读取。
- 首次按 slug 创建 draft。
- 再次按 slug 更新同一 draft。
- 已发布文章拒绝覆盖。
- 不自动发布。
- 不修改公开白名单。
- 使用事务。

### 测试

使用临时目录和虚构正文，禁止复制用户真实私有笔记。

- [ ] 文件不存在 → 失败
- [ ] Front Matter 无效 → 失败
- [ ] 缺少 slug → 失败
- [ ] 标题可从 H1 补全
- [ ] 首次导入创建 draft
- [ ] 再次导入更新同一 ID
- [ ] 不创建重复文章
- [ ] 已发布文章拒绝覆盖
- [ ] 异常时事务回滚
- [ ] 输出不包含完整正文

### 完成标准

- 命令可重复执行。
- 永远不会自动发布。
- 真实 Markdown 不进入 Git。
- 测试覆盖主要失败分支。

### Commit

```powershell
git add .
git commit -m "feat: add private markdown draft importer"
```

---

## Task 7：建立前台品牌配置与项目配置

### 目标

把身份、状态快照、联系方式、简历入口和项目数据从页面组件中分离为类型化配置。

### 品牌配置

统一配置：

```ts
export const siteBrand = {
  title: "Kirameku · 晚",
  nickname: "晚",
  subtitle: "在代码、灵感与生活之间寻找共鸣",
  identity: "晚｜软件工程学生｜Java 全栈与 AI 工程方向",
  github: "https://github.com/wan719",
  email: "3425446714@qq.com",
  phone: undefined,
  school: undefined,
  grade: undefined,
  resume: {
    enabled: false,
    url: "",
  },
  statusSnapshot: {
    current: "InternPilot 鸿蒙求职 Agent 最小 Demo",
    learning: "HarmonyOS、ArkTS 与 Agent 工程化",
    next: "整理 SecondBrain 工作流文章",
  },
} as const;
```

不要加入手机号字段的真实值。

### 项目配置

建立一个类型化配置文件并由列表/详情共用：

- InternPilot
- InternPilot 鸿蒙求职 Agent
- SecondBrain 知识库

严格使用设计文档中的状态和链接规则。

### 测试或静态校验

- [ ] 无重复 slug
- [ ] 公开仓库项目必须有 repositoryUrl
- [ ] 私有 SecondBrain 不得有 repositoryUrl
- [ ] SecondBrain 不得有 detailUrl 或 demoUrl
- [ ] demoUrl 优先于 detailUrl 的按钮选择函数有测试
- [ ] 空状态项自动隐藏

### 完成标准

- 页面组件不再散落原作者账号与文案。
- 项目卡片和详情页使用同一数据。
- 私有信息不进入配置。

### Commit

```powershell
git add .
git commit -m "feat: add personalized site and project config"
```

---

## Task 8：实现 Header、Footer、主题与基础品牌素材

### 目标

完成 `Kirameku · 晚` 的全站框架，不重写业务页面。

### Logo

创建：

```text
logo-icon.svg
logo-wordmark.svg
favicon.svg
favicon.ico
```

要求：

- 原创 SVG
- 手写“晚”与共鸣环
- 小尺寸仍可识别
- 不把整张品牌展示板裁成 Logo
- 不嵌入外部字体文件
- 提供 aria-label 或替代文本

### Header

- 桌面：完整字标
- 移动：图标 + 抽屉
- 导航顺序：首页、项目、文章、关于
- 不显示动态、相册和后台
- 键盘可操作
- 抽屉开关具有 aria 属性

### Footer

- 品牌、副标题、GitHub、邮箱
- 上游致谢与 LICENSE
- 未配置时不显示域名/ICP/萌备案/运行时间

### 主题

- 默认跟随系统
- 可手动切换
- 保存选择
- 浅色纸张感
- 深色夜空感
- 支持 reduced motion

### 验证

- [ ] 前台类型检查或构建通过
- [ ] 桌面和移动导航无断裂
- [ ] 主题切换可持久化
- [ ] reduced motion 生效
- [ ] favicon 和 metadata 使用新品牌
- [ ] 页面不引用原 Logo

### Commit

```powershell
git add .
git commit -m "feat: apply Kirameku Wan brand shell"
```

---

## Task 9：重构首页为已锁定结构

### 目标

首页展示品牌首屏、状态快照、三个项目、文章入口、站点信息和歌单整理中状态。

### 首页顺序

1. Hero
2. 状态快照
3. 重点项目
4. 文章入口
5. 站点信息
6. 音乐整理中状态（按现有布局合理放置）

### 行为

- Hero 按设计文案展示。
- “查看项目”进入项目区或 `/projects`。
- “阅读文章”进入 `/posts`。
- 三个项目来自统一配置。
- SecondBrain 卡片不可点击。
- 首页公共数据基于后端 `/api/site/public-config`。
- 动态、照片墙、DogDiary、相册默认不渲染，但代码保留。
- 未配置歌单时不发起旧歌单请求。
- 文章为空时显示已确认文案和两个按钮。
- 站点信息只显示新访问量和可选运行时间。

### 测试/验证

- [ ] 后端不可用时有安全降级，不回退展示旧内容。
- [ ] public config 关闭时不渲染对应模块。
- [ ] 空文章状态文案正确。
- [ ] 不显示历史统计数字。
- [ ] 无歌单时没有旧歌单请求。
- [ ] 首页在常见移动宽度不横向溢出。

### Commit

```powershell
git add .
git commit -m "feat: rebuild personalized homepage"
```

---

## Task 10：实现项目列表和两个详情页

### 路由

```text
/projects
/projects/intern-pilot
/projects/intern-pilot-harmonyos-agent
```

### 页面内容

统一模板：

- 封面和状态
- 背景
- 问题
- 技术栈
- 核心能力
- 当前进度
- 开发历程
- 后续计划
- 演示/源码按钮

### 约束

- InternPilot：`已上线 · 持续迭代`
- 鸿蒙 Agent：`最小 Demo 验证中`
- 不把鸿蒙项目写成已完成
- 不运行时抓取 GitHub README
- SecondBrain 不创建虚假详情页
- 未知 slug 返回 404

### 验证

- [ ] 项目列表三个卡片正常。
- [ ] 两个详情页可构建。
- [ ] 未知 slug 404。
- [ ] 外链安全。
- [ ] 按钮优先级正确。
- [ ] SecondBrain 无链接。

### Commit

```powershell
git add .
git commit -m "feat: add project showcase pages"
```

---

## Task 11：重写文章空状态与关于页

### 文章页

公共文章列表只消费后端过滤后的结果。

无文章时显示：

```text
这里会记录代码、灵感与成长，内容正在慢慢整理。
```

按钮：

- 查看项目
- 关于我

不得显示分类中的旧文章数量。

### 关于页

结构：

1. 简短自述
2. 个人定位
3. Java 全栈、AI 工程、HarmonyOS
4. 三个代表项目
5. ChatGPT + Codex + Obsidian 工作流
6. 当前状态
7. GitHub 和邮箱
8. 默认关闭的简历入口

交互：

- `mailto:3425446714@qq.com`
- 复制邮箱
- 复制成功/失败反馈
- 不展示手机号、学校、年级、私有仓库

### 验证

- [ ] 文章空状态正确。
- [ ] 两个按钮正确。
- [ ] 关于页没有原作者文字。
- [ ] 邮箱复制可用。
- [ ] 简历入口默认不渲染。
- [ ] 键盘操作正常。

### Commit

```powershell
git add .
git commit -m "feat: personalize posts and about pages"
```

---

## Task 12：清理音乐、旧模块入口和原作者个人素材

### 音乐

- 移除原歌单 ID。
- 未配置歌单时显示“歌单整理中”。
- 不请求旧歌单。
- 保留未来接入能力。

### 路由

- 动态和相册不出现在 Header、首页、Footer。
- 直接访问关闭模块的公共路由时返回 404。
- 不删除管理后台对应功能。

### 素材

删除确认属于原作者个人身份的：

- 头像
- Logo
- 项目封面
- Live2D / 看板娘专属素材
- 带原域名、账号或名称的图片

删除前：

```powershell
git grep -n -I "待删除文件名"
```

删除后再次验证没有引用。

### 完成标准

- 构建不因删除资源失败。
- 管理后台历史内容功能仍存在。
- 公共站点没有旧模块入口和原素材。

### Commit

```powershell
git add .
git commit -m "chore: remove legacy author assets and public modules"
```

---

## Task 13：后台品牌清理

### 目标

不重构后台，只统一身份。

### 修改

- 登录页：`Kirameku · 晚`
- 侧边栏：新 Logo / 名称
- 浏览器标题
- favicon
- 移除原作者账号、邮箱和站点外链
- 不在登录页展示默认管理员提示
- 不弱化认证和权限

### 验证

- [ ] 管理后台安装、类型检查、构建通过。
- [ ] 登录页无原作者信息。
- [ ] 侧边栏无原作者信息。
- [ ] 无默认账号提示。
- [ ] `/admin` 仍需要认证。

### Commit

```powershell
git add .
git commit -m "chore: rebrand admin console"
```

---

## Task 14：README、上游署名和开发文档

### README

更新：

- 项目名称与简介
- 三个重点项目
- 当前公开内容策略
- 本地启动入口
- 管理员创建命令
- 草稿导入命令
- 环境变量说明
- 上游致谢

必须保留 LICENSE 和上游信息。

建议致谢：

```markdown
## Upstream attribution

Kirameku-li is a personalized fork and continued development of Kirameku.
The original license and upstream attribution are preserved.
```

链接使用仓库实际上游地址。

### 环境变量说明

明确：

- 文章开关
- 白名单
- 动态/相册开关
- 统计 namespace
- 上线日期
- 音乐歌单（如项目使用）
- 简历开关（如放在前端环境）

### 完成标准

- 新开发者能按 README 启动。
- 不包含默认密码。
- 不错误宣称项目完全原创。
- 不公开 SecondBrain 路径。

### Commit

```powershell
git add .
git commit -m "docs: document personalized site workflow"
```

---

## Task 15：全量验证与执行报告

### 代码检查

重复原作者搜索：

```powershell
git grep -n -I -E "Starhiro|hiromu\.top|guh982719@gmail\.com|17943739323|hong\.jpg|gitee\.com/hongzyh|github\.com/Xinghongia"
```

对每个剩余结果分类：

- LICENSE / NOTICE
- README 上游致谢
- 必须修复的运行时残留

不允许用简单“0 命中”判断上游署名，因为上游链接应被保留。

### 测试

使用仓库在 Task 1 核实的真实命令，至少完成：

- 后端全部测试
- 后端启动烟雾测试
- 公共前台安装/类型检查或 lint（按现有脚本）
- 公共前台生产构建
- 公共前台启动烟雾测试
- 管理后台安装
- 管理后台类型检查
- 管理后台生产构建
- 管理后台启动烟雾测试

### HTTP 验收

至少验证：

- `/`
- `/projects`
- `/projects/intern-pilot`
- `/projects/intern-pilot-harmonyos-agent`
- `/posts`
- `/about`
- `/admin`
- 关闭的动态路由
- 关闭的相册路由
- 一个旧文章详情
- 公共站点配置接口
- 公共统计接口

预期：

- 公共页面 200
- 关闭模块和旧详情 404
- `/admin` 未认证不可进入业务页面
- 公共文章列表为空
- 管理员接口仍可管理历史内容

### 报告

完成：

`docs/03-original-author-cleanup-and-basic-personalization-report.md`

必须包含：

1. 分支与提交列表
2. 修改文件概览
3. 原作者清理清单
4. 允许保留的上游命中
5. 公共访问控制矩阵
6. 新环境变量
7. 管理员命令验证
8. 草稿导入验证
9. 前台页面验证
10. 后台验证
11. 自动化测试结果
12. 未完成项与原因
13. 已知技术债
14. 用户手动验收步骤

### 最终检查

```powershell
git status --short
git log --oneline --decorate -15
```

预期：

- 工作区干净
- 所有修改已提交
- 当前分支不是 main

### 最终要求

- 不合并 main。
- 不创建 Release。
- 不部署生产。
- 不修改 SecondBrain。
- 把报告和提交 SHA 返回给用户，等待 ChatGPT 复查。

### Final Commit

报告如有最后更新：

```powershell
git add docs/03-original-author-cleanup-and-basic-personalization-report.md
git commit -m "docs: report phase three implementation"
```

---

## Codex 最终回复格式

```markdown
# 第三阶段执行结果

## 1. 分支与提交
- 分支：
- 提交：

## 2. 已完成
- 

## 3. 公共访问控制
- 文章：
- 动态：
- 相册：
- 统计：
- 管理员后台：

## 4. 品牌与页面
- 首页：
- 项目：
- 文章：
- 关于：
- 后台：

## 5. 本地工具
- create_admin：
- import_post_draft：

## 6. 原作者信息清理
- 已删除：
- 已替换：
- 允许保留的上游署名：

## 7. 验证结果
- 后端测试：
- 前台构建：
- 前台烟雾测试：
- 管理后台 typecheck：
- 管理后台构建：
- HTTP 路由：

## 8. 未完成与风险
- 

## 9. 用户手动验收步骤
1. 
```