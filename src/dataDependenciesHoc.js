import PropTypes from 'prop-types'
import R from 'ramda'
import { compose, pure, getContext, mapProps, lifecycle } from 'recompose'

import constants from './constants.js'


const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired
})


export function dataDependencies(dependencies) {
  let unsubscribe

  return compose(
    getContext({ store: storeShape.isRequired }),
    pure,
    lifecycle({
      componentWillMount() {
        const store = this.props.store
        const checkDependencies = () => {
          dependencies.forEach(([location, hasDesiredData, options = {}]) => {
            if (!hasDesiredData(store.getState())) {
              store.dispatch({
                type: constants.WANTED,
                payload: { ...options, location },
              })
            }
          })
        }

        unsubscribe = store.subscribe(checkDependencies)
        checkDependencies()
      },
      componentWillUnmount() {
        unsubscribe()
      }
    }),
    mapProps(R.dissoc('store'))
  )
}
