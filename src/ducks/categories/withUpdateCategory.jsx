import React, { Component } from 'react'
import CategoryChoice from './CategoryChoice'
import { getCategoryId } from 'ducks/categories/helpers'
import { withCrud } from 'utils/client'

export default (options = {}) => Wrapped =>
  withCrud(
    class WithUpdateCategoryWrapper extends Component {
      state = {
        displaying: false
      }

      show = ev => {
        ev.stopPropagation() // otherwise the modal is closed immediately
        this.setState({ displaying: true })
      }

      hide = () => {
        this.setState({ displaying: false })
      }

      handleSelect = category => {
        this.hide()
        this.updateCategory(category)
      }

      updateCategory = async category => {
        const { transaction, saveDocument } = this.props

        try {
          const newTransaction = {
            ...transaction,
            manualCategoryId: category.id
          }
          await saveDocument(newTransaction)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log(err)
        }
      }

      render() {
        const { displaying } = this.state
        return (
          <div>
            {!displaying && options.hideDisplaying ? null : (
              <Wrapped {...this.props} showCategoryChoice={this.show} />
            )}
            {displaying && (
              <CategoryChoice
                categoryId={getCategoryId(this.props.transaction)}
                onSelect={this.handleSelect}
                onCancel={this.hide}
              />
            )}
          </div>
        )
      }
    }
  )
