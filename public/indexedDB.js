let db;

const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = (e) => {
    const db = e.target.result;

    const budetStore = db.createObjectStore("userBudget", { autoIncrement: true })
}

request.onsuccess = (e) => {
    console.log("Connection established successfully on indexedDB!")
    const db = e.target.result;
    if (navigator.onLine) {
        parseDB();
    }

}

request.onerror = (e) => {
    console.log(e.error)
}

function saveRec(rec) {
    const db = request.result
    const transaction = db.transaction(["userBudget"], "readwrite");
    const userBudgetStore = transaction.objectStore("userBudget")
    userBudgetStore.add({ rec })
}

function parseDB() {
    request.onsuccess = () => {
        // transaciton link to the userBudget object store
        const db = request.result
        const transaction = db.transaction(["userBudget"], "readwrite");
        const userBudgetStore = transaction.objectStore("userBudget")

        // retrieve all store
        const getAll = userBudgetStore.getAll()
        getAll.onsuccess = function () {
            if (getAll.result.length > 0) {
                fetch(`/api/transaction/bulk`, {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-type': 'application/json'
                    }
                })
                    .then((res) => res.json())
                    .then(() => {
                        const db = request.result
                        const transaction = db.transaction(["userBudget"], "readwrite");
                        const userBudgetStore = transaction.objectStore("userBudget")
                        const userBudgetRequest = userBudgetStore.clear()
                    })
            }
        }
    }
}

window.addEventListener('online', parseDB)