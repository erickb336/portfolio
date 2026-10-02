var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length2(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length2;
    ucs2length2.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// server/workstation/schema-validator.js
var import_ucs2length = __toESM(require_ucs2length(), 1);
var validateRoot = validate20;
var pattern4 = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$", "u");
var pattern5 = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$", "u");
var pattern6 = new RegExp("^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$", "u");
var func1 = import_ucs2length.default.default;
var schema36 = { "type": "object", "additionalProperties": false, "required": ["active", "coverage"], "properties": { "active": { "description": "Agents with a running turn now. Agents that wait for the user do not count.", "type": ["integer", "null"], "minimum": 0, "maximum": 1e3 }, "coverage": { "$ref": "#/$defs/coverage" } }, "if": { "properties": { "coverage": { "const": "unavailable" } } }, "then": { "properties": { "active": { "type": "null" } } }, "else": { "properties": { "active": { "type": "integer" } } } };
var schema37 = { "description": "complete: every configured source reported. partial: some configured sources reported, so numbers are a known subtotal (a lower bound). unavailable: no configured source reported, so numbers are null.", "enum": ["complete", "partial", "unavailable"] };
function validate22(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate22.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs1 = errors;
  let valid0 = true;
  const _errs2 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.coverage !== void 0) {
      if ("unavailable" !== data.coverage) {
        const err0 = {};
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
  }
  var _valid0 = _errs2 === errors;
  errors = _errs1;
  if (vErrors !== null) {
    if (_errs1) {
      vErrors.length = _errs1;
    } else {
      vErrors = null;
    }
  }
  let ifClause0;
  if (_valid0) {
    const _errs4 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.active !== void 0) {
        if (data.active !== null) {
          const err1 = { instancePath: instancePath + "/active", schemaPath: "#/then/properties/active/type", keyword: "type", params: { type: "null" }, message: "must be null" };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      }
    }
    var _valid0 = _errs4 === errors;
    valid0 = _valid0;
    if (valid0) {
      var props0 = {};
      props0.active = true;
      props0.coverage = true;
    }
    ifClause0 = "then";
  } else {
    const _errs7 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.active !== void 0) {
        let data2 = data.active;
        if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
          const err2 = { instancePath: instancePath + "/active", schemaPath: "#/else/properties/active/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      }
    }
    var _valid0 = _errs7 === errors;
    valid0 = _valid0;
    if (valid0) {
      if (props0 !== true) {
        props0 = props0 || {};
        props0.active = true;
      }
    }
    ifClause0 = "else";
  }
  if (!valid0) {
    const err3 = { instancePath, schemaPath: "#/if", keyword: "if", params: { failingKeyword: ifClause0 }, message: 'must match "' + ifClause0 + '" schema' };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.active === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "active" }, message: "must have required property 'active'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.coverage === void 0) {
      const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "coverage" }, message: "must have required property 'coverage'" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "active" || key0 === "coverage")) {
        const err6 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.active !== void 0) {
      let data3 = data.active;
      if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3)) && data3 !== null) {
        const err7 = { instancePath: instancePath + "/active", schemaPath: "#/properties/active/type", keyword: "type", params: { type: schema36.properties.active.type }, message: "must be integer,null" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      if (typeof data3 == "number" && isFinite(data3)) {
        if (data3 > 1e3 || isNaN(data3)) {
          const err8 = { instancePath: instancePath + "/active", schemaPath: "#/properties/active/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (data3 < 0 || isNaN(data3)) {
          const err9 = { instancePath: instancePath + "/active", schemaPath: "#/properties/active/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      }
    }
    if (data.coverage !== void 0) {
      let data4 = data.coverage;
      if (!(data4 === "complete" || data4 === "partial" || data4 === "unavailable")) {
        const err10 = { instancePath: instancePath + "/coverage", schemaPath: "#/$defs/coverage/enum", keyword: "enum", params: { allowedValues: schema37.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
  } else {
    const err11 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate22.errors = vErrors;
  return errors === 0;
}
validate22.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema39 = { "type": ["integer", "null"], "minimum": 0, "maximum": 1e12 };
function validate24(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate24.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs1 = errors;
  let valid0 = true;
  const _errs2 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.coverage !== void 0) {
      if ("unavailable" !== data.coverage) {
        const err0 = {};
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
  }
  var _valid0 = _errs2 === errors;
  errors = _errs1;
  if (vErrors !== null) {
    if (_errs1) {
      vErrors.length = _errs1;
    } else {
      vErrors = null;
    }
  }
  let ifClause0;
  if (_valid0) {
    const _errs4 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.input !== void 0) {
        if (data.input !== null) {
          const err1 = { instancePath: instancePath + "/input", schemaPath: "#/then/properties/input/type", keyword: "type", params: { type: "null" }, message: "must be null" };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      }
      if (data.cachedInput !== void 0) {
        if (data.cachedInput !== null) {
          const err2 = { instancePath: instancePath + "/cachedInput", schemaPath: "#/then/properties/cachedInput/type", keyword: "type", params: { type: "null" }, message: "must be null" };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      }
      if (data.output !== void 0) {
        if (data.output !== null) {
          const err3 = { instancePath: instancePath + "/output", schemaPath: "#/then/properties/output/type", keyword: "type", params: { type: "null" }, message: "must be null" };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      }
      if (data.total !== void 0) {
        if (data.total !== null) {
          const err4 = { instancePath: instancePath + "/total", schemaPath: "#/then/properties/total/type", keyword: "type", params: { type: "null" }, message: "must be null" };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      }
    }
    var _valid0 = _errs4 === errors;
    valid0 = _valid0;
    if (valid0) {
      var props0 = {};
      props0.input = true;
      props0.cachedInput = true;
      props0.output = true;
      props0.total = true;
      props0.coverage = true;
    }
    ifClause0 = "then";
  } else {
    const _errs13 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.input !== void 0) {
        let data5 = data.input;
        if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
          const err5 = { instancePath: instancePath + "/input", schemaPath: "#/else/properties/input/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      }
      if (data.cachedInput !== void 0) {
        let data6 = data.cachedInput;
        if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
          const err6 = { instancePath: instancePath + "/cachedInput", schemaPath: "#/else/properties/cachedInput/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      }
      if (data.output !== void 0) {
        let data7 = data.output;
        if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
          const err7 = { instancePath: instancePath + "/output", schemaPath: "#/else/properties/output/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      }
      if (data.total !== void 0) {
        let data8 = data.total;
        if (!(typeof data8 == "number" && (!(data8 % 1) && !isNaN(data8)) && isFinite(data8))) {
          const err8 = { instancePath: instancePath + "/total", schemaPath: "#/else/properties/total/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      }
    }
    var _valid0 = _errs13 === errors;
    valid0 = _valid0;
    if (valid0) {
      if (props0 !== true) {
        props0 = props0 || {};
        props0.input = true;
        props0.cachedInput = true;
        props0.output = true;
        props0.total = true;
      }
    }
    ifClause0 = "else";
  }
  if (!valid0) {
    const err9 = { instancePath, schemaPath: "#/if", keyword: "if", params: { failingKeyword: ifClause0 }, message: 'must match "' + ifClause0 + '" schema' };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.input === void 0) {
      const err10 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "input" }, message: "must have required property 'input'" };
      if (vErrors === null) {
        vErrors = [err10];
      } else {
        vErrors.push(err10);
      }
      errors++;
    }
    if (data.cachedInput === void 0) {
      const err11 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "cachedInput" }, message: "must have required property 'cachedInput'" };
      if (vErrors === null) {
        vErrors = [err11];
      } else {
        vErrors.push(err11);
      }
      errors++;
    }
    if (data.output === void 0) {
      const err12 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "output" }, message: "must have required property 'output'" };
      if (vErrors === null) {
        vErrors = [err12];
      } else {
        vErrors.push(err12);
      }
      errors++;
    }
    if (data.total === void 0) {
      const err13 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "total" }, message: "must have required property 'total'" };
      if (vErrors === null) {
        vErrors = [err13];
      } else {
        vErrors.push(err13);
      }
      errors++;
    }
    if (data.coverage === void 0) {
      const err14 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "coverage" }, message: "must have required property 'coverage'" };
      if (vErrors === null) {
        vErrors = [err14];
      } else {
        vErrors.push(err14);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "input" || key0 === "cachedInput" || key0 === "output" || key0 === "total" || key0 === "coverage")) {
        const err15 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.input !== void 0) {
      let data9 = data.input;
      if (!(typeof data9 == "number" && (!(data9 % 1) && !isNaN(data9)) && isFinite(data9)) && data9 !== null) {
        const err16 = { instancePath: instancePath + "/input", schemaPath: "#/$defs/tokenCount/type", keyword: "type", params: { type: schema39.type }, message: "must be integer,null" };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
      if (typeof data9 == "number" && isFinite(data9)) {
        if (data9 > 1e12 || isNaN(data9)) {
          const err17 = { instancePath: instancePath + "/input", schemaPath: "#/$defs/tokenCount/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e12 }, message: "must be <= 1000000000000" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data9 < 0 || isNaN(data9)) {
          const err18 = { instancePath: instancePath + "/input", schemaPath: "#/$defs/tokenCount/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
      }
    }
    if (data.cachedInput !== void 0) {
      let data10 = data.cachedInput;
      if (!(typeof data10 == "number" && (!(data10 % 1) && !isNaN(data10)) && isFinite(data10)) && data10 !== null) {
        const err19 = { instancePath: instancePath + "/cachedInput", schemaPath: "#/$defs/tokenCount/type", keyword: "type", params: { type: schema39.type }, message: "must be integer,null" };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
      if (typeof data10 == "number" && isFinite(data10)) {
        if (data10 > 1e12 || isNaN(data10)) {
          const err20 = { instancePath: instancePath + "/cachedInput", schemaPath: "#/$defs/tokenCount/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e12 }, message: "must be <= 1000000000000" };
          if (vErrors === null) {
            vErrors = [err20];
          } else {
            vErrors.push(err20);
          }
          errors++;
        }
        if (data10 < 0 || isNaN(data10)) {
          const err21 = { instancePath: instancePath + "/cachedInput", schemaPath: "#/$defs/tokenCount/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      }
    }
    if (data.output !== void 0) {
      let data11 = data.output;
      if (!(typeof data11 == "number" && (!(data11 % 1) && !isNaN(data11)) && isFinite(data11)) && data11 !== null) {
        const err22 = { instancePath: instancePath + "/output", schemaPath: "#/$defs/tokenCount/type", keyword: "type", params: { type: schema39.type }, message: "must be integer,null" };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
      if (typeof data11 == "number" && isFinite(data11)) {
        if (data11 > 1e12 || isNaN(data11)) {
          const err23 = { instancePath: instancePath + "/output", schemaPath: "#/$defs/tokenCount/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e12 }, message: "must be <= 1000000000000" };
          if (vErrors === null) {
            vErrors = [err23];
          } else {
            vErrors.push(err23);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err24 = { instancePath: instancePath + "/output", schemaPath: "#/$defs/tokenCount/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
      }
    }
    if (data.total !== void 0) {
      let data12 = data.total;
      if (!(typeof data12 == "number" && (!(data12 % 1) && !isNaN(data12)) && isFinite(data12)) && data12 !== null) {
        const err25 = { instancePath: instancePath + "/total", schemaPath: "#/$defs/tokenCount/type", keyword: "type", params: { type: schema39.type }, message: "must be integer,null" };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
      if (typeof data12 == "number" && isFinite(data12)) {
        if (data12 > 1e12 || isNaN(data12)) {
          const err26 = { instancePath: instancePath + "/total", schemaPath: "#/$defs/tokenCount/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e12 }, message: "must be <= 1000000000000" };
          if (vErrors === null) {
            vErrors = [err26];
          } else {
            vErrors.push(err26);
          }
          errors++;
        }
        if (data12 < 0 || isNaN(data12)) {
          const err27 = { instancePath: instancePath + "/total", schemaPath: "#/$defs/tokenCount/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          if (vErrors === null) {
            vErrors = [err27];
          } else {
            vErrors.push(err27);
          }
          errors++;
        }
      }
    }
    if (data.coverage !== void 0) {
      let data13 = data.coverage;
      if (!(data13 === "complete" || data13 === "partial" || data13 === "unavailable")) {
        const err28 = { instancePath: instancePath + "/coverage", schemaPath: "#/$defs/coverage/enum", keyword: "enum", params: { allowedValues: schema37.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
    }
  } else {
    const err29 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err29];
    } else {
      vErrors.push(err29);
    }
    errors++;
  }
  validate24.errors = vErrors;
  return errors === 0;
}
validate24.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate21(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate21.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.schemaVersion === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "schemaVersion" }, message: "must have required property 'schemaVersion'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.type === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.observedAt === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "observedAt" }, message: "must have required property 'observedAt'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.ttlSeconds === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ttlSeconds" }, message: "must have required property 'ttlSeconds'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.usageDate === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "usageDate" }, message: "must have required property 'usageDate'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.timeZone === void 0) {
      const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "timeZone" }, message: "must have required property 'timeZone'" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.agents === void 0) {
      const err6 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "agents" }, message: "must have required property 'agents'" };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.tokens === void 0) {
      const err7 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "tokens" }, message: "must have required property 'tokens'" };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "schemaVersion" || key0 === "type" || key0 === "observedAt" || key0 === "ttlSeconds" || key0 === "usageDate" || key0 === "timeZone" || key0 === "agents" || key0 === "tokens")) {
        const err8 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.schemaVersion !== void 0) {
      if (1 !== data.schemaVersion) {
        const err9 = { instancePath: instancePath + "/schemaVersion", schemaPath: "#/properties/schemaVersion/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.type !== void 0) {
      if ("heartbeat" !== data.type) {
        const err10 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "heartbeat" }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.observedAt !== void 0) {
      let data2 = data.observedAt;
      if (typeof data2 === "string") {
        if (!pattern4.test(data2)) {
          const err11 = { instancePath: instancePath + "/observedAt", schemaPath: "#/$defs/timestamp/pattern", keyword: "pattern", params: { pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$" }, message: 'must match pattern "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$"' };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = { instancePath: instancePath + "/observedAt", schemaPath: "#/$defs/timestamp/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.ttlSeconds !== void 0) {
      let data3 = data.ttlSeconds;
      if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
        const err13 = { instancePath: instancePath + "/ttlSeconds", schemaPath: "#/properties/ttlSeconds/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      if (typeof data3 == "number" && isFinite(data3)) {
        if (data3 > 600 || isNaN(data3)) {
          const err14 = { instancePath: instancePath + "/ttlSeconds", schemaPath: "#/properties/ttlSeconds/maximum", keyword: "maximum", params: { comparison: "<=", limit: 600 }, message: "must be <= 600" };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        if (data3 < 0 || isNaN(data3)) {
          const err15 = { instancePath: instancePath + "/ttlSeconds", schemaPath: "#/properties/ttlSeconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
      }
    }
    if (data.usageDate !== void 0) {
      let data4 = data.usageDate;
      if (typeof data4 === "string") {
        if (!pattern5.test(data4)) {
          const err16 = { instancePath: instancePath + "/usageDate", schemaPath: "#/$defs/usageDate/pattern", keyword: "pattern", params: { pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" }, message: 'must match pattern "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"' };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = { instancePath: instancePath + "/usageDate", schemaPath: "#/$defs/usageDate/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.timeZone !== void 0) {
      let data5 = data.timeZone;
      if (typeof data5 === "string") {
        if (func1(data5) > 64) {
          const err18 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/maxLength", keyword: "maxLength", params: { limit: 64 }, message: "must NOT have more than 64 characters" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (!pattern6.test(data5)) {
          const err19 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$" }, message: 'must match pattern "^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$"' };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.agents !== void 0) {
      if (!validate22(data.agents, { instancePath: instancePath + "/agents", parentData: data, parentDataProperty: "agents", rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
        errors = vErrors.length;
      }
    }
    if (data.tokens !== void 0) {
      if (!validate24(data.tokens, { instancePath: instancePath + "/tokens", parentData: data, parentDataProperty: "tokens", rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err21 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err21];
    } else {
      vErrors.push(err21);
    }
    errors++;
  }
  validate21.errors = vErrors;
  return errors === 0;
}
validate21.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate27(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate27.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.schemaVersion === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "schemaVersion" }, message: "must have required property 'schemaVersion'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.type === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.observedAt === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "observedAt" }, message: "must have required property 'observedAt'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.usageDate === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "usageDate" }, message: "must have required property 'usageDate'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.timeZone === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "timeZone" }, message: "must have required property 'timeZone'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.tokens === void 0) {
      const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "tokens" }, message: "must have required property 'tokens'" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "schemaVersion" || key0 === "type" || key0 === "observedAt" || key0 === "usageDate" || key0 === "timeZone" || key0 === "tokens")) {
        const err6 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.schemaVersion !== void 0) {
      if (1 !== data.schemaVersion) {
        const err7 = { instancePath: instancePath + "/schemaVersion", schemaPath: "#/properties/schemaVersion/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.type !== void 0) {
      if ("dailyUsage" !== data.type) {
        const err8 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "dailyUsage" }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.observedAt !== void 0) {
      let data2 = data.observedAt;
      if (typeof data2 === "string") {
        if (!pattern4.test(data2)) {
          const err9 = { instancePath: instancePath + "/observedAt", schemaPath: "#/$defs/timestamp/pattern", keyword: "pattern", params: { pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$" }, message: 'must match pattern "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$"' };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = { instancePath: instancePath + "/observedAt", schemaPath: "#/$defs/timestamp/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.usageDate !== void 0) {
      let data3 = data.usageDate;
      if (typeof data3 === "string") {
        if (!pattern5.test(data3)) {
          const err11 = { instancePath: instancePath + "/usageDate", schemaPath: "#/$defs/usageDate/pattern", keyword: "pattern", params: { pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" }, message: 'must match pattern "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"' };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = { instancePath: instancePath + "/usageDate", schemaPath: "#/$defs/usageDate/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.timeZone !== void 0) {
      let data4 = data.timeZone;
      if (typeof data4 === "string") {
        if (func1(data4) > 64) {
          const err13 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/maxLength", keyword: "maxLength", params: { limit: 64 }, message: "must NOT have more than 64 characters" };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (!pattern6.test(data4)) {
          const err14 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$" }, message: 'must match pattern "^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$"' };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      } else {
        const err15 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.tokens !== void 0) {
      if (!validate24(data.tokens, { instancePath: instancePath + "/tokens", parentData: data, parentDataProperty: "tokens", rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err16 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate27.errors = vErrors;
  return errors === 0;
}
validate27.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate20(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate21(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs2 = errors;
  if (!validate27(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate20.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate20.evaluated = { "dynamicProps": true, "dynamicItems": false };
var validateHeartbeat = validate30;
function validate30(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate30.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.schemaVersion === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "schemaVersion" }, message: "must have required property 'schemaVersion'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.type === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.observedAt === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "observedAt" }, message: "must have required property 'observedAt'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.ttlSeconds === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ttlSeconds" }, message: "must have required property 'ttlSeconds'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.usageDate === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "usageDate" }, message: "must have required property 'usageDate'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.timeZone === void 0) {
      const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "timeZone" }, message: "must have required property 'timeZone'" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.agents === void 0) {
      const err6 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "agents" }, message: "must have required property 'agents'" };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.tokens === void 0) {
      const err7 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "tokens" }, message: "must have required property 'tokens'" };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "schemaVersion" || key0 === "type" || key0 === "observedAt" || key0 === "ttlSeconds" || key0 === "usageDate" || key0 === "timeZone" || key0 === "agents" || key0 === "tokens")) {
        const err8 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.schemaVersion !== void 0) {
      if (1 !== data.schemaVersion) {
        const err9 = { instancePath: instancePath + "/schemaVersion", schemaPath: "#/properties/schemaVersion/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.type !== void 0) {
      if ("heartbeat" !== data.type) {
        const err10 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "heartbeat" }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.observedAt !== void 0) {
      let data2 = data.observedAt;
      if (typeof data2 === "string") {
        if (!pattern4.test(data2)) {
          const err11 = { instancePath: instancePath + "/observedAt", schemaPath: "#/$defs/timestamp/pattern", keyword: "pattern", params: { pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$" }, message: 'must match pattern "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$"' };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = { instancePath: instancePath + "/observedAt", schemaPath: "#/$defs/timestamp/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.ttlSeconds !== void 0) {
      let data3 = data.ttlSeconds;
      if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
        const err13 = { instancePath: instancePath + "/ttlSeconds", schemaPath: "#/properties/ttlSeconds/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      if (typeof data3 == "number" && isFinite(data3)) {
        if (data3 > 600 || isNaN(data3)) {
          const err14 = { instancePath: instancePath + "/ttlSeconds", schemaPath: "#/properties/ttlSeconds/maximum", keyword: "maximum", params: { comparison: "<=", limit: 600 }, message: "must be <= 600" };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        if (data3 < 0 || isNaN(data3)) {
          const err15 = { instancePath: instancePath + "/ttlSeconds", schemaPath: "#/properties/ttlSeconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
      }
    }
    if (data.usageDate !== void 0) {
      let data4 = data.usageDate;
      if (typeof data4 === "string") {
        if (!pattern5.test(data4)) {
          const err16 = { instancePath: instancePath + "/usageDate", schemaPath: "#/$defs/usageDate/pattern", keyword: "pattern", params: { pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" }, message: 'must match pattern "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"' };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = { instancePath: instancePath + "/usageDate", schemaPath: "#/$defs/usageDate/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.timeZone !== void 0) {
      let data5 = data.timeZone;
      if (typeof data5 === "string") {
        if (func1(data5) > 64) {
          const err18 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/maxLength", keyword: "maxLength", params: { limit: 64 }, message: "must NOT have more than 64 characters" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (!pattern6.test(data5)) {
          const err19 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$" }, message: 'must match pattern "^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$"' };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.agents !== void 0) {
      if (!validate22(data.agents, { instancePath: instancePath + "/agents", parentData: data, parentDataProperty: "agents", rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
        errors = vErrors.length;
      }
    }
    if (data.tokens !== void 0) {
      if (!validate24(data.tokens, { instancePath: instancePath + "/tokens", parentData: data, parentDataProperty: "tokens", rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err21 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err21];
    } else {
      vErrors.push(err21);
    }
    errors++;
  }
  validate30.errors = vErrors;
  return errors === 0;
}
validate30.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var validateDailyUsage = validate33;
function validate33(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate33.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.schemaVersion === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "schemaVersion" }, message: "must have required property 'schemaVersion'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.type === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.observedAt === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "observedAt" }, message: "must have required property 'observedAt'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.usageDate === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "usageDate" }, message: "must have required property 'usageDate'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.timeZone === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "timeZone" }, message: "must have required property 'timeZone'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.tokens === void 0) {
      const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "tokens" }, message: "must have required property 'tokens'" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "schemaVersion" || key0 === "type" || key0 === "observedAt" || key0 === "usageDate" || key0 === "timeZone" || key0 === "tokens")) {
        const err6 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.schemaVersion !== void 0) {
      if (1 !== data.schemaVersion) {
        const err7 = { instancePath: instancePath + "/schemaVersion", schemaPath: "#/properties/schemaVersion/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.type !== void 0) {
      if ("dailyUsage" !== data.type) {
        const err8 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "dailyUsage" }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.observedAt !== void 0) {
      let data2 = data.observedAt;
      if (typeof data2 === "string") {
        if (!pattern4.test(data2)) {
          const err9 = { instancePath: instancePath + "/observedAt", schemaPath: "#/$defs/timestamp/pattern", keyword: "pattern", params: { pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$" }, message: 'must match pattern "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$"' };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = { instancePath: instancePath + "/observedAt", schemaPath: "#/$defs/timestamp/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.usageDate !== void 0) {
      let data3 = data.usageDate;
      if (typeof data3 === "string") {
        if (!pattern5.test(data3)) {
          const err11 = { instancePath: instancePath + "/usageDate", schemaPath: "#/$defs/usageDate/pattern", keyword: "pattern", params: { pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" }, message: 'must match pattern "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"' };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = { instancePath: instancePath + "/usageDate", schemaPath: "#/$defs/usageDate/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.timeZone !== void 0) {
      let data4 = data.timeZone;
      if (typeof data4 === "string") {
        if (func1(data4) > 64) {
          const err13 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/maxLength", keyword: "maxLength", params: { limit: 64 }, message: "must NOT have more than 64 characters" };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (!pattern6.test(data4)) {
          const err14 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$" }, message: 'must match pattern "^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$"' };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      } else {
        const err15 = { instancePath: instancePath + "/timeZone", schemaPath: "#/$defs/timeZone/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.tokens !== void 0) {
      if (!validate24(data.tokens, { instancePath: instancePath + "/tokens", parentData: data, parentDataProperty: "tokens", rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err16 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate33.errors = vErrors;
  return errors === 0;
}
validate33.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };

// server/workstation/validate.js
var SCHEMA_VERSION = 1;
var MAX_ERRORS = 20;
var validateByType = { heartbeat: validateHeartbeat, dailyUsage: validateDailyUsage };
function validateMessage(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return fail(["/: type"]);
  const record = (
    /** @type {Record<string, unknown>} */
    value
  );
  if ("schemaVersion" in record && record.schemaVersion !== SCHEMA_VERSION) return fail(["/schemaVersion: unsupported"]);
  const type = record.type;
  if (type !== "heartbeat" && type !== "dailyUsage") return fail([type === void 0 ? "/: required type" : "/type: unknown"]);
  if (!validateRoot(value)) {
    const branch = validateByType[type];
    branch(value);
    return fail(schemaErrors(branch.errors ?? validateRoot.errors ?? []));
  }
  const message = (
    /** @type {Message} */
    value
  );
  const errors = consistencyErrors(message);
  return errors.length ? fail(errors) : { ok: true, message };
}
function consistencyErrors(m) {
  const errors = [];
  const t = m.tokens;
  if (t.total !== null && t.input !== null && t.output !== null && t.total !== t.input + t.output) {
    errors.push("/tokens/total: not_input_plus_output");
  }
  if (t.cachedInput !== null && t.input !== null && t.cachedInput > t.input) {
    errors.push("/tokens/cachedInput: exceeds_input");
  }
  const observedMs = strictTime(m.observedAt);
  if (observedMs === null) errors.push("/observedAt: invalid_time");
  if (!isCalendarDate(m.usageDate)) errors.push("/usageDate: invalid_date");
  if (!isKnownTimeZone(m.timeZone)) errors.push("/timeZone: unknown");
  if (errors.length) return errors;
  const observedDate = dateIn(
    /** @type {number} */
    observedMs,
    m.timeZone
  );
  if (m.type === "heartbeat" && m.usageDate !== observedDate) errors.push("/usageDate: not_observed_date");
  if (m.type === "dailyUsage" && m.usageDate > observedDate) errors.push("/usageDate: future");
  return errors;
}
function strictTime(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const [whole, fraction = ""] = iso.slice(0, -1).split(".");
  return new Date(t).toISOString() === `${whole}.${fraction.padEnd(3, "0")}Z` ? t : null;
}
function isCalendarDate(date) {
  const t = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === date;
}
var dateFormatters = /* @__PURE__ */ new Map();
function dateIn(epochMs, timeZone) {
  let f = dateFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    if (dateFormatters.size < 64) dateFormatters.set(timeZone, f);
  }
  return f.format(epochMs);
}
function isKnownTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}
function schemaErrors(ajvErrors) {
  const codes = /* @__PURE__ */ new Set();
  for (const e of ajvErrors) {
    if (e.keyword === "if") continue;
    const path = e.instancePath || "/";
    codes.add(e.keyword === "required" ? `${path}: required ${e.params.missingProperty}` : `${path}: ${e.keyword}`);
  }
  return codes.size ? [...codes] : ["/: invalid"];
}
function fail(errors) {
  return { ok: false, errors: errors.slice(0, MAX_ERRORS) };
}

// server/workstation/index.js
var ZONE = "America/Los_Angeles";
var headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
var reply = (error, status, extra = {}) => Response.json({ error }, { status, headers: { ...headers, ...extra } });
var tokens = (row) => ({ usageDate: row.usage_date, total: row.total, input: row.input, cachedInput: row.cached_input, output: row.output, coverage: row.coverage });
async function authorized(request, expected) {
  const match = /^Bearer ([^\s]+)$/i.exec(request.headers.get("authorization") || "");
  if (!match || match[1].length > 1024) return false;
  const actual = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(match[1]));
  const digest = Uint8Array.from(expected.match(/../g), (s) => parseInt(s, 16));
  if (crypto.subtle.timingSafeEqual) return crypto.subtle.timingSafeEqual(actual, digest);
  const key2 = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  const signature = await crypto.subtle.sign("HMAC", key2, actual);
  return crypto.subtle.verify("HMAC", key2, signature, digest);
}
async function readBody(request) {
  if (Number(request.headers.get("content-length")) > 4096) return { error: "too_large", status: 413 };
  const reader = request.body?.getReader();
  if (!reader) return { error: "invalid", status: 400 };
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4096) {
        await reader.cancel();
        return { error: "too_large", status: 413 };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return { value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) };
  } catch {
    return { error: "invalid", status: 400 };
  } finally {
    reader.releaseLock();
  }
}
async function permit(db, now2) {
  return db.prepare(`INSERT INTO workstation_rate(id,events) VALUES(1,json_array(?1))
    ON CONFLICT(id) DO UPDATE SET events=(SELECT json_group_array(value) FROM
      (SELECT value FROM json_each(workstation_rate.events) WHERE value>?2 UNION ALL SELECT ?1))
    WHERE (SELECT count(*) FROM json_each(workstation_rate.events) WHERE value>?2)<10
    RETURNING id`).bind(now2, now2 - 1e3).first();
}
var dailySql = `INSERT INTO workstation_daily(usage_date,input,cached_input,output,total,coverage,observed_at_ms,received_at_ms)
 SELECT ?1,?2,?3,?4,?5,?6,?7,?8 WHERE `;
var dailyUpdate = ` ON CONFLICT(usage_date) DO UPDATE SET input=excluded.input,cached_input=excluded.cached_input,
 output=excluded.output,total=excluded.total,coverage=excluded.coverage,observed_at_ms=excluded.observed_at_ms,
 received_at_ms=excluded.received_at_ms WHERE excluded.observed_at_ms>workstation_daily.observed_at_ms RETURNING usage_date`;
async function store(db, m, now2) {
  const observed = Date.parse(m.observedAt), t = m.tokens;
  const args = [m.usageDate, t.input, t.cachedInput, t.output, t.total, t.coverage, observed, now2];
  if (m.type === "dailyUsage") return Boolean(await db.prepare(dailySql + "1" + dailyUpdate).bind(...args).first());
  const live = db.prepare(`INSERT INTO workstation_live(id,observed_at_ms,received_at_ms,lease_until_ms,agents_active,agents_coverage)
    VALUES(1,?1,?2,?3,?4,?5) ON CONFLICT(id) DO UPDATE SET observed_at_ms=excluded.observed_at_ms,
    received_at_ms=excluded.received_at_ms,lease_until_ms=excluded.lease_until_ms,agents_active=excluded.agents_active,
    agents_coverage=excluded.agents_coverage WHERE excluded.observed_at_ms>workstation_live.observed_at_ms RETURNING id`).bind(observed, now2, now2 + Math.min(m.ttlSeconds, 300) * 1e3, m.agents.active, m.agents.coverage);
  const daily = db.prepare(dailySql + "changes()=1" + dailyUpdate).bind(...args);
  const results = await db.batch([live, daily]);
  return results[0].results.length > 0;
}
async function snapshot(db, now2) {
  const rows = await db.batch([
    db.prepare("SELECT * FROM workstation_live WHERE id=1"),
    db.prepare("SELECT * FROM workstation_daily WHERE usage_date=?").bind(dateIn(now2, ZONE))
  ]);
  const live = rows[0].results[0], day = rows[1].results[0];
  const connected = Boolean(live && live.lease_until_ms > now2);
  const agents = connected ? { active: live.agents_active, coverage: live.agents_coverage } : { active: null, coverage: "unavailable" };
  return {
    schemaVersion: 1,
    status: connected && agents.active >= 1 ? "online" : "offline",
    tracker: !live ? "never" : connected ? "connected" : "disconnected",
    agents,
    tokensToday: day ? tokens(day) : null,
    lastHeartbeatAt: live ? new Date(live.received_at_ms).toISOString() : null,
    asOf: new Date(now2).toISOString()
  };
}
async function handleWorkstation(request, env, now2 = Date.now()) {
  const path = new URL(request.url).pathname;
  if (!path.startsWith("/api/workstation/")) return null;
  if (!(path === "/api/workstation/status" && request.method === "GET" || path === "/api/workstation/heartbeat" && request.method === "POST")) return reply("not_found", 404);
  try {
    if (!env.DB) return reply("temporarily_unavailable", 503);
    if (path.endsWith("/status")) return Response.json(await snapshot(env.DB, now2), { headers });
    const hash = env.WORKSTATION_INGEST_SECRET_SHA256;
    if (typeof hash !== "string" || !/^[a-f0-9]{64}$/i.test(hash)) return reply("not_configured", 503);
    if (!await authorized(request, hash)) return reply("unauthorized", 401);
    if (!await permit(env.DB, now2)) return reply("rate_limited", 429, { "Retry-After": "1" });
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return reply("unsupported_media_type", 415);
    const body = await readBody(request);
    if (body.error) return reply(body.error, body.status);
    const result = validateMessage(body.value);
    if (!result.ok) return Response.json({ error: "invalid", details: result.errors }, { status: 400, headers });
    const m = result.message;
    if (m.timeZone !== ZONE) return Response.json({ error: "invalid", details: ["/timeZone: not_receiver_zone"] }, { status: 400, headers });
    if (Math.abs(Date.parse(m.observedAt) - now2) > 12e4) return reply("clock_skew", 422);
    if (!await store(env.DB, m, now2)) return reply("stale", 409);
    return new Response(null, { status: 204, headers });
  } catch {
    console.error(JSON.stringify({ event: "workstation_unavailable" }));
    return reply("temporarily_unavailable", 503);
  }
}

// server/github.js
async function githubContributions(request, ctx) {
  let cache;
  const key2 = new Request(new URL("/api/github/contributions", request.url));
  try {
    cache = await globalThis.caches?.open("portfolio-github-contributions-v1");
    const cached = cache && await cache.match(key2);
    if (cached) return cached;
  } catch {
  }
  try {
    const response = await fetch("https://github.com/users/erickb336/contributions", { headers: { "User-Agent": "ErickPortfolio", "Accept": "text/html" }, signal: AbortSignal.timeout(8e3) });
    if (!response.ok) throw new Error("Unavailable");
    const html2 = await response.text();
    const tips = new Map([...html2.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>(.*?)<\/tool-tip>/gs)].map((m) => [m[1], m[2].replace(/<[^>]+>/g, "").trim()]));
    const days = [...html2.matchAll(/<td[^>]*data-date[^>]*>/g)].map(([tag]) => {
      const attrs = Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
      const tip = tips.get(attrs.id);
      if (!tip) throw new Error("Incomplete calendar");
      const count = tip.match(/^([\d,]+) contribution/);
      return { date: attrs["data-date"], level: Number(attrs["data-level"]), count: count ? Number(count[1].replaceAll(",", "")) : 0 };
    }).sort((a, b) => a.date.localeCompare(b.date));
    if (days.length < 350 || days.length > 380 || days.some((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !Number.isInteger(d.count) || d.level < 0 || d.level > 4)) throw new Error("Invalid calendar");
    const result = Response.json({ days, total: days.reduce((n, d) => n + d.count, 0), updated: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=21600" } });
    if (cache) ctx.waitUntil(Promise.resolve().then(() => cache.put(key2, result.clone())).catch(() => {
    }));
    return result;
  } catch {
    return Response.json({ error: "calendar_unavailable" }, { status: 503 });
  }
}

// server/strava.js
var ORIGIN = "https://erickbenitez.com";
var API = "https://www.strava.com/api/v3";
var TYPES = /* @__PURE__ */ new Set(["Run", "TrailRun", "VirtualRun", "Walk", "WeightTraining"]);
var encoder = new TextEncoder();
var now = () => Math.floor(Date.now() / 1e3);
var encode = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
var decode = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
var reply2 = (body, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
var logFailure = () => console.error(JSON.stringify({ event: "strava_operation_failed" }));
async function key(env) {
  if (!env.STRAVA_ENCRYPTION_KEY) throw new Error("Strava not configured");
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(env.STRAVA_ENCRYPTION_KEY));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function seal(env, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(env), encoder.encode(JSON.stringify(value)));
  return `${encode(iv)}.${encode(encrypted)}`;
}
async function unseal(env, value) {
  const [iv, ciphertext] = value.split(".");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decode(iv) }, await key(env), decode(ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
}
async function equalSecret(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || !b) return false;
  const k = await crypto.subtle.importKey("raw", encoder.encode(b), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  const signature = await crypto.subtle.sign("HMAC", k, encoder.encode(b));
  return crypto.subtle.verify("HMAC", k, signature, encoder.encode(a));
}
var stateRow = (env) => env.DB.prepare("SELECT * FROM strava_state WHERE id = 1").first();
async function saveAuth(env, auth) {
  await env.DB.prepare("UPDATE strava_state SET encrypted = ? WHERE id = 1").bind(await seal(env, auth)).run();
}
async function boundedJSON(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  let body = "";
  let size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}
async function postForm(url, body) {
  return fetch(url, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body), signal: AbortSignal.timeout(8e3) });
}
async function token(env, auth) {
  if (auth.expiresAt > now() + 120) return auth.accessToken;
  const response = await postForm("https://www.strava.com/oauth/token", {
    client_id: auth.clientId,
    client_secret: auth.clientSecret,
    grant_type: "refresh_token",
    refresh_token: auth.refreshToken
  });
  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      await env.DB.prepare("DELETE FROM strava_state WHERE id = 1").run();
    }
    throw new Error("Token unavailable");
  }
  const result = await response.json();
  auth.accessToken = result.access_token;
  auth.refreshToken = result.refresh_token;
  auth.expiresAt = result.expires_at;
  await saveAuth(env, auth);
  return auth.accessToken;
}
function publicActivities(activities, athleteId) {
  return activities.filter(
    (activity) => Number.isSafeInteger(activity.id) && activity.id > 0 && String(activity.athlete?.id) === String(athleteId) && activity.visibility === "everyone" && activity.private !== true && TYPES.has(activity.sport_type || activity.type)
  ).sort((a, b) => Date.parse(b.start_date) - Date.parse(a.start_date)).slice(0, 6).map((activity) => ({
    id: String(activity.id),
    name: typeof activity.name === "string" ? activity.name.slice(0, 200) : "Activity",
    sport: activity.sport_type || activity.type,
    startDate: Number.isFinite(Date.parse(activity.start_date)) ? activity.start_date : null,
    timezone: typeof activity.timezone === "string" ? activity.timezone.replace(/^\(GMT[^)]+\)\s*/, "") : "UTC",
    distance: metric(activity.distance),
    movingTime: metric(activity.moving_time),
    elapsedTime: metric(activity.elapsed_time),
    elevation: metric(activity.total_elevation_gain),
    photo: publicPhoto(activity.photos?.primary?.urls),
    photos: [publicPhoto(activity.photos?.primary?.urls)].filter(Boolean),
    mediaVersion: 3,
    route: typeof activity.map?.summary_polyline === "string" && activity.map.summary_polyline.length <= 2e4 ? activity.map.summary_polyline : null
  }));
}
var metric = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
function publicPhoto(urls) {
  for (const value of Object.entries(urls || {}).sort(([a], [b]) => Number(b) - Number(a)).map(([, value2]) => value2)) {
    try {
      const url = new URL(value);
      if (url.protocol === "https:" && !url.username && !url.password && (["d3nn82uaxijpm6.cloudfront.net", "dgtzuqphqg23d.cloudfront.net"].includes(url.hostname) || url.hostname.endsWith(".strava.com"))) return url.href;
    } catch {
    }
  }
  return null;
}
async function sync(env, force = false) {
  const stamp = now();
  const lease = await env.DB.prepare("UPDATE strava_state SET lock_until = ? WHERE id = 1 AND lock_until < ? AND (? = 1 OR synced_at < ?) RETURNING *").bind(stamp + 60, stamp, force ? 1 : 0, stamp - 900).first();
  if (!lease) return;
  try {
    const auth = await unseal(env, lease.encrypted);
    const accessToken = await token(env, auth);
    const response = await fetch(`${API}/athlete/activities?per_page=100&page=1`, {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8e3)
    });
    if (!response.ok) throw new Error("Activity list unavailable");
    const activities = await response.json();
    if (!Array.isArray(activities)) throw new Error("Invalid activity list");
    const feed2 = publicActivities(activities, auth.athleteId);
    await Promise.all(feed2.map(async (item, index) => {
      const summary = activities.find((activity) => String(activity.id) === item.id);
      if (!summary?.total_photo_count) return;
      try {
        const detailResponse = await fetch(`${API}/activities/${item.id}`, {
          headers: { authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(5e3)
        });
        if (detailResponse.status === 404) {
          feed2[index] = null;
          return;
        }
        if (!detailResponse.ok) return;
        const detail = await detailResponse.json();
        const safe = publicActivities([detail], auth.athleteId)[0];
        feed2[index] = safe?.id === item.id ? { ...safe, route: item.route } : null;
        if (!feed2[index]) return;
        const photosResponse = await fetch(`${API}/activities/${item.id}/photos?size=1200&photo_sources=1`, {
          headers: { authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(5e3)
        });
        if (photosResponse.ok) {
          const album = await photosResponse.json();
          if (Array.isArray(album)) {
            const photos = [...new Set(album.map((photo) => publicPhoto(photo?.urls)).filter(Boolean))];
            if (photos.length) feed2[index].photos = photos;
          }
        }
      } catch {
      }
    }));
    await env.DB.prepare("UPDATE strava_state SET feed = ?, synced_at = ?, lock_until = 0 WHERE id = 1 AND lock_until = ? AND revision = ?").bind(JSON.stringify(feed2.filter(Boolean)), stamp, stamp + 60, lease.revision).run();
  } catch {
    await env.DB.prepare("UPDATE strava_state SET lock_until = ? WHERE id = 1 AND lock_until = ?").bind(stamp + 300, stamp + 60).run();
    logFailure();
  }
}
async function feed(env, ctx) {
  if (!env.DB || !env.STRAVA_ENCRYPTION_KEY) return reply2({ connected: false, activities: [] });
  const before = await stateRow(env);
  const oldFormat = before && JSON.parse(before.feed).some((item) => item.mediaVersion !== 3);
  const refresh = sync(env, Boolean(oldFormat));
  ctx?.waitUntil?.(refresh);
  await refresh;
  const row = await stateRow(env);
  if (!row) return reply2({ connected: false, activities: [] });
  const auth = await unseal(env, row.encrypted);
  const stale = row.synced_at < now() - 3600;
  return reply2({
    connected: true,
    activities: stale ? [] : JSON.parse(row.feed),
    unavailable: stale,
    profileUrl: `https://www.strava.com/athletes/${auth.athleteId}`
  });
}
function html(body, status = 200, cookie = null) {
  const headers2 = {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
  };
  if (cookie) headers2["set-cookie"] = cookie;
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Connect Strava</title><link rel="stylesheet" href="/strava-setup.css"></head><body><main>${body}</main></body></html>`, { status, headers: headers2 });
}
var clearCookie = "strava_state=; Path=/strava/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
function setupPage() {
  return html(`<h1>Connect your Strava</h1><p>Owner setup for Erick\u2019s portfolio. Only public runs, walks, and weight-training activities will be shown.</p>
  <form id="strava-setup"><label>Setup key<input name="setupKey" type="password" required autocomplete="off"></label>
  <label>Client ID<input name="clientId" required inputmode="numeric"></label>
  <label>Client Secret<input name="clientSecret" type="password" required autocomplete="off"></label>
  <label>Your athlete ID<input name="athleteId" required inputmode="numeric"></label>
  <p class="hint">The athlete ID is the number at the end of your Strava profile URL. Set the app\u2019s callback domain to <strong>erickbenitez.com</strong>.</p>
  <button>Continue to Strava</button><p id="status" role="status"></p></form><script src="/strava-setup.js"><\/script>`);
}
async function connect(request, env) {
  if (request.headers.get("origin") !== ORIGIN) return reply2({ error: "Invalid origin" }, 403);
  if (!env.DB || !env.STRAVA_SETUP_KEY || !env.STRAVA_ENCRYPTION_KEY) return reply2({ error: "Connection setup is not ready yet." }, 503);
  const body = await boundedJSON(request);
  if (!await equalSecret(body.setupKey, env.STRAVA_SETUP_KEY)) return reply2({ error: "Invalid setup key." }, 403);
  if (!/^\d{1,20}$/.test(body.clientId) || !/^\d{1,20}$/.test(body.athleteId) || typeof body.clientSecret !== "string" || body.clientSecret.length < 10 || body.clientSecret.length > 200) return reply2({ error: "Check your app details." }, 400);
  const state = crypto.randomUUID();
  const auth = { clientId: body.clientId, clientSecret: body.clientSecret, athleteId: body.athleteId };
  await env.DB.batch([
    env.DB.prepare("DELETE FROM strava_pending WHERE expires_at < ?").bind(now()),
    env.DB.prepare("INSERT INTO strava_pending (state, encrypted, expires_at) VALUES (?, ?, ?)").bind(state, await seal(env, auth), now() + 600)
  ]);
  const target = new URL("https://www.strava.com/oauth/authorize");
  target.search = new URLSearchParams({ client_id: auth.clientId, redirect_uri: `${ORIGIN}/strava/callback`, response_type: "code", approval_prompt: "force", scope: "read,activity:read", state });
  return Response.json({ url: target.href }, { headers: { "cache-control": "no-store", "set-cookie": `strava_state=${state}; Path=/strava/; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
}
async function subscribe(env, auth) {
  const query = new URLSearchParams({ client_id: auth.clientId, client_secret: auth.clientSecret });
  const response = await fetch(`${API}/push_subscriptions?${query}`, { signal: AbortSignal.timeout(8e3) });
  if (!response.ok) throw new Error("Subscription check failed");
  const subscriptions = await response.json();
  const callback2 = `${ORIGIN}/api/strava/webhook/${auth.webhookKey}`;
  if (subscriptions.length) {
    const existing = subscriptions.find((item) => item.callback_url === callback2);
    if (!existing) throw new Error("App already has a different webhook");
    auth.subscriptionId = existing.id;
  } else {
    const result = await postForm(`${API}/push_subscriptions`, { client_id: auth.clientId, client_secret: auth.clientSecret, callback_url: callback2, verify_token: auth.webhookKey });
    if (!result.ok) throw new Error("Subscription creation failed");
    auth.subscriptionId = (await result.json()).id;
  }
  await saveAuth(env, auth);
}
async function callback(request, env) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const cookie = request.headers.get("cookie")?.split(";").map((x) => x.trim()).find((x) => x.startsWith("strava_state="))?.slice(13);
  if (!state || !await equalSecret(state, cookie)) return html("<h1>Connection expired</h1><p>Return to the setup link and try again.</p>", 400, clearCookie);
  const pending = await env.DB.prepare("DELETE FROM strava_pending WHERE state = ? AND expires_at > ? RETURNING *").bind(state, now()).first();
  if (!pending || !url.searchParams.get("code") || !(url.searchParams.get("scope") || "").split(",").includes("activity:read")) return html("<h1>Connection not completed</h1><p>Please try again and allow access to your activities.</p>", 400, clearCookie);
  const auth = await unseal(env, pending.encrypted);
  const response = await postForm("https://www.strava.com/oauth/token", { client_id: auth.clientId, client_secret: auth.clientSecret, grant_type: "authorization_code", code: url.searchParams.get("code") });
  if (!response.ok) return html("<h1>Could not connect</h1><p>Please check the app details and try again.</p>", 400, clearCookie);
  const result = await response.json();
  if (String(result.athlete?.id) !== auth.athleteId) return html("<h1>Different Strava account</h1><p>Sign in to the account matching the athlete ID you entered.</p>", 403, clearCookie);
  const existing = await stateRow(env);
  const old = existing ? await unseal(env, existing.encrypted) : null;
  Object.assign(auth, {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    expiresAt: result.expires_at,
    webhookKey: old?.clientId === auth.clientId ? old.webhookKey : crypto.randomUUID(),
    subscriptionId: null
  });
  await env.DB.prepare("INSERT INTO strava_state (id, encrypted, feed, synced_at, lock_until) VALUES (1, ?, ?, 0, 0) ON CONFLICT(id) DO UPDATE SET encrypted=excluded.encrypted, feed=excluded.feed, synced_at=0, lock_until=0").bind(await seal(env, auth), "[]").run();
  let subscribed = true;
  try {
    await subscribe(env, auth);
  } catch {
    subscribed = false;
    logFailure();
  }
  await sync(env, true);
  return html(`<h1>Strava connected</h1><p>${subscribed ? "New public runs, walks, and lifts will appear automatically." : "Your account is connected, but automatic activity notifications could not be enabled. Please return to Codex to finish this step."}</p><p><a href="/about/#activity">View your activity section</a></p>`, 200, clearCookie);
}
async function webhook(request, env, suppliedKey, ctx) {
  const row = await stateRow(env);
  if (!row) return reply2({ ok: true });
  const auth = await unseal(env, row.encrypted);
  if (!await equalSecret(suppliedKey, auth.webhookKey)) return reply2({ error: "Not found" }, 404);
  if (request.method === "GET") {
    const url = new URL(request.url);
    if (url.searchParams.get("hub.mode") !== "subscribe" || !await equalSecret(url.searchParams.get("hub.verify_token"), auth.webhookKey)) return reply2({ error: "Invalid verification" }, 403);
    return reply2({ "hub.challenge": url.searchParams.get("hub.challenge") });
  }
  if (request.method !== "POST") return reply2({ error: "Method not allowed" }, 405);
  const event = await boundedJSON(request);
  if (String(event.owner_id) !== String(auth.athleteId) || event.subscription_id !== auth.subscriptionId) return reply2({ ok: true });
  if (event.object_type === "athlete" && event.updates?.authorized === "false") {
    await env.DB.prepare("DELETE FROM strava_state WHERE id = 1").run();
  } else if (event.object_type === "activity") {
    await env.DB.prepare("UPDATE strava_state SET feed = ?, synced_at = 0, revision = revision + 1 WHERE id = 1").bind("[]").run();
    ctx.waitUntil(sync(env, true).catch(logFailure));
  }
  return reply2({ ok: true });
}
async function handleStrava(request, env, ctx) {
  const path = new URL(request.url).pathname;
  if (!path.startsWith("/api/strava") && !path.startsWith("/strava/")) return null;
  try {
    if (path === "/api/strava" && request.method === "GET") return await feed(env, ctx);
    if (path === "/strava/setup" && request.method === "GET") return setupPage();
    if (path === "/strava/connect" && request.method === "POST") return await connect(request, env);
    if (path === "/strava/callback" && request.method === "GET") return await callback(request, env);
    if (path.startsWith("/api/strava/webhook/")) return await webhook(request, env, path.split("/").pop(), ctx);
    return reply2({ error: "Not found" }, 404);
  } catch {
    logFailure();
    return reply2({ error: "Strava is temporarily unavailable." }, 503);
  }
}

// server/index.js
var SPOTIFY_ACCOUNTS = "https://accounts.spotify.com";
var SPOTIFY_API = "https://api.spotify.com/v1";
function json(data, init = {}) {
  const headers2 = new Headers(init.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  headers2.set("cache-control", "public, max-age=20, s-maxage=20");
  return new Response(JSON.stringify(data), { ...init, headers: headers2 });
}
async function spotifyToken(env, body) {
  const auth = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  return fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: { "authorization": `Basic ${auth}`, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body)
  });
}
function sanitizeTrack(payload, isPlaying, playedAt = null) {
  const item = payload?.item || payload?.track;
  if (!item) return null;
  return {
    isPlaying,
    title: item.name,
    artist: item.artists?.map((artist) => artist.name).join(", ") || "Spotify",
    album: item.album?.name || "",
    albumImage: item.album?.images?.[0]?.url || null,
    trackUrl: item.external_urls?.spotify || "https://open.spotify.com/",
    progressMs: isPlaying ? payload.progress_ms || 0 : 0,
    durationMs: item.duration_ms || 0,
    playedAt,
    profileUrl: null
  };
}
async function nowPlaying(env) {
  if (!env.SPOTIFY_REFRESH_TOKEN) return json({ error: "not_connected" }, { status: 503 });
  const tokenResponse = await spotifyToken(env, { grant_type: "refresh_token", refresh_token: env.SPOTIFY_REFRESH_TOKEN });
  if (!tokenResponse.ok) return json({ error: "token_refresh_failed" }, { status: 503 });
  const { access_token: accessToken } = await tokenResponse.json();
  const headers2 = { "authorization": `Bearer ${accessToken}` };
  const current = await fetch(`${SPOTIFY_API}/me/player/currently-playing`, { headers: headers2 });
  if (current.ok && current.status !== 204) {
    const payload2 = await current.json();
    const track2 = sanitizeTrack(payload2, Boolean(payload2.is_playing));
    if (track2) return json(track2);
  }
  const recent = await fetch(`${SPOTIFY_API}/me/player/recently-played?limit=1`, { headers: headers2 });
  if (!recent.ok) return json({ error: "playback_unavailable" }, { status: 503 });
  const payload = await recent.json();
  const latest = payload.items?.[0];
  const track = sanitizeTrack(latest, false, latest?.played_at || null);
  return track ? json(track) : json({ error: "no_tracks" }, { status: 404 });
}
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      const workstation = await handleWorkstation(request, env);
      if (workstation) return workstation;
      if (url.pathname === "/api/github/contributions") return githubContributions(request, ctx);
      const strava = await handleStrava(request, env, ctx);
      if (strava) return strava;
      if (url.pathname === "/api/spotify") {
        const response = await nowPlaying(env);
        if (!response.ok || !env.SPOTIFY_PROFILE_URL) return response;
        const payload = await response.json();
        payload.profileUrl = env.SPOTIFY_PROFILE_URL;
        return json(payload);
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error("Spotify integration error", error);
      if (url.pathname.startsWith("/api/")) return json({ error: "temporarily_unavailable" }, { status: 503 });
      return new Response("Temporarily unavailable", { status: 503 });
    }
  }
};
export {
  index_default as default
};
