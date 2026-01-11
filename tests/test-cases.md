# Skill Factory 测试用例

## 测试环境配置
- **测试框架**：Jest / Mocha（根据实现语言选择）
- **测试数据**：预定义的技能配置样本
- **测试目录**：`test-data/` 包含输入输出样本
- **临时目录**：`temp-output/` 用于存储生成结果

## 测试类别

### 1. 单元测试
测试单个功能模块的正确性。

#### 1.1 输入验证测试
```javascript
test('验证有效的技能输入', () => {
  const validInput = {
    skill_name: 'test-skill',
    description: '测试技能',
    primary_function: '测试功能'
  };
  expect(validateInput(validInput)).toBe(true);
});

test('检测缺少必填字段', () => {
  const invalidInput = {
    skill_name: 'test-skill'
    // 缺少 description 和 primary_function
  };
  expect(() => validateInput(invalidInput)).toThrow('Missing required fields');
});

test('验证技能名称格式', () => {
  expect(validateSkillName('valid-name')).toBe(true);
  expect(validateSkillName('invalid name')).toBe(false); // 包含空格
  expect(validateSkillName('InvalidName')).toBe(false); // 大写字母
});
```

#### 1.2 工具权限映射测试
```javascript
test('工具名称映射到权限', () => {
  expect(mapToolToPermissions('read')).toEqual(['files:read']);
  expect(mapToolToPermissions('bash')).toEqual(['system:execute']);
  expect(mapToolToPermissions('unknown')).toBeUndefined();
});

test('工具列表验证', () => {
  const validTools = ['read', 'write', 'edit'];
  const invalidTools = ['read', 'unknown-tool'];

  expect(validateTools(validTools)).toBe(true);
  expect(() => validateTools(invalidTools)).toThrow('Invalid tool: unknown-tool');
});
```

#### 1.3 模板选择测试
```javascript
test('根据技能类型选择模板', () => {
  expect(selectTemplate('coordinator')).toBe('coordinator-template');
  expect(selectTemplate('specialist')).toBe('specialist-template');
  expect(selectTemplate('unknown')).toBe('default-template');
});

test('根据功能描述选择模板', () => {
  const analysisSkill = { primary_function: '数据分析' };
  const integrationSkill = { primary_function: '系统集成' };

  expect(selectTemplateByFunction(analysisSkill)).toBe('analytics-template');
  expect(selectTemplateByFunction(integrationSkill)).toBe('integration-template');
});
```

### 2. 集成测试
测试多个模块协同工作。

#### 2.1 完整生成流程测试
```javascript
test('完整技能生成流程', async () => {
  const input = {
    skill_name: 'integration-test-skill',
    skill_type: 'specialist',
    description: '集成测试技能',
    primary_function: '测试生成流程',
    tools_needed: ['read', 'write']
  };

  const result = await generateSkill(input);

  // 验证输出结构
  expect(result).toHaveProperty('generated_files');
  expect(result).toHaveProperty('skill_structure');
  expect(result).toHaveProperty('skill_definition');

  // 验证文件生成
  expect(result.generated_files.length).toBeGreaterThan(0);

  // 验证技能定义文件存在
  const skillJson = result.generated_files.find(f => f.path.includes('skill.json'));
  expect(skillJson).toBeDefined();
});
```

#### 2.2 文件系统操作测试
```javascript
test('生成文件到指定目录', async () => {
  const outputDir = 'temp-output/test-skill';

  const result = await generateSkillToDirectory(testInput, outputDir);

  // 验证目录创建
  expect(fs.existsSync(outputDir)).toBe(true);

  // 验证必需文件存在
  expect(fs.existsSync(`${outputDir}/skill-definition/skill.json`)).toBe(true);
  expect(fs.existsSync(`${outputDir}/tools/tools.json`)).toBe(true);
  expect(fs.existsSync(`${outputDir}/examples/basic-example.md`)).toBe(true);

  // 清理
  fs.rmSync(outputDir, { recursive: true });
});
```

#### 2.3 错误处理集成测试
```javascript
test('生成过程中的错误恢复', async () => {
  // 模拟磁盘空间不足
  jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
    throw new Error('No space left on device');
  });

  const input = { skill_name: 'error-test', description: 'test', primary_function: 'test' };

  await expect(generateSkill(input)).rejects.toThrow('生成失败');

  // 验证清理操作
  expect(cleanupTempFiles).toHaveBeenCalled();

  jest.restoreAllMocks();
});
```

### 3. 端到端测试
从用户输入到最终技能包的全流程测试。

#### 3.1 基本端到端测试
```javascript
test('端到端技能生成', async () => {
  // 用户输入
  const userInput = {
    skill_name: 'e2e-test-skill',
    skill_type: 'specialist',
    description: '端到端测试技能',
    primary_function: '演示完整生成流程',
    tools_needed: ['read', 'write', 'bash'],
    use_cases: ['测试', '演示', '学习'],
    output_format: 'full-package'
  };

  // 执行生成
  const result = await skillFactory(userInput);

  // 验证结果
  expect(result.success).toBe(true);
  expect(result.output_path).toBeDefined();

  // 验证生成的文件可以被 Claude Code 加载（如果支持）
  if (isClaudeCodeAvailable()) {
    const skillLoaded = await loadSkill(result.output_path);
    expect(skillLoaded).toBeTruthy();
  }
});
```

#### 3.2 不同输出格式测试
```javascript
describe('不同输出格式测试', () => {
  test('完整包格式', async () => {
    const input = { ...baseInput, output_format: 'full-package' };
    const result = await generateSkill(input);

    expect(result.generated_files.length).toBeGreaterThan(10); // 包含所有文件
    expect(result.generated_files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: expect.stringContaining('skill.json') }),
        expect.objectContaining({ path: expect.stringContaining('tests/') }),
        expect.objectContaining({ path: expect.stringContaining('docs/') })
      ])
    );
  });

  test('最小化格式', async () => {
    const input = { ...baseInput, output_format: 'minimal' };
    const result = await generateSkill(input);

    expect(result.generated_files.length).toBeLessThan(5); // 仅必需文件
    expect(result.generated_files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: expect.stringContaining('skill.json') })
      ])
    );
    expect(result.generated_files).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: expect.stringContaining('tests/') })
      ])
    );
  });

  test('仅模板格式', async () => {
    const input = { ...baseInput, output_format: 'template-only' };
    const result = await generateSkill(input);

    // 仅生成模板文件，不生成实现
    expect(result.generated_files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: expect.stringContaining('template') })
      ])
    );
  });
});
```

### 4. 边界测试
测试极端情况和边界条件。

#### 4.1 输入边界测试
```javascript
test('超长技能名称', () => {
  const longName = 'a'.repeat(100);
  const input = { skill_name: longName, description: 'test', primary_function: 'test' };

  expect(() => validateInput(input)).toThrow('技能名称过长');
});

test('空描述', () => {
  const input = { skill_name: 'test', description: '', primary_function: 'test' };
  expect(() => validateInput(input)).toThrow('描述不能为空');
});

test('特殊字符技能名称', () => {
  const inputs = [
    { skill_name: 'test@skill', description: 'test', primary_function: 'test' },
    { skill_name: 'test&skill', description: 'test', primary_function: 'test' },
    { skill_name: 'test skill', description: 'test', primary_function: 'test' }
  ];

  inputs.forEach(input => {
    expect(() => validateInput(input)).toThrow('技能名称包含无效字符');
  });
});
```

#### 4.2 工具权限边界测试
```javascript
test('空工具列表', () => {
  const input = { skill_name: 'test', description: 'test', primary_function: 'test', tools_needed: [] };
  expect(validateInput(input)).toBe(true); // 空列表应该允许
});

test('重复工具', () => {
  const input = {
    skill_name: 'test',
    description: 'test',
    primary_function: 'test',
    tools_needed: ['read', 'read', 'write'] // 重复的 read
  };

  const result = processTools(input.tools_needed);
  expect(result).toEqual(['read', 'write']); // 应该去重
});
```

#### 4.3 输出目录边界测试
```javascript
test('输出目录已存在', async () => {
  const outputDir = 'temp-output/existing-dir';

  // 创建目录
  fs.mkdirSync(outputDir, { recursive: true });

  const input = { skill_name: 'test', description: 'test', primary_function: 'test' };

  // 应该失败或询问是否覆盖
  await expect(generateSkillToDirectory(input, outputDir))
    .rejects.toThrow('输出目录已存在');

  // 清理
  fs.rmSync(outputDir, { recursive: true });
});

test('无权限的输出目录', async () => {
  if (process.platform !== 'win32') {
    const outputDir = '/root/protected-dir'; // 通常需要 root 权限

    const input = { skill_name: 'test', description: 'test', primary_function: 'test' };

    await expect(generateSkillToDirectory(input, outputDir))
      .rejects.toThrow('无权限访问输出目录');
  }
});
```

### 5. 性能测试
测试生成速度和资源使用。

#### 5.1 生成时间测试
```javascript
test('技能生成性能', async () => {
  const startTime = Date.now();

  await generateSkill(performanceTestInput);

  const endTime = Date.now();
  const duration = endTime - startTime;

  // 生成时间应在合理范围内（如 5 秒内）
  expect(duration).toBeLessThan(5000);
});

test('批量生成性能', async () => {
  const skills = Array(10).fill(0).map((_, i) => ({
    skill_name: `batch-test-${i}`,
    description: `测试技能 ${i}`,
    primary_function: '测试'
  }));

  const startTime = Date.now();

  const results = await Promise.all(skills.map(skill => generateSkill(skill)));

  const endTime = Date.now();
  const duration = endTime - startTime;

  expect(results).toHaveLength(10);
  expect(duration).toBeLessThan(30000); // 30 秒内完成 10 个技能
});
```

#### 5.2 内存使用测试
```javascript
test('内存使用优化', async () => {
  const initialMemory = process.memoryUsage().heapUsed;

  // 生成多个技能
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(generateSkill({
      skill_name: `memory-test-${i}`,
      description: '内存测试',
      primary_function: '测试'
    }));
  }

  await Promise.all(promises);

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;

  // 内存增加应在合理范围内
  expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 小于 100MB
});
```

### 6. 兼容性测试
测试不同环境和配置下的兼容性。

#### 6.1 不同操作系统测试
```javascript
describe('跨平台兼容性', () => {
  test('Windows 路径处理', () => {
    if (process.platform === 'win32') {
      const windowsPath = 'C:\\Users\\Test\\skills';
      const result = normalizePath(windowsPath);
      expect(result).toBe('C:/Users/Test/skills'); // 转换为正斜杠
    }
  });

  test('Linux/Mac 路径处理', () => {
    if (process.platform !== 'win32') {
      const unixPath = '/home/user/skills';
      const result = normalizePath(unixPath);
      expect(result).toBe('/home/user/skills');
    }
  });
});
```

#### 6.2 不同 Node.js 版本测试
```javascript
test('Node.js 版本兼容性', () => {
  // 检查是否使用了不兼容的语法
  const code = fs.readFileSync('src/generator.js', 'utf8');

  // 不应该使用太新的语法（如果目标环境较旧）
  expect(code).not.toContain('??='); // 逻辑赋值运算符（Node.js 15+）
  expect(code).not.toContain('?.');  // 可选链（Node.js 14+）
});
```

### 7. 安全性测试
测试安全相关功能。

#### 7.1 输入验证安全性
```javascript
test('防止路径遍历攻击', () => {
  const maliciousInput = {
    skill_name: 'malicious',
    description: 'test',
    primary_function: 'test',
    output_path: '../../etc/passwd' // 尝试访问系统文件
  };

  expect(() => validateOutputPath(maliciousInput.output_path)).toThrow('无效的输出路径');
});

test('防止代码注入', () => {
  const maliciousDescription = 'test"; rm -rf /; //';
  const input = {
    skill_name: 'test',
    description: maliciousDescription,
    primary_function: 'test'
  };

  const sanitized = sanitizeInput(input);
  expect(sanitized.description).not.toContain('rm -rf');
  expect(sanitized.description).not.toContain('";');
});
```

#### 7.2 权限安全性
```javascript
test('最小权限原则', () => {
  const input = {
    skill_name: 'simple-skill',
    description: '简单技能',
    primary_function: '简单功能',
    tools_needed: ['read', 'write', 'bash', 'webfetch'] // 请求过多权限
  };

  const recommendedTools = recommendTools(input);
  expect(recommendedTools).toEqual(['read']); // 仅推荐必要的权限
});
```

### 8. 回归测试
确保新功能不破坏现有功能。

#### 8.1 核心功能回归测试
```javascript
describe('回归测试套件', () => {
  const regressionTestCases = [
    {
      name: '基本技能生成',
      input: basicSkillInput,
      expected: basicSkillOutput
    },
    {
      name: '协调器技能生成',
      input: coordinatorSkillInput,
      expected: coordinatorSkillOutput
    },
    {
      name: '集成器技能生成',
      input: integrationSkillInput,
      expected: integrationSkillOutput
    }
  ];

  regressionTestCases.forEach(testCase => {
    test(testCase.name, async () => {
      const result = await generateSkill(testCase.input);
      expect(result).toMatchObject(testCase.expected);
    });
  });
});
```

### 9. 测试数据

#### 9.1 测试输入样本
```json
// test-data/inputs/
{
  "basic-skill.json": {
    "skill_name": "test-basic",
    "skill_type": "specialist",
    "description": "基本测试技能",
    "primary_function": "测试基本功能",
    "tools_needed": ["read", "write"],
    "use_cases": ["测试", "演示"]
  },

  "coordinator-skill.json": {
    "skill_name": "test-coordinator",
    "skill_type": "coordinator",
    "description": "协调器测试技能",
    "primary_function": "协调多个子技能",
    "tools_needed": ["read", "write", "context"],
    "use_cases": ["工作流管理", "任务协调"]
  }
}
```

#### 9.2 预期输出样本
```json
// test-data/expected-outputs/
{
  "basic-skill-output.json": {
    "generated_files": [
      {
        "path": "skill-definition/skill.json",
        "description": "技能定义文件"
      },
      {
        "path": "tools/tools.json",
        "description": "工具配置文件"
      }
    ],
    "skill_structure": {
      "type": "specialist",
      "has_tests": true,
      "has_docs": true
    }
  }
}
```

### 10. 测试运行配置

#### 10.1 测试脚本
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:performance": "jest --testPathPattern=performance",
    "test:coverage": "jest --coverage"
  }
}
```

#### 10.2 测试环境变量
```bash
# .env.test
TEST_MODE=true
TEST_OUTPUT_DIR=./temp-test-output
SKIP_PERFORMANCE_TESTS=false
ENABLE_SECURITY_TESTS=true
```

### 11. 测试报告

#### 11.1 报告格式
测试完成后生成以下报告：
- **测试覆盖率报告**（HTML/文本格式）
- **性能测试报告**（JSON格式）
- **安全测试报告**（Markdown格式）
- **回归测试报告**（CSV格式）

#### 11.2 持续集成
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## 测试维护指南

### 1. 添加新测试
1. 确定测试类别（单元、集成、端到端等）
2. 创建测试文件和测试数据
3. 编写测试用例，覆盖正常情况和边界情况
4. 验证测试通过
5. 添加到相应的测试套件中

### 2. 更新测试
1. 当功能变更时更新相关测试
2. 确保测试数据与最新实现保持一致
3. 更新预期输出结果

### 3. 测试故障排除
1. **测试失败**：检查测试数据是否过期
2. **性能下降**：优化测试用例，避免不必要的重复
3. **环境问题**：确保测试环境配置正确
4. **随机失败**：检查测试中的竞态条件或时间依赖

### 4. 测试最佳实践
1. **独立性**：每个测试应该独立运行
2. **可重复性**：测试结果应该一致
3. **全面性**：覆盖各种使用场景
4. **可读性**：测试名称和结构清晰易懂
5. **维护性**：测试代码应该易于维护和更新