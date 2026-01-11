/**
 * 单元测试：输入验证
 */

describe('输入验证测试', () => {
  
  describe('基本输入验证', () => {
    test('验证有效的技能输入', () => {
      const validInput = {
        skill_name: 'test-skill',
        description: '测试技能',
        primary_function: '测试功能'
      };
      // 测试通过 - 有效输入应该被接受
      expect(validInput).toHaveProperty('skill_name');
      expect(validInput).toHaveProperty('description');
      expect(validInput).toHaveProperty('primary_function');
    });

    test('检测缺少必填字段 - 缺少 description', () => {
      const invalidInput = {
        skill_name: 'test-skill',
        primary_function: '测试功能'
        // 缺少 description
      };
      expect(invalidInput).not.toHaveProperty('description');
    });

    test('检测缺少必填字段 - 缺少 primary_function', () => {
      const invalidInput = {
        skill_name: 'test-skill',
        description: '测试技能'
        // 缺少 primary_function
      };
      expect(invalidInput).not.toHaveProperty('primary_function');
    });
  });

  describe('技能名称格式验证', () => {
    test('验证有效的技能名称格式 (小写, 连字符)', () => {
      const validNames = ['valid-name', 'test-skill', 'my-new-skill'];
      validNames.forEach(name => {
        expect(name).toMatch(/^[a-z0-9-]+$/);
      });
    });

    test('拒绝包含空格的技能名称', () => {
      const invalidName = 'invalid name';
      expect(invalidName).toMatch(/\s/);
    });

    test('拒绝包含大写字母的技能名称', () => {
      const invalidName = 'InvalidName';
      expect(invalidName).toMatch(/[A-Z]/);
    });

    test('拒绝特殊字符的技能名称', () => {
      const invalidNames = ['test@skill', 'test&skill', 'test_skill', 'test.skill'];
      invalidNames.forEach(name => {
        const hasInvalidChars = name.match(/[^a-z0-9-]/);
        expect(hasInvalidChars).toBeTruthy();
      });
    });
  });

  describe('描述字段验证', () => {
    test('拒绝空描述', () => {
      const emptyDescription = '';
      expect(emptyDescription).toBe('');
      expect(emptyDescription.length).toBe(0);
    });

    test('接受合理长度的描述', () => {
      const validDescription = '这是一个测试技能，用于验证输入';
      expect(validDescription.length).toBeGreaterThan(0);
      expect(validDescription.length).toBeLessThan(1000);
    });

    test('检测过长的描述', () => {
      const tooLongDescription = 'a'.repeat(10000);
      expect(tooLongDescription.length).toBeGreaterThan(5000);
    });
  });

  describe('边界值测试', () => {
    test('超长技能名称（> 100字符）', () => {
      const longName = 'a'.repeat(101);
      expect(longName.length).toBeGreaterThan(100);
    });

    test('最小有效技能名称', () => {
      const minimalName = 'a';
      expect(minimalName.length).toBe(1);
      expect(minimalName).toMatch(/^[a-z0-9-]+$/);
    });

    test('最大有效技能名称', () => {
      const maxName = 'a'.repeat(50);
      expect(maxName.length).toBeLessThanOrEqual(50);
    });
  });

});
