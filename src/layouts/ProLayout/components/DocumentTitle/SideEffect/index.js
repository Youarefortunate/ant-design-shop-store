import _classCallCheck from 'babel-runtime/helpers/classCallCheck';

/* eslint-disable */
var SideEffect = function SideEffect (_ref) {
  var propsToState = _ref.propsToState,
    handleStateChange = _ref.handleStateChange;

  _classCallCheck(this, SideEffect);

  if (typeof propsToState !== 'function') {
    throw new Error('Expected propsToState to be a function.');
  }
  if (typeof handleStateChange !== 'function') {
    throw new Error('Expected handleStateChange to be a function.');
  }
  this.options = {
    propsToState: propsToState,
    handleStateChange: handleStateChange
  };
};

export default SideEffect;