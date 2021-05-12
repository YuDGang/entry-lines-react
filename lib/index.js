"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("antd/es/tooltip/style");

var _tooltip = _interopRequireDefault(require("antd/es/tooltip"));

require("antd/es/popover/style");

var _popover2 = _interopRequireDefault(require("antd/es/popover"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = require("react");

var _reactDom = _interopRequireDefault(require("react-dom"));

var _copyToClipboard = _interopRequireDefault(require("copy-to-clipboard"));

var _CopySVG = _interopRequireDefault(require("./Svg/CopySVG"));

var _TickSVG = _interopRequireDefault(require("./Svg/TickSVG"));

require("./index.less");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var tolerance = 2; // In px. Depends on the font you are using

var isEllipsisActive = function isEllipsisActive(e) {
  return e.offsetWidth + tolerance < e.scrollWidth || e.offsetHeight < e.scrollHeight;
};

var _default = function _default(props) {
  var _props$_popover = props._popover,
      _popover = _props$_popover === void 0 ? props.Popover : _props$_popover,
      title = props.title,
      content = props.content,
      className = props.className,
      style = props.style,
      widthLimit = props.widthLimit,
      _props$_lines = props._lines,
      _lines = _props$_lines === void 0 ? props.lines !== 1 && props.lines : _props$_lines,
      children = props.children,
      emptyText = props.emptyText,
      _props$_copyable = props._copyable,
      _copyable = _props$_copyable === void 0 ? props.copyable : _props$_copyable,
      prefix = props.prefix,
      suffix = props.suffix;

  var _useState = (0, _react.useState)(false),
      _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
      hasCopy = _useState2[0],
      setHasCopy = _useState2[1];

  var _useState3 = (0, _react.useState)(false),
      _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
      copyAct = _useState4[0],
      setCopyAct = _useState4[1];

  var elementRef = (0, _react.useRef)();
  (0, _react.useEffect)(function () {
    getFinalElement();
  }, [elementRef.current]);

  var handleCopy = function handleCopy(innerText) {
    (0, _copyToClipboard["default"])(innerText);
    setHasCopy(!hasCopy);
    setTimeout(function () {
      setHasCopy(false);
      setCopyAct(!copyAct);
    }, 1000);
    setTimeout(function () {
      setCopyAct(!copyAct);
    }, 1280);
  };

  var addLines = function addLines(e) {
    Object.assign(e.style, {
      "-webkit-line-clamp": _lines
    });
  };

  var handleVisibleChange = function handleVisibleChange(visible, element) {
    var onVisibleChange = props.onVisibleChange;
    onVisibleChange && onVisibleChange(visible);

    var showIcon = function showIcon() {// console.log(element);
    };

    var hideIcon = function hideIcon() {};

    visible ? showIcon() : hideIcon();
  };

  var getFinalElement = function getFinalElement() {
    // get original element
    var element = elementRef.current;
    if (!element) return; // add lines or not

    _lines && addLines(element); // update element or not

    if (isEllipsisActive(element)) {
      var _element;

      if (_popover) {
        _element = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_popover2["default"], (0, _extends2["default"])({}, props, {
          content: content || children,
          onVisibleChange: function onVisibleChange(visible) {
            return handleVisibleChange(visible, element);
          }
        }), /*#__PURE__*/React.createElement("div", {
          className: element.className,
          style: {
            WebkitLineClamp: _lines
          }
        }, children || content)));
      } else {
        _element = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_tooltip["default"], (0, _extends2["default"])({}, props, {
          title: title || children
        }), /*#__PURE__*/React.createElement("div", {
          className: element.className,
          style: {
            WebkitLineClamp: _lines
          }
        }, children || title)));
      }

      _element && _reactDom["default"].render(_element, element);
    }

    ;
  };

  var isWrap = function isWrap() {
    return _lines ? "ellipsis-wrap" : "ellipsis-nowrap";
  };

  var inner = typeof children === "string" ? children : _popover ? content : title;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    "class": "tnt-ellipsis",
    style: _objectSpread(_objectSpread({}, style), {}, {
      maxWidth: widthLimit
    })
  }, prefix && prefix, /*#__PURE__*/React.createElement("div", {
    ref: elementRef,
    "class": "overflow ".concat(isWrap(), " ").concat(className || "")
  }, children || emptyText), suffix && suffix, inner && _copyable && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_CopySVG["default"], {
    onClick: function onClick() {
      return handleCopy(elementRef.current.innerText);
    },
    className: "".concat(!hasCopy ? "button" : "button-hidden", " ").concat(copyAct ? "button-active" : "")
  }), /*#__PURE__*/React.createElement(_TickSVG["default"], {
    className: hasCopy ? "button" : "button-hidden",
    onClick: function onClick() {
      return handleCopy(elementRef.current.innerText);
    }
  }))));
};

exports["default"] = _default;