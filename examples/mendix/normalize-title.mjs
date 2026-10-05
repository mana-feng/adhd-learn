function normalizeTitle(input) {
    if (typeof input !== 'string') {
        throw new TypeError('标题必须是字符串');
    }
    return input.trim().replace(/\s+/gu, ' ');
}

const cases = [
    ['  投影仪   不亮  ', '投影仪 不亮'],
    ['\t门锁\n故障', '门锁 故障'],
    ['   ', ''],
];
for (const [input, expected] of cases) {
    const actual = normalizeTitle(input);
    if (actual !== expected) throw new Error('规范化结果不符合预期');
    console.log(actual === '' ? '空字符串' : actual);
}
