function onchange_modulation_type() {
  let modulation_type = document.getElementById("modulation_type").value;
  console.log(modulation_type);
}

function onchange_algorithm() {
  let algorithm = document.getElementById("algorithm").value;
  console.log(algorithm);
}

// when show modal disabled button and show Label:Enter comment(use in rwa_start)
function check_running_rwa() {
  $(':input[type="submit"]').prop("disabled", false);
  let comment = document.getElementById("comment").value;
  if (comment === "") {
    $("#msgComment").css("visibility", "visible");
    $(':input[type="submit"]').prop("disabled", true);
  }
}

//if Enter Comment Enabled button and you can running_rwa(use in rwa_start)
function Call_running_rwa() {
  $(':input[type="submit"]').prop("disabled", false);
  $("#msgComment").css("visibility", "hidden");
}

//(use in rwa_start)
async function running_rwa() {
  if (validationRWA() == 1) {
    // document.getElementsByClassName("btn-send-rwa").style.visibility = "hidden"
    // $(':input[type="submit"]').prop('disabled', false);

    let modulation_type = document.getElementById("modulation_type").value;
    let algorithm = document.getElementById("algorithm").value;
    let shortest_path_k = document.getElementById("shortest_path_k").value;
    let restoration_k = document.getElementById("restoration_k").value;
    let noise_margin = document.getElementById("noise_margin").value;
    let trade_off = document.getElementById("trade_off").value;
    let enable_merge = document.getElementById("enable_merge").checked;
    let iterations = document.getElementById("iterations").value;
    let group_size = document.getElementById("group_size").value;
    let history_window = document.getElementById("history_window").value;
    let comment = document.getElementById("comment").value;

    // let token = await getTokn("amir", "1234");
    if (
      modulation_type == "" &&
      algorithm == "" &&
      shortest_path_k == "" &&
      restoration_k == "" &&
      noise_margin == "" &&
      trade_off == "" &&
      enable_merge == "" &&
      enable_merge == "" &&
      iterations == "" &&
      group_size == "" &&
      history_window == ""
    ) {
      modulation_type = "QPSK";
      algorithm = "Greedy";
      shortest_path_k = 3;
      restoration_k = 2;
      noise_margin = 4;
      trade_off = 0.1;
      enable_merge = false;
      iterations = 4;
      group_size = 4;
      history_window = 30;
      comment = document.getElementById("comment").value;
      console.log(
        "modulation_type : ",
        modulation_type,
        "algorithm : ",
        algorithm,
        "shortest_path_k : ",
        shortest_path_k,
        "restoration_k : ",
        restoration_k,
        "noise_margin : ",
        noise_margin,
        "trade_off : ",
        trade_off,
        "enable_merge : ",
        enable_merge,
        "iterations : ",
        iterations,
        "group_size : ",
        group_size,
        "history_window : ",
        history_window,
        "comment :",
        comment
      );
    }
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      `${userData.token_type} ${userData.access_token}`
    );

    var raw = JSON.stringify({
      modulation_type: modulation_type,
      algorithm: algorithm,
      shortest_path_k: shortest_path_k,
      restoration_k: restoration_k,
      noise_margin: noise_margin,
      trade_off: trade_off,
      enable_merge: enable_merge,
      iterations: iterations,
      group_size: group_size,
      history_window: history_window,
      comment: comment,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    let project_id = JSON.parse(localStorage.getItem("project_id"));

    if (localStorage.getItem("grooming_id")) {
      grooming_id = localStorage.getItem("grooming_id");
    } else {
      alert("لطفا از قسمت grooming list یک Grooming انتخاب کنید...");
      return;
    }

    let result = await callService(
      `http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/start?project_id=${project_id}&grooming_id=${grooming_id}`,
      requestOptions
    );

    if (Object.keys(result).includes("rwa_id")) {
      console.log("****", Object.keys(result).includes("rwa_id"));
      localStorage.setItem("rwa_id", JSON.stringify(result.rwa_id));
      RWACheck(result.rwa_id);
      // toastr.success("RWA is starting successfully... ");
      // alert('RWA is starting successfully... ', result.rwa_id);
    }
  }
}

function RWACheck(rwa_id) {
  let progress = 0;
  let finished = false
  let failed = false
  let elem = document.getElementById("myProgresscontanner");
  let funcA = async () => {
    elem.style.display = "block";
    if (finished) {
      let div = document.getElementById("myBar");
      div.style.width = 100 + "%";
      div.innerHTML = 100 + "%";
      setTimeout(() => {
        clearInterval(inter);
        elem.style.display = "none";
      }, 2000);
    } else {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append(
        "Authorization",
        `${userData.token_type} ${userData.access_token}`
      );
      var body = JSON.stringify({
        rwa_id: rwa_id
      })

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: body,
      };
      let rwa_result = await callService(
        `http://185.211.88.140:80/api/v2.0.0/algorithms/rwa/check`,
        requestOptions
      );
      let div = document.getElementById("myBar");
      progress = rwa_result.progress + 45;
      finished = rwa_result.current_stage_info == "Finished successfully." ? true : false;
      failed = rwa_result.failed;
      div.style.width = progress + "%";
      div.innerHTML = progress + "%";
    }
  };
  setTimeout(() => {
    if (failed) {
      clearInterval(inter);
      elem.style.display = "none";
      toastr.error("rwa failed");
    }
  }, 10000);
  if (!finished) {
    var inter = setInterval(funcA, 500);
  }
}
function validationRWA() {
  algorithm = $("#algorithm").val();
  if (algorithm == "Greedy") {
    let shortest_path_k = Number($("#shortest_path_k").val());
    let restoration_k = Number($("#restoration_k").val());
    let noise_margin = Number($("#noise_margin").val());
    let trade_off = Number($("#trade_off").val());
    let iterations = Number($("#iterations").val());
    if (!Number.isInteger(shortest_path_k) || shortest_path_k < 1) {
      alert("عدد shortest_path_k باید عدد صحیح بزرگتر از یک باشد");
      return 0;
    } else if (!Number.isInteger(restoration_k) || restoration_k < 1) {
      alert("عدد restoration_k باید عدد صحیح بزرگتر از یک باشد");
      return 0;
    } else if (!Number.isInteger(noise_margin) || noise_margin < 1) {
      alert("عدد noise_margin باید عدد صحیح بزرگتر از یک باشد");
      return 0;
    } else if (!Number.isInteger(iterations) || iterations < 1) {
      alert("عدد iterations باید عدد صحیح بزرگتر از یک باشد");
      return 0;
    } else if (trade_off < 0 && trade_off > 1) {
      alert("عدد trade_off باید بین صفر و یک باشد");
    } else {
      return 1;
      // code with rwa start
    }
  } else if (algorithm == "GroupILP") {
    let shortest_path_k = Number($("#shortest_path_k").val());
    let noise_margin = Number($("#noise_margin").val());
    let trade_off = Number($("#trade_off").val());
    let iterations = Number($("#iterations").val());
    let group_size = Number($("#group_size").val());
    let history_window = Number($("#history_window").val());
    if (!Number.isInteger(shortest_path_k) || shortest_path_k < 1) {
      alert("عدد shortest_path_k باید عدد صحیح بزرگتر از یک باشد");
      return 0;
    } else if (!Number.isInteger(noise_margin) || noise_margin < 1) {
      alert("عدد noise_margin باید عدد صحیح بزرگتر از یک باشد");
      return 0;
    } else if (!Number.isInteger(iterations) || iterations < 1) {
      alert("عدد iterations باید عدد صحیح بزرگتر از یک باشد");
      return 0;
    } else if (trade_off < 0 || trade_off > 1) {
      alert("عدد trade_off باید بین یک و یک باشد");
      return 0;
    } else if (!Number.isInteger(history_window) || history_window < 1) {
      alert("عدد history_window باید بین یک و یک باشد");
      return 0;
    } else if (!Number.isInteger(group_size) || group_size < 1) {
      alert("عدد group_size باید بین صفر و یک باشد");
      return 0;
    } else {
      return 1;
      // code with rwa start
    }
  } else if (algorithm == "ILP") {
    let shortest_path_k = Number($("#shortest_path_k").val());
    let noise_margin = Number($("#noise_margin").val());
    let trade_off = Number($("#trade_off").val());
    if (!Number.isInteger(shortest_path_k) || shortest_path_k < 1) {
      alert("عدد shortest_path_k باید عدد صحیح بزرگتر از یک باشد");
      return 0;
    } else if (trade_off < 0 || trade_off > 1) {
      alert("عدد trade_off باید بین صفر و یک باشد");
      return 0;
    } else if (!Number.isInteger(noise_margin) || noise_margin < 1) {
      alert("عدد noise_margin باید عدد صحیح بزرگتر از یک باشد");
      return 0;
    } else {
      // code with rwa start
      return 1;
    }
  } else {
    alert("الگوریتم انتخاب نشده است");
    return 0;
  }
}
