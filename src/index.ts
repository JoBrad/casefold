const log = require('debug')('casefold')
import _ from 'lodash'
import { isArray } from 'util';

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
  exact_match: boolean
  keep_unmatched: boolean
  context?: Object
}

export interface MappingObject {
  [key: string]: string | string[] | MappingObject | Function
}

export const Utils = {
  toType: toType,
  isNil: isNil,
  notNil: notNil,
  isNumber: isNumber,
  isString: isString,
  isBool: isBool,
  isObject: isObject,
  isFunction: isFunction,
  isError: isError,
  isStringArray: isStringArray,
  toBool: toBool,
  cloneObj: cloneObj,
  hasKeys: hasKeys,
  keyForValue: cfKeyForValue,
  safeJSONParse: safeJSONParse,
}

export function caseFold(stringValue: string|any, trim?: boolean) {
  if (trim !== true) trim = false
  return cf(stringValue, trim)
}
caseFold.endsWith = cfEndsWith
caseFold.startsWith = cfStartsWith
caseFold.get = cfGet
caseFold.getKey = cfGetKey
caseFold.has = cfHas
caseFold.find = find
caseFold.indexOf = cfIndexOf
caseFold.keys = cfKeys
caseFold.keyMap = cfKeyMap
caseFold.equals = cfEquals
caseFold.set = cfSet
caseFold.trim = cfTrim
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
 * Uses `Object.prototype.toString.call` to return an object's
 * type as a lower-cased string
 *
 * @param {any} obj
 * @returns {string}
 */
function toType(obj: any): string {
  // The || is because TypeScript complains that the result could be undefined
  let typeString = (Object.prototype.toString.call(obj) || '').toLowerCase().match(/\s([a-z|A-Z]+)/)
  if (typeString) return typeString[1]
  return 'object'
}

/**
 * Returns true if obj is null or undefined
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isNil(obj: any): boolean {
  return (typeof obj === 'undefined') || (null === obj)
}

/**
 * Returns false if obj is not null or undefined
 *
 * @param {any} obj
 * @returns {boolean}
 */
function notNil(obj: any): boolean {
  return isNil(obj) === false
}

/**
 * Returns true if obj is a number
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isNumber(obj: any): boolean {
  return toType(obj) === 'number'
}

/**
 * Returns true if obj is a string
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isString(obj: any): boolean {
  return toType(obj) === 'string'
}

/**
 * Returns true if obj is a boolean value
 * @param {any} obj
 * @returns {boolean}
 */
function isBool(obj: any): boolean {
  return typeof obj === 'boolean'
}

/**
 * Returns true if the prototype of obj is Object
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isObject(obj: any): boolean {
  return toType(obj) === 'object'
}

/**
 * Returns true if the prototype of obj is Function
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isFunction(obj: any): boolean {
  return toType(obj) === 'function'
}

/**
 * Returns true if the prototype of obj is Error
 *
 * @param {any} obj
 * @returns {boolean}
 */
function isError(obj: any): boolean {
  return obj instanceof Error
}

/**
 * Returns true if the provided object is an Array
 * that contains at least one element, and whose elements
 * are all strings
 *
 * @param {Array<any>} ary
 * @returns {boolean}
 */
function isStringArray(ary: any | any[]): boolean {
  if (Array.isArray(ary)) {
    if (ary.length === 0) return false
    let nonStrings = ary.find(function (val) {
      return toType(val) !== 'string'
    })
    return isNil(nonStrings)
  }
  return false
}

/**
 * Attempts to convert obj to a boolean value.
 * If obj is a boolean it is returned.
 * True values are 'true', 'yes', 'y', '1', 1
 * False values are 'false', 'no', 'n', '0', 0
 * Case does not matter.
 *
 * @param {any} obj
 * @param {boolean} defaultValue  Value to return if obj is one of
 *                                the defined values. A non-boolean value
 *                                will revert to undefined.
 * @returns {boolean|undefined}
 */
function toBool(obj: any, defaultValue?: boolean): boolean | undefined {
  if (toType(obj) === 'boolean') return obj
  const trueValues = ['true', 'yes', 'y', '1']
  const falseValues = ['false', 'no', 'n', '0']
  let fallbackValue
  let returnValue = obj

  if (toType(defaultValue) === 'boolean') {
    fallbackValue = defaultValue
  }

  if (toType(returnValue) === 'number') {
    returnValue = _.toString(returnValue)
  }

  if (toType(returnValue) === 'string') {
    returnValue = returnValue.trim().toLowerCase()
    if (trueValues.indexOf(returnValue) > -1) return true
    if (falseValues.indexOf(returnValue) > -1) return false
  }
  return fallbackValue
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
 * value. If value and key's value are strings, then they
 * are matched without regard for casing.
 * If the value cannot be matched, undefined is returned
 *
 * @param {object} obj
 * @param {any} value
 * @returns {string|undefined}
 */
function cfKeyForValue(obj: Object, value: any): string | undefined {
  let returnValue
  if (isObject(obj)) {
    Object.keys(obj).find((k) => {
      let v = obj[k]
      let doesMatch = (typeof value === 'string' && typeof v === 'string')
        ? cfEquals(v, value)
        : value == v
      if (doesMatch === true) {
        returnValue = k
      }
      return doesMatch
    })
  }
  return returnValue
}

/**
 * Returns a copy of obj
 *
 * @param {any} obj
 * @returns {any}
 */
function cloneObj(obj: any): any {
  if (isNil(obj)) return obj
  if (toType(obj) === 'string') return '' + obj
  if (toType(obj) === 'number') return obj * 1
  if (toType(obj) === 'boolean') return (obj === true)
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (_er) {
    try {
      return _.cloneDeep(obj)
    } catch (err) {
      let logMsgs = ['Could not clone the provided object!']
      logMsgs.push(`Object type: ${toType(obj)}`)
      logMsgs.push(`Error details: ${err}`)
      log(logMsgs.join('\n'))
      return obj
    }
  }
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
 * Lower-cases stringValue. If trim is true (default is false)
 * then the value will also be trimmed. Returns an empty string
 * if the provided value is not a string.
 *
 * @param {string} stringValue
 * @param {boolean} [trim=False] Set to true to trim the value
 * @returns {string}
 */
function cf(stringValue: string, trim: boolean = false): string {
  if (isArray(stringValue) === false && isString(stringValue) === false) {
    return '';
  }
  let returnString = _.toString(stringValue).toLowerCase()
  if (trim === true) returnString = returnString.trim()
  return returnString
}

/**
 * Casefolds val, and trims it. Returns an empty string
 * if the provided value is not a string.
 *
 * @param {string} val
 * @returns {string}
 */
function cfTrim(val: string): string {
  return cf(val, true)
}

/**
 * Returns an object, where all keys have been casefolded
 *
 * @param {object} obj
 * @param {boolean} trim
 * @returns {object}
 */
function cfKeysRecursive(obj: Object, trim: boolean): Object {
  if (toType(obj) !== 'object') return {}
  let cfFunction = (trim === true) ? cfTrim : cf
  let objectClone: Object = cloneObj(obj)
  let returnObject: Object = {}
  Object.keys(objectClone).map(function (k) {
    let v = objectClone[k]
    if (toType(v) === 'object') v = cfKeysRecursive(v, trim)
    returnObject[cfFunction(k)] = v
  })
  return returnObject
}

/**
 * Like Object.keys, except that each key is processed by caseFold. If trim
 * is true, then the keys will be trimmed, as well.
 * If recurse is true, the the result is an object, and all child objects
 * will also have their keys case-folded, as well. Note that you must provide
 * a value for trim (even if undefined), to set recurse.
 *
 * @param {object} obj
 * @param {boolean} trim
 * @param {boolean} recurse
 * @returns {string[]}
 */
function cfKeys(obj: Object, trim: boolean, recurse: boolean = false): string[] | object {
  let localObject = (toType(obj) === 'object') ? obj : {}
  if (recurse === true) {
    return cfKeysRecursive(obj, trim)
  } else {
    return Object.keys(localObject).map(k => {
      return cf(k, trim)
    })
  }
}

/**
 * Returns True if key is in obj. If key is an array, then
 * the values are expected to be a list of progressively nested
 * properties of obj
 *
 * @param {object} obj
 * @param {string|string[]} key
 * @returns {boolean}
 */
function cfHas(obj: Object, key: string | string[]): boolean {
  if (toType(obj) !== 'object') {
    return false
  }
  if (typeof key !== 'string' && isStringArray(key) === false) {
    return false
  }
  let childObject = obj
  let lookupPaths = (Array.isArray(key) ? key : key.split('.')).map(k => {
    return cf(k, true)
  })
  let lastPath = lookupPaths.pop()
  lookupPaths.map(p => {
    childObject = cfGet(childObject, p)
  })
  if (notNil(childObject) && typeof lastPath === 'string') {
    let childKeys = cfKeys(childObject, true)
    if (Array.isArray(childKeys)) {
      return childKeys.indexOf(lastPath) > -1
    }
  }
  return false
}

/**
 * Returns true if string1 and string2 are the same, regardless of casing.
 *
 * @param {string} string1
 * @param {string} string2
 * @returns {boolean}
 */
function cfEquals(string1: string, string2: string): boolean {
  if (typeof string1 === 'string' && typeof string2 === 'string') {
    if (string1 === string2) return true
    if (cfTrim(string1) === cfTrim(string2)) return true
  }
  return false
}

/**
 * Like startsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=false] Trim values when searching
 * @returns {boolean}
 */
function cfStartsWith(stringValue: string, searchValue: string, trim: boolean = false): boolean {
  if (toType(stringValue) !== 'string' || toType(searchValue) !== 'string') return false
  if (_.toString(stringValue) === '' || _.toString(searchValue) === '') return false
  return cf(stringValue, trim).startsWith(cf(searchValue, trim))
}

/**
 * Like endsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=false] Trim values when searching
 * @returns {boolean}
 */
function cfEndsWith(stringValue: string, searchValue: string, trim: boolean = false): boolean {
  if (toType(stringValue) !== 'string' || toType(searchValue) !== 'string') return false
  if (_.toString(stringValue) === '' || _.toString(searchValue) === '') return false
  return cf(stringValue, trim).endsWith(cf(searchValue, trim))
}

/**
 * Like indexOf, but doesn't care about casing
 *
 * @param {string|string[]} stringOrStrArray
 * @param {string} searchValue
 * @param {boolean} [trim=false] Trim values when searching
 * @returns {number} -1 if not found, or the index of the found value
 */
function cfIndexOf(stringOrStrArray: string | string[], searchValue: string, trim: boolean = false): number {
  if (toType(searchValue) !== 'string' || searchValue.trim() === '') {
    return -1
  }
  if (toType(stringOrStrArray) !== 'string' && isStringArray(stringOrStrArray) === false) {
    return -1
  }

  let cleanString = cf(searchValue, trim)
  if (Array.isArray(stringOrStrArray)) {
    return stringOrStrArray.findIndex(e => {
      return cf(e, trim) === cleanString
    })
  } else {
    return cf(stringOrStrArray, trim).indexOf(cleanString)
  }
}

/**
 * Like Array.find, but doesn't care about casing
 *
 * @param {string[]} stringArray
 * @param {string} searchValue
 * @param {boolean} [trim=false] Set to true to trim values before comparison
 * @returns {string|undefined} The value from the array, or undefined, if it is not found
 */
function find(stringArray: string | string[], searchValue: string, trim: boolean = false): string | undefined {
  let foundValue
  if (toType(searchValue) !== 'string' || searchValue.trim() === '') {
    return foundValue
  }
  if (isStringArray(stringArray) === false) {
    return foundValue
  }
  let valueIndex = cfIndexOf(stringArray, searchValue)
  if (valueIndex > -1) {
    foundValue = stringArray[valueIndex]
  }
  return foundValue
}

/**
 * Returns an object mapped from _.keys(obj).
 * Each key in the returned object will be
 * _.caseFold(objKey), and that key's value
 * will be the original form of objKey.
 * If trim is true, then the keys will
 * be trimmed as well.
 *
 * @param {object} obj
 * @param {boolean} trim
 * @returns {object}
 */
function cfKeyMap(obj: any, trim: boolean = false): Object {
  let cfFunction = (trim === true) ? cfTrim : cf
  let returnObj: Object = {}
  if (typeof obj === 'object') {
    Object.keys(obj).map(function (k) {
      returnObj[cfFunction(k)] = k
    })
  } else {
    log('The object provided to cfKeyMap was type ' + toType(obj) + ' instead of object!')
  }
  return returnObj
}

/**
 * If path is a string, and objKeyMap is an object with keys,
 * returns the value of objKeyMap[path], if it can be found.
 * Otherwise returns undefined
 *
 * @param {string} path
 * @param {object} objKeyMap
 * @returns {string|undefined}
 */
function _cfGetKeyFromMap(path: string, objKeyMap: Object): string | undefined {
  let returnValue
  if (typeof path === 'string') {
    if (toType(objKeyMap) === 'object' && Object.keys(objKeyMap).length > 0) {
      let foundKey = Object.keys(objKeyMap).find(k => {
        return cfEquals(k, path)
      })
      if (typeof foundKey === 'number') {
        returnValue = objKeyMap[foundKey]
      }
    }
  }
  return returnValue
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
function cfGetKey(obj: Object | undefined, path: string | string[]) {
  if (isNil(obj)) return undefined
  if (typeof obj !== 'object') return undefined
  if (typeof path !== 'string' && isStringArray(path) === false) return undefined
  let searchPath = path
  let returnValue: string|undefined
  if (Array.isArray(searchPath)) {
    searchPath.map(p => {
      if (notNil(returnValue)) {
        let foundKey = cfGetKey(obj, p)
        if (notNil(foundKey)) {
          returnValue = foundKey
        }
      }
    })
  } else {
    let lookupPaths = searchPath.split('.')
    let lastPath = lookupPaths.pop()
    let foundPaths: string[] = []
    let childObj: Object | undefined = obj
    let childObjMap = cfKeyMap(childObj)
    lookupPaths.map(lookupPath => {
      if (typeof childObj === 'object') {
        let objPath = _cfGetKeyFromMap(lookupPath, childObjMap)
        if (typeof objPath === 'string') {
          foundPaths.push(objPath)
          childObj = childObj[objPath]
        } else {
          childObj = undefined
        }
        childObjMap = cfKeyMap(childObj)
      }
    })

    if (toType(childObj) !== 'undefined' && typeof lastPath === 'string') {
      let objPath = _cfGetKeyFromMap(lastPath, childObjMap)
      if (typeof objPath === 'string') {
        foundPaths.push(objPath)
      } else {
        foundPaths = []
      }
    }
    if (foundPaths.length > 0) {
      returnValue = foundPaths.join('.')
    }
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
function cfGet(obj: Object | Object | undefined, path: string | string[], defaultValue?: any) {
  if (isNil(obj)) return undefined
  if (hasKeys(obj) === false) return undefined
  if (toType(path) !== 'string' && isStringArray(path) === false) return undefined
  let searchPath = path
  let returnValue

  if (Array.isArray(searchPath)) {
    searchPath.find(p => {
      returnValue = cfGet(obj, p)
      return toType(returnValue) !== 'undefined'
    })
  } else {
    returnValue = _.get(obj, searchPath)
    if (isNil(returnValue)) {
      let lookupPaths = searchPath.split('.')
      let lastPath = lookupPaths.pop()
      let childObj = obj
      if (lookupPaths.length > 0) {
        lookupPaths.map(lookupPath => {
          if (notNil(childObj)) childObj = cfGet(childObj, lookupPath)
        })
      }
      if (typeof childObj === 'object') {
        let cleanLastPath = (typeof lastPath === 'string')
          ? lastPath
          : ''

        let objKeys = Object.keys(childObj)
        let lastPathIndex = objKeys.findIndex(k => {
          return cfEquals(k, cleanLastPath)
        })
        if (lastPathIndex > -1) {
          returnValue = childObj[objKeys[lastPathIndex]]
        }
      }
    }
  }
  if (isNil(returnValue)) returnValue = defaultValue
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
function cfSet(obj: Object | Object | undefined, path: string | string[], value: any): Object | Object | undefined {
  if (toType(path) !== 'string' && isStringArray(path) === false) return obj
  let returnObject: Object = (typeof obj === 'object') ? obj : {}
  let childObj = returnObject
  let lookupPaths = Array.isArray(path) ? path : path.split('.')
  let setPath = lookupPaths.pop()
  lookupPaths.map(p => {
    let v = cfGet(childObj, p)
    if (isNil(v)) {
      _.set(childObj, p, {})
      v = _.get(childObj, p)
    }
    childObj = v
  })
  if (typeof setPath === 'string') {
    // Make sure we set existing keys, even if our casing is different
    let existingPath = cfGetKey(childObj, setPath)
    if (typeof existingPath === 'string') {
      _.set(childObj, existingPath, value)
    } else {
      _.set(childObj, setPath, value)
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
 *     if (Array.isArray(arrayValue)) {
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
  if (Array.isArray(sourceObject)) {
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
    } else if (typeof transformValue === 'string' || Array.isArray(transformValue)) {
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
