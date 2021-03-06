import { QueryDefinition } from 'cozy-client'

export const RECIPIENT_DOCTYPE = 'io.cozy.mocks.recipients'
export const ACCOUNT_DOCTYPE = 'io.cozy.bank.accounts'
export const GROUP_DOCTYPE = 'io.cozy.bank.groups'
export const TRANSACTION_DOCTYPE = 'io.cozy.bank.operations'
export const SETTINGS_DOCTYPE = 'io.cozy.bank.settings'
export const BILLS_DOCTYPE = 'io.cozy.bills'
export const TRIGGER_DOCTYPE = 'io.cozy.triggers'
export const APP_DOCTYPE = 'io.cozy.apps'

export const offlineDoctypes = [
  ACCOUNT_DOCTYPE,
  GROUP_DOCTYPE,
  TRANSACTION_DOCTYPE,
  SETTINGS_DOCTYPE
]

const batchGetQuery = (client, assoc) => doc => {
  if (!doc[assoc.name]) {
    return null
  }
  const included = doc[assoc.name]
  const ids = included.indexOf(':')
    ? included.map(x => x.split(':')[1])
    : included

  return new QueryDefinition({ doctype: assoc.doctype, ids })
}

export const schema = {
  transactions: {
    doctype: TRANSACTION_DOCTYPE,
    attributes: {},
    relationships: {
      bills: {
        type: 'has-many',
        doctype: BILLS_DOCTYPE,
        query: batchGetQuery
      }
    }
  },
  bills: {
    doctype: BILLS_DOCTYPE
  },
  settings: {
    doctype: SETTINGS_DOCTYPE,
    attributes: {},
    relationships: {}
  },
  accounts: {
    doctype: ACCOUNT_DOCTYPE,
    attributes: {},
    relationships: {}
  },
  groups: {
    doctype: GROUP_DOCTYPE,
    attributes: {},
    relationships: {
      accounts: {
        type: 'has-many-UNSAFE',
        doctype: ACCOUNT_DOCTYPE
      }
    }
  },
  triggers: {
    doctype: TRIGGER_DOCTYPE,
    attributes: {},
    relationships: {}
  },
  apps: {
    doctype: APP_DOCTYPE,
    attributes: {},
    relationships: {}
  }
}

export const accountsConn = {
  query: client => client.all(ACCOUNT_DOCTYPE),
  as: 'accounts'
}

export const groupsConn = {
  query: client => client.all(GROUP_DOCTYPE),
  as: 'groups'
}

export const triggersConn = {
  query: client => client.all(TRIGGER_DOCTYPE),
  as: 'triggers'
}

export const transactionsConn = {
  query: client => client.all(TRANSACTION_DOCTYPE).include(['bills']),
  as: 'transactions'
}

export const appsConn = {
  query: client => client.all(APP_DOCTYPE),
  as: 'apps'
}

export const billsConn = {
  query: client => client.all(BILLS_DOCTYPE),
  as: 'bills'
}

export const settingsConn = {
  query: client => client.all(SETTINGS_DOCTYPE),
  as: 'settings'
}
