const log = require('debug')('casefold')
import {
  cloneDeep, get, set, isFunction, toString
} from 'lodash'

/**
 * casefold
 * Taken from Python's str.casefold, it is designed to allow
 * comparison of string values without regard to casing. In
 * most cases whitespace will not matter, either.
 * Note that this package currently uses .toLowerCase for
 * comparison, which is not as robust as localeCompare. A future
 * enhancement will convert comparison to this method.
 *
 */

interface Object {
  [key: string]: any
}

/**
 * Optional options for transformObject
 *
 * @param {boolean} keep_unmatched Set to true to return untransformed keys from the source object
 * @param {object} context An object that will be passed to transform functions
 */
export interface TransformOptions {
  [key: string]: any
  // exact_match: boolean
  keep_unmatched: boolean
  context?: Object
}

export interface MappingObject {
  [key: string]: string | string[] | MappingObject | Function
}

export interface BoolOptions {
  [key: string]: any[]|undefined
  'true'?: any[],
  'false'?: any[]
}
interface BoolConversionOptions {
  [key: string]: any[]
  'true': any[],
  'false': any[]
}

type validKeyTypes = boolean | number | null | string
type validKeyTypeArray = Array<validKeyTypes>

export const Utils = {
  /**
   * Uses `Object.prototype.toString.call` to return an object's
   * type as a lower-cased string
   *
   * @param {any} obj
   * @returns {string}
   */
  toType: toType,

  /**
   * Returns true if obj is null or undefined
   *
   * @param {any} obj
   * @returns {boolean}
   */
  isNil: isNil,

  /**
   * Returns false if obj is not null or undefined
   *
   * @param {any} obj
   * @returns {boolean}
   */
  notNil: notNil,

  /**
   * Returns true if obj is a number
   *
   * @param {any} obj
   * @returns {boolean}
   */
  isNumber: isNumber,

  /**
   * Returns true if obj is a string
   *
   * @param {any} obj
   * @returns {boolean}
   */
  isString: isString,

  /**
   * Returns true if obj is a boolean value
   * @param {any} obj
   * @returns {boolean}
   */
  isBool: isBool,

  /**
   * Returns true if the prototype of obj is Object
   *
   * @param {any} obj
   * @returns {boolean}
   */
  isObject: isObject,

  /**
   * Returns true if obj is an Array
   *
   * @param {any} obj
   * @returns {boolean}
   */
  isArray: isArray,

  /**
   * Returns true if the prototype of obj is Function
   *
   * @param {any} obj
   * @returns {boolean}
   */
  isFunction: isFunction,

  /**
   * Returns true if the prototype of obj is Error
   *
   * @param {any} obj
   * @returns {boolean}
   */
  isError: isError,

  /**
   * Returns true if the provided object is an Array
   * that contains at least one element, and whose elements
   * are all strings
   *
   * @param {Array<any>} obj
   * @returns {boolean}
   */
  isStringArray: isStringArray,

  /**
   * Attempts to convert obj to a boolean value, if it is not already one.
   * Note that if obj is not a boolean, it is coerced to a string and casefolded
   * before comparison to true/false values.
   * Default true/false values are:
   *  true: 'true', 'yes', 'y', '1', 1
   *  false: 'false', 'no', 'n', '0', 0
   *
   * @param {any} obj
   * @param {boolean} defaultValue    Value to return if obj is one of
   *                                  the defined values. A non-boolean value
   *                                  will revert to undefined.
   * @param {BoolOptions} boolOptions An optional object with true and/or false
   *                                  keys. The value should be an array of acceptable
   *                                  values for true or false, to be used instead of
   *                                  the default values. String values should be lower-cased.
   * @returns {boolean|undefined}
   */
  toBool: toBool,

  /**
   * Uses lodash to deeply clone obj
   *
   * @param {any} obj
   * @returns {any}
   */
  cloneObj: cloneObj,

  /**
   * Returns true if the prototype of obj
   * is Object, and the object has own keys
   *
   * @param {any} obj
   * @returns {boolean}
   */
  hasKeys: hasKeys,

  /**
   * Returns key from obj where key's value == the provided
   * value. If value and key's value are strings, then they
   * are matched without regard for casing.
   * If the value cannot be matched, undefined is returned
   *
   * @param {object} obj
   * @param {any} value
   * @returns {string|undefined}
   */
  keyForValue: cfKeyForValue,

  /**
   * Returns an object is obj is already an object or if
   * it can be parsed to one.
   * Otherwise returns undefined
   *
   * @param {any} obj
   * @returns {object|undefined}
   */
  safeJSONParse: safeJSONParse,
}

/**
 * Lower-cases stringValue using toLocaleLowerCase.
 * The value will also be trimmed unless trim is set to false.
 * Falls back to lodash's toString function if the value is not a string
 *
 * @param {any} stringValue
 * @param {boolean} [trim=true] Set to false if you do not want the value to be trimmed
 * @returns {string}
 */
export function caseFold(stringValue: string|any, trim?: boolean) {
  return cf(stringValue, trim)
}

/**
 * Like String.endsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=true] Trim values when searching
 * @returns {boolean}
 */
caseFold.endsWith = cfEndsWith

/**
 * Like String.startsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=true] Trim values when searching
 * @returns {boolean}
 */
caseFold.startsWith = cfStartsWith

/**
 * Looks for path's value in obj, regardless of casing differences
 * path can be a string (including a dotted-string), or an array of
 * paths to look for.
 *
 * @example
 * get({'foo': 'bar', 'foobar': 'bar'}, ['BAR', 'FOO']) => 'bar'
 *
 * @example
 * get({'foo': {'bar': 'bar'}, 'foobar': 'bar'}, ['FOObar.bar', 'FOO.BAR']) => 'bar'
 *
 * @param {object} objs
 * @param {string|string[]} path
 * @param {any} defaultValue
 */
caseFold.get = cfGet

/**
 * Returns the matching key in obj, or undefined
 *
 * @example
 * getKey({'FOO': 'bar'}, 'foo') => 'FOO'
 *
 * @example
 * getKey({'FOO': 'bar'}, 'bar') => undefined
 *
 * @param {object} obj
 * @param {string|string[]} path
 */
caseFold.getKey = cfGetKey

/**
 * Returns true if key (or any of key's elements, if it is an Array)
 * is in obj.
 * Returns false if the value is not found, if obj is not an object,
 * or if key is not a string or string array
 *
 * @param {object} obj
 * @param {string|string[]} key
 * @returns {boolean}
 */
caseFold.has = cfHas

/**
 * Like Array.find, but doesn't care about casing
 *
 * @param {string[]} stringArray
 * @param {string} searchValue
 * @param {boolean} [trim=true] Set to true to trim values before comparison
 * @returns {string|undefined} The value from the array, or undefined, if it is not found
 */
caseFold.find = cfFind

/**
 * Like Array.indexOf or String.indexOf, but doesn't care about casing
 *
 * @param {string|string[]} stringOrStrArray
 * @param {string} searchValue
 * @param {boolean} [trim=true] Trim values when searching
 * @returns {number} -1 if not found, or the index of the found value
 */
caseFold.indexOf = cfIndexOf

/**
 * Like Object.keys, except that each key is processed by caseFold.
 * If trim is false, then the keys will not be trimmed
 *
 * @example
 * keyMap({'foo': {'bar': 'bar'}, 'fooBAR  ': 'bar'}) => ['foo', 'foobar']
 *
 * @param {object} obj
 * @param {boolean} [trim=true] Defaults to true
 * @returns {string[]}
 */
caseFold.keys = cfKeys

/**
 * Returns an object mapped from Object.keys(obj). Each key in the
 * returned object will be casefolded, and that key's value
 * will be the original form of objKey.
 * If trim is false, then keys will not be trimmed
 * If recurse is true, then every child object will be traversed
 *
 * @example
 * let obj = {'foo': {'bar': 'bar'}, 'fooBAR': 'bar'}
 * keyMap(obj, true, false) => {'foo': 'foo', 'foobar': 'fooBAR'}
 *
 * @example
 * let obj = {'foo ': {'bar': 'bar'}, 'fooBAR': 'bar'}
 * keyMap(obj, false, false) => {'foo ': 'foo ', 'foobar': 'fooBAR'}
 *
 * @example
 * let obj = {'foo': {'BAR': {'bAr': 'foo'}}, 'fooBAR': 'bar'}
 * keyMap(obj, true, true) => {'foo': {'bar': {'bar': 'bAr'}}, 'foobar': 'fooBAR'}
 *
 * @param {object} obj
 * @param {boolean} [trim=true] Defaults to true
 * @param {boolean} recurse Defaults to false
 * @returns {object}
 */
caseFold.keyMap = cfKeyMap

/**
 * Returns true if string1 and string2 are the same, regardless of casing.
 *
 * @param {string} string1
 * @param {string} string2
 * @returns {boolean}
 */
caseFold.equals = cfEquals

/**
 * Sets path to value, for obj. Existing paths will not be duplicated,
 * even if they differ in casing from the path provided.
 *
 * **Note**: _Every_ path before the last one will be set to an object
 * instance, if it is not already an object.
 *
 * @example
 * set({'foo': {'bar': 'bar'}, 'foobar': 'bar'}, 'FOO.bar', 1) => {'foo': {'bar': 1}, 'foobar': 'bar'}
 *
 * @example
 * set({'foo': {'Bar': 'Original bar'}}, 'FOO.bAR.foo', 1) => {'foo': {'Bar': {'foo': 1}}}
 *
 * @param {object} obj
 * @param {string|string[]} path
 * @param {any} value
 * @returns {object}
 */
caseFold.set = cfSet

/**
 * Casefolds val, and trims it. Useful when being passed more than one parameter, but you
 * only want to process the first one
 *
 * @param {any} val
 * @returns {string}
 */
caseFold.trim = cfTrim

/**
 * Transforms sourceObject using mappingObject.
 * If sourceObject or mappingObject are not objects, or if none
 * of the mappingObject keys are found in sourceObject, undefined is returned
 *
 * @example
 * import { caseFold } from 'casefold';
 * let sourceObject = {
 *   'foo': 'bar',
 *   'Bar': {
 *     'FOO': [1, 2],
 *     'HAR': {
 *       'FOOBAR': 'foo'
 *     }
 *   }
 * }
 * let mappingObject = {
 *   'foo': ['foo', 'bar'],
 *   'bar': 'bar',
 *   'foobar': ['foobar', 'bar.har.foobar'],
 *   'har': 'har',
 *   'barCount': (msg) => {
 *     let arrayValue = caseFold.get(msg, 'bar.foo');
 *     if (isArray(arrayValue)) {
 *       return arrayValue.length;
 *     }
 *   }
 * };
 * let mappedObject = caseFold.transform(sourceObject, mappingObject)
 * // mappedObject = {
 * //   'foo': 'bar',   // key 'foo' was found first, and returned
 * //   'bar': 'Bar',   // casing doesn't matter, so 'Bar's value was returned
 * //   'foobar': 'foo' // Returned the dotted property value
 * //   'barCount': 2
 * // }
 *
 * @param {object|Object|undefined} sourceObject
 * @param {MappingObject} mappingObject
 * @param {TransformOptions} options
 * @returns {object|Object|undefined}
 */
caseFold.transform = transformObject

/**
 * Returns a TransformOptions object, with default values set
 *
 * @param {TransformOptions} options
 * @returns {TransformOptions}
 */
function getTransformOptions(options: TransformOptions | undefined): TransformOptions {
  let returnOptions: TransformOptions = {
    exact_match: false,
    keep_unmatched: false
  }
  if (typeof options === 'object') {
    if (typeof options.exact_match === 'boolean') returnOptions.exact_match = options.exact_match
    if (typeof options.keep_unmatched === 'boolean') returnOptions.keep_unmatched = options.keep_unmatched
    if (typeof options.context === 'object') returnOptions.context = cloneObj(options.context)
  }
  return returnOptions
}

/**
 * Returns Object.prototype.toString.call(obj)
 *
 * @param {any} obj
 * @returns {string}
 */
function protoToString(obj: any): string {
  return Object.prototype.toString.call(obj)
}

/**
 * Uses `Object.prototype.toString.call` to return an object's
 * type as a lower-cased string
 *
 * @param {any} obj
 * @returns {string}
 */
function toType(obj: any): string {
  // The || is because TypeScript complains that the result could be undefined
  let typeString = protoToString(obj).toLowerCase().match(/\s([a-z|A-Z]+)/)
  if (typeString) return typeString[1]
  return 'object'
}

/**
 * Returns true if the provided value is a valid object key
 *
 * @param {any} obj
 * @returns {string}
 */
function isKeyType(obj: any): obj is validKeyTypes {
  let objType = toType(obj)
  return ['boolean', 'number', 'null', 'symbol', 'string'].indexOf(objType) > -1
}

/**
 * Returns true if obj is null or undefined
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isNil(obj: any): obj is null|undefined {
  return (typeof obj === 'undefined') || (null === obj)
}

/**
 * Returns false if obj is not null or undefined
 *
 * @param {any} obj
 * @returns {boolean}
 */
function notNil(obj: any): obj is NonNullable<any>  {
  return isNil(obj) === false
}

/**
 * Returns true if obj is a number
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isNumber(obj: any): obj is number {
  return toType(obj) === 'number'
}

/**
 * Returns true if obj is a string
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isString(obj: any): obj is string {
  return toType(obj) === 'string'
}

/**
 * Returns true if obj is a boolean value
 * @param {any} obj
 * @returns {boolean}
 */
function isBool(obj: any): obj is boolean {
  return typeof obj === 'boolean'
}

/**
 * Returns true if the prototype of obj is Object
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isObject(obj: any): obj is object {
  return toType(obj) === 'object'
}

/**
 * Returns true if obj is an Array
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isArray(obj: any): obj is any[] {
  return Array.isArray(obj)
}

/**
 * Returns true if the prototype of obj is Function
 *
 * @param {any} obj
 * @returns {boolean}
 */
// function isFunction(obj: any): obj is Function {
//   let objType = toType(obj)
//   return ['function', 'asyncfunction'].indexOf(objType) > -1
// }

/**
 * Returns true if the prototype of obj is Error
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isError(obj: any): obj is Error {
  return obj instanceof Error
}

/**
 * Returns true if the provided object is an Array
 * that contains at least one element, and whose elements
 * are all strings
 *
 * @param {Array<any>} obj
 * @returns {boolean}
 */
function isStringArray(obj: any | any[]): obj is string[] {
  if (isArray(obj)) {
    if (obj.length === 0) return false
    let nonStrings = obj.find(function (val) {
      return isString(val) === false
    })
    return isNil(nonStrings)
  }
  return false
}

/**
 * Returns true if obj is an array whose elements are all
 * valid key values
 *
 * @param {any} ary
 * @returns {boolean}
 */
function isKeyArray(obj: any): obj is validKeyTypeArray {
  let returnValue = false
  if (isArray(obj)) {
    let badValue = obj.find(e => {
      return isKeyType(e) === false
    })
    returnValue = typeof badValue === 'undefined'
  }
  return returnValue
}

/**
 * Returns an array. If the provided value is an array of
 * valid path values, it is returned. If it is a string, it will be split,
 * if it contains any dotted values, or it will simply be inserted
 * into the returned array
 */
function toKeyArray(pathVals: any): string[] {
  let returnValue: any[] = []
  if (isString(pathVals)) {
    returnValue = pathVals.trim().split('.')
  } else if (isKeyArray(pathVals)) {
    returnValue = pathVals.map(k => {
      return '' + k
    })
  } else if (isKeyType(pathVals)) {
    returnValue = ['' + pathVals]
  }
  return returnValue
}

/**
 * Attempts to convert obj to a boolean value, if it is not already one.
 * Note that if obj is not a boolean, it is coerced to a string and casefolded
 * before comparison to true/false values.
 * Default true/false values are:
 *  true: 'true', 'yes', 'y', '1', 1
 *  false: 'false', 'no', 'n', '0', 0
 *
 * @param {any} obj
 * @param {boolean} defaultValue    Value to return if obj is one of
 *                                  the defined values. A non-boolean value
 *                                  will revert to undefined.
 * @param {BoolOptions} boolOptions An optional object with true and/or false
 *                                  keys. The value should be an array of acceptable
 *                                  values for true or false, to be used instead of
 *                                  the default values. String values should be lower-cased.
 * @returns {boolean|undefined}
 */
function toBool(obj: any, defaultValue: boolean|undefined=undefined, boolOptions?: BoolOptions): boolean | undefined {
  if (toType(obj) === 'boolean') {
    return obj
  }
  let boolValues: BoolConversionOptions = {
    'true': ['true', 'yes', 'y', '1'],
    'false': ['false', 'no', 'n', '0']
  }
  if (typeof boolOptions === 'object') {
    Object.keys(boolValues).map(k => {
      let boolVals = boolOptions[k];
      if (isArray(boolVals)) {
        boolValues[k] = boolVals
      }
    })
  }
  let castValue = '' + obj,
    returnValue: boolean|undefined

  if (isBool(defaultValue)) {
    returnValue = defaultValue
  }

  castValue = cf(toString(obj), true)

  if (boolValues['true'].indexOf(castValue) > -1) {
    returnValue = true
  } else if (boolValues['false'].indexOf(castValue) > -1) {
    returnValue = false
  }

  return returnValue
}

/**
 * Returns true if the prototype of obj
 * is Object, and the object has own keys
 *
 * @param {any} obj
 * @returns {boolean}
 */
function hasKeys(obj: any): boolean {
  if (typeof obj === 'object') {
    try {
      return Object.keys(obj).length > 0
    } catch (_er) {}
  }
  return false
}

/**
 * Returns key from obj where key's value == the provided
 * value. If obj's values are arrays, then caseFold.indexOf
 * is used to determine if the array contains a matching value.
 * If value and key's value are strings, then they are matched
 * using caseFold.equals.
 * If the value cannot be matched, undefined is returned
 *
 * @param {object} obj
 * @param {any} searchValue
 * @returns {string|undefined}
 */
function cfKeyForValue(obj: Object, searchValue: any): string | undefined {
  let returnValue
  if (hasKeys(obj)) {
    returnValue = Object.keys(obj).find(k => {
      let v = obj[k]
      if (isString(searchValue) && isArray(v)) {
        return (cfIndexOf(v, searchValue) > -1)
      } else if (typeof searchValue === 'string' && typeof v === 'string') {
        return cfEquals(v, searchValue)
      } else {
        return (searchValue === v)
      }
    })
  }
  return returnValue
}

/**
 * Uses lodash to deeply clone obj
 *
 * @param {any} obj
 * @returns {any}
 */
function cloneObj(obj: any): any {
  return cloneDeep(obj)
}

/**
 * Returns an object is obj is already an object or if
 * it can be parsed to one.
 * Otherwise returns undefined
 *
 * @param {any} obj
 * @returns {object|undefined}
 */
function safeJSONParse(obj: any): Object | undefined {
  if (isObject(obj)) {
    return obj
  } else {
    try {
      return JSON.parse(obj)
    } catch (_er) {
      return undefined
    }
  }
}

/**
 * Lower-cases stringValue using toLocaleLowerCase.
 * The value will also be trimmed unless trim is set to false.
 * Falls back to lodash's toString function if the value is not a string
 *
 * @param {any} stringValue
 * @param {boolean} [trim=true] Set to false if you do not want the value to be trimmed
 * @returns {string}
 */
function cf(stringValue: any, trim?: boolean): string {
  let doTrim = isBool(trim)
    ? trim
    : true
  let strValue = toString(stringValue)
  let returnString = strValue.toLocaleLowerCase()
  if (doTrim === true) {
    returnString = returnString.trim()
  }
  return returnString
}

/**
 * Casefolds val, and trims it. Useful when being passed more than one parameter, but you
 * only want to process the first one
 *
 * @param {any} val
 * @returns {string}
 */
function cfTrim(val: any): string {
  return cf(val, true)
}

/**
 * Returns a casefolded and trimmed copy of val, if it is not a Symbol.
 * Set trim to false if you do not want it trimmed.
 *
 * @param {boolean|number|null|Symbol|string} val
 * @param {boolean} [trim=true]
 * @returns {any}
 */
function _cfKey(val: boolean|number|null|string, trim: boolean = true): string {
  let strVal;
  if (null === val || isBool(val) || isNumber(val) || isString(val)) {
    strVal = cf('' + val, trim)
  } else {
    strVal = cf(toString(val), trim)
  }
  return strVal
}

/**
 * Returns an object, where all keys have been recursively casefolded
 * If obj is not an object, then an empty object will be returned
 *
 * @param {object} obj
 * @param {boolean} trim
 * @returns {object}
 */
function cfKeysRecursive(obj: Object, trim: boolean): Object {
  let returnObject: Object = {}

  if (isObject(obj) && hasKeys(obj)) {
    Object.entries(obj).map(function ([k, v]) {
      k = _cfKey(k, trim)
      if (toType(v) === 'object') {
        v = cfKeysRecursive(v, trim)
      }
      returnObject[k] = v
    })
  }
  return returnObject
}

/**
 * Like Object.keys, except that each key is processed by caseFold.
 * If trim is false, then the keys will not be trimmed
 *
 * @param {object} obj
 * @param {boolean} [trim=true] Defaults to true
 * @returns {string[]}
 */
function cfKeys(obj: Object, trim: boolean): string[] {
  let returnObject: string[] = []
  try {
    returnObject = Object.keys(obj).map(k => {
      return _cfKey(k, trim)
    })
  } catch (_er) {}
  return returnObject
}

/**
 * Returns true if key (or any of key's elements, if it is an Array)
 * is in obj.
 * Returns false if the value is not found, if obj is not an object,
 * or if key is not a string or string array
 *
 * @param {object} obj
 * @param {string|string[]} key
 * @returns {boolean}
 */
function cfHas(obj: Object, key: validKeyTypes | validKeyTypeArray): boolean {
  let returnValue = false;
  if (isKeyType(key) || isKeyArray(key)) {
    let foundValue = cfGetKey(obj, key)
    returnValue = (typeof foundValue !== 'undefined')
  }
  return returnValue
}

/**
 * Returns true if string1 and string2 are the same, regardless of casing.
 *
 * @param {string} string1
 * @param {string} string2
 * @returns {boolean}
 */
function cfEquals(string1: string, string2: string): boolean {
  if (string1 === string2) {
    return true
  }

  if (typeof string1 === 'string' && typeof string2 === 'string') {
    if (cfTrim(string1) === cfTrim(string2)) {
      return true
    }
  }

  return false
}

/**
 * Like String.startsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=true] Trim values when searching
 * @returns {boolean}
 */
function cfStartsWith(stringValue: string, searchValue: string, trim?: boolean): boolean {
  if (isString(stringValue) === false || isString(searchValue) === false) {
    return false
  }

  if (toString(stringValue) === '' || toString(searchValue) === '') {
    return false
  }

  let doTrim = isBool(trim)
    ? trim
    : true
  return cf(stringValue, trim).startsWith(cf(searchValue, doTrim))
}

/**
 * Like String.endsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=true] Trim values when searching
 * @returns {boolean}
 */
function cfEndsWith(stringValue: string, searchValue: string, trim?: boolean): boolean {
  if (isString(stringValue) === false || isString(searchValue) === false) {
    return false
  }

  if (toString(stringValue) === '' || toString(searchValue) === '') {
    return false
  }

  let doTrim = isBool(trim)
    ? trim
    : true
  return cf(stringValue, trim).endsWith(cf(searchValue, doTrim))
}

/**
 * Like Array.indexOf or String.indexOf, but doesn't care about casing
 * if searchValue is a string, and so is stringOrStrArray or its elements.
 *
 * If either stringOrStrArray or searchValue are empty strings, or if stringOrStrArray
 * is an empty array, -1 is returned.
 *
 * @param {string|string[]} stringOrStrArray
 * @param {any} searchValue
 * @param {boolean} [trim=true] Trim values when searching
 * @returns {number} -1 if not found, or the index of the found value
 */
function cfIndexOf(stringOrStrArray: string | string[], searchValue: any, trim: boolean = true): number {
  if (isString(searchValue) === true && searchValue.trim() === '') {
    return -1
  }
  if (isString(stringOrStrArray) && stringOrStrArray.trim() === '') {
    return -1
  } else if (isArray(stringOrStrArray) && stringOrStrArray.length === 0) {
    return -1
  }

  let returnValue = -1
  if (isString(stringOrStrArray)) {
    let cleanString = cf(searchValue, isBool(trim) ? trim : true)
    returnValue = cf(stringOrStrArray, trim).indexOf(cleanString)
  } else if(isArray(stringOrStrArray)) {
    returnValue = stringOrStrArray.findIndex(e => {
      if (isString(e)) {
        return cfEquals(cf(e, trim), cf(searchValue, trim))
      }
      return e === searchValue
    })
  }
  return returnValue
}

/**
 * Like Array.find, but doesn't care about casing
 *
 * @param {string[]} stringArray
 * @param {string} searchValue
 * @param {boolean} [trim=true] Set to true to trim values before comparison
 * @returns {string|undefined} The value from the array, or undefined, if it is not found
 */
function cfFind(stringArray: string | string[], searchValue: string, trim: boolean = true): string | undefined {
  let returnValue
  if (isString(searchValue) === false || searchValue.trim() === '') {
    return returnValue
  }
  if (isStringArray(stringArray) === false) {
    return returnValue
  }
  let valueIndex = cfIndexOf(stringArray, searchValue)
  if (valueIndex > -1) {
    returnValue = stringArray[valueIndex]
  }
  return returnValue
}

/**
 * Returns an object mapped from Object.keys(obj). Each key in the
 * returned object will be casefolded, and that key's value
 * will be the original form of objKey.
 * If trim is false, then keys will not be trimmed
 * If recurse is true, then every child object will be traversed
 *
 * @example
 * let obj = {'foo': {'bar': 'bar'}, 'fooBAR': 'bar'}
 * keyMap(obj, true, false) => {'foo': 'foo', 'foobar': 'fooBAR'}
 *
 * @example
 * let obj = {'foo ': {'bar': 'bar'}, 'fooBAR': 'bar'}
 * keyMap(obj, false, false) => {'foo ': 'foo ', 'foobar': 'fooBAR'}
 *
 * @example
 * let obj = {'foo': {'BAR': {'bAr': 'foo'}}, 'fooBAR': 'bar'}
 * keyMap(obj, true, true) => {'foo': {'bar': {'bar': 'bAr'}}, 'foobar': 'fooBAR'}
 *
 * @param {object} obj
 * @param {boolean} [trim=true] Defaults to true
 * @param {boolean} recurse Defaults to false
 * @returns {object}
 */
function cfKeyMap(obj: any, trim: boolean = true, recurse: boolean = false): Object {
  let doTrim = (typeof trim === 'boolean')
    ? trim
    : true
  let cfFunc = doTrim
    ? cfTrim
    : (val: string) => {return cf(val, false)}

  let returnObj: Object = {}
  if (typeof obj === 'object') {
    Object.keys(obj).map(k => {
      let cfKey = cfFunc(k)
      let v = obj[k];
      if (recurse === true && hasKeys(v)) {
        returnObj[cfKey] = cfKeyMap(v, doTrim, recurse)
      } else {
        returnObj[cfKey] = k
      }
    })
  } else {
    log('The object provided to cfKeyMap was type ' + toType(obj) + ' instead of object!')
  }
  return returnObj
}

/**
 * Returns the found key in obj, or undefined
 *
 * @example
 * getKey({'FOO': 'bar'}, 'foo') => 'FOO'
 *
 * @example
 * getKey({'FOO': 'bar'}, 'a') => undefined
 *
 * @param {object} obj
 * @param {string|string[]} path
 */
function cfGetKey(obj: Object | undefined, path: validKeyTypes | validKeyTypeArray): string|undefined {
  if (typeof obj === 'undefined' || isObject(obj) === false) {
    return undefined
  }

  let returnValue: string|undefined,
    foundKey: validKeyTypes|undefined
  if (isKeyType(path)) {
    let keyParts = toKeyArray(path)
    let lastKey = keyParts.pop()
    let childObj: Object|undefined = obj
    let foundKeys: validKeyTypeArray = []

    keyParts.map(k => {
      if (isObject(childObj)) {
        let childKey = cfGetKey(childObj, k)
        if (typeof childKey !== 'undefined') {
          foundKeys.push(childKey)
          childObj = childObj[childKey]
        } else {
          childObj = undefined
        }
      }
    })

    if (isObject(childObj) && isKeyType(lastKey)) {
      // TODO: Support array element retrieval
      let lastPart = Object.keys(childObj).find(k => {
        return _cfKey(k) === _cfKey('' + lastKey)
      })
      if (typeof lastPart !== 'undefined') {
        foundKeys.push(lastPart)
        foundKey = foundKeys.map(k => {
          return '' + k
        }).join('.')
      }
    }
  } else if (isKeyArray(path)) {
    path.find(k => {
      let foundPath = cfGetKey(obj, k);
      if (typeof foundPath !== 'undefined') {
        foundKey = foundPath
        return true
      }
      return false
    })
  }

  if (typeof foundKey !== 'undefined') {
    returnValue = '' + foundKey
  }

  return returnValue
}

/**
 * Looks for path's value in obj, regardless of casing differences
 * path can be a string (including a dotted-string), or an array of
 * paths to look for.
 *
 * @example
 * get({'foo': 'bar', 'foobar': 'bar'}, ['BAR', 'FOO']) => 'bar'
 *
 * @example
 * get({'foo': {'bar': 'bar'}, 'foobar': 'bar'}, ['FOObar.bar', 'FOO.BAR']) => 'bar'
 *
 * @param {object} objs
 * @param {string|string[]} path
 * @param {any} defaultValue
 */
function cfGet(obj: Object | Object | undefined, path: validKeyTypes | validKeyTypeArray, defaultValue?: any): any {
  let returnValue;
  if (typeof obj !== 'undefined') {
    let foundPath = cfGetKey(obj, path)
    if (typeof foundPath !== 'undefined') {
      returnValue = get(obj, foundPath)
    } else {
      returnValue = defaultValue
    }
  }
  return returnValue
}

/**
 * Sets path to value, for obj
 *
 * @example
 * set({'foo': {'bar': 'bar'}, 'foobar': 'bar'}, 'FOO.bar', 1) => {'foo': {'bar': 1}, 'foobar': 'bar'}
 *
 * @param {object} obj
 * @param {string|string[]} path
 * @param {any} value
 * @returns {object}
 */
function cfSet(obj: Object | Object | undefined, path: validKeyTypes | validKeyTypeArray, value: any): Object | undefined {
  if (isKeyType(path) === false && isKeyArray(path) === false) {
    return obj
  }
  let returnObject: Object = (typeof obj === 'object') ? obj : {}

  let childObj = returnObject
  let lookupPaths = toKeyArray(path)
  let setPath = lookupPaths.pop()

  lookupPaths.map(p => {
    let existingPath = cfGetKey(childObj, p)
    if (typeof existingPath !== 'string') {
      set(childObj, p, {})
      existingPath = p
    } else if (typeof childObj[existingPath] !== 'object') {
      set(childObj, existingPath, {})
    }
    childObj = get(childObj, existingPath)
  })

  if (isKeyType(setPath)) {
    let existingPath = cfGetKey(childObj, setPath)
    if (typeof existingPath === 'string') {
      set(childObj, existingPath, value)
    } else {
      set(childObj, '' + setPath, value)
    }
  }
  return returnObject
}

/**
 * Transforms sourceObject using mappingObject.
 * If sourceObject or mappingObject are not objects, or if none
 * of the mappingObject keys are found in sourceObject, undefined is returned
 *
 * @example
 * import { caseFold } from 'casefold';
 * let sourceObject = {
 *   'foo': 'bar',
 *   'Bar': {
 *     'FOO': [1, 2],
 *     'HAR': {
 *       'FOOBAR': 'foo'
 *     }
 *   }
 * }
 * let mappingObject = {
 *   'foo': ['foo', 'bar'],
 *   'bar': 'bar',
 *   'foobar': ['foobar', 'bar.har.foobar'],
 *   'har': 'har',
 *   'barCount': (msg) => {
 *     let arrayValue = caseFold.get(msg, 'bar.foo');
 *     if (isArray(arrayValue)) {
 *       return arrayValue.length;
 *     }
 *   }
 * };
 * let mappedObject = caseFold.transform(sourceObject, mappingObject)
 * // mappedObject = {
 * //   'foo': 'bar',   // key 'foo' was found first, and returned
 * //   'bar': 'Bar',   // casing doesn't matter, so 'Bar's value was returned
 * //   'foobar': 'foo' // Returned the dotted property value
 * //   'barCount': 2
 * // }
 *
 * @param {object|Object|undefined} sourceObject
 * @param {MappingObject} mappingObject
 * @param {TransformOptions} options
 * @returns {object|Object|undefined}
 */
function transformObject(sourceObject: Object | Object | undefined, mappingObject: MappingObject, options?: TransformOptions): Object | Object | undefined {
  let transformOptions = getTransformOptions(options)
  if (isArray(sourceObject)) {
    return sourceObject.map(obj => {
      return transformObject(obj, mappingObject, options)
    })
  }
  if (hasKeys(sourceObject) === false) {
    return sourceObject
  }
  if (toType(mappingObject) !== 'object') {
    log('The mappingObject value was not an object!')
    return sourceObject
  }
  let returnObject = {}
  Object.keys(mappingObject).map(k => {
    let transformValue = mappingObject[k]
    let result
    if (typeof transformValue === 'function') {
      result = transformValue(sourceObject, transformOptions.context)
    } else if (typeof transformValue === 'string' || isArray(transformValue)) {
      result = cfGet(sourceObject, transformValue)
    } else {
      result = transformObject(sourceObject, transformValue, transformOptions)
    }
    if (toType(result) !== 'undefined' || transformOptions.keep_unmatched === true) {
      if (k === '_') {
        Object.assign(returnObject, result)
      } else {
        cfSet(returnObject, k, result)
      }
    }
  })
  return returnObject
}
