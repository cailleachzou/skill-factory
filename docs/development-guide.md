# Skill Factory 开发指南

## 概述
本文档为 Skill Factory 的开发者提供详细的开发指南，包括架构说明、扩展方法、最佳实践和调试技巧。

## 项目架构

### 目录结构
```
skill-factory/
├── src/                    # 源代码
│   ├── core/              # 核心逻辑
│   │   ├── generator.js   # 技能生成器
│   │   ├── validator.js   # 验证器
│   │   └── template-engine.js # 模板引擎
│   ├── templates/         # 内置模板
│   │   ├── coordinator/   # 协调器模板
│   │   ├── specialist/    # 专业工具模板
│   │   ├── integration/   # 集成器模板
│   │   └── analytics/     # 分析器模板
│   ├── tools/            # 工具系统
│   │   ├── permissions.js # 权限管理
│   │   └── compatibility.js # 兼容性检查
│   └── utils/            # 工具函数
│       ├── file-system.js # 文件系统操作
│       └── validation.js  # 验证工具
├── config/               # 配置文件
│   ├── defaults.json    # 默认配置
│   └── templates.json   # 模板配置
├── plugins/             # 插件系统
├── tests/              # 测试文件
└── docs/               # 文档
```

### 核心模块交互
```
用户输入 → 输入验证 → 模板选择 → 文件生成 → 输出验证 → 结果返回
      ↓         ↓          ↓          ↓          ↓          ↓
  验证器   权限检查    模板引擎   文件系统   完整性检查   格式优化
```

## 开发环境设置

### 1. 环境要求
- Node.js 16+ 或 Python 3.8+（根据实现语言）
- Git
- 文本编辑器/IDE
- Claude Code 开发环境（可选）

### 2. 克隆和安装
```bash
# 克隆项目
git clone https://github.com/your-username/skill-factory.git
cd skill-factory

# 安装依赖（Node.js 版本）
npm install

# 或 Python 版本
pip install -r requirements.txt
```

### 3. 开发模式
```bash
# 开发模式启动（Node.js）
npm run dev

# 测试模式
npm test

# 代码检查
npm run lint
```

## 核心模块开发

### 1. 技能生成器模块

#### 生成器类结构
```javascript
class SkillGenerator {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
    this.templateEngine = new TemplateEngine();
    this.validator = new SkillValidator();
  }

  async generate(input, options = {}) {
    // 1. 验证输入
    const validated = await this.validator.validateInput(input);

    // 2. 选择模板
    const template = await this.selectTemplate(validated);

    // 3. 生成文件
    const files = await this.generateFiles(template, validated);

    // 4. 写入文件系统
    const result = await this.writeFiles(files, options.outputDir);

    // 5. 验证输出
    await this.validator.validateOutput(result);

    return result;
  }

  async selectTemplate(skillData) {
    // 根据技能类型和功能选择模板
    const { skill_type, primary_function } = skillData;

    if (skillData.custom_template) {
      return await this.loadCustomTemplate(skillData.custom_template);
    }

    // 内置模板选择逻辑
    const templateName = this.determineTemplateName(skill_type, primary_function);
    return await this.templateEngine.loadTemplate(templateName);
  }

  async generateFiles(template, skillData) {
    const files = [];

    for (const templateFile of template.files) {
      const content = await this.templateEngine.render(
        templateFile,
        skillData
      );

      files.push({
        path: this.resolveFilePath(templateFile.path, skillData),
        content,
        size: Buffer.byteLength(content, 'utf8')
      });
    }

    return files;
  }
}
```

#### 扩展生成器
```javascript
// 自定义生成器
class CustomSkillGenerator extends SkillGenerator {
  async generate(input, options) {
    // 前置处理
    const processedInput = await this.preProcess(input);

    // 调用父类生成逻辑
    const result = await super.generate(processedInput, options);

    // 后置处理
    const enhancedResult = await this.postProcess(result);

    return enhancedResult;
  }

  async preProcess(input) {
    // 自定义输入处理逻辑
    return {
      ...input,
      // 添加默认值或转换
    };
  }

  async postProcess(result) {
    // 自定义结果处理逻辑
    return {
      ...result,
      // 添加额外信息或转换
    };
  }
}
```

### 2. 模板引擎模块

#### 模板文件结构
```
templates/specialist/
├── template.json          # 模板配置
├── skill-definition/
│   └── skill.json.tpl    # 技能定义模板
├── tools/
│   └── tools.json.tpl    # 工具配置模板
├── examples/
│   └── basic-example.md.tpl # 示例模板
└── implementation.md.tpl # 实现文档模板
```

#### 模板配置文件
```json
{
  "name": "specialist-template",
  "description": "专业工具技能模板",
  "version": "1.0.0",
  "author": "Skill Factory Team",
  "skill_type": "specialist",

  "variables": {
    "required": ["skill_name", "description", "primary_function"],
    "optional": ["target_users", "use_cases", "tools_needed"]
  },

  "files": [
    {
      "source": "skill-definition/skill.json.tpl",
      "target": "skill-definition/skill.json",
      "required": true
    },
    {
      "source": "tools/tools.json.tpl",
      "target": "tools/tools.json",
      "required": true
    },
    {
      "source": "examples/basic-example.md.tpl",
      "target": "examples/basic-example.md",
      "required": false
    }
  ],

  "hooks": {
    "pre_generate": "hooks/pre-generate.js",
    "post_generate": "hooks/post-generate.js"
  }
}
```

#### 模板语法
```javascript
// 模板文件示例（skill.json.tpl）
{
  "name": "{{skill_name}}",
  "version": "{{version | default: '0.1.0'}}",
  "description": "{{description}}",

  "tools": [
    {{#each tools_needed}}
    {
      "name": "{{this}}",
      "permissions": "{{get_permissions this}}"
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ],

  "created_date": "{{now format='YYYY-MM-DD'}}"
}
```

#### 自定义模板引擎
```javascript
class CustomTemplateEngine extends TemplateEngine {
  constructor(config) {
    super(config);
    this.registerFilters({
      // 自定义过滤器
      'snake_case': (value) => value.toLowerCase().replace(/\s+/g, '_'),
      'camel_case': (value) => value.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      ).replace(/\s+/g, '')
    });

    this.registerHelpers({
      // 自定义助手函数
      'get_permissions': (toolName) => {
        const permissions = {
          'read': ['files:read'],
          'write': ['files:write'],
          'bash': ['system:execute']
        };
        return permissions[toolName] || [];
      }
    });
  }
}
```

### 3. 工具权限系统

#### 权限定义
```javascript
// tools/permissions.js
const toolPermissions = {
  read: {
    name: 'read',
    description: '读取文件内容',
    permissions: ['files:read'],
    security_level: 'low',
    validation: {
      max_file_size: 10 * 1024 * 1024, // 10MB
      allowed_extensions: ['.txt', '.md', '.json', '.js', '.py']
    }
  },

  bash: {
    name: 'bash',
    description: '执行系统命令',
    permissions: ['system:execute'],
    security_level: 'high',
    validation: {
      allowed_commands: ['ls', 'pwd', 'mkdir', 'rm', 'cp', 'mv'],
      timeout: 30000 // 30秒
    }
  }
};
```

#### 权限验证
```javascript
class PermissionValidator {
  validateToolRequest(toolName, request) {
    const toolConfig = toolPermissions[toolName];
    if (!toolConfig) {
      throw new Error(`未知工具: ${toolName}`);
    }

    // 检查权限
    if (!this.hasPermissions(toolConfig.permissions)) {
      throw new Error(`权限不足: 需要 ${toolConfig.permissions.join(', ')}`);
    }

    // 验证请求参数
    this.validateRequestParameters(toolConfig, request);

    return true;
  }

  validateToolCombination(tools) {
    const conflicts = [];

    // 检查工具冲突
    for (let i = 0; i < tools.length; i++) {
      for (let j = i + 1; j < tools.length; j++) {
        if (this.areToolsConflicting(tools[i], tools[j])) {
          conflicts.push({
            tool1: tools[i],
            tool2: tools[j],
            reason: '安全冲突'
          });
        }
      }
    }

    // 检查权限升级
    const securityLevel = this.calculateSecurityLevel(tools);
    if (securityLevel === 'high' && !this.hasHighSecurityClearance()) {
      throw new Error('需要高级安全权限');
    }

    return { compatible: conflicts.length === 0, conflicts };
  }
}
```

### 4. 文件系统模块

#### 安全文件操作
```javascript
class SecureFileSystem {
  constructor(baseDir, options = {}) {
    this.baseDir = path.resolve(baseDir);
    this.options = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedExtensions: ['.json', '.md', '.js', '.py', '.txt'],
      ...options
    };

    // 确保 baseDir 在安全范围内
    this.validateBaseDirectory();
  }

  validateBaseDirectory() {
    const resolved = path.resolve(this.baseDir);

    // 防止目录遍历攻击
    if (resolved.includes('..')) {
      throw new Error('无效的目录路径');
    }

    // 检查目录权限
    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true });
    }

    // 验证可写权限
    try {
      const testFile = path.join(resolved, '.test-write');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (error) {
      throw new Error(`目录不可写: ${resolved}`);
    }
  }

  async writeFile(relativePath, content, options = {}) {
    const absolutePath = this.resolvePath(relativePath);

    // 验证路径安全性
    this.validatePathSafety(relativePath);

    // 验证文件大小
    if (content.length > this.options.maxFileSize) {
      throw new Error(`文件过大: ${content.length} 字节`);
    }

    // 验证文件扩展名
    const ext = path.extname(relativePath);
    if (!this.options.allowedExtensions.includes(ext)) {
      throw new Error(`不支持的文件扩展名: ${ext}`);
    }

    // 创建目录（如果需要）
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入文件
    return fs.promises.writeFile(absolutePath, content, {
      encoding: 'utf8',
      ...options
    });
  }

  resolvePath(relativePath) {
    const resolved = path.resolve(this.baseDir, relativePath);

    // 确保文件在 baseDir 内
    if (!resolved.startsWith(this.baseDir)) {
      throw new Error('路径越界访问');
    }

    return resolved;
  }
}
```

## 扩展开发

### 1. 添加新模板

#### 步骤1：创建模板目录
```bash
mkdir -p templates/my-custom-template/{skill-definition,tools,examples}
```

#### 步骤2：创建模板配置
```json
// templates/my-custom-template/template.json
{
  "name": "my-custom-template",
  "description": "我的自定义模板",
  "version": "1.0.0",
  "author": "Your Name",
  "skill_type": "custom",

  "variables": {
    "required": ["skill_name", "description"],
    "optional": ["custom_field"]
  },

  "files": [
    {
      "source": "skill-definition/skill.json.tpl",
      "target": "skill-definition/skill.json",
      "required": true
    }
  ]
}
```

#### 步骤3：创建模板文件
```javascript
// templates/my-custom-template/skill-definition/skill.json.tpl
{
  "name": "{{skill_name}}",
  "version": "0.1.0",
  "description": "{{description}}",
  "custom_field": "{{custom_field | default: 'default value'}}"
}
```

#### 步骤4：注册模板
```javascript
// 在配置文件中注册
{
  "templates": {
    "my-custom-template": "./templates/my-custom-template"
  }
}
```

### 2. 创建插件

#### 插件结构
```javascript
// plugins/my-plugin.js
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  description: '我的自定义插件',

  hooks: {
    // 生成前钩子
    async preGenerate(skillData, context) {
      console.log('preGenerate hook called');
      // 修改 skillData
      skillData.enhanced = true;
      return skillData;
    },

    // 生成后钩子
    async postGenerate(result, context) {
      console.log('postGenerate hook called');
      // 处理生成结果
      result.plugin_processed = true;
      return result;
    },

    // 模板修改钩子
    async templateModifier(template, skillData) {
      console.log('templateModifier hook called');
      // 修改模板
      template.files.push({
        source: 'plugins/my-plugin/extra-file.tpl',
        target: 'extra-file.md'
      });
      return template;
    }
  },

  // 自定义函数
  utilities: {
    customFunction: (data) => {
      return `Processed: ${data}`;
    }
  }
};
```

#### 启用插件
```javascript
// 在配置中启用插件
{
  "plugins": {
    "enabled": ["my-plugin"],
    "my-plugin": {
      "config": {
        "option1": "value1"
      }
    }
  }
}
```

### 3. 添加新工具权限

#### 定义新工具
```javascript
// 扩展工具权限定义
const extendedPermissions = {
  ...toolPermissions,

  my_custom_tool: {
    name: 'my_custom_tool',
    description: '我的自定义工具',
    permissions: ['custom:operation'],
    security_level: 'medium',
    validation: {
      // 自定义验证规则
    }
  }
};
```

#### 注册工具
```javascript
// 在工具系统中注册
toolSystem.registerTool('my_custom_tool', {
  execute: async (params) => {
    // 工具执行逻辑
    return { success: true, result: 'custom operation completed' };
  },

  validate: (params) => {
    // 参数验证逻辑
    if (!params.required_field) {
      throw new Error('缺少必要字段');
    }
    return true;
  }
});
```

## 测试开发

### 1. 单元测试
```javascript
// tests/unit/generator.test.js
describe('SkillGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new SkillGenerator();
  });

  test('应正确验证输入', async () => {
    const validInput = {
      skill_name: 'test-skill',
      description: '测试技能',
      primary_function: '测试功能'
    };

    const result = await generator.validateInput(validInput);
    expect(result.valid).toBe(true);
  });

  test('应拒绝无效输入', async () => {
    const invalidInput = {
      skill_name: 'test'
    };

    await expect(generator.validateInput(invalidInput))
      .rejects.toThrow('缺少必要字段');
  });
});
```

### 2. 集成测试
```javascript
// tests/integration/full-workflow.test.js
describe('完整工作流', () => {
  test('应生成完整技能包', async () => {
    const input = {
      skill_name: 'integration-test',
      description: '集成测试技能',
      primary_function: '测试完整工作流',
      tools_needed: ['read', 'write']
    };

    const result = await skillFactory.generate(input, {
      output_dir: './test-output'
    });

    // 验证结果
    expect(result.success).toBe(true);
    expect(fs.existsSync(result.output_path)).toBe(true);

    // 验证生成的文件
    const files = fs.readdirSync(result.output_path, { recursive: true });
    expect(files).toContain('skill-definition/skill.json');
    expect(files).toContain('tools/tools.json');

    // 清理
    fs.rmSync('./test-output', { recursive: true });
  });
});
```

### 3. 性能测试
```javascript
// tests/performance/load-test.js
describe('性能测试', () => {
  test('应处理并发请求', async () => {
    const requests = Array(10).fill(0).map((_, i) => ({
      skill_name: `load-test-${i}`,
      description: `负载测试技能 ${i}`,
      primary_function: '测试'
    }));

    const startTime = Date.now();

    const results = await Promise.all(
      requests.map(req => skillFactory.generate(req))
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    // 所有请求应成功
    results.forEach(result => {
      expect(result.success).toBe(true);
    });

    // 应在合理时间内完成
    expect(duration).toBeLessThan(30000); // 30秒
  });
});
```

## 调试技巧

### 1. 调试模式
```javascript
// 启用调试模式
const generator = new SkillGenerator({
  debug: true,
  log_level: 'verbose'
});

// 或通过环境变量
process.env.SKILL_FACTORY_DEBUG = 'true';
```

### 2. 日志记录
```javascript
class DebugLogger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = ['error', 'warn', 'info', 'debug', 'verbose'];
  }

  log(level, message, data = {}) {
    if (this.levels.indexOf(level) <= this.levels.indexOf(this.level)) {
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  }

  // 快捷方法
  error = (msg, data) => this.log('error', msg, data);
  info = (msg, data) => this.log('info', msg, data);
  debug = (msg, data) => this.log('debug', msg, data);
}
```

### 3. 性能分析
```javascript
// 使用性能分析钩子
generator.on('generation.start', (input) => {
  console.time(`generate-${input.skill_name}`);
});

generator.on('generation.end', (result) => {
  console.timeEnd(`generate-${result.skill_name}`);
  console.log('生成耗时:', result.duration, 'ms');
});

// 内存使用监控
setInterval(() => {
  const memory = process.memoryUsage();
  console.log('内存使用:', {
    heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
    external: Math.round(memory.external / 1024 / 1024) + 'MB'
  });
}, 5000);
```

## 最佳实践

### 1. 代码质量
- 使用 TypeScript 或 JSDoc 进行类型检查
- 遵循代码风格指南（ESLint、Prettier）
- 编写清晰的文档注释
- 保持函数单一职责

### 2. 错误处理
- 使用自定义错误类
- 提供有意义的错误信息
- 实现错误恢复机制
- 记录错误上下文

### 3. 安全性
- 验证所有用户输入
- 实施最小权限原则
- 防止路径遍历攻击
- 安全处理文件操作

### 4. 性能优化
- 使用缓存减少重复操作
- 实现懒加载和按需加载
- 优化模板渲染性能
- 监控内存使用

### 5. 可维护性
- 模块化设计，低耦合
- 编写可测试的代码
- 保持向后兼容性
- 提供升级路径

## 发布流程

### 1. 版本管理
```bash
# 语义化版本控制
# major.minor.patch
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.1 → 0.2.0
npm version major  # 0.2.0 → 1.0.0
```

### 2. 发布检查清单
- [ ] 所有测试通过
- [ ] 文档更新完成
- [ ] 版本号已更新
- [ ] 变更日志已记录
- [ ] 向后兼容性已验证

### 3. 发布命令
```bash
# 构建
npm run build

# 测试
npm test

# 发布到 npm（如果适用）
npm publish

# 创建 Git 标签
git tag v1.0.0
git push --tags
```

## 贡献指南

### 1. 开发流程
1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 2. 提交规范
```
类型(范围): 描述

[正文]

[脚注]
```

类型：`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 3. 代码审查
- 确保代码符合项目标准
- 验证测试覆盖率
- 检查性能和安全性
- 确认文档更新

## 故障排除

### 常见问题

#### 1. 模板渲染失败
**症状**：生成的文件包含未解析的变量
**解决**：检查模板语法，确保变量名正确

#### 2. 权限错误
**症状**：文件操作被拒绝
**解决**：检查文件系统权限，使用安全路径

#### 3. 内存泄漏
**症状**：内存使用持续增长
**解决**：检查缓存策略，确保资源正确释放

#### 4. 性能下降
**症状**：生成时间变长
**解决**：优化模板缓存，减少重复计算

### 获取帮助
- 查看 [GitHub Issues](https://github.com/your-username/skill-factory/issues)
- 加入 [Discord/Slack 频道](链接)
- 阅读 [FAQ](./FAQ.md)

---

**提示**：开发过程中遇到问题，可以先查看测试用例和现有实现作为参考。