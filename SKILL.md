---
name: skill-factory
description: 生成其他Claude Code Skills。当用户想要创建新的Skill、需要自动化Skill开发或学习Skill设计模式时使用此Skill。根据用户提供的Skill描述自动生成完整的Skill包，包括SKILL.md文件、工具配置、示例和文档。
allowed-tools: Read, Write, Edit, Glob
user-invocable: true
---

# Skill Factory - 技能工厂

## 概述
Skill Factory 是一个元技能（meta-skill），用于自动生成其他 Claude Code Skills。您提供新Skill的描述，本Skill将生成完整的Skill包，包括SKILL.md文件、工具配置、示例代码和文档。

## 快速开始

### 生成基本Skill
告诉我您想要创建什么Skill：
```
我想创建一个代码审查助手，能够分析代码质量、检测常见错误、提供改进建议。
```

我将为您生成：
1. 完整的SKILL.md文件
2. 工具权限配置
3. 使用示例
4. 必要的支持文件

### 提供Skill描述格式
为了获得最佳结果，请提供以下信息：

```yaml
技能名称: code-review-helper
描述: 自动化代码审查工具，检测代码质量问题并提供改进建议
主要功能: 代码质量分析和优化建议
目标用户: 开发者、学生
所需工具: Read, Edit, Bash
使用场景: 个人项目代码审查、学习代码最佳实践
```

## 生成流程

### 步骤1：分析需求
我分析您的Skill描述，确定：
- 技能类型（协调器、专业工具、集成器、分析器）
- 需要的工具权限
- 最佳实践和模式

### 步骤2：生成SKILL.md
基于您的描述创建符合Claude Code标准的SKILL.md文件：

```markdown
---
name: code-review-helper
description: 自动化代码审查工具，检测代码质量问题并提供改进建议。当用户需要分析代码质量、查找潜在错误或学习代码最佳实践时使用。
allowed-tools: Read, Edit, Bash
---

# 代码审查助手

## 使用说明
1. 选择要审查的代码文件或目录
2. 我分析代码结构、风格和潜在问题
3. 提供详细的改进建议和最佳实践示例

## 支持的代码类型
- Python, JavaScript/TypeScript, Java, Go, C++
- 配置文件 (JSON, YAML, XML)
- 脚本文件 (Shell, PowerShell)
```

### 步骤3：创建支持文件
如果需要，创建额外的支持文件：
- `参考文档.md` - 详细API和最佳实践
- `示例/` - 使用示例
- `脚本/` - 辅助脚本

## 技能类型模板

### 1. 协调器技能
用于管理多个子技能的元技能：
```yaml
技能类型: coordinator
特点: 状态管理、工作流协调
示例: Vibe Writing 协调器、工作流引擎
```

### 2. 专业工具技能
特定领域的专业工具：
```yaml
技能类型: specialist
特点: 领域算法、专业功能
示例: 代码审查助手、文档分析器
```

### 3. 集成器技能
集成外部工具和服务：
```yaml
技能类型: tool-integration
特点: API集成、数据转换
示例: Git集成器、数据库连接器
```

### 4. 分析器技能
数据分析和学习：
```yaml
技能类型: learning-analytics
特点: 数据分析、模式识别
示例: 代码质量分析器、学习进度跟踪器
```

## 详细参考

### 工具权限配置指南
根据Skill功能推荐工具权限：

| 技能类型 | 推荐工具 | 安全级别 |
|----------|----------|----------|
| 只读分析 | Read, Glob, Grep | 低 |
| 代码编辑 | Read, Edit, Bash | 中 |
| 系统操作 | Bash, Read, Write | 高 |
| 网络访问 | WebFetch, WebSearch | 中 |
| 协调管理 | Read, Write, Context | 高 |

### 描述编写最佳实践
有效的Skill描述应包含：
1. **具体功能**：明确Skill能做什么
2. **触发场景**：用户会如何表达需求
3. **关键词**：用户可能使用的搜索词
4. **限制条件**：Skill的适用范围

**示例**：
```
✅ 好的描述: "提取PDF文件中的文本和表格，填写表单，合并文档。当用户处理PDF文件、表单或文档提取时使用。"
❌ 差的描述: "帮助处理文档"
```

### 渐进式披露模式
对于复杂Skills，使用渐进式披露：

```markdown
## 快速开始
[基本使用说明]

## 详细文档
- 完整API参考: [reference.md](reference.md)
- 使用示例: [examples.md](examples.md)
- 高级功能: [advanced.md](advanced.md)

## 实用脚本
运行验证脚本:
```bash
python scripts/validate.py input.txt
```
```

## 示例生成

### 示例1：生成代码审查助手
**您的输入**：
```
创建一个代码审查助手，能够：
- 分析Python和JavaScript代码质量
- 检测常见错误和反模式
- 提供具体的改进建议
- 支持批量文件审查
```

**我将生成**：
```
~/.claude/skills/code-review-helper/
├── SKILL.md              # 主要Skill文件
├── reference.md          # 代码检查规则参考
├── examples/            # 使用示例
│   ├── basic-review.md
│   └── advanced-analysis.md
└── scripts/             # 实用脚本
    └── code-check.py
```

### 示例2：生成文档格式化器
**您的输入**：
```
创建一个文档格式化器，能够：
- 统一Markdown格式
- 检查拼写和语法
- 优化标题层次
- 添加目录
```

**生成的文件结构**：
```
~/.claude/skills/document-formatter/
├── SKILL.md
├── formatting-rules.md
└── examples/
    ├── basic-formatting.md
    └── template-styles.md
```

## 故障排除

### Skill不触发
如果生成的Skill不自动触发：
1. **检查描述**：确保描述包含用户会使用的关键词
2. **测试触发**：使用描述中的关键词提问
3. **简化描述**：过于复杂的描述可能难以匹配

### 工具权限问题
如果Skill无法访问需要的工具：
1. **检查allowed-tools**：确保列出所有需要的工具
2. **权限升级**：部分工具可能需要额外授权
3. **替代方案**：使用权限较低的工具完成类似功能

### 性能优化
如果生成的Skill响应慢：
1. **减少前置内容**：保持SKILL.md简洁
2. **使用渐进式披露**：将详细内容移到支持文件
3. **优化脚本**：确保辅助脚本高效运行

## 最佳实践

### 设计原则
1. **单一职责**：每个Skill专注于一个特定功能
2. **明确描述**：描述清晰说明功能和触发条件
3. **最小权限**：只请求必要的工具访问
4. **渐进式披露**：保持主文件简洁，详细内容分开

### 开发流程
1. **原型设计**：先用简单的SKILL.md测试核心功能
2. **逐步完善**：根据需要添加支持文件
3. **测试验证**：在不同场景下测试Skill触发和执行
4. **文档完善**：提供清晰的示例和故障排除指南

### 质量检查清单
- [ ] 描述是否清晰具体？
- [ ] 工具权限是否最小必要？
- [ ] 是否有使用示例？
- [ ] 是否支持渐进式披露？
- [ ] 是否包含故障排除指南？

## 开始创建

告诉我您想要创建什么Skill，我将为您生成完整的Skill包。

**提示**：您可以说：
- "我想创建一个用于代码审查的Skill"
- "帮我生成一个文档处理Skill"
- "创建一个项目管理协调器"
- "设计一个数据分析工具"

或者直接提供详细的Skill描述。