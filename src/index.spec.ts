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

function isPrimitive(val: any): boolean {
  if (typeof val === 'undefined' || null === val) {
    return true
  }
  let primitiveValues = ['number', 'string', 'boolean']
  return primitiveValues.indexOf(typeof val) !== -1
}

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
    if (isPrimitive(val) === false && val && val.constructor && typeof val.constructor.name === 'string') {
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

      let all_lower = 'foo'
      let all_upper = 'FOO'
      let mixed = 'Foo'
      let mixed_with_spaces = ' Foo  '
      let lower_with_spaces = ' foo  '
      it('Should lowercase an uppercase string', function () {
        expect(caseFold(all_upper)).to.equal(all_lower)
      })

      it('Should lowercase a mixed-case string', function () {
        expect(caseFold(mixed)).to.equal(all_lower)
      })

      it('Should trim and lowercase a string', function () {
        expect(caseFold(mixed_with_spaces, true)).to.equal(all_lower)
      })

      it('Should leave spaces if not requested to trim', function () {
        expect(caseFold(mixed_with_spaces)).to.equal(lower_with_spaces)
      })

      it('Should return an empty string when passed a non-string value', function () {
        expect(caseFold({})).to.equal('')
      })
    })

    describe('#trim', () => {
      let testFunc = caseFold.trim
      let testCases: [any, any][] = [
        [' FOO ', 'foo'],
        ['foo', 'foo'],
        ['bar', 'bar'],
        ['FOObar', 'foobar'],
        ['FOOBAR.bar', 'foobar.bar'],
        [{}, ''],
        [1, '']
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
        [[['foobar', 'oO'], 'FoOBar'], 0],
        [[['ab', 'oo'], 'OO'], 1],
        [[['foo', {}], 'BAR'], -1],
        [[[1, 1], 1], -1],
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
        [[{'foo': {'bar': 'bar'}, 'foobar': 'bar'}, ['foo', 'bar']], true],
        [[{'foo': {'bar': 'bar'}, 'foobar': 'bar'}, ['fOo', 'BAR']], true],
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
      testCases = testCases.concat(getTestCases(
        {'foo': 'bar', 'foobar': 'bar'},
        [
          [['BAR', 'FOO'], 'bar'],
          ['foo', 'bar'],
          ['bar', undefined],
          ['FOObar', 'bar'],
          ['FOOBAR.bar', undefined],
          [{}, undefined],
          [1, undefined]
        ]
      ))
      testCases = testCases.concat(getTestCases(
        {'foo': {'bar': 'bar'}, 'foobar': 'bar'},
        [
          ['foo', {'bar': 'bar'}],
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
      it('Does not yet have tests!')
    })

    describe('#getKey', () => {
      let testFunc = caseFold.getKey
      it('Does not yet have tests!')
    })

    describe('#keys', () => {
      let testFunc = caseFold.keys
      it('Does not yet have tests!')
    })

    describe('#keyMap', () => {
      let testFunc = caseFold.keyMap
      it('Does not yet have tests!')
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
      let testCases: any[] = [
        [ [{'foo': 'bar'}, 'BAR'], 'foo'],
        [ [{'foo': 'bar', 'bar': 'foo'}, 'FOO'], 'bar'],
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
