/**
 * 安全测试：权限安全性
 */

describe('权限安全性测试', () => {
  describe('最小权限原则', () => {
    const recommendTools = (skillDescription, primaryFunction) => {
      // 基于技能描述和功能推荐最小必要工具
      const toolRecommendations = {
        '文件操作': ['read'],
        '代码编辑': ['read', 'edit'],
        '系统管理': ['bash'],
        '网络访问': ['webfetch'],
        '搜索功能': ['websearch'],
        '上下文管理': ['context']
      };

      // 默认推荐
      let recommended = ['read'];

      // 根据功能推荐
      Object.entries(toolRecommendations).forEach(([func, tools]) => {
        if (primaryFunction.toLowerCase().includes(func.toLowerCase())) {
          recommended = [...new Set([...recommended, ...tools])];
        }
      });

      // 根据描述关键词调整
      const descriptionKeywords = {
        '读取': ['read'],
        '写入': ['write'],
        '编辑': ['edit'],
        '执行': ['bash'],
        '获取': ['webfetch'],
        '搜索': ['websearch'],
        '上下文': ['context']
      };

      Object.entries(descriptionKeywords).forEach(([keyword, tools]) => {
        if (skillDescription.includes(keyword)) {
          recommended = [...new Set([...recommended, ...tools])];
        }
      });

      return recommended.sort();
    };

    test('简单技能的最小权限', () => {
      const simpleSkill = {
        description: '读取文件内容',
        primaryFunction: '文件操作'
      };

      const tools = recommendTools(simpleSkill.description, simpleSkill.primaryFunction);
      expect(tools).toEqual(['read']);
      expect(tools.length).toBe(1);
    });

    test('复杂技能的权限推荐', () => {
      const complexSkill = {
        description: '读取、编辑代码文件并执行测试',
        primaryFunction: '代码开发和测试'
      };

      const tools = recommendTools(complexSkill.description, complexSkill.primaryFunction);
      expect(tools).toContain('read');
      expect(tools).toContain('edit');
      expect(tools).toContain('bash');
      expect(tools.length).toBe(3);
    });

    test('避免过度授权', () => {
      const simpleReadSkill = {
        description: '仅查看文件',
        primaryFunction: '文件查看'
      };

      const tools = recommendTools(simpleReadSkill.description, simpleReadSkill.primaryFunction);
      // 不应该包含写权限
      expect(tools).not.toContain('write');
      expect(tools).not.toContain('bash');
      expect(tools).not.toContain('webfetch');
    });
  });

  describe('权限升级检测', () => {
    const detectPermissionEscalation = (requestedTools, existingTools) => {
      const dangerousTools = ['bash', 'context'];
      const sensitiveTools = ['write', 'webfetch', 'websearch'];

      const escalations = {
        dangerous: [],
        sensitive: []
      };

      // 检测危险工具升级
      dangerousTools.forEach(tool => {
        if (requestedTools.includes(tool) && !existingTools.includes(tool)) {
          escalations.dangerous.push(tool);
        }
      });

      // 检测敏感工具升级
      sensitiveTools.forEach(tool => {
        if (requestedTools.includes(tool) && !existingTools.includes(tool)) {
          escalations.sensitive.push(tool);
        }
      });

      return escalations;
    };

    test('危险权限升级检测', () => {
      const existing = ['read', 'write'];
      const requested = ['read', 'write', 'bash', 'context'];

      const escalations = detectPermissionEscalation(requested, existing);
      expect(escalations.dangerous).toEqual(['bash', 'context']);
      expect(escalations.sensitive).toEqual([]);
    });

    test('敏感权限升级检测', () => {
      const existing = ['read'];
      const requested = ['read', 'write', 'webfetch'];

      const escalations = detectPermissionEscalation(requested, existing);
      expect(escalations.dangerous).toEqual([]);
      expect(escalations.sensitive).toEqual(['write', 'webfetch']);
    });

    test('无权限升级', () => {
      const existing = ['read', 'write', 'bash'];
      const requested = ['read', 'write'];

      const escalations = detectPermissionEscalation(requested, existing);
      expect(escalations.dangerous).toEqual([]);
      expect(escalations.sensitive).toEqual([]);
    });
  });

  describe('权限验证', () => {
    const validateToolPermissions = (tools, maxTools = 5) => {
      if (!Array.isArray(tools)) {
        throw new Error('工具列表必须是数组');
      }

      // 验证工具数量限制
      if (tools.length > maxTools) {
        throw new Error(`工具数量过多（最大${maxTools}个）`);
      }

      // 验证工具名称
      const validTools = ['read', 'write', 'edit', 'bash', 'webfetch', 'websearch', 'context'];
      const invalidTools = tools.filter(tool => !validTools.includes(tool));

      if (invalidTools.length > 0) {
        throw new Error(`无效的工具: ${invalidTools.join(', ')}`);
      }

      // 验证工具组合安全性
      const dangerousCombinations = [
        ['bash', 'write'], // 执行命令 + 写文件
        ['bash', 'context'], // 执行命令 + 上下文访问
        ['webfetch', 'write'] // 网络获取 + 写文件
      ];

      for (const combination of dangerousCombinations) {
        const hasCombination = combination.every(tool => tools.includes(tool));
        if (hasCombination) {
          throw new Error(`危险工具组合: ${combination.join(' + ')}`);
        }
      }

      return true;
    };

    test('危险工具组合检测', () => {
      const dangerousCombos = [
        ['bash', 'write'],
        ['bash', 'context'],
        ['webfetch', 'write'],
        ['bash', 'write', 'read']
      ];

      dangerousCombos.forEach(combo => {
        expect(() => validateToolPermissions(combo)).toThrow('危险工具组合');
      });
    });

    test('安全工具组合', () => {
      const safeCombos = [
        ['read', 'edit'],
        ['read', 'webfetch'],
        ['read', 'write'],
        ['read', 'websearch']
      ];

      safeCombos.forEach(combo => {
        expect(validateToolPermissions(combo)).toBe(true);
      });
    });

    test('工具数量限制', () => {
      const tooManyTools = ['read', 'write', 'edit', 'bash', 'webfetch', 'websearch'];
      expect(() => validateToolPermissions(tooManyTools, 5)).toThrow('工具数量过多');

      const maxTools = ['read', 'write', 'edit', 'websearch', 'context'];
      expect(validateToolPermissions(maxTools, 5)).toBe(true);
    });
  });

  describe('权限白名单', () => {
    const toolPermissionMap = {
      'read': {
        permissions: ['files:read'],
        risk: 'low',
        description: '读取文件内容'
      },
      'write': {
        permissions: ['files:write'],
        risk: 'medium',
        description: '创建和写入文件'
      },
      'edit': {
        permissions: ['files:edit'],
        risk: 'medium',
        description: '编辑现有文件'
      },
      'bash': {
        permissions: ['system:execute'],
        risk: 'high',
        description: '执行系统命令'
      },
      'webfetch': {
        permissions: ['network:fetch'],
        risk: 'medium',
        description: '获取网络内容'
      },
      'websearch': {
        permissions: ['network:search'],
        risk: 'medium',
        description: '进行网络搜索'
      },
      'context': {
        permissions: ['context:read', 'context:write'],
        risk: 'high',
        description: '访问和管理对话上下文'
      }
    };

    test('工具权限映射完整性', () => {
      Object.entries(toolPermissionMap).forEach(([tool, config]) => {
        expect(config).toHaveProperty('permissions');
        expect(config).toHaveProperty('risk');
        expect(config).toHaveProperty('description');

        expect(Array.isArray(config.permissions)).toBe(true);
        expect(['low', 'medium', 'high']).toContain(config.risk);
        expect(typeof config.description).toBe('string');
      });
    });

    test('权限风险评估', () => {
      const calculateRiskLevel = (tools) => {
        const risks = tools.map(tool => toolPermissionMap[tool]?.risk || 'unknown');

        if (risks.includes('high')) return 'high';
        if (risks.includes('medium')) return 'medium';
        return 'low';
      };

      expect(calculateRiskLevel(['read'])).toBe('low');
      expect(calculateRiskLevel(['read', 'write'])).toBe('medium');
      expect(calculateRiskLevel(['bash'])).toBe('high');
      expect(calculateRiskLevel(['read', 'bash'])).toBe('high');
    });

    test('权限聚合', () => {
      const aggregatePermissions = (tools) => {
        const permissions = new Set();

        tools.forEach(tool => {
          const toolPerms = toolPermissionMap[tool]?.permissions || [];
          toolPerms.forEach(perm => permissions.add(perm));
        });

        return Array.from(permissions).sort();
      };

      const simplePerms = aggregatePermissions(['read']);
      expect(simplePerms).toEqual(['files:read']);

      const complexPerms = aggregatePermissions(['read', 'write', 'context']);
      expect(complexPerms).toContain('files:read');
      expect(complexPerms).toContain('files:write');
      expect(complexPerms).toContain('context:read');
      expect(complexPerms).toContain('context:write');
    });
  });

  describe('权限审计', () => {
    class PermissionAudit {
      constructor() {
        this.auditLog = [];
      }

      logPermissionRequest(user, tools, context) {
        const entry = {
          timestamp: new Date().toISOString(),
          user,
          tools: [...tools].sort(),
          context,
          riskLevel: this.calculateRiskLevel(tools)
        };

        this.auditLog.push(entry);
        return entry;
      }

      calculateRiskLevel(tools) {
        const riskScores = {
          'read': 1,
          'write': 3,
          'edit': 3,
          'webfetch': 4,
          'websearch': 4,
          'bash': 10,
          'context': 8
        };

        const totalScore = tools.reduce((sum, tool) => sum + (riskScores[tool] || 5), 0);

        if (totalScore >= 10) return 'high';
        if (totalScore >= 4) return 'medium';
        return 'low';
      }

      getHighRiskRequests() {
        return this.auditLog.filter(entry => entry.riskLevel === 'high');
      }

      getUserRequests(user) {
        return this.auditLog.filter(entry => entry.user === user);
      }
    }

    test('权限请求审计', () => {
      const audit = new PermissionAudit();

      const lowRiskEntry = audit.logPermissionRequest('user1', ['read'], '文件查看');
      expect(lowRiskEntry.riskLevel).toBe('low');
      expect(lowRiskEntry.tools).toEqual(['read']);

      const highRiskEntry = audit.logPermissionRequest('user2', ['bash', 'write'], '系统管理');
      expect(highRiskEntry.riskLevel).toBe('high');

      expect(audit.auditLog.length).toBe(2);
      expect(audit.getHighRiskRequests().length).toBe(1);
    });

    test('风险等级计算', () => {
      const audit = new PermissionAudit();

      expect(audit.calculateRiskLevel(['read'])).toBe('low');
      expect(audit.calculateRiskLevel(['read', 'write'])).toBe('medium');
      expect(audit.calculateRiskLevel(['bash'])).toBe('high');
      expect(audit.calculateRiskLevel(['bash', 'write', 'context'])).toBe('high');
    });
  });

  describe('权限降级', () => {
    const validatePermissionDowngrade = (currentTools, requestedTools) => {
      const essentialTools = ['read']; // read是必需的

      // 检查是否试图移除必需工具
      const missingEssentials = essentialTools.filter(tool =>
        !requestedTools.includes(tool) && currentTools.includes(tool)
      );

      if (missingEssentials.length > 0) {
        throw new Error(`不能移除必需工具: ${missingEssentials.join(', ')}`);
      }

      // 检查是否有新增的危险工具
      const dangerousTools = ['bash', 'context'];
      const newDangerousTools = dangerousTools.filter(tool =>
        requestedTools.includes(tool) && !currentTools.includes(tool)
      );

      if (newDangerousTools.length > 0) {
        throw new Error(`新增危险工具需要额外审核: ${newDangerousTools.join(', ')}`);
      }

      return {
        valid: true,
        changes: {
          added: requestedTools.filter(tool => !currentTools.includes(tool)),
          removed: currentTools.filter(tool => !requestedTools.includes(tool))
        }
      };
    };

    test('安全权限降级', () => {
      const current = ['read', 'write', 'bash'];
      const requested = ['read', 'write']; // 移除了bash

      const result = validatePermissionDowngrade(current, requested);
      expect(result.valid).toBe(true);
      expect(result.changes.removed).toEqual(['bash']);
      expect(result.changes.added).toEqual([]);
    });

    test('禁止移除必需工具', () => {
      const current = ['read', 'write'];
      const requested = ['write']; // 试图移除read

      expect(() => validatePermissionDowngrade(current, requested))
        .toThrow('不能移除必需工具: read');
    });

    test('新增危险工具需要审核', () => {
      const current = ['read', 'write'];
      const requested = ['read', 'write', 'bash']; // 新增bash

      expect(() => validatePermissionDowngrade(current, requested))
        .toThrow('新增危险工具需要额外审核: bash');
    });
  });

  describe('运行时权限检查', () => {
    const createPermissionGuard = (allowedTools) => {
      return {
        check: (tool, context) => {
          if (!allowedTools.includes(tool)) {
            throw new Error(`无权使用工具: ${tool}`);
          }

          // 额外的上下文检查
          if (tool === 'bash' && context?.command?.includes('rm')) {
            throw new Error('禁止执行删除命令');
          }

          if (tool === 'webfetch' && context?.url?.includes('internal')) {
            throw new Error('禁止访问内部URL');
          }

          return true;
        },

        getAvailableTools: () => [...allowedTools]
      };
    };

    test('运行时权限验证', () => {
      const guard = createPermissionGuard(['read', 'write']);

      expect(guard.check('read', {})).toBe(true);
      expect(() => guard.check('bash', {})).toThrow('无权使用工具: bash');

      const availableTools = guard.getAvailableTools();
      expect(availableTools).toEqual(['read', 'write']);
    });

    test('上下文相关的权限检查', () => {
      const guard = createPermissionGuard(['bash', 'webfetch']);

      // 正常的bash命令应该允许
      expect(guard.check('bash', { command: 'ls -la' })).toBe(true);

      // 危险的bash命令应该阻止
      expect(() => guard.check('bash', { command: 'rm -rf /' }))
        .toThrow('禁止执行删除命令');

      // 内部URL应该阻止
      expect(() => guard.check('webfetch', { url: 'https://internal.company.com' }))
        .toThrow('禁止访问内部URL');
    });
  });

  describe('权限继承和隔离', () => {
    class PermissionScope {
      constructor(parentScope = null) {
        this.parent = parentScope;
        this.localTools = new Set();
      }

      addTool(tool) {
        this.localTools.add(tool);
      }

      hasTool(tool) {
        if (this.localTools.has(tool)) {
          return true;
        }

        if (this.parent) {
          return this.parent.hasTool(tool);
        }

        return false;
      }

      getAllTools() {
        const tools = new Set(this.localTools);

        if (this.parent) {
          const parentTools = this.parent.getAllTools();
          parentTools.forEach(tool => tools.add(tool));
        }

        return Array.from(tools).sort();
      }
    }

    test('权限作用域继承', () => {
      const globalScope = new PermissionScope();
      globalScope.addTool('read');
      globalScope.addTool('write');

      const userScope = new PermissionScope(globalScope);
      userScope.addTool('edit');

      expect(userScope.hasTool('read')).toBe(true); // 继承自全局
      expect(userScope.hasTool('write')).toBe(true); // 继承自全局
      expect(userScope.hasTool('edit')).toBe(true); // 本地添加
      expect(userScope.hasTool('bash')).toBe(false); // 不存在

      const allTools = userScope.getAllTools();
      expect(allTools).toEqual(['edit', 'read', 'write']);
    });

    test('权限作用域隔离', () => {
      const scope1 = new PermissionScope();
      scope1.addTool('read');
      scope1.addTool('write');

      const scope2 = new PermissionScope();
      scope2.addTool('read');
      scope2.addTool('bash');

      expect(scope1.hasTool('bash')).toBe(false);
      expect(scope2.hasTool('write')).toBe(false);
    });
  });
});