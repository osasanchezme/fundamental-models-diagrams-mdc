const state = require('./state');
const config = require('../config.json');
const events = require('./events');

// Initialize App
state.initializeApp();

// Get and set the initial state
window[config.app_name] = { state: state.createInitialState() };
state.setState(state.createInitialState());

// Assign actions to the UI elements
events.assignActions();