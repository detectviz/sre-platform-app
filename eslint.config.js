import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

const reactRules = {
  ...reactPlugin.configs.recommended.rules,
  ...reactHooksPlugin.configs.recommended.rules,
  'react/jsx-uses-react': 'off',
  'react/react-in-jsx-scope': 'off',
  'react/no-unescaped-entities': 'warn',
  'react/jsx-key': 'warn',
  'react-hooks/rules-of-hooks': 'warn',
  'react-hooks/exhaustive-deps': 'warn'
};

const jsFiles = ['**/*.js', '**/*.jsx'];
const tsFiles = ['**/*.ts', '**/*.tsx'];

export default [
  {
    ignores: ['dist', 'coverage', 'node_modules']
  },
  {
    files: jsFiles,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactRules,
      'no-unused-vars': 'warn'
    }
  },
  {
    files: tsFiles,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactRules,
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-case-declarations': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', disallowTypeAnnotations: false }
      ]
    }
  },
  {
    files: [...tsFiles, ...jsFiles],
    rules: {
      ...prettierConfig.rules
    }
  }
];
