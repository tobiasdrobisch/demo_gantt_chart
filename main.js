
// global variable for highest Parameter (for now) (noch in eine überFunktion einbauen?)
//TODO: muss hier mit 1 addiert werden, da Anzahl/Länge? Vermutlich
var maxParameter = 12e6+1;
var useCase;


// plotting: take arguments and start plotting with d3 library
// mapping: each node has a color (style.css)
function plotting(tasks, plottedParameter,maxRounds, fstMovement,residencies) {
    let nodeColors = {
        "0" : "node-0",
        "1" : "node-1",
        "2" : "node-2",
        "3" : "node-3",
        "4" : "node-4",
        "5" : "node-5",
        "6" : "node-6",
        "7" : "node-7",
        "8" : "undefined"
    };

    let gantt = d3.gantt().taskTypes(plottedParameter).taskStatus(nodeColors).settings(maxRounds).movement(fstMovement);
    gantt(tasks,residencies);
    //stop showing loading spinner
    document.getElementById("loader").style.display = "none";
    //enable button "Run" again
    window.document.getElementById("run_process").removeAttribute("disabled");
    console.log("hier wird disabled removed, disabled: " + window.document.getElementById("run_process").disabled);
    //console.log("run_disable in plottting: " + run_disable);
    //console.log("window.disabled " + window.run_disable);
    //run_disable = document.getElementById("run_process").disabled = false
    //document.getElementById("run_process").setAttribute( "onClick", "myFunction()" );
    //document.getElementById("run_process").disabled = "false";
    return 0;

}

/**** chooseParameters
 * TextInput: choosing parameters for plotting
 * possible writing:
 * spaces will be ignored; 1st number > 2nd number; 2,3 -> select: 2 and 3; 2-5 -> select: [2,3,4,5]
 * numbers can appear multiple times and also overlap, doesn't matter
 * million: m is getting replaced by 000000
 * example: 0,12-17, 23-25,47,14 -> [0,12,13,14,15,16,17,23,24,25,47]
 * ****/

function chooseParameters() {

    let allParametersToPlot = [];
    let helpArray = [];
    const chosenParametersBitArray = new BitArray(maxParameter);
    let helpString = document.getElementById("myVal").value.replace(/\s/g, "");
    let inputString = helpString.replace(/k/g,'000');
    let stringParameters = inputString.replace(/m/g,'000000');
    allParametersToPlot = stringParameters.split(",");
    for(let i = 0; i<allParametersToPlot.length; i++) {
        helpArray = allParametersToPlot[i].split('-');
        if (helpArray.length === 1) {
            chosenParametersBitArray.set(parseInt(helpArray[0]), true);
        } else {
            let lowEnd = Number(helpArray[0]);
            let highEnd = Number(helpArray[1]);
            for (let j = lowEnd; j <= highEnd; j++) {
                chosenParametersBitArray.set(j, true);
            }
        }
    }
    return chosenParametersBitArray;
}

function plotWithInitialTime(chosenParametersBitArray) {

    let pathToDataSet = "data/" + useCase.file + ".tsv";
    console.log("pathToDataSet: " + pathToDataSet);

    /** read data file and build all tasks **/
    const firstMove = 0;
    let plottedParametersStringArray = [];
    const plottedParametersBitArray = new BitArray(maxParameter);
    /* Array of latest endTime of each parameter */
    (last_drawn = []).length = maxParameter;
    last_drawn.fill(0);
    /* Array of last node position of each parameter */
    (moves_to = []).length = maxParameter;
    moves_to.fill(8); //white color
    /* Array of times a parameter moved */
    (residencies = []).length = maxParameter;
    residencies.fill(0);

    let plottedTasks = [];
    let maxRounds = 0;

    d3.tsv(pathToDataSet, function (data) {

        maxRounds = data[data.length -1].time;
        data.forEach(function (d) {

            d.time = +d.time;
            d.param= +d.param;
            if ( chosenParametersBitArray.get(d.param)) { //parameterArray.includes(parseInt(d.param)) //param=Int
                residencies[d.param]++;
                if ( !plottedParametersBitArray.get(d.param)) {
                    plottedParametersStringArray.push(d.param);
                    plottedParametersBitArray.set(d.param,true);

                    plottedTasks.push({
                        "startDate": parseInt(last_drawn[d.param]),
                        "endDate": parseInt(d.time),
                        "taskName": d.param,
                        "status": String(moves_to[d.param])
                    });
                    last_drawn[d.param] = d.time;

                } else {
                    plottedTasks.push({
                        "startDate": parseInt(last_drawn[d.param]),
                        "endDate": parseInt(d.time),
                        "taskName": d.param,
                        "status": String(moves_to[d.param])
                    });
                    last_drawn[d.param] = d.time;
                }
                moves_to[d.param] = d.target;
            }
        });

        maxRounds = maxRounds;
        let i;
        for (i = 0; i< plottedParametersStringArray.length; i++) {
            plottedTasks.push({
                "startDate": parseInt(last_drawn[plottedParametersStringArray[i]]),
                "endDate": parseInt(maxRounds),
                "taskName": plottedParametersStringArray[i],
                "status": String(moves_to[plottedParametersStringArray[i]])
            });        }

        plottedParametersStringArray.sort(function(a, b){ return a - b; });
        console.log("plotting with inital time");
        return plotting(plottedTasks, plottedParametersStringArray, maxRounds, firstMove, residencies);

    });


}

function plotWithoutInitialTime(chosenParametersBitArray) {

    let pathToDataSet = "data/" + useCase.file + ".tsv";
    console.log("pathToDataSet: " + pathToDataSet);
    console.log("plotting withOUT inital time");


    let firstMove = 0;
    /** read data file and build all tasks */
    let plottedParametersStringArray = [];
    const plottedParametersBitArray = new BitArray(maxParameter);


    /* Array of latest endTime of each parameter */
    (last_drawn = []).length = maxParameter;
    last_drawn.fill(0);
    /* Array of last node position of each parameter */
    (moves_to = []).length = maxParameter;
    moves_to.fill(8); //white color
    /* Array of times a parameter moved */
    (residencies = []).length = maxParameter;
    residencies.fill(0);

    let plottedTasks = [];
    let maxRounds = 0;

    d3.tsv(pathToDataSet, function (data) {
        //console.log(data);
        maxRounds = data[data.length - 1].time;
        data.forEach(function (d) {
            //console.log(d.time);
            d.time = +d.time;
            d.param = +d.param;
            if (chosenParametersBitArray.get(d.param)) { //parameterArray.includes(parseInt(d.param)) //param=Int
                //console.log("nach if chosenbitarray: " + d.param + ", time: " + d.time);
                residencies[d.param]++;
                if (!plottedParametersBitArray.get(d.param)) {
                    plottedParametersStringArray.push(d.param);
                    plottedParametersBitArray.set(d.param, true);
                    //console.log("if part: " + d.param);
                } else {
                    if (firstMove === 0) {
                        firstMove = d.time * 0.999;
                    }
                    plottedTasks.push({
                        "startDate": parseInt(last_drawn[d.param]),
                        "endDate": parseInt(d.time) - firstMove,
                        "taskName": d.param,
                        "status": String(moves_to[d.param])
                    });
                    last_drawn[d.param] = d.time - firstMove;
                    //console.log("else part: " + d.param)
                }
                moves_to[d.param] = d.target;
            }
        });

        maxRounds = maxRounds - firstMove;
        for (let i = 0; i < plottedParametersStringArray.length; i++) {
            plottedTasks.push({
                "startDate": parseInt(last_drawn[plottedParametersStringArray[i]]),
                "endDate": parseInt(maxRounds),
                "taskName": plottedParametersStringArray[i],
                "status": String(moves_to[plottedParametersStringArray[i]])
            });
        }

        plottedParametersStringArray.sort(function (a, b) {
            return a - b;
        });
        console.log("plottingwithout inital time");

        return plotting(plottedTasks, plottedParametersStringArray, maxRounds, firstMove, residencies);

    });
}

/**** main()
 * get parameters to plot and start process with(out) initial time
 * @returns {number} 0
 */

function main() {
    // which Parameters shall be plotted
    const selectedParametersBitArray = chooseParameters();
    // initialTime enabled/disabled?
    let checkBoxInitialisingTime = document.getElementById("initialisingTime").checked;
    if (checkBoxInitialisingTime) {
        plotWithInitialTime(selectedParametersBitArray);
    } else {
        plotWithoutInitialTime(selectedParametersBitArray);
    }
    return 0;
}