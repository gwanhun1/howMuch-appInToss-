import { describe, expect, it } from 'vitest';
import examples from '../../shared/business-rules.json';
import { parseExpenseAmount } from './budgetCalculator';
import { getAmountGuide } from './amountGuide';
import type { Closeness, GuideEvent } from './amountGuide/type';

describe('React/Flutter 공통 업무 규칙', () => {
  for (const example of examples.amounts) {
    it(`금액 ${JSON.stringify(example.input)}`, () => {
      expect(parseExpenseAmount(example.input)).toBe(example.expected);
    });
  }
  for (const example of examples.guides) {
    it(`${example.type}/${example.closeness}/${example.attending}`, () => {
      expect(getAmountGuide({type: example.type as GuideEvent, closeness: example.closeness as Closeness,
        attending: example.attending, relation: '친구'}).amounts).toEqual(example.expected);
    });
  }
});
