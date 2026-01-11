/**
 * 边界测试：输入边界
 */

describe('输入边界测试', () => {
  // 模拟验证函数
  const validateInput = (input) => {
    const required = ['skill_name', 'description', 'primary_function'];

    // 检查必填字段是否存在（不为undefined或null）
    const missing = required.filter(field => input[field] === undefined || input[field] === null);

    if (missing.length > 0) {
      throw new Error(`缺少必填字段: ${missing.join(', ')}`);
    }

    // 检查字段是否为空字符串
    if (input.description.trim().length === 0) {
      throw new Error('描述不能为空');
    }

    if (input.primary_function.trim().length === 0) {
      throw new Error('主要功能不能为空');
    }

    // 验证技能名称格式
    if (!/^[a-z0-9-]+$/.test(input.skill_name)) {
      throw new Error('技能名称只能包含小写字母、数字和连字符');
    }

    // 验证技能名称长度
    if (input.skill_name.length > 50) {
      throw new Error('技能名称过长（最大50字符）');
    }

    // 验证描述长度
    if (input.description.length > 1000) {
      throw new Error('描述过长（最大1000字符）');
    }

    return true;
  };

  describe('技能名称边界测试', () => {
    test('超长技能名称（> 50字符）', () => {
      const longName = 'a'.repeat(51);
      const input = {
        skill_name: longName,
        description: '测试描述',
        primary_function: '测试功能'
      };

      expect(() => validateInput(input)).toThrow('技能名称过长（最大50字符）');
    });

    test('最小有效技能名称（1字符）', () => {
      const minimalName = 'a';
      const input = {
        skill_name: minimalName,
        description: '测试描述',
        primary_function: '测试功能'
      };

      expect(validateInput(input)).toBe(true);
      expect(input.skill_name.length).toBe(1);
    });

    test('最大有效技能名称（50字符）', () => {
      const maxName = 'a'.repeat(50);
      const input = {
        skill_name: maxName,
        description: '测试描述',
        primary_function: '测试功能'
      };

      expect(validateInput(input)).toBe(true);
      expect(input.skill_name.length).toBe(50);
    });

    test('边界值：49字符应该通过', () => {
      const name49 = 'a'.repeat(49);
      const input = {
        skill_name: name49,
        description: '测试描述',
        primary_function: '测试功能'
      };

      expect(validateInput(input)).toBe(true);
    });

    test('边界值：51字符应该失败', () => {
      const name51 = 'a'.repeat(51);
      const input = {
        skill_name: name51,
        description: '测试描述',
        primary_function: '测试功能'
      };

      expect(() => validateInput(input)).toThrow('技能名称过长');
    });
  });

  describe('技能名称格式边界测试', () => {
    test('包含空格的技能名称', () => {
      const inputs = [
        'test skill',
        'test  skill',
        ' test',
        'test '
      ];

      inputs.forEach(skill_name => {
        const input = {
          skill_name,
          description: '测试描述',
          primary_function: '测试功能'
        };

        expect(() => validateInput(input)).toThrow('技能名称只能包含小写字母、数字和连字符');
      });
    });

    test('包含大写字母的技能名称', () => {
      const inputs = [
        'TestSkill',
        'testSkill',
        'TEST',
        'Test-Skill'
      ];

      inputs.forEach(skill_name => {
        const input = {
          skill_name,
          description: '测试描述',
          primary_function: '测试功能'
        };

        expect(() => validateInput(input)).toThrow('技能名称只能包含小写字母、数字和连字符');
      });
    });

    test('包含特殊字符的技能名称', () => {
      const inputs = [
        'test@skill',
        'test&skill',
        'test_skill',
        'test.skill',
        'test#skill',
        'test$skill',
        'test%skill',
        'test*skill'
      ];

      inputs.forEach(skill_name => {
        const input = {
          skill_name,
          description: '测试描述',
          primary_function: '测试功能'
        };

        expect(() => validateInput(input)).toThrow('技能名称只能包含小写字母、数字和连字符');
      });
    });

    test('有效的技能名称格式', () => {
      const validNames = [
        'test-skill',
        'test-123',
        '123-test',
        'test-123-skill',
        'a',
        'a-b-c-d'
      ];

      validNames.forEach(skill_name => {
        const input = {
          skill_name,
          description: '测试描述',
          primary_function: '测试功能'
        };

        expect(validateInput(input)).toBe(true);
      });
    });
  });

  describe('描述字段边界测试', () => {
    test('空描述', () => {
      const input = {
        skill_name: 'test-skill',
        description: '',
        primary_function: '测试功能'
      };

      expect(() => validateInput(input)).toThrow('描述不能为空');
    });

    test('仅空白字符的描述', () => {
      const input = {
        skill_name: 'test-skill',
        description: '   \t\n  ',
        primary_function: '测试功能'
      };

      // 注意：我们的验证只检查长度，不trim，所以需要调整
      // 为了测试，我们添加trim验证
      const validateWithTrim = (input) => {
        if (input.description.trim().length === 0) {
          throw new Error('描述不能为空或仅空白字符');
        }
        return validateInput(input);
      };

      expect(() => validateWithTrim(input)).toThrow('描述不能为空或仅空白字符');
    });

    test('最小有效描述（1字符）', () => {
      const input = {
        skill_name: 'test-skill',
        description: 'a',
        primary_function: '测试功能'
      };

      expect(validateInput(input)).toBe(true);
    });

    test('最大有效描述（1000字符）', () => {
      const maxDescription = 'a'.repeat(1000);
      const input = {
        skill_name: 'test-skill',
        description: maxDescription,
        primary_function: '测试功能'
      };

      expect(validateInput(input)).toBe(true);
      expect(input.description.length).toBe(1000);
    });

    test('超长描述（1001字符）', () => {
      const tooLongDescription = 'a'.repeat(1001);
      const input = {
        skill_name: 'test-skill',
        description: tooLongDescription,
        primary_function: '测试功能'
      };

      expect(() => validateInput(input)).toThrow('描述过长（最大1000字符）');
    });

    test('边界值：999字符应该通过', () => {
      const description999 = 'a'.repeat(999);
      const input = {
        skill_name: 'test-skill',
        description: description999,
        primary_function: '测试功能'
      };

      expect(validateInput(input)).toBe(true);
    });

    test('边界值：1001字符应该失败', () => {
      const description1001 = 'a'.repeat(1001);
      const input = {
        skill_name: 'test-skill',
        description: description1001,
        primary_function: '测试功能'
      };

      expect(() => validateInput(input)).toThrow('描述过长');
    });
  });

  describe('主要功能字段边界测试', () => {
    test('空主要功能', () => {
      const input = {
        skill_name: 'test-skill',
        description: '测试描述',
        primary_function: ''
      };

      expect(() => validateInput(input)).toThrow('主要功能不能为空');
    });

    test('超长主要功能', () => {
      // 假设主要功能也有长度限制（例如500字符）
      const validateWithFunctionLimit = (input) => {
        validateInput(input);

        if (input.primary_function.length > 500) {
          throw new Error('主要功能过长（最大500字符）');
        }
        return true;
      };

      const longFunction = 'a'.repeat(501);
      const input = {
        skill_name: 'test-skill',
        description: '测试描述',
        primary_function: longFunction
      };

      expect(() => validateWithFunctionLimit(input)).toThrow('主要功能过长');
    });
  });

  describe('工具列表边界测试', () => {
    const validateTools = (tools) => {
      if (!Array.isArray(tools)) {
        throw new Error('工具列表必须是数组');
      }

      const validTools = ['read', 'write', 'edit', 'bash', 'webfetch', 'websearch', 'context'];
      const invalid = tools.filter(tool => !validTools.includes(tool));

      if (invalid.length > 0) {
        throw new Error(`无效的工具: ${invalid.join(', ')}`);
      }

      // 检查重复
      const uniqueTools = [...new Set(tools)];
      if (uniqueTools.length !== tools.length) {
        throw new Error('工具列表包含重复项');
      }

      return true;
    };

    test('空工具列表', () => {
      expect(validateTools([])).toBe(true);
    });

    test('最大工具列表（所有有效工具）', () => {
      const allTools = ['read', 'write', 'edit', 'bash', 'webfetch', 'websearch', 'context'];
      expect(validateTools(allTools)).toBe(true);
    });

    test('重复工具', () => {
      const duplicateTools = ['read', 'read', 'write'];
      expect(() => validateTools(duplicateTools)).toThrow('工具列表包含重复项');
    });

    test('无效工具', () => {
      const invalidTools = ['read', 'invalid-tool', 'write'];
      expect(() => validateTools(invalidTools)).toThrow('无效的工具');
    });

    test('混合有效和无效工具', () => {
      const mixedTools = ['read', 'write', 'unknown-tool'];
      expect(() => validateTools(mixedTools)).toThrow('无效的工具: unknown-tool');
    });

    test('工具列表不是数组', () => {
      expect(() => validateTools('read,write')).toThrow('工具列表必须是数组');
      expect(() => validateTools(null)).toThrow('工具列表必须是数组');
      expect(() => validateTools({})).toThrow('工具列表必须是数组');
    });
  });

  describe('使用场景边界测试', () => {
    const validateUseCases = (useCases) => {
      if (!Array.isArray(useCases)) {
        throw new Error('使用场景必须是数组');
      }

      if (useCases.length > 10) {
        throw new Error('使用场景数量过多（最大10个）');
      }

      useCases.forEach((useCase, index) => {
        if (typeof useCase !== 'string') {
          throw new Error(`使用场景 ${index} 必须是字符串`);
        }

        if (useCase.length > 100) {
          throw new Error(`使用场景 ${index} 过长（最大100字符）`);
        }
      });

      return true;
    };

    test('空使用场景数组', () => {
      expect(validateUseCases([])).toBe(true);
    });

    test('最大数量使用场景（10个）', () => {
      const maxUseCases = Array(10).fill(0).map((_, i) => `使用场景 ${i + 1}`);
      expect(validateUseCases(maxUseCases)).toBe(true);
    });

    test('超量使用场景（11个）', () => {
      const tooManyUseCases = Array(11).fill(0).map((_, i) => `使用场景 ${i + 1}`);
      expect(() => validateUseCases(tooManyUseCases)).toThrow('使用场景数量过多');
    });

    test('超长使用场景', () => {
      const longUseCase = 'a'.repeat(101);
      expect(() => validateUseCases([longUseCase])).toThrow('使用场景 0 过长');
    });

    test('非字符串使用场景', () => {
      expect(() => validateUseCases([123])).toThrow('使用场景 0 必须是字符串');
      expect(() => validateUseCases([{}])).toThrow('使用场景 0 必须是字符串');
    });
  });

  describe('综合边界测试', () => {
    test('所有字段都在边界值', () => {
      const boundaryInput = {
        skill_name: 'a'.repeat(50), // 最大长度
        description: 'a'.repeat(1000), // 最大长度
        primary_function: '测试功能',
        tools_needed: ['read', 'write'],
        use_cases: Array(10).fill(0).map((_, i) => `场景${i + 1}`) // 最大数量
      };

      // 工具验证函数（从工具列表边界测试复制）
      const validateTools = (tools) => {
        if (!Array.isArray(tools)) {
          throw new Error('工具列表必须是数组');
        }

        const validTools = ['read', 'write', 'edit', 'bash', 'webfetch', 'websearch', 'context'];
        const invalid = tools.filter(tool => !validTools.includes(tool));

        if (invalid.length > 0) {
          throw new Error(`无效的工具: ${invalid.join(', ')}`);
        }

        // 检查重复
        const uniqueTools = [...new Set(tools)];
        if (uniqueTools.length !== tools.length) {
          throw new Error('工具列表包含重复项');
        }

        return true;
      };

      // 使用场景验证函数（从使用场景边界测试复制）
      const validateUseCases = (useCases) => {
        if (!Array.isArray(useCases)) {
          throw new Error('使用场景必须是数组');
        }

        if (useCases.length > 10) {
          throw new Error('使用场景数量过多（最大10个）');
        }

        useCases.forEach((useCase, index) => {
          if (typeof useCase !== 'string') {
            throw new Error(`使用场景 ${index} 必须是字符串`);
          }

          if (useCase.length > 100) {
            throw new Error(`使用场景 ${index} 过长（最大100字符）`);
          }
        });

        return true;
      };

      // 综合验证函数
      const validateAll = (input) => {
        validateInput(input);
        if (input.tools_needed) validateTools(input.tools_needed);
        if (input.use_cases) validateUseCases(input.use_cases);
        return true;
      };

      expect(validateAll(boundaryInput)).toBe(true);
    });

    test('所有字段都在超出边界值', () => {
      const exceedingInput = {
        skill_name: 'a'.repeat(51), // 超长
        description: 'a'.repeat(1001), // 超长
        primary_function: '',
        tools_needed: ['read', 'invalid-tool'],
        use_cases: Array(11).fill(0).map((_, i) => `场景${i + 1}`) // 超量
      };

      // 应该抛出第一个遇到的错误
      expect(() => validateInput(exceedingInput)).toThrow('主要功能不能为空');
    });
  });
});