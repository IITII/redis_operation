/**
 * @author iitii
 * @date 2020/11/24 17:39
 */
'use strict';
const template = {
    "key_values": "Array",
    "lists": "object",
    "required": ["key_values", "lists"]
};
const instance = {
    "key_values": [],
    "lists": {},
}

const {Validator} = require('jsonschema'),
    v = new Validator();

function validator(instance) {
    return v.validate(instance, template).errors.length === 0;
}

module.exports = {
    validator,
    instance
};
