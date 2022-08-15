
// const serverAddr = "http://127.0.0.1:5020/api/v2.0.0/";
// let accessToken = null;
// if(localStorage.getItem("userData")){
//     var userData = JSON.parse(localStorage.getItem("userData"));
// }
// else
// {
//     window.location.href = "http://localhost:63343/net_planner/login.html";
//     alert("you must login first");
// }
var tableviewPtData = {}
var tableviewTmData = {}
var tmOtherData = {}
var ptOtherData = {}

function clickOnError(element,event){
    // Figure out element to scroll to
    var target = $(element.hash);
    target = target.length ? target : $('[name=' + element.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        $('html, body').animate({
            scrollTop: target.offset().top
        }, 0, function() {
            // Callback after animation
            // Must change focus!
            var $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
                return false;
            } else {
                $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
                $target.focus(); // Set focus again
            };
        });
    }
}

async function initTableView() {
    await initPtTableView();
    await initTmTableView();
}

var ptNodeNames = [];
async function initPtTableView()
{
    ptNodeNames = [];
    $("#tableview-pt-spreadsheet").html("")
    $("#tableview-pt-spreadsheet").removeClass("jexcel_tabs");
    $("#tableview-pt-spreadsheet").removeClass("jexcel_container");
    $("#pt-nodes-errors").html("")
    $("#pt-links-errors").html("")
    var ptNodesData = [];

    if (tableviewPtData.data != undefined && tableviewPtData.data.nodes != undefined && tableviewPtData.data.nodes.length > 0) {
        for (const data of tableviewPtData.data.nodes) {
            const newDataObj = Object.keys(data).reduce((object, key) => {
                if (!key.includes("error")) {
                    object[key] = data[key]
                }
                return object
            }, {})
            ptNodesData.push(newDataObj);
        }
    }

    if (tableviewPtData.data != undefined && tableviewPtData.data.nodes != undefined && tableviewPtData.data.nodes.length > 0) {
        for (const data of tableviewPtData.data.nodes) {
            const newDataObj = Object.keys(data).reduce((object, key) => {
                if (key === "name") {
                    object[key] = data[key]
                }
                return object
            }, {})
            ptNodeNames.push(newDataObj.name);
        }
        var ptNodesDataArray = Object.entries(tableviewPtData.data.nodes);
    }
    var ptLinksData = [];
    // Object.keys(tableviewPtData.physical_topology.nodes)
    if (tableviewPtData.data != undefined && tableviewPtData.data.links != undefined && tableviewPtData.data.links.length > 0) {
        for (const data of tableviewPtData.data.links) {
            const newDataObj = Object.keys(data).reduce((object, key) => {
                if (!key.includes("error")) {
                    object[key] = data[key]
                }
                return object
            }, {})
            ptLinksData.push(newDataObj);
        }
        var ptLinksDataArray = Object.entries(tableviewPtData.data.links);
    }


    let nodesKeyNames = {
        '0': 'name',
        '1': 'lat',
        '2': 'lng',
        '3': 'node_type',
        '4': 'wa_type',
        '5': 'no_extra_wavelength__for_expansion',
        '6': 'no_add_drop_reg_wl'
    }

    let linksKeyNames = {
        '0': 'source',
        '1': 'destination',
        '2': 'length',
        '3': 'fiber_type',
        '4': "attenuation",
        '5': "dispersion",
        '6': "nonlinearity"
    }

    var nodesChanged = function (instance, cell, x, y, value) {
        if ((errorData = cell.getAttribute("error_value")) !== undefined) {
            let cellName = jexcel.getColumnNameFromId([x, y]);
            let worksheet = document.getElementById('tableview-pt-spreadsheet').children[0].querySelector('.selected').getAttribute('data-spreadsheet');
            if (errorData != null && errorData.includes("err_code:1")) {
                if (/^[+]?([0-9]{1,2})*[.]([0-9]{1,10})?$/.test(value)) {
                    document.getElementById('tableview-pt-spreadsheet').jexcel[worksheet].setComments(cellName, "");
                    cell.style.backgroundColor = 'white';
                    if ((element = document.getElementById("node" + cellName + "_a")) !== null) {
                        element.remove();
                    }
                } else if ($(`#node${cellName}_a`).length == 0) {
                    document.getElementById('tableview-pt-spreadsheet').jexcel[worksheet].setComments(cellName, errorData);
                    cell.style.backgroundColor = 'red';
                    let newA = document.createElement('a');
                    newA.href = "#node" + cellName;
                    newA.setAttribute("id", "node" + cellName + "_a")
                    let newspan = document.createElement('span');
                    newspan.innerHTML = cell.getAttribute("error_value");
                    newA.appendChild(newspan);
                    newA.setAttribute("onclick", "clickOnError(this,event)")
                    newLine = document.createElement('br');
                    document.getElementById('pt-nodes-errors').appendChild(newA).appendChild(newLine);
                    $('#submit-pt-errors-fixed').prop("disabled", true);
                }
            } else if (errorData != null && errorData.includes("err_code:2") && value != "") {
                // let worksheet = document.getElementById('spreadsheet')
                // worksheet.jexcel.setComments(cellName, "");
                document.getElementById('tableview-pt-spreadsheet').jexcel[worksheet].setComments(cellName, "");
                cell.style.backgroundColor = 'white';
                if ((element = document.getElementById("node" + cellName + "_a")) !== null) {
                    element.remove();
                }
            }
            // $('#log').append('New change on cell ' + cellName + ' to: ' + value + '<br>');
        }
        if (localStorage.getItem("projectState") == 'creating') {
            if ($('#pt-links-errors')[0].childElementCount == 0 && $('#pt-nodes-errors')[0].childElementCount == 0) {
                $('#tableview-submit-excel').prop("disabled", false);
            }
        } else {
            if ($('#pt-links-errors')[0].childElementCount == 0 &&
                $('#pt-nodes-errors')[0].childElementCount == 0 && $('#tm-errors')[0].childElementCount == 0) {
                $('#tableview-submit-excel').prop("disabled", false);
            }
        }
    }

    var linksChanged = function (instance, cell, x, y, value) {

        if ((errorData = cell.getAttribute("error_value")) !== undefined) {
            let cellName = jexcel.getColumnNameFromId([x, y]);
            let worksheet = document.getElementById('tableview-pt-spreadsheet').children[0].querySelector('.selected').getAttribute('data-spreadsheet');
            if (errorData != null && errorData.includes("err_code:4")) {

                if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
                    document.getElementById('tableview-pt-spreadsheet').jexcel[worksheet].setComments(cellName, "");
                    cell.style.backgroundColor = 'white';
                    if ((element = document.getElementById("link" + cellName + "_a")) !== null) {
                        element.remove();
                    }
                } else if ($(`#link${cellName}_a`).length == 0) {
                    document.getElementById('tableview-pt-spreadsheet').jexcel[worksheet].setComments(cellName, errorData);
                    cell.style.backgroundColor = 'red';
                    let newA = document.createElement('a');
                    newA.href = "#link" + cellName;
                    newA.setAttribute("id", "link" + cellName + "_a")
                    let newspan = document.createElement('span');
                    newspan.innerHTML = cell.getAttribute("error_value");
                    newA.appendChild(newspan);
                    newA.setAttribute("onclick", "clickOnError(this,event)")
                    newLine = document.createElement('br');
                    document.getElementById('pt-links-errors').appendChild(newA).appendChild(newLine);
                    $('#submit-pt-errors-fixed').prop("disabled", true);
                }
            } else if (errorData != null && errorData.includes("err_code:3") && value != "") {
                // let worksheet = document.getElementById('spreadsheet')
                // worksheet.jexcel.setComments(cellName, "");
                document.getElementById('tableview-pt-spreadsheet').jexcel[worksheet].setComments(cellName, "");
                cell.style.backgroundColor = 'white';
                if ((element = document.getElementById("link" + cellName + "_a")) !== null) {
                    element.remove();
                }
            }
            // $('#log').append('New change on cell ' + cellName + ' to: ' + value + '<br>');
        }
        if (localStorage.getItem("projectState") == 'creating') {
            if ($('#pt-links-errors')[0].childElementCount == 0 && $('#pt-nodes-errors')[0].childElementCount == 0) {
                $('#tableview-submit-excel').prop("disabled", false);
            }
        } else {
            if ($('#pt-links-errors')[0].childElementCount == 0 &&
                $('#pt-nodes-errors')[0].childElementCount == 0 && $('#tm-errors')[0].childElementCount == 0) {
                $('#tableview-submit-excel').prop("disabled", false);
            }
        }
    }

    var nodesFirstTimeLoad = localStorage.getItem("projectState") == 'creating' ? true : false;
    var linksFirstTimeLoad = localStorage.getItem("projectState") == 'creating' ? true : false;

    var nodesLoaded = function (instance) {
        nodesFirstTimeLoad = false;
    }
    var linksLoaded = function (instance) {
        linksFirstTimeLoad = false;
    }

    var sheets = [
        {
            sheetName: 'Nodes',
            data: ptNodesData,
            tableOverflow: true,
            // lazyLoading: true,
            tableWidth: '90%',
            tableHeight: '69vh',
            columns: [
                {
                    type: 'text',
                    width: '100px',
                    title: 'node name',
                    name: 'name'
                },
                {
                    type: 'float',
                    decimal: '.',
                    width: '200px',
                    title: 'latitude',
                    name: 'lat'
                },
                {
                    type: 'float',
                    decimal: '.',
                    width: '200px',
                    title: 'longitude',
                    name: 'lng'
                },
                {
                    type: 'dropdown',
                    width: '150px',
                    source: ['Directionless', 'Colorless', 'CDC', 'OLA'],
                    title: 'Node Type',
                    name: 'node_type'
                },
                {
                    type: 'dropdown',
                    width: '150px',
                    source: ['Identical'],
                    title: 'WA Type',
                    name: 'wa_type'
                },
                {
                    type: 'number',
                    decimal: '.',
                    width: '200px',
                    title: 'Number of Channels for Expansion',
                    name: 'no_extra_wavelength__for_expansion'
                },
                {
                    type: 'number',
                    decimal: '.',
                    width: '200px',
                    title: 'Number of add drop',
                    name: 'no_add_drop_reg_wl'
                },
            ],
            allowComments: true,
            // persistance: '/jexcel/v4/save',
            onchange: nodesChanged,
            onload: nodesLoaded,
            updateTable: function (instance, cell, col, row, val, label, cellName) {
                cell.setAttribute('id', "node" + cellName);
                if (nodesFirstTimeLoad && ptNodesDataArray.length > 0 && (value = ptNodesDataArray[row][1][nodesKeyNames[col] + "_error"]) !== undefined) {
                    var newA = document.createElement('a');
                    newA.href = "#node" + cellName;
                    newA.setAttribute("id", "node" + cellName + "_a")
                    var newspan = document.createElement('span');
                    newspan.innerHTML = value;
                    newA.appendChild(newspan);
                    newA.setAttribute("onclick", "clickOnError(this,event)")
                    newLine = document.createElement('br');
                    document.getElementById('pt-nodes-errors').appendChild(newA).appendChild(newLine);
                    cell.setAttribute("error_value", value);
                    cell.style.backgroundColor = 'red';
                    instance.jexcel.setComments(cellName, value);
                    $('#tableview-submit-excel').prop("disabled", true);
                } else if (nodesFirstTimeLoad && localStorage.getItem("projectState") == 'creating') {
                    instance.jexcel.setReadOnly(cellName, true);
                }
                // cell.style.overflow = 'hidden';
            },
            onevent: function () {
                // console.log(arguments);
            }
        },
        {
            sheetName: 'Links',
            data: ptLinksData,
            tableOverflow: true,
            // lazyLoading: true,
            tableWidth: '90%',
            tableHeight: '69vh',
            columns: [
                {
                    type: 'autocomplete',
                    width: '130px',
                    source: await ptNodeNames,
                    title: 'source node',
                    name: 'source'
                },
                {
                    type: 'autocomplete',
                    width: '130px',
                    source: await ptNodeNames,
                    title: 'destination node',
                    name: 'destination'
                },
                {
                    type: 'numeric',
                    decimal: '.',
                    width: '100px',
                    title: 'length',
                    name: 'length'
                },
                {
                    type: 'dropdown',
                    width: '100px',
                    source: ['SMF (G.652)', 'NZDSF (G.655)'],
                    title: 'fiber type',
                    name: 'fiber_type'
                },
                {
                    type: 'numeric',
                    width: '100px',
                    title: 'Loss Coefficient(dB/Km)',
                    name: 'attenuation'
                },
                {
                    type: 'numeric',
                    width: '100px',
                    title: 'Dispersion (ps/Km-nm)',
                    name: 'dispersion'
                },
                {
                    type: 'numeric',
                    width: '100px',
                    title: 'nonlinearity',
                    name: 'nonlinearity'
                },
            ],
            allowComments: true,
            // persistance: '/jexcel/v4/save',
            onchange: linksChanged,
            onload: linksLoaded,
            updateTable: function (instance, cell, col, row, val, label, cellName) {
                cell.setAttribute('id', "link" + cellName);
                if (linksFirstTimeLoad && ptLinksDataArray.length > 0 && (value = ptLinksDataArray[row][1][linksKeyNames[col] + "_error"]) !== undefined) {
                    var newA = document.createElement('a');
                    newA.setAttribute("id", "link" + cellName + "_a")
                    newA.href = "#link" + cellName;
                    var newspan = document.createElement('span');
                    newspan.innerHTML = value;
                    newA.appendChild(newspan);
                    newA.setAttribute("onclick", "clickOnError(this,event)")
                    newLine = document.createElement('br');
                    document.getElementById('pt-links-errors').appendChild(newA).appendChild(newLine);

                    cell.setAttribute("error_value", value);
                    cell.style.backgroundColor = 'red';
                    instance.jexcel.setComments(cellName, value);

                    $('#tableview-submit-excel').prop("disabled", true);
                } else if (linksFirstTimeLoad && localStorage.getItem("projectState") == 'creating') {
                    instance.jexcel.setReadOnly(cellName, true);
                }
                // cell.style.overflow = 'hidden';
            },
            onevent: function () {
                // console.log(arguments);
            }
        }
    ];
    var ptExcel = jexcel.tabs(document.getElementById('tableview-pt-spreadsheet'), sheets);

    if(document.getElementById('tableview-pt-spreadsheet').jexcel[1].getJson() == 0){
        // $('#tm-spreadsheet').jexcel('insertRow');
        document.getElementById('tableview-pt-spreadsheet').jexcel[1].insertRow();
    }
    if(document.getElementById('tableview-pt-spreadsheet').jexcel[0].getJson() == 0){
        // $('#tm-spreadsheet').jexcel('insertRow');
        document.getElementById('tableview-pt-spreadsheet').jexcel[0].insertRow();
    }

    document.getElementById('tableview-pt-spreadsheet').children[0].addEventListener('click', function () {
        let selectedSheet = Number(document.getElementById('tableview-pt-spreadsheet').children[0].querySelector('.selected').getAttribute('data-spreadsheet'));
        if (selectedSheet === 0) {
            document.getElementById('pt-nodes-errors').style.display = "block";
            document.getElementById('pt-links-errors').style.display = "none";
        } else {
            document.getElementById('pt-nodes-errors').style.display = "none";
            document.getElementById('pt-links-errors').style.display = "block";
        }
    });


}

var tmSheet;
var servicesType = ["E1", "STM1 Electrical", "STM1 Optical", "STM4", "STM16", "STM64", "FE", "GE", "10GE", "100GE"]
async function initTmTableView(){

    // code to update nodes name 
    ptNodeNames = [];
    // if (tableviewPtData.data != undefined && tableviewPtData.data.nodes != undefined && tableviewPtData.data.nodes.length > 0) {
    //     for (const data of tableviewPtData.data.nodes) {
    //         const newDataObj = Object.keys(data).reduce((object, key) => {
    //             if (!key.includes("error")) {
    //                 object[key] = data[key]
    //             }
    //             return object
    //         }, {})
    //         ptNodesData.push(newDataObj);
    //     }
    // }

    if (tableviewPtData.data != undefined && tableviewPtData.data.nodes != undefined && tableviewPtData.data.nodes.length > 0) {
        for (const data of tableviewPtData.data.nodes) {
            const newDataObj = Object.keys(data).reduce((object, key) => {
                if (key === "name") {
                    object[key] = data[key]
                }
                return object
            }, {})
            ptNodeNames.push(newDataObj.name);
        }
        var ptNodesDataArray = Object.entries(tableviewPtData.data.nodes);
    }
    // ###

    $("#tableview-tm-spreadsheet").html("")
    $("#tm-errors").html("")

    var tableviewTmDataArray = [];
    if(tableviewTmData.data != undefined && tableviewTmData.data.demands != undefined ) {
        for (const data in tableviewTmData.data.demands) {
            const newDataObj = Object.keys(tableviewTmData.data.demands[data]).reduce((object, key) => {
                if (!key.includes("error") && !key.includes("id") && !key.includes("services")) {
                    object[key] = tableviewTmData.data.demands[data][key]
                }
                if (key.includes("services")) {
                    // object[key] = Object.keys(data[key]).map((key) => [obj[key]]);
                    // console.log(Object.values(data[key]))
                    for (var serviceData of Object.values(tableviewTmData.data.demands[data][key])) {
                        object[serviceData.type + "_quantity"] = serviceData.quantity;
                    }
                }
                return object
            }, {})
            // console.log(newDataObj)
            tableviewTmDataArray.push(newDataObj);
        }
    }
    var tmNodesDataArray = []
    if(tableviewTmData.data != undefined && tableviewTmData.data.demands != undefined ) {
        tmNodesDataArray =  Object.entries(tableviewTmData.data.demands);
    }
    let tmKeyNames = {
        '0': 'source',
        '1': 'destination',
        '2': 'restoration_type',
        '3': 'protection_type',
        '4': 'type'
    }
    var columns = [
        {
            type: 'autocomplete',
            width: '100px',
            title: 'source node',
            source: await ptNodeNames,
            name: 'source'
        },
        {
            type: 'autocomplete',
            width: '100px',
            title: 'destination node',
            source: await ptNodeNames,
            name: 'destination'
        },
        {
            type: 'dropdown',
            width: '100px',
            source: ['None', 'JointSame', 'AdvJointSame'],
            title: 'restoration type',
            name: 'restoration_type'
        },
        {
            type: 'dropdown',
            width: '150px',
            source: ['NoProtection', '1+1_NodeDisjoint', 'Restored', 'PRC'],
            title: 'protection type',
            name: 'protection_type'
        },
        {
            type: 'checkbox',
            width: '100px',
            title: 'card protection',
            name: 'card_protection'
        },
        {
            type: 'text',
            width: '100px',
            title: 'type',
            name: 'type'
        },
    ]


    for (const type of servicesType) {
        columns.push(
            {
                type: 'integer',
                width: '100px',
                title: type + ' quantity',
                name: type + '_quantity'
            }
        )
    }
    var tmFirstTimeLoad = true;
    var tmChanged = function (instance, cell, x, y, value) {
        // console.log(cell)
        let cellName = jexcel.getColumnNameFromId([x, y]);
        let worksheet = document.getElementById('tableview-tm-spreadsheet')
        if ((errorData = cell.getAttribute("error_value")) !== undefined) {
            if (errorData != null && errorData.includes("err_code:8")) {
                if (/^[+-]?\d+(\.\d+)?$/.test(value)) {

                    worksheet.jexcel.setComments(cellName, "");
                    // let worksheet = document.getElementById('spreadsheet').children[0].querySelector('.selected').getAttribute('data-spreadsheet');
                    // document.getElementById('spreadsheet').jexcel[worksheet].setComments(cellName, "");
                    cell.style.backgroundColor = 'white';
                    if ((element = document.getElementById("#tm" + cellName + "_a")) !== null) {
                        element.remove();
                    }
                } else if ($(`#tm${cellName}_a`).length == 0) {
                    worksheet.jexcel.setComments(cellName, errorData);
                    cell.style.backgroundColor = 'red';
                    let newA = document.createElement('a');
                    newA.href = "#tm" + cellName;
                    newA.setAttribute("id", "tm" + cellName + "_a")
                    let newspan = document.createElement('span');
                    newspan.innerHTML = cell.getAttribute("error_value");
                    newA.appendChild(newspan);
                    newA.setAttribute("onclick", "clickOnError(this,event)")
                    newLine = document.createElement('br');
                    document.getElementById('tm-errors').appendChild(newA).appendChild(newLine);
                    $('#tableview-submit-excel').prop("disabled", true);
                }
            } else if ((errorData != null && errorData.includes("err_code:7") || errorData != null && errorData.includes("err_code:6")) && value != "") {
                // let worksheet = document.getElementById('spreadsheet')
                // worksheet.jexcel.setComments(cellName, "");
                worksheet.jexcel.setComments(cellName, "");
                cell.style.backgroundColor = 'white';
                if ((element = document.getElementById("tm" + cellName + "_a")) !== null) {
                    element.remove();
                }
            }
            if(localStorage.getItem("projectState") == 'creating') {
                if ($('#tm-errors')[0].childElementCount == 0) {
                    $('#tableview-submit-excel').prop("disabled", false);
                }
            }else{
                if ($('#pt-links-errors')[0].childElementCount == 0 &&
                    $('#pt-nodes-errors')[0].childElementCount == 0  && $('#tm-errors')[0].childElementCount == 0) {
                    $('#tableview-submit-excel').prop("disabled", false);
                }
            }
            // $('#log').append('New change on cell ' + cellName + ' to: ' + value + '<br>');
        }
    }
    var tmLoaded = function (instance) {
        tmFirstTimeLoad = false;
    }

    tmSheet = jexcel(document.getElementById('tableview-tm-spreadsheet'), {
        data: tableviewTmDataArray,
        tableOverflow: true,
        // lazyLoading: true,
        tableWidth: '100%',
        tableHeight: '69vh',
        freezeColumns: 2,
        columns: columns,
        // allowComments: true,
        // persistance: '/jexcel/v4/save',
        onchange: tmChanged,
        onload: tmLoaded,
        updateTable: function (instance, cell, col, row, val, label, cellName) {
            cell.setAttribute('id', "tm" + cellName);
            if (tmFirstTimeLoad && col <= 4 && tmNodesDataArray.length >0 && tmNodesDataArray[row] != undefined && (value = tmNodesDataArray[row][1][tmKeyNames[col] + "_error"]) !== undefined) {
                let newA = document.createElement('a');
                newA.href = "#tm" + cellName;
                newA.setAttribute("id", "tm" + cellName + "_a")
                let newspan = document.createElement('span');
                newspan.innerHTML = value;
                newA.appendChild(newspan);
                newA.setAttribute("onclick", "clickOnError(this,event)")
                newLine = document.createElement('br');
                document.getElementById('tm-errors').appendChild(newA).appendChild(newLine);
                cell.setAttribute("error_value", value);
                cell.style.backgroundColor = 'red';
                instance.jexcel.setComments(cellName, value);
                $('#tableview-submit-excel').prop("disabled", true);
            } else if (col > 4 && tmNodesDataArray.length >0) {
                // console.log(tmNodesDataArray[row][1])
                if (tmFirstTimeLoad && tmNodesDataArray[row] != undefined && tmNodesDataArray[row][1]['services'] != undefined && tmNodesDataArray[row][1]['services'].length > 0) {
                    for (const service of tmNodesDataArray[row][1]['services']) {
                        if (service.type === servicesType[col - 5] && (value = service.quantity_error) !== undefined) {
                            let newA = document.createElement('a');
                            newA.href = "#tm" + cellName;
                            newA.setAttribute("id", "tm" + cellName + "_a")
                            let newspan = document.createElement('span');
                            newspan.innerHTML = value;
                            newA.appendChild(newspan);
                            newA.setAttribute("onclick", "clickOnError(this,event)")
                            newLine = document.createElement('br');
                            document.getElementById('tm-errors').appendChild(newA).appendChild(newLine);

                            cell.setAttribute("error_value", value);
                            cell.style.backgroundColor = 'red';
                            instance.jexcel.setComments(cellName, value);
                            $('#tableview-submit-excel').prop("disabled", true);
                        }
                    }
                }
            }
            else if (tmFirstTimeLoad && localStorage.getItem("projectState") == 'creating') {
                instance.jexcel.setReadOnly(cellName, true);
            }
            // cell.style.overflow = 'hidden';
        },
        // onevent: function () {
        //     console.log(arguments);
        // }
    })
    if(tmSheet.getJson().length == 0){
        // $('#tm-spreadsheet').jexcel('insertRow');
        tmSheet.insertRow();
    }
    // document.getElementById('download').onclick = function () {
    //     console.log((tmSheet.getJson()));
    //     console.log(JSON.stringify(tmSheet.getData()));
    // }

    // if(localStorage.getItem("projectState") == "creating"){
    //     $('#tableview-toggle-spreadsheet').bootstrapToggle('off');
    //     $('.toggle').hide();
    // }else{
    //     $('#tableview-toggle-spreadsheet').bootstrapToggle('on');
    //     $('.toggle').show();
    // }

}

async function updatePtNodeNames(){
    ptNodeNames = []
    if (tableviewPtData.data != undefined && tableviewPtData.data.nodes != undefined && tableviewPtData.data.nodes.length > 0) {
        for (const data of tableviewPtData.data.nodes) {
            const newDataObj = Object.keys(data).reduce((object, key) => {
                if (key === "name") {
                    object[key] = data[key]
                }
                return object
            }, {})
            ptNodeNames.push(newDataObj.name);
        }
    }
}

async function submitPtExcel(){
    let physical = await getAllRecords("physical");
    physical[0].comment = $('#tableview-comment').val();
    physical[0].data = {
        "links": document.getElementById('tableview-pt-spreadsheet').jexcel[1].getJson(),
        "nodes": document.getElementById('tableview-pt-spreadsheet').jexcel[0].getJson()
    }
    let  action = physical[0].id == 0 ? "create":"update";
    await createOrUpdate("physical_topologies/",action, physical[0])
        .then(function(result){
            if(action == "create"){
                physical[0].id = result.body.id
                physical[0].version = 1
            } else
                physical[0].version = physical[0].version + 1
            updateElement("physical", physical[0]);
            toastr.success("successfully import Physical Topology data")

        })
        .catch(function(error){
            if(error.statusCode === 409) {
                let element = document.getElementById('pt-name');
                element.setCustomValidity(error.response.body.detail.detail)
                element.reportValidity()
                // return;
            }
            if(error.statusCode === 400)
                toastr.error((error.response.body.detail.detail))
        });
}

async function submitTmExcel(){
    let traffic = await getAllRecords("traffic");
    traffic[0].comment = $('#tableview-comment').val();
    let tmForsubmit = createTmForSubmit()
    traffic[0].data = tmForsubmit.data;
    let  action = traffic[0].id == 0 ? "create":"update";
     await createOrUpdate("traffic_matrices/", action, traffic[0])
        .then(function (result) {
            if(action == "create"){
                traffic[0].id = result.body.id
                traffic[0].version = 1
            } else
                traffic[0].version = traffic[0].version + 1
            updateElement("traffic", traffic[0]);
            toastr.success("successfully import Traffic Matrix data")
        })
        .catch(function (error) {
            if (error.statusCode === 409) {
                // alert("name is duplicate, please choose another name")
                let element = document.getElementById('pt-name');
                element.setCustomValidity(error.response.body.detail.detail)
                element.reportValidity()
                // return;
            }
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail.detail)
        });
}


async function submitExcelData(){
    if(localStorage.getItem("projectState") == "creating"){
        if(localStorage.getItem("createProjectStep") == 3){
            await savePtFixedExcelValues();
            await updatePtNodeNames();
            localStorage.setItem("createProjectStep",4);
            sendEvent('#create-project-modal-5', 4,"Continue",true)
            $('#create-project-modal-5').modal('show');

        }
        else if(localStorage.getItem("createProjectStep") == 5){
            await saveTmFixedExcelValues();
            localStorage.setItem("createProjectStep",6);
            sendEvent('#create-project-modal-5', 6,"Continue",true)
            $('#create-project-modal-5').modal('show');
        }
    }
    if(localStorage.getItem("projectState") == "loaded"){
        if(Offline.state == "up") {
            await updateTmExcelValues();
            await updatePtExcelValues();
            await submitPtExcel();
            await submitTmExcel();
        }else{
            await updateTmExcelValues();
            await updatePtExcelValues();
        }
    }
    $("#tableview-comment").val("");
}


async function savePtFixedExcelValues() {
    let project = await getAllRecords("project")
    let ptRecord = new Object();
    ptRecord.id = 0;
    ptRecord.name = $('#project-topology-name').val();
    ptRecord.project = project[0].name
    ptRecord.comment = $('#tableview-comment').val();
    ptRecord.data = {
        "links": document.getElementById('tableview-pt-spreadsheet').jexcel[1].getJson(),
        "nodes": document.getElementById('tableview-pt-spreadsheet').jexcel[0].getJson()
    }
    await addElement('physical', ptRecord);

}

async function saveTmFixedExcelValues() {
    let project = await getAllRecords("project")
    let tmRecord = new Object();
    tmRecord.id = 0;
    tmRecord.name =  (Array.from($(`[name='tmradio']`)).filter(e=>e.checked))[0].id == 'tm-enter' ? $('#project-enter-name').val():$('#project-traffic-name').val() ;
    tmRecord.project = project[0].name
    tmRecord.comment = $('#tableview-comment').val();
    let tableData = createTmForSubmit()
    tmRecord.data = tableData.data
    await addElement('traffic', tmRecord);

}


async function updatePtExcelValues() {
    let physical = await getAllRecords("physical")
    physical[0].comment = $('#tableview-comment').val();
    physical[0].data = {
        "links": document.getElementById('tableview-pt-spreadsheet').jexcel[1].getJson(),
        "nodes": document.getElementById('tableview-pt-spreadsheet').jexcel[0].getJson()
    }
    tableviewPtData["data"] = physical[0].data;
    await updateElement('physical', physical[0]);

}

async function updateTmExcelValues() {
    let traffic = await getAllRecords("traffic")
    traffic[0].comment = $('#tableview-comment').val();
    let tmForsubmit = createTmForSubmit()
    traffic[0].data = tmForsubmit.data;
    tableviewTmData["data"] = traffic[0].data;
    await updateElement('traffic', traffic[0]);

}

function createTmForSubmit(){
    let tmDataForSubmit = {
        "comment": $('#tm-comment').val(),
        "name": $('#project-traffic-name').val(),
        "data": {
            "demands": {}
        }
    }
    let demandIndex = 1;
    let serviceIdList = 1;
    for(const demand of tmSheet.getJson() ){
        const newDataObj = Object.keys(demand).reduce((object, key) => {
            if(new RegExp(servicesType.join("|")).test(key)) {
                if (demand[key] != '' ) {
                    if (('services' in object) == false){
                        object["services"] = []
                    }
                    let serviceType = key.substring(0, key.lastIndexOf("_"))
                    let serviceKey =  key.substring(key.lastIndexOf("_")+1, key.length)

                    if(object["services"].find( p => p.type === serviceType) != undefined){
                        object["services"].find( p => p.type === serviceType && ( p[serviceKey] = demand[key] , true ) );
                    }
                    else{
                        object["services"].push({
                            'type' : serviceType
                        })
                        object["services"].find( p => p.type === serviceType && ( p[serviceKey] = demand[key] , true ) );
                    }
                    let newObject = []
                    for (let service of object["services"]){
                        service["service_id_list"] =[]
                        for(let i = 0;i<service["quantity"];i++) {
                            service["service_id_list"][i] = serviceIdList.toString();
                            serviceIdList++;
                        }
                        newObject.push(service)
                    }
                    // object["services"][serviceKey] = demand[key]
                }
            }else{
                object[key] = demand[key];
            }
            return object
        }, {})
        // newDataObj["id"] = demandIndex++;
        // tmDataForSubmit["traffic_matrix"]["demands"].push(newDataObj);
        newDataObj["id"] = demandIndex;
        tmDataForSubmit["data"]["demands"][demandIndex] = newDataObj;
        demandIndex++;
    }
    // console.log(tmDataForSubmit)

    return tmDataForSubmit;

}


$(function() {
    $('#tableview-toggle-spreadsheet').change(function() {
        // if (localStorage.getItem('projectState') != "creating") {
        if(document.getElementById('tableview-pt-spreadsheet').children[0] != undefined) {
            let selectedSheet = Number(document.getElementById('tableview-pt-spreadsheet').children[0].querySelector('.selected').getAttribute('data-spreadsheet'));
            if( $(this).prop('checked')) {
                document.getElementById('tableview-pt-spreadsheet').style.display = "block";
                document.getElementById('tableview-tm-spreadsheet').style.display = "none";
                document.getElementById('tm-errors').style.display = "none";
                if (selectedSheet === 0) {
                    document.getElementById('pt-nodes-errors').style.display = "block";
                    document.getElementById('pt-links-errors').style.display = "none";
                } else {
                    document.getElementById('pt-nodes-errors').style.display = "none";
                    document.getElementById('pt-links-errors').style.display = "block";
                }
            }else{
                document.getElementById('tableview-tm-spreadsheet').style.display = "block";
                document.getElementById('tableview-pt-spreadsheet').style.display = "none";
                document.getElementById('tm-errors').style.display = "block";
                document.getElementById('pt-nodes-errors').style.display = "none";
                document.getElementById('pt-links-errors').style.display = "none";
            }
        }else if(document.getElementById('tableview-pt-spreadsheet').children[0] == undefined){
            document.getElementById('tableview-tm-spreadsheet').style.display = "block";
            document.getElementById('tableview-pt-spreadsheet').style.display = "none";
            document.getElementById('tm-errors').style.display = "block";
            document.getElementById('pt-nodes-errors').style.display = "none";
            document.getElementById('pt-links-errors').style.display = "none";
        }
            // $('#console-event').html('Toggle: ' + $(this).prop('checked'))
        // }
        // else{
        //     document.getElementById('tableview-tm-spreadsheet').style.display = "block";
        //     document.getElementById('tableview-pt-spreadsheet').style.display = "none";
        //     document.getElementById('tm-errors').style.display = "block";
        //     document.getElementById('pt-nodes-errors').style.display = "none";
        //     document.getElementById('pt-links-errors').style.display = "none";
        // }
    })
})

