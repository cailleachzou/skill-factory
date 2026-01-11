# Skill Factory 基础使用示例

## 示例1：生成代码审查助手

### 输入参数
```json
{
  "skill_name": "code-review-helper",
  "skill_type": "specialist",
  "description": "一个代码审查助手，能够自动分析代码质量、检测常见错误、提供改进建议",
  "primary_function": "自动化代码质量检查和优化建议",
  "target_users": "开发者、学生、代码学习者",
  "tools_needed": ["read", "edit", "bash", "context"],
  "use_cases": [
    "个人项目代码审查",
    "学习代码最佳实践",
    "团队代码质量检查",
    "教学示例分析"
  ],
  "output_format": "full-package"
}
```

### 调用方式
```bash
# 使用 Claude Code 调用技能工厂
skill-factory --input '{
  "skill_name": "code-review-helper",
  "skill_type": "specialist",
  "description": "一个代码审查助手...",
  "primary_function": "自动化代码质量检查和优化建议",
  "target_users": "开发者、学生、代码学习者",
  "tools_needed": ["read", "edit", "bash", "context"],
  "use_cases": ["个人项目代码审查", "学习代码最佳实践"],
  "output_format": "full-package"
}'
```

### 生成的技能结构
```
generated-skills/code-review-helper/
├── skill-definition/
│   └── skill.json           # 技能定义文件
├── tools/
│   ├── tools.json           # 工具配置文件
│   └── code-analysis.js     # 代码分析工具实现
├── examples/
│   ├── basic-review.md      # 基础使用示例
│   └── advanced-analysis.md # 高级分析示例
├── tests/
│   ├── unit-tests.js        # 单元测试
│   └── integration-tests.js # 集成测试
├── docs/
│   ├── README.md            # 使用文档
│   └── API-reference.md     # API参考
└── implementation.md        # 实现说明
```

### 生成的 skill.json 内容（摘要）
```json
{
  "name": "code-review-helper",
  "version": "0.1.0",
  "description": "一个代码审查助手，能够自动分析代码质量、检测常见错误、提供改进建议",
  "author": "Skill Factory",
  "tools": [
    {
      "name": "read",
      "description": "读取代码文件",
      "permissions": ["files:read"]
    },
    {
      "name": "edit",
      "description": "编辑代码建议",
      "permissions": ["files:edit"]
    },
    {
      "name": "bash",
      "description": "执行代码分析命令",
      "permissions": ["system:execute"]
    },
    {
      "name": "context",
      "description": "管理审查上下文",
      "permissions": ["context:read", "context:write"]
    }
  ],
  "input_schema": {
    "type": "object",
    "properties": {
      "code_path": {
        "type": "string",
        "description": "要审查的代码文件或目录路径"
      },
      "language": {
        "type": "string",
        "description": "编程语言",
        "enum": ["python", "javascript", "java", "cpp", "go"]
      },
      "check_level": {
        "type": "string",
        "description": "审查深度",
        "enum": ["basic", "standard", "deep"],
        "default": "standard"
      }
    }
  }
}
```

### 使用生成的技能
```bash
# 使用生成的代码审查助手
code-review-helper code_path="./src/" language="python" check_level="standard"
```

### 预期输出
```json
{
  "summary": {
    "files_analyzed": 15,
    "issues_found": 8,
    "suggestions": 12
  },
  "issues": [
    {
      "file": "src/utils.py",
      "line": 42,
      "type": "style",
      "message": "变量命名不规范，建议使用更有描述性的名称",
      "suggestion": "将 'x' 改为 'user_count'"
    }
  ],
  "quality_score": 85,
  "recommendations": [
    "添加类型注解以提高代码可读性",
    "考虑将大型函数拆分为更小的函数",
    "添加单元测试覆盖核心功能"
  ]
}
```

---

## 示例2：生成文档分析器

### 输入参数
```json
{
  "skill_name": "doc-analyzer",
  "skill_type": "learning-analytics",
  "description": "分析文档内容，提取关键信息，评估文档质量，提供改进建议",
  "primary_function": "文档质量分析和优化建议",
  "target_users": "写作者、学生、内容创作者",
  "tools_needed": ["read", "webfetch", "context"],
  "use_cases": [
    "学术论文质量检查",
    "技术文档评估",
    "学习材料分析",
    "内容质量优化"
  ],
  "output_format": "minimal"
}
```

### 生成的技能结构（精简版）
```
generated-skills/doc-analyzer/
├── skill-definition/
│   └── skill.json
├── tools/
│   └── document-analysis.js
├── examples/
│   └── basic-analysis.md
└── README.md
```

---

## 示例3：生成 Git 集成器

### 输入参数
```json
{
  "skill_name": "git-integration",
  "skill_type": "tool-integration",
  "description": "集成 Git 版本控制系统，提供代码仓库管理、分支操作、提交分析等功能",
  "primary_function": "Git 仓库管理和分析",
  "target_users": "开发者、团队负责人、DevOps工程师",
  "tools_needed": ["bash", "read", "context"],
  "use_cases": [
    "代码仓库管理",
    "提交历史分析",
    "分支策略优化",
    "团队协作监控"
  ],
  "output_format": "full-package"
}
```

### 使用生成的 Git 集成器
```bash
# 查看仓库状态
git-integration operation="status" repo_path="./"

# 分析提交历史
git-integration operation="analyze" repo_path="./" timeframe="last-month"

# 创建新分支
git-integration operation="create-branch" repo_path="./" branch_name="feature/new-feature"
```

---

## 高级使用技巧

### 1. 使用预定义模板
```json
{
  "skill_name": "my-specialized-skill",
  "skill_type": "specialist",
  "description": "...",
  "custom_template": "data-analysis-template"
}
```

### 2. 配置技能权限
```json
{
  "skill_name": "secure-skill",
  "skill_type": "specialist",
  "description": "...",
  "tools_needed": ["read", "context"],
  "permission_level": "restricted",
  "sandbox_mode": true
}
```

### 3. 生成技能包并立即测试
```bash
# 生成技能
skill-factory --input '{"skill_name": "test-skill", ...}'

# 切换到生成目录
cd generated-skills/test-skill

# 运行测试
npm test  # 或相应语言的测试命令

# 安装到 Claude Code（如果支持）
claude-code skill install .
```

### 4. 批量生成技能
```bash
# 从配置文件批量生成
skill-factory --batch skills-config.json

# skills-config.json 内容：
[
  {
    "skill_name": "skill-1",
    "description": "..."
  },
  {
    "skill_name": "skill-2",
    "description": "..."
  }
]
```

---

## 故障排除

### 常见问题

#### 1. 技能生成失败
**错误信息**：`Template not found`
**解决方案**：检查技能类型是否正确，或提供自定义模板路径

#### 2. 权限配置错误
**错误信息**：`Invalid tool permission`
**解决方案**：检查 tools_needed 列表，确保使用有效的工具名称

#### 3. 输出格式不支持
**错误信息**：`Unsupported output format`
**解决方案**：使用支持的格式：full-package, minimal, template-only

#### 4. 文件生成冲突
**错误信息**：`File already exists`
**解决方案**：使用不同的技能名称，或启用覆盖模式

### 调试模式
```bash
# 启用详细日志
skill-factory --input '{"skill_name": "debug-skill", ...}' --verbose

# 生成调试信息
skill-factory --input '{"skill_name": "debug-skill", ...}' --debug

# 保存中间文件
skill-factory --input '{"skill_name": "debug-skill", ...}' --save-temp
```

---

## 最佳实践

### 1. 命名规范
- 使用小写字母和连字符：`my-skill-name`
- 避免特殊字符和空格
- 名称应反映技能功能

### 2. 工具选择原则
- 只选择必要的工具权限
- 考虑安全性和最小权限原则
- 为不同环境配置不同的权限级别

### 3. 文档完整性
- 为生成的技能提供完整的文档
- 包含使用示例和常见问题
- 提供 API 参考和开发指南

### 4. 测试覆盖
- 生成技能时包含测试文件
- 确保核心功能有测试覆盖
- 提供集成测试示例

### 5. 版本管理
- 为生成的技能设置初始版本号
- 考虑后续升级路径
- 记录生成配置以便复制

---

## 下一步

1. **测试生成的技能**：在测试环境中验证功能
2. **优化技能配置**：根据测试结果调整参数
3. **集成到工作流**：将技能整合到日常开发流程
4. **分享技能**：如果支持，将技能分享给团队或社区
5. **收集反馈**：根据使用情况改进技能设计