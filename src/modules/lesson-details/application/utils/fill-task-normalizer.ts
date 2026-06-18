type GenericBlock = Record<string, unknown>;

interface FillTaskOption {
  id: string;
  value: string;
}

interface FillTaskCaseValue {
  slotId?: string;
  inputId?: string;
  optionId?: string | null;
  value?: string;
}

interface FillTaskCase {
  id?: string;
  values?: FillTaskCaseValue[];
}

const PLACEHOLDER_REGEX = /\[\[([\w-]+)\]\]|\[(input[\w-]*)\]/g;

const normalizeValue = (value: unknown): string => String(value ?? '').trim();

const createSlug = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'option';
};

const buildLegacyOptionId = (value: string, index: number): string =>
  `fill_option_${createSlug(value)}_${index + 1}`;

const getCaseValueSlotId = (value: FillTaskCaseValue): string =>
  value.slotId ?? value.inputId ?? '';

const extractFillTaskInputs = (templateCode: string): string[] => {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const match of templateCode.matchAll(PLACEHOLDER_REGEX)) {
    const slotId = match[1] ?? match[2];

    if (!slotId || seen.has(slotId)) {
      continue;
    }

    seen.add(slotId);
    result.push(slotId);
  }

  return result;
};

const normalizeOptions = (
  options: unknown,
  testCases: FillTaskCase[] | undefined,
): FillTaskOption[] => {
  const normalizedOptions: FillTaskOption[] = Array.isArray(options)
    ? options.map((option, index) => {
        if (typeof option === 'string') {
          return {
            id: `fill_option_${index + 1}`,
            value: option,
          };
        }

        const rawOption = (option ?? {}) as Record<string, unknown>;

        return {
          id: String(rawOption.id ?? `fill_option_${index + 1}`),
          value: String(rawOption.value ?? ''),
        };
      })
    : [];

  const seenValues = new Set(
    normalizedOptions.map((option) => normalizeValue(option.value)),
  );

  (testCases ?? []).forEach((testCase) => {
    (testCase.values ?? []).forEach((caseValue) => {
      const normalizedCaseValue = normalizeValue(caseValue.value);

      if (!normalizedCaseValue || seenValues.has(normalizedCaseValue)) {
        return;
      }

      normalizedOptions.push({
        id: buildLegacyOptionId(normalizedCaseValue, normalizedOptions.length),
        value: String(caseValue.value ?? ''),
      });
      seenValues.add(normalizedCaseValue);
    });
  });

  return normalizedOptions;
};

const findOptionIdByValue = (
  options: FillTaskOption[],
  value: unknown,
): string | null => {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return null;
  }

  return (
    options.find((option) => normalizeValue(option.value) === normalized)?.id ??
    null
  );
};

const syncFillTaskCases = (
  testCases: FillTaskCase[] | undefined,
  slotIds: string[],
  options: FillTaskOption[],
): FillTaskCase[] => {
  return (testCases ?? []).map((testCase, index) => {
    const values = Array.isArray(testCase.values) ? testCase.values : [];
    const valueMap = new Map(values.map((value) => [getCaseValueSlotId(value), value]));

    return {
      id: testCase.id ?? `fill_case_${index + 1}`,
      values: slotIds.map((slotId) => {
        const currentValue = valueMap.get(slotId);
        const optionId =
          currentValue?.optionId &&
          options.some((option) => option.id === currentValue.optionId)
            ? currentValue.optionId
            : findOptionIdByValue(options, currentValue?.value);

        return {
          slotId,
          optionId: optionId ?? null,
        };
      }),
    };
  });
};

export const normalizeFillTaskBlock = (block: GenericBlock): GenericBlock => {
  const templateCode = String(block.templateCode ?? '');
  const rawTestCases = Array.isArray(block.testCases)
    ? (block.testCases as FillTaskCase[])
    : [];
  const slotIds = extractFillTaskInputs(templateCode);
  const options = normalizeOptions(block.options, rawTestCases);

  return {
    ...block,
    templateCode,
    options,
    testCases: syncFillTaskCases(rawTestCases, slotIds, options),
  };
};

export const normalizeLessonBlocks = (blocks: unknown): GenericBlock[] => {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks.map((block) => {
    const rawBlock = (block ?? {}) as GenericBlock;

    if (rawBlock.type === 'fillCodeTask') {
      return normalizeFillTaskBlock(rawBlock);
    }

    return rawBlock;
  });
};
