import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import babelParser from '@babel/eslint-parser';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: babelParser,
      globals: {
        ...globals.browser,
        fetch: 'readonly'
      },
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['next/babel']
        }
      }
    },
    
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/jsx-props-no-spreading": "off",
      "no-unused-vars": [
        "error",
        {
          "varsIgnorePattern": "^(React|Checks|Button|DropdownItem|DropdownMenu|DropdownToggle)$",
          "argsIgnorePattern": "^_"
        }
      ]
    }
  }
  ,
  {
    files: ["**/*.stories.js"],
    rules: {
      "react/jsx-props-no-spreading": "off",
      "react-hooks/exhaustive-deps": "off"
    }
  }
];


