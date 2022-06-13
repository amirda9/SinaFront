async function callService(path, requestOptions) {
    console.log(requestOptions)
    let result = await fetch(path, requestOptions)
        .then(response => {
            if(response.status === 201)
            {
                toastr.success("Successfully ...");
            }
            return response.text();
        })
        .then(result => {
            return JSON.parse(result);
        })
        .catch(error =>  toastr.error(error));
       console.log("Result of Service :",result);
    return result
}