/**
 * 性能测试：生成时间
 */

describe('生成时间性能测试', () => {
  // 模拟生成函数
  const mockGenerateSkill = async (input) => {
    // 模拟不同复杂度的生成时间
    const complexity = input.complexity || 1;
    const delay = complexity * 100; // 每单位复杂度100ms

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          generated_files: Array(complexity).fill(0).map((_, i) => ({
            path: `skill/file${i}.json`,
            size: 1024
          })),
          duration: delay
        });
      }, delay);
    });
  };

  describe('单个技能生成性能', () => {
    test('简单技能生成时间', async () => {
      const input = {
        skill_name: 'simple-skill',
        description: '简单技能',
        primary_function: '测试',
        complexity: 1
      };

      const startTime = Date.now();
      const result = await mockGenerateSkill(input);
      const endTime = Date.now();
      const measuredDuration = endTime - startTime;

      // 验证生成时间在合理范围内
      expect(measuredDuration).toBeLessThan(5000); // 5秒内
      expect(result.duration).toBe(100); // 模拟延迟100ms

      // 验证结果
      expect(result.generated_files.length).toBe(1);
    });

    test('中等复杂度技能生成时间', async () => {
      const input = {
        skill_name: 'medium-skill',
        description: '中等复杂度技能',
        primary_function: '测试',
        complexity: 5
      };

      const startTime = Date.now();
      const result = await mockGenerateSkill(input);
      const endTime = Date.now();
      const measuredDuration = endTime - startTime;

      expect(measuredDuration).toBeLessThan(10000); // 10秒内
      expect(result.duration).toBe(500); // 模拟延迟500ms
      expect(result.generated_files.length).toBe(5);
    });

    test('高复杂度技能生成时间', async () => {
      const input = {
        skill_name: 'complex-skill',
        description: '高复杂度技能',
        primary_function: '测试',
        complexity: 10
      };

      const startTime = Date.now();
      const result = await mockGenerateSkill(input);
      const endTime = Date.now();
      const measuredDuration = endTime - startTime;

      expect(measuredDuration).toBeLessThan(15000); // 15秒内
      expect(result.duration).toBe(1000); // 模拟延迟1000ms
      expect(result.generated_files.length).toBe(10);
    });
  });

  describe('批量生成性能', () => {
    test('批量生成10个技能', async () => {
      const skills = Array(10).fill(0).map((_, i) => ({
        skill_name: `batch-skill-${i}`,
        description: `批量测试技能 ${i}`,
        primary_function: '测试',
        complexity: 1
      }));

      const startTime = Date.now();

      const results = await Promise.all(skills.map(skill => mockGenerateSkill(skill)));

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // 批量生成应该比顺序生成快
      expect(totalDuration).toBeLessThan(2000); // 2秒内（并行）
      expect(results.length).toBe(10);

      // 验证每个结果
      results.forEach((result, i) => {
        expect(result.generated_files.length).toBe(1);
      });
    });

    test('批量生成不同复杂度的技能', async () => {
      const skills = [
        { skill_name: 'simple', complexity: 1 },
        { skill_name: 'medium', complexity: 3 },
        { skill_name: 'complex', complexity: 5 }
      ].map(skill => ({
        ...skill,
        description: `${skill.skill_name}技能`,
        primary_function: '测试'
      }));

      const startTime = Date.now();

      const results = await Promise.all(skills.map(skill => mockGenerateSkill(skill)));

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // 总时间应该接近最慢的那个（约500ms）
      expect(totalDuration).toBeLessThan(1000);
      expect(results.length).toBe(3);

      // 验证复杂度匹配
      expect(results[0].duration).toBe(100); // 简单
      expect(results[1].duration).toBe(300); // 中等
      expect(results[2].duration).toBe(500); // 复杂
    });

    test('大规模批量生成（50个技能）', async () => {
      const batchSize = 50;
      const skills = Array(batchSize).fill(0).map((_, i) => ({
        skill_name: `mass-skill-${i}`,
        description: `大规模测试技能 ${i}`,
        primary_function: '测试',
        complexity: 1
      }));

      const startTime = Date.now();

      // 分批次生成以避免资源耗尽
      const batchSizeLimit = 10;
      const batches = [];
      for (let i = 0; i < skills.length; i += batchSizeLimit) {
        const batch = skills.slice(i, i + batchSizeLimit);
        const batchResults = await Promise.all(batch.map(skill => mockGenerateSkill(skill)));
        batches.push(...batchResults);
      }

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      expect(batches.length).toBe(batchSize);
      expect(totalDuration).toBeLessThan(10000); // 10秒内

      // 验证没有丢失任何结果
      const fileCount = batches.reduce((sum, result) => sum + result.generated_files.length, 0);
      expect(fileCount).toBe(batchSize);
    });
  });

  describe('生成时间稳定性测试', () => {
    test('多次生成的时间一致性', async () => {
      const input = {
        skill_name: 'consistent-skill',
        description: '一致性测试技能',
        primary_function: '测试',
        complexity: 2
      };

      const durations = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await mockGenerateSkill(input);
        const endTime = Date.now();
        durations.push(endTime - startTime);
      }

      // 计算平均值和标准差
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const variance = durations.reduce((sum, duration) => sum + Math.pow(duration - avg, 2), 0) / durations.length;
      const stdDev = Math.sqrt(variance);

      // 验证时间相对稳定（标准差小于平均值的20%）
      expect(stdDev).toBeLessThan(avg * 0.2);

      // 验证所有时间都在合理范围内
      durations.forEach(duration => {
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(1000);
      });

      console.log(`平均生成时间: ${avg}ms, 标准差: ${stdDev}ms`);
    });

    test('冷启动 vs 热启动性能', async () => {
      const input = {
        skill_name: 'warmup-skill',
        description: '热启动测试技能',
        primary_function: '测试',
        complexity: 3
      };

      // 冷启动
      const coldStartTime = Date.now();
      await mockGenerateSkill(input);
      const coldEndTime = Date.now();
      const coldDuration = coldEndTime - coldStartTime;

      // 热启动（缓存等可能加速）
      const warmStartTime = Date.now();
      await mockGenerateSkill(input);
      const warmEndTime = Date.now();
      const warmDuration = warmEndTime - warmStartTime;

      // 热启动应该不慢于冷启动（在模拟中可能相同）
      expect(warmDuration).toBeLessThanOrEqual(coldDuration * 1.5); // 允许一些浮动

      console.log(`冷启动: ${coldDuration}ms, 热启动: ${warmDuration}ms`);
    });
  });

  describe('资源竞争下的性能', () => {
    test('高并发下的生成性能', async () => {
      const concurrency = 20;
      const skills = Array(concurrency).fill(0).map((_, i) => ({
        skill_name: `concurrent-skill-${i}`,
        description: `并发测试技能 ${i}`,
        primary_function: '测试',
        complexity: 2
      }));

      const startTime = Date.now();

      // 同时启动所有生成任务
      const promises = skills.map(skill => mockGenerateSkill(skill));
      const results = await Promise.all(promises);

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // 高并发下总时间应该明显小于顺序执行时间
      const sequentialEstimate = concurrency * 200; // 每个200ms
      expect(totalDuration).toBeLessThan(sequentialEstimate * 0.8); // 至少比顺序快20%

      expect(results.length).toBe(concurrency);
      console.log(`并发${concurrency}个技能生成时间: ${totalDuration}ms`);
    });

    test('CPU密集型任务的性能', async () => {
      // 模拟CPU密集型生成
      const cpuIntensiveGenerate = async (input) => {
        const start = Date.now();

        // 模拟CPU密集型计算
        let result = 0;
        for (let i = 0; i < 1000000 * (input.complexity || 1); i++) {
          result += Math.sqrt(i) * Math.random();
        }

        const end = Date.now();
        return {
          generated_files: [{ path: 'cpu-intensive.json', size: 1024 }],
          cpu_time: end - start,
          dummy_result: result // 防止优化
        };
      };

      const input = {
        skill_name: 'cpu-intensive',
        description: 'CPU密集型技能',
        primary_function: '测试',
        complexity: 5
      };

      const startTime = Date.now();
      const result = await cpuIntensiveGenerate(input);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      expect(totalDuration).toBeLessThan(5000); // 5秒内
      expect(result.cpu_time).toBeGreaterThan(0);
      expect(result.cpu_time).toBeLessThanOrEqual(totalDuration);
    });
  });

  describe('性能监控和报告', () => {
    test('性能指标收集', async () => {
      const performanceMetrics = {
        total_generations: 0,
        total_time: 0,
        fastest: Infinity,
        slowest: 0,
        failures: 0
      };

      const skills = Array(5).fill(0).map((_, i) => ({
        skill_name: `metric-skill-${i}`,
        description: `性能指标测试技能 ${i}`,
        primary_function: '测试',
        complexity: i + 1
      }));

      for (const skill of skills) {
        try {
          const startTime = Date.now();
          await mockGenerateSkill(skill);
          const endTime = Date.now();
          const duration = endTime - startTime;

          performanceMetrics.total_generations++;
          performanceMetrics.total_time += duration;
          performanceMetrics.fastest = Math.min(performanceMetrics.fastest, duration);
          performanceMetrics.slowest = Math.max(performanceMetrics.slowest, duration);
        } catch (error) {
          performanceMetrics.failures++;
        }
      }

      // 验证指标
      expect(performanceMetrics.total_generations).toBe(5);
      expect(performanceMetrics.failures).toBe(0);
      expect(performanceMetrics.fastest).toBeLessThanOrEqual(performanceMetrics.slowest);
      expect(performanceMetrics.total_time).toBeGreaterThan(0);

      const averageTime = performanceMetrics.total_time / performanceMetrics.total_generations;
      expect(averageTime).toBeGreaterThan(0);
      expect(averageTime).toBeLessThan(1000);

      console.log('性能指标:', performanceMetrics);
      console.log(`平均时间: ${averageTime}ms`);
    });

    test('性能阈值报警', () => {
      const checkPerformanceThreshold = (duration, threshold) => {
        if (duration > threshold) {
          throw new Error(`性能超出阈值: ${duration}ms > ${threshold}ms`);
        }
        return true;
      };

      // 正常情况
      expect(checkPerformanceThreshold(100, 500)).toBe(true);

      // 超出阈值
      expect(() => checkPerformanceThreshold(600, 500)).toThrow('性能超出阈值');

      // 边界情况
      expect(checkPerformanceThreshold(500, 500)).toBe(true);
    });
  });

  describe('性能优化验证', () => {
    test('缓存效果验证', async () => {
      const input = {
        skill_name: 'cached-skill',
        description: '缓存测试技能',
        primary_function: '测试',
        complexity: 3
      };

      // 第一次生成（冷缓存）
      const firstStart = Date.now();
      await mockGenerateSkill(input);
      const firstEnd = Date.now();
      const firstDuration = firstEnd - firstStart;

      // 模拟缓存命中
      const cachedGenerate = async (input) => {
        // 模拟缓存命中，时间减半
        const delay = (input.complexity * 100) / 2;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              generated_files: [{ path: 'cached.json', size: 1024 }],
              cached: true
            });
          }, delay);
        });
      };

      // 第二次生成（热缓存）
      const secondStart = Date.now();
      await cachedGenerate(input);
      const secondEnd = Date.now();
      const secondDuration = secondEnd - secondStart;

      // 缓存应该更快
      expect(secondDuration).toBeLessThan(firstDuration);

      console.log(`缓存前: ${firstDuration}ms, 缓存后: ${secondDuration}ms`);
      console.log(`性能提升: ${((firstDuration - secondDuration) / firstDuration * 100).toFixed(1)}%`);
    });

    test('并行化效果验证', async () => {
      const sequentialGenerate = async (skills) => {
        const results = [];
        for (const skill of skills) {
          results.push(await mockGenerateSkill(skill));
        }
        return results;
      };

      const parallelGenerate = async (skills) => {
        return Promise.all(skills.map(skill => mockGenerateSkill(skill)));
      };

      const skills = Array(5).fill(0).map((_, i) => ({
        skill_name: `parallel-test-${i}`,
        description: '并行化测试',
        primary_function: '测试',
        complexity: 2
      }));

      // 顺序执行
      const seqStart = Date.now();
      await sequentialGenerate(skills);
      const seqEnd = Date.now();
      const seqDuration = seqEnd - seqStart;

      // 并行执行
      const parStart = Date.now();
      await parallelGenerate(skills);
      const parEnd = Date.now();
      const parDuration = parEnd - parStart;

      // 并行应该更快（在模拟中可能不明显，但理论上应该）
      expect(parDuration).toBeLessThanOrEqual(seqDuration);

      console.log(`顺序执行: ${seqDuration}ms, 并行执行: ${parDuration}ms`);
      console.log(`加速比: ${(seqDuration / parDuration).toFixed(2)}x`);
    });
  });
});