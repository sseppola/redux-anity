import constants from './constants.js'


const actionIdentifierFactory = internalCheckFn => isWantedAction => {
  if (typeof isWantedAction !== 'function') {
    throw new Error('Invalid injected action identifier, must be a function')
  }
  return internalCheckFn(isWantedAction)
}


// reduxAnityResponse :: isWantedActionFn -> action -> bool
export const reduxAnityResponse = actionIdentifierFactory(isWantedAction => action =>
  action.type === constants.ASYNC_RESPONSE
  && !action.error
  && isWantedAction(action)
)


// reduxAnityError :: isWantedActionFn -> action -> bool
export const reduxAnityError = actionIdentifierFactory(isWantedAction => action =>
  action.type === constants.ASYNC_RESPONSE
  && action.error
  && isWantedAction(action)
)


// reduxAnityWanted :: isWantedActionFn -> action -> bool
export const reduxAnityWanted = actionIdentifierFactory(isWantedAction => action =>
  action.type === constants.WANTED
  && isWantedAction(action)
)


// reduxAnityWanted :: isWantedActionFn -> { wantedFn, responseFn, errorFn }
export const generateActionIdentifiers = isWantedAction => ({
  wanted: reduxAnityWanted(isWantedAction),
  response: reduxAnityResponse(isWantedAction),
  error: reduxAnityError(isWantedAction),
})
