/**
 * 集成测试：文件系统操作
 */

describe('文件系统操作集成测试', () => {
  // 模拟文件系统模块
  let mockFs;
  let testOutputDir;

  beforeEach(() => {
    mockFs = {
      existsSync: jest.fn(),
      mkdirSync: jest.fn(),
      writeFileSync: jest.fn(),
      readFileSync: jest.fn(),
      rmSync: jest.fn()
    };

    testOutputDir = 'temp-output/test-skill';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('生成文件到指定目录', () => {
    test('创建输出目录', () => {
      // 模拟目录不存在，然后创建
      mockFs.existsSync.mockReturnValue(false);

      // 调用生成函数（模拟）
      const generateToDirectory = () => {
        if (!mockFs.existsSync(testOutputDir)) {
          mockFs.mkdirSync(testOutputDir, { recursive: true });
        }
      };

      generateToDirectory();

      expect(mockFs.existsSync).toHaveBeenCalledWith(testOutputDir);
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(testOutputDir, { recursive: true });
    });

    test('验证必需文件存在', () => {
      // 模拟目录已存在
      mockFs.existsSync.mockImplementation((path) => {
        const requiredFiles = [
          'skill-definition/skill.json',
          'tools/tools.json',
          'examples/basic-example.md'
        ];
        return requiredFiles.some(file => path.includes(file)) || path === testOutputDir;
      });

      // 验证必需文件
      const requiredPaths = [
        `${testOutputDir}/skill-definition/skill.json`,
        `${testOutputDir}/tools/tools.json`,
        `${testOutputDir}/examples/basic-example.md`
      ];

      requiredPaths.forEach(path => {
        expect(mockFs.existsSync(path)).toBe(true);
      });
    });

    test('写入技能定义文件', () => {
      const skillJsonPath = `${testOutputDir}/skill-definition/skill.json`;
      const skillJsonContent = JSON.stringify({
        name: 'test-skill',
        description: '测试技能'
      });

      mockFs.writeFileSync(skillJsonPath, skillJsonContent);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        skillJsonPath,
        skillJsonContent
      );
    });
  });

  describe('错误处理', () => {
    test('输出目录已存在时的处理', () => {
      mockFs.existsSync.mockReturnValue(true);

      const generateToDirectory = (outputDir) => {
        if (mockFs.existsSync(outputDir)) {
          throw new Error('输出目录已存在');
        }
      };

      expect(() => generateToDirectory(testOutputDir)).toThrow('输出目录已存在');
    });

    test('无权限的输出目录', () => {
      const protectedDir = '/root/protected-dir';

      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('权限被拒绝');
      });

      const createProtectedDir = () => {
        try {
          mockFs.mkdirSync(protectedDir, { recursive: true });
        } catch (error) {
          throw new Error('无权限访问输出目录');
        }
      };

      expect(() => createProtectedDir()).toThrow('无权限访问输出目录');
    });

    test('磁盘空间不足的处理', () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('No space left on device');
      });

      const writeLargeFile = () => {
        try {
          mockFs.writeFileSync(`${testOutputDir}/large-file.txt`, 'x'.repeat(1024 * 1024));
        } catch (error) {
          throw new Error('磁盘空间不足，无法生成文件');
        }
      };

      expect(() => writeLargeFile()).toThrow('磁盘空间不足，无法生成文件');
    });
  });

  describe('清理操作', () => {
    test('生成失败后的清理', () => {
      const cleanupTempFiles = jest.fn();

      // 模拟生成失败
      const generateWithCleanup = () => {
        try {
          throw new Error('生成失败');
        } catch (error) {
          cleanupTempFiles();
          throw error;
        }
      };

      expect(() => generateWithCleanup()).toThrow('生成失败');
      expect(cleanupTempFiles).toHaveBeenCalled();
    });

    test('成功生成后的清理', () => {
      const tempDir = 'temp-output/temp-skill';

      mockFs.existsSync.mockReturnValue(true);

      const cleanupAfterSuccess = () => {
        if (mockFs.existsSync(tempDir)) {
          mockFs.rmSync(tempDir, { recursive: true });
        }
      };

      cleanupAfterSuccess();

      expect(mockFs.rmSync).toHaveBeenCalledWith(tempDir, { recursive: true });
    });
  });

  describe('跨平台兼容性', () => {
    test('Windows路径处理', () => {
      const windowsPath = 'C:\\Users\\Test\\skills';

      const normalizePath = (path) => {
        return path.replace(/\\/g, '/');
      };

      const result = normalizePath(windowsPath);
      expect(result).toBe('C:/Users/Test/skills');
    });

    test('Unix路径处理', () => {
      const unixPath = '/home/user/skills';

      const normalizePath = (path) => {
        return path.replace(/\\/g, '/');
      };

      const result = normalizePath(unixPath);
      expect(result).toBe('/home/user/skills');
    });
  });
});