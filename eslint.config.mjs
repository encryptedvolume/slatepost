import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/*
 * Tailwind's `/<number>` alpha modifier (`text-textColor/50`, `bg-primary/80`,
 * `border-newTextColor/10`, `bg-forth/10`) manufactures a colour step that no
 * token names and nobody reviewed. It is the easiest way to defeat the "at
 * most three text colours per screen" contract in tailwind.config.cjs, and it
 * produced 36 off-token values before this rule existed — several of which
 * failed WCAG AA in one theme while passing in the other, because an alpha
 * composite lands on a different colour over a light backdrop than over a
 * dark one. A token cannot do that: it is defined per theme.
 *
 * Name a token instead: ink / inkSecondary / inkTertiary for text,
 * hairline / line / lineStrong for rules, lineControl for control boundaries,
 * surface / surfaceSunken / surfaceHover / surfaceActive / surfaceOverlay for
 * fills, and scrim for a wash over arbitrary content.
 *
 * `/` is spelled `\x2f` because esquery ends an attribute regex at the first
 * literal slash.
 */
const ALPHA_MODIFIER =
  '(^|\\s)(accent|bg|border|caret|decoration|divide|fill|from|outline|placeholder|ring|shadow|stroke|text|to|via)-[A-Za-z][A-Za-z0-9]*\\x2f(\\[[0-9.]+\\]|[0-9]+)(\\s|$)';

const ALPHA_MODIFIER_MESSAGE =
  'Tailwind alpha modifiers (`text-token/50`, `bg-token/10`, ...) are banned: ' +
  'they manufacture an off-token colour step that nobody reviewed and that ' +
  'composites differently in light and dark. Name a token instead - ' +
  'ink/inkSecondary/inkTertiary, hairline/line/lineStrong/lineControl, ' +
  'surface*/scrim. See tailwind.config.cjs and colors.scss.';

const noAlphaColorModifier = [
  'error',
  {
    selector: `Literal[value=/${ALPHA_MODIFIER}/]`,
    message: ALPHA_MODIFIER_MESSAGE,
  },
  {
    selector: `TemplateElement[value.raw=/${ALPHA_MODIFIER}/]`,
    message: ALPHA_MODIFIER_MESSAGE,
  },
];

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    },
  }),
  {
    files: [
      'apps/frontend/**/*.{ts,tsx}',
      'apps/extension/**/*.{ts,tsx}',
      'libraries/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-syntax': noAlphaColorModifier,
    },
  },
];

export default eslintConfig;
