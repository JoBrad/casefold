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
    [key: string]: any;
}
/**
 * Optional options for transformObject
 *
 * @param {boolean} keep_unmatched Set to true to return untransformed keys from the source object
 * @param {object} context An object that will be passed to transform functions
 */
export interface TransformOptions {
    [key: string]: any;
    keep_unmatched: boolean;
    context?: Object;
}
export interface MappingObject {
    [key: string]: string | string[] | MappingObject | Function;
}
export interface BoolOptions {
    [key: string]: any[] | undefined;
    'true'?: any[];
    'false'?: any[];
}
declare type validKeyTypes = boolean | number | null | string;
declare type validKeyTypeArray = Array<validKeyTypes>;
export declare const Utils: {
    /**
     * Uses `Object.prototype.toString.call` to return an object's
     * type as a lower-cased string
     *
     * @param {any} obj
     * @returns {string}
     */
    toType: typeof toType;
    /**
     * Returns true if obj is null or undefined
     *
     * @param {any} obj
     * @returns {boolean}
     */
    isNil: typeof isNil;
    /**
     * Returns false if obj is not null or undefined
     *
     * @param {any} obj
     * @returns {boolean}
     */
    notNil: typeof notNil;
    /**
     * Returns true if obj is a number
     *
     * @param {any} obj
     * @returns {boolean}
     */
    isNumber: typeof isNumber;
    /**
     * Returns true if obj is a string
     *
     * @param {any} obj
     * @returns {boolean}
     */
    isString: typeof isString;
    /**
     * Returns true if obj is a boolean value
     * @param {any} obj
     * @returns {boolean}
     */
    isBool: typeof isBool;
    /**
     * Returns true if the prototype of obj is Object
     *
     * @param {any} obj
     * @returns {boolean}
     */
    isObject: typeof isObject;
    /**
     * Returns true if obj is an Array
     *
     * @param {any} obj
     * @returns {boolean}
     */
    isArray: typeof isArray;
    /**
     * Returns true if the prototype of obj is Function
     *
     * @param {any} obj
     * @returns {boolean}
     */
    isFunction: (value: any) => value is (...args: any[]) => any;
    /**
     * Returns true if the prototype of obj is Error
     *
     * @param {any} obj
     * @returns {boolean}
     */
    isError: typeof isError;
    /**
     * Returns true if the provided object is an Array
     * that contains at least one element, and whose elements
     * are all strings
     *
     * @param {Array<any>} obj
     * @returns {boolean}
     */
    isStringArray: typeof isStringArray;
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
    toBool: typeof toBool;
    /**
     * Uses lodash to deeply clone obj
     *
     * @param {any} obj
     * @returns {any}
     */
    cloneObj: typeof cloneObj;
    /**
     * Returns true if the prototype of obj
     * is Object, and the object has own keys
     *
     * @param {any} obj
     * @returns {boolean}
     */
    hasKeys: typeof hasKeys;
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
    keyForValue: typeof cfKeyForValue;
    /**
     * Returns an object is obj is already an object or if
     * it can be parsed to one.
     * Otherwise returns undefined
     *
     * @param {any} obj
     * @returns {object|undefined}
     */
    safeJSONParse: typeof safeJSONParse;
};
/**
 * Lower-cases stringValue using toLocaleLowerCase.
 * The value will also be trimmed unless trim is set to false.
 * Falls back to lodash's toString function if the value is not a string
 *
 * @param {any} stringValue
 * @param {boolean} [trim=true] Set to false if you do not want the value to be trimmed
 * @returns {string}
 */
export declare function caseFold(stringValue: string | any, trim?: boolean): string;
export declare namespace caseFold {
    var endsWith: typeof cfEndsWith;
    var startsWith: typeof cfStartsWith;
    var get: typeof cfGet;
    var getKey: typeof cfGetKey;
    var has: typeof cfHas;
    var find: typeof cfFind;
    var indexOf: typeof cfIndexOf;
    var keys: typeof cfKeys;
    var keyMap: typeof cfKeyMap;
    var equals: typeof cfEquals;
    var set: typeof cfSet;
    var trim: typeof cfTrim;
    var transform: typeof transformObject;
}
/**
 * Uses `Object.prototype.toString.call` to return an object's
 * type as a lower-cased string
 *
 * @param {any} obj
 * @returns {string}
 */
declare function toType(obj: any): string;
/**
 * Returns true if obj is null or undefined
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isNil(obj: any): obj is null | undefined;
/**
 * Returns false if obj is not null or undefined
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function notNil(obj: any): obj is NonNullable<any>;
/**
 * Returns true if obj is a number
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isNumber(obj: any): obj is number;
/**
 * Returns true if obj is a string
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isString(obj: any): obj is string;
/**
 * Returns true if obj is a boolean value
 * @param {any} obj
 * @returns {boolean}
 */
declare function isBool(obj: any): obj is boolean;
/**
 * Returns true if the prototype of obj is Object
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isObject(obj: any): obj is object;
/**
 * Returns true if obj is an Array
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isArray(obj: any): obj is any[];
/**
 * Returns true if the prototype of obj is Function
 *
 * @param {any} obj
 * @returns {boolean}
 */
/**
 * Returns true if the prototype of obj is Error
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isError(obj: any): obj is Error;
/**
 * Returns true if the provided object is an Array
 * that contains at least one element, and whose elements
 * are all strings
 *
 * @param {Array<any>} obj
 * @returns {boolean}
 */
declare function isStringArray(obj: any | any[]): obj is string[];
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
declare function toBool(obj: any, defaultValue?: boolean | undefined, boolOptions?: BoolOptions): boolean | undefined;
/**
 * Returns true if the prototype of obj
 * is Object, and the object has own keys
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function hasKeys(obj: any): boolean;
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
declare function cfKeyForValue(obj: Object, searchValue: any): string | undefined;
/**
 * Uses lodash to deeply clone obj
 *
 * @param {any} obj
 * @returns {any}
 */
declare function cloneObj(obj: any): any;
/**
 * Returns an object is obj is already an object or if
 * it can be parsed to one.
 * Otherwise returns undefined
 *
 * @param {any} obj
 * @returns {object|undefined}
 */
declare function safeJSONParse(obj: any): Object | undefined;
/**
 * Casefolds val, and trims it. Useful when being passed more than one parameter, but you
 * only want to process the first one
 *
 * @param {any} val
 * @returns {string}
 */
declare function cfTrim(val: any): string;
/**
 * Like Object.keys, except that each key is processed by caseFold.
 * If trim is false, then the keys will not be trimmed
 *
 * @param {object} obj
 * @param {boolean} [trim=true] Defaults to true
 * @returns {string[]}
 */
declare function cfKeys(obj: Object, trim: boolean): string[];
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
declare function cfHas(obj: Object, key: validKeyTypes | validKeyTypeArray): boolean;
/**
 * Returns true if string1 and string2 are the same, regardless of casing.
 *
 * @param {string} string1
 * @param {string} string2
 * @returns {boolean}
 */
declare function cfEquals(string1: string, string2: string): boolean;
/**
 * Like String.startsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=true] Trim values when searching
 * @returns {boolean}
 */
declare function cfStartsWith(stringValue: string, searchValue: string, trim?: boolean): boolean;
/**
 * Like String.endsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=true] Trim values when searching
 * @returns {boolean}
 */
declare function cfEndsWith(stringValue: string, searchValue: string, trim?: boolean): boolean;
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
declare function cfIndexOf(stringOrStrArray: string | any[] | readonly any[], searchValue: any, trim?: boolean): number;
/**
 * Like Array.find, but doesn't care about casing
 *
 * @param {string[]} stringArray
 * @param {string} searchValue
 * @param {boolean} [trim=true] Set to true to trim values before comparison
 * @returns {string|undefined} The value from the array, or undefined, if it is not found
 */
declare function cfFind(stringArray: string | string[] | readonly string[], searchValue: string, trim?: boolean): string | undefined;
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
declare function cfKeyMap(obj: any, trim?: boolean, recurse?: boolean): Object;
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
declare function cfGetKey(obj: Object | undefined, path: validKeyTypes | validKeyTypeArray): string | undefined;
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
declare function cfGet(obj: Object | Object | undefined, path: validKeyTypes | validKeyTypeArray, defaultValue?: any): any;
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
declare function cfSet(obj: Object | Object | undefined, path: validKeyTypes | validKeyTypeArray, value: any): Object | undefined;
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
declare function transformObject(sourceObject: Object | Object | undefined, mappingObject: MappingObject, options?: TransformOptions): Object | Object | undefined;
export {};
