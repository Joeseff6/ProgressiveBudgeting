let db;
let budgetVersion;

const request = indexedDB.open(`budgetDb`, budgetVersion || 1);

request.onupgradeneeded = function (event) {
    console.log(`Upgrade needed for budgetDb`);

    const { oldVersion } = event;
    const newVersion = event.newVersion || db.version;

    console.log(`budgetDb updated from version ${oldVersion} to ${newVersion}`);

    db = event.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore(`BudgetStore`, {autoIncrement: true});
    }
};

request.onerror = function (event) {
    console.log(`Error! Error code: ${event.target.errorcode}`);
};

request.onsuccess = function (event) {
    console.log(`Request success.`);
    db = event.target.result;
    
    if (navigator.online) {
        console.log(`Backend connection success. Communication with DB online!`)
        checkDatabase();
    }
}

const checkDatabase = () => {
    console.log(`Checking database...`);
    let transaction = db.transaction(`BudgetStore`, `readwrite`);
    const store = transaction.objectStore(`BudgetStore`);
    const getAll = store.getAll();
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch(`/api/transaction/bulk`, {
                method: `POST`,
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: `application/json, text/plain, */*,`,
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(response => {
                if (response.length !== 0) {
                    transaction = db.transaction(`BudgetStore`,`readwrite`);
                    const currentStore = transaction.objectStore(`BudgetStore`);
                    currentStore.clear();
                    console.log(`Store cleared!`);
                }
            });
        }
    };
}

const saveRecord = (record) => {
    console.log('Transaction saved!');
    const transaction = db.transaction('BudgetStore', 'readwrite');
    const store = transaction.objectStore('BudgetStore');
    store.add(record);
};

window.addEventListener('online', checkDatabase);
