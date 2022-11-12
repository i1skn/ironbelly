/**
*File: rn-polyfill-depricated-proptypes.js
**/

const StandardModule = require('react-native');
const dpProps = require('deprecated-react-native-prop-types');

const txtImputProx = new Proxy(StandardModule.TextInput, {
get(obj, prop) {
if (prop === 'propTypes') return dpProps.TextInputPropTypes;
return Reflect.get(...arguments);
},
});

Object.defineProperty(StandardModule, 'ColorPropType', {
configurable: true,
get() {
return dpProps.ColorPropType;
},
});

Object.defineProperty(StandardModule, 'EdgeInsetsPropType', {
configurable: true,
get() {
return dpProps.EdgeInsetsPropType;
},
});

Object.defineProperty(StandardModule, 'PointPropType', {
configurable: true,
get() {
return dpProps.PointPropType;
},
});

Object.defineProperty(StandardModule, 'ViewPropTypes', {
configurable: true,
get() {
return dpProps.ViewPropTypes;
},
});

Object.defineProperty(StandardModule, 'TextPropTypes', {
configurable: true,
get() {
return dpProps.TextPropTypes;
},
});

Object.defineProperty(StandardModule, 'TextInputPropTypes', {
configurable: true,
get() {
return dpProps.TextInputPropTypes;
},
});

Object.defineProperty(StandardModule, 'TextInput', {
configurable: true,
get() {
// return dpProps.TextInputPropTypes;
return txtImputProx;
},
});

// Object.defineProperty(StandardModule, 'TextStylePropTypes', {
// configurable: true,
// get() {
// return dpProps.TextInputPropTypes;
// },
// });

// Object.defineProperty(StandardModule, 'ImagePropTypes', {
// configurable: true,
// get() {
// return require('deprecated-react-native-prop-types/DeprecatedImagePropType');
// },
// });

// Object.defineProperty(StandardModule, 'ImageStylePropTypes', {
// configurable: true,
// get() {
// return require('deprecated-react-native-prop-types/DeprecatedImageStylePropTypes');
// },
// });

// Object.defineProperty(StandardModule, 'ViewStylePropTypes', {
// configurable: true,
// get() {
// return dpProps.ViewPropTypes;
// },
// });

// console.log("StandardModule--> ", StandardModule.ColorPropType); 
