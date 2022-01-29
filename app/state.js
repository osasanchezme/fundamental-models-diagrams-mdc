const $ = require('jquery');
const config = require('../config.json');
const graph = require('./graph');
const getState = require('./getState');
const helpers = require('./helpers');

function initializeApp() {
    const available_problems = {
        Boussinesq: {
            sz: {
                formula: '(3 * d.z ** 3) / d.R ** 5',
                symbol: '&sigma;<sub>zz</sub>',
                max: 10,
				min: null,
            },
            sr: {
                formula: '-(1 / d.R**2)*((-3*d.z*d.r**2 / d.R**3) - ((1-2*d.v)*d.R/(d.R + d.z)))',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>rr</sub>',
                max: 10,
				min: null,
            },
            st: {
                formula: '-((1-2*d.v)/(d.R**2)) * (d.z/d.R - d.R/(d.R + d.z))',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>θθ</sub>',
                max: 10,
				min: null,
            },
            trz: {
                formula: '(3*d.r*d.z**2 / (d.R**5))',
                symbol: '&tau;<sub>rz</sub>',
                max: 10,
				min: null,
            },
            dz: {
                formula: '((1+d.v) / (d.E * d.R)) * (2*(1-d.v) + d.z**2 / d.R**2)',
                custom: 'd.v = 0.2; d.E = 20000',
                symbol: '&epsilon;<sub>z</sub>',
                max: 0.001,
				min: null,
            },
            dr: {
                formula: '((1+d.v) / (d.E * d.R)) * (d.r**2 / d.R**2 - (1-2*d.v)*d.r/(d.R+d.z))',
                custom: 'd.v = 0.2; d.E = 20000',
                symbol: '&epsilon;<sub>r</sub>',
                max: 0.0004,
				min: null,
            },
        },
        "Kelvin - Puntual": {
            sz: {
                formula: '1/(4*(1-d.v)) * (3*d.z**3 / d.R**5 + (d.z*(1-2*d.v))/d.R**3)',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>zz</sub>',
                max: 10,
				min: null,
            },
            sr: {
                formula: 'd.z/(4*(1-d.v)*d.R**3) * (3*d.r**2 / d.R**5 - (1-2*d.v))',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>rr</sub>',
                max: 10,
				min: null,
            },
            st: {
                formula: '((1-2*d.v)/(4*(1-d.v))) * (d.z/d.R**3)',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>θθ</sub>',
                max: 10,
				min: null,
            },
            trz: {
                formula: 'd.r/(4*(1-d.v)*d.R**3) * (3*d.z**2 / d.R**2 + (1-2*d.v))',
                custom: 'd.v = 0.2',
                symbol: '&tau;<sub>rz</sub>',
                max: 10,
				min: null,
            },
            dz: {
                formula: '((1+d.v) / (d.E * d.R * 4 * (1-d.v))) * (3 - 4*d.v + d.z**2 / d.R**2)',
                custom: 'd.v = 0.2; d.E = 20000',
                symbol: '&epsilon;<sub>z</sub>',
                max: 0.001,
				min: null,
            },
            dr: {
                formula: '((1+d.v) / (d.E * 4 * (1-d.v))) *(d.r*d.z/d.R**3)',
                custom: 'd.v = 0.2; d.E = 20000',
                symbol: '&epsilon;<sub>r</sub>',
                max: 0.0004,
				min: null,
            },
        },
        Cerruti: {
            sz: {
                formula: '3*d.x*d.z**2 / d.R**5',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>zz</sub>',
                max: 10,
				min: null,
            },
            sx: {
                formula: '-d.x/d.R**3 * (-3*d.x**2 / d.R**2 + (1-2*d.v)/((d.R + d.z)**2) *(d.R**2 - d.y**2 - 2*d.R*d.y**2 / (d.R + d.z)))',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>xx</sub>',
                max: 10,
				min: null,
            },
            sy: {
                formula: '-d.x/d.R**3 * (-3*d.y**2 / d.R**2 + (1-2*d.v)/((d.R + d.z)**2) *(3*d.R**2 - d.x**2 - 2*d.R*d.x**2 / (d.R + d.z)))',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>yy</sub>',
                max: 10,
				min: null,
            },
            txy: {
                formula: '-d.y/d.R**3 * (-3*d.x**2 / d.R**2 + (1-2*d.v)/((d.R + d.z)**2) *(-(d.R**2) + d.x**2 + 2*d.R*d.x**2 / (d.R + d.z)))',
                custom: 'd.v = 0.2',
                symbol: '&tau;<sub>xy</sub>',
                max: 10,
				min: null,
            },
            tyz: {
                formula: '3*d.x*d.y*d.z/d.R**5',
                symbol: '&tau;<sub>yz</sub>',
                max: 10,
				min: null,
            },
            tzx: {
                formula: '3*d.x**2*d.z/d.R**5',
                symbol: '&tau;<sub>zx</sub>',
                max: 10,
				min: null,
            },
            dz: {
                formula: '((1+d.v) / (d.E * d.R)) * (d.x*d.z/d.R**2 + (1-2*d.v)*d.x/(d.R+d.z))',
                custom: 'd.v = 0.2; d.E = 20000',
                symbol: '&epsilon;<sub>z</sub>',
                max: 0.001,
				min: null,
            },
            dx: {
                formula: '((1+d.v) / (d.E * d.R)) * (1 + d.x**2/d.R**2 + (1-2*d.v)*(d.R/(d.R+d.z) - d.x**2/(d.R+d.z)**2))',
                custom: 'd.v = 0.2; d.E = 20000',
                symbol: '&epsilon;<sub>x</sub>',
                max: 0.001,
				min: null,
            },
            dy: {
                formula: '((1+d.v) / (d.E * d.R)) * (d.x*d.y/d.R**2 - (1-2*d.v)*d.x*d.y/(d.R+d.z)**2)',
                custom: 'd.v = 0.2; d.E = 20000',
                symbol: '&epsilon;<sub>y</sub>',
                max: 0.001,
				min: null,
            },
        },
        "Kelvin - Distribuida": {
            sz: {
                formula: 'd.z/(d.R**2*(1-d.v)) * ((3-2*d.v)/2 - d.x**2/d.R**2)',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>zz</sub>',
                max: 10,
				min: null,
            },
            sx: {
                formula: 'd.z/(d.R**2*(1-d.v)) * (-(1-2*d.v)/2 + d.x**2/d.R**2)',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>xx</sub>',
                max: 10,
				min: null,
            },
            sy: {
                formula: 'd.v*d.z/(d.R**2*(1-d.v))',
                custom: 'd.v = 0.2',
                symbol: '&sigma;<sub>yy</sub>',
                max: 10,
				min: null,
            },
            txz: {
                formula: 'd.x/(d.R**2*(1-d.v)) * (-(1-2*d.v)/2 + d.z**2/d.R**2)',
                custom: 'd.v = 0.2',
                symbol: '&tau;<sub>xz</sub>',
                max: 10,
				min: null,
            },
        },
    };
    window.problems = available_problems;
    console.log(window.problems);
    // Set options to the dropdown
    Object.keys(available_problems).forEach((problem_name) => {
        $('#problem_name').append(`<option value="${String(problem_name).toLowerCase()}">${problem_name}</option>`);
        console.log(problem_name);
    });
}

function createInitialState() {
    let initial_state = {
        problem: 'boussinesq',
        // problem: 'kelvin',
        // problem: 'cerruti',
        result: 'sz',
        load: 2 * Math.PI.toFixed(3),
        view: {
            x: 0,
            y: 0,
            z: {
                min: 0,
                max: -1,
            },
            space: 1,
        },
        settings: {
            resolution: 100,
        },
        problems: window.problems,
    };
    initial_state.data = graph.createPlotData(initial_state);
    return initial_state;
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
    const available_problems = model.problems;
    const problem_name = String(model.problem);
    $('#xdist').val(Number(model.view.x));
    $('#ydist').val(Number(model.view.y));
    $('#problem_name').val(problem_name);
    $('#zdist').val(Number(model.view.z.max));
    $('#space').val(Number(model.view.space));
    $('#resolution').val(Number(model.settings.resolution));
    $('#load').val(Number(model.load));
    const available_results = available_problems[helpers.toTitleCase(problem_name)];
    $('#result').empty();
    Object.keys(available_results).forEach((available_result) => {
        $('#result').append(`<option value="${String(available_result)}">${available_results[available_result].symbol}</option>`);
    });
    $('#result').val(String(model.result));
    let result_data = available_problems[helpers.toTitleCase(problem_name)][String(model.result)];
    $('#min_val').val((result_data.min === null) ? "" : result_data.min);
    $('#max_val').val((result_data.max === null) ? "" : result_data.max);
    graph.updatePlot();
}

module.exports = {
    setState,
    initializeApp,
    getState,
    createInitialState,
};
