

//default contextmenu items
// var defaultContextmenuItems = [{
//     text: 'Delete Cluster',
//     index: 0,
//     callback: function () {
//         Delete_Cluster(l);
//     }
// }, {
//     separator: true,
//     index: 1
// }];

//Global var

var clustersDataFormat = {
    "clusters": [],
    "project_id": "string"
}

var clustersData;


var menu = L.control({ position: 'topleft' });

var manClusPanel = L.control({ position: 'topright' });

var div = document.createElement("div");
div.setAttribute("id", "project-panel");

var manClusDiv = document.createElement("div");
manClusDiv.setAttribute("id", "man-clus-panel");

var clusteringBtn = document.createElement("button");
clusteringBtn.innerHTML = "Clustering options";

var manualBtn = document.createElement("button");
manualBtn.innerHTML = "Manual";

var automaticBtn = document.createElement("button");
automaticBtn.innerHTML = "Automatic";


//manClusDiv elements

var clusStartBtn = document.createElement("button");
clusStartBtn.innerHTML = "Start";
clusStartBtn.classList.add('btn','btn-primary','btn-sm');
clusStartBtn.style.width = '100%'

var clusterMenuCloseBtn = document.createElement("button");
clusterMenuCloseBtn.setAttribute("class", "clusters-manual-closebtn");
clusterMenuCloseBtn.innerHTML = "x";
clusterMenuCloseBtn.addEventListener("click", e => {
    manClusDiv.remove();
    setBackToOriginal();
});
var clusCancelBtn = document.createElement("button");
clusCancelBtn.innerHTML = "Cancel";
clusCancelBtn.classList.add('btn','btn-danger','btn-sm');
clusCancelBtn.style.width = '50%'
var clusDoneBtn = document.createElement("button");
clusDoneBtn.innerHTML = "Done";
clusDoneBtn.classList.add('btn','btn-success','btn-sm');
clusDoneBtn.style.width = '50%'
// clusCancelBtn

//colors
var colorValues = ["red", "green", "yellow", "orange", "purple"];
var selectColor = document.createElement("select");
selectColor.classList.add('form-control');
selectColor.name = "colors";
selectColor.id = "node-colors"
for (const val of colorValues) {
    var option = document.createElement("option");
    option.value = val;
    option.text = val.charAt(0).toUpperCase() + val.slice(1);
    selectColor.appendChild(option);
}
var colorDDDiv = document.createElement("div");
colorDDDiv.appendChild(selectColor);


//types
var typeValues = ["100GE", "200GE"];
var selectType = document.createElement("select");
selectType.classList.add('form-control');
selectType.name = "colors";
selectType.id = "node-colors"
for (const val of typeValues) {
    var option = document.createElement("option");
    option.value = val;
    option.text = val.charAt(0).toUpperCase() + val.slice(1);
    selectType.appendChild(option);
}
var typeDDDiv = document.createElement("div");
typeDDDiv.appendChild(selectType);

//name
// var clusNameInput = document.createElement("input");
// clusNameInput.setAttribute("placeholder","cluster name");
// clusNameInput.classList.add("form-control")
//starting the clustering process
clusStartBtn.addEventListener('click', function () {
    // manClusDiv.appendChild(clusNameInput);
    manClusDiv.appendChild(clusCancelBtn);
    manClusDiv.appendChild(clusDoneBtn);
    selectType.disabled = true;
    selectColor.disabled = true;
    clusStartBtn.hidden = true;
    deletedClusterIndexes =[]
    // console.log(localStorage.getItem());

    // console.log(myFeatureGroup);

    var color = getDataFromDropDown(selectColor);

    myFeatureGroup.eachLayer(l => {
        setClusteringContextMenu(l, color);
    });

});

clusCancelBtn.addEventListener('click', e => {

    setBackToOriginal();

});

async function manualClusterDoneBtnConfirmed(clusterName){
    var color = getDataFromDropDown(selectColor);
    var type = getDataFromDropDown(selectType);
    let project = await getAllRecords("project");
    let cluster = await getAllRecords("cluster");
    if (deletedClusterIndexes.length > 0) {
        for (const deletedClusterIndex of deletedClusterIndexes) {
            let deleteQuery = {
                cluster_id: {
                    value: cluster[0].clusters[deletedClusterIndex].id
                }
            }
            await deleteRecord("clustering", deleteQuery)
                .then(function (result) {
                    // $('#tm-error-excel').modal('hide');
                    // toastr.success("successfully delete physical topology history record");
                    // $(element).closest("tr").remove();
                    // console.log(ptDrawValues)
                })
                .catch(function (error) {
                    if (error.statusCode === 409) {
                        toastr.error(JSON.stringify(error.response.body.detail))
                    }
                    if (error.statusCode === 400)
                        toastr.error(JSON.stringify(error.response.body.detail))
                    return false;
                });
        }
    }

    let clustersData = null;
    if(subnodesList.length > 0 || gatewaysList.length > 0) {
        clustersData = clustersDataFormat;
        clustersData.clusters.push({
            "data": {
                "color": color,
                "subnodes": subnodesList,
                "gateways": gatewaysList,
                "type": type
            },
            "name": clusterName
        });

        if (project[0].id != 0) {
            clustersData.project_id = project[0].id; ///get it from LocalStorage - current data is wrong;
            await createOrUpdate("clustering/manual", "create", clustersData)
                .then(async function (result) {

                    // alert("successfully import Physical Topology excel file")
                    if (cluster != undefined) {
                        await updateElement("cluster", cluster[0]);
                        toastr.success("successfully create cluster")
                    } else {
                        let cluster = {
                            "clusters": {}
                        }
                        // let cluster = new Object();
                        cluster["clusters"][result.body[0].id] = {"data": {}}
                        cluster["clusters"][result.body[0].id]["data"] = clustersData.clusters[0]
                        cluster["clusters"][result.body[0].id]["name"] = clusterName
                        cluster["clusters"][result.body[0].id]["id"] = result.body[0].id
                        await addElement("cluster", cluster);
                        toastr.success("successfully create cluster")
                    }

                })
                .catch(function (error) {
                    if (error.statusCode === 409) {
                        // return;
                        toastr.error(error.response.body.detail);
                        setBackToOriginal();
                    }
                    if (error.statusCode === 400)
                        toastr.error(error.response.body.detail)
                });

        } else {
            let cluster = new Object();
            cluster = clustersData;
            cluster.proeject = project[0].name
            cluster.id = 0
            cluster.project_id = 0
            await addElement("cluster", cluster);
            toastr.success("cluster data saved locally")
        }
    }else{
        toastr.success("no data for clustering")
    }
    await clearTable("cluster");
    await loadProjectCluster(project[0].id)
    manClusDiv.textContent = '';
    manClusDiv.remove();
    clusStartBtn.disabled = false;
}

clusDoneBtn.addEventListener('click', async e => {


    $.confirm({
        animation: 'zoom',
        closeAnimation: 'scale',
        title: 'Prompt Cluster name!',
        content: '' +
            '<form class="formName">' +
            '<div class="form-group">' +
            '<label>Enter cluster name here</label>' +
            '<input type="text" placeholder="cluster name" class="cluster form-control" required />' +
            '</div>' +
            '</form>',
        buttons: {
            formSubmit: {
                text: 'Submit',
                btnClass: 'btn-blue',
                action: function () {
                    var clusterName = this.$content.find('.cluster').val();
                    if(!clusterName){
                        $.alert('enter cluster name');
                        return false;
                    }
                    manualClusterDoneBtnConfirmed(clusterName);
                }
            },
            cancel: function () {
                //close
            },
        },
        onContentReady: function () {
            // bind to events
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                // if the user submits the form by pressing enter in the field.
                e.preventDefault();
                jc.$$formSubmit.trigger('click'); // reference the button and click it
            });
        }
    });

    // console.log(JSON.stringify(clustersData));
    //
    // console.log(myFeatureGroup);

    // setBackToOriginal();

});


document.getElementById("clustering-manual-btn").addEventListener('click', function (e) {
    //show manClusPanel
    manClusPanel.addTo(MapVar);
});


clusteringBtn.addEventListener("click", function (e) {
    div.appendChild(manualBtn);
    div.appendChild(automaticBtn);
});

// menu.onAdd = function (MapVar) {
//
//     div.appendChild(clusteringBtn);
//
//     return div;
// };
var gatewaysList = []
var subnodesList = []
manClusPanel.onAdd = function (MapVar) {
    manClusDiv.appendChild(clusterMenuCloseBtn);
    manClusDiv.appendChild(colorDDDiv);
    manClusDiv.appendChild(typeDDDiv);
    manClusDiv.appendChild(clusStartBtn);
    selectType.disabled = false;
    selectColor.disabled = false;
    clusStartBtn.hidden = false;
    myFeatureGroup.eachLayer(async node => {
        let cluster = await getAllRecords("cluster")
        if(cluster != undefined ) {
            for (let clusterData of cluster[0].clusters) {
                
                for (let i = 0; i < clusterData.data.gateways.length; i++) {
                    if(get_name(node) == clusterData.data.gateways[i]){
                        console.log("clusterData",clusterData);
                        node.options = {
                            contextmenu: true,
                            contextmenuItems: [
                                {
                                    text: 'Delete Cluster',
                                    index: 0,
                                    callback: function () {
                                        $.confirm({
                                            animation: 'zoom',
                                            closeAnimation: 'scale',
                                            title: 'Confirm Delete Cluster ! ',
                                            content: 'Are you sure to delete this cluster?!',
                                            buttons: {
                                                confirm: async function () {
                                                    await Delete_Cluster(node, "clear");
                                                    if (deletedClusterIndexes.length > 0) {
                                                        for (const deletedClusterIndex of deletedClusterIndexes) {
                                                            let deleteQuery = {
                                                                cluster_id: {
                                                                    value: cluster[0].clusters[deletedClusterIndex].id
                                                                }
                                                            }
                                                            await deleteRecord("clustering", deleteQuery)
                                                                .then(function (result) {
                                                                    // $('#tm-error-excel').modal('hide');
                                                                    // toastr.success("successfully delete physical topology history record");
                                                                    // $(element).closest("tr").remove();
                                                                    // console.log(ptDrawValues)
                                                                })
                                                                .catch(function (error) {
                                                                    if (error.statusCode === 409) {
                                                                        toastr.error(JSON.stringify(error.response.body.detail))
                                                                    }
                                                                    if (error.statusCode === 400)
                                                                        toastr.error(JSON.stringify(error.response.body.detail))
                                                                    return false;
                                                                });
                                                        }
                                                        await clearTable("cluster");
                                                        let project = await getAllRecords("project");
                                                        await loadProjectCluster(project[0].id)
                                                        deletedClusterIndexes =[]
                                                    }
                                                },
                                                cancel: function () {

                                                }
                                            }
                                        })
                                    }
                                }
                            ]
                        };
                        return;
                    }
                }
                for (let i = 0; i < clusterData.data.subnodes.length; i++) {
                    if(get_name(node) == clusterData.data.subnodes[i]){
                        node.options = {
                            contextmenu: true,
                            contextmenuItems: [
                                {
                                    text: 'Delete Cluster',
                                    index: 0,
                                    callback:function () {
                                        $.confirm({
                                            animation: 'zoom',
                                            closeAnimation: 'scale',
                                            title: 'Confirm Delete Cluster ! ',
                                            content: 'Are you sure to delete this cluster?!',
                                            buttons: {
                                                confirm: async function () {
                                                    await Delete_Cluster(node, "clear");
                                                    if (deletedClusterIndexes.length > 0) {
                                                        for (const deletedClusterIndex of deletedClusterIndexes) {
                                                            let deleteQuery = {
                                                                cluster_id: {
                                                                    value: cluster[0].clusters[deletedClusterIndex].id
                                                                }
                                                            }
                                                            await deleteRecord("clustering", deleteQuery)
                                                                .then(function (result) {
                                                                    // $('#tm-error-excel').modal('hide');
                                                                    // toastr.success("successfully delete physical topology history record");
                                                                    // $(element).closest("tr").remove();
                                                                    // console.log(ptDrawValues)
                                                                })
                                                                .catch(function (error) {
                                                                    if (error.statusCode === 409) {
                                                                        toastr.error(JSON.stringify(error.response.body.detail))
                                                                                                }
                                                                    if (error.statusCode === 400)
                                                                        toastr.error(JSON.stringify(error.response.body.detail))
                                                                    return false;
                                                                });
                                                        }
                                                        await clearTable("cluster");
                                                        let project = await getAllRecords("project");
                                                        await loadProjectCluster(project[0].id)
                                                        deletedClusterIndexes =[]
                                                    }
                                                },
                                                cancel: function () {

                                                }
                                            }
                                        })
                                    }
                                }
                            ]
                        };
                        return;
                    }
                }
            }
        }
    });


    return manClusDiv;
}
var deletedClusterIndexes = []
// menu.addTo(MapVar);
async function Delete_Cluster(node, mode) {
    var color = getDataFromDropDown(selectColor);
    nodeName = get_name(node);
    let clusters = await getAllRecords("cluster");
    if(clusters !=undefined) {
        for (const cluster in clusters[0].clusters) {
            if (clusters[0].clusters[cluster].data.subnodes.includes(nodeName) || clusters[0].clusters[cluster].data.gateways.includes(nodeName)) {
                for (let i = 0; i < clusters[0].clusters[cluster].data.gateways.length; i++) {
                    var newNode = new L.Marker;
                    MapVar.eachLayer(l => {
                        if (l instanceof L.Marker && getLayerName(l) === clusters[0].clusters[cluster].data.gateways[i]) {
                            // console.log(l);
                            newNode = l;
                        }

                    });
                    if(mode == "reset")
                    {
                        clearTypesFromNode(newNode, color);
                    }
                    else {
                        change_icon(get_name(newNode), newNode._latlng, "blue", 1, "normal");
                        delete_node(newNode)
                    }
                }
                for (let i = 0; i < clusters[0].clusters[cluster].data.subnodes.length; i++) {
                    var newNode = new L.Marker;
                    MapVar.eachLayer(l => {
                        if (l instanceof L.Marker && getLayerName(l) === clusters[0].clusters[cluster].data.subnodes[i]) {
                            console.log(l);
                            newNode = l;
                        }

                    });
                    if(mode == "reset")
                        clearTypesFromNode(newNode, color);
                    else {
                        change_icon(get_name(newNode), newNode._latlng, "blue", 1, "normal");
                        delete_node(newNode)
                    }
                }
                deletedClusterIndexes.push(cluster)
                break;
            }
        }
    }
    clearTypesFromNode(node,color);
    // else{
    //     if (subnodesList.includes(nodeName) || gatewaysList.includes(nodeName)) {
    //         for (let i = 0; i < gatewaysList.length; i++) {
    //             var newNode = new L.Marker;
    //             MapVar.eachLayer(l => {
    //                 if (l instanceof L.Marker && getLayerName(l) === gatewaysList[i]) {
    //                     // console.log(l);
    //                     newNode = l;
    //                 }
    //
    //             });
    //             clearTypesFromNode(newNode, color);
    //         }
    //         for (let i = 0; i < subnodesList.length; i++) {
    //             var newNode = new L.Marker;
    //             MapVar.eachLayer(l => {
    //                 if (l instanceof L.Marker && getLayerName(l) === subnodesList[i]) {
    //                     // console.log(l);
    //                     newNode = l;
    //                 }
    //
    //             });
    //             clearTypesFromNode(newNode, color);
    //         }
    //         subnodesList = []
    //         gatewaysList = []
    //     }
    // }

}

//Hamidi Check Layer Testtt
async function Check_Layer(node) {
    nodeName = get_name(node);
    console.log("nodeName",nodeName);
}


function handleNodeTypeAndColor(node, color, opacity, type) {

    change_icon(get_name(node), node._latlng, color, opacity, "normal");
    console.log("get_name(node)" +get_name(node));
    console.log("node._latlng" +node._latlng);
    var newNode = new L.Marker;

    // newNode = getLayerByName(get_name(node));


    MapVar.eachLayer(l => {
        if (l instanceof L.Marker && getLayerName(l) === get_name(node)) {
            // console.log(l);
            newNode = l;
        }

    });

    delete_node(node);

    newNode.options = {
        contextmenu: true,
        contextmenuItems: [{
            text: 'Set as Gateway',
            index: 0,
            callback: function () {
                handleNodeTypeAndColor(newNode, color, 1, "gateway");
            }
        },
        {
            text: 'Set as Subnode',
            index: 1,
            callback: function () {
                handleNodeTypeAndColor(newNode, color, 0.5, "subnode");
            }
        },
        {
            text: 'Clear',
            index: 2,
            callback: function () {
                clearTypesFromNode(newNode, color);
            }
        }
        ]
    };

    if (type === "gateway" && gatewaysList.indexOf(get_name(newNode)) == -1) {
        gatewaysList.push(get_name(newNode));
        subnodesList = subnodesList.filter(item => item !== get_name(node))
    }
    else if (type === "subnode" && subnodesList.indexOf(get_name(newNode)) == -1) {
        subnodesList.push(get_name(newNode));
        gatewaysList = gatewaysList.filter(item => item !== get_name(node))
    }

}


function clearTypesFromNode(node, color){

    change_icon(get_name(node), node._latlng, "blue", 1, "normal");
    delete_node(node);
    var newNode = new L.Marker;
    MapVar.eachLayer(l => {
        if (l instanceof L.Marker && getLayerName(l) === get_name(node)) {
            // console.log(l);
            newNode = l;
        }

    });

    gatewaysList = gatewaysList.filter(item => item !== get_name(node))
    subnodesList = subnodesList.filter(item => item !== get_name(node))
    newNode.options = {
        contextmenu: true,
        contextmenuItems: [{
            text: 'Set as Gateway',
            index: 0,
            callback: function () {
                handleNodeTypeAndColor(node, color, 1, "gateway");
            }
        },
            {
                text: 'Set as Subnode',
                index: 1,
                callback: function () {
                    handleNodeTypeAndColor(node, color, 0.5, "subnode");
                }
            }
        ]
    };
}

async function setClusteringContextMenu(node, color) {
    let cluster = await getAllRecords("cluster")
    if(cluster != undefined ) {
        for (let clusterData of cluster[0].clusters) {
            for (let i = 0; i < clusterData.data.gateways.length; i++) {
                if(get_name(node) == clusterData.data.gateways[i]){
                    node.options = {
                        contextmenu: true,
                        contextmenuItems: [
                            {
                                text: 'Delete Cluster',
                                index: 0,
                                callback: function () {
                                    Delete_Cluster(node, "reset");
                                }
                            }
                        ]
                    };
                    return;
                }
            }
            for (let i = 0; i < clusterData.data.subnodes.length; i++) {
                if(get_name(node) == clusterData.data.subnodes[i]){
                    node.options = {
                        contextmenu: true,
                        contextmenuItems: [
                            {
                                text: 'Delete Cluster',
                                index: 0,
                                callback: function () {
                                    Delete_Cluster(node, "reset");
                                }
                            }
                        ]
                    };
                    return;
                }
            }
        }
    }

    node.options = {
        contextmenu: true,
        contextmenuItems: [{
            text: 'Set as Gateway',
            index: 0,
            callback: function () {
                handleNodeTypeAndColor(node, color, 1, "gateway");
            }
        },
            {
                text: 'Set as Subnode',
                index: 1,
                callback: function () {
                    handleNodeTypeAndColor(node, color, 0.5, "subnode");
                }
            }
        ]
    };
    

}

function getDataFromDropDown(select) {
    // var val = document.getElementById("node-colors");
    // console.log(select.value);
    return select.value;
}

async function setBackToOriginal() {

    clustersData = {};

    manClusDiv.textContent = '';
    manClusDiv.remove();
    clusStartBtn.disabled = false;


    myFeatureGroup.eachLayer(l => {

        change_icon(get_name(l), l._latlng, "blue", 1, "normal");
        delete_node(l);
    });


    let cluster = await getAllRecords("cluster")
    if(cluster != undefined ) {
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
}


function getLayerByName(name) {
    MapVar.eachLayer(l => {
        if (l instanceof L.Marker && getLayerName(l) === name) {
            // console.log(l);
            return l;
        }

    });
}

//Function call clustering/manual?cluster_id and return name , Gateways , Subnodes
async function getClusterInfo(ClusterId)
{
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `${userData.token_type} ${userData.access_token}`);

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    let result = await callService(`http://185.211.88.140:80/api/v2.0.0/clustering/manual?cluster_id=${ClusterId}`, requestOptions);
    
    return result;
}
