const serverAddr = "http://172.25.248.140:80/api/v2.0.0/";
// const serverAddr = "http://172.25.248.140:80/api/v2.0.0/";

$("form#loginform").submit(function (e) {

    e.preventDefault();

    let formData = new FormData(this);
    // window.location.href = "http://localhost:63343/changed_files/map.html";
    formData = JSON.parse(JSON.stringify(Object.fromEntries(formData)));

    getTokn(formData.username, formData.password).then(res => {
        // response.body.token_type = "Bearer";
        if (!res.detail){
            localStorage.setItem("userName", `${formData.username}`);
            localStorage.setItem("userData", JSON.stringify(res));
            toastr.success("Login successfully");
            console.log(res)
            setTimeout(() => {
                // window.location.href = "http://192.168.7.22/map.html";
                window.location.href = window.location.href+"map.html";
            }, 1000);
        }
    }).catch(error => {
        if (error.statusCode === 409)
            toastr.error(error.response.body.detail);
        if (error.statusCode === 400)
            toastr.error(error.response.body.detail);
        if (error.statusCode === 401)
            toastr.error(error.response.body.detail);
    });
});


function normalizeParams(params) {
    var newParams = {};
    for (var key in params) {
        if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
            var value = params[key];
            if (this.isFileParam(value) || Array.isArray(value)) {
                newParams[key] = value;
            } else {
                newParams[key] = this.paramToString(value);
            }
        }
    }

    return newParams;
}

