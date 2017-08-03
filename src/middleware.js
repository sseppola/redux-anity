import Task from 'data.task'
import invariant from 'invariant'

import constants from './constants.js'

const HANDBRAKE_DELAY = 5000


const createDefaultFetchFn = location => (resolve, reject) => {
  fetch(location, { method: 'GET' })
  .then(res => res.json())
  .then(resolve)
  .catch(reject)
}


export function configureMiddleware(_config = {}) {
  const config = Object.assign({
    createFetchFn: createDefaultFetchFn,
    taskHolder: new Map(),
    locationCallTimes: new Map(),
  }, _config)

  validateArguments(config)

  const taskHolder = config.taskHolder
  const locationCallTimes = config.locationCallTimes
  const actualFetchFn = location => (reject, resolve) => {
    config.createFetchFn(location)(resolve, reject)
  }

  const stopCallsTo = (location) => {
    const now = Date.now()
    const history = (locationCallTimes.get(location) || [])
      .filter(callTime => now - callTime < 5000)

    locationCallTimes.set(location, [...history, now])
    return history.length > 3
  }


  return store => next => action => {
    if (action == null) {
      return null;
    }

    if (action.type === constants.WANTED) {
      const { location, ...options } = action.payload
      const existingTask = taskHolder.get(location)
      if (existingTask) return // it's being processed, no-op

      // check if endpoint has been throttled
      if (stopCallsTo(location)) {
        console.error(`redux-anity prevented too frequent calls to "${location}"`
          + `, and will try again in ${HANDBRAKE_DELAY}ms. This issue usually`
          + ` occurs when there's an issue with your selector`)
        setTimeout(store.dispatch, HANDBRAKE_DELAY, action)
        return
      }

      const start_time = Date.now()

      // use Task to set up process without running it
      const task = new Task(actualFetchFn(location))
        .rejectedMap(error => ({
          type: constants.ASYNC_RESPONSE,
          error: true,
          payload: error,
          meta: { ...options, location, start_time, end_time: Date.now() }
        }))
        .map(response => ({
          type: constants.ASYNC_RESPONSE,
          payload: response,
          meta: { ...options, location, start_time, end_time: Date.now() }
        }))

      taskHolder.set(location, task)

      // run task immediately, however in later versions tasks can be prioritized
      taskHolder.get(location)
      .fork(store.dispatch, successAction => {
        taskHolder.delete(location)
        store.dispatch(successAction)
      })

      return next(action) // forward the WANTED action, this permitts tracking in a reducer
    }

    // if (action.type === constants.ASYNC_RESPONSE && action.error && action.meta.retries > 0) {
    //   // TODO: could be in separate middleware
    // }

    return next(action)
  }
}



function validateArguments(config) {
  invariant(typeof config.createFetchFn === 'function',
    `Expected "createFetchFn" to be a function, received: `
    + `"${typeof config.createFetchFn}"`
    + `\nSee options provided to redux-anity create middleware function`)

    // validate taskHolder
  invariant(typeof config.taskHolder.get === 'function',
    `Expected "taskHolder" to implement "get" function.`
    + `\nSee options provided to redux-anity create middleware function`)

  invariant(typeof config.taskHolder.set === 'function',
    `Expected "taskHolder" to implement "set" function.`
    + `\nSee options provided to redux-anity create middleware function`)

  // validate locationCallTimes
  invariant(typeof config.locationCallTimes.get === 'function',
    `Expected "locationCallTimes" to implement "get" function.`
    + `\nSee options provided to redux-anity create middleware function`)

  invariant(typeof config.locationCallTimes.set === 'function',
    `Expected "locationCallTimes" to implement "set" function.`
    + `\nSee options provided to redux-anity create middleware function`)
}
