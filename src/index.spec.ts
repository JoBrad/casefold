import { caseFold, Utils } from './index'
import { expect } from 'chai'

class SampleClass {
  constructor() {
  }
}

const noop = () => {}

function getTestCases(testInput: any, argsAndResult: any[]): any[][] {
  let returnArry: any[][] = [];
  argsAndResult.map(a => {
    let expectedResult = a.pop()
    let args = [testInput].concat(a)
    returnArry.push([
      args, expectedResult
    ])
  })
  return returnArry
}

function getCodePointsArray(str: string): any[] {
  return [...str].map(c => {
    return c.codePointAt(0)
  })
}

/**
 * Returns true if val is null, undefined, a number, a string, or a boolean
 *
 * @param {any} val
 * @returns {boolean}
 */
function isPrimitive(val: any): boolean {
  if (typeof val === 'undefined' || null === val) {
    return true
  }
  let primitiveValues = ['number', 'string', 'boolean']
  return primitiveValues.indexOf(typeof val) !== -1
}

/**
 * Converts val to a friendly string
 *
 * @param {any} val
 * @returns {string}
 */
function stringify(val: any): string {
  if (typeof val === 'string') {
    return '"' + val + '"'
  } else if (Array.isArray(val)) {
    return '[' + val.map(stringify) + ']'
  } else if (typeof val === 'function') {
    let isClass = (val.toString().split(' ').pop() === 'class');
    let fName = '';
    if (isClass) {
      if (val.constructor && val.constructor.name) {
        fName = 'class ' + val.constructor.name;
      } else if (val.name) {
        fName = 'class ' + val.name;
      } else {
        fName = 'a class'
      }
    } else {
      if (val.name) {
        fName = 'function ' + val.name
      } else {
        fName = 'a function'
      }
    }
    return fName
  } else {
    if (isPrimitive(val) === false && val && val.constructor && typeof val.constructor.name === 'string' && val.constructor.name !== 'Object') {
      return val.constructor.name + ' ' + JSON.stringify(val)
    }
    return JSON.stringify(val)
  }
}

describe('casefold module => ', () => {
  it('Should export caseFold and Utils', () => {
    expect(caseFold).to.not.be.undefined
    expect(Utils).to.not.be.undefined
  })

  describe('caseFold', () => {
    describe('(root object)', () => {
      it('Should be a function', () => {
        expect(caseFold).to.be.a('function')
      })
      let testFunc = caseFold

      let testCases: Array<[string|[string, boolean], any]> = [
        ['foo', 'foo'],
        ['FOO', 'foo'],
        ['  FOO', 'foo'],
        [['  FOO', false], '  foo'],
        ['  FOO  ', 'foo'],
        ['  FOO  ', 'foo'],
        ['\u0130', String.fromCodePoint(...getCodePointsArray('\u0130'.toLocaleLowerCase()))],
        ['\u0049', String.fromCodePoint(...getCodePointsArray('\u0049'.toLocaleLowerCase()))],
        ['\u00DF', '\u00DF'],
      ]

      testCases.map((testCase) => {
        let [testValue, expectedValue] = testCase
        let actualResult: string
        if (Array.isArray(testValue)) {
          actualResult = testFunc(testValue[0], testValue[1])
        } else {
          actualResult = testFunc(testValue)
        }
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(actualResult).to.equal(expectedValue)
        })
      })

    })

    describe('#trim', () => {
      let testFunc = caseFold.trim
      let testCases = [
        ['FOO  ', 'foo'],
        ['FOO  ', 'foo'],
        ['  FOO', 'foo'],
        ['\u0130', String.fromCodePoint(...getCodePointsArray('\u0130'.toLocaleLowerCase()))],
        ['\u0049', String.fromCodePoint(...getCodePointsArray('\u0049'.toLocaleLowerCase()))],
        ['\u00DF', '\u00DF'],
      ]

      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#equals', () => {
      let testFunc = caseFold.equals
      let testCases: any[] = [
        [[' FOO ', 'foo'], true],
        [['foo', 'foo'], true],
        [['bar', 'bar'], true],
        [['FOObar', 'foobar'], true],
        [['FOOBAR.bar', 'foobar.bar'], true],
        [['Foobar', 'bar'], false],
        [[1, undefined], false]
      ]

      testCases.map(([testValue, expectedValue]) => {
        let [testObj, compareObj] = testValue
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObj)}, ${stringify(compareObj)})`, () => {
          expect(testFunc(testObj, compareObj)).to.equal(expectedValue)
        })
      })
    })

    describe('#endsWith', () => {
      let testFunc = caseFold.endsWith
      let testCases: [[any, any], boolean][] = [
        [['FOO', 'oO'], true],
        [['foobar', 'oO'], false],
        [[{}, 'oo'], false],
        [['foo', {}], false],
        [[1, 1], false],
      ]
      testCases.map(([vars, expectedValue]) => {
        let [testObject, searchValue] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObject)}, ${stringify(searchValue)})`, () => {
          expect(testFunc(testObject, searchValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#startsWith', () => {
      let testFunc = caseFold.startsWith
      let testCases: [[any, any], boolean][] = [
        [['FOO', 'fo'], true],
        [['foobar', 'BoO'], false],
        [[{}, 'oo'], false],
        [['foo', {}], false],
        [[1, 1], false],
      ]
      testCases.map(([vars, expectedValue]) => {
        let [testObject, searchValue] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObject)}, ${stringify(searchValue)})`, () => {
          expect(testFunc(testObject, searchValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#indexOf', () => {
      let testFunc = caseFold.indexOf
      let testCases: [[any, any], any][] = [
        [[['oo', 'foo'], 'oO'], 0],
        [[['foobar', 1, false, 'oO'], 'oo'], 3],
        [[['ab', 'oo'], 'OO'], 1],
        [['ab1', '1'], 2],
        [[['foo', {}], 'BAR'], -1],
        [[[1, 1], 1], 0],
        [['a', 'foo'], -1],
      ]
      testCases.map(([vars, expectedValue]) => {
        let [testObject, searchValue] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObject)}, ${stringify(searchValue)})`, () => {
          expect(testFunc(testObject, searchValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#find', () => {
      let testFunc = caseFold.find
      let testCases: [[any, any], any][] = [
        [[['oo', 'foo'], 'oO'], 'oo'],
        [[['foobar', 'oO'], 'FoOBar'], 'foobar'],
        [[['ab', 'oo'], 'OO'], 'oo'],
        [[['foo', {}], 'BAR'], undefined],
        [[[1, 1], 1], undefined],
        [[['a'], 'foo'], undefined],
      ]
      testCases.map(([vars, expectedValue]) => {
        let [testObject, searchValue] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObject)}, ${stringify(searchValue)})`, () => {
          expect(testFunc(testObject, searchValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#has', () => {
      let testFunc = caseFold.has
      let testCases: [[any, any], any][] = [
        [[{'foo': {'bar': 'bar'}, 'foobar': 'bar'}, ['bar', 'foo']], true],
        [[{'foo': {'bar': 'bar'}, 'foobar': 'bar'}, ['bar', 'FOO']], true],
        [[{'foo': {'bar': 'bar'}, 'foobar': 'bar'}, 'fOo'], true],
        [[{'foo': {'bar': 'bar'}, 'foobar': 'bar'}, ['fooBAR']], true],
        [[{'foo': {'bar': 'bar'}, 'foobar': 'bar'}, ['a', 'b']], false],
        [[[], ['a', 'b']], false],
        [[{}, ['a', 'b']], false],
        [[undefined, ['a', 'b']], false],
        [[null, ['a', 'b']], false],
        [[null, undefined], false],
        [[undefined, undefined], false],
      ]
      testCases.map(([vars, expectedValue]) => {
        let [testObject, searchValue] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObject)}, ${stringify(searchValue)})`, () => {
          expect(testFunc(testObject, searchValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#get', () => {
      let testFunc = caseFold.get
      let testCases: any[][] = []
      testCases = testCases.concat(getTestCases({
        'foo': 'bar',
        'foobar': 'bar'
      }, [
          [['BAR', 'FOO'], 'bar'],
          ['foo', 'bar'],
          ['bar', undefined],
          ['FOObar', 'bar'],
          ['FOOBAR.bar', undefined],
          [{}, undefined],
          [1, undefined]
        ]
      ))
      testCases = testCases.concat(getTestCases( {
        'foo': {
          'bar': 'bar'
        },
        'foobar': 'bar',
        null: 'any'
      }, [
          ['foo', {'bar': 'bar'}],
          ['null', 'any'],
          [null, 'any'],
          [['FOObar.bar', 'FOO.BAR'], 'bar'],
          ['bar', undefined],
          ['FOObar', 'bar'],
          ['FOOBAR.bar', undefined],
          [{}, undefined],
          [1, undefined]
        ]
      ))

      testCases.map(([vars, expectedValue]) => {
        let [testObject, searchValue] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObject)}, ${stringify(searchValue)})`, () => {
          expect(testFunc(testObject, searchValue)).to.deep.equal(expectedValue)
        })
      })
    })

    describe('#set', () => {
      let testFunc = caseFold.set
      let testCases: any[] = [
        [[{}, 'foo', {'foo': 'bar'}], {'foo': {'foo': 'bar'}}],
        [[{'foo': {'bar': 'bar'}, 'foobar': 'bar'}, 'FOO.bar', 1], {'foo': {'bar': 1}, 'foobar': 'bar'}],
        [[{'foo': {'Bar': 'Original bar'}}, 'FOO.bAR.foo', 1], {'foo': {'Bar': {'foo': 1}}}],
        [[undefined, 'foo', {'foo': 'bar'}], {'foo': {'foo': 'bar'}}],
        [['a', 'foo', {'foo': 'bar'}], {'foo': {'foo': 'bar'}}],
        [[{'fOo': {'baR': 'original bar'}}, 'foo', {'foo': 'bar'}], {'fOo': {'foo': 'bar'}}],
        [[{'fOo': {'baR': 'original bar'}}, 'Foo.bar.fooBar', {'foo': 'bar'}], {'fOo': {'baR': {'fooBar': {'foo': 'bar'}}}}],
      ];
      testCases.map(([vars, expectedValue]) => {
        let [obj, path, value] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(obj)}, ${stringify(path)}, ${stringify(value)})`, () => {
          expect(testFunc(obj, path, value)).to.deep.equal(expectedValue)
        })
      })
    })

    describe('#getKey', () => {
      let testFunc = caseFold.getKey
      let testCases: any[][] = []
      testCases = testCases.concat(getTestCases({
        'foo': 'bar',
        'foobar': 'bar'
      }, [
          [['BAR', 'FOO'], 'foo'],
          ['foo', 'foo'],
          ['bar', undefined],
          ['FOObar', 'foobar'],
          ['FOOBAR.bar', undefined],
          [{}, undefined],
          [1, undefined]
        ]
      ))
      testCases = testCases.concat(getTestCases( {
        'foo': {
          'bar': 'bar'
        },
        'foobar': 'bar',
        null: 'any'
      }, [
          ['foo', 'foo'],
          [null, 'null'],
          ['null', 'null'],
          [['FOObar.bar', 'FOO.BAR'], 'foo.bar'],
          ['bar', undefined],
          ['FOObar', 'foobar'],
          ['FOOBAR.bar', undefined],
          [{}, undefined],
          [1, undefined]
        ]
      ))

      testCases.map(([vars, expectedValue]) => {
        let [testObject, searchValue] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObject)}, ${stringify(searchValue)})`, () => {
          expect(testFunc(testObject, searchValue)).to.deep.equal(expectedValue)
        })
      })
    })

    describe('#keys', () => {
      let testFunc = caseFold.keys
      let testCases: any[][] = [
        [ [{ 'foo': 'bar', 'foobar': 'bar' }, true], [ 'foo', 'foobar'] ],
        [ [{ ' fOo': { 'baR ': 'bar' }, 'fOObar': 'bar', null: 'any' }, true], ['foo', 'foobar', 'null'] ]
      ]

      testCases.map(([vars, expectedValue]) => {
        let [testObject, searchValue] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObject)}, ${stringify(searchValue)})`, () => {
          expect(testFunc(testObject, searchValue)).to.deep.equal(expectedValue)
        })
      })
    })

    describe('#keyMap', () => {
      let testFunc = caseFold.keyMap
      let testCases: any[] = [
        [[{'foo ': {'bar': 'bar'}, 'fooBAR': 'bar'}, false, false], {'foo ': 'foo ', 'foobar': 'fooBAR'}],
        [[{'foo': {'bar': 'bar'}, 'fooBAR': 'bar'}, true, false], {'foo': 'foo', 'foobar': 'fooBAR'}],
        [[{'foo': {'bar': 'bar'}, 'fooBAR': 'bar'}], {'foo': 'foo', 'foobar': 'fooBAR'}],
        [[{'fOO': {'bar': 'bar'}, 'fooBAR': 'bar'}, true, false], {'foo': 'fOO', 'foobar': 'fooBAR'}],
        [[{'foo': {'BAR': {'bAr': 'foo'}}, 'fooBAR': 'bar'}, true, false], {'foo': 'foo', 'foobar': 'fooBAR'}],
        [[{'foo': {'bar': 'bar'}, 'fooBAR': 'bar'}, true, true], {'foo': {'bar': 'bar'}, 'foobar': 'fooBAR'}],
        [[{'fOO': {'bar': 'bar'}, 'fooBAR': 'bar'}, true, true], {'foo': {'bar': 'bar'}, 'foobar': 'fooBAR'}],
        [[{'foo': {'BAR': {'bAr': 'foo'}}, 'fooBAR': 'bar'}, true, true], {'foo': {'bar': {'bar': 'bAr'}}, 'foobar': 'fooBAR'}],
      ]

      testCases.map(([vars, expectedValue]) => {
        let [testObject, doTrim, doRecurse] = vars
        it(`Should return ${stringify(expectedValue)} when passed (${stringify(testObject)}, ${stringify(doTrim)}, ${stringify(doRecurse)})`, () => {
          expect(testFunc(testObject, doTrim, doRecurse)).to.deep.equal(expectedValue)
        })
      })
    })

    describe('#transform', () => {
      let testFunc = caseFold.transform
      it('Does not yet have tests!')
    })

  })

  describe('Utils', () => {
    it('Should be an object', () => {
      expect(Utils).to.be.an('object')
    })

    describe('#toType()', function () {
      it('Should be a function', () => {
        expect(Utils.toType).to.be.a('function')
      })

      let testCases = [
        ['string', 'a string', ''],
        ['object', 'an object', {}],
        ['array', 'an Array', []],
        ['set', 'a Set', new Set()],
        ['undefined', 'an undefined value', undefined],
        ['null', 'a null value', null],
        ['json', 'a built-in object', JSON],
      ]
      testCases.map(([expected_result, expected_result_desc, provided_obj]) => {
        describe(`When passed ${expected_result_desc} => `, function () {
          it('should not raise an error', function () {
            expect(() => Utils.toType(provided_obj)).to.not.throw()
          })
          let actual_result = Utils.toType(provided_obj);
          it(`should return '${expected_result}'`, function () {
            expect(actual_result).to.equal(expected_result)
          })
        })
      })
    })

    describe('#isNil', () => {
      let testFunc = Utils.isNil
      let testCases = [
        [undefined, true],
        [null, true],
        ['a', false],
        [1, false],
        [{}, false],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#notNil', () => {
      let testFunc = Utils.notNil
      let testCases = [
        [undefined, false],
        [null, false],
        ['a', true],
        [1, true],
        [{}, true],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#isNumber', () => {
      let testFunc = Utils.isNumber
      let testCases = [
        ['a', false],
        [{}, false],
        [1, true],
        ['1', false],
        [true, false],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#isString', () => {
      let testFunc = Utils.isString
      let testCases = [
        ['a', true],
        [{}, false],
        [1, false],
        ['1', true],
        [true, false],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#isBool', () => {
      let testFunc = Utils.isBool
      let testCases = [
        [true, true],
        [false, true],
        ['a', false],
        [{}, false],
        [1, false],
        ['1', false],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#isObject', () => {
      let testFunc = Utils.isObject
      let testCases = [
        [{}, true],
        [[], false],
        ['a', false],
        [1, false],
        ['1', false],
        [undefined, false],
        [null, false],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#isFunction', () => {
      let testFunc = Utils.isFunction

      let testCases = [
        [noop, true],
        [SampleClass, true],
        [{}, false],
        [[], false],
        ['a', false],
        [1, false],
        ['1', false],
        [undefined, false],
        [null, false],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#isError', () => {
      let testFunc = Utils.isError

      let testCases = [
        [new Error(), true],
        [{}, false],
        [[], false],
        ['a', false],
        [1, false],
        ['1', false],
        [undefined, false],
        [null, false],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#isStringArray', () => {
      let testFunc = Utils.isStringArray

      let testCases = [
        [['a'], true],
        [['a', 1], false],
        [[], false],
        ['a', false],
        [1, false],
        ['1', false],
        [undefined, false],
        [null, false],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#toBool', () => {
      let testFunc = Utils.toBool

      let testCases = [
        [true, true],
        [1, true],
        ['1', true],
        ['y', true],
        ['yes', true],
        ['true', true],
        [false, false],
        [0, false],
        ['0', false],
        ['n', false],
        ['no', false],
        ['false', false],
        [['a', 1], undefined],
        [[], undefined],
        ['a', undefined],
        [undefined, undefined],
        [null, undefined],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#cloneObj', () => {
      let testFunc = Utils.cloneObj

      let testCases = [
        [{}, {}],
        [{'foo': 'bar'}, {'foo': 'bar'}],
        [ {'foo': 'bar', 'bar': {'foobar': 'foo'}}, {'foo': 'bar', 'bar': {'foobar': 'foo'}}],
        ['a', 'a'],
        [1, 1],
        [null, null],
        [undefined, undefined],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.deep.equal(expectedValue)
          if (isPrimitive(testValue) === false) {
            expect(testFunc(testValue) === expectedValue).to.not.be.true
          }
        })
      })
    })

    describe('#hasKeys', () => {
      let testFunc = Utils.hasKeys
      let testCases = [
        [{'foo': 'bar'}, true],
        [ {'foo': 'bar', 'bar': {'foobar': 'foo'}}, true],
        [{}, false],
        ['a', false],
        [1, false],
        [null, false],
        [undefined, false],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#keyForValue', () => {
      let testFunc = Utils.keyForValue
      let arrayObj = {
        'foo': ['foo', 'bar'],
        'bar': ['afoo', 'abar']
      }
      let testCases: any[] = [
        [ [{'foo': 'bar'}, 'BAR'], 'foo'],
        [ [{'foo': 'bar', 'bar': 'foo'}, 'FOO'], 'bar'],
        [ [arrayObj, 'AFoo'], 'bar'],
        [[{}, undefined], undefined],
        [['a', 'a'], undefined],
        [[undefined, 1], undefined],
        [[null, null], undefined],
        [[undefined, undefined], undefined],
      ]
      testCases.map(([testValue, expectedValue]) => {
        let [obj, searchValue] = testValue;
        it(`Should return ${stringify(expectedValue)} when passed ( ${stringify(obj)}, ${stringify(searchValue)} )`, () => {
          expect(testFunc(obj, searchValue)).to.equal(expectedValue)
        })
      })
    })

    describe('#safeJSONParse', () => {
      let testFunc = Utils.safeJSONParse
      let testCases: any[] = [
        [ {'foo': 'bar'}, {'foo': 'bar'}],
        [ JSON.stringify({'foo': 'bar'}), {'foo': 'bar'}],
        [{}, {}],
        ['{}', {}],
        [undefined, undefined],
        [null, null],
      ]
      testCases.map(([testValue, expectedValue]) => {
        it(`Should return ${stringify(expectedValue)} when passed ${stringify(testValue)}`, () => {
          expect(testFunc(testValue)).to.deep.equal(expectedValue)
        })
      })
    })


  })
})
