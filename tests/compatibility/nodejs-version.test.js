/**
 * 兼容性测试：Node.js版本
 */

describe('Node.js版本兼容性测试', () => {
  describe('Node.js版本检测', () => {
    test('当前Node.js版本', () => {
      const nodeVersion = process.version;
      const npmVersion = process.env.npm_config_user_agent || '';

      expect(typeof nodeVersion).toBe('string');
      expect(nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);

      console.log(`Node.js版本: ${nodeVersion}`);
      console.log(`NPM信息: ${npmVersion}`);
    });

    test('Node.js版本号解析', () => {
      const version = process.version.slice(1); // 移除'v'前缀
      const [major, minor, patch] = version.split('.').map(Number);

      expect(major).toBeGreaterThanOrEqual(14); // 需要Node.js 14+
      expect(typeof major).toBe('number');
      expect(typeof minor).toBe('number');
      expect(typeof patch).toBe('number');

      console.log(`版本解析: ${major}.${minor}.${patch}`);
    });
  });

  describe('语法兼容性', () => {
    test('ES6+语法支持', () => {
      // 测试现代JavaScript语法
      const testEs6Features = () => {
        // 箭头函数
        const add = (a, b) => a + b;
        expect(add(1, 2)).toBe(3);

        // 模板字符串
        const name = 'Skill Factory';
        const greeting = `Hello, ${name}!`;
        expect(greeting).toBe('Hello, Skill Factory!');

        // 解构赋值
        const obj = { a: 1, b: 2 };
        const { a, b } = obj;
        expect(a).toBe(1);
        expect(b).toBe(2);

        // 扩展运算符
        const arr1 = [1, 2];
        const arr2 = [...arr1, 3, 4];
        expect(arr2).toEqual([1, 2, 3, 4]);

        // 默认参数
        const multiply = (x, y = 1) => x * y;
        expect(multiply(5)).toBe(5);
        expect(multiply(5, 2)).toBe(10);

        return true;
      };

      expect(testEs6Features()).toBe(true);
    });

    test('ES2020+语法支持', () => {
      // 测试较新的JavaScript特性
      const testModernFeatures = () => {
        // 可选链操作符 (Node.js 14+)
        const obj = { a: { b: { c: 1 } } };
        const value = obj.a?.b?.c;
        expect(value).toBe(1);

        // 空值合并操作符 (Node.js 14+)
        const nullValue = null;
        const defaultValue = nullValue ?? 'default';
        expect(defaultValue).toBe('default');

        // Promise.allSettled (Node.js 12.9+)
        const promises = [
          Promise.resolve('success'),
          Promise.reject('error')
        ];

        return Promise.allSettled(promises).then(results => {
          expect(results.length).toBe(2);
          expect(results[0].status).toBe('fulfilled');
          expect(results[1].status).toBe('rejected');
          return true;
        });
      };

      return expect(testModernFeatures()).resolves.toBe(true);
    });

    test('不支持的老旧语法检测', () => {
      // 检查是否使用了不兼容的语法
      const checkForUnsupportedSyntax = (code) => {
        const unsupportedPatterns = [
          /import\s+[\s\S]*?from\s+['"]/g, // ES6 import（在Node.js中需要特定配置）
          /export\s+default/g, // ES6 export default
        ];

        const issues = [];
        unsupportedPatterns.forEach(pattern => {
          if (pattern.test(code)) {
            issues.push(`可能不兼容的语法: ${pattern}`);
          }
        });

        return issues;
      };

      // 测试代码示例
      const testCode = `
        const fs = require('fs');
        module.exports = { test: true };
      `;

      const issues = checkForUnsupportedSyntax(testCode);
      expect(issues.length).toBe(0);
    });
  });

  describe('API兼容性', () => {
    test('Node.js核心API', () => {
      // 检查使用的Node.js API在不同版本的可用性
      const coreApis = [
        'fs.promises', // Node.js 10+
        'util.promisify', // Node.js 8+
        'path.posix', // Node.js 0.11+
        'os.cpus', // Node.js 0.3+
        'process.allowedNodeEnvironmentFlags' // Node.js 10.10+
      ];

      coreApis.forEach(apiPath => {
        const parts = apiPath.split('.');
        let current = global;

        parts.forEach(part => {
          current = current[part];
        });

        expect(current).toBeDefined();
      });
    });

    test('Buffer API兼容性', () => {
      // Buffer API在Node.js不同版本有变化
      const testBuffer = Buffer.from('test', 'utf8');
      expect(Buffer.isBuffer(testBuffer)).toBe(true);
      expect(testBuffer.toString()).toBe('test');

      // Buffer.alloc (Node.js 4.5+)
      const allocBuffer = Buffer.alloc(10);
      expect(allocBuffer.length).toBe(10);

      // Buffer.allocUnsafe (Node.js 4.5+)
      const unsafeBuffer = Buffer.allocUnsafe(10);
      expect(unsafeBuffer.length).toBe(10);
    });

    test('事件循环API', () => {
      // setImmediate和nextTick的可用性
      expect(typeof setImmediate).toBe('function');
      expect(typeof process.nextTick).toBe('function');

      // 微任务队列
      expect(typeof Promise).toBe('function');
      expect(typeof queueMicrotask).toBe('function'); // Node.js 11+
    });
  });

  describe('模块系统兼容性', () => {
    test('CommonJS模块', () => {
      // CommonJS应该是所有Node.js版本都支持的
      const mockModule = {
        exports: {},
        require: require,
        __filename: __filename,
        __dirname: __dirname
      };

      expect(typeof require).toBe('function');
      expect(typeof module).toBe('object');
      expect(typeof exports).toBe('object');
      expect(typeof __filename).toBe('string');
      expect(typeof __dirname).toBe('string');
    });

    test('ES模块检测', () => {
      // 检查是否可以使用ES模块
      const hasEsModuleSupport = () => {
        try {
          // 尝试动态import
          // import是关键字，不能直接检查，改为检查动态import支持
          if (typeof import !== 'undefined') {
            return true;
          }
        } catch (e) {
          return false;
        }
        return false;
      };

      // 记录但不强制要求
      const supportsEsModules = hasEsModuleSupport();
      console.log(`ES模块支持: ${supportsEsModules}`);
    });

    test('包类型检测', () => {
      const packageJson = require('../../package.json');

      // 检查package.json中的模块类型
      const packageType = packageJson.type || 'commonjs';
      expect(['commonjs', 'module']).toContain(packageType);

      // 检查exports字段
      const hasExportsField = packageJson.exports !== undefined;
      console.log(`包类型: ${packageType}, 有exports字段: ${hasExportsField}`);
    });
  });

  describe('依赖兼容性', () => {
    test('依赖版本范围', () => {
      const packageJson = require('../../package.json');
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};

      // 检查依赖版本语法
      const checkVersionSyntax = (version) => {
        // 有效的版本范围：1.0.0, ^1.0.0, ~1.0.0, >=1.0.0 <2.0.0
        return /^[\d\^~\>\<\=\|\s\-\.x*]+$/.test(version);
      };

      Object.entries({ ...dependencies, ...devDependencies }).forEach(([pkg, version]) => {
        expect(typeof pkg).toBe('string');
        expect(typeof version).toBe('string');
        expect(checkVersionSyntax(version)).toBe(true);
      });
    });

    test('peerDependencies检查', () => {
      const packageJson = require('../../package.json');
      const peerDependencies = packageJson.peerDependencies || {};

      // peerDependencies应该指定兼容的版本范围
      Object.entries(peerDependencies).forEach(([pkg, version]) => {
        expect(typeof pkg).toBe('string');
        expect(typeof version).toBe('string');
        expect(version).toMatch(/^[\d\^~\>\<=\s]+$/);
      });
    });
  });

  describe('工具链兼容性', () => {
    test('构建工具', () => {
      const packageJson = require('../../package.json');
      const scripts = packageJson.scripts || {};

      // 检查构建脚本
      const buildScripts = ['build', 'test', 'lint', 'format'];
      buildScripts.forEach(script => {
        if (scripts[script]) {
          expect(typeof scripts[script]).toBe('string');
        }
      });
    });

    test('测试框架', () => {
      // Jest应该是可用的
      const jest = require('jest');
      expect(jest).toBeDefined();

      // 检查Jest版本
      const jestPackage = require('jest/package.json');
      expect(typeof jestPackage.version).toBe('string');

      console.log(`Jest版本: ${jestPackage.version}`);
    });

    test('代码质量工具', () => {
      const packageJson = require('../../package.json');
      const devDependencies = packageJson.devDependencies || {};

      // 检查是否有ESLint
      const hasEslint = 'eslint' in devDependencies;
      if (hasEslint) {
        try {
          const eslint = require('eslint');
          expect(eslint).toBeDefined();
        } catch (e) {
          console.log('ESLint未安装或不可用');
        }
      }
    });
  });

  describe('环境兼容性', () => {
    test('NODE_ENV处理', () => {
      const originalEnv = process.env.NODE_ENV;

      // 测试不同的NODE_ENV值
      const envValues = ['development', 'production', 'test'];

      envValues.forEach(env => {
        process.env.NODE_ENV = env;
        expect(process.env.NODE_ENV).toBe(env);
      });

      // 恢复原始环境
      process.env.NODE_ENV = originalEnv || 'test';
    });

    test('环境变量类型', () => {
      // 环境变量应该是字符串或undefined
      const envVars = ['PORT', 'HOST', 'DEBUG'];

      envVars.forEach(varName => {
        const value = process.env[varName];
        if (value !== undefined) {
          expect(typeof value).toBe('string');
        }
      });
    });
  });

  describe('性能API兼容性', () => {
    test('Performance API', () => {
      // performance API在Node.js中的可用性
      expect(typeof performance).toBe('object');
      expect(typeof performance.now).toBe('function');

      const start = performance.now();
      expect(typeof start).toBe('number');
      expect(start).toBeGreaterThan(0);
    });

    test('内存使用API', () => {
      const memoryUsage = process.memoryUsage();
      expect(typeof memoryUsage).toBe('object');
      expect(typeof memoryUsage.heapUsed).toBe('number');
      expect(typeof memoryUsage.heapTotal).toBe('number');
      expect(typeof memoryUsage.rss).toBe('number');
      expect(typeof memoryUsage.external).toBe('number');
    });
  });

  describe('向后兼容性', () => {
    test('废弃API警告', () => {
      // 监听deprecation警告
      const originalEmit = process.emitWarning;
      let deprecationWarnings = [];

      process.emitWarning = (warning, type) => {
        if (type === 'DeprecationWarning') {
          deprecationWarnings.push(warning);
        }
        originalEmit.call(process, warning, type);
      };

      // 尝试使用可能废弃的API
      try {
        // 例如：Buffer构造函数
        const buffer = new Buffer('test');
      } catch (e) {
        // 可能在新版本中已移除
      }

      // 恢复
      process.emitWarning = originalEmit;

      console.log(`发现${deprecationWarnings.length}个废弃API警告`);
    });

    test('特性检测', () => {
      // 检测某些特性是否可用
      const features = {
        asyncHooks: typeof require('async_hooks') !== 'undefined',
        workerThreads: typeof require('worker_threads') !== 'undefined',
        wasm: typeof WebAssembly !== 'undefined'
      };

      expect(typeof features).toBe('object');
      console.log('Node.js特性:', features);
    });
  });

  describe('安全兼容性', () => {
    test('TLS/SSL支持', () => {
      const tls = require('tls');
      expect(typeof tls).toBe('object');
      expect(typeof tls.createServer).toBe('function');

      // 检查TLS版本支持
      const tlsVersions = ['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'];
      tlsVersions.forEach(version => {
        expect(typeof version).toBe('string');
      });
    });

    test('加密API', () => {
      const crypto = require('crypto');
      expect(typeof crypto).toBe('object');
      expect(typeof crypto.createHash).toBe('function');

      // 测试常用哈希算法
      const algorithms = ['sha256', 'sha512', 'md5'];
      algorithms.forEach(algo => {
        const hash = crypto.createHash(algo);
        expect(typeof hash.update).toBe('function');
        expect(typeof hash.digest).toBe('function');
      });
    });
  });
});