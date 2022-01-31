const Plotly = require('plotly.js-dist');
const getState = require('./getState');
const state = require('./state');
const helpers = require('./helpers');
const $ = require('jquery');

function updatePlot() {
    let graph_cont = document.getElementById('graph_container');

    // TODO - Implement resize
    // TODO - Save the current view
    // TODO - Reset axis limits on change
    // TODO - Add a representation of the load object: cilinder, etc...
    // TODO - Add checkbox to keep x-corte and y-corte equal
    // TODO - Show intensity value on mesh hover - IMPORTANT!!!
    // TODO - (DONE) Adjust max stress ploted (manually or automatically) -- Set the min too to find location of a minimum stress (add inputs)
    // TODO - Add inputs to adjust v and E - IMPORTANT
    // TODO - (DONE) ONLY MISSING ADDING THE CORERCT FORMULAS FOR EACH RESULT IN EACH PROBLEM
    // TODO - (DONE) Add units
    // TODO - Deformed shapes for deformation
    // TODO - Document all the functions to promote collaboration
    // TODO - Try to plot the same result with a different problem if does not exist go to the deafult one and notify
    // TODO - Add 3D scatter plot
    // TODO - Add loader!!!!
    // TODO - Support multiple unit systems
    // TODO - (DONE) Change trace name
    // TODO - Change the limits to show the plot in the report
    const model = getState();
    Plotly.newPlot(graph_cont, model.data, {});
    graph_cont.on('plotly_afterplot', function(){
        $('.loader').hide();
        console.log('Done!');
    });
}

function createPlotData(model) {
    let d = model.view.space;
    let dx = model.view.x;
    let dy = model.view.y;
    let dz = model.view.z.max;
    let c = 'rgb(211,211,211)';
    let f = 'rgb(220,220,220)';
    let h = 'rgb(165,42,42)';

    const data = [
        {
            type: 'mesh3d',
            name: 'Terreno',
            x: [dx, dx, -d, -d, d, d, dx, dx, -d, -d, d, d],
            y: [dy, d, d, -d, -d, dy, dy, d, d, -d, -d, dy],
            z: [0, 0, 0, 0, 0, 0, dz, dz, dz, dz, dz, dz],
            i: [1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 0, 0, 6, 6, 6, 6],
            j: [8, 8, 3, 8, 4, 9, 5, 10, 1, 3, 5, 3, 7, 9, 11, 9],
            k: [2, 7, 9, 9, 10, 10, 11, 11, 2, 2, 4, 4, 8, 8, 10, 10],
            facecolor: [c, c, c, c, c, c, c, c, f, f, f, f, f, f, f, f],
            // i: [1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0],
            // j: [8, 8, 3, 8, 4, 9, 5, 10, 1, 3, 5, 3, 7, 9, 11, 9, 1, 6, 5, 6],
            // k: [2, 7, 9, 9, 10, 10, 11, 11, 2, 2, 4, 4, 8, 8, 10, 10, 7, 7, 11, 11],
            // facecolor: [c, c, c, c, c, c, c, c, f, f, f, f, f, f, f, f, h, h, h, h],
            lighting: {
                ambient: 1,
            },
            text: ['', '', '', '', '', '', '', '', '', '', '', ''],
            opacity: 1,
            // intensity: intensity,
            // colorscale: [
            //     [0, 'rgb(0, 0, 255)'],
            //     [0.5, 'rgb(0, 0, 255)'],
            //     [1, 'rgb(0, 0, 255)'],
            // ],
        },
        createPlatesInPlane(model),
    ];
    return data;
}

function createPlatesInPlane(model) {
    // Point coordinates
    let x = [];
    let y = [];
    let z = [];
    // Plates nodes
    let i = [];
    let j = [];
    let k = [];
    // Intensity
    let intensity = [];
    // Text on hover
    let text_hover = [];
    // Units
    let result_units;

    let z_i = model.view.z.min;
    let z_f = model.view.z.max;
    let number_x = model.settings.resolution;
    let number_z = model.settings.resolution;
    let x_f = model.view.space;
    let load_val = model.load;
    ['x', 'y'].forEach((plane) => {
        let initial_num_nodes = plane === 'x' ? 0 : (number_x + 1) * (number_z + 1);
        let x_i = plane === 'y' ? model.view.x : model.view.y;
        let y_all = plane === 'y' ? model.view.y : model.view.x;
        let x_step = (x_f - x_i) / number_x;
        let z_step = (z_f - z_i) / number_z;
        for (let i_z = 0; i_z <= number_z; i_z++) {
            for (let i_x = 0; i_x <= number_x; i_x++) {
                if (plane === 'y') {
                    x.push(x_i + i_x * x_step);
                    y.push(y_all);
                    z.push(z_i + i_z * z_step);
                } else {
                    x.push(y_all);
                    y.push(x_i + i_x * x_step);
                    z.push(z_i + i_z * z_step);
                }
                // Intensity calculation
                let d = {
                    R: Math.sqrt(x[x.length - 1] ** 2 + y[y.length - 1] ** 2 + z[z.length - 1] ** 2),
                    z: -z[z.length - 1],
                    r: Math.sqrt(x[x.length - 1] ** 2 + y[y.length - 1] ** 2),
                    x: x[x.length - 1],
                    y: y[y.length - 1],
                };
                let prob = model.problems[helpers.toTitleCase(String(model.problem))];
                eval(prob[model.result].custom);
                let int_limit_max = prob[model.result].max;
                let int_limit_min = prob[model.result].min;
                let ints = (load_val / (2 * Math.PI)) * eval(prob[model.result].formula);
                result_units = JSON.parse(JSON.stringify(prob[model.result].units));
                text_hover.push(`${prob[model.result].symbol} = ${String(ints.toPrecision(4))} ${prob[model.result].units}`);
                if (int_limit_max) {
                    if (ints > int_limit_max) {
                        ints = int_limit_max;
                    }
                }
                if (int_limit_min) {
                    if (ints < int_limit_min) {
                        ints = int_limit_min;
                    }
                }
                intensity.push(ints);
                if (i_x < number_x && i_z < number_z) {
                    // First plate
                    i.push(initial_num_nodes + i_z * (number_x + 1) + i_x);
                    j.push(initial_num_nodes + i_z * (number_x + 1) + i_x + 1);
                    k.push(initial_num_nodes + (i_z + 1) * (number_x + 1) + i_x + 1);
                    // Second plate
                    i.push(initial_num_nodes + i_z * (number_x + 1) + i_x);
                    j.push(initial_num_nodes + (i_z + 1) * (number_x + 1) + i_x);
                    k.push(initial_num_nodes + (i_z + 1) * (number_x + 1) + i_x + 1);
                }
            }
        }
    });

    const data = {
        type: 'mesh3d',
        name: '',
        x: x,
        y: y,
        z: z,
        i: i,
        j: j,
        k: k,
        colorbar: {
            ticksuffix: ` ${result_units}`,
        },
        // facecolor: facecolor,
        lighting: {
            ambient: 1,
        },
        opacity: 1,
        intensity: intensity,
        text: text_hover,
        colorscale: 'Jet',
    };
    console.log(data);
    return data;
}

module.exports = { updatePlot, createPlotData };
