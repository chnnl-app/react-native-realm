import PropTypes from 'prop-types';
import React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';

function connectRealm(WrappedComponent, options) {
  class ConnectedRealmComponent extends React.Component {
    static contextTypes = {
      reactRealmInstance: PropTypes.object,
    };

    constructor(props, context) {
      super(props, context);

      this.schemaList = options.schemas || [];
      this.results = {};

      this.addListeners(context);
    }

    componentWillReceiveProps(nextProps, nextContext) {
      // if realm changes
      if (
        this.context.reactRealmInstance.path !==
        nextContext.reactRealmInstance.path
      ) {
        this.removeListeners();
        this.addListeners(nextContext);
      }
    }

    componentWillUnmount() {
      this.removeListeners();
    }

    addListeners = context => {
      this.schemaList.forEach(schema => {
        const name = schema
        this.results[name] = context.reactRealmInstance.objects(schema);
        this.results[name].addListener(this.updateViewAfterPollPhase);
      });
    };

    removeListeners = () => {
      this.schemaList.forEach(schema => {
        this.results[schema].removeListener(this.updateViewAfterPollPhase);
      });
      this.results = {};
    };

    getProps = () => {
      if (options && typeof options.mapToProps === 'function') {
        return options.mapToProps(
          this.results,
          this.context.reactRealmInstance,
          this.props,
        );
      }
      return {};
    };

    updateViewAfterPollPhase = () => {
      setImmediate(this.updateView)
    }

    updateView = () => {
      this.forceUpdate();
    };

    render() {
      return <WrappedComponent {...this.getProps()} {...this.props} />;
    }
  }

  hoistNonReactStatic(ConnectedRealmComponent, WrappedComponent);

  return ConnectedRealmComponent;
}

export default connectRealm;
