import test from 'ava'
import { createSpy, spyOn, isSpy } from 'expect'
import * as _exports from '../src'

test('Exports functions', t => {
  t.true(typeof _exports.reduxAnityResponse === 'function')
  t.true(typeof _exports.reduxAnityError === 'function')
  t.true(typeof _exports.reduxAnityWanted === 'function')
  t.true(typeof _exports.generateActionIdentifiers === 'function')
  t.true(typeof _exports.constants === 'object')
  t.true(typeof _exports.dataDependencies === 'function')
  t.true(typeof _exports.configureMiddleware === 'function')
})
