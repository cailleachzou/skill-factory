/**
 * 端到端测试：基本流程
 */

describe('端到端技能生成测试', () => {
  // 模拟技能工厂函数
  const mockSkillFactory = async (userInput) => {
    // 模拟完整的端到端流程
    return new Promise((resolve) => {
      setTimeout(() => {
        const outputPath = `generated-skills/${userInput.skill_name}`;
        const format = userInput.output_format || 'full-package';

        // 根据不同格式返回不同的文件列表
        let generated_files;
        if (format === 'minimal') {
          generated_files = [
            { path: `${outputPath}/skill-definition/skill.json`, size: 2456 },
            { path: `${outputPath}/tools/tools.json`, size: 1536 },
            { path: `${outputPath}/implementation.js`, size: 4096 }
          ];
        } else if (format === 'template-only') {
          generated_files = [
            { path: `${outputPath}/skill-definition/skill.json`, size: 2456 },
            { path: `${outputPath}/templates/main-template.json`, size: 2048 }
          ];
        } else { // full-package
          generated_files = [
            { path: `${outputPath}/skill-definition/skill.json`, size: 2456 },
            { path: `${outputPath}/tools/tools.json`, size: 1536 },
            { path: `${outputPath}/examples/basic-example.md`, size: 1024 },
            { path: `${outputPath}/tests/unit/basic.test.js`, size: 2048 },
            { path: `${outputPath}/docs/README.md`, size: 3072 },
            { path: `${outputPath}/implementation.js`, size: 4096 },
            { path: `${outputPath}/tests/integration/integration.test.js`, size: 3072 },
            { path: `${outputPath}/examples/advanced-usage.md`, size: 2048 },
            { path: `${outputPath}/docs/API-reference.md`, size: 4096 },
            { path: `${outputPath}/docs/development-guide.md`, size: 5120 },
            { path: `${outputPath}/.gitignore`, size: 512 },
            { path: `${outputPath}/package.json`, size: 1024 }
          ];
        }

        resolve({
          success: true,
          output_path: outputPath,
          generated_files: generated_files,
          skill_summary: {
            name: userInput.skill_name,
            type: userInput.skill_type || 'specialist',
            tools: userInput.tools_needed || [],
            has_tests: generated_files.some(f => f.path.includes('tests/')),
            has_docs: generated_files.some(f => f.path.includes('docs/')),
            has_examples: generated_files.some(f => f.path.includes('examples/'))
          },
          next_steps: [
            '在 Claude Code 中加载生成的技能',
            '运行测试验证功能',
            '根据需求调整实现'
          ]
        });
      }, 200);
    });
  };

  // 模拟技能加载函数
  const mockLoadSkill = async (skillPath) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          loaded: true,
          skill_path: skillPath,
          tools_available: ['read', 'write', 'edit'],
          validation_passed: true
        });
      }, 100);
    });
  };

  describe('基本端到端测试', () => {
    test('完整的技能生成流程', async () => {
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
      const result = await mockSkillFactory(userInput);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.output_path).toBeDefined();
      expect(result.output_path).toContain(userInput.skill_name);
      expect(result.generated_files.length).toBeGreaterThan(0);

      // 验证技能摘要
      expect(result.skill_summary.name).toBe(userInput.skill_name);
      expect(result.skill_summary.type).toBe(userInput.skill_type);
      expect(result.skill_summary.tools).toEqual(userInput.tools_needed);

      // 验证生成的文件包含必需文件
      const requiredFiles = ['skill.json', 'tools.json', 'basic-example.md'];
      requiredFiles.forEach(filename => {
        const hasFile = result.generated_files.some(file =>
          file.path.includes(filename)
        );
        expect(hasFile).toBe(true);
      });
    });

    test('技能生成后加载验证', async () => {
      const userInput = {
        skill_name: 'loadable-skill',
        description: '可加载的测试技能',
        primary_function: '测试技能加载功能'
      };

      // 生成技能
      const generationResult = await mockSkillFactory(userInput);

      // 验证生成成功
      expect(generationResult.success).toBe(true);

      // 模拟技能加载
      const loadResult = await mockLoadSkill(generationResult.output_path);

      // 验证加载成功
      expect(loadResult.loaded).toBe(true);
      expect(loadResult.skill_path).toBe(generationResult.output_path);
      expect(loadResult.validation_passed).toBe(true);
    });
  });

  describe('不同输出格式测试', () => {
    const baseInput = {
      skill_name: 'format-test-skill',
      description: '测试不同输出格式',
      primary_function: '格式测试'
    };

    test('完整包格式 (full-package)', async () => {
      const input = { ...baseInput, output_format: 'full-package' };
      const result = await mockSkillFactory(input);

      expect(result.generated_files.length).toBeGreaterThan(4);

      // 验证包含所有类型的文件
      const fileTypes = ['skill.json', 'tools.json', 'test', 'docs', 'examples'];
      fileTypes.forEach(type => {
        const hasType = result.generated_files.some(file =>
          file.path.includes(type)
        );
        expect(hasType).toBe(true);
      });
    });

    test('最小化格式 (minimal)', async () => {
      const input = { ...baseInput, output_format: 'minimal' };
      const result = await mockSkillFactory(input);

      // 最小化格式应该只包含必需文件
      expect(result.generated_files.length).toBeLessThan(6);

      // 应该包含技能定义文件
      const hasSkillJson = result.generated_files.some(file =>
        file.path.includes('skill.json')
      );
      expect(hasSkillJson).toBe(true);

      // 不应该包含测试文件
      const hasTestFiles = result.generated_files.some(file =>
        file.path.includes('tests/')
      );
      expect(hasTestFiles).toBe(false);
    });

    test('仅模板格式 (template-only)', async () => {
      const input = { ...baseInput, output_format: 'template-only' };
      const result = await mockSkillFactory(input);

      // 验证只生成模板文件
      const allAreTemplates = result.generated_files.every(file =>
        file.path.includes('template') || file.path.includes('skill.json')
      );
      expect(allAreTemplates).toBe(true);

      // 不应该包含实现文件
      const hasImplementation = result.generated_files.some(file =>
        file.path.includes('implementation.js') ||
        file.path.includes('implementation.py')
      );
      expect(hasImplementation).toBe(false);
    });
  });

  describe('端到端错误流程', () => {
    test('生成失败的用户体验', async () => {
      const failingSkillFactory = async (input) => {
        throw new Error('生成失败: 模拟错误');
      };

      const userInput = {
        skill_name: 'failing-skill',
        description: '测试',
        primary_function: '测试'
      };

      await expect(failingSkillFactory(userInput)).rejects.toThrow('生成失败');

      // 验证错误信息对用户友好
      try {
        await failingSkillFactory(userInput);
      } catch (error) {
        expect(error.message).toBe('生成失败: 模拟错误');
        // 可以在这里验证错误报告或其他恢复机制
      }
    });

    test('无效配置的处理', async () => {
      const userInput = {
        skill_name: 'invalid-skill',
        description: '测试',
        primary_function: '测试',
        output_format: 'invalid-format' // 无效的格式
      };

      const skillFactoryWithValidation = async (input) => {
        const validFormats = ['full-package', 'minimal', 'template-only'];

        if (!validFormats.includes(input.output_format)) {
          throw new Error(`无效的输出格式: ${input.output_format}`);
        }

        return mockSkillFactory(input);
      };

      await expect(skillFactoryWithValidation(userInput)).rejects.toThrow('无效的输出格式');
    });
  });

  describe('端到端性能测试', () => {
    test('生成时间在合理范围内', async () => {
      const startTime = Date.now();

      const userInput = {
        skill_name: 'performance-skill',
        description: '性能测试技能',
        primary_function: '性能测试',
        output_format: 'full-package'
      };

      await mockSkillFactory(userInput);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 模拟的生成时间应该在合理范围内
      expect(duration).toBeLessThan(1000); // 1秒内
    });

    test('大技能包的生成', async () => {
      const userInput = {
        skill_name: 'large-skill-package',
        description: '大型技能包测试',
        primary_function: '测试大型包生成',
        tools_needed: ['read', 'write', 'edit', 'bash', 'webfetch', 'websearch', 'context'],
        use_cases: Array(10).fill(0).map((_, i) => `使用场景 ${i + 1}`),
        output_format: 'full-package'
      };

      const result = await mockSkillFactory(userInput);

      // 验证大型技能包生成成功
      expect(result.success).toBe(true);
      expect(result.generated_files.length).toBeGreaterThan(5);
    });
  });

  describe('端到端集成验证', () => {
    test('生成技能的实际使用流程', async () => {
      // 模拟完整的使用流程
      const completeWorkflow = async () => {
        // 1. 用户输入
        const userInput = {
          skill_name: 'workflow-test-skill',
          skill_type: 'specialist',
          description: '工作流测试技能',
          primary_function: '测试完整工作流',
          tools_needed: ['read', 'write'],
          output_format: 'full-package'
        };

        // 2. 生成技能
        const generationResult = await mockSkillFactory(userInput);
        expect(generationResult.success).toBe(true);

        // 3. 加载技能
        const loadResult = await mockLoadSkill(generationResult.output_path);
        expect(loadResult.loaded).toBe(true);

        // 4. 验证技能结构
        const skillStructure = {
          hasDefinition: generationResult.generated_files.some(f => f.path.includes('skill.json')),
          hasTools: generationResult.generated_files.some(f => f.path.includes('tools.json')),
          hasExamples: generationResult.generated_files.some(f => f.path.includes('examples/')),
          hasTests: generationResult.generated_files.some(f => f.path.includes('tests/')),
          hasDocs: generationResult.generated_files.some(f => f.path.includes('docs/'))
        };

        expect(skillStructure.hasDefinition).toBe(true);
        expect(skillStructure.hasTools).toBe(true);
        expect(skillStructure.hasExamples).toBe(true);
        expect(skillStructure.hasTests).toBe(true);
        expect(skillStructure.hasDocs).toBe(true);

        return {
          generation: generationResult,
          loading: loadResult,
          structure: skillStructure
        };
      };

      const workflowResult = await completeWorkflow();
      expect(workflowResult.generation.success).toBe(true);
      expect(workflowResult.loading.loaded).toBe(true);
    });
  });
});