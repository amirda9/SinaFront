const PROJECT_DB = "sinaDb";
const TABLES = ["project", "physical", "traffic"];
const OtherTables = ["cluster"]
let db;
$(async function() {
    db = await idb.openDb(PROJECT_DB, 1, db => {
        TABLES.map(table => db.createObjectStore(table, {keyPath: 'name'}));
        OtherTables.map(table => db.createObjectStore(table, {keyPath: 'project_id'}));
        console.log()
    });
});

// await init();

// async function init() {
//     db = await idb.openDb(PROJECT_DB, 1, db => {
//         TABLES.map(table => db.createObjectStore(table, {keyPath: 'name'}));
//     });
//     // await renderDatabase();
// }

async function renderDatabase() {
    await  Promise.all(TABLES.map(table => renderTable(table)));
}

async function renderTable(table) {
    return;
    let tx = db.transaction(table);
    let store = tx.objectStore(table);

    let elements = await store.getAll();

    if(elements.length)
        alert(JSON.stringify(elements))
    else
        alert("No record in " + table)
    return;

    let listElem = eval(table + "ListElem");
    listElem.innerHTML = '<li>' + elements.length + ' contents: </li>'

    listElem.innerHTML = '<li>' + table + ' contents: </li>'
    if (elements.length) {
        listElem.innerHTML += elements.map(element => `<li>
        name: ${element.name}, price: ${element.id}
      </li>`).join('');
    } else {
        listElem.innerHTML = '<li>No elements yet. Please add some.</li>'
    }
}

async function clearTable(table) {
    let tx = db.transaction(table, 'readwrite');
    await tx.objectStore(table).clear();
    // await renderTable(table);
}

async function clearAllTables(tables) {
    let tx = db.transaction(tables, 'readwrite');
    for (let i = 0; i < tables.length; i++) {
        try {
            await tx.objectStore(tables[i]).clear();
            // await renderTable(table);
        } catch(err) {

        }
    }
    // await renderTable(table);
}
async function addElement(table, element) {

    let tx = db.transaction(table, 'readwrite');

    try {
        await tx.objectStore(table).add(element);
        // await renderTable(table);
    } catch(err) {
        if (err.name == 'ConstraintError') {
            alert("Such " + table + "element  exists already");
        } else {
            throw err;
        }
    }
}


async function findElement(table) {
    let name = prompt(table + " name?");
    let element = getElement(table, name);
    if(element)
        alert("name: " + element.name);
    else
        alert("Such " + name + " element  does not exist!");
}

async function getElement(table, name) {
    let tx = db.transaction(table, 'readwrite');
    let element;
    try {
        element = await tx.objectStore(table).get(name);
    } catch(err) {
        return element;
    }
    return element;
}



async function modifyElement(table) {
    let name = prompt(table + " name?");
    let element = {
        'name' : name,
        'id': 100
    };
    await updateElement(table, element);
}

async function updateElement(table, updatedElement) {
    let tx = db.transaction(table, 'readwrite');
    let dummyEl;
    try {
        dummyEl = await tx.objectStore(table).get(updatedElement.name);
        if(dummyEl === undefined) {
            toastr.error("Such " + updatedElement.name + " element  does not exist!");
            return false;
        }
        await tx.objectStore(table).put(updatedElement);
        // await renderTable(table);
    } catch(err) {
        console.log(err);
        // toastr.error("Such " + updatedElement.name + " element  does not exist!");
        return false;
    }
    return true;
}

async function newElement(table) {
    let name = prompt(table + " name?");
    let id = +prompt(table + " id?");
    let element = {
        'name' : name,
        'id': id
    };
    await addElement(table, element);
}

async function deleteElement(table) {
    let name = prompt(table + " name to delete?");

    let tx = db.transaction(table, 'readwrite');

    try {
        await tx.objectStore(table).delete(name);
        // await renderTable(table);
    } catch(err) {
        alert("Such " + name + table + "element  does not exist!");
        if (err.name == 'ConstraintError') {
            alert("Such " + table + "element  exists already");
        } else {
            throw err;
        }
    }
}

async function deleteElement2(table,name) {
    // let name = prompt(table + " name to delete?");

    let tx = db.transaction(table, 'readwrite');

    try {
        await tx.objectStore(table).delete(name);
        // await renderTable(table);
    } catch(err) {
        alert("Such " + name + table + "element  does not exist!");
        if (err.name == 'ConstraintError') {
            alert("Such " + table + "element  exists already");
        } else {
            throw err;
        }
    }
}

// window.addEventListener('unhandledrejection', event => {
//     alert("Error: " + event.reason.message);
// });

async function getAllRecords(table) {
    try {
        let tx = db.transaction(table);
        let store = tx.objectStore(table);
        let elements = await store.getAll();
        if(elements.length)
            return elements
        // await renderTable(table);
    } catch(err) {
        return null;
    }

}