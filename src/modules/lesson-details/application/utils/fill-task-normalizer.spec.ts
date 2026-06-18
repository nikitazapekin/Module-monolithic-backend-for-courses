import { normalizeFillTaskBlock } from './fill-task-normalizer';

describe('fill-task-normalizer', () => {
  it('normalizes legacy string options and [input] placeholders', () => {
    const block = normalizeFillTaskBlock({
      type: 'fillCodeTask',
      templateCode: 'return [input1] + [input2];',
      options: ['a', 'b'],
      testCases: [
        {
          id: 'case_1',
          values: [
            { inputId: 'input1', value: 'a' },
            { inputId: 'input2', value: 'b' },
          ],
        },
      ],
    });

    expect(block.options).toEqual([
      { id: 'fill_option_1', value: 'a' },
      { id: 'fill_option_2', value: 'b' },
    ]);
    expect(block.testCases).toEqual([
      {
        id: 'case_1',
        values: [
          { slotId: 'input1', optionId: 'fill_option_1' },
          { slotId: 'input2', optionId: 'fill_option_2' },
        ],
      },
    ]);
  });

  it('keeps multiple acceptable combinations for [[slot]] placeholders', () => {
    const block = normalizeFillTaskBlock({
      type: 'fillCodeTask',
      templateCode: 'return [[left]] + [[right]];',
      options: [
        { id: 'opt_a', value: 'a' },
        { id: 'opt_b', value: 'b' },
      ],
      testCases: [
        {
          id: 'case_1',
          values: [
            { slotId: 'left', optionId: 'opt_a' },
            { slotId: 'right', optionId: 'opt_b' },
          ],
        },
        {
          id: 'case_2',
          values: [
            { slotId: 'left', optionId: 'opt_b' },
            { slotId: 'right', optionId: 'opt_a' },
          ],
        },
      ],
    });

    expect(block.testCases).toHaveLength(2);
    expect(block.testCases).toEqual([
      {
        id: 'case_1',
        values: [
          { slotId: 'left', optionId: 'opt_a' },
          { slotId: 'right', optionId: 'opt_b' },
        ],
      },
      {
        id: 'case_2',
        values: [
          { slotId: 'left', optionId: 'opt_b' },
          { slotId: 'right', optionId: 'opt_a' },
        ],
      },
    ]);
  });
});
