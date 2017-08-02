import Task from 'data.task'
import constants from './constants.js'

const HANDBRAKE_DELAY = 5000


const fetchTask = location => new Task((reject, resolve) => {
  fetch(location, { method: 'GET' })
  .then(res => res.json())
  .then(resolve)
  .catch(reject)
})


export const middleware = store => next => {
  const { dispatch } = store
  const taskHolder = new Map()
  const locationCallTimes = new Map()

  const stopCallsTo = (location) => {
    const now = Date.now()
    const history = (locationCallTimes.get(location) || [])
      .filter(callTime => now - callTime < 5000)

    locationCallTimes.set(location, [...history, now])
    return history.length > 3
  }

  return action => {
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
        setTimeout(dispatch, HANDBRAKE_DELAY, action)
        return
      }

      const start_time = Date.now()

      // use Task to set up process without running it
      const task = fetchTask(location)
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
      .fork(dispatch, successAction => {
        taskHolder.delete(location)
        dispatch(successAction)
      })

      return next(action) // forward the WANTED action, this permitts tracking in a reducer
    }

    // if (action.type === constants.ASYNC_RESPONSE && action.error && action.meta.retries > 0) {
    //   // TODO: could be in separate middleware
    // }

    return next(action)
  }
}
