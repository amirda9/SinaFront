
async function getTokn(username,password) {


    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "password");
    urlencoded.append("scope", "");
    urlencoded.append("client_id", "nostrud velit");
    urlencoded.append("client_secret", "labore elit a");
    urlencoded.append("username", username);
    urlencoded.append("password", password);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };
    let token = await callService('http://0.0.0.0:5020/api/v2.0.0/users/login', requestOptions);
    return token;
}
