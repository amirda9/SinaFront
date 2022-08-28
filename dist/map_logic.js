const serverAddr = "http://185.211.88.140:80/api/v2.0.0/";

var MapVar = L.map("topology-map", {
    contextmenu: true,
    contextmenuWidth: 140,
    contextmenuItems: [{
        text: 'Show coordinates',
        callback: showCoordinates
    }],
    fullscreenControl: {
        pseudoFullscreen: false // if true, fullscreen to page width and height
    },
    center: [35.6892, 51.389],
    crs: L.CRS.EPSG3857,
    zoom: 6,
    preferCanvas: false,
});

MapVar.doubleClickZoom.disable();

$(window).on("resize", resizeMap);
// resize();

function resizeMap() {
    $('#topology-map').css("height", ($(window).height()));
}


function drawPhysicalTopology(data) {

    myFeatureGroup.eachLayer(function (layer) {
        console.log('*******myFeatureGroup.eachLayer********');
        myFeatureGroup.removeLayer(layer);
    });
    links_groupfeature.eachLayer(function (layer) {
        console.log('*******links_groupfeature.eachLayer********');
        links_groupfeature.removeLayer(layer);
    });
    for (let node of data.nodes) {
        let nodeLocal = [];
        nodeLocal.push(node.lat);
        nodeLocal.push(node.lng);
        add_node1(node.name, nodeLocal)
    }
    for (let link of data.links) {
        let srcLocal = [];
        let destLocal = [];
        //*****/
        let src = data.nodes.find(o => o.name === link.source);
        //  console.log("SRC",src,link.source, link.destination,link);
        let dest = data.nodes.find(o => o.name === link.destination);
        // console.log("dest",dest);
        srcLocal.push(src.lat);
        srcLocal.push(src.lng);
        destLocal.push(dest.lat);
        destLocal.push(dest.lng);
        // console.log('*******',srcLocal, destLocal, link.source, link.destination)
        // if (link.source === 'ZAR') {
        //     // console.log('99999999')
        //     // add_link2([30.810333, 56.586627], [30.399309, 56.001607], 'ZAR', 'RE');
        // } else {
        //     add_link1(srcLocal, destLocal, link.source, link.destination)
        // }
        try {
            link["attenuation"] = link.fiber.attenuation
            link["nonlinearity"] = link.fiber.nonlinearity
            link["dispersion"] = link.fiber.dispersion
            link["fiber_type"] = link.fiber.fiber_type
            // delete link["fiber"]
        }
        catch {
            link["fiber"] = {
                "fiber_type": link.fiber_type,
                "attenuation": link.attenuation,
                "nonlinearity": link.nonlinearity,
                "dispersion": link.dispersion
            }
        } 
        // console.log(link)

        add_link1(srcLocal, destLocal, link.source, link.destination)

    }
}

//test
function drawPhysicalTopologyColor(data) {
    myFeatureGroup.eachLayer(function (layer) {
        console.log('*******myFeatureGroup.eachLayer********');
        myFeatureGroup.removeLayer(layer);
    });
    links_groupfeature.eachLayer(function (layer) {
        console.log('*******links_groupfeature.eachLayer********');
        links_groupfeature.removeLayer(layer);
    });
    for (let node of data.nodes) {
        let nodeLocal = [];
        nodeLocal.push(node.lat);
        nodeLocal.push(node.lng);
        add_node1(node.name, nodeLocal)
    }
    for (let link of data.links) {
        let srcLocal = [];
        let destLocal = [];
        let src = data.nodes.find(o => o.name === link.source);
        console.log("SRC", src, link.source, link.destination, link);
        let dest = data.nodes.find(o => o.name === link.destination);
        console.log("dest", dest);
        srcLocal.push(src.lat);
        srcLocal.push(src.lng);
        destLocal.push(dest.lat);
        destLocal.push(dest.lng);
        add_link1(srcLocal, destLocal, link.source, link.destination)

    }
}


// function drawProjectPhysicalTopology(data) {
//     console.log('$$$$$$$$$$$$$$$$$$$$$$$$')
//     for (let node in data.data.nodes) {
//         let nodeLocal = [];
//         nodeLocal.push(node.lat);
//         nodeLocal.push(node.lng);
//         add_node1(node.name, nodeLocal)
//     }
//     for (let link of data.data.links) {
//         let srcLocal = [];
//         let destLocal = [];
//         let src = data.data.nodes.find(o => o.name === link.source);
//         let dest = data.data.nodes.find(o => o.name === link.destination);
//         srcLocal.push(src.lat);
//         srcLocal.push(src.lng);
//         destLocal.push(dest.lat);
//         destLocal.push(dest.lng);
//         console.log('************',srcLocal, destLocal, link.source, link.destination)
//         add_link1(srcLocal, destLocal, link.source, link.destination)
//     }
// }

function add_node1(nodeName, latlng) {
    // latlng = JSON.parse(latlng)
    //alert("start of add_node", NodeName, latlng);
    change_icon(nodeName, latlng, "blue", 1, "normal");
}


function add_link1(sourceLoc, destinationLoc, sourceName, destinationName) {

    var link = L.polyline([sourceLoc, destinationLoc],
        {
            "bubblingMouseEvents": true,
            "color": "black",
            "dashArray": null,
            "dashOffset": null,
            "fill": false,
            "fillColor": "black",
            "fillOpacity": 0.2,
            "fillRule": "evenodd",
            "lineCap": "round",
            "lineJoin": "round",
            "noClip": false,
            "opacity": 0.5,
            "smoothFactor": 1.0,
            "stroke": true,
            "weight": 3
        }
    ).addTo(MapVar);

    linkName = sourceName + "-" + destinationName;
    link.bindTooltip("<h2>" + linkName + "</h2>");
    link.addTo(links_groupfeature);
}

function addLinkWithColor(sourceLoc, destinationLoc, sourceName, destinationName, color) {
    var link = L.polyline([sourceLoc, destinationLoc],
        {
            "bubblingMouseEvents": true,
            "color": color,
            "dashArray": null,
            "dashOffset": null,
            "fill": false,
            "fillColor": color,
            "fillOpacity": 0.2,
            "fillRule": "evenodd",
            "lineCap": "round",
            "lineJoin": "round",
            "noClip": false,
            "opacity": 0.5,
            "smoothFactor": 1.0,
            "stroke": true,
            "weight": 3
        }
    ).addTo(MapVar);

    linkName = sourceName + "-" + destinationName;
    link.bindTooltip("<h2>" + linkName + "</h2>");
    link.addTo(links_groupfeature);
}




var homeTab = document.getElementById('nav-home');
var mapElement = document.getElementById('topology-map');
var observer1 = new MutationObserver(function () {
    if (homeTab.classList.contains('active')) {
        mapElement.style.display = 'inherit';
        MapVar.invalidateSize();
    } else {
        mapElement.style.display = 'none';
        homeTab.style.display = 'none';
    }
});
//   observer1.observe(homeTab, {attributes: true});


// var MapVar = L.map(
//     "MapVar",
//     {
//         contextmenu: true,
//         contextmenuWidth: 140,
//         contextmenuItems: [{
//             text: 'Show coordinates',
//             callback: showCoordinates
//         }],
//         center: [35.6892, 51.389],
//         crs: L.CRS.EPSG3857,
//         zoom: 6,
//         preferCanvas: false,
//     }
// );

function showCoordinates(e) {
    toastr.info(`latitude : ${e.latlng.lat}<br/>longitude : ${e.latlng.lng}`)
    // alert(e.latlng);
}

function get_name(layer) {
   // console.log('layer is : ', layer)
   // console.log("_latlng : " ,layer._latlng)
    var x = layer["_tooltip"]["_content"];
    //console.log('x is : ', x)
    var doc = new DOMParser().parseFromString(x, "text/xml");
    var z = doc.documentElement.textContent;
    NodeName = z.replace(/\s/g, '');

    return NodeName;
}

function delete_node(layer) {
    var latlng = layer.getLatLng();
    myFeatureGroup.removeLayer(layer);
    MapVar.removeLayer(layer);
    layer.remove();
}


var tile_layer_3c8d85307f1e400db7a61053d3bf00e6 = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        "detectRetina": false,
        "maxNativeZoom": 18,
        "maxZoom": 18,
        "minZoom": 0,
        "noWrap": false,
        "opacity": 1,
        "subdomains": "abc",
        "tms": false
    }
).addTo(MapVar);


async function storeLocallyDrawModeDataChanges(drawData) 
{
    let drawNodes = []
    let drawLinks = []
    if (JSON.parse(deletedOldLayers).nodes.length > 0) {
        drawNodes = drawData.nodes.filter(function (node) {
            if (new RegExp((JSON.parse(deletedOldLayers).nodes).join("|")).test(node.name)) {
                return false;
            }
            return true;
        })
        drawData.nodes = drawNodes
    }
    if (JSON.parse(deletedOldLayers).links.length > 0) {
        drawLinks = drawData.links.filter(function (link) {
            for (const deletedLink of JSON.parse(deletedOldLayers).links) {
                if (link.source == deletedLink.start && link.destination == deletedLink.end)
                    return false;
            }
            return true;
        })
        drawData.links = drawLinks
    }
    for (const node of JSON.parse(globalVar).Nodes) {
        let newNode = {
            "name": "",
            "lat": "",
            "lng": "",
            "node_type": "",
            "wa_type": "Identical",
            "no_extra_wavelength__for_expansion": ""
        }

        if ((elementIndex = drawData.nodes.findIndex(el => el.name === node.name)) != -1) {
            newNode.name = drawData.nodes[elementIndex].name;
            newNode.lat = Number(node.location.lat);
            newNode.lng = Number(node.location.lng);
            newNode.node_type = drawData.nodes[elementIndex].node_type
            newNode.no_extra_wavelength__for_expansion = node.data.no_extra_wavelength__for_expansion
            drawData.nodes[drawData.nodes.findIndex(el => el.name === newNode.name)] = newNode;
        }
        else {
            newNode.name = node.name;
            newNode.lat = Number(node.location.lat);
            newNode.lng = Number(node.location.lng);
            newNode.node_type = node.data.node_type
            newNode.no_extra_wavelength__for_expansion = node.data.no_extra_wavelength__for_expansion
            drawData.nodes.push(newNode);
        }
    }
    for (const link of JSON.parse(globalVar).Links) {
        if (link.isNew) {
            let newLink = {
                "destination": "",
                "length": '',
                "source": "",
                "fiber": {},
                "fiber_type": "SMF (G.652)",
                "attenuation": "",
                "dispersion": "",
                "nonlinearity": ""
            }
            newLink.source = link.start;
            newLink.destination = link.end;
            newLink.length = Number(link.data["Length (Km)"]);
            newLink.fiber_type = link.data.FiberType
            newLink.attenuation = link.data["Loss_Coefficient (dB/Km)"]
            newLink.nonlinearity = link.data["Non-Linear Parameter Ɣ"]
            newLink.dispersion = link.data["Dispersion (ps/Km-nm)"]
            // newLink.length = document.getElementById("Length (Km)").value
            drawData.links.push(newLink);
        }
    }
    tableviewPtData.data = await drawData;
    // initPtTableView();
    return drawData;
    // let ptRecord = await getAllRecords("physical")
    // ptRecord[0].data = drawData;
    // if(updateElement("physical", ptRecord[0])){
    //     tableviewPtData.data = drawData;
    //     initPtTableView();
    //     toastr.success("successfully save draw data locally");
    // }
}

async function submitDrawModeDataChanges(physicalTopologyData) {
    // localStorage.setItem("physical_topologies", physicalTopologyData.data)
    

    // hard code
    for (const link of physicalTopologyData.data.links){
        console.log("linkg", link)
        try{
            link["fiber"] = {
                "fiber_type": link.fiber_type,
                "attenuation": link.attenuation,
                "nonlinearity": link.nonlinearity,
                "dispersion": link.dispersion
            }
        }
        catch {
            link["fiber_type"] =  link.fiber.fiber_type;
            link["attenuation"] =  link.fiber.attenuation;
            link["nonlinearity"] =  link.fiber.nonlinearity;
            link["dispersion"] =  link.fiber.dispersion;
        }
    }

    // hard code
    // delete physicalTopologyData.data.fiber
    console.log(physicalTopologyData.data, "this is physical topology data")

    const actionMode = physicalTopologyData.id == 0 ? "POST" : "PUT"
    // physicalTopologyData["comment"] = "nocomment";
    const request = {
        url: serverAddr + "physical_topologies/",
        method: actionMode,
        body: JSON.stringify(physicalTopologyData),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${userData.token_type} ${userData.access_token}`
        },
    };
    await (async () => {
        try {
            await SwaggerClient.http(request).then(async response => {
                // let physical = await getAllRecords("physical");
                if (actionMode == "POST") {
                    physicalTopologyData.id = response.body.id
                    physicalTopologyData.version = 1;
                } else {
                    physicalTopologyData.version = physicalTopologyData.version + 1
                    await updateProjectPtOrTmVersion("physical", physicalTopologyData.version)
                }
                await updateElement("physical", physicalTopologyData);
                // console.log(response);
                toastr.success("successfully submit draw data to server")
                // if (response.status === 201) {
                //     localStorage.setItem("tmData", response.body.traffic_matrix);
                //     localStorage.setItem("tmId", response.body.id);
                //     alert("successfully load excel file")
                //     $('#import-matrix').modal('hide');
                // }
            });
        } catch (error) {
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail.detail);
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail.detail)
            if (error.statusCode === 401) {
                await refreshToken();
                console.log("error for authenticate and update links")
                await submitDrawModeDataChanges(drawData);
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
    // formData.append('data', globalVar);

    // const request = {
    //     url: "http://localhost:5000/v1/PhysicalTopology/"+`${userId}?id=${localStorage.getItem("PTid")}`,
    //     method: "PUT",
    //     body: globalVar,
    //     headers: {
    //         'Accept':'application/json',
    //         'Content-Type':'application/json'
    //     },
    // };
    // SwaggerClient.http(request).then(response =>{
    //     console.log(response);
    //     if(response.status === 200){
    //         localStorage.setItem("PTdata",response.data);
    //         localStorage.setItem("PTid",response.body.Id);
    //     }
    // });
    // $.ajax({
    //     url: "http://localhost:5000/v1/PhysicalTopology/"+`${userId}?id=${localStorage.getItem("PTid")}}`,
    //     method: "PUT",
    //     data: globalVar,
    //     headers: {
    //         'accept':'application/json',
    //         'Content-Type':'application/json'
    //     },
    //     success: function (data) {
    //         // drawPhysicalTopology(data);
    //         console.log(data);
    //         alert("successful");
    //         localStorage.setItem("PTdata",globalVar);
    //
    //     }
    // });
    // let url = "http://localhost:5000/v1/PhysicalTopology/" + `${userId}?Id=${localStorage.getItem("PTid")}`;
    // var settings = {
    //     "url": "http://localhost:5000/v1/PhysicalTopology/1?Id=15",
    //     "method": "PUT",
    //     "timeout": 0,
    //     "headers": {
    //         "Content-Type": "application/json"
    //     },
    //     "data": JSON.stringify({
    //         "Nodes": [{
    //             "Name": "Tehran",
    //             "lat": 6.7,
    //             "lng": 7.4,
    //             "NodeType": "CDC"
    //         }, {"Name": "Qom", "lat": 4.5, "lng": 8.5, "NodeType": "CDC"}],
    //         "Links": [{"Source": "Tehran", "Destination": "Qom", "Distance": 10.1, "FiberType": "sm"}]
    //     }),
    // };
    //R
    // $.ajax(settings).done(function (response) {
    //     console.log(response);
    // });
    // backend_map.receive_DrawMode_data(JSON.stringify(globalVar), JSON.stringify(deletedOldLayers));
}

// output globals 
var globalVar;
var deletedOldLayers = [];
var SetNodeGateWay_flag = null;
var SelectSubNode_flag = null;
var groupcolor = null;
var marker_num = 0;
var failed_nodes = new Object();
var failed_nodes_list = [];
var clusters_info = new Object();
var clusters_info_list = [];
var lambdas = new Object();
var wrapper = document.createElement("div");
var canvas = document.createElement("canvas");
canvas.setAttribute("class", "focusArea");
var displayArea = document.createElement('div');
// displayArea.textContent = " ";
displayArea.setAttribute("id", "displayArea");
displayArea.innerHTML = "Wavelength Number:            ";
canvas.height = 50;
canvas.width = 420
wrapper.appendChild(canvas);
wrapper.appendChild(displayArea);
var Num_WL = null;
var Num_RG = null;
var Algorithm = null;
var Worst_SNR = null;


function setcolor(text) {
    groupcolor = text;
}

// dont use
function SetNode_flag_fun(text) {
    SetNodeGateWay_flag = text;
}

// dont use
function SelectSubNode_flag_fun(text) {
    SelectSubNode_flag = text;
}

// dont use
function receive_failed_nodes(NodeName, Color, SubNode) {
    failed_nodes[NodeName] = { "Color": Color, "SubNode": parseInt(SubNode) };
    failed_nodes_list.push(NodeName);
}

function change_failed_nodes_icon() {

    // loop on nodes group feature and notify their icon
    myFeatureGroup.eachLayer(function (layer) {
        NodeName = get_name(layer);

        if (failed_nodes_list.includes(NodeName)) {
            value = failed_nodes[NodeName]
            Color = value["Color"]
            SubNode = value["SubNode"]
            index = failed_nodes_list.indexOf(NodeName);
            failed_nodes_list.splice(index, 1);

            var latlng = layer.getLatLng();

            delete_node(layer);

            if (SubNode == 0) {
                change_icon(NodeName, latlng, Color, 1, "notified")
            } else {
                change_icon(NodeName, latlng, Color, 0.6, "notified")
            }

        }
    });
}

function set_failed_node_default(Source) {
    var value = failed_nodes[Source];
    var color = value["Color"];
    var subnode = value["SubNode"];
    var flag = 0;

    myFeatureGroup.eachLayer(function (layer) {
        NodeName = get_name(layer);
        if (NodeName == Source) {
            if (flag == 0) {

                var latlng = layer.getLatLng();
                delete_node(layer);

                if (subnode == 0) {

                    change_icon(NodeName, latlng, color, 1, "normal")
                } else {
                    ("yes sub node is 1")
                    change_icon(NodeName, latlng, color, 0.6, "normal")
                }
            }
            flag = 1;
        }
    });
}

/* get name and latLng Layer for delete_node and  change_icon color to default  */
function getNodeLayerByName(name)
{
    myFeatureGroup.eachLayer(function (layer) {
        let NodeName = get_name(layer);
        if (NodeName == name) {
           let getLatLngByLayer=layer.getLatLng();
           change_icon(name, getLatLngByLayer, "blue", 1, "normal");
           delete_node(layer);
        }
    });

}

function changeClusterColorToDefault(clusterNodesNameList)
{
    for(let i=0; i< clusterNodesNameList.length; i++)
    {
        getNodeLayerByName(clusterNodesNameList[i]);
    }
}

/* ------------- end of Function getNodeLayerByName/changeClusterColorToDefault : use in deleteClustring() ----------*/

function cancel_clustering(nodename) {
    console.log("cancel_clustering::",nodename);
    myFeatureGroup.eachLayer(function (layer) {

        NodeName = get_name(layer);

        if (NodeName == nodename) {
            var latlng = layer.getLatLng();
            delete_node(layer);

            change_icon(NodeName, latlng, "blue", 1, "normal")

        }
    });
}

function update_cluster_info(nodename, color, subnode_state) {
    clusters_info[nodename] = { "Color": color, "SubNode": parseInt(subnode_state) };
    clusters_info_list.push(nodename);
}

function hide_subnodes() {
    myFeatureGroup.eachLayer(function (layer) {

        NodeName = get_name(layer);

        if (clusters_info_list.includes(NodeName)) {
            SubNode_state = clusters_info[NodeName]["SubNode"];

            if (SubNode_state == 1) {
                layer.setOpacity(0);
            }
        }
    });
}

function show_subnodes() {
    myFeatureGroup.eachLayer(function (layer) {

        NodeName = get_name(layer);

        if (clusters_info_list.includes(NodeName)) {
            SubNode_state = clusters_info[NodeName]["SubNode"];

            if (SubNode_state == 1) {
                layer.setOpacity(0.6);
            }
        }
    });
}

//dont use
function receive_lambdas(Source, Destination, value) {
    a_value = JSON.parse(value)
    lambdas[[Source, Destination]] = a_value
}

function links_click_event(event) {

    link_key = get_name(event.layer);
    link_key = link_key.split("-");


    if (lambdas.hasOwnProperty(link_key)) {
        lambda_list = lambdas[link_key]


        drawLines(event.layer, lambda_list, handleMouseOverLines);
    }

}

function groupClick(event) {

    degreename = get_name(event.layer);
    console.log('degreename is : ', degreename)
    //alert(groupcolor)


    if (SetNodeGateWay_flag == "True") {

        backend_map.Create_DataBase(degreename)
        var latlng = event.layer.getLatLng();
        delete_node(event.layer);


        change_icon(degreename, latlng, groupcolor, 1, "normal");


        backend_map.SetNode_flag_fun("False", groupcolor)

    } else if (SelectSubNode_flag == "True") {

        backend_map.AddNode_DataBase(degreename)

        var latlng = event.layer.getLatLng();

        delete_node(event.layer);

        change_icon(degreename, latlng, groupcolor, 0.6, "normal");


    } else {
        //change view to nodeView
        // backend_map.change_tab_to4(degreename);
    }


}

var links_groupfeature = L.featureGroup().addTo(MapVar).on("click", links_click_event);
var myFeatureGroup = L.featureGroup().addTo(MapVar).on("click", groupClick);


function just_for_test() {
    alert("just for test")
}

function add_node(NodeName, latlng) {
    latlng = JSON.parse(latlng)
    //alert("start of add_node", NodeName, latlng);
    change_icon(NodeName, latlng, "blue", 1, "normal");
}


function add_link(Source_loc, Destination_loc, source_name, destination_name) {
    Source_loc = JSON.parse(Source_loc)
    Destination_loc = JSON.parse(Destination_loc)
    //alert("start of add_link", Source_loc, Destination_loc, source_name, destination_name)
    var link = L.polyline([Source_loc, Destination_loc],
        {
            "bubblingMouseEvents": true,
            "color": "black",
            "dashArray": null,
            "dashOffset": null,
            "fill": false,
            "fillColor": "black",
            "fillOpacity": 0.2,
            "fillRule": "evenodd",
            "lineCap": "round",
            "lineJoin": "round",
            "noClip": false,
            "opacity": 0.8,
            "smoothFactor": 1.0,
            "stroke": true,
            "weight": 3
        }
    ).addTo(MapVar);

    linkName = source_name + "-" + destination_name;
    link.bindTooltip("<h2>" + linkName + "</h2>");
    link.addTo(links_groupfeature);
}

//Delete Link
function delete_link(source, destination)
{
    links_groupfeature.eachLayer(function (layer)
    {
        linkToolTip =  get_name(layer);
        sourceDestinationList = linkToolTip.split("-");
        if((source == sourceDestinationList[0] && destination == sourceDestinationList[1]) || 
           (source == sourceDestinationList[1] && destination == sourceDestinationList[0]))
           {
            links_groupfeature.removeLayer(layer);
            MapVar.removeLayer(layer);
            layer.remove();
           }
    })
}

function google_map_view_set(green, yellow, orange) {
    links_groupfeature.eachLayer(function (layer) {
        //name-name
        link_key = get_name(layer);

        link_key = link_key.split("-");
        lambda_list = lambdas[link_key];
        Len = lambda_list.length;
        if (Len <= green) {
            layer.setStyle({
                color: 'green'
            });
        } else if (Len <= yellow) {
            layer.setStyle({
                color: 'yellow'
            });
        } else if (Len <= orange) {
            layer.setStyle({
                color: 'orange'
            });
        } else {
            layer.setStyle({
                color: 'red'
            });
        }
    });
}

function google_map_view_reset() {
    links_groupfeature.eachLayer(function (layer) {
        layer.setStyle({
            color: 'black'
        });
    });
}


function drawLines(layer, lambdaList, callback) {
    popupOptions = {
        maxWidth: "auto"
    };
    layer.bindPopup(drawDetailBox(lambdaList), popupOptions)

    callback(lambdaList)
}

function drawDetailBox(lambdaList) {
    canvas.height = 90;
    canvas.width = 806;
    var h = canvas.height;
    const lineYStart = 15;
    const lineYEnd = h - 20;
    var ctx = canvas.getContext("2d");
    for (var i = 1; i <= 100; i++) {
        const lineX = (i * 8) - 4
        ctx.beginPath();
        ctx.moveTo(lineX, lineYStart);
        ctx.lineTo(lineX, lineYEnd);
        ctx.lineWidth = 2;
        if (lambdaList.includes(i)) {
            ctx.strokeStyle = "black";
        } else {
            ctx.strokeStyle = "gray";
        }
        ctx.stroke();
        ctx.save();
        var textX = lineX - 4;
        var textY = h - lineYStart;
        if (i % 5 == 0) {
            textY = 12;
            ctx.translate(textX, textY);
            ctx.rotate(-Math.PI / 5);
            ctx.translate(-textX, -textY);
            ctx.fillText(i, textX, lineYStart);
        }
        ctx.restore();
    }
    return wrapper;
}

function handleMouseOverLines(lambdaList) {
    canvas.addEventListener("mousemove", e => showLineNumberInBox(e, lambdaList));
    canvas.addEventListener("mouseleave", e => unshowLineNumberInBox(lambdaList));
}

function showLineNumberInBox(e, lambdaList) {
    x = e.clientX;
    y = e.clientY;
    var lineNum = 0;
    const xOff = e.offsetX;
    if (xOff % 8 >= 2 && xOff % 8 <= 4) {
        cursor = " ";
        lineNum = 1 + parseInt(xOff / 8);
        if (lambdaList.includes(lineNum)) {
            cursor = lineNum;
        }
    } else {
        cursor = " ";
    }
    document.getElementById("displayArea").style.display = 'block';
    document.getElementById("displayArea").innerHTML = 'Wavelength Number: ' + cursor +
        "\n                                Wavelength (total): " + (lambdaList.length - 1);
    document.getElementById("displayArea").style.right = x + 'px';
    document.getElementById("displayArea").style.top = y + 'px';
}

function unshowLineNumberInBox(lambdaList) {
    document.getElementById("displayArea").innerHTML = 'Wavelength Number: ' +
        "\n                                Wavelength (total): " + (lambdaList.length - 1);
}

function createLegend(num_WL, num_RG, algorithm, worst_SNR, RWA_Runtime) {
    Num_WL = num_WL;
    Num_RG = num_RG;
    Algorithm = algorithm;
    Worst_SNR = worst_SNR;
    var legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        div.style.backgroundColor = 'WHITE';
        div.innerHTML += '<h4>Total number of used wavelengths<b>: ' + Num_WL + '</b></h4>';
        div.innerHTML += '<h4>Total number of regenerators<b>: ' + Num_RG + '</b></h4>';
        div.innerHTML += '<h4>Used algorithm and its runtime<b>: ' + Algorithm + '  ,  ' + RWA_Runtime + ' s' + '</b></h4>';
        div.innerHTML += '<h4>Worst SNR on all links<b>: ' + Worst_SNR + '</b></h4>';
        return div;
    };
    legend.addTo(MapVar);
}

function change_icon(NodeName, latlng, Color, Opacity, mode) {
    if (mode == "normal") {
        var url = "Icons/" + Color + "/server_" + Color + ".png"
    } else {
        var url = "Icons/" + Color + "/server_n" + Color + ".png"
    }

    // var flagIocn = L.AwesomeMarkers.icon({  // Creates a new icon
    //     icon: 'flag', // Comes from bootstrap glyphicons.
    //     markerColor: 'blue'
    //   });

    //alert(url)
    var myIcon = L.icon({
        iconUrl: url,
        iconSize: [30, 30],
        iconAnchor: [20, 30],
    });
    var mark = L.marker(latlng, {
        "opacity": Opacity,
        contextmenu: true,
        // contextmenuItems: [{
        //     text: 'Delete Cluster',
        //     index: 0,
        //     callback: function () {
        //         Delete_Cluster(mark);
        //     }
        // }, {
        //     separator: true,
        //     index: 1
        // }]
    }).setIcon(myIcon).addTo(MapVar);
    //var pop = L.popup({"maxWidth": "100%%"});
    //var htm = $(`<div id="htm" style="width: 100.0%%; height: 100.0%%;"><h2>${NodeName}</h2></div>`)[0];
    //pop.setContent(htm);
    mark.bindTooltip(
        `<div>
             <h2>${NodeName}</h2>
         </div>`,
        { "sticky": true }
    );
    mark.addTo(myFeatureGroup);
}

// this function asking GUI to return list of subnodes name and start deleting procedure
function Delete_Cluster(layer) {

    NodeName = get_name(layer);
    if (clusters_info_list.includes(NodeName)) {
        backend_map.fill_subnodes_list(NodeName);
        var latlng = layer.getLatLng();
        delete_node(layer);
        change_icon(NodeName, latlng, "blue", 1, "normal");
    } else {
        toastr.error('Selected Node is not Gateway!')
        // alert('Selected Node is not Gateway!');
    }

}

// this function is for deleting cluster
function Delete_Cluster_procedure(subnodes) {
    subnodes_list = JSON.parse(subnodes);
    alert("subnodes_list" +subnodes_list);

    myFeatureGroup.eachLayer(function (layer) {

        Name = get_name(layer);
        alert(Name);
        if (subnodes_list.includes(Name)) {
            var latlng = layer.getLatLng();
            delete_node(layer);
            change_icon(Name, latlng, "blue", 1, "normal");
        }
    });
}


var tempMarkerlist = [];

function topologyMenuHandler() {
    $('#draw-physicaltopology-btn').prop("disabled", true);
    var pathToIcon = "Icons/blue/server_blue.png"
    var markersGroup = myFeatureGroup;
    var linksGroup = links_groupfeature;
    mymap = MapVar;


    deletedOldLayers = [];
    markers = [];
    tempMarkerlist = [];
    links = [];
    globalVar = [];

    // disabling nodes context menu
    MapVar.contextmenu = false;

    var oldMarkers = [];
    var oldLinks = [];

    featureGroup = new L.featureGroup();
    featureGroup.addTo(mymap);
    featureGroup.on("click", handleMarkerOnClick);

    //turn pervious methods off
    markersGroup.off("click", groupClick);
    linksGroup.off("click", links_click_event);

    markersGroup.on("click", handleMarkerOnClick);

    featureGroup.on("contextmenu", e => deleteOnRightClick(e, featureGroup, markers, links, mymap));

    markersGroup.on("contextmenu", e => deleteOnRightClickOld(e, markersGroup, linksGroup, mymap, featureGroup));
    linksGroup.on("contextmenu", e => deleteOnRightClickOld(e, markersGroup, linksGroup, mymap, featureGroup));

    enableOldMarkerDragging(markersGroup, linksGroup, featureGroup);

    markersGroup.eachLayer(layer => {
        oldMarkers.push({
            "name": getLayerName(layer),
            "location": layer.getLatLng(),
            "layer": layer,
            "data": {},
            "isNew": false
        });
    });

    linksGroup.eachLayer(layer => {
        oldLinks.push({
            "name": getLayerName(layer),
            "start": getMarkerNameByLatLng(layer.getLatLngs()[0], markersGroup),
            "end": getMarkerNameByLatLng(layer.getLatLngs()[1], markersGroup),
            "startLoc": layer.getLatLngs()[0],
            "endLoc": layer.getLatLngs()[1],
            "layer": layer,
            "data": {},
            "isNew": false
        });
    });

    var addNodeForm = createAddNodeForm(featureGroup, markers, mymap, pathToIcon, oldMarkers);
    var addLinkForm = createAddLinkForm(featureGroup, links, mymap, linksGroup);

    var div = document.createElement("div");
    div.setAttribute("id", "topology-panel");

    var menu = L.control({ position: 'topright' });
    var closeBtn = document.createElement("button");
    closeBtn.setAttribute("class", "mainmap-util-closebtn");

    var addNodeBtn = document.createElement("button");
    addNodeBtn.setAttribute("class", "mainmap-util-btn");
    var addLinkbtn = document.createElement("button");
    addLinkbtn.setAttribute("class", "mainmap-util-btn");
    var doneBtn = document.createElement("button");
    doneBtn.setAttribute("class", "mainmap-util-btn");

    closeBtn.addEventListener("click", e => {

        markers = [];
        tempMarkerlist = [];
        links = [];
        globalVar = [];

        featureGroup.remove();
        closeAllPopups();
        markersGroup.off("click", handleMarkerOnClick);

        markersGroup.eachLayer(layer => {
            layer.dragging.disable();
        });

        markersGroup.off("contextmenu");
        linksGroup.off("contextmenu");

        // restore deleted layers
        restoreDeletedLayers(markersGroup, linksGroup);

        restoreDraggedLayersLocation(oldMarkers, oldLinks);

        restoreOldFeatureGroupEvents(markersGroup, linksGroup);

        div.remove();
        $('#draw-physicaltopology-btn').prop("disabled", false);
    });


    addNodeBtn.addEventListener("click", e => {

        if (document.getElementById("addLinkForm").style.display === "block")
            return;
        document.getElementById("addNodeForm").style.display = "block";
    });

    updateVar = "";

    doneBtn.addEventListener("click", async () => {
        $.confirm({
            animation: 'zoom',
            closeAnimation: 'scale',
            title: 'Prompt for comment!',
            content: '' +
                '<form class="formName">' +
                '<div class="form-group">' +
                '<label>Enter comment here</label>' +
                '<input type="text" placeholder="Your comment" class="comment form-control" required />' +
                '</div>' +
                '</form>',
            buttons: {
                formSubmit: {
                    text: 'Submit',
                    btnClass: 'btn-blue',
                    action: function () {
                        var comment = this.$content.find('.comment').val();
                        if (!comment) {
                            $.alert('enter comment');
                            return false;
                        }
                        drawDoneBtnConfirmed(comment, markersGroup, featureGroup, linksGroup, oldMarkers, oldLinks);
                        $("#topology-panel").remove();
                    }
                },
                cancel: function () {
                    // return false;
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

    });

    doneBtn.innerHTML = "Done";
    addNodeBtn.innerHTML = "Add Node";
    closeBtn.innerHTML = "x";
    addLinkbtn.innerHTML = "Add Link"

    addLinkbtn.addEventListener("click", e => {

        if (document.getElementById("addNodeForm").style.display === "block")
            return;
        document.getElementById("addLinkForm").style.display = "block";
    });

    menu.onAdd = function (map) {

        div.appendChild(doneBtn);
        div.appendChild(addLinkbtn);
        div.appendChild(addNodeBtn);
        div.appendChild(closeBtn);
        div.appendChild(addNodeForm);
        div.appendChild(addLinkForm);

        return div;
    };

    menu.addTo(mymap);
}

async function drawDoneBtnConfirmed(comment, markersGroup, featureGroup, linksGroup, oldMarkers, oldLinks) {
    featureGroup.eachLayer(layer => {
        if (layer instanceof L.Marker)
            layer.dragging.disable();
    });

    markersGroup.eachLayer(layer => {
        layer.dragging.disable();
    });

    featureGroup.off("click", handleMarkerOnClick);

    markersGroup.off("click", handleMarkerOnClick);

    featureGroup.off("contextmenu");
    markersGroup.off("contextmenu");
    linksGroup.off("contextmenu");

    closeAllPopups();

    div.remove();
    featureGroup.eachLayer(l => {
        if (l instanceof L.Marker) {
            l.addTo(markersGroup);
        } else if (l instanceof L.Polyline)
            l.addTo(linksGroup);
    });

    fixMarkersData(markers);

    var deletedOldLayersName = deletedOldLayers.map(l => getLayerName(l));

    //save changed old layers to markers and links
    saveChangedOldMarkersToMarkers(oldMarkers, markers, deletedOldLayersName);
    saveChangedOldLinktoLink(oldLinks, links, deletedOldLayersName);

    deletedOldLayers = {
        "nodes":
            deletedOldLayers
                .filter(l => l instanceof L.Marker)
                .map(l => getLayerName(l)),

        "links":
            deletedOldLayers
                .filter(l => l instanceof L.Polyline)
                .map(l => {
                    name = getLayerName(l);
                    var name = name.split("-");
                    return {
                        "start": name[0].trim(),
                        "end": name[1].trim()
                    };
                })
    };

    globalVar = {
        "Nodes": markers,
        "Links": links
    };

    globalVar = JSON.stringify(globalVar);
    deletedOldLayers = JSON.stringify(deletedOldLayers);

    restoreOldFeatureGroupEvents(markersGroup, linksGroup);

    let physical = await getAllRecords("physical")
    if (localStorage.getItem("projectState") == 'loaded' && Offline.state == "up") {
        physical[0].comment = comment
        let drawData = await storeLocallyDrawModeDataChanges(physical[0].data);
        physical[0].data = drawData;
        if (updateElement("physical", physical[0])) {
            tableviewPtData.data = drawData;
            initPtTableView();
            initTmTableView();
            toastr.success("successfully save draw data locally");
            div.remove();
        }
        console.log('draw done button confirmed')
        await submitDrawModeDataChanges(physical[0]);
    } else if (localStorage.getItem("projectState") == 'creating') {
        if (physical == null) {
            physical = []
            let project = await getAllRecords("project")
            let ptRecord = new Object();
            ptRecord.id = 0;
            ptRecord.name = $('#project-draw-name').val();
            ptRecord.comment = comment;
            ptRecord.project = project[0].name
            physical[0] = ptRecord
            await addElement('physical', ptRecord);
        }
        let topologyData = {
            "nodes": [],
            "links": []
        }
        let drawData = await storeLocallyDrawModeDataChanges(topologyData);
        physical[0].data = drawData;
        if (updateElement("physical", physical[0])) {
            tableviewPtData.data = drawData;
            await initPtTableView();
            await initTmTableView();
            toastr.success("successfully save draw data locally");
        }
        $('#back-step-4').hide();
        sendEvent('#create-project-modal-5', 4, "Continue", true)
        $('#create-project-modal-5').modal('show');
        // $("#create-project-nav-btn").click();
    }
    else if (Offline.state == "down") {
        await storeLocallyDrawModeDataChanges(physical[0].data);
    }
    // remove new markers drag events

    $('#draw-physicaltopology-btn').prop("disabled", false);
    // send layers to linksGroup and markersGroup, delete the local featureGroup

}

// check for links connected to marker, also delete the data. - params? - only works for new nodes now
function deleteOnRightClick(event, featureGroup, markers, links, mymap) {
    closeAllPopups();
    temp = confirm("Are you sure you want to delete this?")
    if(temp==true){
    tempMarkerlist = [];
    if (event.layer instanceof L.Marker) {
        //delete data, connected links;
        marker = event.layer;
        var connectedLinks = [];
        getConnectedLinks(marker, featureGroup, connectedLinks);
        if (connectedLinks.length == 0) {
            deleteOnRightClickLayer(marker, markers, featureGroup);
        } else {
            toastr.error("Marker cannot be deleted - remove the connected links first.")
            // popupAlert("Marker cannot be deleted - remove the connected links first.", mymap);
        }
    } else if (event.layer instanceof L.Polyline) {
        link = event.layer;
        deleteOnRightClickLayer(link, links, featureGroup);
    }
}
}

function deleteOnRightClickLayer(layer, list, featureGroup) {
    var name = getLayerName(layer);
    var index = -1;
    list.forEach(l => {
        if (l.name == name) {
            index = list.indexOf(l);
            return;
        }
    });
    list.splice(index, 1);
    featureGroup.removeLayer(layer);
}

function deleteOnRightClickOld(event, markersGroup, linksGroup, mymap, featureGroup) {
    temp = confirm("Do you want to delete this Marker?")
    console.log(temp)
    closeAllPopups();
    tempMarkerlist = [];
    if (event.layer instanceof L.Marker) {
        marker = event.layer;
        var connectedLinks = [];
        getConnectedLinks(marker, linksGroup, connectedLinks);
        getConnectedLinks(marker, featureGroup, connectedLinks)
        if (connectedLinks.length == 0) {
            deletedOldLayers.push(marker);
            markersGroup.removeLayer(marker);
        } else {
            toastr.error("Marker cannot be deleted - remove the connected links first.")
            // popupAlert("Marker cannot be deleted - remove the connected links first.", mymap);
        }
    } else if (event.layer instanceof L.Polyline) {
        link = event.layer;
        deletedOldLayers.push(link);
        linksGroup.removeLayer(link);
    }
}

function restoreDeletedLayers(markersGroup, linksGroup) {
    if (deletedOldLayers != undefined && deletedOldLayers.length > 0)
        deletedOldLayers.forEach(layer => {
            if (layer instanceof L.Marker)
                markersGroup.addLayer(layer);
            else if (layer instanceof L.Polyline)
                linksGroup.addLayer(layer);
        });
}

function createAddNodeForm(featureGroup, markers, mymap, pathToIcon, oldMarkers) {

    var div = document.createElement("div");
    div.setAttribute("id", "addNodeForm");
    div.setAttribute("class", "vertical");

    var inputParams = {
        "paramNames": ["Node_Name", "Number of Channels for Expansion"],
        "paramValues": ["", "0"],
        "paramAllValues": ["", ["0"]]
    }

    var nodeParams = createParamsInputsNode(inputParams.paramNames, inputParams.paramValues);


    var doneBtn = document.createElement("button");
    doneBtn.setAttribute("id", "submitNodeForm");
    doneBtn.setAttribute("class", "mainmap-util-btn");
    doneBtn.innerHTML = "Done";

    var closeBtn = document.createElement("button");
    closeBtn.setAttribute("id", "closeNodeForm");
    closeBtn.setAttribute("class", "mainmap-util-btn");
    closeBtn.innerHTML = "Close";

    closeBtn.addEventListener("click", e => {
        document.getElementById("addNodeForm").style.display = "none";
        $('#draw-physicaltopology-btn').prop("disabled", false);
    });

    doneBtn.addEventListener("click", e => {
        var nodeData;
        nodeData = onSubmitForm(inputParams.paramValues, inputParams.paramNames);
        nodeData[""] = document.getElementById("RegenCap").value;
        temp = document.getElementById("node_type").value;
        console.log("node type = ", temp)
        if(temp=="OXC(Colored-Directionless)"){
            nodeData["node_type"] = "Directionless"
        }
        else if(temp=="OXC(Colorless-Directionless)"){
            nodeData["node_type"] = "Colorless"
        }
        else if(temp=="OXC(CDC)"){
            nodeData["node_type"] = "CDC"
        }
        else {
            nodeData["node_type"] = temp;
        }
        // hard coded
        nodeData["no_extra_wavelength__for_expansion"] = document.getElementById("Number of Channels for Expansion").value;
        if (nodeData["no_extra_wavelength__for_expansion"] == ""){
            nodeData["no_extra_wavelength__for_expansion"] = 0;
        }
        nodeData["no_add_drop_reg_wl"] = 0;

        console.log(nodeData)
        var marker;

        //check for input param validity:
        if (!isNameValid(inputParams.paramNames[0], markers) || !isNameValid(inputParams.paramNames[0], oldMarkers)) {
            toastr.error("Invalid Node name")
            return;
        }

        // if (!areNodeParamsValid(inputParams.paramNames[1], inputParams.paramAllValues[1])) {
        //     toastr.error("Invalid parameter. \n" +
        //         "Node Type can have a value of \"Directionless\" or \"CDC\".")
        //     return;
        // }

        markerName = document.getElementById(inputParams.paramNames[0]).value;

        marker = L.marker(mymap.getCenter(), {
            draggable: true,
            icon: createCustomIcon(pathToIcon)
        });

        marker.bindTooltip("<h3>" + markerName + "</h3>");

        featureGroup.addLayer(marker);

        var connectedLinks = [];
        var markerInitLatLng;

        marker.on("dragstart", e => {

            connectedLinks = []
            markerInitLatLng = e.target.getLatLng();
            getConnectedLinks(e.target, featureGroup, connectedLinks);
        });

        marker.on("drag", e => {
            markerInitLatLng = connectLinkToNode(e.target, connectedLinks, markerInitLatLng);
        })

        marker.on("dragend", e => {
            markerInitLatLng = connectLinkToNode(e.target, connectedLinks, markerInitLatLng);
        });


        markers.push({
            "name": markerName,
            "layer": marker,
            "data": nodeData,
            "isNew": true
        });

        div.style.display = "none";
    });

    for (var i = 0; i < nodeParams.length; i++) {
        div.appendChild(nodeParams[i].label);
        div.appendChild(nodeParams[i].param);
    }
    div.appendChild(doneBtn);
    div.appendChild(closeBtn);
    div.style.display = "none";
    return div;
}

function handleMarkerOnClick(event) {

    if (!(event.layer instanceof L.Marker)) {
        return;
    }

    var marker = event.layer;

    var srcNodepopup = L.popup(
        { closeOnClick: false, autoClose: false, offset: new L.Point(1, -15) })
        .setContent("Source Node");
    var destNodepopup = L.popup(
        { closeOnClick: false, autoClose: false, offset: new L.Point(1, -15) })
        .setContent("Destination Node");

    var isSrc = setLinkSrcAndDest(marker);

    if (isSrc) {
        closeAllPopups();
        srcNodepopup.setLatLng(marker.getLatLng()).openOn(mymap);
    } else {
        destNodepopup.setLatLng(marker.getLatLng()).openOn(mymap);
    }

}

function createAddLinkForm(featureGroup, links, mymap, linksGroup) {

    var div = document.createElement("div");
    div.setAttribute("id", "addLinkForm");
    div.setAttribute("class", "vertical");

    var inputParams = {
        "paramValues": ["0.0", "0.0","0.0","0.0"],
        "paramNames": ["Length (Km)", "Loss_Coefficient (dB/Km)", "Dispersion (ps/Km-nm)","Non-Linear Parameter Ɣ"]
    };

    //create link Params
    linkParams = createParamsInputsForm(inputParams.paramNames, inputParams.paramValues);

    var doneBtn = document.createElement("button");
    doneBtn.setAttribute("id", "submitLinkForm");
    doneBtn.setAttribute("class", "mainmap-util-btn");
    doneBtn.innerHTML = "Done";

    var closeBtn = document.createElement("button");
    closeBtn.setAttribute("id", "closeLinkForm");
    closeBtn.setAttribute("class", "mainmap-util-btn");
    closeBtn.innerHTML = "Close";

    closeBtn.addEventListener("click", () => {
        document.getElementById("addLinkForm").style.display = "none";
        $('#draw-physicaltopology-btn').prop("disabled", false);
    });

    doneBtn.addEventListener("click", () => {

        var linkData;

        linkData = onSubmitForm(inputParams.paramValues, inputParams.paramNames);
        var temp = document.getElementById("FiberType").value;
        linkData["FiberType"] = temp
        var temp = document.getElementById("Spec").value;
        linkData["Spec"] = temp
        console.log(linkData)
        // will uncomment this once I fixed the method
        // var linkValidity = checkLinkValidity(tempMarkerlist, featureGroup);

        // if (!linkValidity.isValid) {
        //     popupAlert(linkValidity.msg, mymap)
        //     return;
        // }

        if (tempMarkerlist.length === 0 || tempMarkerlist[tempMarkerlist.length - 1] == undefined || tempMarkerlist[tempMarkerlist.length - 2] == undefined) {
            toastr.error("No chosen nodes.")
            // popupAlert("No chosen nodes.", mymap);
            return;
        } else if (tempMarkerlist.length === 1) {
            toastr.error("Choose a destination node.")
            // popupAlert("Choose a destination node.", mymap);
            return;
        }

        if (tempMarkerlist[tempMarkerlist.length - 1] === tempMarkerlist[tempMarkerlist.length - 2]) {
            toastr.error("Choose a destination node.")
            // popupAlert("Choose a destination node.", mymap);
            return;
        }

        // valid length
        if (!isLengthValid(inputParams.paramNames[0])) {
            toastr.error("Invalid Link Length")
            // popupAlert("Invalid Link Length", mymap);
            return;
        }


        // put this to handle no returning out of the following loop, wtf is wrong with my code?
        var exitVar = false;

        //check the new featuregreoup for a duplicate link
        featureGroup.eachLayer(layer => {
            if (layer instanceof L.Polyline) {
                if (layer.getLatLngs().includes(
                    tempMarkerlist[tempMarkerlist.length - 1].getLatLng())
                    && layer.getLatLngs().includes(
                        tempMarkerlist[tempMarkerlist.length - 2].getLatLng())) {
                    toastr.error("Link already exists.")
                    // popupAlert("Link already exists.", mymap);
                    exitVar = true;
                    return;
                }
            }

        });


        // check oldFeatureGroup fro a duplicate link
        linksGroup.eachLayer(layer => {
            if (layer instanceof L.Polyline) {
                if (layer.getLatLngs().includes(
                    tempMarkerlist[tempMarkerlist.length - 1].getLatLng())
                    && layer.getLatLngs().includes(
                        tempMarkerlist[tempMarkerlist.length - 2].getLatLng())) {
                    toastr.error("Link already exists.")
                    // popupAlert("Link already exists.", mymap);
                    exitVar = true;
                    return;
                }
            }
        })

        if (exitVar) {
            return;
        }

        // just to make sure this line does not get executed after returning, js is acting funky again
        // console.log("exec?");

        var startMarker = tempMarkerlist[tempMarkerlist.length - 1];
        var endMarker = tempMarkerlist[tempMarkerlist.length - 2];

        var latlngs = [
            startMarker.getLatLng(),
            endMarker.getLatLng(),
        ];

        var link = L.polyline(latlngs,
            {
                color: 'black',
                opacity: 0.8,
                weight: 3
            }
        );

        closeAllPopups();

        linkName = getLayerName(startMarker) + "-" + getLayerName(endMarker);
        link.bindTooltip("<h3>" + linkName + "</h3>");
        featureGroup.addLayer(link);

        // linkData = onSubmitForm(inputParams.paramValues, inputParams.paramNames);
        // console.log(linkData)

        links.push({
            "name": linkName,
            "start": getLayerName(startMarker),
            "end": getLayerName(endMarker),
            "data": linkData,
            "isNew": true
        });

        div.style.display = "none";
        $('#draw-physicaltopology-btn').prop("disabled", false);
    });

    //add link params list
    for (var i = 0; i < linkParams.length; i++) {
        div.appendChild(linkParams[i].label);
        div.appendChild(linkParams[i].param);
    }
    div.appendChild(doneBtn);
    div.appendChild(closeBtn);

    div.style.display = "none";

    return div;

}


function onSubmitForm(paramValues, paramNames) {

    params = {};

    //set the default value if there is no input
    for (var i = 0; i < paramValues.length; i++) {
        var param = document.getElementById(paramNames[i]).value;
        if (param === "" || param === null)
            param = paramValues[i];
        params[paramNames[i]] = param;
    }
    return params;
}

function isLengthValid(lengthId) {
    length = document.getElementById(lengthId).value;

    if (length == null)
        return false;
    if (isNaN(length))
        return false;

    return true;
}

function isNameValid(nameId, inputList) {

    //also check that the name is not already in the input list

    const name = document.getElementById(nameId).value;

    if (name === null || name === "")
        return false;

    for (i = 0; i < inputList.length; i++) {
        if (inputList[i].name.toLowerCase() === name.toLowerCase())
            return false;
    }
    return true;
}

function areNodeParamsValid(paramName, allValues) {

    nodeParam = document.getElementById(paramName);

    if (nodeParam.value === null || nodeParam.value === "") {
        return true;
    }

    for (i = 0; i < allValues.length; i++) {
        if (nodeParam.value.trim() === allValues[i])
            return true;
    }

    return false;

}

function getLayerName(marker) {

    var tooltip = marker["_tooltip"];
    if (tooltip == null || tooltip == undefined) {
        return "no_name";
    }
    x = tooltip["_content"];
    var doc = new DOMParser().parseFromString(x, "text/xml");
    var z = doc.documentElement.textContent;
    NodeName = z.replace(/\s/g, '');
    return NodeName;
}

function popupAlert(msg, mymap) {

    var div = document.createElement("div");
    div.setAttribute("class", "alert");
    var alertTxt = document.createElement("div");
    alertTxt.setAttribute("class", "alert-txt");
    var closeBtn = document.createElement("button");

    alertTxt.innerHTML = msg;
    closeBtn.innerHTML = "x";
    closeBtn.setAttribute("class", "mainmap-util-closebtn");

    closeBtn.addEventListener("click", () => {
        div.remove()
        $('#draw-physicaltopology-btn').prop("disabled", false);
    });

    var alertBox = L.control({ position: 'bottomright' });

    alertBox.onAdd = function (map) {
        div.appendChild(alertTxt);
        div.appendChild(closeBtn);
        return div;
    };

    alertBox.addTo(mymap);
}

function connectLinkToNode(marker, connectedLinks, markerInitLatLng) {

    for (var i = 0; i < connectedLinks.length; i++) {
        var link = connectedLinks[i];
        // console.log("ll" + link.getLatLngs());
        // console.log("ma" + marker.getLatLng());

        var latLngStart = link.getLatLngs()[0];
        var latLngEnd = link.getLatLngs()[1];

        if (latLngEnd.lat == markerInitLatLng.lat && latLngEnd.lng == markerInitLatLng.lng) {

            link.setLatLngs([
                link.getLatLngs()[0],
                marker.getLatLng()
            ]);
        } else if (latLngStart.lat == markerInitLatLng.lat && latLngStart.lng == markerInitLatLng.lng) {

            link.setLatLngs([
                marker.getLatLng(),
                link.getLatLngs()[1]
            ]);
        }
    }
    return marker.getLatLng();
}

function getConnectedLinks(marker, featureGroup, connectedLinks) {

    featureGroup.eachLayer(layer => {
        if (layer instanceof L.Polyline) {
            if (marker.getLatLng().lat == layer.getLatLngs()[0].lat && marker.getLatLng().lng == layer.getLatLngs()[0].lng) {
                connectedLinks.push(layer)
                //console.log("found");
            }
            if (marker.getLatLng().lat == layer.getLatLngs()[1].lat && marker.getLatLng().lng == layer.getLatLngs()[1].lng) {
                connectedLinks.push(layer)
                //console.log("found");
            }
        }
    });
}

function setLinkSrcAndDest(marker) {

    if (tempMarkerlist[0] == null) {
        // console.log('srccc   ');
        tempMarkerlist[0] = marker;
        return true;
    } else {
        if (tempMarkerlist[1] == null) {
            // console.log("desttt ");
            tempMarkerlist[1] = marker;
            return false;
        } else {
            // console.log("haha markers go recc recc");
            tempMarkerlist[0] = null;
            tempMarkerlist[1] = null;
            return setLinkSrcAndDest(marker);
        }
    }

}

function createLblTxtFromParamName(paramNames) {

    var lblTxts = [];
    for (var i = 0; i < paramNames.length; i++) {
        var txt = paramNames[i].replace(/_/g, " ");
        txt = txt.concat(": ");
        lblTxts.push(txt);
    }

    return lblTxts;
}

function createParamsInputs(paramNames, paramValues) {

    var paramLblTxts = createLblTxtFromParamName(paramNames);

    var paramElements = [];

    for (var i = 0; i < paramNames.length; i++) {
        var param = document.createElement("input");
        param.setAttribute("id", paramNames[i]);
        param.setAttribute("class", "mainmap-util-input");
        param.setAttribute("type", "text");
        param.placeholder = paramValues[i];

        var paramLbl = document.createElement("label");
        paramLbl.setAttribute("class", "mainmap-util-label");
        paramLbl.innerHTML = paramLblTxts[i];

        paramElements.push({
            "param": param,
            "label": paramLbl
        });
    }

    return paramElements;
}


function createLblTxtFromParamName(paramNames) {

    var lblTxts = [];
    for (var i = 0; i < paramNames.length; i++) {
        var txt = paramNames[i].replace(/_/g, " ");
        txt = txt.concat(": ");
        lblTxts.push(txt);
    }

    return lblTxts;
}

function createParamsInputsNode(paramNames, paramValues) {

    var paramLblTxts = createLblTxtFromParamName(paramNames);

    var paramElements = [];

    for (var i = 0; i < paramNames.length; i++) {
        var param = document.createElement("input");
        param.setAttribute("id", paramNames[i]);
        param.setAttribute("class", "mainmap-util-input");
        param.setAttribute("type", "text");
        param.placeholder = paramValues[i];

        var paramLbl = document.createElement("label");
        paramLbl.setAttribute("class", "mainmap-util-label");
        paramLbl.innerHTML = paramLblTxts[i];

        paramElements.push({
            "param": param,
            "label": paramLbl
        });
    }

    var Typeselect = document.createElement("select");
    var option1 = document.createElement("option"),
        text = document.createTextNode("OXC(Colored-Directionless)");
    var option2 = document.createElement("option"),
    text2 = document.createTextNode("OXC(Colorless-Directionless)");
    var option3 = document.createElement("option"),
    text3 = document.createTextNode("OXC(CDC)");
    var option4 = document.createElement("option"),
    text4 = document.createTextNode("OLA");
    option1.appendChild(text);
    option2.appendChild(text2);
    option3.appendChild(text3);
    option4.appendChild(text4);

    Typeselect.appendChild(option1);
    Typeselect.appendChild(option2);
    Typeselect.appendChild(option3);
    Typeselect.appendChild(option4);
    Typeselect.setAttribute("id","node_type")

    Typeselect.addEventListener("change", () => {
        if(Typeselect.value == "OLA"){
            // console.log("ola")
            document.getElementById("Number of Channels for Expansion").disabled = true;
            document.getElementById("Number of Channels for Expansion").value = null;
        }
        else{
            document.getElementById("Number of Channels for Expansion").disabled = false;
        }
    })
    
    var NodeTypeLbl = document.createElement("label");
    NodeTypeLbl.setAttribute("class", "mainmap-util-label");
    NodeTypeLbl.innerHTML = "Node Type";

    var Regen = document.createElement("select");
    var option1 = document.createElement("option"),
        text = document.createTextNode("True");
    var option2 = document.createElement("option"),
    text2 = document.createTextNode("False");
    option1.appendChild(text);
    option2.appendChild(text2);
    Regen.appendChild(option1);
    Regen.appendChild(option2);
    Regen.setAttribute("id","RegenCap")



    var RegenLbl = document.createElement("label");
        RegenLbl.setAttribute("class", "mainmap-util-label");
        RegenLbl.innerHTML = "Regeneration Capability";
    
    paramElements.push({
        "param": Typeselect,
        "label": NodeTypeLbl
    });

    paramElements.push({
        "param": Regen,
        "label": RegenLbl
    });
    
    return paramElements;
}


function createParamsInputsForm(paramNames, paramValues) {

    var paramLblTxts = createLblTxtFromParamName(paramNames);

    var paramElements = [];

    var Typeselect = document.createElement("select");
    var option1 = document.createElement("option"),
        text = document.createTextNode("SMF (G.652)");
    var option2 = document.createElement("option"),
    text2 = document.createTextNode("NZDSF (G.655)");
    option1.appendChild(text);
    option2.appendChild(text2);
    Typeselect.appendChild(option1);
    Typeselect.appendChild(option2);
    Typeselect.setAttribute("id", "FiberType");

    
    var TypeLbl = document.createElement("label");
    TypeLbl.setAttribute("class", "mainmap-util-label");
    TypeLbl.innerHTML = "Fiber Type";

    var Spec = document.createElement("select");
    var option1 = document.createElement("option"),
        text = document.createTextNode("Default");
    var option2 = document.createElement("option"),
    text2 = document.createTextNode("Customized");
    option1.appendChild(text);
    option2.appendChild(text2);
    Spec.appendChild(option1);
    Spec.appendChild(option2);
    Spec.setAttribute("id", "Spec");
    Spec.addEventListener("change", () => {
        if(Spec.value == "Default"){
            document.getElementById("Loss_Coefficient (dB/Km)").setAttribute('disabled', '');
            document.getElementById("Dispersion (ps/Km-nm)").setAttribute('disabled', '');
            document.getElementById("Non-Linear Parameter Ɣ").setAttribute('disabled', '');
            document.getElementById("Loss_Coefficient (dB/Km)").value = 0;
            document.getElementById("Dispersion (ps/Km-nm)").value = 0;
            document.getElementById("Non-Linear Parameter Ɣ").value = 0;
        }
        if(Spec.value == "Customized"){
            document.getElementById("Loss_Coefficient (dB/Km)").removeAttribute('disabled');
            document.getElementById("Dispersion (ps/Km-nm)").removeAttribute('disabled');
            document.getElementById("Non-Linear Parameter Ɣ").removeAttribute('disabled');
        }
    })


    var SpecLbl = document.createElement("label");
    SpecLbl.setAttribute("class", "mainmap-util-label");
    SpecLbl.innerHTML = "Specifications";
    
    paramElements.push({
        "param": Typeselect,
        "label": TypeLbl
    });

   
    for (var i = 0; i < paramNames.length; i++) {
        var param = document.createElement("input");
        param.setAttribute("id", paramNames[i]);
        param.setAttribute("class", "mainmap-util-input");
        param.setAttribute("type", "text");
        param.placeholder = paramValues[i];

        var paramLbl = document.createElement("label");
        paramLbl.setAttribute("class", "mainmap-util-label");
        paramLbl.innerHTML = paramLblTxts[i];
        if (i==1){
            paramElements.push({
                "param": Spec,
                "label": SpecLbl
            });
        
        }
        paramElements.push({
            "param": param,
            "label": paramLbl
        });
        
    }


    
    return paramElements;
}

// not using this now - codes's acting strange
function checkLinkValidity(featureGroup) {

    if (tempMarkerlist.length === 0) {
        return {
            "isValid": false,
            "msg": "No chosen nodes."
        };
    } else if (tempMarkerlist.length === 1) {
        return {
            "isValid": false,
            "msg": "Chose a destination node."
        };
    }

    if (tempMarkerlist[tempMarkerlist.length - 1] === tempMarkerlist[tempMarkerlist.length - 2]) {
        return {
            "isValid": false,
            "msg": "Chose a destination node."
        };
    }

    latlngs = [
        tempMarkerlist[tempMarkerlist.length - 1].getLatLng(),
        tempMarkerlist[tempMarkerlist.length - 2].getLatLng(),
    ];

    featureGroup.eachLayer(layer => {
        if (layer instanceof L.Polyline) {
            if (layer.getLatLngs().includes(latlngs[0]) && layer.getLatLngs().includes(latlngs[1])) {
                // console.log("rep", layer.getLatLngs(), latlngs[0], latlngs[1]);
                return {
                    "isValid": false,
                    "msg": "rep"
                };
            }
        }

    });

    return {
        "isValid": true,
        "msg": ""
    };

}

function addLayersToMap(featureGroup, mymap) {

    featureGroup.addTo(mymap);
}

function createCustomIcon(pathToIcon) {

    var myIcon = L.icon({
        iconUrl: pathToIcon,
        iconSize: [30, 30],
        iconAnchor: [20, 30]
    });

    return myIcon;
}

function restoreOldFeatureGroupEvents(markersGroup, linksGroup) {
    markersGroup.on("click", groupClick);
    linksGroup.on("click", links_click_event);
}

function closeAllPopups() {
    mymap.eachLayer(l => {
        // console.log("JOJO");
        if (l instanceof L.Popup) {
            // console.log("KONO DIO DA");
            mymap.removeLayer(l);
        }
    });
}

function fixMarkersData(markers) {
    markers.forEach(marker => {
        marker["location"] = marker["layer"].getLatLng();
        delete marker["layer"];
    });
}

function enableOldMarkerDragging(markersGroup, linksGroup, featureGroup) {

    markersGroup.eachLayer(marker => {
        marker.dragging.enable();
        var connectedLinks = [];
        var markerInitLatLng;

        marker.on("dragstart", e => {

            connectedLinks = []
            markerInitLatLng = e.target.getLatLng();
            getConnectedLinks(e.target, featureGroup, connectedLinks);
            getConnectedLinks(e.target, linksGroup, connectedLinks);
        });

        marker.on("drag", e => {
            markerInitLatLng = connectLinkToNode(e.target, connectedLinks, markerInitLatLng);
        })

        marker.on("dragend", e => {
            markerInitLatLng = connectLinkToNode(e.target, connectedLinks, markerInitLatLng);
        });
    });
}

function restoreDraggedLayersLocation(oldMarkers, oldLinks) {

    oldMarkers.forEach(m => {
        m.layer.setLatLng(m.location);
    });

    oldLinks.forEach(l => {
        l.layer.setLatLngs([
            l.startLoc,
            l.endLoc
        ]);
    });
}

function saveChangedOldMarkersToMarkers(oldMarkers, markers, deletedOldLayers) {
    oldMarkers.forEach(m => {
        if (!(m.location === m.layer.getLatLng()) && !deletedOldLayers.includes(m.name)) {
            m.location = m.layer.getLatLng();
            delete m["layer"];
            markers.push(m);
        }
    });
}

function saveChangedOldLinktoLink(oldLinks, links, deletedOldLayers) {
    oldLinks.forEach(l => {
        if ((!(l.startLoc === l.layer.getLatLngs()[0]) || !(l.endLoc === l.layer.getLatLngs()[1]))
            && !deletedOldLayers.includes(l.name)) {
            delete l["layer"];
            delete l["startLoc"];
            delete l["endLoc"];
            links.push(l);
        }
    });
}

function getMarkerNameByLatLng(latlng, featureGroup) {
    var name;
    featureGroup.eachLayer(m => {
        if (m instanceof L.Marker) {
            if (latlng === m.getLatLng()) {
                name = getLayerName(m);
                return;
            }
        }
    });
    return name;
}

// var backend_map = null;
// new QWebChannel(qt.webChannelTransport, function (channel) {
//     backend_map = channel.objects.backend_map;
// });


////// interactive tables codes

//dummy data
// Structure:
/* 

dummy = {<Cluster Id>: { <Demand Id> : {
                                        Source: <Source Name>,
                                        Destination: <Destination Name>,
                                        Services: {
                                            <Service Id>: <Type>
                                            ...
                                            ...
                                        }
                        ...
}}}

An Example with above Structure:
c_<int>: cluster id
d_<int>: demand id
s_<int>: service id

NOTE: id's in below json is not real ( it's just for showing structure )
*/
var dummyClustersData = {
    c_1: {
        Gateway: "gt1",
        SubNodeNameList: ["s1", "s2"],
        Demands: {
            d_1: {
                Source: "Tehran",
                Destination: "Qom",
                Services: {
                    s_1: "100GE",
                    s_2: "STM_64",
                    s_3: "FE"
                },
                ShortestPath: ["Tehran", "Yazd", "Esfahan", "Qom"]
            },
            d_2: {
                Source: "Demavend",
                Destination: "Shiraz",
                Services: {
                    s_4: "10GE"
                },
                ShortestPath: ["Demavend", "Tehran", "Shiraz"]
            },
            d_3: {
                Source: "Shiraz",
                Destination: "Kerman",
                Services: {
                    s_4: "100GE",
                    s_7: "100GE"
                },
                ShortestPath: ["Shiraz", "Kerman"]
            },
            d_4: {
                Source: "Kerman",
                Destination: "Shiraz",
                Services: {
                    s_4: "100GE",
                    s_7: "100GE",
                    s_66: "10GE",
                    s_44: "10GE",
                    s_41: "10GE",
                    s_42: "100GE"
                },
                ShortestPath: ["Kerman", "Esfahan", "Shiraz"]
            }
        }
    },
    c_2: {
        Gateway: "gt2",
        SubNodeNameList: ["s1", "s4"],
        Demands: {
            d_3: {
                Source: "Tehran",
                Destination: "Shiraz",
                Services: {
                    s_5: "10GE"
                },
                ShortestPath: ["Tehran", "Shiraz"]
            }
        }
    }
};


// btn is directly loaded in map
var tablesBtn = null;

function add_start_mid_grooming_button() {
    tablesBtn = document.createElement("button");
    tablesBtn.innerHTML = "Start Mid Grooming"
    tablesBtn.addEventListener("click", e => generateUIPanels(MidGrooming_Input))

    menu.onAdd = function (map) {

        return tablesBtn;
    };

    menu.addTo(MapVar);
}

var menu = L.control({ position: 'topright' });


var MidGrooming_Input = Object();

function start_MidGrooming(Input) {
    MidGrooming_Input = JSON.parse(Input);
    //console.log(MidGrooming_Input);
}

function close_mid_grooming() {
    clusterDiv.remove();
    btnDiv.remove();
    div.remove();
    closeBtnDiv.remove();
}

var nodeSelctMode = false;
var clusterDiv = null;
var btnDiv = null;
var closeBtnDiv = null;
var div = null;

function generateUIPanels(clustersData) {


    div = document.createElement("div");
    div.setAttribute("id", "cluster-panel");

    var tableWrapper = document.createElement("table");
    tableWrapper.setAttribute("class", "wrap d-flex flex-row");

    clusterDiv = document.createElement("div");

    btnDiv = document.createElement("div");
    btnDiv.setAttribute("class", "d-flex flex-column");

    closeBtnDiv = document.createElement("div");
    closeBtnDiv.setAttribute("class", "");

    var clusterTableWrapper = document.createElement('div');
    var demandTableWrapper = document.createElement('div');
    var serviceTableWrapper = document.createElement('div');

    clusterTableWrapper.setAttribute("class", "scroll-table ");
    demandTableWrapper.setAttribute("class", "scroll-table m-2");
    serviceTableWrapper.setAttribute("class", "scroll-table m-2");

    var clusterTable = document.createElement('table');
    var demandTable = document.createElement('table');
    var serviceTable = document.createElement('table');

    clusterTableWrapper.appendChild(clusterTable);
    demandTableWrapper.appendChild(demandTable);
    serviceTableWrapper.appendChild(serviceTable);

    tableWrapper.appendChild(demandTableWrapper);
    tableWrapper.appendChild(serviceTableWrapper);

    clusterTable.setAttribute("class", "table table-bordered table-dark");
    demandTable.setAttribute("class", "table table-bordered table-dark");
    serviceTable.setAttribute("class", "table table-bordered table-dark");

    var selectNodeBtn = document.createElement("button");
    selectNodeBtn.setAttribute("class", "btn btn-info btn-sm m-1")
    selectNodeBtn.innerHTML = "Select Node";
    selectNodeBtn.addEventListener("click", e =>
        handleSelectNodeBtn(getSelectedServices(serviceTable, MidGrooming_Input))
    );
    var selectNodeOffBtn = document.createElement("button");
    selectNodeOffBtn.setAttribute("class", "btn btn-info btn-sm m-1")
    selectNodeOffBtn.innerHTML = "Cancel Select Node";
    selectNodeOffBtn.addEventListener("click", e => {
        myFeatureGroup.off();
        myFeatureGroup.on("click", groupClick);
        nodeSelctMode = false;
    }
    );

    var closePanelsBtn = document.createElement("button");
    closePanelsBtn.setAttribute("class", "btn btn-info btn-sm m-1")
    closePanelsBtn.innerHTML = "X";
    closePanelsBtn.addEventListener("click", e => {
        clusterDiv.remove();
        btnDiv.remove();
        div.remove();
        closeBtnDiv.remove();
    }
    );

    var firstClusterID = Object.keys(MidGrooming_Input)[0];
    var firstDemandID = Object.keys(MidGrooming_Input[firstClusterID]["Demands"])[0];
    generateClustersTable(MidGrooming_Input, clusterTable, demandTable, serviceTable);
    generateDemandsTable(firstClusterID, MidGrooming_Input, demandTable, serviceTable);

    generateServicesTable(firstClusterID, firstDemandID, MidGrooming_Input, serviceTable);


    var menu = L.control({ position: 'bottomleft' });
    var clusterMenu = L.control({ position: 'topleft' });
    var btnMenu = L.control({ position: 'topright' });
    var closeBtnMenu = L.control({ position: 'topright' });

    clusterMenu.onAdd = function (map) {
        clusterDiv.appendChild(clusterTableWrapper);
        return clusterDiv;
    };

    menu.onAdd = function (map) {

        div.appendChild(tableWrapper);
        return div;
    };

    btnMenu.onAdd = function (map) {
        // btnDiv.appendChild(closePanelsBtn);
        btnDiv.appendChild(selectNodeBtn);
        btnDiv.appendChild(selectNodeOffBtn);

        return btnDiv;
    }
    closeBtnMenu.onAdd = function (map) {
        closeBtnDiv.appendChild(closePanelsBtn);
        return closeBtnDiv;
    }

    closeBtnMenu.addTo(MapVar);
    menu.addTo(MapVar);
    clusterMenu.addTo(MapVar);
    btnMenu.addTo(MapVar);

    //returns updated clusterData

}


function generateClustersTable(data, table, demandTable, serviceTable) {
    table.innerHTML = "";

    var tbdy = document.createElement('tbody');
    var tr = tbdy.insertRow();
    tr.setAttribute("class", "bg-info");
    var tdData = tr.insertCell();
    tdData.setAttribute("class", "p-1")
    tdData.innerHTML = "Clusters";

    Object.keys(data).forEach(key => {
        var tr = tbdy.insertRow();
        var tdData = tr.insertCell();
        tdData.setAttribute("class", "p-1")
        tdData.innerHTML = data[key].Gateway;
        tdData.title = "Subnodes: " + data[key].SubNodeNameList;
        tdData.setAttribute("data-clusterID", key);
    });

    table.appendChild(tbdy);

    for (var i = 0, row; row = table.rows[i]; i++) {
        row.addEventListener("click", (e) => {
            var clusterID = e.target.getAttribute("data-clusterID");
            var demandID = Object.keys(data[clusterID])[0];
            generateDemandsTable(clusterID, data, demandTable, serviceTable);
            generateServicesTable(
                clusterID,
                demandID,
                data, serviceTable);
        });
    }
}

function generateDemandsTable(clusterID, data, table, serviceTable) {
    demands = data[clusterID]["Demands"];
    table.innerHTML = "";

    var tbdy = document.createElement('tbody');
    var tr = tbdy.insertRow();
    tr.setAttribute("class", "bg-info");
    var tdData = tr.insertCell();
    tdData.setAttribute("class", "p-1")
    tdData.innerHTML = "Demands";

    var tr = tbdy.insertRow();
    tr.setAttribute("class", "bg-info");
    var tdData = tr.insertCell();
    tdData.setAttribute("class", "p-1");
    var tdCheck = tr.insertCell();
    tdCheck.innerHTML = "Destination";
    tdCheck.setAttribute("class", "p-1");
    tdData.innerHTML = "Source";

    Object.keys(demands).forEach(key => {
        var tr = tbdy.insertRow();
        var tdData = tr.insertCell();
        tdData.setAttribute("class", "p-1")
        tdData.innerHTML = demands[key].Source;
        tdData.setAttribute("data-clusterID", clusterID);
        tdData.setAttribute("data-demandID", key);
        var tdData = tr.insertCell();
        tdData.setAttribute("class", "p-1")
        tdData.innerHTML = demands[key].Destination;
        tdData.setAttribute("data-clusterID", clusterID);
        tdData.setAttribute("data-demandID", key);
    });

    table.appendChild(tbdy);

    for (var i = 0, row; row = table.rows[i]; i++) {
        row.addEventListener("click", (e) => {

            var clusterID = e.target.getAttribute("data-clusterID");
            var demandID = e.target.getAttribute("data-demandID");
            changeShortestPathColor(demands[demandID]["ShortestPath"]);
            generateServicesTable(
                clusterID,
                demandID,
                data, serviceTable);
        });
    }
}

function generateServicesTable(clusterID, demandID, data, table) {
    services = data[clusterID].Demands[demandID]["Services"];
    console.log(Object.keys(services));
    //console.log("c ", clusterID, "d", demandID);
    table.innerHTML = "";

    var tbdy = document.createElement('tbody');
    /*var tr = tbdy.insertRow();
    tr.setAttribute("class", "bg-info");
    var tdData = tr.insertCell();
    tdData.setAttribute("class", "p-1");
    var tdCheck = tr.insertCell();
    tdCheck.innerHTML = "Checked";
    tdCheck.setAttribute("class", "p-1");
    tdData.innerHTML = "Services";*/

    Object.keys(services).forEach(key => {
        var tr = tbdy.insertRow();
        // tr.innerHTML = ;
        tdData = tr.insertCell();
        tdCheck = tr.insertCell();
        tdData.innerHTML = services[key];
        tdData.setAttribute("class", "p-1")
        tdCheck.innerHTML = '<input type="checkbox" class="service-checkbox">';
        tdCheck.setAttribute("class", "p-1");
        tr.setAttribute("data-clusterID", clusterID);
        tr.setAttribute("data-demandID", demandID);
        tr.setAttribute("data-serviceID", key);
    });

    table.appendChild(tbdy);
}

function getSelectedServices(serviceTable, data) {
    var checkedServices = new Object();
    var ServiceList = [];
    var last_checked = null;
    serviceChecks = serviceTable.getElementsByClassName("service-checkbox");

    // BUG: if first row ( i = 0 ) is checked then it's serviceId gets null
    for (var i = 0; i < serviceChecks.length; i++) {
        if (serviceChecks[i].checked == true) {
            last_checked = i;
            ServiceList.push(serviceTable.rows[i].getAttribute("data-serviceID"))
            console.log(serviceTable.rows[i].getAttribute("data-serviceID"));
        }
    }
    checkedServices["DemandId"] = serviceTable.rows[last_checked].getAttribute("data-demandID")
    checkedServices["ClusterId"] = serviceTable.rows[last_checked].getAttribute("data-clusterID")
    checkedServices["ServiceIdList"] = ServiceList;

    return checkedServices;
}


// handling function for SelectNode button 
function handleSelectNodeBtn(checkedServices) {

    myFeatureGroup.off();
    nodeSelctMode = true;

    myFeatureGroup.on("click", e => handleSelectedNode(e, checkedServices))
}

function changeShortestPathColor(shortestPath) {
    var links = [];
    //links.push(shortestPath[0] + "-" + shortestPath[1]);
    for (var i = 1; i < shortestPath.length; i++) {
        links.push(shortestPath[i - 1] + "-" + shortestPath[i]);
        links.push(shortestPath[i] + "-" + shortestPath[i - 1])
    }
    //console.log(links);
    links_groupfeature.eachLayer(layer => {
        /*for (var i = 0; i < links.length; i++) {
            if (get_name(layer) === links[i]) {
                //console.log("ff");
                layer.setStyle({ color: "#669900" });
            }
        }*/
        if (links.includes(get_name(layer))) {
            layer.setStyle({ color: "#669900", weight: 4 });
        } else {
            layer.setStyle({ color: "black", weight: 3 });
        }
    })

}


// TODO
// params:
// e is the selected node
// checked services is a json array of checked services
var ClusterId = null;

function handleSelectedNode(e, checkedServices) {

    var NodeName = get_name(e.layer);
    checkedServices["NodeName"] = NodeName;
    ClusterId = checkedServices["ClusterId"];
    console.log('putting cluster id', ClusterId);

    backend_map.start_mid_grooming_process(JSON.stringify(checkedServices))
}

function refresh_mid_grooming_process(payload) {
    console.log('getting ClusterId', ClusterId)
    var payload = JSON.parse(payload);
    var d_demands = payload["deleted_demands"];
    payload = payload["Demands"];
    for (let [DemandId, value] of Object.entries(payload)) {
        console.log(DemandId);
        MidGrooming_Input[ClusterId]["Demands"][DemandId] = value;
    }
    for (i = 0; i < d_demands.length; i++) {
        var demand = d_demands[i];
        delete MidGrooming_Input[ClusterId]["Demands"][demand];
    }
    close_mid_grooming();
    generateUIPanels(MidGrooming_Input);
}


