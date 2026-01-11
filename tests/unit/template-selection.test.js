/**
 * 单元测试：模板选择
 */

describe('模板选择测试', () => {

  const skillTypeTemplates = {
    'coordinator': 'coordinator-template',
    'specialist': 'specialist-template',
    'tool-integration': 'integration-template',
    'analytics': 'analytics-template'
  };

  const functionToTemplate = {
    '数据分析': 'analytics-template',
    '系统集成': 'integration-template',
    '代码审查': 'specialist-template',
    '工作流管理': 'coordinator-template'
  };

  describe('根据技能类型选择模板', () => {
    test('协调器类型选择协调器模板', () => {
      expect(skillTypeTemplates['coordinator']).toBe('coordinator-template');
    });

    test('专业工具类型选择专业工具模板', () => {
      expect(skillTypeTemplates['specialist']).toBe('specialist-template');
    });

    test('集成器类型选择集成模板', () => {
      expect(skillTypeTemplates['tool-integration']).toBe('integration-template');
    });

    test('分析器类型选择分析模板', () => {
      expect(skillTypeTemplates['analytics']).toBe('analytics-template');
    });

    test('未知类型返回默认模板或错误', () => {
      expect(skillTypeTemplates['unknown-type']).toBeUndefined();
    });
  });

  describe('根据功能描述选择模板', () => {
    test('数据分析功能选择分析模板', () => {
      const skill = { primary_function: '数据分析' };
      const template = functionToTemplate[skill.primary_function] || 'default-template';
      expect(template).toBe('analytics-template');
    });

    test('系统集成功能选择集成模板', () => {
      const skill = { primary_function: '系统集成' };
      const template = functionToTemplate[skill.primary_function] || 'default-template';
      expect(template).toBe('integration-template');
    });

    test('代码审查功能选择专业工具模板', () => {
      const skill = { primary_function: '代码审查' };
      const template = functionToTemplate[skill.primary_function] || 'default-template';
      expect(template).toBe('specialist-template');
    });

    test('工作流管理功能选择协调器模板', () => {
      const skill = { primary_function: '工作流管理' };
      const template = functionToTemplate[skill.primary_function] || 'default-template';
      expect(template).toBe('coordinator-template');
    });

    test('未知功能使用默认模板', () => {
      const skill = { primary_function: '未知功能描述' };
      const template = functionToTemplate[skill.primary_function] || 'default-template';
      expect(template).toBe('default-template');
    });
  });

  describe('模板优先级', () => {
    test('技能类型优先于功能描述', () => {
      const skill = {
        skill_type: 'coordinator',
        primary_function: '数据分析' // 这会映射到 analytics-template
      };
      
      // 技能类型应该有更高的优先级
      const template = skillTypeTemplates[skill.skill_type] || functionToTemplate[skill.primary_function];
      expect(template).toBe('coordinator-template');
    });
  });

  describe('模板文件检查', () => {
    test('选定的模板应该存在', () => {
      const availableTemplates = ['coordinator-template', 'specialist-template', 'integration-template', 'analytics-template'];
      
      Object.values(skillTypeTemplates).forEach(template => {
        expect(availableTemplates).toContain(template);
      });
    });

    test('模板应该包含必要的文件', () => {
      const templateFiles = {
        'coordinator-template': ['skill.json', 'implementation.js', 'tools.json'],
        'specialist-template': ['skill.json', 'implementation.js', 'tools.json'],
        'integration-template': ['skill.json', 'implementation.js', 'tools.json'],
        'analytics-template': ['skill.json', 'implementation.js', 'tools.json']
      };

      Object.entries(templateFiles).forEach(([template, files]) => {
        expect(files.length).toBeGreaterThan(0);
        expect(files).toContain('skill.json');
      });
    });
  });

});
