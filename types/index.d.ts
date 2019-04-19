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
    exact_match: boolean;
    keep_unmatched: boolean;
    context?: Object;
}
export interface MappingObject {
    [key: string]: string | string[] | MappingObject | Function;
}
export declare const Utils: {
    toType: typeof toType;
    isNil: typeof isNil;
    notNil: typeof notNil;
    isNumber: typeof isNumber;
    isString: typeof isString;
    isBool: typeof isBool;
    isObject: typeof isObject;
    isFunction: typeof isFunction;
    isError: typeof isError;
    isStringArray: typeof isStringArray;
    toBool: typeof toBool;
    cloneObj: typeof cloneObj;
    hasKeys: typeof hasKeys;
    keyForValue: typeof cfKeyForValue;
    safeJSONParse: typeof safeJSONParse;
};
export declare function caseFold(stringValue: string | any, trim?: boolean): string;
export declare namespace caseFold {
    var endsWith: typeof cfEndsWith;
    var startsWith: typeof cfStartsWith;
    var get: typeof cfGet;
    var getKey: typeof cfGetKey;
    var has: typeof cfHas;
    var find: typeof find;
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
declare function isNil(obj: any): boolean;
/**
 * Returns false if obj is not null or undefined
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function notNil(obj: any): boolean;
/**
 * Returns true if obj is a number
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isNumber(obj: any): boolean;
/**
 * Returns true if obj is a string
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isString(obj: any): boolean;
/**
 * Returns true if obj is a boolean value
 * @param {any} obj
 * @returns {boolean}
 */
declare function isBool(obj: any): boolean;
/**
 * Returns true if the prototype of obj is Object
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isObject(obj: any): boolean;
/**
 * Returns true if the prototype of obj is Function
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isFunction(obj: any): boolean;
/**
 * Returns true if the prototype of obj is Error
 *
 * @param {any} obj
 * @returns {boolean}
 */
declare function isError(obj: any): boolean;
/**
 * Returns true if the provided object is an Array
 * that contains at least one element, and whose elements
 * are all strings
 *
 * @param {Array<any>} ary
 * @returns {boolean}
 */
declare function isStringArray(ary: any | any[]): boolean;
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
declare function toBool(obj: any, defaultValue?: boolean): boolean | undefined;
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
 * value. If value and key's value are strings, then they
 * are matched without regard for casing.
 * If the value cannot be matched, undefined is returned
 *
 * @param {object} obj
 * @param {any} value
 * @returns {string|undefined}
 */
declare function cfKeyForValue(obj: Object, value: any): string | undefined;
/**
 * Returns a copy of obj
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
 * Casefolds val, and trims it. Returns an empty string
 * if the provided value is not a string.
 *
 * @param {string} val
 * @returns {string}
 */
declare function cfTrim(val: string): string;
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
declare function cfKeys(obj: Object, trim: boolean, recurse?: boolean): string[] | object;
/**
 * Returns True if key is in obj. If key is an array, then
 * the values are expected to be a list of progressively nested
 * properties of obj
 *
 * @param {object} obj
 * @param {string|string[]} key
 * @returns {boolean}
 */
declare function cfHas(obj: Object, key: string | string[]): boolean;
/**
 * Returns true if string1 and string2 are the same, regardless of casing.
 *
 * @param {string} string1
 * @param {string} string2
 * @returns {boolean}
 */
declare function cfEquals(string1: string, string2: string): boolean;
/**
 * Like startsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=false] Trim values when searching
 * @returns {boolean}
 */
declare function cfStartsWith(stringValue: string, searchValue: string, trim?: boolean): boolean;
/**
 * Like endsWith, but doesn't case about casing
 *
 * @param {string} string
 * @param {string} searchValue
 * @param {boolean} [trim=false] Trim values when searching
 * @returns {boolean}
 */
declare function cfEndsWith(stringValue: string, searchValue: string, trim?: boolean): boolean;
/**
 * Like indexOf, but doesn't care about casing
 *
 * @param {string|string[]} stringOrStrArray
 * @param {string} searchValue
 * @param {boolean} [trim=false] Trim values when searching
 * @returns {number} -1 if not found, or the index of the found value
 */
declare function cfIndexOf(stringOrStrArray: string | string[], searchValue: string, trim?: boolean): number;
/**
 * Like Array.find, but doesn't care about casing
 *
 * @param {string[]} stringArray
 * @param {string} searchValue
 * @param {boolean} [trim=false] Set to true to trim values before comparison
 * @returns {string|undefined} The value from the array, or undefined, if it is not found
 */
declare function find(stringArray: string | string[], searchValue: string, trim?: boolean): string | undefined;
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
declare function cfKeyMap(obj: any, trim?: boolean): Object;
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
declare function cfGetKey(obj: Object | undefined, path: string | string[]): string | undefined;
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
declare function cfGet(obj: Object | Object | undefined, path: string | string[], defaultValue?: any): any;
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
declare function cfSet(obj: Object | Object | undefined, path: string | string[], value: any): Object | Object | undefined;
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
declare function transformObject(sourceObject: Object | Object | undefined, mappingObject: MappingObject, options?: TransformOptions): Object | Object | undefined;
export {};
