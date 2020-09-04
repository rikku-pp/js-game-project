import React from 'react'
import PropTypes from 'prop-types'

export class DelayMount extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hidden: true }
    this.timout = ''
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.setState({ hidden: false })
    }, this.props.ms)
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  render() {
    return this.state.hidden ? '' : this.props.children
  }
}

DelayMount.propTypes = {
  ms: PropTypes.number.isRequired
}
