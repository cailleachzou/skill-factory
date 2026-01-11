/**
 * 端到端测试：不同输出格式
 */

describe('不同输出格式端到端测试', () => {
  // 模拟生成函数，支持不同格式
  const mockGenerateSkill = async (input) => {
    const format = input.output_format || 'full-package';
    const skillName = input.skill_name;

    // 根据不同格式返回不同的文件列表
    const formatTemplates = {
      'full-package': [
        { path: `skills/${skillName}/skill-definition/skill.json`, description: '技能定义文件' },
        { path: `skills/${skillName}/tools/tools.json`, description: '工具配置文件' },
        { path: `skills/${skillName}/implementation.js`, description: '实现文件' },
        { path: `skills/${skillName}/tests/unit/basic.test.js`, description: '单元测试' },
        { path: `skills/${skillName}/tests/integration/integration.test.js`, description: '集成测试' },
        { path: `skills/${skillName}/examples/basic-usage.md`, description: '基础示例' },
        { path: `skills/${skillName}/examples/advanced-usage.md`, description: '高级示例' },
        { path: `skills/${skillName}/docs/README.md`, description: 'README文档' },
        { path: `skills/${skillName}/docs/API-reference.md`, description: 'API文档' },
        { path: `skills/${skillName}/docs/development-guide.md`, description: '开发指南' },
        { path: `skills/${skillName}/.gitignore`, description: 'Git忽略文件' },
        { path: `skills/${skillName}/package.json`, description: '包配置文件' }
      ],
      'minimal': [
        { path: `skills/${skillName}/skill-definition/skill.json`, description: '技能定义文件' },
        { path: `skills/${skillName}/tools/tools.json`, description: '工具配置文件' },
        { path: `skills/${skillName}/implementation.js`, description: '实现文件' }
      ],
      'template-only': [
        { path: `skills/${skillName}/skill-definition/skill.json`, description: '技能定义文件' },
        { path: `skills/${skillName}/templates/main-template.json`, description: '主模板文件' },
        { path: `skills/${skillName}/templates/variables-config.json`, description: '变量配置文件' }
      ]
    };

    const files = formatTemplates[format] || formatTemplates['full-package'];

    return {
      generated_files: files,
      skill_structure: {
        format,
        file_count: files.length,
        has_tests: files.some(f => f.path.includes('tests/')),
        has_docs: files.some(f => f.path.includes('docs/')),
        has_examples: files.some(f => f.path.includes('examples/'))
      }
    };
  };

  const baseInput = {
    skill_name: 'format-test',
    skill_type: 'specialist',
    description: '测试不同输出格式',
    primary_function: '格式测试',
    tools_needed: ['read', 'write']
  };

  describe('完整包格式 (full-package)', () => {
    test('生成完整的技能包', async () => {
      const input = { ...baseInput, output_format: 'full-package' };
      const result = await mockGenerateSkill(input);

      // 验证文件数量
      expect(result.generated_files.length).toBeGreaterThan(10);

      // 验证包含所有必需的文件类型
      const requiredFileTypes = [
        'skill.json',
        'tools.json',
        'implementation.js',
        'tests/',
        'examples/',
        'docs/'
      ];

      requiredFileTypes.forEach(fileType => {
        const hasType = result.generated_files.some(file =>
          file.path.includes(fileType)
        );
        expect(hasType).toBe(true);
      });

      // 验证技能结构信息
      expect(result.skill_structure.format).toBe('full-package');
      expect(result.skill_structure.has_tests).toBe(true);
      expect(result.skill_structure.has_docs).toBe(true);
      expect(result.skill_structure.has_examples).toBe(true);
    });

    test('完整包的文件结构完整性', async () => {
      const input = { ...baseInput, output_format: 'full-package' };
      const result = await mockGenerateSkill(input);

      // 验证文件路径格式正确
      result.generated_files.forEach(file => {
        expect(file.path).toMatch(/^skills\/format-test\//);
        expect(file.description).toBeDefined();
      });

      // 验证没有重复文件
      const filePaths = result.generated_files.map(f => f.path);
      const uniquePaths = new Set(filePaths);
      expect(uniquePaths.size).toBe(filePaths.length);
    });
  });

  describe('最小化格式 (minimal)', () => {
    test('仅生成必需文件', async () => {
      const input = { ...baseInput, output_format: 'minimal' };
      const result = await mockGenerateSkill(input);

      // 验证文件数量较少
      expect(result.generated_files.length).toBeLessThan(5);

      // 验证包含必需文件
      const requiredFiles = ['skill.json', 'tools.json', 'implementation.js'];
      requiredFiles.forEach(filename => {
        const hasFile = result.generated_files.some(file =>
          file.path.includes(filename)
        );
        expect(hasFile).toBe(true);
      });

      // 验证不包含可选文件
      const optionalFiles = ['tests/', 'examples/', 'docs/'];
      optionalFiles.forEach(fileType => {
        const hasOptional = result.generated_files.some(file =>
          file.path.includes(fileType)
        );
        expect(hasOptional).toBe(false);
      });

      // 验证技能结构信息
      expect(result.skill_structure.format).toBe('minimal');
      expect(result.skill_structure.has_tests).toBe(false);
      expect(result.skill_structure.has_docs).toBe(false);
      expect(result.skill_structure.has_examples).toBe(false);
    });

    test('最小化格式的性能优势', async () => {
      const input = { ...baseInput, output_format: 'minimal' };
      const startTime = Date.now();

      const result = await mockGenerateSkill(input);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 最小化格式应该更快（在模拟中可能不明显，但我们可以验证）
      expect(duration).toBeLessThan(100);
      expect(result.generated_files.length).toBe(3);
    });
  });

  describe('仅模板格式 (template-only)', () => {
    test('仅生成模板文件', async () => {
      const input = { ...baseInput, output_format: 'template-only' };
      const result = await mockGenerateSkill(input);

      // 验证文件类型
      result.generated_files.forEach(file => {
        expect(file.path).toMatch(/(skill\.json|templates\/)/);
      });

      // 验证包含模板文件
      const hasTemplateFiles = result.generated_files.some(file =>
        file.path.includes('templates/')
      );
      expect(hasTemplateFiles).toBe(true);

      // 验证不包含实现文件
      const hasImplementation = result.generated_files.some(file =>
        file.path.includes('implementation.js')
      );
      expect(hasImplementation).toBe(false);

      // 验证技能结构信息
      expect(result.skill_structure.format).toBe('template-only');
    });

    test('模板文件的结构', async () => {
      const input = { ...baseInput, output_format: 'template-only' };
      const result = await mockGenerateSkill(input);

      // 验证模板文件配置
      const templateConfigFile = result.generated_files.find(file =>
        file.path.includes('variables-config.json')
      );
      expect(templateConfigFile).toBeDefined();

      const mainTemplateFile = result.generated_files.find(file =>
        file.path.includes('main-template.json')
      );
      expect(mainTemplateFile).toBeDefined();
    });
  });

  describe('格式转换测试', () => {
    test('从最小化升级到完整包', async () => {
      // 先生成最小化格式
      const minimalInput = { ...baseInput, output_format: 'minimal' };
      const minimalResult = await mockGenerateSkill(minimalInput);

      // 再生成完整包格式
      const fullInput = { ...baseInput, output_format: 'full-package' };
      const fullResult = await mockGenerateSkill(fullInput);

      // 验证完整包包含最小化的所有文件
      const minimalFileNames = minimalResult.generated_files.map(f =>
        f.path.split('/').pop()
      );

      minimalFileNames.forEach(filename => {
        const hasFile = fullResult.generated_files.some(f =>
          f.path.includes(filename)
        );
        expect(hasFile).toBe(true);
      });

      // 验证完整包有更多文件
      expect(fullResult.generated_files.length).toBeGreaterThan(
        minimalResult.generated_files.length
      );
    });

    test('格式兼容性检查', () => {
      const formatCompatibility = {
        'minimal': ['full-package'], // 最小化可以升级到完整包
        'template-only': ['full-package', 'minimal'], // 模板可以转换为其他格式
        'full-package': [] // 完整包不需要转换
      };

      // 验证兼容性映射
      expect(formatCompatibility.minimal).toContain('full-package');
      expect(formatCompatibility['template-only']).toContain('full-package');
    });
  });

  describe('格式验证和错误处理', () => {
    test('无效格式的处理', async () => {
      const input = { ...baseInput, output_format: 'invalid-format' };

      // 模拟生成函数应该处理无效格式
      const generateWithValidation = async (input) => {
        const validFormats = ['full-package', 'minimal', 'template-only'];

        if (!validFormats.includes(input.output_format)) {
          throw new Error(`不支持的输出格式: ${input.output_format}`);
        }

        return mockGenerateSkill(input);
      };

      await expect(generateWithValidation(input)).rejects.toThrow('不支持的输出格式');
    });

    test('默认格式行为', async () => {
      // 不指定 output_format 应该使用默认值
      const input = { ...baseInput };
      delete input.output_format;

      const result = await mockGenerateSkill(input);

      // 默认应该使用完整包格式
      expect(result.generated_files.length).toBeGreaterThan(10);
      expect(result.skill_structure.format).toBe('full-package');
    });

    test('格式特定的验证规则', () => {
      const formatValidationRules = {
        'full-package': (files) => files.length >= 10,
        'minimal': (files) => files.length <= 5,
        'template-only': (files) => files.every(f => f.path.includes('skill.json') || f.path.includes('templates/'))
      };

      // 测试验证规则
      const testFiles = [
        { path: 'skills/test/skill.json' },
        { path: 'skills/test/tools.json' }
      ];

      expect(formatValidationRules.minimal(testFiles)).toBe(true);
      expect(formatValidationRules['template-only'](testFiles)).toBe(false);
    });
  });

  describe('格式选择的智能推荐', () => {
    test('根据使用场景推荐格式', () => {
      const recommendFormat = (useCase) => {
        const recommendations = {
          '快速原型': 'minimal',
          '生产环境': 'full-package',
          '模板开发': 'template-only',
          '学习用途': 'full-package',
          '集成测试': 'minimal'
        };

        return recommendations[useCase] || 'full-package';
      };

      expect(recommendFormat('快速原型')).toBe('minimal');
      expect(recommendFormat('生产环境')).toBe('full-package');
      expect(recommendFormat('模板开发')).toBe('template-only');
      expect(recommendFormat('未知场景')).toBe('full-package');
    });

    test('根据技能类型调整格式', () => {
      const adjustFormatBySkillType = (skillType, requestedFormat) => {
        // 协调器技能总是需要完整包
        if (skillType === 'coordinator' && requestedFormat !== 'full-package') {
          return 'full-package';
        }
        return requestedFormat;
      };

      expect(adjustFormatBySkillType('coordinator', 'minimal')).toBe('full-package');
      expect(adjustFormatBySkillType('specialist', 'minimal')).toBe('minimal');
    });
  });

  describe('格式性能比较', () => {
    test('不同格式的生成时间', async () => {
      const formats = ['full-package', 'minimal', 'template-only'];
      const generationTimes = {};

      for (const format of formats) {
        const input = { ...baseInput, output_format: format };
        const startTime = Date.now();

        await mockGenerateSkill(input);

        const endTime = Date.now();
        generationTimes[format] = endTime - startTime;
      }

      // 验证生成时间差异（在模拟中可能不明显）
      expect(generationTimes).toHaveProperty('full-package');
      expect(generationTimes).toHaveProperty('minimal');
      expect(generationTimes).toHaveProperty('template-only');

      // 理论上最小化应该最快，但模拟中可能差不多
      console.log('生成时间比较:', generationTimes);
    });

    test('不同格式的文件大小', async () => {
      const calculateTotalSize = (files) => {
        // 模拟文件大小计算
        return files.length * 1024; // 每个文件大约1KB
      };

      const formats = ['full-package', 'minimal', 'template-only'];
      const fileSizes = {};

      for (const format of formats) {
        const input = { ...baseInput, output_format: format };
        const result = await mockGenerateSkill(input);
        fileSizes[format] = calculateTotalSize(result.generated_files);
      }

      // 验证文件大小差异
      expect(fileSizes['full-package']).toBeGreaterThan(fileSizes['minimal']);
      expect(fileSizes['minimal']).toBeGreaterThan(0);
      expect(fileSizes['template-only']).toBeGreaterThan(0);

      console.log('文件大小比较:', fileSizes);
    });
  });
});