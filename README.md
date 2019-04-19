# casefold
The idea for this package came from Python's [str.casefold](https://docs.python.org/3/library/stdtypes.html#str.casefold) function, which allows strings to be compared without regard to casing. This package also auto-trims whitespace when comparing values, in most cases.

## Important Notes
* This package was part of a larger project related to object transformation, so some functionality may not be as sensible for a standalone package, and may eventually be modified, as needed.
* This package uses String.toLowerCase for string comparison. This does not fully work for non-English languages.
* Most functions in this package will fail "silently" by either returning the provided object, or undefined, if they cannot perform their intended function.
* `get` and `set` rely partly on lodash's [get](https://lodash.com/docs/4.17.11#get) and [set](https://lodash.com/docs/4.17.11#set) functions, since so much functionality is available with those functions. However the current focus of this package is mostly on accessing object properties, and not array access.

# Future enhancements
On the current to-do list:
* Convert string comparison to localecompare
* Extend functions that access object properties to take full advantage of lodash's `get` and `set` options, especially with regards to Array access.
* The functions are not all consistent (e.g. some return undefined, some don't), due to the original requirements of the project that this was made for. The goal is to make all functions consistent.
* Allow individual functions to be imported without importing the entire library.

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
    * isFunction
      * Uses the toType function to determine if an object's type is `function`
    * isError
      * Returns `true` if the provided object is an instance of Error
    * isStringArray
      * Returns true if the provided object is an Array that contains at least one element, and whose elements are all strings
  * toBool
    * Attempts to convert the provided object to a boolean, using more strict logic than just a "truthy" test:
      * Booleans are just returned
      * true is returned if the value is 1, '1', 'y', 'yes', or 'true'
      * false is returned if the value is 0, '0', 'n', 'no', or 'false'
      * Otherwise undefined is returned
  * cloneObj
    * Uses JSON.parse(JSON.stringify(obj)) to clone the provided object; falls back to lodash's _.cloneDeep function; then falls back to just returning the original object. This will be changed to throw an error in the future.
  * hasKeys
    * Returns true if the provided object is of type "object" and has its own keys (using Object.keys)
  * keyForValue
    * Returns the key in the provided object that has a value matching the provided value
  * safeJSONParse
    * If the provided object is already an object, it is returned; Tries to use JSON.parse to parse the provided value, then returns undefined if this fails

## caseFold
Provides core casefold functionality.

### Strings
* caseFold
  * Returns a casefolded version of the provided string
* caseFold.trim
  * Returns a casefolded version of the provided string, that is also trimmed
* caseFold.equals
  * Returns true if the provided values are equal. If they are strings, then they are compared using caseFold.
* caseFold.endsWith
* caseFold.startsWith

### Arrays
* caseFold.indexOf
  * Like Array.indexOf, but uses caseFold
* caseFold.find
  * Like Array.find, but uses caseFold

### Objects
* caseFold.has
  * Returns true if the provided object has the provided string property
* caseFold.get
  * Returns the value of a provided property or the first property in an array of properties
* caseFold.set
  * Sets a key to the provided value for the provided object. Looks for the key in the object without regard to casing, so that duplicate keys will not be created.
* caseFold.getKey
  * Like caseFold.get, except it returns the key that was matched instead of the value
* caseFold.keys
  * Returns either:
    * An Array of caseFolded strings for the Object
    * If recurse is set to true, the provided object values are recursively followed to return an object with caseFolded keys whose values are the original key value
* caseFold.keyMap
  * Returns an object whose keys are the casefolded keys of the provided object, and whose values are the original key. Does not recursively follow child objects

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

