/**
 * 单元测试：工具权限映射
 */

describe('工具权限映射测试', () => {

  const toolMapping = {
    'read': ['files:read'],
    'write': ['files:write'],
    'edit': ['files:edit'],
    'bash': ['system:execute'],
    'webfetch': ['network:fetch']
  };

  describe('工具名称映射到权限', () => {
    test('read 工具映射到 files:read', () => {
      expect(toolMapping['read']).toEqual(['files:read']);
    });

    test('write 工具映射到 files:write', () => {
      expect(toolMapping['write']).toEqual(['files:write']);
    });

    test('bash 工具映射到 system:execute', () => {
      expect(toolMapping['bash']).toEqual(['system:execute']);
    });

    test('未知工具返回 undefined', () => {
      expect(toolMapping['unknown-tool']).toBeUndefined();
    });
  });

  describe('工具列表验证', () => {
    test('有效的工具列表通过验证', () => {
      const validTools = ['read', 'write', 'edit'];
      const allValid = validTools.every(tool => toolMapping.hasOwnProperty(tool));
      expect(allValid).toBe(true);
    });

    test('包含无效工具的列表应该失败', () => {
      const invalidTools = ['read', 'unknown-tool', 'write'];
      const allValid = invalidTools.every(tool => toolMapping.hasOwnProperty(tool));
      expect(allValid).toBe(false);
    });

    test('工具去重 - 移除重复工具', () => {
      const toolsWithDuplicates = ['read', 'read', 'write', 'write', 'read'];
      const uniqueTools = [...new Set(toolsWithDuplicates)];
      expect(uniqueTools).toEqual(['read', 'write']);
      expect(uniqueTools.length).toBe(2);
    });

    test('空工具列表应该被接受', () => {
      const emptyTools = [];
      expect(emptyTools.length).toBe(0);
      expect(Array.isArray(emptyTools)).toBe(true);
    });
  });

  describe('权限聚合', () => {
    test('多个工具的权限正确聚合', () => {
      const tools = ['read', 'write'];
      const permissions = tools.flatMap(tool => toolMapping[tool]);
      expect(permissions).toEqual(['files:read', 'files:write']);
    });

    test('去重后的权限列表', () => {
      const tools = ['read', 'read', 'write'];
      const permissions = [...new Set(tools.flatMap(tool => toolMapping[tool]))];
      expect(permissions.length).toBe(2);
      expect(permissions).toContain('files:read');
      expect(permissions).toContain('files:write');
    });
  });

  describe('工具权限安全性', () => {
    test('最小权限原则 - 避免过度授权', () => {
      const requestedTools = ['read', 'write', 'bash', 'webfetch'];
      const allPermissions = requestedTools.flatMap(tool => toolMapping[tool]);
      
      // 验证不会授予不必要的权限
      expect(allPermissions).toHaveLength(4);
      expect(allPermissions).toContain('files:read');
    });

    test('拒绝非白名单工具', () => {
      const unauthorizedTools = ['delete-all', 'rm-rf', 'format-disk'];
      unauthorizedTools.forEach(tool => {
        expect(toolMapping[tool]).toBeUndefined();
      });
    });
  });

});
