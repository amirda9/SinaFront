function onchange_algorithm_spec() {
  let algorithm_spec = document.getElementById("algorithm_spec").value;
  if (algorithm_spec == "Default"){
    document.getElementById("restoration_k").disabled = true;
    document.getElementById("restoration_k").value = 1;
    document.getElementById("iterations").disabled = true;
    document.getElementById("iterations").value = 1;
    document.getElementById("group_size").disabled = true;
    document.getElementById("group_size").value = 1;
    document.getElementById("history_window").disabled = true;
    document.getElementById("history_window").value = 30;
    document.getElementById("shortest_path_k").disabled = true;
    document.getElementById("shortest_path_k").value = 1;
    document.getElementById("noise_margin").disabled = true;
    document.getElementById("noise_margin").value = 1;
    document.getElementById("trade_off").disabled = true;
    document.getElementById("trade_off").value = 0.01;
  }
  else{
    document.getElementById("restoration_k").disabled = false;
    document.getElementById("iterations").disabled = false;
    document.getElementById("group_size").disabled = false;
    document.getElementById("history_window").disabled = false;
    document.getElementById("shortest_path_k").disabled = false;
    document.getElementById("noise_margin").disabled = false;
    document.getElementById("trade_off").disabled = false;
  }
}

function onchange_algorithm() {
  let algorithm = document.getElementById("algorithm").value;
  // console.log(document.getElementById("restoration_k").disabled)
  // console.log(document.getElementById("restoration_k").value)

  if(algorithm == "ILP"){
    console.log("ILP");
    document.getElementById("restoration_k").disabled = true;
    // document.getElementById("restoration_k").placeholder = null;
    document.getElementById("iterations").disabled = true;
    // document.getElementById("iterations").placeholder = null;
    document.getElementById("group_size").disabled = true;
    // document.getElementById("group_size").placeholder = null;
    document.getElementById("history_window").disabled = true;
    document.getElementById("shortest_path_k").disabled = false;
    document.getElementById("noise_margin").disabled = false;
    document.getElementById("trade_off").disabled = false;
    // document.getElementById("history_window").placeholder = null;
  }
  else if (algorithm == "Greedy"){
    console.log(algorithm);
    document.getElementById("restoration_k").disabled = false;
    // document.getElementById("restoration_k").value = null;
    document.getElementById("iterations").disabled = false;
    // document.getElementById("iterations").value = null;
    document.getElementById("group_size").disabled = true;
    // document.getElementById("group_size").placeholder = null;
    document.getElementById("history_window").disabled = true;
    document.getElementById("shortest_path_k").disabled = false;
    document.getElementById("noise_margin").disabled = false;
    document.getElementById("trade_off").disabled = false;
  }
  else if (algorithm=="GroupILP"){
    console.log(algorithm);
    document.getElementById("restoration_k").disabled = true;
    // document.getElementById("restoration_k").placeholder = null;
    document.getElementById("iterations").disabled = false;
    // document.getElementById("iterations").value = null;
    document.getElementById("group_size").disabled = false;
    // document.getElementById("group_size").value = null;
    document.getElementById("history_window").disabled = false;
    document.getElementById("shortest_path_k").disabled = false;
    document.getElementById("noise_margin").disabled = false;
    document.getElementById("trade_off").disabled = false;
  }
}

function onchange_raman() {
  let raman = document.getElementById("raman").value;
  if(raman=="Default"){
    document.getElementById("ramanThresh").disabled = true;
    document.getElementById("ramanThresh").value = 120;
    document.getElementById("NF_raman").disabled = true;
    document.getElementById("NF_raman").value = -1;
    document.getElementById("Gain_R").disabled = true;
    document.getElementById("Gain_R").value = 10;
  }
  else{
    document.getElementById("ramanThresh").disabled = false;
    document.getElementById("NF_raman").disabled = false;
    document.getElementById("Gain_R").disabled = false;
  }
}

function onchange_dwdm() {
  let dwdm = document.getElementById("dwdm").value;
  if(dwdm=="Default"){
    document.getElementById("ChannelSpacing").disabled = true;
    document.getElementById("ChannelSpacing").value = 50;
    document.getElementById("ChannelsNO").disabled = true;
    document.getElementById("ChannelsNO").value = 96;
  }
  else{
    document.getElementById("ChannelSpacing").disabled = false;
    document.getElementById("ChannelsNO").disabled = false;
  }
}

function onchange_baudrate() {
  let baudrate = document.getElementById("baudrate").value;
  if(baudrate=="Default"){
    document.getElementById("QPSK_baudrate").disabled = true;
    document.getElementById("QPSK_baudrate").value = 32;
    document.getElementById("8QAM_baudrate").disabled = true;
    document.getElementById("8QAM_baudrate").value = 42.5;
  }
  else{
    document.getElementById("QPSK_baudrate").disabled = false;
    document.getElementById("8QAM_baudrate").disabled = false;
  }
}

function onchange_powerOptimization() {
  let PowerOptimization = document.getElementById("PowerOptimization").value;
  if(PowerOptimization=="Optimized"){
    document.getElementById("P_fixed").disabled = true;
    document.getElementById("P_fixed").value = 0;
  }
  else{
    document.getElementById("P_fixed").disabled = false;
  }
}

function onchange_SNR() {
  let SNR_Thresh = document.getElementById("SNR_Thresh").value;
  if(SNR_Thresh=="Default"){
    document.getElementById("QPSK_SNR").disabled = true;
    document.getElementById("QPSK_SNR").value = 12;
    document.getElementById("8QAM_SNR").disabled = true;
    document.getElementById("8QAM_SNR").value = 16;
  }
  else{
    document.getElementById("QPSK_SNR").disabled = false;
    document.getElementById("8QAM_SNR").disabled = false;
  }
}


function onchange_edfa() {
  let edfa = document.getElementById("edfa").value;
  console.log(edfa)
  if(edfa=="Default"){
    document.getElementById("Gain_min").disabled = true;
    document.getElementById("Gain_min").value = 10;
    document.getElementById("Gain_max").disabled = true;
    document.getElementById("Gain_max").value = 23;
    document.getElementById("NF_edfa").disabled = true;
    document.getElementById("NF_edfa").value = 5.5;
    document.getElementById("Psat_edfa").disabled = true;
    document.getElementById("Psat_edfa").value = 0;
  }
  else{
    document.getElementById("Gain_min").disabled = false;
    // document.getElementById("Gain_min").value = null;
    document.getElementById("Gain_max").disabled = false;
    // document.getElementById("Gain_max").value = null;
    document.getElementById("NF_edfa").disabled = false;
    // document.getElementById("NF_edfa").value = null;
    document.getElementById("Psat_edfa").disabled = false;
    // document.getElementById("Psat_edfa").value = null;
  }
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


$( document ).ready(function() {
  document.getElementById("edfa").value = "Default";
  document.getElementById("SNR_Thresh").value = "Default";
  document.getElementById("PowerOptimization").value = "Optimized";
  document.getElementById("baudrate").value = "Default";
  document.getElementById("dwdm").value = "Default";
  document.getElementById("raman").value = "Default";
  document.getElementById("algorithm_spec").value = "Default";


  onchange_edfa();
  onchange_SNR();
  onchange_powerOptimization();
  onchange_baudrate();
  onchange_dwdm();
  onchange_raman();
  onchange_algorithm_spec();


  
});

//if Enter Comment Enabled button and you can running_rwa(use in rwa_start)
function Call_running_rwa() {
  $(':input[type="submit"]').prop("disabled", false);
  $("#msgComment").css("visibility", "hidden");
}

//(use in rwa_start)
async function running_rwa() {
    let edfa = document.getElementById("edfa").value;
    let Gain_min = document.getElementById("Gain_min").value;
    let Gain_max = document.getElementById("Gain_max").value;
    let NF_edfa = document.getElementById("NF_edfa").value;
    let Psat_edfa = document.getElementById("Psat_edfa").value;
    let raman = document.getElementById("raman").value;
    let Gain_R = document.getElementById("Gain_R").value;
    let NF_raman = document.getElementById("NF_raman").value;
    let ramanThresh = document.getElementById("ramanThresh").value;
    let dwdm = document.getElementById("dwdm").value;
    let ChannelSpacing = document.getElementById("ChannelSpacing").value;
    let ChannelsNO = document.getElementById("ChannelsNO").value;
    let baudrate = document.getElementById("baudrate").value;
    let QPSK_baudrate = document.getElementById("QPSK_baudrate").value;
    let QAM_baudrate = document.getElementById("8QAM_baudrate").value;
    let PowerOptimization = document.getElementById("PowerOptimization").value;
    let P_fixed = document.getElementById("P_fixed").value;
    let SNR_Thresh = document.getElementById("SNR_Thresh").value;
    let QPSK_SNR = document.getElementById("QPSK_SNR").value;
    let QAM_SNR = document.getElementById("8QAM_SNR").value;
    let algorithm = document.getElementById("algorithm").value;
    let algorithm_spec = document.getElementById("algorithm_spec").value;
    let shortest_path_k = document.getElementById("shortest_path_k").value;
    let restoration_k = document.getElementById("restoration_k").value;
    let noise_margin = document.getElementById("noise_margin").value;
    let trade_off = document.getElementById("trade_off").value;
    let iterations = document.getElementById("iterations").value;
    let group_size = document.getElementById("group_size").value;
    let history_window = document.getElementById("history_window").value;
    let comment = document.getElementById("comment").value;

    //  rwa run console log
    console.log(algorithm_spec,edfa,Gain_min,Gain_max,NF_edfa,Psat_edfa,raman,Gain_R,NF_raman,ramanThresh,dwdm,ChannelSpacing,ChannelsNO,baudrate,QPSK_baudrate,QPSK_baudrate,QAM_baudrate,
    PowerOptimization,P_fixed,SNR_Thresh,QPSK_SNR,QAM_SNR,algorithm,shortest_path_k,restoration_k,noise_margin,trade_off,iterations,group_size,history_window,comment)


    // replacing every step default values 
    if(edfa=="Default"){
      Gain_min =10;
      Gain_max = 23;
      NF_edfa = 5.5;
    }
    
    if(raman=="Default"){
      ramanThresh = 120;
      Gain_R = 10;
      NF_raman = -1;
    }

    if(dwdm=="Default"){
      ChannelSpacing = 50;
      ChannelsNO = 96;
    }

    if(baudrate=="Default"){
      QPSK_baudrate =32;
      QAM_baudrate = 42.5;
    }

    if(SNR_Thresh=="Default"){
      QPSK_SNR = 12;
      QAM_SNR = 16;
    }

    if(PowerOptimization=="Optimized"){
      P_fixed = 0;
    }

    if(algorithm_spec =="Default"){
      shortest_path_k = 1;
      restoration_k = 1;
      noise_margin = 1;
      trade_off = 0.01;
      iterations = 1;
      group_size = 1;
      history_window = 30;
      console.log("its default specs")
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      `${userData.token_type} ${userData.access_token}`
    );





    var raw = JSON.stringify({
      algorithm: algorithm,
      shortest_path_k: Number(shortest_path_k),
      restoration_k: Number(restoration_k),
      noise_margin: Number(noise_margin),
      trade_off: Number(trade_off),
      iterations: Number(iterations),
      group_size: Number(group_size),
      comment: String(comment),
      history_window: Number(history_window),
      physical_layer: {
          launch_power: P_fixed,
          baud_rate:     {QPSK: QPSK_baudrate,   '8QAM': QAM_baudrate},
          threshold_snr: {QPSK: QPSK_SNR,     '8QAM': QAM_SNR},
          num_channels: ChannelsNO,
          channel_spacing: ChannelSpacing,
      },
      OLA_specification: {
          raman_placement_threshold: ramanThresh,
          max_EDFA_gain: Gain_max,
          min_EDFA_gain: Gain_min,
          raman_gain: Gain_R,
          NF_EDFA: NF_edfa,
          NF_Raman: NF_raman,
      }
    });

    console.log(raw)
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
      `http://172.25.248.140:80/api/v2.0.0/algorithms/rwa/start?project_id=${project_id}&grooming_id=${grooming_id}`,
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
      // div.innerHTML = 100 + "%";
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
        `http://172.25.248.140:80/api/v2.0.0/algorithms/rwa/check`,
        requestOptions
      );
      let div = document.getElementById("myBar");
      progress = rwa_result.progress;
      finished = rwa_result.current_stage_info == "Finished successfully." ? true : false;
      failed = rwa_result.failed;
      div.style.width = progress + "%";
      // div.innerHTML = progress + "%";
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
  // algorithm = $("#algorithm").val();
  // if (algorithm == "Greedy") {
  //   let shortest_path_k = Number($("#shortest_path_k").val());
  //   let restoration_k = Number($("#restoration_k").val());
  //   let noise_margin = Number($("#noise_margin").val());
  //   let trade_off = Number($("#trade_off").val());
  //   let iterations = Number($("#iterations").val());
  //   if (!Number.isInteger(shortest_path_k) || shortest_path_k < 1) {
  //     alert("عدد shortest_path_k باید عدد صحیح بزرگتر از یک باشد");
  //     return 0;
  //   } else if (!Number.isInteger(restoration_k) || restoration_k < 1) {
  //     alert("عدد restoration_k باید عدد صحیح بزرگتر از یک باشد");
  //     return 0;
  //   } else if (!Number.isInteger(noise_margin) || noise_margin < 1) {
  //     alert("عدد noise_margin باید عدد صحیح بزرگتر از یک باشد");
  //     return 0;
  //   } else if (!Number.isInteger(iterations) || iterations < 1) {
  //     alert("عدد iterations باید عدد صحیح بزرگتر از یک باشد");
  //     return 0;
  //   } else if (trade_off < 0 && trade_off > 1) {
  //     alert("عدد trade_off باید بین صفر و یک باشد");
  //   } else {
  //     return 1;
  //     // code with rwa start
  //   }
  // } else if (algorithm == "GroupILP") {
  //   let shortest_path_k = Number($("#shortest_path_k").val());
  //   let noise_margin = Number($("#noise_margin").val());
  //   let trade_off = Number($("#trade_off").val());
  //   let iterations = Number($("#iterations").val());
  //   let group_size = Number($("#group_size").val());
  //   let history_window = Number($("#history_window").val());
  //   if (!Number.isInteger(shortest_path_k) || shortest_path_k < 1) {
  //     alert("عدد shortest_path_k باید عدد صحیح بزرگتر از یک باشد");
  //     return 0;
  //   } else if (!Number.isInteger(noise_margin) || noise_margin < 1) {
  //     alert("عدد noise_margin باید عدد صحیح بزرگتر از یک باشد");
  //     return 0;
  //   } else if (!Number.isInteger(iterations) || iterations < 1) {
  //     alert("عدد iterations باید عدد صحیح بزرگتر از یک باشد");
  //     return 0;
  //   } else if (trade_off < 0 || trade_off > 1) {
  //     alert("عدد trade_off باید بین یک و یک باشد");
  //     return 0;
  //   } else if (!Number.isInteger(history_window) || history_window < 1) {
  //     alert("عدد history_window باید بین یک و یک باشد");
  //     return 0;
  //   } else if (!Number.isInteger(group_size) || group_size < 1) {
  //     alert("عدد group_size باید بین صفر و یک باشد");
  //     return 0;
  //   } else {
  //     return 1;
  //     // code with rwa start
  //   }
  // } else if (algorithm == "ILP") {
  //   let shortest_path_k = Number($("#shortest_path_k").val());
  //   let noise_margin = Number($("#noise_margin").val());
  //   let trade_off = Number($("#trade_off").val());
  //   if (!Number.isInteger(shortest_path_k) || shortest_path_k < 1) {
  //     alert("عدد shortest_path_k باید عدد صحیح بزرگتر از یک باشد");
  //     return 0;
  //   } else if (trade_off < 0 || trade_off > 1) {
  //     alert("عدد trade_off باید بین صفر و یک باشد");
  //     return 0;
  //   } else if (!Number.isInteger(noise_margin) || noise_margin < 1) {
  //     alert("عدد noise_margin باید عدد صحیح بزرگتر از یک باشد");
  //     return 0;
  //   } else {
  //     // code with rwa start
  //     return 1;
  //   }
  // } else {
  //   alert("الگوریتم انتخاب نشده است");
  //   return 0;
  // }
}
