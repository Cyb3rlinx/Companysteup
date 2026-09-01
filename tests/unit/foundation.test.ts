import { expect, test } from 'vitest';
import { JURISDICTIONS } from '../../packages/domain';
test('MVP contiene exactamente cuatro jurisdicciones', () => expect(JURISDICTIONS).toEqual(['US-DE','US-WY','EE','GB']));
