/* global __DEVELOPMENT__ */

import React from 'react'
import { Router, Route } from 'react-router'
import { withClient } from 'cozy-client'
import { Authentication, Revoked } from 'cozy-authentication'
import { defaultRoute } from 'components/AppRoute'
import { setURLContext, logException } from 'lib/sentry'
import {
  storeCredentials,
  revokeClient,
  unlink,
  // setToken,
  getURL,
  getAccessToken
} from 'ducks/mobile'
import {
  registerPushNotifications,
  stopPushNotifications
} from 'ducks/mobile/push'
import { initBar, resetClient } from 'ducks/authentication/lib/client'

export const AUTH_PATH = 'authentication'

export const onLogout = async (store, cozyClient, replaceFn) => {
  try {
    await stopPushNotifications()

    if (__DEVELOPMENT__) {
      // eslint-disable-next-line no-console
      console.info('Stopped push notifications')
    }
  } catch (e) {
    if (__DEVELOPMENT__) {
      // eslint-disable-next-line no-console
      console.warn('Error while stopping push notification', e)
    }
  }

  try {
    await resetClient(cozyClient)

    if (__DEVELOPMENT__) {
      // eslint-disable-next-line no-console
      console.warn('Resetted client')
    }
  } catch (e) {
    if (__DEVELOPMENT__) {
      // eslint-disable-next-line no-console
      console.warn('Error while resetting client', e)
    }
  }

  store.dispatch(unlink())
  replaceFn(`/${AUTH_PATH}`)
}

const withAuth = Wrapped => (props, { store }) => {
  const cozyClient = props.client
  let clientInfos
  const onAuthentication = async res => {
    if (res) {
      // first authentication
      const { url, clientInfo, router, token } = res
      setURLContext(url)
      store.dispatch(storeCredentials(url, clientInfo, token))
      router.replace(defaultRoute())
    } else {
      // when user is already authenticated
      clientInfos = store.getState().mobile.client
    }

    cozyClient.login()
    await registerPushNotifications(cozyClient, clientInfos)
  }

  const setupAuth = isAuthenticated => () => {
    if (!isAuthenticated()) {
      // TODO: Remove old data, we remove it because it use old cozy-client-js
      // resetClient()
      props.history.replace(`/${AUTH_PATH}`)
      store.dispatch(revokeClient())
    } else {
      onAuthentication()
      const mobileState = store.getState().mobile
      const url = getURL(mobileState)
      setURLContext(url)
      initBar(url, getAccessToken(mobileState), {
        onLogOut: () => {
          onLogout(store, cozyClient, props.history.replace)
        }
      })
    }
  }

  const isAuthenticated = () => {
    return store.getState().mobile.client !== null
  }

  const isRevoked = () => {
    return store.getState().mobile.revoked
  }

  return (
    <Wrapped
      {...props}
      {...{ isAuthenticated, isRevoked, onAuthentication, setupAuth }}
    />
  )
}

const MobileRouter = ({
  router,
  history,
  routes,
  isAuthenticated,
  isRevoked,
  onAuthentication,
  setupAuth
}) => {
  return (
    <Router history={history}>
      <Route>
        <Route
          path={AUTH_PATH}
          component={props => (
            <Authentication
              {...props}
              router={history}
              onComplete={onAuthentication}
              onException={logException}
            />
          )}
        />
        <Route
          onEnter={setupAuth(isAuthenticated, router)}
          component={props => {
            const revoked = isRevoked()
            return revoked ? (
              <Revoked
                {...props}
                router={history}
                revoked={isRevoked()}
                onLogBackIn={onAuthentication}
              />
            ) : (
              props.children
            )
          }}
        >
          {routes}
        </Route>
      </Route>
    </Router>
  )
}

export default withClient(withAuth(MobileRouter))
