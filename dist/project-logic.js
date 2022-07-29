let projectData;
$(window).on('load', function () {
    if (!window.location.href.includes("table-view")) {
        setTimeout(async function () {
            if (localStorage.getItem("projectState") == 'loaded') {
                $.confirm({
                    animation: 'zoom',
                    closeAnimation: 'scale',
                    title: 'Load last project',
                    content: 'Do you want to load last project?',
                    buttons: {
                        confirm: async function () {
                            //projectData = localStorage.getItem("projectData");
                            let project = await getAllRecords("project")
                            if (project[0].id != 0) {
                                $('#add-designer-toggler').show();
                            }
                            document.getElementById("project-info-box").innerHTML = project[0].name;
                            let physical = await getAllRecords("physical")
                            console.log('physical = ', physical)
                            if (physical[0].data !== undefined && physical[0].data.nodes.length > 0)
                                drawPhysicalTopology(physical[0].data);
                            if (physical[0].id != 0) {
                                $('#history-btn').show();
                            }
                            $('#top-navbar').show();
                            $('#draw-topology-toggler').show();

                            $('#table-view-toggler').show();

                            if (physical != undefined && physical[0].data != undefined) {
                                tableviewPtData["data"] = physical[0].data;
                                ptOtherData = physical[0];
                            }
                            let traffic = await getAllRecords("traffic")
                            if (traffic != undefined && traffic[0].data != undefined) {
                                tableviewTmData["data"] = traffic[0].data;
                                tmOtherData = traffic[0];
                            }
                            await initTableView();
                            let cluster = await getAllRecords("cluster")
                            if (cluster != undefined) {
                                for (let clusterData of cluster[0].clusters) {
                                    for (let i = 0; i < clusterData.data.gateways.length; i++) {
                                        var newNode = new L.Marker;
                                        MapVar.eachLayer(l => {
                                            if (l instanceof L.Marker && getLayerName(l) === clusterData.data.gateways[i]) {
                                                // console.log(l);
                                                newNode = l;
                                            }

                                        });
                                        change_icon(get_name(newNode), newNode._latlng, clusterData.data.color, 1, "normal");
                                        delete_node(newNode);
                                        // handleNodeTypeAndColor(newNode, clusterData.data.color, 1, "gateway");
                                    }
                                    for (let i = 0; i < clusterData.data.subnodes.length; i++) {
                                        var newNode = new L.Marker;
                                        MapVar.eachLayer(l => {
                                            if (l instanceof L.Marker && getLayerName(l) === clusterData.data.subnodes[i]) {
                                                // console.log(l);
                                                newNode = l;
                                            }

                                        });
                                        change_icon(get_name(newNode), newNode._latlng, clusterData.data.color, 0.5, "normal");
                                        delete_node(newNode);
                                        // handleNodeTypeAndColor(newNode, clusterData.data.color, 0.5, "subnode");
                                    }
                                }
                            }
                        },
                        cancel: function () {

                        }
                    }
                });
            }
        }, 200);
    }
});

$(async function () {
    db = await idb.openDb(PROJECT_DB, 1, db => {
        TABLES.map(table => db.createObjectStore(table, { keyPath: 'name' }));
    });
});

function closeProject() {
    $.confirm({
        animation: 'zoom',
        closeAnimation: 'scale',
        escapeKey: true,
        backgroundDismiss: true,
        title: 'Close project?!',
        content: 'do you want to close project?, your unsaved changes will be lost!!',
        buttons: {
            confirm: function () {
                myFeatureGroup.eachLayer(function (layer) {
                    myFeatureGroup.removeLayer(layer);
                });
                links_groupfeature.eachLayer(function (layer) {
                    links_groupfeature.removeLayer(layer);
                });
                localStorage.setItem("projectState", 'closed');
                localStorage.setItem("createProjectStep", '1');
                const tables = ["traffic", "physical", "project", "cluster"];
                clearAllTables(tables);
                toastr.success("project was successfully closed!");
                ptNodeNames = [];
                tableviewPtData = {}
                tableviewTmData = {}
                tmOtherData = {}
                ptOtherData = {}
                if (document.getElementById('topology-map').style.display === "none") {
                    // $('#table-view-toggler').click();
                    $('#table-view-toggler a:first-child').click();
                }
                $('#top-navbar').hide();
                $('#draw-topology-toggler').hide();
                $('#add-designer-toggler').hide();
                $('#table-view-toggler').hide();
                $('#history-btn').hide();
                $('#project-info-box').hide();
                return true;
            },
            cancel: function () {
                this.close();
                return false;
            }
        }
    });
}

async function prepareDataForSubmit(dataTable, comment) {
    let dataObj = await getAllRecords(dataTable)
    const action = dataObj[0].id == 0 ? "create" : "update";
    dataObj[0].comment = "-"
    if (action == "create")
        delete dataObj[0].id
    if (dataObj[0].project != undefined)
        delete dataObj[0].project
    if (comment != null)
        dataObj[0].comment = comment
    let target = ""
    switch (dataTable) {
        case "physical": {
            target = "physical_topologies/";
            break;
        }
        case "traffic": {
            target = "traffic_matrices/";
            break;
        }
    }
    return new Promise(async function (resolve, reject) {
        await createOrUpdate(target, action, dataObj[0])
            .then(async function (result) {
                if (action == "create") {
                    dataObj[0].id = result.body.id
                    dataObj[0].version = 1
                } else
                    dataObj[0].version = dataObj[0].version + 1

                await updateElement(dataTable, dataObj[0]);
                resolve([true, dataObj[0]])
            })
            .catch(function (error) {
                if (error.statusCode === 409) {
                    toastr.error(error.response.body.detail)
                    reject([false, error.response.body.detail])
                }
                if (error.statusCode === 400) {
                    toastr.error(error.response.body.detail)
                    reject([false, error.response.body.detail])
                }
            });
    });
}

$("form#submit-project-form").submit(async function (e) {
    e.preventDefault();
    if (Offline.state == "up") {

        var item = this.elements.item(0);
        const comment = item.value;
        let project = await getAllRecords("project")
        physicalData = await prepareDataForSubmit("physical", comment);
        if (physicalData[0]) {
            project[0].pt_id = physicalData[1].id;
            project[0].current_pt_version = physicalData[1].version;

        } else {
            toastr.error(physicalData[1]);
            return;
        }

        trafficData = await prepareDataForSubmit("traffic", comment)
        if (trafficData[0]) {
            project[0].tm_id = trafficData[1].id;
            project[0].current_tm_version = trafficData[1].version;

        } else {
            toastr.error(trafficData[1]);
            return;
        }
        console.log(project[0])
        await createOrUpdate("projects/", project[0].id == 0 ? "create" : "update", project[0], project[0].id == 0 ? null : project[0].id)
            .then(async function (result) {
                let operation = project[0].id == 0 ? "create" : "update";
                if (project[0].id == 0) {
                    project[0].id = result.body.id;
                }
                if (operation == "create") {
                    project[0].version = 1
                } else {
                    project[0].version = project[0].version + 1
                }
                await updateElement("project", project[0]);
                $('#submit-project').modal('hide');
                toastr.success("project changes successfully saved!");
                document.getElementById('add-designer-toproject-btn').style.display = "block";
                $("#add-designer-toproject-btn").show();
                // alert("project successfully created");

            })
            .catch(function (error) {
                if (error.statusCode === 409) {
                    toastr.error(error.response.body.detail)
                    return
                }
                if (error.statusCode === 400) {
                    toastr.error(error.response.body.detail)
                    return
                }
            });

    } else {
        console.log("hideeeee")
        toastr.error("you are currently offline, can not submit to server")
        $('#submit-project').modal('hide');
    }
})


async function saveProject() {
    if (Offline.state == "up") {
        let project = await getAllRecords("project")
        physicalData = await prepareDataForSubmit("physical", $('#project-draw-comment').val() != "" ? $('#project-draw-comment').val() : null);
        if (physicalData[0]) {
            project[0].pt_id = physicalData[1].id;
            project[0].current_pt_version = 1;

        } else {
            toastr.error(physicalData[1]);
            return;
        }

        trafficData = await prepareDataForSubmit("traffic", $('#project-enter-comment').val() != "" ? $('#project-enter-comment').val() : null)
        if (trafficData[0]) {
            project[0].tm_id = trafficData[1].id;
            project[0].current_tm_version = 1;

        } else {
            toastr.error(trafficData[1]);
            return;
        }

        await createOrUpdate("projects/", "create", project[0])
            .then(async function (result) {
                project[0].id = result.body.id;
                console.log("IDDD:", project[0].id);
                localStorage.setItem("project_id", JSON.stringify(project[0].id));
                console.log("saved:");
                //localStorage.setItem("project_id",JSON.stringify(project[0].id));
                project[0].version = 1
                $('#history-btn').show();
                await updateElement("project", project[0]);
                document.getElementById("project-info-box").innerHTML = project[0].name;
                // $('#')
                $('#project-info-box').show();
            })
            .catch(function (error) {
                if (error.statusCode === 409) {
                    toastr.error(error.response.body.detail)
                    return
                }
                if (error.statusCode === 400) {
                    toastr.error(error.response.body.detail)
                    return
                }
            });

    } else {
        toastr.error("you are currently offline, project saved locally");
    }
}

function createOrUpdate(elementPath, mode, data, id = null) {
    if (id == null && elementPath == "physical_topologies/"){
        console.log(id)
        console.log(data, "pyhsycal topologies")
        localStorage.removeItem("physical_topologies")
        localStorage.setItem("physical_topologies", JSON.stringify(data.data))
    }

    console.log(serverAddr + elementPath + (id != null ? "?id=" + id : ""))
    return new Promise(function (resolve, reject) {
        const request = {
            url: serverAddr + elementPath + (id != null ? "?id=" + id : ""),
            method: mode == "create" ? "POST" : "PUT",
            body: JSON.stringify(data),
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${userData.token_type} ${userData.access_token}`
            },
        };
        (async () => {
            try {
                await SwaggerClient.http(request).then(response => {
                    if (response.status === 200 || response.status === 201) {
                        resolve(response);
                    }
                });
            } catch (error) {
                if (error.statusCode === 401) {
                    await refreshToken();
                    await createOrUpdate(elementPath, modal, data);
                }
                else
                    reject(error);
            } finally {
                // clearTimeout(timeout);
            }
        })();
    });
}

function deleteRecord(elementPath, query) {
    return new Promise(function (resolve, reject) {
        const request = {
            url: serverAddr + elementPath,
            method: 'DELETE',
            query: query,
            headers: {
                'accept': 'application/json',
                'Authorization': `${userData.token_type} ${userData.access_token}`
            },
        };
        (async () => {
            try {
                await SwaggerClient.http(request).then(response => {
                    if (response.status === 200 || response.status === 201) {
                        resolve(response);
                    }
                });
            } catch (error) {
                if (error.statusCode === 401) {
                    await refreshToken();
                    await deleteRecord(elementPath, query);
                } else
                    reject(error);
            } finally {
                // clearTimeout(timeout);
            }
        })();
    });
}

// import physical topology data from excel file
$("form#ptdata").submit(async function (e) {
    e.preventDefault();
    importFromExcel("physical_topologies/", this)
        .then(function (response) {
            if (response.status != undefined && response.status == 200) {
                // drawPhysicalTopology(response.body.physical_topology);
                // localStorage.setItem("ptData", response.body.physical_topology);
                // localStorage.setItem("ptId", response.body.id);
                toastr.success("successfully load excel file")
                // alert("successfully load excel file")
                $('#import-physical').modal('hide');
            }
        })
        .catch(function (error) {
            if (error.statusCode === 409) {
                toastr.error(error.response.body.detail.detail)
                // alert(error.response.body.error_msg)
            }
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail.detail)
            // alert(error.response.body.detail)
            // console.log(error.response)
        });
})

function importFromExcel(elementPath, form) {
    return new Promise(function (resolve, reject) {
        // e.preventDefault();
        var formData = new FormData(form);
        // formData.append('PT_binary', document.getElementById('myFile').files[0]);
        const request = {
            url: serverAddr + elementPath + "from_excel/",
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data ,type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Authorization': `${userData.token_type} ${userData.access_token}`
            },
        };
        (async () => {
            try {
                await SwaggerClient.http(request).then(response => {
                    // console.log(response);
                    if (response.status === 200) {
                        resolve(response);
                    }
                });
            } catch (error) {
                if (error.statusCode === 401) {
                    await refreshToken();
                    await importFromExcel(elementPath, form);
                } else
                    reject(error);
            } finally {
                // clearTimeout(timeout);
            }
        })();
    });
}


function checkForExcel(elementPath, form) {
    return new Promise(function (resolve, reject) {
        // e.preventDefault();
        var formData = new FormData(form);
        // formData.append('PT_binary', document.getElementById('myFile').files[0]);
        const request = {
            url: serverAddr + elementPath + "check_excel/",
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data ,type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Authorization': `${userData.token_type} ${userData.access_token}`
            },
        };
        (async () => {
            try {
                await SwaggerClient.http(request).then(response => {
                    // console.log(response);
                    if (response.status === 200) {
                        resolve(response);
                    }
                });
            } catch (error) {
                if (error.statusCode === 401) {
                    await refreshToken();
                    await checkForExcel(elementPath, form);
                } else if (error.statusCode === 404) {
                    toastr.error("there is problem in excel format")
                } else
                    reject(error);
            } finally {
                // clearTimeout(timeout);
            }
        })();
    });
}
// import matrix data from excel file
$("form#matrixdata").submit(function (e) {
    e.preventDefault();
    importFromExcel("traffic_matrices/", this)
        .then(function (response) {
            if (response.status != undefined && response.status == 200) {
                // localStorage.setItem("tmData", response.body.traffic_matrix);
                // localStorage.setItem("tmId", response.body.id);
                toastr.success("successfully load excel file")
                // alert("successfully load excel file")
                $('#import-matrix').modal('hide');
            }
        })
        .catch(function (error) {
            if (error.statusCode === 409) {
                toastr.error(error.response.body.detail.detail)
                // alert(error.response.body.error_msg)
            }
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail.detail)
            // alert(error.response.body.detail)
            // console.log(error.response)
        });
})


// get physical topology data by id and version
//TODO:: create new function if version not available
function getPtData(ptId, version = null, caller) {
    var callerMethod = caller
    let loadQuery = {
        id: {
            value: ptId
        },
        version: {
            value: version
        }
    }

    if (version == null) {
        delete loadQuery["version"];
    }
    const request = {
        url: serverAddr + "physical_topologies/",
        method: 'GET',
        query: loadQuery,
        headers: {
            'accept': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    (async () => {
        try {
            await SwaggerClient.http(request).then(async response => {
                if (response.status === 200) {
                    if (callerMethod == "project") {
                        console.log('physical_topologies service is start...', response.body[0].data)
                        drawPhysicalTopology(response.body[0].data);

                        //save location of nodes in a localstorage when project is loading
                        localStorage.setItem('physical_topologies', JSON.stringify(response.body[0].data));


                        let project = await getAllRecords("project")
                        let physical = new Object();
                        $('#history-btn').show();
                        physical = response.body[0];
                        physical.project = project[0].name
                        await addElement("physical", physical);
                        tableviewPtData["data"] = response.body[0].data;
                        initPtTableView();
                        initTmTableView();
                    } else if (callerMethod == "history") {
                        let i = 1
                        localStorage.setItem("physicalHistory", JSON.stringify(response.body))
                        $("#pt-history-table>tbody").html("");
                        for (let data of response.body) {
                            let historyRow = "<tr>" +
                                "<th scope=\"row\">" + i + "</th>\n" +
                                "                        <td>" + data.version + "</td>\n" +
                                "                        <td>" + data.create_date + "</td>\n" +
                                "                        <td>" + (data.comment == undefined ? "-" : data.comment) + "</td>\n" +
                                "                        <td>\n";

                            if (response.body.indexOf(data) != (response.body.length - 1))
                                historyRow +=
                                    "                            <button type=\"button\" class=\"btn btn-primary\" onclick=\"viewPhysicalHistory(this, '" + data.id + "'," + data.version + "," + i + ")\"><i class=\"far fa-eye\"></i></button>\n" +
                                    "                            <button type=\"button\" class=\"btn btn-danger\" onclick=\"removePhysicalHistory(this, '" + data.id + "'," + data.version + "," + i + ")\"><i class=\"far fa-trash-alt\"></i></button>\n";
                            historyRow += "                        </td>\n" +
                                "</tr>"
                            $("#pt-history-table>tbody").append(historyRow);
                            i++;

                        }

                        // localStorage.setItem("ptData", response.data);
                        // localStorage.setItem("ptId", ptId);
                    }
                }
            })
        } catch (error) {
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail.detail)
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail.detail)
            if (error.statusCode === 401) {
                await refreshToken();
                await getPtData(ptId, version, caller);
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}

// get traffic matrix  data by id
function getTmData(tmId, version, caller) {
    var callerMethod = caller
    let loadQuery = {
        id: {
            value: tmId
        },
        version: {
            value: version
        }
    }
    if (version == null) {
        delete loadQuery["version"];
    }
    const request = {
        url: serverAddr + "traffic_matrices/",
        method: 'GET',
        query: loadQuery,
        headers: {
            'accept': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    (async () => {
        try {
            await SwaggerClient.http(request).then(async response => {
                if (response.status === 200) {
                    if (callerMethod == "project") {
                        let project = await getAllRecords("project")
                        let traffic = new Object();
                        traffic = response.body[0];
                        $('#history-btn').show();
                        traffic.project = project[0].name
                        await addElement("traffic", traffic);
                        tableviewTmData["data"] = response.body[0].data
                        initTmTableView();
                    }
                    else if (callerMethod == "history") {
                        let i = 1
                        localStorage.setItem("trafficHistory", JSON.stringify(response.body))
                        $("#tm-history-table>tbody").html("");
                        for (let data of response.body) {
                            let historyRow = "<tr>" +
                                "<th scope=\"row\">" + i + "</th>\n" +
                                "                        <td>" + data.version + "</td>\n" +
                                "                        <td>" + data.create_date + "</td>\n" +
                                "                        <td>" + (data.comment == undefined ? "-" : data.comment) + "</td>\n" +
                                "                        <td>\n";

                            if (response.body.indexOf(data) != (response.body.length - 1))
                                historyRow +=
                                    "                            <button type=\"button\" class=\"btn btn-primary\" onclick=\"viewTrafficHistory(this, '" + data.id + "'," + data.version + "," + i + ")\"><i class=\"far fa-eye\"></i></button>\n" +
                                    "                            <button type=\"button\" class=\"btn btn-danger\" onclick=\"removeTrafficHistory(this, '" + data.id + "'," + data.version + "," + i + ")\"><i class=\"far fa-trash-alt\"></i></button>\n";
                            historyRow += "                        </td>\n" +
                                "</tr>"
                            $("#tm-history-table>tbody").append(historyRow);
                            i++;

                        }

                        // localStorage.setItem("ptData", response.data);
                        // localStorage.setItem("ptId", ptId);
                    }
                    // localStorage.setItem("tmData", response.data);
                    // localStorage.setItem("tmId", tmId);
                }
            });
        } catch (error) {
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail.detail)
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail.detail)
            if (error.statusCode === 401) {
                await refreshToken();
                await getTmData(tmId, version, caller);
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();

}

function getAllPhysicalTopologyList(listTagId) {
    let physicalRowsTag = "";
    const request = {
        url: serverAddr + "physical_topologies/read_all/",
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    (async () => {
        try {
            await SwaggerClient.http(request).then(response => {
                if (response.status === 200) {
                    $('#' + listTagId).empty();
                    // let physicalListTag = document.getElementById(listTagId);
                    for (const key of response.body) {
                        $('#' + listTagId).append(`<input type="radio" id="${key.id}" name="pt-server-list-radio">\n` +
                            `                    <label for="${key.id}">${key.name}</label><br/>`);
                    }
                    // physicalListTag.innerHTML = physicalRowsTag;
                    $('#' + listTagId).first().find("input").first().prop("checked", true);
                    localStorage.setItem('pt-server-list', response.data);
                }

            });
        } catch (error) {
            $('#' + listTagId).empty();
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail.detail)
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail.detail)
            if (error.statusCode === 404) {
                $('#' + listTagId).append("<span>There is not any physical on server</span>")
                $('#continue-step-3').hide();
            }
            if (error.statusCode === 401) {
                await refreshToken();
                await getAllPhysicalTopologyList(listTagId);
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}

function getAllTrafficMatrixList(listTagId) {
    let matrixRowsTag = "";
    const requestMatrix = {
        url: serverAddr + "traffic_matrices/read_all/",
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    (async () => {
        try {
            await SwaggerClient.http(requestMatrix).then(response => {
                if (response.status === 200) {
                    $('#' + listTagId).empty();
                    // let matrixListTag = document.getElementById(listTagId);
                    for (const key of response.body) {
                        $('#' + listTagId).append(`<input type="radio" id="${key.id}" name="tm-server-list-radio">\n` +
                            `                    <label for="${key.id}">${key.name}</label><br/>`);
                    }
                    // matrixListTag.innerHTML = matrixRowsTag;
                    $('#' + listTagId).first().find("input").first().prop("checked", true);
                    localStorage.setItem('tm-server-list', response.data);

                }
            });
        } catch (error) {
            $('#' + listTagId).empty();
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail.detail)
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail.detail)
            if (error.statusCode === 404) {
                $('#' + listTagId).append("<span>There is not any traffic matrix on server</span>")
                $('#continue-step-5').hide();
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}

// async function createProject() {
//     if (localStorage.getItem("changedProject")) {
//         if (confirm("You don't save project, do you want to continue?")) {
//             //projectData = localStorage.getItem("projectData");
//             localStorage.setItem("projectData", null);
//             localStorage.setItem("changedProject", null);
//         }
//     }
//     const ptradios = Array.from($(`[name='ptradio']`));
//     const ptcheckedRadio = ptradios.filter(e=>e.checked);
//     const tmradios = Array.from($(`[name='tmradio']`));
//     const tmcheckedRadio = tmradios.filter(e=>e.checked);
//     var projectPtId = null;
//     var projectTmId = null;
//      if(ptcheckedRadio[0].id == 'pt-server'){
//         const radios = Array.from($(`[name='pt-server-list-radio']`));
//         projectPtId = radios.filter(e=>e.checked)[0].id;
//     }
//     else if(ptcheckedRadio[0].id == 'pt-excel'){
//          projectPtId = localStorage.getItem("oncreate-pt-id")
//     }
//     else if(ptcheckedRadio[0].id == 'pt-draw'){
//          projectPtId = localStorage.getItem("oncreate-pt-id")
//     }
//     if(tmcheckedRadio[0].id == 'tm-server'){
//         const radios = Array.from($(`[name='tm-server-list-radio']`));
//         projectTmId = radios.filter(e=>e.checked)[0].id;
//         // console.log(tmServerCheckedRadio)
//     }
//     else if(tmcheckedRadio[0].id == 'tm-excel'){
//         projectTmId = localStorage.getItem("oncreate-tm-id")
//     }
//     else if(tmcheckedRadio[0].id == 'tm-enter'){
//         projectTmId = localStorage.getItem("oncreate-tm-id")
//     }
//     let formData = new FormData(document.getElementById('project-form'));
//     formData = JSON.stringify(Object.fromEntries(formData));
//     formData = JSON.parse(formData);
//     formData["pt_id"] = projectPtId ;
//     formData["pt_version"] = 1 ;
//     formData["tm_id"] = projectTmId ;
//     formData["tm_version"] = 1 ;
//
//     await createOrUpdate("projects/","create", formData)
//         .then(function(result){
//             localStorage.setItem('projectId',result.body.project_id);
//             // localStorage.setItem("projectData",JSON.stringify(result.body));
//             // MapVar.eachLayer(function(layer) {
//             //     if (!!layer.toGeoJSON) {
//             //         MapVar.removeLayer(layer);
//             //     }
//             // });
//             myFeatureGroup.eachLayer(function (layer) {
//                 myFeatureGroup.removeLayer(layer);
//             });
//             links_groupfeature.eachLayer(function (layer) {
//                 links_groupfeature.removeLayer(layer);
//             });
//             getPtData(projectPtId,null);
//             getTmData(projectTmId,null);
//
//             $('#create-project-modal-5').modal('hide');
//             toastr.success("project successfully created")
//             // alert("project successfully created");
//
//         })
//         .catch(function(error){
//             if(error.statusCode === 409) {
//                 // alert("name is duplicate, please choose another name")
//                 let form = document.getElementById('project-form')
//                 let element = form.elements[0];
//                 element.setCustomValidity(error.response.body.error_msg)
//                 element.reportValidity();
//                 actionValidated = false;
//             }
//             if(error.statusCode === 400)
//                 toastr.error(error.response.body.detail)
//                 // alert(error.response.body.error_msg)
//         });
//
//     document.getElementById("createProjectBtn").disabled = true;
//     // $('#new-project').modal('toggle');
// }

// $("form#create-project").submit(function (e) {
function createProject(e) {
    e.preventDefault();
    let formData = new FormData(this);
    formData = JSON.stringify(Object.fromEntries(formData));
    formData = JSON.parse(formData);
    formData["pt_id"] = selectedPhysical;
    formData["tm_id"] = selectedMatrix;
    // formData.set("pt_id", selectedPhysical);
    // formData.set("tm_id", selectedMatrix);
    // formData = JSON.stringify(Object.fromEntries(formData));
    const request = {
        url: serverAddr + "projects/",
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    (async () => {
        try {
            await SwaggerClient.http(request).then(response => {
                if (response.status === 201) {
                    loadProject(response.body.project_id);
                    localStorage.setItem("project_id", JSON.stringify(response.body.project_id));
                    toastr.success("successfully create project");
                    // alert("successfully create project");
                    $('#create-project').modal('hide');
                }
            });
        } catch (error) {
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail);
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail)
            if (error.statusCode === 401) {
                await refreshToken();
                await createProject(event);
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();

}


$("form#loadState").submit(function (e) {
    e.preventDefault();
    let formData = new FormData(this);
    let projectFile = formData.get("project-file");
    var reader = new FileReader();
    $.confirm({
        animation: 'zoom',
        closeAnimation: 'scale',
        escapeKey: true,
        backgroundDismiss: true,
        title: 'Close project?!',
        content: 'do you want to close project?, your unsaved changes will be lost!!',
        buttons: {
            confirm: function () {
                myFeatureGroup.eachLayer(function (layer) {
                    myFeatureGroup.removeLayer(layer);
                });
                links_groupfeature.eachLayer(function (layer) {
                    links_groupfeature.removeLayer(layer);
                });
                localStorage.setItem("projectState", 'closed');
                localStorage.setItem("createProjectStep", '1');
                const tables = ["traffic", "physical", "project", "cluster"];
                clearAllTables(tables);
                toastr.success("project was successfully closed!");
                ptNodeNames = [];
                tableviewPtData = {}
                tableviewTmData = {}
                tmOtherData = {}
                ptOtherData = {}
                if (document.getElementById('topology-map').style.display === "none") {
                    // $('#table-view-toggler').click();
                    $('#table-view-toggler a:first-child').click();
                }
                $('#top-navbar').hide();
                $('#draw-topology-toggler').hide();
                $('#add-designer-toggler').hide();
                $('#table-view-toggler').hide();
                $('#history-btn').hide();
                $('#project-info-box').hide();
                reader.onload = async function (e) {
                    if (e.target.result) {
                        let fileData = e.target.result;
                        let projectData = JSON.parse(fileData)
                        if (projectData.project != undefined) {
                            await addElement('project', projectData.project);
                        }
                        if (projectData.physical != undefined) {
                            await addElement('physical', projectData.physical);
                            if (projectData.physical.data != undefined && projectData.physical.data.nodes.length > 0) {
                                drawPhysicalTopology(projectData.physical.data);
                                tableviewPtData["data"] = projectData.physical.data
                                await updatePtNodeNames();
                                await initPtTableView();
                            }
                        }
                        if (projectData.traffic != undefined) {
                            await addElement('traffic', projectData.traffic);
                            tableviewTmData["data"] = projectData.traffic;
                            await initTmTableView();
                        }
                        $('#top-navbar').show();
                        $('#draw-topology-toggler').show();
                        if (projectData.project.id != 0) {
                            $('#add-designer-toggler').show();
                        }
                        $('#table-view-toggler').show();
                        $("#load-state").modal('hide');

                        localStorage.setItem("projectState", "loaded")
                        $(".side-close-icon").click();

                        toastr.success("import project was successfully");
                    }
                };

                reader.readAsText(projectFile);
            },
            cancel: function () {
                this.close();
                return false;
            }
        },
    });

})





async function exportToJsonFile() {
    // let jsonData = localStorage.getItem("projectData");
    // jsonData['ptData'] = localStorage.getItem("ptData");
    // jsonData['ptId'] = localStorage.getItem("ptId");
    // jsonData['tmData'] = localStorage.getItem("tmData");
    // jsonData['tmId'] = localStorage.getItem("tmId");
    // jsonData = document.getElementById('tableview-frame').contentWindow.tmSheet.getJson();
    jsonData = {}
    let tm = createTmForSubmit();
    let project = await getAllRecords("project")
    let physical = await getAllRecords("physical")
    let traffic = await getAllRecords("traffic")
    jsonData['project'] = project[0]
    jsonData["physical"] = physical[0]
    jsonData["traffic"] = traffic[0]
    let dataStr = JSON.stringify(jsonData);
    // let dataUri = 'data:application/json;charset=utf-8,'+ jsonData;
    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    // let exportFileDefaultName = (JSON.parse(jsonData)).name + '.json';
    let exportFileDefaultName = project[0].name + '.json';
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}


async function updateProjectPtOrTmVersion(elementType, newVersion) {
    let project = await getAllRecords("project");
    if (elementType == "physical") {
        project[0].current_pt_version = newVersion;
        updateElement("project", project[0])
    } else {
        project[0].current_tm_version = newVersion;
        updateElement("project", project[0])
    }
    await createOrUpdate("projects/", "update", project[0], project[0].id)
        .then(async function (result) {
            // alert("project successfully created");

        })
        .catch(function (error) {
            if (error.statusCode === 409) {
                toastr.error(error.response.body.detail)
                return
            }
            if (error.statusCode === 400) {
                toastr.error(error.response.body.detail)
                return
            }
        });
}

function loadProjectList() {
    const request = {
        url: serverAddr + "projects/read_all",
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    (async () => {
        try {
            await SwaggerClient.http(request).then(response => {
                if (response.status === 200) {
                    let projectRowsTag = "";
                    let projectListTag = document.getElementById("project-list");

                    $('#load-project').modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                    // $('#load-project').unbind('click');
                    $('#load-project').modal('toggle');
                    for (const key of response.body) {
                        projectRowsTag += '<div class="row" >\n' +
                            `                    <div class="col-md-6">${key.name}</div>\n` +
                            `                    <div class="col-md-6"><button type="submit" class="btn btn-primary btn-sm mb-2 " id="btn_${key.id}" onmousedown="loadProject('${key.id}');">load this</button> </div>\n` +
                            '                </div>'
                        // var value = response.data()[key];


                    }
                    projectListTag.innerHTML = projectRowsTag;
                }
            });
        } catch (error) {
            if (error.statusCode === 404)
                toastr.error(error.response.body.detail);
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail);
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail)
            if (error.statusCode === 401) {
                await refreshToken();
                await loadProjectList();
            }
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}

function delProjectList() {
    const request = {
        url: serverAddr + "projects/read_all",
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    (async () => {
        try {
            await SwaggerClient.http(request).then(response => {
                if (response.status === 200) {
                    let projectRowsTag = "";
                    let projectListTag = document.getElementById("project-list");

                    $('#load-project').modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                    // $('#load-project').unbind('click');
                    $('#load-project').modal('toggle');
                    for (const key of response.body) {
                        projectRowsTag += '<div class="row" >\n' +
                            `                    <div class="col-md-6">${key.name}</div>\n` +
                            `                    <div class="col-md-6"><button type="submit" class="btn btn-primary btn-sm mb-2 " id="btn_${key.id}" onmousedown="DelProject('${key.id}');">Delete</button> </div>\n` +
                            '                </div>'
                        // var value = response.data()[key];


                    }
                    projectListTag.innerHTML = projectRowsTag;
                }
            });
        } catch (error) {
            if (error.statusCode === 404)
                toastr.error(error.response.body.detail);
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail);
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail)
            if (error.statusCode === 401) {
                await refreshToken();
                await loadProjectList();
            }
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}


async function DelProject(projectId) {
    // console.log('Delete project is start...')
    temp = confirm("Are you sure you want to delete this project ?")
    const request = {
        url: serverAddr + "projects/",
        method: 'DELETE',
        query: {
            id: {
                value: projectId
            }
        },
        headers: {
            'accept': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    if (temp == true){
    await (async () => {
        try {
            await SwaggerClient.http(request).then(async response => {
                if (response.status === 200) {
                    toastr.success("project deleted successfully");
                    $('#load-project').modal('toggle');
                }
            });
        } catch (error) {
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail);
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail)
            if (error.statusCode === 401) {
                await refreshToken();
            }
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}
else{
    $('#load-project').modal('toggle');
}
}

async function loadProject(projectId) {
    console.log('load project is start...')
    let project = await getAllRecords("project")
    let closeStatus = false
    if (project != null) {
        closeStatus = closeProject();
    }
    // closeStatus = closeProject();
    if (project == null || closeStatus) {
        const request = {
            url: serverAddr + "projects/",
            method: 'GET',
            query: {
                id: {
                    value: projectId
                }
            },
            headers: {
                'accept': 'application/json',
                'Authorization': `${userData.token_type} ${userData.access_token}`
            },
        };
        await (async () => {
            try {
                await SwaggerClient.http(request).then(async response => {
                    if (response.status === 200) {
                        //get Project ID
                        localStorage.setItem("project_id", JSON.stringify(projectId));
                        console.log('loadProject in project-logic : ', response.body)
                        let recivedProject = response.body
                        await addElement("project", recivedProject);
                        // myFeatureGroup.eachLayer(function (layer) {
                        //     myFeatureGroup.removeLayer(layer);
                        // });
                        // links_groupfeature.eachLayer(function (layer) {
                        //     links_groupfeature.removeLayer(layer);
                        // });
                        // MapVar = null;
                        console.log('getPtData is start...');
                        // console.log(localStorage.getItem("physical_topologies"))
                        // localStorage.removeItem("physical_topologies")
                        await getPtData(response.body.pt_id, response.body.current_pt_version, "project");
                        console.log('getTmData is start...');
                        await getTmData(response.body.tm_id, response.body.current_tm_version, "project");
                        // console.log(localStorage.getItem("physical_topologies"))

                        $('#top-navbar').show();
                        $('#draw-topology-toggler').show();
                        $('#add-designer-toggler').show();
                        $('#table-view-toggler').show();
                        localStorage.setItem("projectState", "loaded")
                        $('#load-project').modal('hide');
                        toastr.success("project loaded successfully");
                        $(".side-close-icon").click();
                        let project = await getAllRecords("project")
                        project[0].id = projectId
                        await updateElement("project", project[0])
                        await loadProjectCluster(projectId);
                        // localStorage.setItem('grooming_id',)
                        document.getElementById("project-info-box").innerHTML = project[0].name;
                        $('#project-info-box').show();

                    }
                });
            } catch (error) {
                if (error.statusCode === 409)
                    toastr.error(error.response.body.detail);
                // alert("name is duplicate, please choose another name")
                if (error.statusCode === 400)
                    toastr.error(error.response.body.detail)
                if (error.statusCode === 401) {
                    await refreshToken();
                    await loadProject(projectId);
                }
                // console.log(error.response);
            } finally {
                // clearTimeout(timeout);
            }
        })();
    }
}

async function loadProjectCluster(projectId) {
    let loadQuery = {
        project_id: {
            value: projectId
        }
    }
    const request = {
        url: serverAddr + "clustering/manual/read_all",
        method: 'GET',
        query: loadQuery,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    try {
        await SwaggerClient.http(request).then(async response => {
            if (response.status === 200) {
                if (response.body.length > 0) {
                    for (let clusterData of response.body) {
                        for (let i = 0; i < clusterData.data.gateways.length; i++) {
                            var newNode = new L.Marker;
                            MapVar.eachLayer(l => {
                                if (l instanceof L.Marker && getLayerName(l) === clusterData.data.gateways[i]) {
                                    // console.log(l);
                                    newNode = l;
                                }

                            });
                            // (node, color, opacity, type)
                            change_icon(get_name(newNode), newNode._latlng, clusterData.data.color, 1, "normal");
                            delete_node(newNode);
                            // handleNodeTypeAndColor(newNode, response.body[0].data.color, 1, "gateway");
                        }
                        for (let i = 0; i < clusterData.data.subnodes.length; i++) {
                            var newNode = new L.Marker;
                            MapVar.eachLayer(l => {
                                if (l instanceof L.Marker && getLayerName(l) === clusterData.data.subnodes[i]) {
                                    // console.log(l);
                                    newNode = l;
                                }

                            });
                            change_icon(get_name(newNode), newNode._latlng, clusterData.data.color, 0.5, "normal");
                            delete_node(newNode);
                            // handleNodeTypeAndColor(newNode, response.body[0].data.color, 0.5, "subnode");
                        }
                    }
                }
                let cluster = {
                    "clusters": {

                    }
                }
                let project = await getAllRecords("project")

                cluster["clusters"] = response.body
                cluster["project_id"] = project[0].id
                await addElement("cluster", cluster)
            }
        })
    } catch (error) {
        // if(error.statusCode === 409)
        //     toastr.error(error.response.body.detail)
        // // alert("name is duplicate, please choose another name")
        // if(error.statusCode === 400)
        //     toastr.error(error.response.body.detail)
        // if(error.statusCode === 422)
        //     toastr.error(error.response.data)
        // if(error.statusCode === 401) {
        //     await refreshToken();
        //     await getAllGrooming(projectId);
        // }
        // alert(error.response.body.detail)
        console.log(error.response);
    }
}

var selectedPhysical;
var selectedMatrix;

function selectPhysicalRow(element, id) {
    element.disabled = true;
    selectedPhysical = id;
    enableCreateBtn();
}

function selectMatrixRow(element, id) {
    element.disabled = true;
    selectedMatrix = id;
    enableCreateBtn();
}

function enableCreateBtn() {
    if (selectedMatrix !== undefined && selectedPhysical !== undefined) {
        document.getElementById("createProjectBtn").disabled = false;
    }
}

var ptData = {}
var sheets;
var ptNodesData = [];
var ptLinksData = [];
function pt_show_errors() {
    for (const data of ptData.data.nodes) {
        const newDataObj = Object.keys(data).reduce((object, key) => {
            if (!key.includes("error")) {
                object[key] = data[key]
            }
            return object
        }, {})
        ptNodesData.push(newDataObj);
    }

    var ptNodeNames = [];
    for (const data of ptData.data.nodes) {
        const newDataObj = Object.keys(data).reduce((object, key) => {
            if (key === "name") {
                object[key] = data[key]
            }
            return object
        }, {})
        ptNodeNames.push(newDataObj.name);
    }


    // Object.keys(ptData.physical_topology.nodes)
    for (const data of ptData.data.links) {
        const newDataObj = Object.keys(data).reduce((object, key) => {
            if (!key.includes("error")) {
                object[key] = data[key]
            }
            return object
        }, {})
        ptLinksData.push(newDataObj);
    }
    // ptData.physical_topology.nodes.find()
    var ptNodesDataArray = Object.entries(ptData.data.nodes);
    var ptLinksDataArray = Object.entries(ptData.data.links);
    let nodesKeyNames = {
        '0': 'name',
        '1': 'lat',
        '2': 'lng',
        '3': 'roadm_type'
    }

    let linksKeyNames = {
        '0': 'source',
        '1': 'destination',
        '2': 'length',
        '3': 'fiber_type'
    }

    var nodesChanged = function (instance, cell, x, y, value) {
        // console.log(cell)

        if ((errorData = cell.getAttribute("error_value")) !== undefined) {
            let cellName = jexcel.getColumnNameFromId([x, y]);
            let worksheet = document.getElementById('pt-spreadsheet').children[0].querySelector('.selected').getAttribute('data-spreadsheet');
            if (errorData != null && errorData.includes("err_code:1")) {
                if (/^[+]?([0-9]{1,2})*[.]([0-9]{1,10})?$/.test(value)) {
                    document.getElementById('pt-spreadsheet').jexcel[worksheet].setComments(cellName, "");
                    cell.style.backgroundColor = 'white';
                    if ((element = document.getElementById("node" + cellName + "_a")) !== null) {
                        element.remove();
                    }
                } else if ($(`#node${cellName}_a`).length == 0) {
                    document.getElementById('pt-spreadsheet').jexcel[worksheet].setComments(cellName, errorData);
                    cell.style.backgroundColor = 'red';
                    let newA = document.createElement('a');
                    newA.href = "#node" + cellName;
                    newA.setAttribute("id", "node" + cellName + "_a")
                    newA.setAttribute("onclick", "clickOnError(this,event)")
                    let newspan = document.createElement('span');
                    newspan.innerHTML = cell.getAttribute("error_value");
                    newA.appendChild(newspan);
                    newLine = document.createElement('br');
                    document.getElementById('pt-nodes-errors').appendChild(newA).appendChild(newLine);
                    $('#submit-pt-errors-fixed').prop("disabled", true);
                }
            } else if (errorData != null && errorData.includes("err_code:2") && value != "") {
                // let worksheet = document.getElementById('spreadsheet')
                // worksheet.jexcel.setComments(cellName, "");
                document.getElementById('pt-spreadsheet').jexcel[worksheet].setComments(cellName, "");
                cell.style.backgroundColor = 'white';
                if ((element = document.getElementById("node" + cellName + "_a")) !== null) {
                    element.remove();
                }
            }
            // $('#log').append('New change on cell ' + cellName + ' to: ' + value + '<br>');
        }
        if ($('#pt-links-errors')[0].childElementCount == 0 && $('#pt-nodes-errors')[0].childElementCount == 0) {
            $('#submit-pt-errors-fixed').prop("disabled", false);
        }
    }

    var linksChanged = function (instance, cell, x, y, value) {
        // console.log(cell)

        if ((errorData = cell.getAttribute("error_value")) !== undefined) {
            let cellName = jexcel.getColumnNameFromId([x, y]);
            let worksheet = document.getElementById('pt-spreadsheet').children[0].querySelector('.selected').getAttribute('data-spreadsheet');
            if (errorData != null && errorData.includes("err_code:4")) {

                if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
                    document.getElementById('pt-spreadsheet').jexcel[worksheet].setComments(cellName, "");
                    cell.style.backgroundColor = 'white';
                    if ((element = document.getElementById("link" + cellName + "_a")) !== null) {
                        element.remove();
                    }
                } else if ($(`#link${cellName}_a`).length == 0) {
                    document.getElementById('pt-spreadsheet').jexcel[worksheet].setComments(cellName, errorData);
                    cell.style.backgroundColor = 'red';
                    let newA = document.createElement('a');
                    newA.href = "#link" + cellName;
                    newA.setAttribute("id", "link" + cellName + "_a")
                    newA.setAttribute("onclick", "clickOnError(this,event)")
                    let newspan = document.createElement('span');
                    newspan.innerHTML = cell.getAttribute("error_value");
                    newA.appendChild(newspan);
                    newLine = document.createElement('br');
                    document.getElementById('pt-links-errors').appendChild(newA).appendChild(newLine);
                    $('#submit-pt-errors-fixed').prop("disabled", true);
                }
            } else if (errorData != null && errorData.includes("err_code:3") && value != "") {
                // let worksheet = document.getElementById('spreadsheet')
                // worksheet.jexcel.setComments(cellName, "");
                document.getElementById('pt-spreadsheet').jexcel[worksheet].setComments(cellName, "");
                cell.style.backgroundColor = 'white';
                if ((element = document.getElementById("link" + cellName + "_a")) !== null) {
                    element.remove();
                }
            }
            // $('#log').append('New change on cell ' + cellName + ' to: ' + value + '<br>');
        }
        if ($('#pt-links-errors')[0].childElementCount == 0 && $('#pt-nodes-errors')[0].childElementCount == 0) {
            $('#submit-pt-errors-fixed').prop("disabled", false);
        }
    }


    var nodesFirstTimeLoad = true;
    var linksFirstTimeLoad = true;

    var nodesLoaded = function (instance) {
        nodesFirstTimeLoad = false;
    }
    var linksLoaded = function (instance) {
        linksFirstTimeLoad = false;
    }

    sheets = [
        {
            sheetName: 'Nodes',
            data: ptNodesData,
            tableOverflow: true,
            lazyLoading: true,
            // tableWidth: '800px',
            tableHeight: '60vh',
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
                    width: '100px',
                    title: 'latitude',
                    name: 'lat'
                },
                {
                    type: 'float',
                    decimal: '.',
                    width: '100px',
                    title: 'longitude',
                    name: 'lng'
                },
                {
                    type: 'dropdown',
                    width: '150px',
                    source: ['Directionless', 'CDC'],
                    title: 'roadm type',
                    name: 'roadm_type'
                },
            ],
            allowComments: true,
            // persistance: '/jexcel/v4/save',
            onchange: nodesChanged,
            onload: nodesLoaded,
            updateTable: function (instance, cell, col, row, val, label, cellName) {
                cell.setAttribute('id', "node" + cellName);
                if (nodesFirstTimeLoad && (value = ptNodesDataArray[row][1][nodesKeyNames[col] + "_error"]) !== undefined) {
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
                } else if (nodesFirstTimeLoad) {
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
            lazyLoading: true,
            // tableWidth: '800px',
            tableHeight: '60vh',
            columns: [
                {
                    type: 'autocomplete',
                    width: '130px',
                    source: ptNodeNames,
                    title: 'source node',
                    name: 'source'
                },
                {
                    type: 'autocomplete',
                    width: '130px',
                    source: ptNodeNames,
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
                    type: 'text',
                    // type: 'dropdown',
                    width: '100px',
                    // source: ['sm'],
                    title: 'fiber type',
                    name: 'fiber_type'
                },
            ],
            allowComments: true,
            // persistance: '/jexcel/v4/save',
            onchange: linksChanged,
            onload: linksLoaded,
            updateTable: function (instance, cell, col, row, val, label, cellName) {
                cell.setAttribute('id', "link" + cellName);
                if (linksFirstTimeLoad && (value = ptLinksDataArray[row][1][linksKeyNames[col] + "_error"]) !== undefined) {
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
                } else if (linksFirstTimeLoad) {
                    instance.jexcel.setReadOnly(cellName, true);
                }
                // cell.style.overflow = 'hidden';
            },
            onevent: function () {
                // console.log(arguments);
            }
        }
    ];
    var ptExcel = jexcel.tabs(document.getElementById('pt-spreadsheet'), sheets);

    document.getElementById('pt-spreadsheet').children[0].addEventListener('click', function () {
        let selectedSheet = Number(document.getElementById('pt-spreadsheet').children[0].querySelector('.selected').getAttribute('data-spreadsheet'));
        if (selectedSheet === 0) {
            document.getElementById('pt-nodes-errors').style.display = "block";
            document.getElementById('pt-links-errors').style.display = "none";
        } else {
            document.getElementById('pt-nodes-errors').style.display = "none";
            document.getElementById('pt-links-errors').style.display = "block";
        }
    });


}


async function submitPtExcelFixed() {
    let ptDataForSubmit = {
        "comment": $('#pt-comment').val(),
        "name": $('#project-topology-name').val(),
        "data": {
            "links": document.getElementById('tableview-pt-spreadsheet').jexcel[1].getJson(),
            "nodes": document.getElementById('tableview-pt-spreadsheet').jexcel[0].getJson()
        }
    }
    await createOrUpdate("physical_topologies/", "create", ptDataForSubmit)
        .then(function (result) {
            sendEvent('#create-project-modal-5', 4, "Continue", true)
            $('#pt-error-excel').modal('hide');
            toastr.success("successfully import Physical Topology excel file")
            // alert("successfully import Physical Topology excel file")
            localStorage.setItem('oncreate-pt-id', result.body.id);
            document.getElementById('back-step-3').style.display = "none";
            // console.log(ptDrawValues)
        })
        .catch(function (error) {
            if (error.statusCode === 409) {
                // alert("name is duplicate, please choose another name")
                let element = document.getElementById('pt-name');
                element.setCustomValidity(error.response.body.detail)
                element.reportValidity()
                // return;
            }
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail)
            // alert(error.response.body)
            // console.log(error.response)
        });
    // var ptDrawValues = createOrUpdate("physical_topologies/","create", formData);
    // console.log(ptDrawValues)

    console.log(ptDataForSubmit);
}

// async function updateTmExcelValues() {
//     let traffic = await getAllRecords("traffic")
//     let tmForsubmit = createTmForSubmit()
//     traffic[0].data = tmForsubmit.data;
//
//     await updateElement('traffic', traffic[0]);
//     // sendEvent('#create-project-modal-5', 6,"Continue",true)
//     // $('#tm-error-excel').modal('hide');
// }

// async function saveTmFixedImportExcelValues() {
//     let project = await getAllRecords("project")
//     let tmRecord = new Object();
//     tmRecord.id = 0;
//     tmRecord.name = $('#project-traffic-name').val();
//     tmRecord.project = project[0].name
//     let tmForsubmit = createTmForSubmit()
//     tmRecord.data = tmForsubmit.data;
//
//     await addElement('traffic', tmRecord);
//     sendEvent('#create-project-modal-5', 6,"Continue",true)
//     $('#tm-error-excel').modal('hide');
// }

async function submitTmExcelFixed() {
    let tmDataForSubmit = {
        "comment": $('#tm-comment').val(),
        "name": $('#project-traffic-name').val(),
        "data": {
            "demands": []
        }
    }
    tmDataForSubmit = createTmForSubmit();
    console.log(tmDataForSubmit, "this is traffic matrix 1")
    await createOrUpdate("traffic_matrices/", "create", tmDataForSubmit)
        .then(function (result) {
            // sendEvent('#create-project-modal-5', 6,"Continue",true)
            $('#tm-error-excel').modal('hide');
            toastr.success("successfully import Traffic Matrix excel file")
            // alert("successfully import Traffic Matrix excel file")
            localStorage.setItem('oncreate-tm-id', result.body.id);
            document.getElementById('back-step-5').style.display = "none";
            // console.log(ptDrawValues)
        })
        .catch(function (error) {
            if (error.statusCode === 409) {
                // alert("name is duplicate, please choose another name")
                let element = document.getElementById('pt-name');
                element.setCustomValidity(error.response.body.detail)
                element.reportValidity()
                // return;
            }
            if (error.statusCode === 400)
                toastr.error(JSON.stringify(error.response.body.detail))
            // alert(error.response.body.error_msg)
            // console.log(error.response)
        });
    // var ptDrawValues = createOrUpdate("physical_topologies/","create", formData);
    // console.log(ptDrawValues)
    // exportToJsonFile();

    // console.log(ptDataForSubmit);
}

// function activeSubmit(){
//     if($('#pt-name').val() !== "" && $('#pt-comment').val() !== "" ){
//         $('#submit-pt-errors-fixed').prop( "disabled", false )
//     }
//     else{
//         $('#submit-pt-errors-fixed').prop( "disabled", true )
//     }
// }


//---------------------------------------------------------------------------------------------------//

var tmData = {}
var tmDataArray = [];
var tmSheet;
function tm_show_errors() {
    for (const data in tmData.data.demands) {
        const newDataObj = Object.keys(tmData.data.demands[data]).reduce((object, key) => {
            if (!key.includes("error") && !key.includes("id") && !key.includes("services")) {
                object[key] = tmData.data.demands[data][key]
            }
            if (key.includes("services")) {
                // object[key] = Object.keys(data[key]).map((key) => [obj[key]]);
                // console.log(Object.values(data[key]))
                for (var serviceData of Object.values(tmData.data.demands[data][key])) {
                    object[serviceData.type + "_quantity"] = serviceData.quantity;
                }
            }
            return object
        }, {})
        // console.log(newDataObj)
        tmDataArray.push(newDataObj);
    }
    var tmDataArray = Object.entries(tmData.data.demands);

    let tmKeyNames = {
        '0': 'source',
        '1': 'destination',
        '2': 'restoration_type',
        '3': 'protection_type',
        '4': 'type'
    }

    var columns = [
        {
            type: 'text',
            width: '100px',
            title: 'source node',
            name: 'source'
        },
        {
            type: 'text',
            width: '100px',
            title: 'destination node',
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
            source: ['NoProtection', '1+1_NodeDisjoint', 'Restoration', 'PRC'],
            title: 'protection type',
            name: 'protection_type'
        },
        {
            type: 'checkbox',
            width: '100px',
            title: 'card protection',
            name: 'card protection'
        },
        {
            type: 'text',
            width: '100px',
            title: 'type',
            name: 'type'
        },
    ]
    var servicesType = ["E1", "STM1 Electrical", "STM1 Optical", "STM4", "STM16", "STM64", "FE", "GE", "10GE", "100GE"]
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
        let worksheet = document.getElementById('tm-spreadsheet')
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
                    newA.setAttribute("onclick", "clickOnError(this,event)")
                    let newspan = document.createElement('span');
                    newspan.innerHTML = cell.getAttribute("error_value");
                    newA.appendChild(newspan);
                    newLine = document.createElement('br');
                    document.getElementById('tm-errors').appendChild(newA).appendChild(newLine);
                    $('#submit-tm-errors-fixed').prop("disabled", true);
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
            // $('#log').append('New change on cell ' + cellName + ' to: ' + value + '<br>');
        }
        if ($('#tm-errors')[0].childElementCount == 0) {
            $('#submit-tm-errors-fixed').prop("disabled", false);
        }
    }
    var tmLoaded = function (instance) {
        tmFirstTimeLoad = false;
    }

    tmSheet = jexcel(document.getElementById('tm-spreadsheet'), {
        data: tmDataArray,
        tableOverflow: true,
        lazyLoading: true,
        tableWidth: '800px',
        tableHeight: '60vh',
        freezeColumns: 2,
        columns: columns,
        // pagination:15,
        // allowComments: true,
        // persistance: '/jexcel/v4/save',
        onchange: tmChanged,
        onload: tmLoaded,
        updateTable: function (instance, cell, col, row, val, label, cellName) {
            let readonlyCell = true;
            cell.setAttribute('id', "tm" + cellName);
            if (tmFirstTimeLoad && col <= 4 && tmDataArray.length > 0 && tmKeyNames.length > 0 && (value = tmDataArray[row][1][tmKeyNames[col] + "_error"]) !== undefined) {
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
                readonlyCell = false;
            } else if (tmFirstTimeLoad && col > 4 && tmDataArray.length > 0 && tmKeyNames.length > 0) {
                for (const service of tmDataArray[row][1]['services']) {
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
                        readonlyCell = false;
                    }
                }
            }
            if (readonlyCell && tmFirstTimeLoad) {
                instance.jexcel.setReadOnly(cellName, true);
            }
            // cell.style.overflow = 'hidden';
        },
        // onevent: function () {
        //     console.log(arguments);
        // }
    })
}



function clickOnError(element, event) {
    // Figure out element to scroll to
    var target = $(element.hash);
    target = target.length ? target : $('[name=' + element.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        $('html, body').animate({
            scrollTop: target.offset().top
        }, 0, function () {
            // Callback after animation
            // Must change focus!
            var $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
                return false;
            } else {
                $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                $target.focus(); // Set focus again
            };
        });
    }
    $('td').removeClass('focus');
    $(target).first().addClass('focus');
}

function clearCreationProjectFields() {
    $('#tableview-comment').val('');
}

function setCreateProjectStatus() {
    let createStep = localStorage.getItem('createProjectStep')
    if (localStorage.getItem("projectState") == 'loaded') {
        if (closeProject()) {
            localStorage.setItem("projectState", 'creating');
            createStep = 1;
        }
        else
            return;
        //projectData = localStorage.getItem("projectData");
        // drawPhysicalTopology(JSON.parse(localStorage.getItem("projectData")));


    } else if (localStorage.getItem("projectState") == 'closed' || localStorage.getItem("projectState") == undefined) {
        localStorage.setItem("projectState", 'creating');
        createStep = 1;
    }
    if (createStep != undefined) {
        var sel_event = new CustomEvent('next.m.' + createStep, { detail: { step: createStep } });
        window.dispatchEvent(sel_event);
    }
    $('#create-project-modal-5').modal({
        backdrop: 'static',
        keyboard: false
    });
    // $('#create-project-modal-5').unbind('click');
    $('#create-project-modal-5').modal('show');
}

sendEvent = async function (sel, step, stepType, skip = false) {
    let actionValidated = true;
    const ptradios = Array.from($(`[name='ptradio']`));
    const ptcheckedRadio = ptradios.filter(e => e.checked);
    const tmradios = Array.from($(`[name='tmradio']`));
    const tmcheckedRadio = tmradios.filter(e => e.checked);
    if (step === 2 && stepType !== 'Back') {
        if (!$('#project-name').val()) {
            $("#project-form-btn").click();
            actionValidated = false;
        } else {
            /* TODO: check validation if not to be empty */
            await clearAllTables(["project"]);
            const _project = new Object();
            _project.id = 0;
            _project.name = $('#project-name').val();
            _project.client = $('#project-client').val();
            _project.unit = $('#project-unit').val();
            await addElement('project', _project);

            localStorage.setItem("createProjectStep", step);
            /* create new empty physical topology as the child of this new project */
            // const _emptyPhysicalTopology = new Object();
            // _emptyPhysicalTopology.id = 0;
            // _emptyPhysicalTopology.name = "";
            // _emptyPhysicalTopology.project_name = _project.name;
            // await addElement('physical', _emptyPhysicalTopology);

            /* create new empty physical topology as the child of this new project */
            // const _emptyTrafficMatrix = new Object();
            // _emptyTrafficMatrix.id = 0;
            // _emptyTrafficMatrix.name = "";
            // _emptyTrafficMatrix.project_name = _project.name;
            // await addElement('traffic', _emptyTrafficMatrix);

        }
    }
    if (step == 3 && stepType !== 'Back') {
        $('#project-ptexcel').hide();
        $('#project-ptserver').hide();
        $('#project-ptdraw').hide();
        localStorage.setItem("createProjectStep", step);
        // if(ptcheckedRadio[0].id == 'pt-draw' && tmcheckedRadio[0].id == 'tm-enter'){
        //     element.innerHTML == 'Back'? step--:step++;
        //     var sel_event = new CustomEvent('next.m.' + step, {detail: {step: step}});
        //     window.dispatchEvent(sel_event);
        // }
        if (ptcheckedRadio[0].id == 'pt-server') {
            if (Offline.state == "up") {
                // if((localStorage.getItem('pt-server-list') == undefined || localStorage.getItem('pt-server-list') =="")
                //     && $('#physical-from-server-list')[0].childElementCount ==0)
                // {
                //     getAllPhysicalTopologyList("physical-from-server-list");
                // }
                getAllPhysicalTopologyList("physical-from-server-list");
                $('#project-ptserver').show();
            } else {
                toastr.error("you are currently offline, can not load from server")
                actionValidated = false;
            }
        }
        else if (ptcheckedRadio[0].id == 'pt-excel') {
            if (Offline.state == "up") {
                $('#project-ptexcel').show();
            } else {
                toastr.error("you are currently offline, you can't load from excel file")
                actionValidated = false;
            }
        }
        else if (ptcheckedRadio[0].id == 'pt-draw') {
            $('#project-ptdraw').show();
        }
    }
    if (step == 4 && !skip && stepType !== 'Back') {
        await clearAllTables(["physical"]);
        if (ptcheckedRadio[0].id == 'pt-excel') {
            if (!$('#project-topology-name').val() || !$('#project-topology-file').val()) {
                $("#project-ptexcel-form-btn").click();
                actionValidated = false;
            } else if (Offline.state == "up") {
                await checkForExcel("physical_topologies/", document.getElementById('project-ptexcel-form'))
                    .then(async function (result) {
                        // var ptExcelValues = result
                        // const _emptyPhysicalTopology = new Object();
                        let project = await getAllRecords("project")
                        let ptRecord = new Object();
                        ptRecord.id = 0;
                        ptRecord.name = $('#project-topology-name').val();
                        ptRecord.project = project[0].name
                        ptRecord.data = result.body
                        tableviewPtData["data"] = result.body
                        await addElement('physical', ptRecord);
                        localStorage.setItem("createProjectStep", step);
                        // localStorage.setItem('oncreate-pt-id',result.body.id);
                        // console.log(ptDrawValues)
                    })
                    .catch(function (error) {
                        if (error.statusCode === 409) {
                            // alert("name is duplicate, please choose another name")
                            let form = document.getElementById('project-ptexcel-form')
                            let element = form.elements[0];
                            element.setCustomValidity(error.response.body.detail.detail)
                            // sendEvent('#create-project-modal-5', 2,this)
                            element.reportValidity()
                            actionValidated = false;
                            return;
                        }
                        if (error.statusCode === 400) {
                            let form = document.getElementById('project-ptexcel-form')
                            let element = form.elements[1];
                            element.setCustomValidity(error.response.body.detail.detail)
                            element.reportValidity()
                            // alert(error.response.body.error_msg)
                            actionValidated = false;
                            tableviewPtData["data"] = error.response.body.detail.physical_topology;
                            $('#fix-pt-excel-button').show();
                            return;
                            // console.log(error.response)
                        }
                    });
            } else if (Offline.state == "down") {
                actionValidated = false;
                toastr.error("can't import excel file when offline")
            }

        }
        else if (ptcheckedRadio[0].id == 'pt-draw') {
            if (!$('#project-draw-name').val() || !$('#project-draw-comment').val()) {
                $("#project-draw-form-btn").click();
                actionValidated = false;
            } else {
                // let project = await getAllRecords("project")
                // let ptRecord = new Object();
                // ptRecord.id = 0;
                // ptRecord.name = $('#project-draw-name').val();
                // ptRecord.comment = $('#project-draw-comment').val();
                // ptRecord.project = project[0].name
                // await addElement('physical', ptRecord);
                $('#create-project-modal-5').modal('hide');
                toastr.info("You can draw physical topology now.");
                $('#top-navbar').show();
                $('#draw-topology-toggler').show();
                // localStorage.setItem("createProjectStep",step);
            }
        }
        else if (ptcheckedRadio[0].id == 'pt-server') {
            const radios = Array.from($(`[name='pt-server-list-radio']`));

            // let ptRecord = new Object();
            await getPtData(radios.filter(e => e.checked)[0].id, null, "project");

            // ptRecord.id = radios.filter(e=>e.checked)[0].id;
            // const label = $('label[for="' + ptRecord.id + '"]');
            // ptRecord.name = label[0].textContent
            // ptRecord.project = project[0].name
            // await addElement('physical', ptRecord);
            // localStorage.setItem('oncreate-pt-id',radios.filter(e=>e.checked)[0].id);
            localStorage.setItem("createProjectStep", step);
        }
        // if(actionValidated)
        //     $('#create-project-done').show();
    }
    if (step == 5 && stepType !== 'Back') {
        $('#project-tmexcel').hide();
        $('#project-tmserver').hide();
        $('#project-tmenter').hide();
        localStorage.setItem("createProjectStep", step);
        // if(ptcheckedRadio[0].id == 'pt-draw' && tmcheckedRadio[0].id == 'tm-enter'){
        //     element.innerHTML == 'Back'? step--:step++;
        //     var sel_event = new CustomEvent('next.m.' + step, {detail: {step: step}});
        //     window.dispatchEvent(sel_event);
        // }
        if (tmcheckedRadio[0].id == 'tm-server') {
            if (Offline.state == "up") {
                getAllTrafficMatrixList("matrix-from-server-list");
                $('#project-tmserver').show();
            } else {
                toastr.error("you are currently offline, can not load from server")
                actionValidated = false;
            }
        }
        else if (tmcheckedRadio[0].id == 'tm-excel') {
            if (Offline.state == "up") {
                $('#project-tmexcel').show();
            } else {
                toastr.error("you are currently offline, you can't load from excel file")
                actionValidated = false;
            }
        }
        else if (tmcheckedRadio[0].id == 'tm-enter') {
            $('#project-tmenter').show();
        }
    }

    if (step == 6 && !skip) {
        await clearAllTables(["traffic"]);
        if (tmcheckedRadio[0].id == 'tm-excel') {
            if (!$('#project-traffic-name').val() || !$('#project-traffic-file').val()) {
                $("#project-tmexcel-form-btn").click();
                actionValidated = false;
            } else if (Offline.state == "up") {
                await checkForExcel("traffic_matrices/", document.getElementById('project-tmexcel-form'))
                    .then(async function (result) {
                        // var tmExcelValues = result
                        let project = await getAllRecords("project")
                        let tmRecord = new Object();
                        tmRecord.id = 0;
                        tmRecord.name = $('#project-traffic-name').val();
                        tmRecord.project = project[0].name
                        tmRecord.data = result.body
                        tableviewTmData["data"] = result.body
                        await addElement('traffic', tmRecord);
                        localStorage.setItem("createProjectStep", step);
                        // localStorage.setItem('oncreate-tm-id',result.body.id);
                        // console.log(ptDrawValues)
                    })
                    .catch(function (error) {
                        if (error.statusCode === 409) {
                            // alert("name is duplicate, please choose another name")
                            let form = document.getElementById('project-tmexcel-form')
                            let element = form.elements[0];
                            element.setCustomValidity(error.response.body.detail.detail)
                            // sendEvent('#create-project-modal-5', 2,this)
                            element.reportValidity()
                            actionValidated = false;
                            return;
                        }
                        if (error.statusCode === 400) {
                            let form = document.getElementById('project-tmexcel-form')
                            let element = form.elements[1];
                            element.setCustomValidity(error.response.body.detail.detail)
                            element.reportValidity()
                            // alert(error.response.body.error_msg)
                            actionValidated = false;
                            tableviewTmData["data"] = error.response.body.detail.traffic_matrix;
                            $('#fix-tm-excel-button').show();
                            return;
                            // console.log(error.response)
                        }
                    });
            } else if (Offline.state == "down") {
                actionValidated = false;
                toastr.error("can't import excel file when offline")
            }
        }
        else if (tmcheckedRadio[0].id == 'tm-enter') {
            if (!$('#project-enter-name').val() || !$('#project-enter-comment').val()) {
                $("#project-enter-form-btn").click();
                actionValidated = false;
            } else {
                // let project = await getAllRecords("project")
                // let tmRecord = new Object();
                // tmRecord.id = 0;
                // tmRecord.name = $('#project-enter-name').val();
                // tmRecord.comment = $('#project-enter-comment').val();
                // tmRecord.project = project[0].name
                // await addElement('traffic', tmRecord);
                $('#create-project-modal-5').modal('hide');
                await updatePtNodeNames();
                await initTmTableView();
                toastr.info("You can enter traffic matrix data now.");
                $('#top-navbar').hide();
                $('#draw-topology-toggler').hide();
                $('#table-view-toggler').hide();
                $('#submisst-tm-errors-fixed').click();
                // localStorage.setItem("createProjectStep",step);
            }
        }
        else if (tmcheckedRadio[0].id == 'tm-server') {
            const radios = Array.from($(`[name='tm-server-list-radio']`));

            // let tmRecord = new Object();
            await getTmData(radios.filter(e => e.checked)[0].id, null, "project");

            // tmRecord.id = radios.filter(e=>e.checked)[0].id;
            // const label = $('label[for="' + tmRecord.id + '"]');
            // tmRecord.name = label[0].textContent
            // tmRecord.project = project[0].name
            // await addElement('traffic', tmRecord);
            // localStorage.setItem('oncreate-tm-id',radios.filter(e=>e.checked)[0].id);
            localStorage.setItem("createProjectStep", step);
        }

    }
    if (step == 7) {
        myFeatureGroup.eachLayer(function (layer) {
            myFeatureGroup.removeLayer(layer);
        });
        links_groupfeature.eachLayer(function (layer) {
            links_groupfeature.removeLayer(layer);
        });
        let physical = await getAllRecords("physical")
        if (physical[0].data !== undefined && physical[0].data.nodes.length > 0) {
            drawPhysicalTopology(physical[0].data);
            tableviewPtData["data"] = physical[0].data;
        }
        let traffic = await getAllRecords("traffic")
        if (traffic[0].data !== undefined && Object.keys(traffic[0].data.demands).length > 0) {
            tableviewTmData["data"] = traffic[0].data;
        }
        localStorage.setItem("projectState", 'loaded');
        await saveProject();
        await initPtTableView();
        await updatePtNodeNames();
        await initTmTableView();
        $('#top-navbar').show();
        $('#draw-topology-toggler').show();
        $('#table-view-toggler').show();
        $('#add-designer-toggler').show();
        $('#tableview-toggle-spreadsheet').bootstrapToggle('enable')
        // $('#table-view-toggler a:first-child').click();
        $('#tableview-comment').val('');
        $(".side-close-icon").click();
        $('#create-project-modal-5').modal('hide');
        localStorage.setItem("createProjectStep", step);
        // console.log("ProjectID:", response.body.project_id);
        // localStorage.setItem("project_id",JSON.stringify(response.body.project_id));
        toastr.success("project created successfully.")
    }

    if (actionValidated) {
        var sel_event = new CustomEvent('next.m.' + step, { detail: { step: step } });
        window.dispatchEvent(sel_event);
    }

}

const radios = Array.from($(`[name='ptradio']`));
const checkedRadio = radios.filter(e => e.checked);

async function submitProject() {
    document.getElementById("save-project-submit").disabled = false;
    let project = await getAllRecords("project");
    if (project != undefined && project.length > 0) {
        $('#submit-project').modal({
            backdrop: 'static',
            keyboard: false
        });
        // $('#submit-project').unbind('click');
        $('#submit-project').modal('show')
    } else {
        toastr.error("there is no project");
    }
}

async function showProjectHistory() {
    if (Offline.state == "up") {
        if (document.getElementById('topology-map').style.display === "block") {
            let physical = await getAllRecords("physical");
            if (physical != undefined && physical[0].id !== 0) {
                getPtData(physical[0].id, null, "history");
                $('#pt-history-modal').modal('show');
            } else {
                toastr.error("your physical topology has not been saved");
            }
        } else {
            let traffic = await getAllRecords("traffic");
            if (traffic != undefined && traffic[0].id !== 0) {
                getTmData(traffic[0].id, null, "history");
                $('#tm-history-modal').modal('show');
            } else {
                toastr.error("your traffic matrix has not been saved");
            }

        }
    } else {
        toastr.error("you are currently offline;")
    }
}

async function removePhysicalHistory(element, id, version, rownumber) {
    $.confirm({
        animation: 'zoom',
        closeAnimation: 'scale',
        title: 'Delete history!',
        content: 'Are you sure you want to delete this version of your physical topology?',
        buttons: {
            confirm: async function () {
                let deleteQuery = {
                    id: {
                        value: id
                    },
                    version: {
                        value: version
                    }
                }
                await deleteRecord("physical_topologies/", deleteQuery)
                    .then(function (result) {
                        // $('#tm-error-excel').modal('hide');
                        toastr.success("successfully delete physical topology history record");
                        $(element).closest("tr").remove();
                        // console.log(ptDrawValues)
                    })
                    .catch(function (error) {
                        if (error.statusCode === 409) {
                            toastr.error(JSON.stringify(error.response.body.detail))
                        }
                        if (error.statusCode === 400)
                            toastr.error(JSON.stringify(error.response.body.detail))
                    });
            },
            cancel: function () {

            }
        }
    });

}

async function viewPhysicalHistory(id, version, rownumber) {

}

async function removeTrafficHistory(element, id, version, rownumber) {
    $.confirm({
        animation: 'zoom',
        closeAnimation: 'scale',
        title: 'Delete history!',
        content: 'Are you sure you want to delete this version of your traffic matrix?',
        buttons: {
            confirm: async function () {
                let deleteQuery = {
                    id: {
                        value: id
                    },
                    version: {
                        value: version
                    }
                }
                await deleteRecord("traffic_matrices/", deleteQuery)
                    .then(function (result) {
                        // $('#tm-error-excel').modal('hide');
                        toastr.success("successfully delete traffic matrix history record");
                        $(element).closest("tr").remove();
                        // console.log(ptDrawValues)
                    })
                    .catch(function (error) {
                        if (error.statusCode === 409) {
                            toastr.error(JSON.stringify(error.response.body.detail))
                        }
                        if (error.statusCode === 400)
                            toastr.error(JSON.stringify(error.response.body.detail))
                    });
            },
            cancel: function () {

            }
        }
    });
}

async function viewTrafficHistory(id, version, rownumber) {

}


function logoutUser() {
    localStorage.removeItem("userData");
    localStorage.removeItem("userName");
    window.location.href = "/"
}

function refreshToken() {
    let formData = new FormData();
    formData.append("refresh_token", JSON.parse(localStorage.getItem("userData"))["refresh_token"])
    const request = {
        url: serverAddr + "users/refresh_token",
        method: 'POST',
        body: JSON.stringify({ "refresh_token": JSON.parse(localStorage.getItem("userData"))["refresh_token"] }),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',

        },
    };
    (async () => {
        try {
            await SwaggerClient.http(request).then(response => {
                if (response.status === 200) {
                    localStorage.setItem("userData", JSON.stringify(response.body));
                }
            });
        } catch (error) {
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail);
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(JSON.stringify(error.response.body.detail));
            if (error.statusCode === 401) {
                toastr.error(JSON.stringify(error.response.body.detail));
                window.location.href = "/login.html"
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}