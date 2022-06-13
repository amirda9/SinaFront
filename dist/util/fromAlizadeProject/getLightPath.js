// import './../../services/callServices/callServices'
const serverAddr1 = "http://185.211.88.140:80/api/v2.0.0/";


// function get_RWA_Path() {
//     var data = "";

//     var xhr = new XMLHttpRequest();
//     xhr.withCredentials = true;

//     xhr.addEventListener("readystatechange", function () {
//         if (this.readyState === 4) {
//             console.log(this.responseText);
//         }
//     });

//     xhr.open("GET", "http://192.168.7.22/api/v2.0.0/algorithms/rwa/result?rwa_id=0d3467ef761c45c5b2cde57bf50fecb7");

//     xhr.send(data);

// }


async function get_RWA_Path() {

    // let lightPath=[];

    // let token = await getTokn("amir", "1234");
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `${userData.token_type} ${userData.access_token}`);
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    rwa_id = JSON.parse(localStorage.getItem("rwa_id"));
    console.log('rwa_id is : ', rwa_id);
    let result = await callService(`http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result?rwa_id=${rwa_id}`, requestOptions);
    let data_path = result.lightpaths['5f8f6401ba0440e9ac6b3163916772a6'].routing_info.working.path;

    let physical_topologies = JSON.parse(localStorage.getItem('physical_topologies'));
    console.log("path:", physical_topologies);
    console.log("path:", data_path);

     let mapping_data_paths = mapping_data_path(data_path, physical_topologies);
}


function mapping_data_path(data_path, physical_topologies) {
    let nodes = [];
    let links = [];
    let linkSource =[];
    let linkDestination=[];
    let nodesLat=[];
    let nodesLang=[];
    let ArrayData=[];                                                               

    let obj = {};

    for (let i = 0; i < physical_topologies.nodes.length; i++) {
        if (data_path.includes(physical_topologies.nodes[i].name)) {
            nodes.push(physical_topologies.nodes[i]);
            nodesLat.push(physical_topologies.nodes[i].lat);
            nodesLang.push(physical_topologies.nodes[i].lng);
        }
    }

    for (let j = 0; j < physical_topologies.links.length; j++) {
        if (data_path.includes(physical_topologies.links[j].source)) {
            links.push(physical_topologies.links[j]);
            linkSource.push(physical_topologies.links[j].source);
           linkDestination.push(physical_topologies.links[j].destination);
        }
        
    }

  
    obj["nodes"] =nodes;
    obj["links"] = links;

    console.log("nodesLat",nodesLat);
    console.log("nodesLang",nodesLang);
    console.log("linkSource",linkSource);
    console.log("linkDestination",linkDestination);
    console.log("obj",obj);

    return obj;
}


