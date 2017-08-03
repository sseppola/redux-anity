import test from 'ava'
import { spyOn } from 'expect'
import R from 'ramda'
import Task from 'data.task'
import constants from '../src/constants.js'
import { configureMiddleware } from '../src/middleware.js'

const mockHooks = R.curryN(2, (t, action) => ({
  dispatch: (_action) => { t.true(action === _action, 'dispatches action') },
  next: (_action) => { t.true(action === _action, 'calls next with action')},
  fetchFn: () => {},
}))

const mockConfig = (config = {}) => Object.assign({}, {
  createFetchFn: () => () => {},
  taskHolder: new Map(),
  locationCallTimes: new Map(),
}, config)


test('Exports a function', t => {
  t.true(typeof configureMiddleware === 'function')
})

test('Throws if misconfigured', t => {
  t.throws(() => configureMiddleware({ createFetchFn: 'function' }))
  t.throws(() => configureMiddleware({ taskHolder: {} }))
  t.throws(() => configureMiddleware({ locationCallTimes: {} }))
})

test('Throws if misconfigured', t => {
  t.notThrows(() => configureMiddleware({ createFetchFn: () => {} }))
  t.notThrows(() => configureMiddleware({ taskHolder: new Map() }))
  t.notThrows(() => configureMiddleware({ locationCallTimes: new Map() }))
})

test('Recognizes action.type = constants.WANTED', t => {
  const action = { type: constants.WANTED, payload: { location: 'LOCATION' } }
  const hooks = mockHooks(t, action)
  const config = mockConfig()

  const createFetchFnSpy = spyOn(config, 'createFetchFn').andReturn(hooks.fetchFn)
  const fetchFnSpy = spyOn(hooks, 'fetchFn')
  const dispatchSpy = spyOn(hooks, 'dispatch')
  const nextSpy = spyOn(hooks, 'next')

  configureMiddleware(config)({ dispatch: hooks.dispatch })(hooks.next)(action)

  t.true(dispatchSpy.calls.length === 0, 'does not call dispatch function')
  t.true(nextSpy.calls[0].arguments[0] === action, 'calls next with action')

  const { taskHolder, locationCallTimes } = config

  // test task creation
  t.true(taskHolder.size === 1, 'associates 1 key in taskHolder')

  const fetchTask = taskHolder.get(action.payload.location)
  t.true(fetchTask instanceof Task,
    'associates a Task at provided location in taskHolder')

  t.true(createFetchFnSpy.calls.length === 1)
  t.deepEqual(createFetchFnSpy.calls[0].arguments, [action.payload.location],
    'calls createFetchFn with location')

  t.true(fetchFnSpy.calls.length === 0, 'does not call the fetch function')

  // locationCallTimes
  t.true(locationCallTimes.size === 1, 'registers 1 key in locationCallTimes')
  t.true(locationCallTimes.get(action.payload.location).length === 1,
    'registers array with 1 item at location key in locationCallTimes')

})
