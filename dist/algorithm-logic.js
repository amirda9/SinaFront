function groomingAutomationStart(projectId, data) {
  let bodyData = Object.fromEntries(data);
  bodyData.mp1h_threshold = Number(bodyData.mp1h_threshold);
  const request = {
    url:
      serverAddr +
      "algorithms/grooming/start/automatic?project_id=" +
      projectId,
    method: "POST",
    body: JSON.stringify(bodyData),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `${userData.token_type} ${userData.access_token}`,
    },
  };

  (async () => {
    try {
      await SwaggerClient.http(request).then(async (response) => {
        console.log("res", response);
        if (response.status === 200) {
          toastr.success("grooming started successfully");
          // localStorage.setItem("ptData", response.data);
          // localStorage.setItem("ptId", ptId);
        }
      });
    } catch (error) {
      console.log("error", error);
      if (error.statusCode === 409) toastr.error(error.response.body.detail);
      // alert("name is duplicate, please choose another name")
      if (error.statusCode === 400) toastr.error(error.response.body.detail);
      if (error.statusCode === 422) toastr.error(error.response.data);
      if (error.statusCode === 401) {
        await refreshToken();
        await groomingAutomationStart(projectId, data);
      }
      // alert(error.response.body.detail)
      // console.log(error.response);
    } finally {
      // clearTimeout(timeout);
    }
  })();
}

// $("form#grooming-form").submit(async function (e) {
//     e.preventDefault();
//     if (Offline.state == "up") {
//         let project = await getAllRecords("project")
//         if (project == undefined) {
//             toastr.error("you must load a project or create a new project");
//             return
//         }
//         if (project[0].id != 0) {
//             var formData = new FormData(this);
//             groomingAutomationStart(project[0].id, formData);
//         } else {
//             toastr.error("you must save project to server before start");
//         }
//         // formData.append('PT_binary', document.getElementById('myFile').files[0]);
//     } else {
//         toastr.error("you are currently offline, you can't start grooming algorithms")
//     }
//     $('#grooming-modal').modal('hide');
// })

async function getAllGrooming() {
  let item;
  $(".modal-title").html("Grooming List");
  let gate = document.getElementById("ShowGateways");
  let sub = document.getElementById("ShowSubnodes");
  gate.innerHTML = "";
  sub.innerHTML = "";

  let project = await getAllRecords("project");
  if (project == undefined || project[0].id == 0) {
    toastr.error(
      "you must save to server/load project before load grooming list"
    );
    return;
  }
  let loadQuery = {
    project_id: {
      value: project[0].id,
    },
  };
  console.log(`${userData.token_type} ${userData.access_token}`);
  const request = {
    url: "http://185.211.88.140:80/api/v2.0.1/algorithms/grooming/all",
    method: "GET",
    query: loadQuery,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `${userData.token_type} ${userData.access_token}`,
    },
  };
  try {
    await SwaggerClient.http(request).then(async (response) => {
      if (response.status === 200) {
        let groomingIds = response.body.map((a) => a.id);

        $("#grooming-list-table>tbody").html("");
        $("#msg").html("");

        // let gate = document.getElementById('ShowGateways');
        // let sub = document.getElementById('ShowSubnodes');
        // gate.remove();
        // sub.remove();

        if (groomingIds.length == 0) {
          $("#msg").html("There is not any grooming for this project");
          $("#grooming-list-modal").modal({
            backdrop: "static",
            keyboard: false,
          });
          $("#grooming-list-modal").unbind("click");
          $("#grooming-list-modal").modal("show");
          return;
        } else {
          $("#msg").css("visibility", "hidden");
          let groomingState = await getAllGroomingState(groomingIds);
          console.log("response.body", response.body);
          for (let i = 0; i < response.body.length; i++) {
            let data = response.body[i];
            let Statisctical = await getStatisticalResult(data.id);

            let clusterName;
            let Cluster_gateways;
            let Cluster_subnodes;
            CluserID = data.form.clusters_id;
            console.log("CluserIDD:", CluserID);
            let options;

            $("#grooming-list-table>tbody").append(
              "<tr>" +
              '<td>   <input  type="radio" name="radioSelected" value="' +
              data.id +
              '" onclick="GroomingSelected(\'' +
              data.id +
              "')\"> </td>\n" +
              "                        <td>" +
              data.pt_version +
              "</td>\n" +
              "                        <td>" +
              data.tm_version +
              "</td>\n" +
              "                        <td>" +
              data.start_date +
              "</td>\n" +
              "                        <td>" +
              data.end_date +
              "</td>\n" +
              "                        <td>" +
              data.with_clustering +
              "</td>\n" +
              // "                        <td>" + groomingStateData.state + "</td>\n" +
              '<td><select onchange="showData(this);" id="' +
              data.id +
              '" class="form-select" aria-label="Default select example"><option selected>Select cluster</option> </select></td>' +
              "                        <td>" +
              data.form.mp1h_threshold +
              "</td>\n" +
              "                        <td>" +
              data.form.comment +
              "</td>\n" +
              "                        <td>" +
              data.algorithm +
              "</td>\n" +
              "                        <td>\n" +
              '                            <button type="button" class="btn btn-success" title="View Grooming" onclick="viewGrooming(this, \'' +
              data.id +
              '\')" ><i class="far fa-eye"></i></button>\n' +
              '                            <button type="button" class="btn btn-info Statistical" title="Statistical Result" data-toggle="popover" data-placement="right" data-content="[groomout_no: ' +
              Statisctical[0] +
              " | [lightpath_no: " +
              Statisctical[1] +
              "]  |  [mean_lightpath_cap: " +
              Statisctical[2] +
              "]  |  [mp1h_no: " +
              Statisctical[3] +
              "]  |  [mp2x_no: " +
              Statisctical[4] +
              "]  |  [tp1h_no: " +
              Statisctical[5] +
              ']"><i class="fas fa-poll"></i></button>\n' +
              '                            <button id="view' +
              data.id +
              '" type="button" class="btn btn-primary" title="Grooming Table"  onclick="viewgroomingTable(\'' +
              data.id +
              '\')"><i class="fas fa-border-all"></i></button>\n' +
              "                        </td>" +
              "</tr>"
            );

            for (j = 0; j < CluserID.length; j++) {
              if (CluserID.length > 0) {
                item = CluserID[j];

                let Clusters_info = getClusterInfo(item);
                await Clusters_info.then((result) => {
                  clusterName = result.name;
                  Cluster_gateways = result.data.gateways;
                  Cluster_subnodes = result.data.subnodes;
                });
                // options = `<option  id="${item}" value="Gateways: ${Cluster_gateways} | Subnodes: ${Cluster_subnodes}">
                //         ${clusterName}
                //  </option>` + options

                options =
                  "<option value=" +
                  item +
                  "  id=" +
                  item +
                  " class=" +
                  clusterName +
                  " >" +
                  clusterName +
                  "</option>";
                $(`select#${data.id}`).append(options);
              }
            }
          }

          $('[data-toggle="popover"]').popover();
          $("#grooming-list-modal").modal("show");

          getGroomingId = localStorage.getItem("grooming_id");
          if (getGroomingId) {
            $(`input[value=${getGroomingId}]`).attr("checked", "checked");
          }

          $("#ExportTable").on("change", function () {
            var AlgorithmType = $("#ExportTable").find("option:selected").val();
            SearchDataOnTable(AlgorithmType);
          });
        }
      }
    });
  } catch (error) {
    if (error.statusCode === 409) toastr.error(error.response.body.detail);
    // alert("name is duplicate, please choose another name")
    if (error.statusCode === 400) toastr.error(error.response.body.detail);
    if (error.statusCode === 422) toastr.error(error.response.data);
    if (error.statusCode === 401) {
      await refreshToken();
      await getAllGrooming(projectId);
    }
    // alert(error.response.body.detail)
    // console.log(error.response);
  } finally {
  }
}

function showData(item) {
  let id = item.value;
  let info = getClusterInfo(id);
  await = info.then((result) => {
    clusterName = result.name;
    document.querySelector(".ClustersInfo").style.visibility = "visible";
    let gate = document.getElementById("ShowGateways");
    let sub = document.getElementById("ShowSubnodes");
    gate.innerHTML = result.data.gateways;
    sub.innerHTML = result.data.subnodes;
  });
}

function GroomingSelected(id) {
  localStorage.setItem("grooming_id", id);
}

// Get All Clustering List
async function getAllClustring() {
  let project_id = "";
  let result = [];
  let gateways = [];
  let subnode = [];

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  if (localStorage.getItem("project_id")) {
    project_id = JSON.parse(localStorage.getItem("project_id"));
  } else {
    alert("لطفا از قسمت پروژه ها ، پروژه مورد نظر را لود کنید");
    return;
  }

  result = await callService(
    `http://185.211.88.140:80/api/v2.0.0/clustering/manual/read_all?project_id=${project_id}`,
    requestOptions
  );
  $("#clustring-list-table>tbody").html("");
  console.log("resulttt", result);
  for (let i = 0; i < result.length; i++) {
    gateways.push(result[i].data.gateways);
    subnode.push(result[i].data.subnodes);

    let res = JSON.stringify(result[i]);

    $("#clustring-list-table>tbody").append(
      "<tr id=" +
      result[i].id +
      ">" +
      "                        <th>" +
      result[i].name +
      "</th>\n" +
      "                        <td>" +
      result[i].data.gateways +
      "</td>\n" +
      "                        <td>" +
      result[i].data.subnodes +
      "</td>\n" +
      "                        <td>" +
      result[i].data.color +
      "</td>\n" +
      "                        <td>\n" +
      '                            <button type="button" class="btn btn-danger" onclick=\'deleteClustring(' +
      res +
      ')\'><i class="far fa-trash-alt"></i></button>\n' +
      // "                            <button type=\"button\" class=\"btn btn-primary\" onclick=\'ShowClustrsOnMap(" + res + ")\'><i class=\"far fa-eye\"></i></button>\n" +
      // "                            <button type=\"button\" class=\"btn btn-danger\" onclick=\"removeGrooming(this, '"+data.id+"',"+data.version+","+i+")\"><i class=\"far fa-trash-alt\"></i></button>\n" +
      "                        </td>" +
      "</tr>"
    );
  }

  $("#clustring-list-modal").modal("show");
}

function close_modal(name) {
  $(`#${name}`).modal("hide");
}

async function getAllRWA(grooming_id) {
  $(".modal-title").html("View Result");
  let project = await getAllRecords("project");
  if (project == undefined || project[0].id == 0) {
    toastr.error(
      "you must save to server/load project before load grooming list"
    );
    return;
  }

  if (localStorage.getItem("grooming_id")) {
    grooming_id = localStorage.getItem("grooming_id");
  } else {
    alert("لطفا از قسمت grooming list یک Grooming انتخاب کنید...");
    return;
  }
  let loadQuery = {
    project_id: {
      value: project[0].id,
    },
    // grooming_id: {
    //     value: grooming_id
    // }
  };
  const request = {
    url: serverAddr + "algorithms/rwa/all",
    method: "GET",
    query: loadQuery,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `${userData.token_type} ${userData.access_token}`,
    },
  };
  try {
    await SwaggerClient.http(request).then(async (response) => {
      if (response.status === 200) {
        console.log("responce is : ", response.body);

        let groomingIds = response.body.map((a) => a.id);
        $("#rwa-list-table>tbody").html("");
        $("#project-rwa-list>span").html("");
        if (groomingIds.length == 0) {
          $("<span>There is not any RWA for this project</span>").insertAfter(
            $("#rwa-list-table")
          );
          $("#rwa-list-modal").modal({
            backdrop: "static",
            keyboard: false,
          });
          $("#rwa-list-modal").unbind("click");
          $("#rwa-list-modal").modal("show");
          return;
        }
        let groomingState = await getAllGroomingState(groomingIds);
        let i = 1;
        let RWA_Id;
        for (let data of response.body) {
          localStorage.setItem("rwa_id", JSON.stringify(data.id));
          let groomingStateData = groomingState.find((x) => x.id === data.id);
          console.log("DATA::", data);
          console.log(
            "groomingStateData is : ",
            groomingStateData,
            data,
            data.pt_version,
            data.tm_version,
            data.start_date,
            data.end_date
          );
          console.log("with_clustering is : ", data.with_clustering);
          console.log("state is : ", groomingStateData.state);
          console.log("status is : ", groomingStateData.status);
          console.log("current is : ", groomingStateData.current);
          console.log("total is : ", groomingStateData.total);
          console.log("comment is : ", data.form.comment);
          console.log("algorithm is : ", data.form.algorithm);
          console.log("rwa_id is : ", data.id);
          RWA_Id = data.id;
          let source = await getRWA_general_info(RWA_Id);

          // groomingState.find()
          $("#rwa-list-table>tbody").append(
            "<tr>" +
            "<td>" +
            i +
            "</td>\n" +
            "                        <td>" +
            data.pt_version +
            "</td>\n" +
            "                        <td>" +
            data.tm_version +
            "</td>\n" +
            "                        <td>" +
            data.start_date +
            "</td>\n" +
            "                        <td>" +
            data.end_date +
            "</td>\n" +
            "                        <td>" +
            data.form.algorithm +
            "</td>\n" +
            // "                        <td>" + data.with_clustering + "</td>\n" +
            "                        <td>" +
            groomingStateData.state +
            "</td>\n" +
            "                        <td>" +
            groomingStateData.current +
            "</td>\n" +
            "                        <td>" +
            groomingStateData.total +
            "</td>\n" +
            "                        <td>" +
            data.form.comment +
            "</td>\n" +
            "                        <td>\n" +
            '                            <button type="button" class="btn btn-success" title="viewGrooming" onclick="viewGrooming(this, \'' +
            data.grooming_id +
            '\')"><i class="far fa-eye"></i></button> \n' +
            '                            <button type="button" class="btn btn-info" title="Show lightPath"  id="show-light-path" onclick="getLightPathList(\'' +
            data.id +
            '\')"><i class="fa fa-list"></i></button>\n' +
            '                            <button type="button" class="btn btn-secondary " title="RWA General Info" data-toggle="popover" data-placement="left" data-content="Protection: [average_lambda_capacity_usage: ' +
            source[0] +
            " | [total_lambda_link: " +
            source[1] +
            "]  Working:  [average_lambda_capacity_usage: " +
            source[2] +
            "]  |  [total_lambda_link: " +
            source[3] +
            ']"><i class="fas fa-poll"></i></button>\n' +


            '                            <button type="button" class="btn btn-warning" title="Lom_excel" id="downloadlink" onClick=" Call_Lom_excel(\'' +
            RWA_Id +
            '\')"><i class="fa fa-download"></i></button> \n' +

                '                            <button type="button" class="btn btn-warning" title="Bpm_excel" id="downloadlink" onClick=" Call_Bpm_excel(\'' +
            RWA_Id +
            '\')"><i class="fa fa-download"></i></button> \n' +

            '                            <button type="button" class="btn btn-info" title="rwa_excel" id="downloadlink" onClick=" Call_rwa_excel(\'' +
            RWA_Id +
            '\')"><i class="fa fa-download"></i></button> \n' +

            "                        </td>" +

            "</tr>"
          );
          i++;
        }
        $('[data-toggle="popover"]').popover();
      }
    });
  } catch (error) {
    if (error.statusCode === 409) toastr.error(error.response.body.detail);
    // alert("name is duplicate, please choose another name")
    if (error.statusCode === 400) toastr.error(error.response.body.detail);
    if (error.statusCode === 422) toastr.error(error.response.data);
    if (error.statusCode === 401) {
      await refreshToken();
      await getAllGrooming(projectId);
    }
    // alert(error.response.body.detail)
    // console.log(error.response);
  } finally {
    // clearTimeout(timeout);
  }
}

async function getAllGroomingState(groomingIds) {
  let data = {
    grooming_id_list: groomingIds,
  };

  const request = {
    url: serverAddr + "algorithms/grooming/check",
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `${userData.token_type} ${userData.access_token}`,
    },
  };

  return new Promise(async function (resolve, reject) {
    SwaggerClient.http(request)
      .then((response) => {
        if (response.status === 200) {
          // toastr.success("grooming start successfully")
          resolve(response.body);
          // return response.body;
          // localStorage.setItem("ptData", response.data);
          // localStorage.setItem("ptId", ptId);
        }
      })
      .catch(function (error) {
        if (error.statusCode === 409) {
          // toastr.error(error.response.body.detail)
          reject(null);
        }
        if (error.statusCode === 400) {
          // toastr.error(error.response.body.detail)
          reject(null);
        }
      });
  });
}

async function getRWA_general_info(rwa_id) {
  let protection_average_lambda;
  let protection_total_lambda;

  let working_average_lambda;
  let working_total_lambda;
  let infoData = [];

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  result = await callService(
    `http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result?rwa_id=${rwa_id}`,
    requestOptions
  );
  // .then(response => response.text())
  // .then(result => console.log(result))
  // .catch(error => console.log('error', error));
  let info = result.result.general_info;
  if (info.protection) {
    protection_average_lambda =
      info.protection.average_lambda_capacity_usage.toFixed(5);
    protection_total_lambda = info.protection.total_lambda_link;
    infoData.push(protection_average_lambda);
    infoData.push(protection_total_lambda);
  } else {
    infoData.push("null");
    infoData.push("null");
  }

  if (info.working) {
    working_average_lambda =
      info.working.average_lambda_capacity_usage.toFixed(5);
    working_total_lambda = info.working.total_lambda_link;
    infoData.push(working_average_lambda);
    infoData.push(working_total_lambda);
  } else {
    infoData.push("null");
    infoData.push("null");
  }

  return infoData;
}

//function For get LightPathList :: RWA Settings/View Result when clicked on any lightPath sow protection and working path on map
async function getLightPathList(RWA_Id) {
  close_modal("rwa-list-modal");
  //btn show-light-path: if onClick Show lighpath_table
  let btn = document.getElementById("show-light-path");

  if (btn.onclick) {
    document.querySelector(".lighpath_table").style.visibility = "visible";
    $(".modal-title").html("LightPath List");
  } else {
    document.querySelector(".lighpath_table").style.visibility = "hidden";
  }

  $(".lighpath_table #modal_lighpath_table #rwa-lightpath-list ").html("");
  $(".lighpath_table .modal-header").html("");

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  let lightPaths;
  let data_result = callService(
    `http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result?rwa_id=${RWA_Id}`,
    requestOptions
  );

  console.log("data", data_result);
  data_result.then((value) => {
    lightPaths = value.result.lightpaths;
    // let lightPaths = data_result.result.lightpaths.id;
    // console.log("lightPaths:lightPaths:", lightPaths);

    $(".lighpath_table .modal-header").append(
      '<h5 class="modal-title">LightPath List</h5><button type="button" class="btn btnClose">&times;</button>'
    );

    let Prev_LightPath;
    let Source_prev;
    let destination_prev;

    for (var lightPathId in lightPaths) {
      let lightPath = lightPaths[lightPathId];
      let routing_info = lightPath.routing_info;
      // console.log("data", data);
      let source = lightPath.source;
      let destination = lightPath.destination;

      let capacity = lightPath.capacity.toFixed(5);
      let protection_type = lightPath.protection_type;

      // let working_path = routing_info.working.path;
      let working_snr = parseFloat(routing_info.working.snr).toFixed(5);
      let working_regenerators = routing_info.working.regenerators;
      let working_wavelength = routing_info.working.wavelength;
      let working_lambda_link = routing_info.working.lambda_link;

      if (routing_info.protection !== null) {
        protection_snr = parseFloat(routing_info.protection.snr).toFixed(5);
        protection_regenerators = routing_info.protection.regenerators;
        protection_wavelength = routing_info.protection.wavelength;
        protection_lambda_link = routing_info.protection.lambda_link;
      } else {
        protection_snr = "Undefined";
        protection_regenerators = "Undefined";
        protection_wavelength = "Undefined";
        protection_lambda_link = "Undefined";
      }

      $(".lighpath_table #modal_lighpath_table #rwa-lightpath-list").append(
        "<div class='card' id=" +
        lightPathId +
        ">" +
        "<div class='card-header selected' id=ss" +
        lightPathId +
        ">" +
        " <h2 class='mb-0'>" +
        " <button class='btn btn-link btn-block text-left' type='button' data-toggle='collapse' data-target='#collapse" +
        lightPathId +
        "' aria-expanded='true' aria-controls='collapse" +
        lightPathId +
        "'>" +
        "source: " +
        source +
        " | " +
        "destination: " +
        destination +
        " | " +
        "capacity: " +
        capacity +
        " | " +
        "protectionType: " +
        protection_type +
        "</button>" +
        "</h2>" +
        "</div>" +
        "<div id='collapse" +
        lightPathId +
        "' class='collapse' aria-labelledby=" +
        lightPathId +
        " data-parent='#rwa-lightpath-list'>" +
        "<div class='card-body'>" +
        "<table class='table'>" +
        "<thead>" +
        "<tr>" +
        "<th>" +
        "#" +
        "</th>" +
        "<th>" +
        "Snr" +
        "</th>" +
        "<th>" +
        "Wavelength" +
        "</th>" +
        "<th>" +
        "Regenerators" +
        "</th>" +
        "<th>" +
        "Lambda_Link" +
        "</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>" +
        "<tr>" +
        "<th>" +
        "Protection" +
        "</th>" +
        "<td>" +
        protection_snr +
        "</td>" +
        "<td>" +
        protection_wavelength +
        "</td>" +
        "<td>" +
        protection_regenerators +
        "</td>" +
        "<td>" +
        protection_lambda_link +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th>" +
        "Working" +
        "</th>" +
        "<td>" +
        working_snr +
        "</td>" +
        "<td>" +
        working_wavelength +
        "</td>" +
        "<td>" +
        working_regenerators +
        "</td>" +
        "<td>" +
        working_lambda_link +
        "</td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "</div>" +
        "</div>" +
        " </div>"
      );

      //When Click on lightPathId : Set color on protection and working path.
      $(`#${lightPathId}`).click(function () {
        let Id = this.id;

        Prev_LightPath = JSON.parse(localStorage.getItem("Last_LightPath"));
        localStorage.setItem("Last_LightPath", JSON.stringify(lightPath));

        Source_prev = Prev_LightPath.source;
        destination_prev = Prev_LightPath.destination;
        // console.log(Prev_LightPath)

        show_source_dest(source, destination, Source_prev, destination_prev);

        if (Prev_LightPath.routing_info.protection) {
          changePathColor(Prev_LightPath.routing_info.protection.path, "black");
        }

        changePathColor(Prev_LightPath.routing_info.working.path, "black");

        if (lightPath.routing_info.protection) {
          changePathColor(lightPath.routing_info.protection.path, "red");
        }

        changePathColor(lightPath.routing_info.working.path, "blue");
      });
    }
    //When Click on Close Btn : clear color of protection and working path.
    $(".btnClose").click(function () {
      document.querySelector(".lighpath_table").style.visibility = "hidden";
      Prev_LightPath = JSON.parse(localStorage.getItem("Last_LightPath"));

      // console.log(Prev_LightPath)

      if (Prev_LightPath != null) {
        ArrayOfNodesName = [];
        ArrayOfNodesName.push(Prev_LightPath.source);
        ArrayOfNodesName.push(Prev_LightPath.destination);
        changeClusterColorToDefault(ArrayOfNodesName);

        if (Prev_LightPath.routing_info.protection) {
          changePathColor(Prev_LightPath.routing_info.protection.path, "black");
        }
        changePathColor(Prev_LightPath.routing_info.working.path, "black");
      }
    });
  });
}

function changePathColor(path, color) {
  console.log("path", path);
  let src, dst, srcCor, dstCor;
  for (i = 0; i < path.length - 1; i++) {
    src = path[i];
    dst = path[i + 1];
    srcCor = getLatLng(src);
    dstCor = getLatLng(dst);
    delete_link(src, dst);
    addLinkWithColor(srcCor, dstCor, src, dst, color);
  }
}

async function viewGrooming(element, groomingId) {
  let project = await getAllRecords("project");
  console.log("project is : ", project, groomingId);
  localStorage.setItem("grooming_id", groomingId);
  // window.open("http://192.168.7.22:5000/" + project[0].name + "&1&" + groomingId, '_blank').focus();
  window
    .open(
      "http://" +
      window.location.hostname +
      ":5000/" +
      project[0].name +
      "&1&" +
      groomingId,
      "_blank"
    )
    .focus();
}

//Call Function delete Clustring uses in Clustring options/Clustring list
async function deleteClustring(Clusters) {
  console.log("X1:Clusters", Clusters);
  let ClusterId = Clusters.id;

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );
  var formdata = new FormData();

  formdata.append("cluster_id", ClusterId);

  var requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  swal({
    text: "Are you sure?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      //Call remove from RestApi
      fetch(
        `http://185.211.88.140:80/api/v2.0.0/clustering/?cluster_id=${ClusterId}`,
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.log("error", error));
      document.getElementById(ClusterId).remove();
      let ArrayOfClusterNodesName = [];
      ArrayOfClusterNodesName.push(...Clusters["data"]["gateways"]);
      ArrayOfClusterNodesName.push(...Clusters["data"]["subnodes"]);
      console.log("Array::", ArrayOfClusterNodesName);
      changeClusterColorToDefault(ArrayOfClusterNodesName);

      //Call remove from RestApi
      var db;
      var request = indexedDB.open("sinaDb");
      request.onerror = function (event) {
        console.log("Why didn't you allow my web app to use IndexedDB?!");
      };
      request.onsuccess = function (event) {
        db = event.target.result;
        console.log("cluster", db);

        var transaction = db.transaction(["cluster"], "readwrite");
        console.log("transaction", transaction);
        var objectStore = transaction.objectStore("cluster");
        let updateObject = {};
        console.log("objectStore", objectStore);
        var request = objectStore.get("kerman");
        request.onerror = function (event) {
          // Handle errors!
        };

        request.onsuccess = function (event) {
          // Do something with the request.result!
          console.log("event", event.target.result);

          updateObject = event.target.result.clusters.filter(
            (row) => row.id != ClusterId
          );
          event.target.result.clusters = updateObject;
          console.log("updateObjectss", event.target.result, updateObject);
          objectStore.put(event.target.result);
          console.log("updateObject", objectStore);
        };
      };

      // var request = db.transaction(["cluster"], "readwrite")
      //     .objectStore("clusters")
      //     .delete("kkk");
      //     request.onsuccess = function(event) {
      //         alert("Deleted")
      //     };
    }
  });
}

//get Node name and Return LatLng
function getLatLng(nodeName) {
  let physical_topologies = JSON.parse(
    localStorage.getItem("physical_topologies")
  );
  let selectedRow = physical_topologies.nodes.filter(
    (row) => row.name == nodeName
  );
  let latSelectedRow = selectedRow[0].lat;
  let lngSelectedRow = selectedRow[0].lng;
  return [latSelectedRow, lngSelectedRow];
}

//get location and show link between two nodes (in clustering)
// I need this funtion for show RWA/lightpath/protectin
function showClusterslink(location1, location2, node1, node2) {
  delete_link(node1, node2);
  add_link2(location1, location2, node1, node2);
}

//get location and show link between two nodes (in clustering)
// I need this funtion for show RWA/lightpath/Working
function showClusterslink_Working(location1, location2, node1, node2) {
  delete_link(node1, node2);
  add_link3(location1, location2, node1, node2);
}

function DeleteClusterslink(node1, node2) {
  delete_link(node1, node2);
}

//Call Function Show ClustrsOnMap uses in Clustring options/Clustring list
async function ShowClustrsOnMap(Clusters) {
  let gateWays = Clusters.data.gateways;
  let subnodes = Clusters.data.subnodes;

  let gateWay = gateWays[0];
  let subnode = subnodes;

  let location1 = [];
  let location2 = [];
  let prev = getLatLng(gateWay);

  for (let i = 0; i < subnodes.length; i++) {
    location1 = prev;
    location2 = getLatLng(subnode[i]);
    showClusterslink(location1, location2, gateWay[i], subnode[i]);
    prev = location2;
  }
}

function mp1hbooleanToggle() {
  document.getElementById("MP1HTresh").disabled = !document.getElementById("MP1HTresh").disabled;
  document.getElementById("MP1HTresh").value = ''
}
//function for select type of algorithm for show LineRate & checked of ClusterLists in Grooming Settings/Automatic
function SelectAlgorithm() {
  // If the radio:Advanced is checked, display the LineRate & checked of ClusterLists
  if (document.getElementById("end_To_end").checked == true) {
    // document.getElementById("grooming-lineRate-threshold").disabled = true;
    // $("input[name='chkClusters']").attr("disabled", true);
    document.getElementById("MP1H_bool").disabled = false;
    document.getElementById("MP1HTresh").disabled = false;
    document.getElementById("MPBDTresh").disabled = false;
    // document.getElementById("MultiTresh").disabled = true;
    // $(':input[type="submit"]').prop("disabled", false);
  } else if (document.getElementById("Advanced").checked == true) {
    document.getElementById("MP1H_bool").disabled = true;
    document.getElementById("MP1HTresh").disabled = true;
    document.getElementById("MPBDTresh").disabled = true;
    // document.getElementById("MultiTresh").disabled = false;
    // document.getElementById("grooming-lineRate-threshold").disabled = false;
    // $("input[name='chkClusters']").attr("disabled", false);
    $(':input[type="submit"]').prop("disabled", false);
  }
}

//function for show ClusterList in Grooming Settings/Automatic
async function showClusterList() {
  let project_id = "";
  let result = [];
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  if (localStorage.getItem("project_id")) {
    project_id = JSON.parse(localStorage.getItem("project_id"));
  } else {
    alert("لطفا از قسمت پروژه ها ، پروژه مورد نظر را لود کنید");
    return;
  }

  result = await callService(
    `http://185.211.88.140:80/api/v2.0.0/clustering/manual/read_all?project_id=${project_id}`,
    requestOptions
  );

  $("#collapseClusterList>#panel-body").html("");

  if (result != null) {
    for (let i = 0; i < result.length; i = i + 1) {
      $("#collapseClusterList>#panel-body").append(
        "<div class='form-check'>" +
        "<label class='form-check-label'>" +
        "<input type='checkbox' id='clusterId' class='form-check-input' name='chkClusters' value=" +
        result[i].id +
        ">" +
        "Name: " +
        result[i].name +
        " | " +
        "Gateways: " +
        result[i].data.gateways +
        " | " +
        "Subnodes: " +
        result[i].data.subnodes +
        " </label>" +
        " </div>"
      );
    }
  }
  //remove border-bottom lastChild of ClusterList
  $("#panel-body .form-check:last-child").css({ border: "none" });
}

async function startEnd2EndGrooming() {
  // console.log("dsakfjgh;lksdfhg;fdhsl");
  let project_id = "";
  let result = [];
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  if (localStorage.getItem("project_id")) {
    project_id = JSON.parse(localStorage.getItem("project_id"));
  } else {
    alert("لطفا از قسمت پروژه ها ، پروژه مورد نظر را لود کنید");
    return;
  }

  result = await callService(
    `http://185.211.88.140:80/api/v2.0.1/algorithms/automatic/end_to_end/read_all?project_id=${project_id}`,
    requestOptions
  );

  $("#collapseClusterList>#panel-body").html("");

  console.log(result);
  // if (result!=null) {
  //
  //     for (let i = 0; i < result.length; i = i + 1) {
  //         $("#collapseClusterList>#panel-body").append("<div class='form-check'>" + "<label class='form-check-label'>" + "<input type='checkbox' id='clusterId' class='form-check-input' name='chkClusters' value=" + result[i].id + ">" + "Name: " + result[i].name + " | " + "Gateways: " + result[i].data.gateways + " | " + "Subnodes: " + result[i].data.subnodes + " </label>" +
  //             " </div>"
  //         );
  //     }
  // }
  //remove border-bottom lastChild of ClusterList
  $("#panel-body .form-check:last-child").css({ border: "none" });
}

//Disabled btn submit form grooming/Automatic
$().ready(function () {
  let endToEnd = document.getElementById("end_To_end");
  let advanced = document.getElementById("Advanced");

  if (endToEnd.checked == false && advanced.checked == false) {
    // $(':input[type="submit"]').prop("disabled", true);
  }
});

//Submit form grooming/Automatic
$("form#grooming-form").submit(async function (e) {
  e.preventDefault();
  //get project_id
  let project_id = "";
  if (localStorage.getItem("project_id")) {
    project_id = JSON.parse(localStorage.getItem("project_id"));
  } else {
    alert("لطفا از قسمت پروژه ها ، پروژه مورد نظر را لود کنید");
    return;
  }

  // get value of CheckBox for Select Algorithm and Calling Service
  let endToEnd = document.getElementById("end_To_end");
  let advanced = document.getElementById("Advanced");

  if (endToEnd.checked == true) {
    SubmitGroomingEndToEnd(project_id);
  } else if (advanced.checked == true) {
    SubmitGroomingAdvanced(project_id);
  }
});

// send data to algorithms/grooming/automatic/end_to_end --> Grooming option/Automatic
function SubmitGroomingEndToEnd(project_id) {
  console.log(localStorage.getItem(project_id));

  let mpbd_threshold = document.getElementById("MPBDTresh").value;
  let mp1h_boolean = document.getElementById("MP1H_bool").value == "true" ? true : false;
  let grooming_linerate = document.getElementById("lineRate1").checked == true ? 100 : 200;
  let grooming_comment = document.getElementById("grooming-comment").value;
  let mp1h_threshold = mp1h_boolean == true ? document.getElementById("MP1HTresh").value : 0 ;

  // mehdi console log

  //Call Service
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    clusters_id: [],
    mp1h_threshold: Number(mp1h_threshold),
    mpbd_thereshold: Number(mpbd_threshold),
    line_rate : Number(grooming_linerate),
    mp1h_utilize: mp1h_boolean,
    comment: grooming_comment,
  });

  // console.log(raw)


  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  callService(
    `http://185.211.88.140:80/api/v2.0.1/algorithms/grooming/automatic/end_to_end?project_id=${project_id}`,
    requestOptions
  );

  //reset input field to empty
  mp1h_threshold.value = "";
  grooming_comment.value = "";

  //Close Modal
  $("#grooming-modal").modal("toggle");
}

// send data to algorithms/grooming/automatic/Advanced --> Grooming option/Automatic
function SubmitGroomingAdvanced(project_id) {
  // let multi_threshold = document.getElementById("MultiTresh").value;
  let multi_threshold = 10;
  let grooming_linerate = document.getElementById("lineRate1").checked == true ? 100 : 200;
  let grooming_comment = document.getElementById("grooming-comment").value;

  let clusters_id_Array = [];

  //Save values of checkbox
  const checkboxes = document.querySelectorAll(
    'input[name="chkClusters"]:checked'
  );
  checkboxes.forEach((checkbox) => {
    clusters_id_Array.push(checkbox.value);
  });

  // mehdi console log
  console.log(
    "clusters_id_Array",
    clusters_id_Array,
    multi_threshold,
    grooming_linerate,
    grooming_comment
  );
  //Call Service
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );
  myHeaders.append("Content-Type", "application/json");
  var raw = JSON.stringify({
    clusters_id: clusters_id_Array,
    multiplex_threshold: Number(multi_threshold),
    line_rate: Number(grooming_linerate),
    comment: grooming_comment,
  });
  console.log("var", raw);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  callService(
    `http://185.211.88.140:80/api/v2.0.1/algorithms/grooming/automatic/advanced?project_id=${project_id}`,
    requestOptions
  );
  // fetch(`http://192.168.7.22/api/v2.0.1/algorithms/grooming/automatic/advanced?project_id=${project_id}`, requestOptions)
  //     .then(response => response.text())
  //     .then(result => console.log(result))
  //     .catch(error => console.log('error', error));

  //Close Modal
  $("#grooming-modal").modal("toggle");
}

//  close-table-lightpath
function close_table_lightpath() {
  const table = document.querySelector(".lighpath_table");
  table.style.visibility = "hidden";
}

//Filt data in table with Algoritm Type Uses in Grooming List
function SearchDataOnTable(algorithm) {
  if (algorithm.toUpperCase() == "ALL") {
    $("#grooming-list-table tbody tr").show();
  } else {
    $("#grooming-list-table tbody tr:has(td)").each(function () {
      var rowAlgorithm = $.trim($(this).find("td:eq(9)").text());
      if (algorithm.toUpperCase() != "ALL") {
        if (rowAlgorithm.toUpperCase() == algorithm.toUpperCase()) {
          $(this).show();
        } else {
          $(this).hide();
        }
      } else if (
        $(this).find("td:eq(9)").text() != "" ||
        $(this).find("td:eq(9)").text() != ""
      ) {
        if (algorithm != "all") {
          if (rowAlgorithm.toUpperCase() == algorithm.toUpperCase()) {
            $(this).show();
          } else {
            $(this).hide();
          }
        }
      }
    });
  }
}

//function When SelectName Cluster Show Popover for show info of slected Cluster
// function onChange() {
//     var $this = $(this);
//     var $e = $(this.target);
//     $('#ClusterNameSelected').popover('destroy');
//     $("#ClusterNameSelected").popover({
//         trigger: 'manual',
//         placement: 'top',
//         content: $this.children('option:selected').attr("data-info")
//     }).popover('show');
//     $this.blur();
// }

async function getStatisticalResult(groomingId) {
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  result = await callService(
    `http://185.211.88.140:80/api/v2.0.0/algorithms/grooming/result?grooming_id=${groomingId}`,
    requestOptions
  );
  // use for Show Satical Result Show
  let statistical = result.statistical_result;
  let statistical_result = [];
  statistical_result.push(statistical.groomout_no);
  statistical_result.push(statistical.lightpath_no);
  statistical_result.push(statistical.mean_lightpath_cap.toFixed(5));
  statistical_result.push(statistical.mp1h_no);
  statistical_result.push(statistical.mp2x_no);
  statistical_result.push(statistical.tp1h_no);
  console.log("statistical_result", statistical_result);
  return statistical_result;
}

async function viewgroomingTable(groomingId) {
  let btn = document.getElementById(`view${groomingId}`);
  console.log("BTN", btn);

  if (btn.onclick) {
    document.querySelector(".lighpath_table").style.visibility = "visible";
    $(".modal-title").html("Grooming List");
  } else {
    document.querySelector(".lighpath_table").style.visibility = "hidden";
  }

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  result = await callService(
    `http://185.211.88.140:80/api/v2.0.0/algorithms/grooming/result?grooming_id=${groomingId}`,
    requestOptions
  );
  let Table = result.grooming_table.demands;
  console.log("TABLE:", Table);

  $(".lighpath_table .modal-header").html("");
  $(".lighpath_table .modal-header").append(
    '<h5 class="modal-title">Grooming Table</h5><button type="button" class="btn btnClose">&times;</button>'
  );
  $(".lighpath_table #modal_lighpath_table #rwa-lightpath-list ").html("");
  let CountRow = 0;
  var selectedItem;
  for (var ItemId in Table) {
    console.log("ItemId" + ItemId);
    let RowTable = Table[ItemId];
    console.log("RowTable" + RowTable);
    selectedItem = ItemId;
    console.log("RowTable:", RowTable);
    let source = RowTable.source;
    let destination = RowTable.destination;
    let splitted_sections = RowTable.splitted_sections;
    let end_to_ends = RowTable.end_to_ends;
    let source_Splitted;
    let destination_Splitted;
    let Count_Splitted;
    let Type_Splitted;

    let Count_endToend;
    let Type_endToend;

    $(".lighpath_table #modal_lighpath_table #rwa-lightpath-list").append(
      "<div class='card' id=" +
      ItemId +
      " onclick=\"viewSourceDestination('" +
      source +
      "','" +
      destination +
      "')\">" +
      "<div class='card-header selected' id=ss" +
      ItemId +
      ">" +
      " <h2 class='mb-0'>" +
      " <button  id=btn" +
      ItemId +
      " class='btn btn-link btn-block text-left' type='button' data-toggle='collapse' data-target='#collapse" +
      ItemId +
      "' aria-expanded='true' aria-controls='collapse" +
      ItemId +
      "'>" +
      "source: " +
      source +
      " | " +
      "destination: " +
      destination +
      "</button>" +
      "</h2>" +
      "</div>" +
      "<div id='collapse" +
      ItemId +
      "' class='collapse' aria-labelledby=" +
      ItemId +
      " data-parent='#rwa-lightpath-list'>" +
      "<div class='card-body'>" +
      "<table  class='table' id=Table" +
      ItemId +
      ">" +
      "<thead>" +
      "<tr>" +
      "<th>" +
      "#" +
      "</th>" +
      "<th>" +
      "Source" +
      "</th>" +
      "<th>" +
      "Destination" +
      "</th>" +
      "<th>" +
      "Traffic Type" +
      "</th>" +
      "<th>" +
      "Traffic Count" +
      "</th>" +
      "</tr>" +
      "</thead>" +
      "<tbody>" +
      //Append <tr></tr>
      "</tbody>" +
      "</table>" +
      "</div>" +
      "</div>" +
      " </div>"
    );

    if (splitted_sections.length > 0) {
      for (let k = 0; k < splitted_sections.length; k++) {
        let RowSplitted = splitted_sections[k].traffic;
        source_Splitted = splitted_sections[k].source;
        destination_Splitted = splitted_sections[k].destination;
        Count_Splitted = RowSplitted.count;
        Type_Splitted = RowSplitted.type;
        $(
          ".lighpath_table #modal_lighpath_table #rwa-lightpath-list #Table" +
          ItemId +
          " tbody"
        ).append(
          '<tr class="Splitted">' +
          "<th>" +
          "Splitted Sections" +
          "</th>" +
          "<td>" +
          source_Splitted +
          "</td>" +
          "<td>" +
          destination_Splitted +
          "</td>" +
          "<td>" +
          Type_Splitted +
          "</td>" +
          "<td>" +
          Count_Splitted +
          "</td>" +
          "</tr>"
        );
      }
    }

    if (end_to_ends.length > 0) {
      for (let j = 0; j < end_to_ends.length; j++) {
        let RowEndtoend = end_to_ends[j].traffic;
        console.log("RowEndtoend::Traffic", RowEndtoend);
        Count_endToend = RowEndtoend.count;
        Type_endToend = RowEndtoend.type;
        $(
          ".lighpath_table #modal_lighpath_table #rwa-lightpath-list #Table" +
          ItemId +
          " tbody"
        ).append(
          '<tr class="End">' +
          "<th>" +
          "End to Ends" +
          "</th>" +
          "<td></td>" +
          "<td></td>" +
          "<td>" +
          Type_endToend +
          "</td>" +
          "<td>" +
          Count_endToend +
          "</td>" +
          "</tr>"
        );
      }
    }
  }

  $(".btnClose").click(function () {
    document.querySelector(".lighpath_table").style.visibility = "hidden";
    Prev_Source = localStorage.getItem("Last_Source");
    Prev_destination = localStorage.getItem("Last_destination");
    let ArrayOfNodesName = [];
    ArrayOfNodesName.push(Prev_Source);
    ArrayOfNodesName.push(Prev_destination);
    changeClusterColorToDefault(ArrayOfNodesName);
  });
}

// show node Source and destination on map for Grooming table
function viewSourceDestination(source, destination) {
  Prev_Source = localStorage.getItem("Last_Source");
  Prev_destination = localStorage.getItem("Last_destination");
  localStorage.setItem("Last_Source", source);
  localStorage.setItem("Last_destination", destination);
  show_source_dest(source, destination, Prev_Source, Prev_destination);
}

function show_source_dest(source, destination, Source_prev, destination_prev) {
  let ArrayOfNodesName = [];
  ArrayOfNodesName.push(Source_prev);
  ArrayOfNodesName.push(destination_prev);
  changeClusterColorToDefault(ArrayOfNodesName);

  change_icon(source, getLatLng(source), "blue", 1, "notified");
  change_icon(destination, getLatLng(destination), "blue", 1, "notified");
}


async function Call_rwa_excel(RWA_Id) {
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `${userData.token_type} ${userData.access_token}`
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  let result = await fetch(`http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result/excel?rwa_id=${RWA_Id}`, requestOptions)
    .then(response => {
      return response.blob();
    })
    .then(result => {
      console.log(result)
      return result
    })
    .catch(error => toastr.error(error));

  const newBlob = new Blob([result]);

  const blobUrl = window.URL.createObjectURL(newBlob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', `output.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);

  // // clean up Url
  window.URL.revokeObjectURL(blobUrl);
}

async function Call_Lom_excel(RWA_Id) {

  // lom_excel ### 

  let url = `http://185.211.88.140:80/api/v2.0.1/algorithms/rwa/lom_excel?rwa_id=${RWA_Id}`;

  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${userData.token_type} ${userData.access_token}`,
    },
    responseType: "blob",
  }).then(function (response) {
    return response.blob().then((b) => {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.setAttribute("download", "lom_output.xlsx");
      a.click();
    });
  });
}


async function Call_Bpm_excel(RWA_Id) {

  // lom_excel ### 

  let url = `http://185.211.88.140:80/api/v2.0.1/algorithms/rwa/bpm_excel?rwa_id=${RWA_Id}`;

  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${userData.token_type} ${userData.access_token}`,
    },
    responseType: "blob",
  }).then(function (response) {
    return response.blob().then((b) => {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.setAttribute("download", "bpm_output.xlsx");
      a.click();
    });
  });
}

async function export_grooming_results() {
  grooming_id = localStorage.getItem("grooming_id");
  if (grooming_id == undefined || grooming_id == null) {
    // alert("Please choose a grooming from Grooming Settings >> Grooming List.")
    alert(
      "لطفا از قسمت Grooming Settings >> Grooming List یک Grooming را انتخاب کنید."
    );
  } else {
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `${userData.token_type} ${userData.access_token}`
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    result = await callService(
      `http://185.211.88.140:80/api/v2.0.0/algorithms/grooming/result?grooming_id=${grooming_id}`,
      requestOptions
    );
    // console.log(result)
    download(
      "grooming_result_" + new Date().toLocaleString() + ".json",
      JSON.stringify(result, undefined, 2)
    );
  }
}

async function export_rwa_results() {
  rwa_id = localStorage.getItem("rwa_id");
  if (rwa_id == undefined || rwa_id == null) {
    // alert("Please choose a grooming from Grooming Settings >> Grooming List.")
    alert("لطفا از قسمت RWA Settings >> View Result یک RWA را انتخاب کنید.");
  } else {
    rwa_id = rwa_id.replaceAll('"', "");
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `${userData.token_type} ${userData.access_token}`
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    result = await callService(
      `http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result?rwa_id=${rwa_id}`,
      requestOptions
    );

    download(
      "rwa_result_" + new Date().toLocaleString() + ".json",
      JSON.stringify(result, undefined, 2)
    );

    // let result = await fetch(`http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result/excel?rwa_id=${rwa_id}`, requestOptions)
    //   .then(response => {
    //     return response.blob();
    //   })
    //   .then(result => {
    //     console.log(result)
    //     return result
    //   })
    //   .catch(error => toastr.error(error));

    // const newBlob = new Blob([result]);

    // const blobUrl = window.URL.createObjectURL(newBlob);

    // const link = document.createElement('a');
    // link.href = blobUrl;
    // link.setAttribute('download', `output.xlsx`);
    // document.body.appendChild(link);
    // link.click();
    // link.parentNode.removeChild(link);

    // // clean up Url
    // window.URL.revokeObjectURL(blobUrl);

    // console.log(result)
  }
}

async function export_full_details_xlsx() {
  // alert("Complete the function later!")

  console.log("This log is a new one!");

  physical_topology = localStorage.getItem("physical_topologies");

  grooming_id = localStorage.getItem("grooming_id");
  if (grooming_id == undefined || grooming_id == null) {
    // alert("Please choose a grooming from Grooming Settings >> Grooming List.")
    alert(
      "لطفا از قسمت Grooming Settings >> Grooming List یک Grooming را انتخاب کنید."
    );
  } else {
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `${userData.token_type} ${userData.access_token}`
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    grooming_result = await callService(
      `http://185.211.88.140:80/api/v2.0.0/algorithms/grooming/result?grooming_id=${grooming_id}`,
      requestOptions
    );
    // console.log(result)
    // download("grooming_result_" + new Date().toLocaleString() + ".json", JSON.stringify(grooming_result, undefined, 2))
  }

  rwa_id = localStorage.getItem("rwa_id");
  if (rwa_id == undefined || rwa_id == null) {
    // alert("Please choose a grooming from Grooming Settings >> Grooming List.")
    alert("لطفا از قسمت RWA Settings >> View Result یک RWA را انتخاب کنید.");
  } else {
    rwa_id = rwa_id.replaceAll('"', "");
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `${userData.token_type} ${userData.access_token}`
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    // result = await callService(`http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result?rwa_id=b48a8220-a594-40ce-b83d-60795b3ca046`, requestOptions);
    rwa_result = await callService(
      `http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result?rwa_id=${rwa_id}`,
      requestOptions
    );
  }

  // console.log(physical_topology)
  // console.log(rwa_result)
  // console.log(grooming_result)

  // Baud_rate = {
  //     'QPSK': 42.5e9,
  //     '8QAM': 42.5e9
  // }
  //
  // reach_dict = {
  //     'QPSK': 800,  // Reach of this modulation
  //     '8QAM': 400
  // }
  //
  // Snr_t = {
  //     'QPSK': 11.3,
  //     '8QAM': 16
  // }
  //
  // Config = {
  //     'Pch': 1e-3,        // Launch Power (W)
  //     'Ls': 80,               // span length (Km)
  //     'gamma': 1.4,           // nonlinear parameter 1/W/km
  //     'beta2': 4.8434,        // fiber dispersion (ps^2)/km
  //     'alpha_db': 0.2,        // fiber power attenuation (dB/km)
  //     'nu': 193,              // optical carrier frequency (THz)
  //     'baud_rate': Baud_rate, // Symbol Rate
  //     'Nch': 96,              // Number of channels
  //     'deltaF': 50e9,         // Channel spacing
  //     'Bs': Baud_rate,        // Signal bandwidth
  //     'nsp': 1.77,            // spontaneous emission factor
  //     'booster_gain': 20,
  //     'inner_loss': 8     // loss inside the centers
  // }

  // console.log(Baud_rate)
  // rwa_id = localStorage.getItem('rwa_id');
  // if (rwa_id == undefined || rwa_id == null) {
  //     // alert("Please choose a grooming from Grooming Settings >> Grooming List.")
  //     alert("لطفا از قسمت RWA Settings >> View Result یک RWA را انتخاب کنید.")
  // }
  // else {
  //     rwa_id = rwa_id.replaceAll('"', '')
  //     var myHeaders = new Headers();
  //     myHeaders.append("Authorization", `${userData.token_type} ${userData.access_token}`);
  //
  //     var requestOptions = {
  //         method: 'GET',
  //         headers: myHeaders,
  //         redirect: 'follow'
  //     };
  //     // result = await callService(`http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result?rwa_id=b48a8220-a594-40ce-b83d-60795b3ca046`, requestOptions);
  //     result = await callService(`http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/result?rwa_id=${rwa_id}`, requestOptions);
  //     console.log(rwa_id);
  //     download("rwa_result_" + new Date().toLocaleString() + ".json", JSON.stringify(result, undefined, 2))
  // }
}
function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function GroomingCheck(projectId) {
  let elem = document.getElementById("myProgresscontanner");
  elem.style.display = "block";
  let a = 0;
  let funcA = async () => {
    if (a >= 100) {
      clearInterval(inter);
    } else {
      var myHeaders = new Headers();
      myHeaders.append(
        "Authorization",
        `${userData.token_type} ${userData.access_token}`
      );

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        grooming_id_list: projectId,
      };
      let grooming_result = await callService(
        `http://185.211.88.140:80/api/v2.0.0/algorithms/grooming/check`,
        requestOptions
      );
      let div = document.getElementById("myBar");
      a = parseInt(grooming_result.state);
      div.style.width = a + "%";
      div.innerHTML = a + "%";
    }
  };
  var inter = setInterval(funcA, 500);
}
