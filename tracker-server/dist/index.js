"use strict";

var _app = _interopRequireDefault(require("./app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var PORT = process.env.PORT || 5000;

_app["default"].listen(PORT, function () {
  console.log("Tracker server is currently listening on port ".concat(PORT, "..."));
});