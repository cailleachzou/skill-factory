/**
 * 安全测试：输入验证安全性
 */

describe('输入验证安全性测试', () => {
  describe('路径遍历攻击防护', () => {
    const validateOutputPath = (path) => {
      if (!path || typeof path !== 'string') {
        throw new Error('路径必须是非空字符串');
      }

      // 防止目录遍历攻击
      if (path.includes('../') || path.includes('..\\')) {
        throw new Error('无效的输出路径: 包含目录遍历字符');
      }

      // 防止绝对路径到敏感目录
      const sensitiveDirs = [
        '/etc',
        '/bin',
        '/usr',
        '/root',
        '/windows',
        '/system32',
        'C:\\Windows\\System32',
        'C:\\Windows'
      ];

      for (const sensitiveDir of sensitiveDirs) {
        if (path.startsWith(sensitiveDir)) {
          throw new Error(`无效的输出路径: 不能使用系统目录 ${sensitiveDir}`);
        }
      }

      // 防止使用特殊设备文件（Unix）
      if (path.match(/^\/dev\/|\/proc\//)) {
        throw new Error('无效的输出路径: 不能使用设备文件');
      }

      return true;
    };

    test('防止目录遍历攻击', () => {
      const maliciousPaths = [
        '../../etc/passwd',
        '..\\windows\\system32\\config',
        'skill/../../etc/shadow',
        'output/../etc/passwd',
        '..\\..\\..\\Windows\\System32'
      ];

      maliciousPaths.forEach(path => {
        expect(() => validateOutputPath(path)).toThrow('无效的输出路径: 包含目录遍历字符');
      });
    });

    test('防止访问系统目录', () => {
      const systemPaths = [
        '/etc/passwd',
        '/bin/bash',
        '/root/.ssh',
        '/usr/bin',
        '/windows/system32',
        'C:\\Windows\\System32\\cmd.exe',
        'C:\\Windows\\win.ini'
      ];

      systemPaths.forEach(path => {
        expect(() => validateOutputPath(path)).toThrow('无效的输出路径: 不能使用系统目录');
      });
    });

    test('允许安全路径', () => {
      const safePaths = [
        'output/skills',
        'temp-output/test-skill',
        './generated-skills',
        'skills/my-skill',
        'C:\\Users\\Test\\skills', // 用户目录应该允许
        '/home/user/skills'
      ];

      safePaths.forEach(path => {
        expect(validateOutputPath(path)).toBe(true);
      });
    });

    test('空路径和无效类型', () => {
      expect(() => validateOutputPath('')).toThrow('路径必须是非空字符串');
      expect(() => validateOutputPath(null)).toThrow('路径必须是非空字符串');
      expect(() => validateOutputPath(undefined)).toThrow('路径必须是非空字符串');
      expect(() => validateOutputPath(123)).toThrow('路径必须是非空字符串');
      expect(() => validateOutputPath({})).toThrow('路径必须是非空字符串');
    });
  });

  describe('代码注入防护', () => {
    const sanitizeInput = (input) => {
      const sanitized = { ...input };

      // 字符串字段的消毒
      const stringFields = ['skill_name', 'description', 'primary_function'];
      stringFields.forEach(field => {
        if (sanitized[field] && typeof sanitized[field] === 'string') {
          // 移除潜在的恶意字符
          sanitized[field] = sanitized[field]
            .replace(/[;'"`]/g, '') // 移除命令分隔符
            .replace(/<script>/gi, '') // 移除script标签
            .replace(/javascript:/gi, '') // 移除javascript协议
            .trim();
        }
      });

      // 数组字段的消毒
      if (sanitized.tools_needed && Array.isArray(sanitized.tools_needed)) {
        const validTools = ['read', 'write', 'edit', 'bash', 'webfetch', 'websearch', 'context'];
        sanitized.tools_needed = sanitized.tools_needed.filter(tool =>
          typeof tool === 'string' && /^[a-z-]+$/.test(tool) && validTools.includes(tool)
        );
      }

      return sanitized;
    };

    test('防止命令注入', () => {
      const maliciousInputs = [
        {
          skill_name: 'test"; rm -rf /; #',
          description: '正常描述',
          primary_function: 'test'
        },
        {
          skill_name: 'test',
          description: 'test && cat /etc/passwd',
          primary_function: 'test'
        },
        {
          skill_name: 'test`whoami`',
          description: 'test',
          primary_function: 'test'
        }
      ];

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        expect(sanitized.skill_name).not.toMatch(/[;"'`]/);
        expect(sanitized.description).not.toMatch(/[;"'`]/);
      });
    });

    test('防止XSS攻击', () => {
      const xssInputs = [
        {
          skill_name: 'test<script>alert("xss")</script>',
          description: '正常描述',
          primary_function: 'test'
        },
        {
          skill_name: 'test',
          description: 'test<img src=x onerror=alert(1)>',
          primary_function: 'test'
        },
        {
          skill_name: 'test',
          description: 'test',
          primary_function: 'javascript:alert("xss")'
        }
      ];

      xssInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        expect(sanitized.skill_name).not.toMatch(/<script>/i);
        expect(sanitized.description).not.toMatch(/<script>/i);
        expect(sanitized.primary_function).not.toMatch(/javascript:/i);
      });
    });

    test('数组字段消毒', () => {
      const maliciousArrayInput = {
        skill_name: 'test',
        description: 'test',
        primary_function: 'test',
        tools_needed: [
          'read',
          'write',
          'malicious-tool',
          'bash; rm -rf /',
          '<script>',
          'edit'
        ]
      };

      const sanitized = sanitizeInput(maliciousArrayInput);
      expect(sanitized.tools_needed).toEqual(['read', 'write', 'edit']);
      expect(sanitized.tools_needed).not.toContain('malicious-tool');
      expect(sanitized.tools_needed).not.toContain('bash; rm -rf /');
      expect(sanitized.tools_needed).not.toContain('<script>');
    });
  });

  describe('输入长度限制', () => {
    const validateInputLength = (input) => {
      const limits = {
        skill_name: 50,
        description: 1000,
        primary_function: 500
      };

      Object.entries(limits).forEach(([field, limit]) => {
        if (input[field] && input[field].length > limit) {
          throw new Error(`${field}过长（最大${limit}字符）`);
        }
      });

      return true;
    };

    test('防止缓冲区溢出攻击', () => {
      const overflowInputs = [
        {
          skill_name: 'a'.repeat(1000),
          description: 'test',
          primary_function: 'test'
        },
        {
          skill_name: 'test',
          description: 'a'.repeat(10000),
          primary_function: 'test'
        },
        {
          skill_name: 'test',
          description: 'test',
          primary_function: 'a'.repeat(1000)
        }
      ];

      overflowInputs.forEach((input, index) => {
        expect(() => validateInputLength(input)).toThrow('过长');
      });
    });

    test('正常长度输入', () => {
      const normalInput = {
        skill_name: 'normal-skill',
        description: '正常描述'.repeat(10),
        primary_function: '正常功能'
      };

      expect(validateInputLength(normalInput)).toBe(true);
    });
  });

  describe('内容类型验证', () => {
    const validateContentType = (input) => {
      // 验证技能名称只包含允许的字符
      if (input.skill_name && !/^[a-z0-9-]+$/.test(input.skill_name)) {
        throw new Error('技能名称只能包含小写字母、数字和连字符');
      }

      // 验证描述不包含控制字符
      if (input.description && /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(input.description)) {
        throw new Error('描述包含无效的控制字符');
      }

      // 验证工具列表
      if (input.tools_needed) {
        if (!Array.isArray(input.tools_needed)) {
          throw new Error('工具列表必须是数组');
        }

        const validTools = ['read', 'write', 'edit', 'bash', 'webfetch', 'websearch', 'context'];
        input.tools_needed.forEach((tool, index) => {
          if (!validTools.includes(tool)) {
            throw new Error(`无效的工具: ${tool}`);
          }
        });
      }

      return true;
    };

    test('控制字符检测', () => {
      const controlCharInput = {
        skill_name: 'test-skill',
        description: '正常描述\x00隐藏控制字符\x07',
        primary_function: 'test'
      };

      expect(() => validateContentType(controlCharInput)).toThrow('描述包含无效的控制字符');
    });

    test('二进制数据检测', () => {
      // 模拟二进制数据（Buffer转换为字符串）
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03]).toString();

      const binaryInput = {
        skill_name: 'test',
        description: `正常描述${binaryData}二进制数据`,
        primary_function: 'test'
      };

      expect(() => validateContentType(binaryInput)).toThrow('描述包含无效的控制字符');
    });

    test('Unicode滥用检测', () => {
      // 检查是否使用混淆的Unicode字符
      const checkUnicodeAbuse = (str) => {
        // 检查是否包含非常用Unicode字符
        const unusualUnicode = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/.test(str);
        return unusualUnicode;
      };

      const normalText = '正常技能描述';
      const suspiciousText = '正常描述\u200B隐藏字符';

      expect(checkUnicodeAbuse(normalText)).toBe(false);
      expect(checkUnicodeAbuse(suspiciousText)).toBe(true);
    });
  });

  describe('速率限制', () => {
    class RateLimiter {
      constructor(limit, windowMs) {
        this.limit = limit;
        this.windowMs = windowMs;
        this.requests = new Map();
      }

      check(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];

        // 清理过期请求
        const validRequests = userRequests.filter(time => now - time < this.windowMs);

        if (validRequests.length >= this.limit) {
          throw new Error('请求过于频繁，请稍后再试');
        }

        validRequests.push(now);
        this.requests.set(userId, validRequests);
        return true;
      }
    }

    test('防止暴力请求', () => {
      const limiter = new RateLimiter(5, 60000); // 每分钟5次
      const userId = 'test-user';

      // 前5次应该成功
      for (let i = 0; i < 5; i++) {
        expect(limiter.check(userId)).toBe(true);
      }

      // 第6次应该失败
      expect(() => limiter.check(userId)).toThrow('请求过于频繁');
    });

    test('时间窗口重置', async () => {
      const limiter = new RateLimiter(3, 1000); // 每秒3次
      const userId = 'test-user2';

      // 用尽限制
      limiter.check(userId);
      limiter.check(userId);
      limiter.check(userId);

      expect(() => limiter.check(userId)).toThrow('请求过于频繁');

      // 等待时间窗口重置
      await new Promise(resolve => setTimeout(resolve, 1100));

      // 应该可以再次请求
      expect(limiter.check(userId)).toBe(true);
    });
  });

  describe('输入规范化', () => {
    const normalizeInput = (input) => {
      const normalized = { ...input };

      // 规范化字符串字段
      const stringFields = ['skill_name', 'description', 'primary_function'];
      stringFields.forEach(field => {
        if (normalized[field] && typeof normalized[field] === 'string') {
          // 移除首尾空白
          normalized[field] = normalized[field].trim();

          // 规范化空白字符
          normalized[field] = normalized[field].replace(/\s+/g, ' ');

          // 移除零宽字符
          normalized[field] = normalized[field].replace(/[\u200B-\u200F\uFEFF]/g, '');
        }
      });

      // 规范化技能名称
      if (normalized.skill_name) {
        normalized.skill_name = normalized.skill_name.toLowerCase();
      }

      return normalized;
    };

    test('空白字符规范化', () => {
      const messyInput = {
        skill_name: '  test-skill  ',
        description: '描述  有多余  空格',
        primary_function: '功能\t制表符\n换行'
      };

      const normalized = normalizeInput(messyInput);
      expect(normalized.skill_name).toBe('test-skill');
      expect(normalized.description).toBe('描述 有多余 空格');
      expect(normalized.primary_function).toBe('功能 制表符 换行');
    });

    test('零宽字符移除', () => {
      const zeroWidthInput = {
        skill_name: 'test\u200Bskill',
        description: '描述\u200C包含\u200D零宽\uFEFF字符',
        primary_function: '正常功能'
      };

      const normalized = normalizeInput(zeroWidthInput);
      expect(normalized.skill_name).toBe('testskill');
      expect(normalized.description).toBe('描述包含零宽 字符');
      expect(normalized.description).not.toMatch(/[\u200B-\u200F\uFEFF]/);
    });

    test('大小写规范化', () => {
      const mixedCaseInput = {
        skill_name: 'Test-Skill-Name',
        description: 'Test Description',
        primary_function: 'Primary Function'
      };

      const normalized = normalizeInput(mixedCaseInput);
      expect(normalized.skill_name).toBe('test-skill-name');
      // 其他字段保持原样
      expect(normalized.description).toBe('Test Description');
    });
  });

  describe('深度防御', () => {
    test('多层验证', () => {
      const multiLayerValidation = (input) => {
        // 第一层：基本类型检查
        if (!input || typeof input !== 'object') {
          throw new Error('输入必须是对象');
        }

        // 第二层：必填字段检查
        const required = ['skill_name', 'description', 'primary_function'];
        const missing = required.filter(field => !input[field]);
        if (missing.length > 0) {
          throw new Error(`缺少必填字段: ${missing.join(', ')}`);
        }

        // 第三层：内容验证
        if (!/^[a-z0-9-]+$/.test(input.skill_name)) {
          throw new Error('技能名称只能包含小写字母、数字和连字符');
        }

        // 第四层：长度限制
        if (input.description.length > 1000) {
          throw new Error('描述过长（最大1000字符）');
        }

        // 第五层：消毒处理
        const sanitizedDescription = input.description
          .replace(/[;'"`]/g, '')
          .replace(/<script>/gi, '');

        return {
          ...input,
          description: sanitizedDescription,
          validated: true
        };
      };

      const validInput = {
        skill_name: 'test-skill',
        description: '正常描述',
        primary_function: '测试功能'
      };

      const result = multiLayerValidation(validInput);
      expect(result.validated).toBe(true);

      const maliciousInput = {
        skill_name: 'test"; rm -rf /; #',
        description: '<script>alert("xss")</script>',
        primary_function: 'test'
      };

      // 应该被第三层验证捕获
      expect(() => multiLayerValidation(maliciousInput)).toThrow('技能名称只能包含小写字母、数字和连字符');
    });

    test('防御深度组合攻击', () => {
      // 测试组合多种攻击方式
      const complexAttack = {
        skill_name: 'normal'.repeat(100), // 长度攻击
        description: 'test"; DROP TABLE users; -- <script>alert(1)</script>', // SQL注入 + XSS
        primary_function: '../../../etc/passwd', // 路径遍历
        tools_needed: ['read', 'write', 'malicious'] // 无效工具
      };

      // 应该被各层防御捕获
      expect(() => {
        // 模拟多层验证
        if (complexAttack.skill_name.length > 50) {
          throw new Error('技能名称过长');
        }
        if (complexAttack.description.includes('"')) {
          throw new Error('描述包含危险字符');
        }
        if (complexAttack.primary_function.includes('../')) {
          throw new Error('路径包含遍历字符');
        }
      }).toThrow();
    });
  });
});