# Coding Agent 代码阅读学习计划

基于对 `packages/coding-agent` 目录的系统性探索，本计划帮助你逐步理解这个 terminal-based AI coding agent 的工作原理。整体学习周期约 8-12 天，建议每天投入 1-2 小时。

---

## 阶段 1：架构概览与核心概念

**目标**：建立整体理解，熟悉主要组件、数据流和启动流程。

### 第 1 天：项目结构与入口点

| 文件路径 | 学习重点 |
|---------|---------|
| `README.md` | 完整功能概述、使用方式、配置选项 |
| `package.json` | 依赖关系（pi-ai、pi-agent-core、pi-tui）、脚本命令 |
| `src/cli.ts` | CLI 入口点、参数解析逻辑 |

**核心问题**：
- Agent 有哪三种运行模式（interactive/print/RPC）？
- package.json 中的三个核心依赖分别负责什么？
- CLI 如何解析 `--provider`、`--model` 等参数？

### 第 2 天：SDK 接口与 AgentSession

| 文件路径 | 学习重点 |
|---------|---------|
| `src/index.ts` | SDK 导出内容，理解可编程 API |
| `src/core/agent-session.ts` | 核心类设计，理解生命周期管理 |
| `src/config.ts` | 配置加载和合并逻辑 |

**核心问题**：
- `createAgentSession()` 工厂函数的作用和参数？
- AgentSession 如何管理消息流和工具调用？
- 配置优先级（全局 vs 项目级）如何工作？

### 第 3 天：核心数据流

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/event-bus.ts` | 事件系统，理解组件间通信 |
| `src/core/index.ts` | 核心模块导出，模块关系 |
| `src/core/system-prompt.ts` | 系统提示词加载和构建 |

**核心问题**：
- 事件总线如何解耦各个组件？
- 系统提示词从哪里加载（优先级顺序）？
- 消息从用户输入到 LLM 调用的完整路径是什么？

**阶段 1 检查点**：能够回答以下问题
- [ ] 说出 AgentSession 的主要职责
- [ ] 描述一次完整的 "用户输入 → LLM 调用 → 工具执行 → 结果返回" 流程
- [ ] 解释三种运行模式的区别和适用场景

---

## 阶段 2：工具系统与 AI 集成

**目标**：深入理解工具定义、执行机制和 LLM 集成细节。

### 第 4 天：工具定义与执行

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/tools/read.ts` | read 工具实现，文件读取逻辑 |
| `src/core/tools/write.ts` | write 工具实现，文件写入逻辑 |
| `src/core/tools/edit.ts` | edit 工具实现，精确文本替换 |
| `src/core/exec.ts` | 工具执行引擎，封装和路由 |

**核心问题**：
- 工具参数如何定义和验证（使用 TypeBox）？
- read 工具对大文件如何处理（offset/limit/truncate）？
- edit 工具如何确保精确匹配（whitespace handling）？

### 第 5 天：Bash 工具与外部命令

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/tools/bash.ts` | bash 工具实现，命令执行和流式输出 |
| `src/utils/shell.ts` | Shell 封装，Windows 兼容处理 |
| `src/utils/tools-manager.ts` | 外部工具下载管理（fd、ripgrep） |

**核心问题**：
- bash 工具如何实现实时输出流式？
- 如何处理危险命令（如 rm -rf）？
- fd 和 ripgrep 何时下载，如何配置？

### 第 6 天：只读工具与模型管理

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/tools/grep.ts` | grep 工具，正则搜索实现 |
| `src/core/tools/find.ts` | find 工具，glob 模式匹配 |
| `src/core/tools/ls.ts` | ls 工具，目录列表 |
| `src/core/model-registry.ts` | 模型注册表，API key 解析 |

**核心问题**：
- grep 如何尊重 `.gitignore` 配置？
- find 和 ls 工具如何处理权限问题？
- 模型提供商（Anthropic、OpenAI 等）的配置格式？

### 第 7 天：LLM 集成与 Thinking 机制

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/completion.ts` | LLM 调用封装（依赖 pi-ai） |
| `src/core/agent-session.ts`（续） | thinking level 控制流 |
| 相关测试文件 | `test/agent-session*.test.ts` |

**核心问题**：
- thinking level（off → xhigh）如何影响 LLM 调用？
- 工具结果如何格式化为 LLM 可读的上下文？
- 多模型切换如何工作？

**阶段 2 检查点**：能够回答以下问题
- [ ] 描述 read/write/edit/bash 工具的核心逻辑
- [ ] 解释 .gitignore 如何影响工具搜索
- [ ] 说明 thinking level 对输出的影响

---

## 阶段 3：交互界面与状态管理

**目标**：理解 TUI 实现、Session 持久化和分支机制。

### 第 8 天：交互模式架构

| 文件路径 | 学习重点 |
|---------|---------|
| `src/modes/interactive/interactive-mode.ts` | TUI 主循环和状态机 |
| `src/modes/interactive/editor.ts` | 多行编辑器实现 |
| `src/core/keybindings.ts` | 快捷键绑定，Kitty 协议 |

**核心问题**：
- TUI 如何处理键盘输入和渲染循环？
- Shift+Enter vs Enter 如何区分？
- Ctrl+G 外部编辑器集成如何工作？

### 第 9 天：Session 管理与持久化

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/session-manager.ts` | Session 加载、保存、树遍历 |
| `src/core/session.ts` | Session 数据模型定义 |
| `test/session-manager/` | Session 管理测试用例 |

**核心问题**：
- JSONL 格式如何支持树形分支结构？
- `parentId` 字段的作用是什么？
- 分支切换时如何处理历史？

### 第 10 天：上下文压缩（Compaction）

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/compaction/compactor.ts` | 压缩主逻辑 |
| `src/core/compaction/context-builder.ts` | 上下文构建 |
| `test/compaction*.test.ts` | 压缩测试用例 |

**核心问题**：
- 何时触发自动压缩？
- 压缩如何选择保留的消息？
- 如何自定义压缩行为（通过扩展）？

### 第 11 天：主题与 UI 渲染

| 文件路径 | 学习重点 |
|---------|---------|
| `src/modes/interactive/theme/theme.ts` | 主题加载和应用 |
| `src/modes/interactive/theme/*.json` | 主题定义文件 |
| `docs/theme.md` | 主题创建指南 |

**核心问题**：
- 主题如何影响消息和工具输出渲染？
- 暗色/亮色主题如何自动检测？
- 如何创建自定义主题？

**阶段 3 检查点**：能够回答以下问题
- [ ] 描述 /tree 命令如何实现分支导航
- [ ] 解释 compaction 触发条件和保留策略
- [ ] 说明键盘事件从终端到 TUI 的处理流程

---

## 阶段 4：扩展性与高级功能

**目标**：理解扩展系统、Skills 机制和程序化集成。

### 第 12 天：扩展系统

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/extensions/extensions.ts` | 扩展加载和注册 |
| `src/core/extensions/*.ts` | 各扩展类型实现 |
| `examples/extensions/` | 扩展示例代码 |

**核心问题**：
- 如何注册自定义工具（`registerTool`）？
- `on("tool_call")` 事件拦截如何工作？
- 扩展如何访问 UI（confirm、notify 等）？

### 第 13 天：Skills 系统

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/skills.ts` | Skills 发现和加载 |
| `docs/skills.md` | Skills 规范和创建指南 |
| `test/skills.test.ts` | Skills 测试 |

**核心问题**：
- Skills 与扩展有何不同？
- 如何定义 SKILL.md 文件？
- Skills 何时被加载（按需 vs 显式请求）？

### 第 14 天：RPC 模式与程序化使用

| 文件路径 | 学习重点 |
|---------|---------|
| `src/modes/rpc/rpc-mode.ts` | RPC 模式实现 |
| `src/modes/rpc/rpc-types.ts` | RPC 协议类型定义 |
| `docs/rpc.md` | RPC 协议详细说明 |
| `examples/sdk/` | SDK 使用示例 |

**核心问题**：
- RPC 模式下如何通过 stdin/stdout 通信？
- `createAgentSession()` 的完整配置选项有哪些？
- 如何在 Node.js 应用中嵌入 Agent？

### 第 15 天：HTML 导出与其他功能

| 文件路径 | 学习重点 |
|---------|---------|
| `src/core/export-html/index.ts` | HTML 导出实现 |
| `src/core/export-html/template.*` | 导出模板 |
| `docs/export-html.md` | 导出功能说明 |

**核心问题**：
- HTML 导出如何保持会话的树形结构？
- 模板如何处理 markdown 和代码高亮？

**阶段 4 检查点**：能够回答以下问题
- [ ] 描述如何创建一个自定义命令（`registerCommand`）
- [ ] 解释 Skills 的动态加载机制
- [ ] 说明 RPC 模式下的 JSON 协议格式

---

## 推荐学习顺序

```
阶段 1（必读）
  ├─ README.md          # 概览
  ├─ src/index.ts       # SDK 接口
  └─ src/core/agent-session.ts  # 核心类

阶段 2（工具核心）
  ├─ src/core/tools/*.ts       # 工具实现
  └─ src/core/model-registry.ts # 模型管理

阶段 3（交互与持久化）
  ├─ src/modes/interactive/*.ts  # TUI
  └─ src/core/session-manager.ts  # Session

阶段 4（扩展）
  └─ src/core/extensions/*.ts     # 扩展系统
```

## 学习技巧

### 1. 结合测试理解边界情况
测试文件位于 `test/` 目录，是理解代码行为的最佳入口：
- `test/agent-session*.test.ts` - Agent 行为测试
- `test/session-manager/` - Session 操作测试
- `test/tools.test.ts` - 工具功能测试

### 2. 运行 SDK 示例
`examples/sdk/` 目录包含从简单到复杂的示例代码：
```bash
cd packages/coding-agent
npx tsx examples/sdk/01-basic.ts
```

### 3. 使用调试命令
在交互模式下使用 `/debug` 命令（隐藏）可输出：
- 渲染后的 ANSI 代码用于 TUI 调试
- 最后发送给 LLM 的完整消息列表

### 4. 依赖包文档
阅读相关依赖包的文档理解底层实现：
- `@mariozechner/pi-ai` - LLM 调用封装
- `@mariozechner/pi-agent-core` - Agent 抽象层
- `@mariozechner/pi-tui` - 终端 UI 组件

## 检查清单

完成学习后，你应该能够：

- [ ] 绘制完整的系统架构图（组件、数据流）
- [ ] 解释从用户输入到工具执行的完整流程
- [ ] 实现一个简单的自定义工具扩展
- [ ] 配置自定义模型提供商
- [ ] 理解并能够修改 compaction 行为
- [ ] 使用 SDK 在 Node.js 中嵌入 Agent
- [ ] 创建自定义主题

---

## 常见问题 FAQ

**Q: 代码量很大，从哪里开始？**
A: 从 `README.md` 和 `src/index.ts` 开始，建立整体概念后再深入具体模块。

**Q: 如何验证理解是否正确？**
A: 尝试修改某个工具的行为，或添加一个简单的扩展，通过测试验证理解。

**Q: 遇到不理解的设计决策怎么办？**
A: 查看 `docs/` 目录中的设计文档，或搜索 CHANGELOG 了解历史背景。

**Q: 如何跟踪版本变化？**
A: 查看 `CHANGELOG.md` 了解新功能和问题修复。

---

*最后更新：2026-01-09*
