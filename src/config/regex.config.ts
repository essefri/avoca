import { join, resolve } from 'path';
import { RegexConfiguration } from '../regex/config';

import {
  isArray,
  isBoolean,
  isEmptyArray,
  isEmptyObject,
  isEmptyText,
  isFalsy,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isObjectHasProps,
  isObjectOwnProps,
  isText,
  isTruthy,
  isUndefined,
  typeOf,
} from '../modules/Check';

import { lowerCase, upperCase } from '../modules/utils/Text';

const configuration: RegexConfiguration = {
  path: resolve(__dirname, '../../views/templates'),
  globals: [
    {
      name: 'app',
      value: {
        name: 'kika',
        version: '1.0.0',
        description: 'Powerful node js framework',
        company: 'kika',
      },
    },
    {
      name: 'author',
      value: {
        name: 'simo',
        email: 'empty for now',
      },
    },
    {
      name: 'env',
      value: 'development',
    },
  ],
  tools: [
    typeOf,
    isObject,
    isEmptyObject,
    isObjectOwnProps,
    isObjectHasProps,
    isArray,
    isEmptyArray,
    isFunction,
    isText,
    isEmptyText,
    isNumber,
    isBoolean,
    isTruthy,
    isFalsy,
    isNull,
    isUndefined,
    upperCase,
    lowerCase,
  ],
};

export default configuration;
