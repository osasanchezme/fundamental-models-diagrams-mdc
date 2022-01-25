const $ = require('jquery');
const config = require('../config.json');
const graph = require('./graph');
const getState = require('./getState');

const initial_state = {
    problem: 'boussinesq',
    // problem: 'kelvin',
    // problem: 'cerruti',
    view: {
        x: 0,
        y: 0,
        z: {
            min: 0,
            max: -100,
        },
        space: 10,
    },
};
initial_state.data = graph.createPlotData(initial_state);

function initializeApp() {
    const available_problems = {
        Boussinesq: {},
        Kelvin: {},
        Cerruti: {},
    };
    // Set options to the dropdown
    Object.keys(available_problems).forEach((problem_name) => {
        $('#problem_name').append(
            `<option value="${String(problem_name).toLowerCase()}">${problem_name}</option>`
        );
        console.log(problem_name);
    });
}

function setState(model) {
    const curr_model = getState();
    if (curr_model !== model) {
        const data = graph.createPlotData(model);
        model.data = data;
        window[config.app_name].state = model;
        updateUI();
    }
}

function updateUI() {
    const model = getState();
    $('#xdist').val(Number(model.view.x));
    $('#ydist').val(Number(model.view.y));
    $('#problem_name').val(String(model.problem));
    $('#zdist').val(Number(model.view.z.max));
    $('#space').val(Number(model.view.space));
    graph.updatePlot();
}

module.exports = {
    initial_state,
    setState,
    initializeApp,
    getState,
};
