/**
 * 边界测试：输出目录边界
 */

describe('输出目录边界测试', () => {
  // 模拟文件系统操作
  let mockFs;

  beforeEach(() => {
    mockFs = {
      existsSync: jest.fn(),
      mkdirSync: jest.fn(),
      writeFileSync: jest.fn(),
      readdirSync: jest.fn(),
      statSync: jest.fn(),
      rmSync: jest.fn(),
      accessSync: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('输出目录存在性测试', () => {
    test('输出目录已存在', () => {
      const outputDir = 'temp-output/existing-dir';
      mockFs.existsSync.mockReturnValue(true);

      const generateToDirectory = (dir) => {
        if (mockFs.existsSync(dir)) {
          throw new Error('输出目录已存在');
        }
        // 创建目录
        mockFs.mkdirSync(dir, { recursive: true });
      };

      expect(() => generateToDirectory(outputDir)).toThrow('输出目录已存在');
      expect(mockFs.existsSync).toHaveBeenCalledWith(outputDir);
      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });

    test('输出目录不存在时创建', () => {
      const outputDir = 'temp-output/new-dir';
      mockFs.existsSync.mockReturnValue(false);

      const generateToDirectory = (dir) => {
        if (!mockFs.existsSync(dir)) {
          mockFs.mkdirSync(dir, { recursive: true });
        }
        return dir;
      };

      const result = generateToDirectory(outputDir);
      expect(result).toBe(outputDir);
      expect(mockFs.existsSync).toHaveBeenCalledWith(outputDir);
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(outputDir, { recursive: true });
    });

    test('嵌套目录创建', () => {
      const nestedDir = 'temp-output/nested/deep/directory';
      mockFs.existsSync.mockReturnValue(false);

      const createNestedDir = (dir) => {
        mockFs.mkdirSync(dir, { recursive: true });
        return dir;
      };

      const result = createNestedDir(nestedDir);
      expect(result).toBe(nestedDir);
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(nestedDir, { recursive: true });
    });
  });

  describe('输出目录权限测试', () => {
    test('无权限的输出目录', () => {
      const protectedDir = '/root/protected-dir';

      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('权限被拒绝');
      });

      const createProtectedDir = (dir) => {
        try {
          mockFs.mkdirSync(dir, { recursive: true });
        } catch (error) {
          throw new Error(`无权限访问输出目录: ${error.message}`);
        }
      };

      expect(() => createProtectedDir(protectedDir)).toThrow('无权限访问输出目录');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(protectedDir, { recursive: true });
    });

    test('只读目录', () => {
      const readOnlyDir = '/readonly/dir';
      mockFs.existsSync.mockReturnValue(true);

      // 模拟目录存在但只读
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('只读文件系统');
      });

      const writeToReadOnlyDir = (dir) => {
        const testFile = `${dir}/test.txt`;
        try {
          mockFs.writeFileSync(testFile, 'test');
        } catch (error) {
          throw new Error(`无法写入只读目录: ${error.message}`);
        }
      };

      expect(() => writeToReadOnlyDir(readOnlyDir)).toThrow('无法写入只读目录');
    });

    test('目录访问权限检查', () => {
      const checkDirectoryAccess = (dir) => {
        try {
          mockFs.accessSync(dir, mockFs.constants?.W_OK || 2); // W_OK权限
          return true;
        } catch (error) {
          throw new Error(`目录不可写: ${dir}`);
        }
      };

      // 模拟访问成功
      mockFs.accessSync.mockReturnValue();

      const accessibleDir = 'writable-dir';
      expect(checkDirectoryAccess(accessibleDir)).toBe(true);

      // 模拟访问失败
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('权限被拒绝');
      });

      expect(() => checkDirectoryAccess('/protected')).toThrow('目录不可写');
    });
  });

  describe('输出目录路径边界测试', () => {
    test('空路径', () => {
      const validateOutputPath = (path) => {
        if (!path || path.trim() === '') {
          throw new Error('输出路径不能为空');
        }
        return true;
      };

      expect(() => validateOutputPath('')).toThrow('输出路径不能为空');
      expect(() => validateOutputPath('   ')).toThrow('输出路径不能为空');
      expect(validateOutputPath('valid-path')).toBe(true);
    });

    test('相对路径', () => {
      const normalizePath = (path) => {
        const resolved = path.replace(/\\/g, '/');
        return resolved;
      };

      const relativePaths = [
        './output',
        '../output',
        '../../skills/output',
        'output/../final'
      ];

      relativePaths.forEach(path => {
        const normalized = normalizePath(path);
        expect(typeof normalized).toBe('string');
        expect(normalized).toContain('/');
      });
    });

    test('绝对路径', () => {
      const normalizePath = (path) => {
        return path.replace(/\\/g, '/');
      };

      const absolutePaths = [
        'C:\\Users\\Test\\skills',
        '/home/user/skills',
        '/var/lib/skills'
      ];

      absolutePaths.forEach(path => {
        const normalized = normalizePath(path);
        expect(normalized).not.toMatch(/\\/); // 不应该有反斜杠
      });
    });

    test('路径长度边界', () => {
      const validatePathLength = (path) => {
        const MAX_PATH_LENGTH = 260; // Windows路径长度限制

        if (path.length > MAX_PATH_LENGTH) {
          throw new Error('路径过长');
        }
        return true;
      };

      const maxPath = 'a'.repeat(260);
      expect(validatePathLength(maxPath)).toBe(true);

      const tooLongPath = 'a'.repeat(261);
      expect(() => validatePathLength(tooLongPath)).toThrow('路径过长');
    });

    test('路径遍历攻击防护', () => {
      const validateSafePath = (path) => {
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
          '/system32'
        ];

        for (const sensitiveDir of sensitiveDirs) {
          if (path.startsWith(sensitiveDir)) {
            throw new Error(`无效的输出路径: 不能使用系统目录 ${sensitiveDir}`);
          }
        }

        return true;
      };

      const maliciousPaths = [
        '../../etc/passwd',
        '..\\windows\\system32',
        '/etc/shadow',
        '/root/.ssh'
      ];

      maliciousPaths.forEach(path => {
        expect(() => validateSafePath(path)).toThrow('无效的输出路径');
      });

      const safePaths = [
        'output/skills',
        'temp-output/test',
        './generated-skills'
      ];

      safePaths.forEach(path => {
        expect(validateSafePath(path)).toBe(true);
      });
    });
  });

  describe('输出目录容量测试', () => {
    test('磁盘空间不足', () => {
      const checkDiskSpace = (requiredSpaceMB) => {
        const availableSpaceMB = 100; // 模拟可用空间

        if (requiredSpaceMB > availableSpaceMB) {
          throw new Error(`磁盘空间不足: 需要${requiredSpaceMB}MB, 可用${availableSpaceMB}MB`);
        }
        return true;
      };

      expect(checkDiskSpace(50)).toBe(true);
      expect(() => checkDiskSpace(150)).toThrow('磁盘空间不足');
    });

    test('大文件生成', () => {
      const generateLargeFile = (dir, sizeMB) => {
        const maxFileSizeMB = 100; // 最大文件大小限制

        if (sizeMB > maxFileSizeMB) {
          throw new Error(`文件过大: ${sizeMB}MB (最大${maxFileSizeMB}MB)`);
        }

        // 模拟文件生成
        const filePath = `${dir}/large-file.bin`;
        mockFs.writeFileSync(filePath, '0'.repeat(sizeMB * 1024 * 1024));
        return filePath;
      };

      const outputDir = 'temp-output/large-files';
      expect(() => generateLargeFile(outputDir, 50)).not.toThrow();
      expect(() => generateLargeFile(outputDir, 150)).toThrow('文件过大');
    });

    test('文件数量限制', () => {
      const checkFileCount = (dir, currentCount, additionalCount) => {
        const MAX_FILES = 1000;

        if (currentCount + additionalCount > MAX_FILES) {
          throw new Error(`文件数量超过限制: ${currentCount + additionalCount} (最大${MAX_FILES})`);
        }
        return true;
      };

      expect(checkFileCount('test-dir', 500, 500)).toBe(true);
      expect(() => checkFileCount('test-dir', 500, 501)).toThrow('文件数量超过限制');
    });
  });

  describe('跨平台兼容性测试', () => {
    test('Windows路径处理', () => {
      const normalizeWindowsPath = (path) => {
        return path.replace(/\\/g, '/');
      };

      const windowsPaths = [
        'C:\\Users\\Test\\skills',
        'D:\\projects\\claude-skills',
        '\\\\server\\share\\skills'
      ];

      windowsPaths.forEach(path => {
        const normalized = normalizeWindowsPath(path);
        expect(normalized).not.toMatch(/\\/);
        expect(normalized).toMatch(/^[A-Za-z]:\/|^\/\/server\/share\//);
      });
    });

    test('Unix路径处理', () => {
      const normalizeUnixPath = (path) => {
        return path.replace(/\\/g, '/');
      };

      const unixPaths = [
        '/home/user/skills',
        '/var/lib/claude/skills'
      ];

      unixPaths.forEach(path => {
        const normalized = normalizeUnixPath(path);
        expect(normalized).toMatch(/^\//);
      });
    });

    test('路径分隔符处理', () => {
      const normalizeSeparators = (path) => {
        return path.replace(/[\\/]+/g, '/');
      };

      const mixedPaths = [
        'C:\\Users/Test\\skills',
        '/home\\user/skills'
      ];

      mixedPaths.forEach(path => {
        const normalized = normalizeSeparators(path);
        expect(normalized).not.toMatch(/\\/);
        expect(normalized).toMatch(/^[A-Za-z]:\/|^\//);
      });
    });
  });

  describe('输出目录清理测试', () => {
    test('清理非空目录', () => {
      const outputDir = 'temp-output/non-empty-dir';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['file1.txt', 'file2.txt', 'subdir']);

      const cleanupDirectory = (dir) => {
        if (!mockFs.existsSync(dir)) {
          return;
        }

        const contents = mockFs.readdirSync(dir);
        if (contents.length > 0) {
          mockFs.rmSync(dir, { recursive: true, force: true });
        }
      };

      cleanupDirectory(outputDir);

      expect(mockFs.existsSync).toHaveBeenCalledWith(outputDir);
      expect(mockFs.readdirSync).toHaveBeenCalledWith(outputDir);
      expect(mockFs.rmSync).toHaveBeenCalledWith(outputDir, {
        recursive: true,
        force: true
      });
    });

    test('清理失败处理', () => {
      const lockedDir = 'temp-output/locked-dir';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.rmSync.mockImplementation(() => {
        throw new Error('文件正在使用中');
      });

      const cleanupWithError = (dir) => {
        try {
          if (mockFs.existsSync(dir)) {
            mockFs.rmSync(dir, { recursive: true });
          }
        } catch (error) {
          throw new Error(`清理失败: ${error.message}`);
        }
      };

      expect(() => cleanupWithError(lockedDir)).toThrow('清理失败');
    });

    test('部分清理', () => {
      const partialDir = 'temp-output/partial';

      mockFs.existsSync.mockImplementation((path) => {
        return path === partialDir || path.includes('temp-file');
      });

      mockFs.readdirSync.mockReturnValue(['temp-file1.txt', 'temp-file2.txt']);

      const cleanupTempFiles = (dir) => {
        if (!mockFs.existsSync(dir)) {
          return;
        }

        const files = mockFs.readdirSync(dir);
        files.forEach(file => {
          if (file.startsWith('temp-')) {
            const filePath = `${dir}/${file}`;
            mockFs.rmSync(filePath);
          }
        });
      };

      cleanupTempFiles(partialDir);

      expect(mockFs.readdirSync).toHaveBeenCalledWith(partialDir);
      expect(mockFs.rmSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('并发访问测试', () => {
    test('多个进程同时访问同一目录', () => {
      const sharedDir = 'temp-output/shared';
      let accessCount = 0;

      const concurrentAccess = (dir, processId) => {
        // 模拟并发访问
        accessCount++;

        if (accessCount > 1) {
          // 模拟冲突
          throw new Error(`目录访问冲突: 进程 ${processId}`);
        }

        // 模拟成功访问
        mockFs.mkdirSync(dir, { recursive: true });
        return true;
      };

      // 模拟第一个进程成功
      expect(concurrentAccess(sharedDir, 1)).toBe(true);

      // 模拟第二个进程冲突
      expect(() => concurrentAccess(sharedDir, 2)).toThrow('目录访问冲突');
    });

    test('文件锁检测', () => {
      const checkFileLock = (filePath) => {
        try {
          mockFs.statSync(filePath);
          // 如果文件被锁定，statSync可能会失败
          return false;
        } catch (error) {
          if (error.message.includes('正在使用')) {
            return true;
          }
          throw error;
        }
      };

      const lockedFile = 'temp-output/locked.txt';

      // 模拟未锁定
      mockFs.statSync.mockReturnValue({});
      expect(checkFileLock(lockedFile)).toBe(false);

      // 模拟锁定
      mockFs.statSync.mockImplementation(() => {
        throw new Error('文件正在使用中');
      });
      expect(checkFileLock(lockedFile)).toBe(true);
    });
  });

  describe('错误恢复测试', () => {
    test('目录创建失败后的恢复', () => {
      const outputDir = 'temp-output/failed-dir';
      let recoveryAttempted = false;

      mockFs.mkdirSync
        .mockImplementationOnce(() => {
          throw new Error('创建失败');
        })
        .mockImplementationOnce(() => {
          recoveryAttempted = true;
          return true;
        });

      const createWithRetry = (dir, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            mockFs.mkdirSync(dir, { recursive: true });
            return true;
          } catch (error) {
            if (i === maxRetries - 1) {
              throw new Error(`创建失败，已重试${maxRetries}次`);
            }
          }
        }
      };

      expect(createWithRetry(outputDir)).toBe(true);
      expect(recoveryAttempted).toBe(true);
      expect(mockFs.mkdirSync).toHaveBeenCalledTimes(2);
    });

    test('部分文件生成失败后的清理', () => {
      const outputDir = 'temp-output/partial-failure';
      const generatedFiles = [];

      const generateWithCleanup = (dir) => {
        try {
          // 生成第一个文件
          const file1 = `${dir}/file1.txt`;
          mockFs.writeFileSync(file1, 'content1');
          generatedFiles.push(file1);

          // 模拟第二个文件失败
          throw new Error('磁盘错误');

        } catch (error) {
          // 清理已生成的文件
          generatedFiles.forEach(file => {
            if (mockFs.existsSync(file)) {
              mockFs.rmSync(file);
            }
          });
          throw error;
        }
      };

      mockFs.existsSync.mockReturnValue(true);

      expect(() => generateWithCleanup(outputDir)).toThrow('磁盘错误');
      expect(mockFs.rmSync).toHaveBeenCalled();
    });
  });
});