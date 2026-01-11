# Skill Factory 实现文档

## 概述
Skill Factory 是一个能够生成其他 Claude Code 技能的元技能工具。它接收用户对目标技能的描述，然后生成完整的技能包，包括技能定义、工具配置、示例代码、测试用例和文档。

## 核心工作流程

### 1. 输入解析阶段
- **验证输入**：检查必填字段（skill_name, description, primary_function）
- **标准化处理**：
  - 技能名称转换为小写，用连字符分隔（my-skill-name）
  - 技能类型映射到对应的模板类别
  - 工具需求验证和权限映射
- **上下文补充**：根据技能类型和使用场景，补充默认配置

### 2. 技能分析阶段
- **需求分析**：根据描述分析技能的核心功能
- **模式识别**：识别常见的技能模式（协调器、专业工具、集成器、分析器）
- **模板选择**：基于技能类型选择基础模板
- **依赖分析**：确定技能需要的工具和权限级别

### 3. 文件生成阶段

#### 3.1 技能定义文件（skill.json）
```javascript
生成逻辑：
1. 基础信息：名称、版本、描述、作者
2. 工具权限：基于用户选择的 tools_needed 生成
3. 输入模式：根据技能类型生成相应的输入字段
4. 输出模式：定义技能的标准输出格式
5. 示例：自动生成使用示例
```

#### 3.2 工具配置文件（tools.json）
```javascript
生成逻辑：
1. 工具映射：将通用工具名称映射到 Claude Code 工具
2. 权限配置：设置适当的权限级别
3. 使用示例：为每个工具生成使用示例
```

#### 3.3 实现文件（implementation.js 或 implementation.py）
```javascript
生成逻辑：
1. 骨架代码：根据技能类型生成基础代码结构
2. 核心函数：生成主要功能函数的骨架
3. 工具调用：集成工具权限，生成工具调用代码
4. 错误处理：添加基本的错误处理逻辑
```

#### 3.4 示例文件（examples/）
```markdown
生成逻辑：
1. 基础示例：展示最基本的使用方式
2. 高级示例：展示更复杂的使用场景
3. 集成示例：展示与其他技能的集成方式
```

#### 3.5 测试文件（tests/）
```javascript
生成逻辑：
1. 单元测试：测试核心功能
2. 集成测试：测试工具集成
3. 示例测试：验证示例代码的正确性
```

#### 3.6 文档文件（docs/）
```markdown
生成逻辑：
1. README：技能概述和快速开始指南
2. API文档：详细的功能说明
3. 开发指南：如何扩展和修改技能
```

### 4. 模板系统

#### 模板类别
1. **协调器模板**（coordinator）
   - 用于协调多个子技能的元技
   - 包含状态管理、工作流引擎
   - 示例：Vibe Writing 协调器

2. **专业工具模板**（specialist）
   - 专注于特定领域的技能
   - 包含专业算法、领域知识
   - 示例：代码审查助手、文档分析器

3. **集成器模板**（tool-integration）
   - 集成外部工具和服务的技能
   - 包含 API 调用、数据转换
   - 示例：Git 集成器、数据库连接器

4. **分析器模板**（learning-analytics）
   - 分析和学习技能
   - 包含数据分析、模式识别
   - 示例：代码质量分析器、学习进度跟踪器

#### 模板变量系统
```
变量替换规则：
{{skill_name}}          → 技能名称
{{skill_description}}   → 技能描述
{{skill_type}}          → 技能类型
{{tools_list}}          → 工具权限列表
{{input_fields}}        → 输入字段定义
{{output_structure}}    → 输出结构定义
{{examples}}            → 使用示例
{{author}}              → 作者信息
{{date}}                → 创建日期
```

### 5. 生成算法

#### 步骤1：模板选择
```python
def select_template(skill_type, primary_function):
    if skill_type == "coordinator":
        return "coordinator-template"
    elif "analysis" in primary_function.lower():
        return "analytics-template"
    elif "integration" in primary_function.lower():
        return "integration-template"
    else:
        return "specialist-template"
```

#### 步骤2：文件生成
```python
def generate_skill_files(template, skill_data):
    files = []

    # 读取模板文件
    templates = load_templates(template)

    # 替换变量
    for template_file in templates:
        content = replace_variables(template_file, skill_data)
        file_path = determine_path(template_file, skill_data)
        files.append({
            "path": file_path,
            "content": content
        })

    return files
```

#### 步骤3：验证和优化
```python
def validate_and_optimize(files):
    # 验证文件结构完整性
    validate_structure(files)

    # 优化代码质量
    optimize_code_quality(files)

    # 检查工具权限一致性
    check_tool_permissions(files)

    return files
```

### 6. 扩展机制

#### 自定义模板
用户可以通过以下方式扩展模板系统：
1. 在 `templates/custom/` 中添加新模板
2. 在 `template-config.json` 中注册模板
3. 模板使用相同的变量系统

#### 插件系统
```javascript
插件接口：
- pre_generate_hook(skill_data): 生成前的预处理
- post_generate_hook(files): 生成后的后处理
- template_modifier(template, skill_data): 模板修改
- validation_hook(files): 自定义验证
```

#### 配置系统
```json
配置文件位置：config/generator-config.json
{
  "default_templates": {
    "coordinator": "templates/coordinator",
    "specialist": "templates/specialist",
    "tool-integration": "templates/integration",
    "learning-analytics": "templates/analytics"
  },
  "default_permissions": {
    "read": ["files:read"],
    "write": ["files:write"],
    "edit": ["files:edit"],
    "glob": ["files:search"],
    "webfetch": ["network:fetch"],
    "websearch": ["network:search"],
    "bash": ["system:execute"],
    "context": ["context:read", "context:write"]
  },
  "output_formats": ["full-package", "minimal", "template-only"]
}
```

### 7. 错误处理和恢复

#### 错误类型
1. **输入验证错误**：缺少必填字段、格式错误
2. **模板错误**：模板文件缺失、变量错误
3. **权限错误**：工具权限配置错误
4. **生成错误**：文件生成失败、磁盘空间不足

#### 恢复策略
```python
错误恢复流程：
1. 记录错误上下文和状态
2. 尝试回滚已创建的文件
3. 提供详细的错误信息和修复建议
4. 支持从检查点重新开始生成
```

### 8. 性能优化

#### 缓存机制
- 模板缓存：缓存已加载的模板文件
- 权限缓存：缓存工具权限映射
- 示例缓存：缓存生成的示例代码

#### 并行生成
```python
并行生成策略：
- 独立文件：可以并行生成的文件（如示例、测试）
- 依赖文件：有依赖关系的文件顺序生成
- 批量写入：减少磁盘 I/O 操作
```

### 9. 质量保证

#### 代码质量检查
- 语法检查：确保生成的代码语法正确
- 格式检查：保持代码风格一致性
- 安全性检查：避免安全漏洞

#### 完整性验证
- 文件结构验证：确保所有必需文件都已生成
- 依赖关系验证：检查文件间的依赖关系
- 功能验证：验证生成技能的基本功能

### 10. 未来扩展方向

#### 计划中的功能
1. **技能市场集成**：生成可以直接发布到技能市场的包
2. **AI增强生成**：使用AI优化生成的代码质量
3. **技能测试框架**：自动生成测试用例和测试数据
4. **技能升级工具**：帮助现有技能升级到新版本
5. **多语言支持**：支持生成不同编程语言的技能

#### 架构演进
1. **微服务架构**：将生成器拆分为多个微服务
2. **云原生部署**：支持容器化部署和扩展
3. **API服务**：提供REST API供其他工具调用
4. **IDE集成**：集成到开发环境中使用

---

## 使用示例

### 基本使用流程
```bash
# 1. 调用技能工厂
skill-factory skill_name="code-review-helper" \
  description="代码审查助手" \
  primary_function="自动化代码质量检查" \
  tools_needed="read,edit,bash"

# 2. 查看生成的文件
ls generated-skills/code-review-helper/

# 3. 测试生成的技能
test-skill generated-skills/code-review-helper/
```

### 高级配置示例
```json
{
  "skill_name": "vibe-writing-coordinator",
  "skill_type": "coordinator",
  "description": "Vibe Writing 系统协调器，管理学习、结构、写作、成稿四个Agent",
  "primary_function": "工作流协调和状态管理",
  "tools_needed": ["read", "write", "edit", "glob", "context"],
  "use_cases": ["写作项目协调", "学习流程管理", "知识产出优化"],
  "output_format": "full-package",
  "custom_templates": ["vibe-writing-template"]
}
```

---

## 开发指南

### 添加新模板
1. 在 `templates/` 目录下创建新模板文件夹
2. 创建模板配置文件 `template-config.json`
3. 实现模板文件，使用变量系统 `{{variable_name}}`
4. 在 `config/generator-config.json` 中注册模板

### 扩展插件系统
1. 创建插件文件 `plugins/my-plugin.js`
2. 实现插件接口函数
3. 在配置中启用插件
4. 测试插件功能

### 贡献指南
1. Fork 项目仓库
2. 创建功能分支
3. 实现新功能或修复bug
4. 添加测试用例
5. 提交 Pull Request