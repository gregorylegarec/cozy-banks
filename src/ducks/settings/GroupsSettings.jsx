import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { translate, Button, Icon } from 'cozy-ui/react'
import Table from 'components/Table'
import { groupsConn } from 'doctypes'
import { queryConnect } from 'utils/client'
import Loading from 'components/Loading'
import plus from 'assets/icons/16/plus.svg'
import styles from './GroupsSettings.styl'
import btnStyles from 'styles/buttons.styl'
import { sortBy, flowRight as compose } from 'lodash'
import { isCollectionLoading } from 'utils/client'

const GroupList = compose(withRouter, translate())(({ groups, t, router }) => {
  return groups.length ? (
    <Table className={styles.GrpsStg__table}>
      <thead>
        <tr>
          <th className={styles.GrpsStg__label}>{t('Groups.label')}</th>
          <th className={styles.GrpsStg__accounts}>{t('Groups.accounts')}</th>
        </tr>
      </thead>

      <tbody>
        {groups.map(group => (
          <tr
            key={group._id}
            onClick={() => router.push(`/settings/groups/${group._id}`)}
            className={styles.GrpsStg__row}
          >
            <td className={styles.GrpsStg__label}>{group.label}</td>
            <td className={styles.GrpsStg__accounts}>
              {group.accounts.data
                .map(account => account.shortLabel || account.label)
                .join(', ')}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <p>{t('Groups.no-groups')}</p>
  )
})

const Groups = withRouter(
  class _Groups extends Component {
    render() {
      const { t, groups, router } = this.props
      if (isCollectionLoading(groups)) {
        return <Loading />
      }

      return (
        <div>
          {groups.fetchStatus === 'loading' ? (
            <Loading />
          ) : (
            <GroupList groups={sortBy(groups.data.filter(x => x), 'label')} />
          )}
          <p>
            <Button
              className={btnStyles['btn--no-outline']}
              onClick={() => router.push('/settings/groups/new')}
            >
              <Icon icon={plus} className="u-mr-half" />
              {t('Groups.create')}
            </Button>
          </p>
        </div>
      )
    }
  }
)

export default compose(
  queryConnect({
    groups: groupsConn
  }),
  translate()
)(Groups)
