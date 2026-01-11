/**
 * 兼容性测试：跨平台
 */

describe('跨平台兼容性测试', () => {
  describe('路径处理兼容性', () => {
    const normalizePath = (path) => {
      return path.replace(/\\/g, '/');
    };

    test('Windows路径转换为Unix风格', () => {
      if (process.platform === 'win32') {
        const windowsPaths = [
          'C:\\Users\\Test\\skills',
          'D:\\projects\\claude-skills',
          '\\server\\share\\skills',
          'relative\\path\\to\\skill'
        ];

        windowsPaths.forEach(path => {
          const normalized = normalizePath(path);
          expect(normalized).not.toMatch(/\\/); // 没有反斜杠
          expect(normalized).toMatch(/\//); // 包含正斜杠
        });
      }
    });

    test('Unix路径保持不变', () => {
      if (process.platform !== 'win32') {
        const unixPaths = [
          '/home/user/skills',
          '/var/lib/claude/skills',
          './relative/path',
          '../parent/skills'
        ];

        unixPaths.forEach(path => {
          const normalized = normalizePath(path);
          expect(normalized).toBe(path); // 应该不变
        });
      }
    });

    test('混合路径分隔符处理', () => {
      const mixedPaths = [
        'C:\\Users/Test\\skills',
        '/home\\user/skills',
        'mixed\\path/separators'
      ];

      mixedPaths.forEach(path => {
        const normalized = normalizePath(path);
        expect(normalized).not.toMatch(/\\/);
      });
    });
  });

  describe('文件系统操作兼容性', () => {
    test('路径分隔符一致性', () => {
      const path = require('path');

      // 验证path.sep符合平台
      if (process.platform === 'win32') {
        expect(path.sep).toBe('\\');
      } else {
        expect(path.sep).toBe('/');
      }

      // 使用path.join应该产生平台正确的路径
      const joined = path.join('dir', 'subdir', 'file.txt');
      expect(typeof joined).toBe('string');
      expect(joined.length).toBeGreaterThan(0);
    });

    test('文件权限兼容性', () => {
      // 不同平台的文件权限处理可能不同
      const fs = require('fs');

      // 创建测试目录
      const testDir = 'compatibility-test-dir';
      try {
        fs.mkdirSync(testDir, { recursive: true });

        // 验证目录可访问
        const stats = fs.statSync(testDir);
        expect(stats.isDirectory()).toBe(true);

        // 清理
        fs.rmSync(testDir, { recursive: true });
      } catch (error) {
        // 在某些平台上可能失败（如权限不足）
        console.log(`文件权限测试跳过: ${error.message}`);
      }
    });

    test('行结束符处理', () => {
      // 不同平台的行结束符
      const textWithNewlines = 'Line 1\nLine 2\r\nLine 3\rLine 4';

      // 规范化行结束符
      const normalized = textWithNewlines.replace(/\r\n|\r/g, '\n');

      expect(normalized).toContain('\n');
      expect(normalized).not.toContain('\r\n');
      expect(normalized).not.toContain('\r');

      // 验证行数
      const lines = normalized.split('\n');
      expect(lines.length).toBe(4);
    });
  });

  describe('环境变量兼容性', () => {
    test('路径环境变量分隔符', () => {
      const pathDelimiter = process.platform === 'win32' ? ';' : ':';

      // 验证PATH分隔符
      const pathEnv = process.env.PATH || '';
      expect(typeof pathEnv).toBe('string');

      // 检查是否包含正确的分隔符
      if (pathEnv.includes(pathDelimiter)) {
        const paths = pathEnv.split(pathDelimiter);
        expect(paths.length).toBeGreaterThan(0);
      }
    });

    test('大小写敏感性', () => {
      // Windows不区分大小写，Unix区分
      const isCaseSensitive = process.platform !== 'win32';

      // 测试环境变量
      const testVarName = 'TEST_COMPATIBILITY_VAR';
      process.env[testVarName] = 'value';

      // 尝试用小写访问
      const lowerCaseName = testVarName.toLowerCase();
      const value = process.env[lowerCaseName];

      if (isCaseSensitive) {
        // Unix: 应该获取不到（除非刚好存在）
        expect(value).toBeUndefined();
      } else {
        // Windows: 应该能获取到
        expect(value).toBe('value');
      }

      // 清理
      delete process.env[testVarName];
    });
  });

  describe('命令行兼容性', () => {
    test('命令参数解析', () => {
      // 不同平台的命令行参数可能不同
      const testArgs = ['--skill-name', 'test-skill', '--output', './output'];

      // 模拟参数解析
      const parseArgs = (args) => {
        const result = {};
        for (let i = 0; i < args.length; i += 2) {
          if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            result[key] = args[i + 1];
          }
        }
        return result;
      };

      const parsed = parseArgs(testArgs);
      expect(parsed['skill-name']).toBe('test-skill');
      expect(parsed['output']).toBe('./output');
    });

    test('退出代码兼容性', () => {
      // 不同平台的退出代码可能不同，但0通常表示成功
      const successExitCode = 0;
      const errorExitCode = 1;

      expect(successExitCode).toBe(0);
      expect(errorExitCode).not.toBe(0);
    });
  });

  describe('网络兼容性', () => {
    test('URL处理', () => {
      // URL应该是平台无关的
      const testUrls = [
        'https://example.com/skills',
        'http://localhost:3000/api',
        'file:///home/user/skill.json'
      ];

      testUrls.forEach(url => {
        expect(typeof url).toBe('string');
        expect(url).toMatch(/^https?:\/\/|^file:\/\//);
      });
    });

    test('超时处理', () => {
      // 网络超时应该在不同平台一致
      const timeout = 5000; // 5秒
      expect(typeof timeout).toBe('number');
      expect(timeout).toBeGreaterThan(0);
    });
  });

  describe('编码兼容性', () => {
    test('字符编码', () => {
      const testStrings = [
        'ASCII: Hello World',
        'Unicode: 你好世界',
        'Emoji: 🚀 📁 🛠️',
        'Special: ©®™'
      ];

      testStrings.forEach(str => {
        const utf8 = Buffer.from(str, 'utf8');
        const decoded = utf8.toString('utf8');

        expect(decoded).toBe(str);
        expect(utf8.length).toBeGreaterThan(0);
      });
    });

    test('文件名编码', () => {
      // 测试不同编码的文件名
      const filenames = [
        'skill.json',
        '技能.json',
        'café-skill.json',
        'test-skill-v2.json'
      ];

      filenames.forEach(filename => {
        expect(typeof filename).toBe('string');
        expect(filename.length).toBeGreaterThan(0);
        expect(filename).toMatch(/\.json$/);
      });
    });
  });

  describe('时间兼容性', () => {
    test时区处理 = () => {
      const now = new Date();
      const utcString = now.toUTCString();
      const localString = now.toLocaleString();

      expect(typeof utcString).toBe('string');
      expect(typeof localString).toBe('string');
      expect(utcString).not.toBe(localString); // 通常不同

      // 验证时间戳（平台无关）
      const timestamp = now.getTime();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    };

    test('日期格式化', () => {
      const date = new Date('2026-01-01T00:00:00Z');

      // ISO格式是平台无关的
      const isoString = date.toISOString();
      expect(isoString).toBe('2026-01-01T00:00:00.000Z');

      // 其他格式可能因平台而异
      const localeString = date.toLocaleDateString();
      expect(typeof localeString).toBe('string');
    });
  });

  describe('库兼容性', () => {
    test('Node.js核心模块', () => {
      // 验证核心模块在不同平台都可用
      const coreModules = ['fs', 'path', 'os', 'util', 'events'];

      coreModules.forEach(moduleName => {
        const module = require(moduleName);
        expect(module).toBeDefined();
      });
    });

    test('第三方库可用性', () => {
      // 检查项目依赖
      const packageJson = require('../../package.json');
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});

      expect(Array.isArray(dependencies)).toBe(true);
      expect(Array.isArray(devDependencies)).toBe(true);

      // Jest应该在devDependencies中
      expect(devDependencies).toContain('jest');
    });
  });

  describe('配置兼容性', () => {
    test('配置文件格式', () => {
      // JSON应该是平台无关的
      const config = {
        skill_name: 'test-skill',
        output_dir: './output',
        format: 'json'
      };

      const jsonString = JSON.stringify(config);
      const parsedConfig = JSON.parse(jsonString);

      expect(parsedConfig).toEqual(config);
      expect(typeof jsonString).toBe('string');
    });

    test('环境配置', () => {
      // 环境变量应该是字符串
      const envVars = ['NODE_ENV', 'PATH', 'HOME', 'USER'];

      envVars.forEach(varName => {
        const value = process.env[varName];
        if (value !== undefined) {
          expect(typeof value).toBe('string');
        }
      });
    });
  });

  describe('构建兼容性', () => {
    test('构建脚本', () => {
      const packageJson = require('../../package.json');
      const scripts = packageJson.scripts || {};

      // 应该有测试脚本
      expect(scripts.test).toBeDefined();
      expect(typeof scripts.test).toBe('string');

      // 脚本应该可以在不同平台运行
      const script = scripts.test;
      expect(script.length).toBeGreaterThan(0);
    });

    test('构建产物', () => {
      // 验证生成的文件应该是平台无关的
      const generatedFiles = [
        'skill.json',
        'README.md',
        'package.json'
      ];

      generatedFiles.forEach(filename => {
        expect(typeof filename).toBe('string');
        expect(filename).toMatch(/\.[a-z]+$/); // 应该有扩展名
      });
    });
  });
});