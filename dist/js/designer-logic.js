if( $('#user-list')[0].childElementCount == 0 ) {
    $('#user-list')[0].style.display = "none";
}
// $('select-user-btn').onclick(()=>{
//     $("#selected-user").append(new Option("option text", "value"));
// })
function selectUser(e){
    e.preventDefault();
    // `<input value='${$('[name="simple_select"]')[0].value}'>${$('.basicModalAutoSelect').autoComplete('show')[0].value}</input>`+
    let selectedUserId = $('[name="simple_select"]')[0].value
    $("#user-list").append('<div class="row" style="margin-left:0;margin-right:0;margin-bottom:3px;">'+
        "<span>"+$('.basicModalAutoSelect').autoComplete('show')[0].value+"</span>" +
        "<button type=\"button\" class=\"btn btn-danger btn-sm col-md-2 ml-auto\" onclick=\"removeThisDesigner(this,"+selectedUserId+")\" style=\"float:right\">X</button>"+
        "</div>");
    $("#selected-user").append(new Option($('.basicModalAutoSelect').autoComplete('show')[0].value,$('[name="simple_select"]')[0].value));
    $('.basicModalAutoSelect').autoComplete('set', null);
    $('#user-list')[0].style.display = "block";
    $('.bootstrap-autocomplete.dropdown-menu').removeClass("show");
    $('#select-user-btn').first().hide()
    if($('#selected-user option').length > 0){
        document.getElementById("addDesignerBtn").disabled = false;
    }
}
$('.basicModalAutoSelect').autoComplete({
    resolver: 'custom',
    formatResult: function (item) {
        $('#select-user-btn').first().show()
        return {
            value: item.id,
            text: item.username + "[]",
            html:[
                item.username
            ]
        };
    },
    minLength : 3,
    preventEnter:true,
    events: {
        search: function (qry, callback) {
            // let's do a custom ajax call
            $.ajax(
                serverAddr+"users/search_for_users",
                {
                    data: { 'search_string': qry},
                    headers: {
                        'accept':'application/json',
                        'Authorization' : `${userData.token_type} ${userData.access_token}`
                    },
                }
            ).done(function (res) {
                callback(res)
            });
        },
        select: function (){
            $('#select-user-btn').first().show()
        }
    }
});

function removeThisDesigner(element,userId) {
    $(element).closest('div').remove();
    $("#selected-user option[value="+userId+"]").remove();
    if($('#selected-user option').length == 0){
        document.getElementById("addDesignerBtn").disabled = true;
    }
}

async function addDesigner(e){
    e.preventDefault();
    var x = document.getElementById('selected-user');
    var val = [];
    
    for (var i = 0; i < x.length; i++) {
        val.push(x[i].value);
    }

    let project = await getAllRecords("project")

    let data = {
        "user_id_list":val,
        "project_id": project[0].id
    }

    const request = {
        url: serverAddr + "sharing/project/add",
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization' : `${userData.token_type} ${userData.access_token}`
        },
    };
    await (async () => {
        try {
            await SwaggerClient.http(request).then(response => {
                if (response.status === 200) {
                    toastr.success("successfully add users to project")
                    // alert("successfully add users to project");
                    $('#desinger-modal').modal('hide');
                    $('#selected-user').empty()
                    $('#simple_select').empty()
                    $('#user-list').empty()
                }
            });
        } catch (error) {
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail)
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail)
            if(error.statusCode === 401) {
                await refreshToken();
                await addDesigner(event);
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}

async function designerMenuHandler(e){
    e.preventDefault();
    // delete_link('JE', 'SA');
    // add_link2( [28.735959, 57.330483], [28.163476, 57.312216], 'JE', 'SA');
    let project = await getAllRecords("project")

    let loadQuery = {
        project_id: {
            value: project[0].id
        }
    }

    const request = {
        url: serverAddr + "sharing/project/users",
        method: 'GET',
        query: loadQuery,
        headers: {
            'accept': 'application/json',
            'Authorization' : `${userData.token_type} ${userData.access_token}`
        },
    };
    await (async () => {
        try {
            await SwaggerClient.http(request).then(response => {
                if (response.status === 200) {
                    let i = 1
                    $("#project-user-table>tbody").empty();
                    for (let user of response.body) {
                        $("#project-user-table>tbody").append("<tr>" +
                            "<th scope=\"row\">" + i + "</th>\n" +
                            "                        <td value=\""+user.user_id+"\">" + user.username + "</td>\n" +
                            "                        <td>\n" +
                            "                            <button type=\"button\" class=\"btn btn-danger\" onclick=\"removeUserFromProject('"+user.user_id+"')\"><i class=\"far fa-trash-alt\"></i></button>\n" +
                            "                        </td>" +
                            "</tr>");
                        i++;

                    }
                    // toastr.success("successfully add users to project")
                    // alert("successfully add users to project");
                    // $('#desinger-modal').modal('hide');
                }
            });
        } catch (error) {
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail)
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail)
            if(error.statusCode === 401) {
                await refreshToken();
                await addDesigner(event);
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}

async function removeUserFromProject(userId) {
    let project = await getAllRecords("project")
    let data = {
        "project_id": project[0].id,
        "user_id_list": [
            userId
        ]
    }
    const request = {
        url: serverAddr + "sharing/project/remove",
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization' : `${userData.token_type} ${userData.access_token}`
        },
    };
    await (async () => {
        try {
            await SwaggerClient.http(request).then(response => {
                if (response.status === 200) {
                    toastr.success("successfully remove users to project")
                    // $("#selected-user option[value="+userId+"]").remove();
                    $("#project-user-table>tbody>tr>td[value="+userId+"]").closest("tr").remove();
                    // $("#project-user-table>tbody")
                    // alert("successfully add users to project");
                    // $('#desinger-modal').modal('hide');
                }
            });
        } catch (error) {
            if (error.statusCode === 409)
                toastr.error(error.response.body.detail)
            // alert("name is duplicate, please choose another name")
            if (error.statusCode === 400)
                toastr.error(error.response.body.detail)
            if(error.statusCode === 401) {
                await refreshToken();
                await addDesigner(event);
            }
            // alert(error.response.body.detail)
            // console.log(error.response);
        } finally {
            // clearTimeout(timeout);
        }
    })();
}