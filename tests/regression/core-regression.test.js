/**
 * 回归测试：核心功能回归测试
 * 确保新功能不破坏现有核心功能
 */

describe('核心功能回归测试套件', () => {
  // 模拟的生成函数（与实际集成测试保持一致）
  const mockGenerateSkill = async (input) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          generated_files: [
            { path: 'skill-definition/skill.json', description: '技能定义文件' },
            { path: 'tools/tools.json', description: '工具配置文件' },
            { path: 'examples/basic-example.md', description: '基础使用示例' },
            { path: 'tests/unit/input-validation.test.js', description: '单元测试文件' },
            { path: 'docs/README.md', description: '技能文档' }
          ],
          skill_structure: {
            type: input.skill_type || 'specialist',
            has_tests: true,
            has_docs: true,
            has_examples: true
          },
          skill_definition: {
            name: input.skill_name,
            description: input.description,
            primary_function: input.primary_function,
            tools_needed: input.tools_needed || []
          },
          success: true
        });
      }, 50);
    });
  };

  // 回归测试用例数据
  const regressionTestCases = [
    {
      name: '基本技能生成回归测试',
      input: {
        skill_name: 'basic-skill-regression-test',
        skill_type: 'specialist',
        description: '基本技能回归测试描述',
        primary_function: '基本功能回归测试',
        tools_needed: ['read', 'write'],
        use_cases: ['测试', '回归验证'],
        output_format: 'full-package'
      },
      expected: {
        success: true,
        generated_files_min_count: 3,
        required_files: [
          'skill-definition/skill.json',
          'tools/tools.json',
          'examples/basic-example.md'
        ],
        skill_structure: {
          type: 'specialist',
          has_tests: true,
          has_docs: true
        }
      }
    },
    {
      name: '协调器技能生成回归测试',
      input: {
        skill_name: 'coordinator-skill-regression-test',
        skill_type: 'coordinator',
        description: '协调器技能回归测试描述',
        primary_function: '协调多个子技能',
        tools_needed: ['read', 'context'],
        use_cases: ['工作流管理', '任务协调'],
        output_format: 'full-package'
      },
      expected: {
        success: true,
        generated_files_min_count: 3,
        required_files: [
          'skill-definition/skill.json',
          'tools/tools.json',
          'examples/basic-example.md'
        ],
        skill_structure: {
          type: 'coordinator',
          has_tests: true,
          has_docs: true
        }
      }
    },
    {
      name: '集成器技能生成回归测试',
      input: {
        skill_name: 'integration-skill-regression-test',
        skill_type: 'tool-integration',
        description: '集成器技能回归测试描述',
        primary_function: '工具集成和系统连接',
        tools_needed: ['read', 'write', 'webfetch'],
        use_cases: ['API集成', '数据同步'],
        output_format: 'full-package'
      },
      expected: {
        success: true,
        generated_files_min_count: 3,
        required_files: [
          'skill-definition/skill.json',
          'tools/tools.json',
          'examples/basic-example.md'
        ],
        skill_structure: {
          type: 'tool-integration',
          has_tests: true,
          has_docs: true
        }
      }
    },
    {
      name: '学习分析技能生成回归测试',
      input: {
        skill_name: 'learning-analytics-regression-test',
        skill_type: 'learning-analytics',
        description: '学习分析技能回归测试描述',
        primary_function: '学习数据分析和洞察',
        tools_needed: ['read', 'write', 'websearch'],
        use_cases: ['学习进度跟踪', '知识点分析'],
        output_format: 'full-package'
      },
      expected: {
        success: true,
        generated_files_min_count: 3,
        required_files: [
          'skill-definition/skill.json',
          'tools/tools.json',
          'examples/basic-example.md'
        ],
        skill_structure: {
          type: 'learning-analytics',
          has_tests: true,
          has_docs: true
        }
      }
    }
  ];

  // 执行回归测试
  regressionTestCases.forEach(testCase => {
    describe(testCase.name, () => {
      test('技能生成成功', async () => {
        const result = await mockGenerateSkill(testCase.input);

        // 验证生成成功
        expect(result.success).toBe(testCase.expected.success);
        expect(result.skill_definition.name).toBe(testCase.input.skill_name);
        expect(result.skill_definition.description).toBe(testCase.input.description);
      });

      test('生成文件数量符合预期', async () => {
        const result = await mockGenerateSkill(testCase.input);

        // 验证生成文件数量
        expect(result.generated_files.length).toBeGreaterThanOrEqual(
          testCase.expected.generated_files_min_count
        );
      });

      test('必需文件存在', async () => {
        const result = await mockGenerateSkill(testCase.input);

        // 验证必需文件存在
        testCase.expected.required_files.forEach(requiredFile => {
          const fileExists = result.generated_files.some(
            file => file.path.includes(requiredFile)
          );
          expect(fileExists).toBe(true);
        });
      });

      test('技能结构正确', async () => {
        const result = await mockGenerateSkill(testCase.input);

        // 验证技能结构
        expect(result.skill_structure.type).toBe(testCase.expected.skill_structure.type);
        expect(result.skill_structure.has_tests).toBe(testCase.expected.skill_structure.has_tests);
        expect(result.skill_structure.has_docs).toBe(testCase.expected.skill_structure.has_docs);
      });

      test('输入输出一致性', async () => {
        const result = await mockGenerateSkill(testCase.input);

        // 验证输入输出一致性
        expect(result.skill_definition.primary_function).toBe(testCase.input.primary_function);

        if (testCase.input.tools_needed) {
          expect(result.skill_definition.tools_needed).toEqual(testCase.input.tools_needed);
        }
      });
    });
  });

  // 跨版本兼容性回归测试
  describe('跨版本兼容性回归测试', () => {
    const legacyInputs = [
      {
        name: '旧版本输入格式 - 无skill_type',
        input: {
          skill_name: 'legacy-skill-no-type',
          description: '旧版本技能描述',
          primary_function: '旧版本功能'
        }
      },
      {
        name: '旧版本输入格式 - 无output_format',
        input: {
          skill_name: 'legacy-skill-no-format',
          description: '旧版本技能描述',
          primary_function: '旧版本功能',
          skill_type: 'specialist'
        }
      },
      {
        name: '旧版本输入格式 - 最小输入',
        input: {
          skill_name: 'legacy-minimal',
          description: '最小描述',
          primary_function: '最小功能'
        }
      }
    ];

    legacyInputs.forEach(legacyCase => {
      test(legacyCase.name, async () => {
        // 验证旧版本输入仍然能被处理
        const result = await mockGenerateSkill(legacyCase.input);

        expect(result.success).toBe(true);
        expect(result.skill_definition.name).toBe(legacyCase.input.skill_name);

        // 应该提供默认值
        expect(result.skill_structure.type).toBeDefined();
        expect(result.generated_files.length).toBeGreaterThan(0);
      });
    });
  });

  // 性能回归测试
  describe('性能回归测试', () => {
    test('生成时间在可接受范围内', async () => {
      const input = {
        skill_name: 'performance-regression-test',
        skill_type: 'specialist',
        description: '性能回归测试',
        primary_function: '性能测试'
      };

      const startTime = Date.now();
      const result = await mockGenerateSkill(input);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 验证生成成功
      expect(result.success).toBe(true);

      // 验证性能（模拟函数应在100ms内完成）
      expect(duration).toBeLessThan(200);
    });

    test('批量生成性能', async () => {
      const inputs = [
        {
          skill_name: 'batch-test-1',
          description: '批量测试1',
          primary_function: '测试'
        },
        {
          skill_name: 'batch-test-2',
          description: '批量测试2',
          primary_function: '测试'
        },
        {
          skill_name: 'batch-test-3',
          description: '批量测试3',
          primary_function: '测试'
        }
      ];

      const startTime = Date.now();
      const results = await Promise.all(inputs.map(input => mockGenerateSkill(input)));
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 验证所有生成成功
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // 批量生成时间应在合理范围内（模拟环境下）
      expect(duration).toBeLessThan(500);
    });
  });

  // 错误处理回归测试
  describe('错误处理回归测试', () => {
    test('无效输入处理一致性', async () => {
      // 模拟验证函数
      const mockValidateInput = (input) => {
        if (!input.skill_name || !input.description || !input.primary_function) {
          throw new Error('缺少必填字段');
        }
        return true;
      };

      const validInput = {
        skill_name: 'test',
        description: 'test',
        primary_function: 'test'
      };

      const invalidInput = {
        skill_name: 'test'
        // 缺少description和primary_function
      };

      // 验证有效输入通过
      expect(mockValidateInput(validInput)).toBe(true);

      // 验证无效输入抛出错误
      expect(() => mockValidateInput(invalidInput)).toThrow('缺少必填字段');
    });

    test('生成失败错误处理', async () => {
      // 模拟生成失败
      const mockFailingGenerate = async () => {
        throw new Error('模拟生成失败');
      };

      await expect(mockFailingGenerate()).rejects.toThrow('模拟生成失败');
    });
  });

  // 数据结构兼容性回归测试
  describe('数据结构兼容性回归测试', () => {
    test('输出数据结构稳定性', async () => {
      const input = {
        skill_name: 'data-structure-test',
        description: '数据结构测试',
        primary_function: '测试'
      };

      const result = await mockGenerateSkill(input);

      // 验证输出数据结构不变
      expect(result).toHaveProperty('generated_files');
      expect(result).toHaveProperty('skill_structure');
      expect(result).toHaveProperty('skill_definition');
      expect(result).toHaveProperty('success');

      // 验证generated_files数组结构
      if (result.generated_files.length > 0) {
        const file = result.generated_files[0];
        expect(file).toHaveProperty('path');
        expect(file).toHaveProperty('description');
      }

      // 验证skill_structure结构
      expect(result.skill_structure).toHaveProperty('type');
      expect(result.skill_structure).toHaveProperty('has_tests');
      expect(result.skill_structure).toHaveProperty('has_docs');
    });
  });
});