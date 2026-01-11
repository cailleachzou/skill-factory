/**
 * 性能测试：内存使用
 */

describe('内存使用性能测试', () => {
  // 模拟内存使用监控
  const getMemoryUsage = () => {
    if (global.gc) {
      global.gc(); // 强制垃圾回收（如果启用）
    }

    const used = process.memoryUsage();
    return {
      heapUsed: used.heapUsed,
      heapTotal: used.heapTotal,
      external: used.external,
      rss: used.rss
    };
  };

  describe('单个技能生成的内存使用', () => {
    test('简单技能的内存占用', async () => {
      const initialMemory = getMemoryUsage();

      // 模拟技能生成
      const generateSimpleSkill = () => {
        const files = [];
        for (let i = 0; i < 10; i++) {
          files.push({
            path: `skill/file${i}.json`,
            content: JSON.stringify({ data: 'x'.repeat(1024) }) // 1KB数据
          });
        }
        return files;
      };

      const result = generateSimpleSkill();
      const finalMemory = getMemoryUsage();

      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // 验证内存使用在合理范围内
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 小于10MB
      expect(result.length).toBe(10);

      console.log(`简单技能内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    test('大技能包的内存占用', async () => {
      const initialMemory = getMemoryUsage();

      const generateLargeSkill = () => {
        const files = [];
        const fileCount = 100;
        const fileSize = 1024 * 10; // 10KB per file

        for (let i = 0; i < fileCount; i++) {
          files.push({
            path: `large-skill/file${i}.json`,
            content: 'x'.repeat(fileSize),
            size: fileSize
          });
        }
        return files;
      };

      const result = generateLargeSkill();
      const finalMemory = getMemoryUsage();

      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // 100个10KB文件大约1MB，加上开销
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 小于5MB
      expect(result.length).toBe(100);

      const totalSize = result.reduce((sum, file) => sum + file.size, 0);
      expect(totalSize).toBe(100 * 1024 * 10); // 1MB

      console.log(`大技能包内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('批量生成的内存使用', () => {
    test('批量生成的内存增长', async () => {
      const initialMemory = getMemoryUsage();

      const generateBatch = (count) => {
        const batch = [];
        for (let i = 0; i < count; i++) {
          batch.push({
            skill_name: `batch-skill-${i}`,
            files: Array(5).fill(0).map((_, j) => ({
              path: `skill-${i}/file${j}.json`,
              content: 'test'
            }))
          });
        }
        return batch;
      };

      const batchSize = 20;
      const result = generateBatch(batchSize);
      const finalMemory = getMemoryUsage();

      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // 20个技能，每个5个文件
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // 小于20MB
      expect(result.length).toBe(batchSize);

      const totalFiles = result.reduce((sum, skill) => sum + skill.files.length, 0);
      expect(totalFiles).toBe(batchSize * 5);

      console.log(`批量生成内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    test('内存释放验证', async () => {
      const initialMemory = getMemoryUsage();

      // 创建大量临时数据
      const createTemporaryData = () => {
        const data = [];
        for (let i = 0; i < 1000; i++) {
          data.push({
            id: i,
            content: 'x'.repeat(1024) // 1KB each
          });
        }
        return data;
      };

      let temporaryData = createTemporaryData();
      const memoryWithData = getMemoryUsage();
      const memoryIncreaseWithData = memoryWithData.heapUsed - initialMemory.heapUsed;

      // 释放引用
      temporaryData = null;

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }

      // 等待垃圾回收
      await new Promise(resolve => setTimeout(resolve, 100));

      const memoryAfterGC = getMemoryUsage();
      const memoryAfterGCIncrease = memoryAfterGC.heapUsed - initialMemory.heapUsed;

      // 内存应该被释放
      expect(memoryAfterGCIncrease).toBeLessThan(memoryIncreaseWithData);

      console.log(`数据存在时内存增加: ${(memoryIncreaseWithData / 1024 / 1024).toFixed(2)}MB`);
      console.log(`GC后内存增加: ${(memoryAfterGCIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('内存泄漏检测', () => {
    test('重复操作的内存稳定性', async () => {
      const memoryReadings = [];

      const generateAndCleanup = (iteration) => {
        // 创建数据
        const data = Array(100).fill(0).map((_, i) => ({
          id: i,
          value: `iteration-${iteration}-item-${i}`
        }));

        // 使用数据
        const processed = data.map(item => ({ ...item, processed: true }));

        // 返回处理结果，但不保留引用
        return processed.length;
      };

      // 运行多次迭代
      for (let i = 0; i < 10; i++) {
        const memoryBefore = getMemoryUsage();
        generateAndCleanup(i);
        const memoryAfter = getMemoryUsage();

        memoryReadings.push({
          iteration: i,
          heapUsed: memoryAfter.heapUsed,
          increase: memoryAfter.heapUsed - memoryBefore.heapUsed
        });

        // 短暂延迟
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // 分析内存趋势
      const firstReading = memoryReadings[0].heapUsed;
      const lastReading = memoryReadings[memoryReadings.length - 1].heapUsed;
      const totalIncrease = lastReading - firstReading;

      // 内存增长应该很小（没有泄漏）
      expect(totalIncrease).toBeLessThan(5 * 1024 * 1024); // 小于5MB

      // 检查是否有持续增长趋势
      let increasingCount = 0;
      for (let i = 1; i < memoryReadings.length; i++) {
        if (memoryReadings[i].heapUsed > memoryReadings[i - 1].heapUsed) {
          increasingCount++;
        }
      }

      // 不应该每次迭代都增长
      expect(increasingCount).toBeLessThan(memoryReadings.length * 0.8); // 80%以下

      console.log('内存读数:', memoryReadings.map(r => ({
        iteration: r.iteration,
        heapMB: (r.heapUsed / 1024 / 1024).toFixed(2),
        increaseKB: (r.increase / 1024).toFixed(2)
      })));
    });

    test('闭包引起的内存泄漏检测', async () => {
      const initialMemory = getMemoryUsage();

      // 模拟可能泄漏的闭包
      const createLeakyClosure = () => {
        const largeData = 'x'.repeat(1024 * 1024); // 1MB数据
        let leakedReference = null;

        return {
          setup: () => {
            // 闭包捕获largeData
            leakedReference = {
              data: largeData,
              timestamp: Date.now()
            };
          },
          cleanup: () => {
            // 应该释放引用，但可能会忘记
            leakedReference = null;
          }
        };
      };

      const closures = [];

      // 创建多个闭包
      for (let i = 0; i < 5; i++) {
        const closure = createLeakyClosure();
        closure.setup();
        closures.push(closure);
      }

      const memoryWithClosures = getMemoryUsage();

      // 清理闭包
      closures.forEach(closure => closure.cleanup());
      closures.length = 0; // 清除数组

      if (global.gc) {
        global.gc();
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      const memoryAfterCleanup = getMemoryUsage();

      const leakSize = memoryAfterCleanup.heapUsed - initialMemory.heapUsed;

      // 清理后内存应该接近初始值
      expect(leakSize).toBeLessThan(2 * 1024 * 1024); // 小于2MB（允许一些开销）

      console.log(`闭包泄漏检测: 初始${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB, 清理后${(memoryAfterCleanup.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('内存使用优化', () => {
    test('流式处理 vs 一次性加载', async () => {
      const largeDataSize = 100 * 1024 * 1024; // 100MB数据
      const chunkSize = 1024 * 1024; // 1MB块

      // 一次性加载
      const loadAllAtOnce = () => {
        const startMemory = getMemoryUsage();
        const data = 'x'.repeat(largeDataSize);
        const endMemory = getMemoryUsage();

        return {
          memoryIncrease: endMemory.heapUsed - startMemory.heapUsed,
          dataLength: data.length
        };
      };

      // 流式处理
      const processInChunks = () => {
        const startMemory = getMemoryUsage();
        let totalProcessed = 0;
        const chunks = Math.ceil(largeDataSize / chunkSize);

        for (let i = 0; i < chunks; i++) {
          const chunk = 'x'.repeat(Math.min(chunkSize, largeDataSize - i * chunkSize));
          totalProcessed += chunk.length;
          // 处理块，然后丢弃
        }

        const endMemory = getMemoryUsage();

        return {
          memoryIncrease: endMemory.heapUsed - startMemory.heapUsed,
          totalProcessed
        };
      };

      // 注意：实际测试中我们使用小数据以避免内存不足
      const smallDataSize = 10 * 1024 * 1024; // 10MB

      const onceResult = (() => {
        const startMemory = getMemoryUsage();
        const data = 'x'.repeat(smallDataSize);
        const endMemory = getMemoryUsage();
        return {
          memoryIncrease: endMemory.heapUsed - startMemory.heapUsed,
          dataLength: data.length
        };
      })();

      const chunkResult = (() => {
        const startMemory = getMemoryUsage();
        let totalProcessed = 0;
        const chunks = Math.ceil(smallDataSize / chunkSize);

        for (let i = 0; i < chunks; i++) {
          const chunk = 'x'.repeat(Math.min(chunkSize, smallDataSize - i * chunkSize));
          totalProcessed += chunk.length;
        }

        const endMemory = getMemoryUsage();
        return {
          memoryIncrease: endMemory.heapUsed - startMemory.heapUsed,
          totalProcessed
        };
      })();

      // 流式处理应该使用更少的内存
      expect(chunkResult.memoryIncrease).toBeLessThan(onceResult.memoryIncrease);

      console.log(`一次性加载内存增加: ${(onceResult.memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      console.log(`流式处理内存增加: ${(chunkResult.memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    test('对象池优化', async () => {
      class ObjectPool {
        constructor(createFn) {
          this.createFn = createFn;
          this.pool = [];
        }

        acquire() {
          if (this.pool.length > 0) {
            return this.pool.pop();
          }
          return this.createFn();
        }

        release(obj) {
          // 重置对象状态
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              delete obj[key];
            }
          }
          this.pool.push(obj);
        }
      }

      const initialMemory = getMemoryUsage();

      // 创建对象池
      const pool = new ObjectPool(() => ({
        data: new Array(1000).fill(0),
        metadata: {},
        timestamp: Date.now()
      }));

      const objects = [];

      // 使用对象池
      for (let i = 0; i < 100; i++) {
        const obj = pool.acquire();
        obj.data.fill(i); // 使用对象
        objects.push(obj);
      }

      const memoryWithObjects = getMemoryUsage();

      // 释放对象回池
      objects.forEach(obj => pool.release(obj));
      objects.length = 0;

      if (global.gc) {
        global.gc();
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      const memoryAfterRelease = getMemoryUsage();

      const memoryIncrease = memoryAfterRelease.heapUsed - initialMemory.heapUsed;

      // 对象池应该减少内存分配
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 小于5MB

      console.log(`对象池内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('内存限制测试', () => {
    test('内存限制下的操作', async () => {
      const memoryLimit = 100 * 1024 * 1024; // 100MB限制

      const checkMemoryLimit = (currentUsage) => {
        if (currentUsage > memoryLimit) {
          throw new Error(`内存超出限制: ${currentUsage} > ${memoryLimit}`);
        }
        return true;
      };

      const currentMemory = getMemoryUsage().heapUsed;

      // 应该通过
      expect(checkMemoryLimit(currentMemory)).toBe(true);

      // 模拟接近限制
      expect(() => checkMemoryLimit(memoryLimit + 1)).toThrow('内存超出限制');

      console.log(`当前内存使用: ${(currentMemory / 1024 / 1024).toFixed(2)}MB, 限制: ${(memoryLimit / 1024 / 1024).toFixed(2)}MB`);
    });

    test('内存不足的优雅处理', async () => {
      const simulateMemoryPressure = () => {
        try {
          // 尝试分配大量内存
          const hugeArray = [];
          for (let i = 0; i < 10000000; i++) { // 尝试1000万个元素
            hugeArray.push('x'.repeat(1024));
            // 检查内存使用
            const memory = getMemoryUsage();
            if (memory.heapUsed > 500 * 1024 * 1024) { // 超过500MB
              throw new Error('内存不足，停止分配');
            }
          }
          return hugeArray.length;
        } catch (error) {
          if (error.message.includes('内存不足')) {
            // 优雅处理：清理并返回错误
            return { error: '内存不足，操作中止' };
          }
          throw error;
        }
      };

      const result = simulateMemoryPressure();

      // 应该优雅处理，而不是崩溃
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('内存不足，操作中止');

      console.log('内存不足测试:', result);
    });
  });

  describe('内存性能报告', () => {
    test('内存使用统计', () => {
      const memoryStats = getMemoryUsage();

      // 验证内存统计结构
      expect(memoryStats).toHaveProperty('heapUsed');
      expect(memoryStats).toHaveProperty('heapTotal');
      expect(memoryStats).toHaveProperty('external');
      expect(memoryStats).toHaveProperty('rss');

      // 验证值合理性
      expect(memoryStats.heapUsed).toBeGreaterThan(0);
      expect(memoryStats.heapTotal).toBeGreaterThanOrEqual(memoryStats.heapUsed);
      expect(memoryStats.rss).toBeGreaterThan(0);

      // 计算使用率
      const heapUsageRatio = memoryStats.heapUsed / memoryStats.heapTotal;
      expect(heapUsageRatio).toBeGreaterThan(0);
      expect(heapUsageRatio).toBeLessThan(1);

      console.log('内存统计:', {
        heapUsedMB: (memoryStats.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (memoryStats.heapTotal / 1024 / 1024).toFixed(2),
        heapUsage: `${(heapUsageRatio * 100).toFixed(1)}%`,
        rssMB: (memoryStats.rss / 1024 / 1024).toFixed(2)
      });
    });

    test('内存趋势分析', async () => {
      const samples = [];
      const sampleCount = 5;

      for (let i = 0; i < sampleCount; i++) {
        // 模拟一些工作
        const tempData = Array(1000).fill(0).map((_, j) => ({
          id: j,
          value: Math.random()
        }));

        const memory = getMemoryUsage();
        samples.push({
          time: Date.now(),
          heapUsed: memory.heapUsed,
          sample: i
        });

        // 清理
        tempData.length = 0;

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 分析趋势
      const firstSample = samples[0].heapUsed;
      const lastSample = samples[samples.length - 1].heapUsed;
      const trend = lastSample - firstSample;

      // 内存趋势应该相对平稳
      expect(Math.abs(trend)).toBeLessThan(10 * 1024 * 1024); // 变化小于10MB

      console.log('内存趋势样本:', samples.map(s => ({
        sample: s.sample,
        heapMB: (s.heapUsed / 1024 / 1024).toFixed(2),
        time: s.time
      })));
      console.log(`内存趋势变化: ${(trend / 1024 / 1024).toFixed(2)}MB`);
    });
  });
});