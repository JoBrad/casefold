# casefold
The idea for this package came from Python's [str.casefold](https://docs.python.org/3/library/stdtypes.html#str.casefold) function, which allows strings to be compared without regard to casing. This package also auto-trims whitespace when comparing values, in most cases.

## Important Notes
* This package was part of a larger project related to object transformation, so some functionality may not be as sensible for a standalone package, and may eventually be modified, as needed.
* This package uses String.toLowerCase for string comparison. This does not fully work for non-English languages.
* Most functions in this package will fail "silently" by either returning the provided object, or undefined, if they cannot perform their intended function.
* `get` and `set` rely partly on lodash's [get](https://lodash.com/docs/4.17.11#get) and [set](https://lodash.com/docs/4.17.11#set) functions, since so much functionality is available with those functions. However the current focus of this package is mostly on accessing object properties, and not array access.

# Future enhancements
On the current to-do list:
* [x] Convert string comparison to localecompare
* [x] The functions are not all consistent (e.g. some return undefined, some don't), due to the original requirements of the project that this was made for. The goal is to make all functions consistent.
* [\] Extend functions that access object properties to take full advantage of lodash's `get` and `set` options, especially with regards to Array access.
* [ ] Allow individual functions to be imported without importing the entire library.

# API
The casefold package exposes 2 top-level objects:

## Utils
Provides generic functions which, when referencing string functions, use caseFold for comparison
  * "Syntactic sugar" functions designed to increase readability of code. Except where noted, these functions are all equivalent to using the `typeof obj === '{object_type}'` statement
    * toType
      * Uses `Object.prototype.toString.call` to return an object's type as a lower-cased string
    * isNil
      * Returns true if the provided object has a type of 'undefined' or if it is strictly equal to null
    * notNil
      * Syntactic sugar for !isNil
    * isNumber
    * isString
    * isBool
    * isObject
      * Uses the toType function to determine if an object's type is 'object'. Will not return true for Arrays, etc.
    * isArray
    * isFunction
      * Uses the toType function to determine if an object's type is `function`
    * isError
      * Returns `true` if the provided object is an instance of Error
    * isStringArray
      * Returns true if the provided object is an Array that contains at least one element, and whose elements are all strings
  * toBool
    * Attempts to convert the provided object to a boolean (or just returns it, if it is a boolean) using the logic below. You can optionally provide custom true/false values. If the value can't be matched, undefined is returned.
      * true values: 1, '1', 'y', 'yes', or 'true'
      * false values 0, '0', 'n', 'no', or 'false'
  * cloneObj
    * Uses lodash's cloneDeep function to deeply clone an object
  * hasKeys
    * Returns true if the provided object is of type "object" and has its own keys (using Object.keys)
  * keyForValue
    * Returns the key in the provided object that has a value matching the provided value. Works for objects with string values, or for objects with arrays of values to match against.
  * safeJSONParse
    * If the provided object is already an object, it is returned; Tries to use JSON.parse to parse the provided value, then returns undefined if this fails

## caseFold
Provides core casefold functionality.

### Strings
* caseFold
  * Returns a casefolded version of the provided string
* caseFold.trim
  * Same as passing caseFold only one parameter. Helpful if you are mapping values to this function, and the second parameter may be a boolean, but you always want to trim the values
* caseFold.equals
  * Returns true if the provided values are equal. If they are strings, then they are compared using caseFold.
* caseFold.endsWith
  * Like String.endsWith, but uses caseFold for comparison
* caseFold.startsWith
  * Like String.startsWith, but uses caseFold for comparison
* caseFold.indexOf
  * Like Array.indexOf or String.indexOf, but uses caseFold for string values

### Arrays
* caseFold.indexOf
  * Like Array.indexOf or String.indexOf, but uses caseFold
* caseFold.find
  * Like Array.find, but uses caseFold

### Objects
* caseFold.has
  * Returns true if the provided object has the provided string property, or any of an array of string properties
* caseFold.get
  * Returns the value of a provided property or the first property in an array of properties
* caseFold.getKey
  * Like caseFold.get, except it returns the key that was matched instead of the value
* caseFold.set
  * Sets a key to the provided value for the provided object. Existing keys will be reused, regardless of casing, to avoid creating duplicates.
* caseFold.keys
  * Returns an Array of caseFolded strings for the Object
* caseFold.keyMap
  * Returns an object whose keys are the casefolded keys of the provided object, and whose values are the original key. If recurse is true, then child objects will be mapped, as well.

### Object Transformation
This could arguably be broken out into its own package. However it relies heavily on the caseFold functions for operation, and was the original function of the package.

* caseFold.transform
  * Accepts a Source object, a Mapping object, and an optional options object. The options object may contain a 'context' key with an object that will be passed to any transformation functions defined in the Mapping object (more below).
  * Returns a new object by using a Mapping object to retrieve values from the provided Source object.
  * A `Mapping object` is a standard JS object with the following structure:
    * Each key is a desired key for the returned object. Unless the options object sets `keep_unmatched` to true, only keys whose value is not undefined are returned.
    * Each key's value may be:
      * A *string* indicating a property which may exist in the Source object. This value can be in "standard" property notation (e.g. `foo`) or using "dotted" notation (e.g. `foo.bar`). Casing and whitespace will be ignored when retrieving the property's value from the Source object.
      * An *Array* of strings using the same conventions as listed above
      * A *Mapping object*. Useful when you have nested object schemas to retrieve from the Source object.
      * A *function*. The function will be passed the Source object as well as a Context object, if defined in the provided options.


# Change Notes
* 1.0.0
  * Initial release!
* 1.1.1
  * Simplified internal processing
  * Corrected some bugs in key retrieval
  * caseFold.keys now only returns an array
  * caseFold.keyMap will optionally recurse an object, producing the recursive keymap that caseFold.keys used to provide, when passed the recurse param
  * Corrected an ambiguous name in the type definitions (find => cfFind)
  * Added tests for all functions except transform
  * Recurse defaults to true for keymap
  * Updated trim default values on most functions to default to true
  * Changed cloneObj to only use lodash's cloneDeep function
* 1.2.1
  * keyForValue now works for objects whose values are arrays
  * indexOf will work on non-string arrays and non-string values. If the array element is a string, casefolding is applied.
  * Added tests for new functionality
* 1.2.2
  * isFunction now uses lodash's isFunction method (previous version returned false for async functions, which have a different Object.prototype.toString.call value)
  * Added a test for this case
  * Enumerated lodash imports rather than importing the entire library
* 1.2.3
  * Added type signatures to support readonly arrays
* 1.2.4-1.2.7
  * Updated lodash to address CVE-2019-10744
  * Corrected invalid packaging
* 1.2.8
  * Updated mocha to address security advisory: https://github.com/advisories/GHSA-p9pc-299p-vxgp
  * Added test for transform function