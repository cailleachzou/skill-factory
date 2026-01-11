# Skill Factory API 参考

## 概述
本文档提供 Skill Factory 的完整 API 参考，包括所有函数、参数、返回值和错误代码。

## 核心 API

### `generateSkill(input, options)`
生成新技能的主要函数。

#### 参数
```typescript
interface GenerateSkillInput {
  // 必填参数
  skill_name: string;
  description: string;
  primary_function: string;

  // 可选参数
  skill_type?: 'coordinator' | 'specialist' | 'tool-integration' | 'learning-analytics';
  target_users?: string;
  tools_needed?: ToolName[];
  use_cases?: string[];
  output_format?: 'full-package' | 'minimal' | 'template-only';
  custom_template?: string;
  author?: string;
  version?: string;
  license?: string;
}

interface GenerateSkillOptions {
  output_dir?: string;      // 输出目录，默认: './generated-skills'
  overwrite?: boolean;      // 是否覆盖现有文件，默认: false
  verbose?: boolean;        // 详细日志，默认: false
  validate?: boolean;       // 生成后验证，默认: true
  minify?: boolean;         // 是否压缩输出，默认: false
}
```

#### 返回值
```typescript
interface GenerateSkillResult {
  success: boolean;
  output_path: string;
  generated_files: Array<{
    path: string;
    size: number;
    type: 'definition' | 'tool' | 'example' | 'test' | 'doc';
  }>;
  skill_structure: {
    type: string;
    template_used: string;
    file_count: number;
    total_size: number;
  };
  warnings: string[];
  errors: string[];
  duration: number; // 生成耗时（毫秒）
}
```

#### 使用示例
```javascript
const result = await generateSkill({
  skill_name: 'code-review-helper',
  description: '代码审查助手',
  primary_function: '自动化代码审查',
  skill_type: 'specialist',
  tools_needed: ['read', 'edit', 'bash']
}, {
  output_dir: './my-skills',
  verbose: true
});
```

### `validateSkillInput(input)`
验证技能输入参数的有效性。

#### 参数
```typescript
interface ValidateInputOptions {
  strict?: boolean;    // 严格模式，默认: false
  check_tools?: boolean; // 检查工具权限，默认: true
}
```

#### 返回值
```typescript
interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    suggestion: string;
  }>;
  suggestions: string[];
}
```

#### 使用示例
```javascript
const validation = validateSkillInput({
  skill_name: 'test-skill',
  description: '测试技能'
});

if (!validation.valid) {
  console.error('输入验证失败:', validation.errors);
}
```

### `selectTemplate(skillData)`
根据技能数据选择最合适的模板。

#### 参数
```typescript
interface SkillData {
  skill_type?: string;
  primary_function: string;
  tools_needed?: string[];
  use_cases?: string[];
}
```

#### 返回值
```typescript
interface TemplateSelection {
  template_name: string;
  template_path: string;
  confidence: number; // 0-1 的置信度
  reasons: string[];  // 选择理由
  alternatives: Array<{
    name: string;
    path: string;
    confidence: number;
  }>;
}
```

#### 使用示例
```javascript
const template = selectTemplate({
  skill_type: 'coordinator',
  primary_function: '工作流协调',
  tools_needed: ['context', 'read', 'write']
});
```

### `generateSkillFiles(template, skillData, options)`
根据模板和技能数据生成具体文件。

#### 参数
```typescript
interface GenerateFilesOptions {
  format?: 'full' | 'minimal' | 'custom';
  language?: 'javascript' | 'python' | 'typescript';
  include_tests?: boolean;
  include_docs?: boolean;
  include_examples?: boolean;
}
```

#### 返回值
```typescript
interface FileGenerationResult {
  files: Array<{
    path: string;
    content: string;
    size: number;
    checksum: string;
  }>;
  templates_used: string[];
  variables_used: Record<string, any>;
  generation_time: number;
}
```

## 工具权限 API

### `getToolPermissions(toolName)`
获取指定工具的权限信息。

#### 参数
```typescript
type ToolName =
  | 'read' | 'write' | 'edit' | 'glob'
  | 'webfetch' | 'websearch'
  | 'bash' | 'context';
```

#### 返回值
```typescript
interface ToolPermission {
  name: string;
  description: string;
  permissions: string[];
  required_capabilities: string[];
  security_level: 'low' | 'medium' | 'high';
  usage_restrictions?: string[];
}
```

#### 使用示例
```javascript
const permissions = getToolPermissions('bash');
// 返回: { name: 'bash', permissions: ['system:execute'], security_level: 'high' }
```

### `validateToolCompatibility(tools)`
验证工具组合的兼容性。

#### 参数
```typescript
tools: ToolName[];
```

#### 返回值
```typescript
interface ToolCompatibility {
  compatible: boolean;
  conflicts: Array<{
    tool1: string;
    tool2: string;
    reason: string;
  }>;
  recommendations: string[];
  security_level: 'low' | 'medium' | 'high';
}
```

#### 使用示例
```javascript
const compatibility = validateToolCompatibility(['bash', 'read', 'write']);
```

## 模板系统 API

### `listAvailableTemplates()`
列出所有可用的模板。

#### 返回值
```typescript
interface TemplateList {
  builtin: Array<{
    name: string;
    type: string;
    description: string;
    version: string;
  }>;
  custom: Array<{
    name: string;
    path: string;
    author: string;
  }>;
}
```

### `loadTemplate(templateName)`
加载指定模板。

#### 参数
```typescript
interface LoadTemplateOptions {
  cache?: boolean;    // 是否使用缓存，默认: true
  validate?: boolean; // 验证模板完整性，默认: true
}
```

#### 返回值
```typescript
interface Template {
  name: string;
  path: string;
  config: TemplateConfig;
  files: TemplateFile[];
  variables: TemplateVariable[];
  dependencies: string[];
}
```

### `registerCustomTemplate(templatePath, options)`
注册自定义模板。

#### 参数
```typescript
interface RegisterTemplateOptions {
  name?: string;      // 模板名称，默认从路径推断
  type?: string;      // 模板类型
  author?: string;    // 作者信息
  overwrite?: boolean; // 是否覆盖现有模板
}
```

#### 返回值
```typescript
interface TemplateRegistration {
  success: boolean;
  template_name: string;
  template_id: string;
  files_registered: number;
}
```

## 文件系统 API

### `createSkillStructure(baseDir, structure)`
创建技能文件夹结构。

#### 参数
```typescript
interface SkillStructure {
  name: string;
  directories: string[];
  files: Array<{
    path: string;
    template?: string;
    content?: string;
  }>;
  permissions?: Record<string, string>;
}
```

#### 返回值
```typescript
interface StructureCreationResult {
  success: boolean;
  base_dir: string;
  created_dirs: string[];
  created_files: string[];
  errors: Array<{
    path: string;
    error: string;
  }>;
}
```

### `validateSkillStructure(dirPath)`
验证技能文件夹结构的完整性。

#### 参数
```typescript
interface ValidationOptions {
  check_required?: boolean;  // 检查必需文件，默认: true
  check_permissions?: boolean; // 检查文件权限，默认: false
  check_content?: boolean;   // 检查文件内容，默认: false
}
```

#### 返回值
```typescript
interface StructureValidation {
  valid: boolean;
  structure_score: number; // 0-100 的结构完整性分数
  missing_files: string[];
  extra_files: string[];
  permission_issues: Array<{
    file: string;
    issue: string;
  }>;
  content_issues: Array<{
    file: string;
    line?: number;
    issue: string;
  }>;
}
```

## 配置 API

### `getConfiguration()`
获取当前配置。

#### 返回值
```typescript
interface Configuration {
  defaults: {
    skill_type: string;
    output_format: string;
    author: string;
    license: string;
  };
  paths: {
    templates: string;
    output: string;
    cache: string;
    logs: string;
  };
  templates: Record<string, string>;
  permissions: Record<string, string[]>;
  validation: {
    strict: boolean;
    max_file_size: number;
    allowed_extensions: string[];
  };
}
```

### `updateConfiguration(config)`
更新配置。

#### 参数
```typescript
interface ConfigurationUpdate {
  defaults?: Partial<Configuration['defaults']>;
  paths?: Partial<Configuration['paths']>;
  templates?: Record<string, string>;
  permissions?: Record<string, string[]>;
}
```

#### 返回值
```typescript
interface ConfigurationUpdateResult {
  success: boolean;
  changes: Array<{
    key: string;
    old_value: any;
    new_value: any;
  }>;
  warnings: string[];
}
```

## 错误处理 API

### `SkillFactoryError`
所有 Skill Factory 错误的基础类。

```typescript
class SkillFactoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SkillFactoryError';
  }
}
```

### 错误代码
| 错误代码 | 描述 | 可能原因 |
|----------|------|----------|
| `VALIDATION_FAILED` | 输入验证失败 | 缺少必填字段，格式错误 |
| `TEMPLATE_NOT_FOUND` | 模板未找到 | 模板名称错误，路径不存在 |
| `PERMISSION_DENIED` | 权限被拒绝 | 文件系统权限不足 |
| `TOOL_CONFLICT` | 工具冲突 | 不兼容的工具组合 |
| `OUTPUT_DIR_EXISTS` | 输出目录已存在 | 目录已存在且未启用覆盖 |
| `MEMORY_LIMIT_EXCEEDED` | 内存限制超出 | 生成文件过多或过大 |
| `GENERATION_TIMEOUT` | 生成超时 | 生成过程耗时过长 |

### 错误处理示例
```javascript
try {
  const result = await generateSkill(input, options);
} catch (error) {
  if (error instanceof SkillFactoryError) {
    switch (error.code) {
      case 'VALIDATION_FAILED':
        console.error('输入验证失败:', error.details);
        break;
      case 'TEMPLATE_NOT_FOUND':
        console.error('模板未找到，请检查模板名称');
        break;
      default:
        console.error('技能生成失败:', error.message);
    }
  } else {
    console.error('未知错误:', error);
  }
}
```

## 工具函数 API

### `sanitizeSkillName(name)`
清理和标准化技能名称。

```javascript
/**
 * @param {string} name - 原始技能名称
 * @returns {string} 标准化后的技能名称
 */
const sanitizeSkillName = (name) => {
  // 转换为小写
  // 替换空格和特殊字符为连字符
  // 移除重复连字符
  // 确保以字母开头
};
```

#### 使用示例
```javascript
const cleanName = sanitizeSkillName('My Test Skill!');
// 返回: 'my-test-skill'
```

### `generateSkillId(name, author)`
生成唯一的技能ID。

```javascript
/**
 * @param {string} name - 技能名称
 * @param {string} author - 作者（可选）
 * @returns {string} 技能ID
 */
const generateSkillId = (name, author = 'anonymous') => {
  // 生成基于名称、作者和时间的唯一ID
};
```

### `estimateSkillSize(skillData)`
估计生成的技能大小。

```javascript
/**
 * @param {SkillData} skillData - 技能数据
 * @returns {SizeEstimate} 大小估计
 */
interface SizeEstimate {
  total_files: number;
  total_size_kb: number;
  by_type: Record<string, number>;
}
```

## 插件系统 API

### `registerPlugin(plugin)`
注册插件。

```javascript
interface SkillFactoryPlugin {
  name: string;
  version: string;
  hooks: {
    preGenerate?: (skillData) => Promise<SkillData>;
    postGenerate?: (result) => Promise<void>;
    templateModifier?: (template, skillData) => Promise<Template>;
  };
}
```

### `listPlugins()`
列出所有已注册的插件。

```javascript
interface PluginList {
  active: Array<{
    name: string;
    version: string;
    hooks: string[];
  }>;
  available: Array<{
    name: string;
    description: string;
  }>;
}
```

## 性能监控 API

### `getPerformanceMetrics()`
获取性能指标。

```javascript
interface PerformanceMetrics {
  generation: {
    total: number;
    average_time: number;
    success_rate: number;
  };
  memory: {
    peak_usage: number;
    average_usage: number;
  };
  cache: {
    hit_rate: number;
    size: number;
  };
}
```

### `resetPerformanceMetrics()`
重置性能指标。

## 命令行接口

### CLI 命令参考

#### `skill-factory generate`
生成新技能。

```bash
skill-factory generate \
  --name "skill-name" \
  --description "技能描述" \
  --type "specialist" \
  --output-dir "./output"
```

#### `skill-factory validate`
验证技能输入或结构。

```bash
# 验证输入
skill-factory validate --input skill-config.json

# 验证技能结构
skill-factory validate --dir ./generated-skill
```

#### `skill-factory list`
列出资源。

```bash
# 列出模板
skill-factory list templates

# 列出工具
skill-factory list tools

# 列出插件
skill-factory list plugins
```

#### `skill-factory config`
管理配置。

```bash
# 查看配置
skill-factory config show

# 设置配置项
skill-factory config set default.author "Your Name"

# 重置配置
skill-factory config reset
```

## 类型定义

完整的 TypeScript 类型定义：

```typescript
// 工具类型
type ToolName = 'read' | 'write' | 'edit' | 'glob'
  | 'webfetch' | 'websearch'
  | 'bash' | 'context';

// 技能类型
type SkillType = 'coordinator' | 'specialist'
  | 'tool-integration' | 'learning-analytics';

// 输出格式
type OutputFormat = 'full-package' | 'minimal' | 'template-only';

// 主要接口
interface SkillData {
  skill_name: string;
  description: string;
  primary_function: string;
  skill_type?: SkillType;
  tools_needed?: ToolName[];
  use_cases?: string[];
  output_format?: OutputFormat;
}

// 生成选项
interface GenerationOptions {
  output_dir?: string;
  overwrite?: boolean;
  verbose?: boolean;
  validate?: boolean;
  minify?: boolean;
}

// 生成结果
interface GenerationResult {
  success: boolean;
  output_path: string;
  generated_files: GeneratedFile[];
  skill_structure: SkillStructure;
  warnings: string[];
  errors: string[];
  duration: number;
}

interface GeneratedFile {
  path: string;
  size: number;
  type: FileType;
  checksum?: string;
}

type FileType = 'definition' | 'tool' | 'example'
  | 'test' | 'doc' | 'config';
```

## 版本兼容性

### API 版本
当前 API 版本：**v1.0.0**

### 向后兼容性
- **v1.x.x**：保证 API 向后兼容
- **v2.x.x**：可能包含重大变更

### 弃用警告
使用 `console.warn()` 输出弃用警告，提供迁移指南。

---

**注意**：此 API 参考基于 Skill Factory 的设计规范。实际实现可能根据 Claude Code 的具体要求进行调整。