import React, { Component } from 'react'
import { withRouter } from 'react-router'
import {
  translate,
  Button,
  Tabs, TabPanels, TabPanel, TabList, Tab
} from 'cozy-ui/react'
import { Topbar } from 'ducks/commons'
import Loading from 'components/Loading'
import { withDispatch } from 'utils'
import BackButton from 'components/BackButton'
import { cozyConnect, fetchDocument, updateDocument, deleteDocument } from 'cozy-client'
import styles from './AccountsSettings.styl'

const AccountSharingDetails = translate()(({ t }) =>
  <div>{t('ComingSoon.title')}</div>)

class _GeneralSettings extends Component {
  state = { modifying: false }

  onClickModify = () => {
    const { account } = this.props
    this.setState({
      modifying: true,
      changes: {
        shortLabel: account.shortLabel || account.label
      }
    })
  }

  onClickRemove = () => {
    const { dispatch, account, router } = this.props
    dispatch(deleteDocument(account)).then(() => {
      router.push('/settings/accounts')
    })
  }

  onClickSave = () => {
    const updatedDoc = {
      // Will disappear when the object come from redux-cozy
      id: this.props.account._id,
      type: 'io.cozy.bank.accounts',
      ...this.props.account,
      ...this.state.changes
    }
    this.props.dispatch(updateDocument(updatedDoc))
    this.setState({modifying: false, changes: null})
  }

  onInputChange = (attribute, ev) => {
    const changes = this.state.changes
    changes[attribute] = ev.target.value
    this.setState({changes})
  }

  render ({t, account}, {modifying}) {
    return (
      <div>
        <table className={styles.AcnStg__info}>
          <tr>
            <td>{t('AccountDetails.label')}</td>
            <td>
              {!modifying && (account.shortLabel || account.label)}
              {modifying &&
                <input
                  value={this.state.changes.shortLabel}
                  onChange={this.onInputChange.bind(null, 'shortLabel')} />}
            </td>
          </tr>
          <tr>
            <td>{t('AccountDetails.institutionLabel')}</td>
            <td>{account.institutionLabel}</td>
          </tr>
          <tr>
            <td>{t('AccountDetails.number')}</td>
            <td>{account.number}</td>
          </tr>
          <tr>
            <td>{t('AccountDetails.type')}</td>
            <td>{t(`AccountDetails.types.${account.type}`)}</td>
          </tr>
        </table>
        <div>
          {/* <Button theme='danger-outline' onClick={this.onClickRemove}>
            Supprimer
          </Button> */}
          {!modifying && <Button theme='regular' onClick={this.onClickModify}>
            Modifier
          </Button>}
          {modifying && <Button theme='regular' onClick={this.onClickSave}>
            Sauver
          </Button>}
        </div>
      </div>
    )
  }
}

const GeneralSettings = withRouter(withDispatch(translate()(_GeneralSettings)))

const AccountSettings = function ({account, onClose, t}) {
  if (!account) {
    return <Loading />
  }
  return (
    <div>
      <BackButton to='/settings/accounts' arrow />
      <Topbar>
        <h2>
          {account.shortLabel || account.label}
        </h2>
      </Topbar>
      <Tabs
        className={styles.AcnStg__tabs}
        initialActiveTab='details'>
        <TabList className={styles.AcnStg__tabList} >
          <Tab className={styles.AcnStg__tab} name='details'>
            {t('AccountSettings.details')}
          </Tab>
          <Tab className={styles.AcnStg__tab} name='sharing'>
            {t('AccountSettings.sharing')}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel name='details'>
            <GeneralSettings account={account} />
          </TabPanel>
          <TabPanel name='sharing'>
            <AccountSharingDetails account={account} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}

const mapDocumentsToProps = function ({routeParams}) {
  return {
    account: fetchDocument('io.cozy.bank.accounts', routeParams.accountId)
  }
}

export default (
  cozyConnect(mapDocumentsToProps)(
    withDispatch(
      translate()(
        AccountSettings
      ))))
