// tutor helped set up lines 2 - 11 and the comments
// const indexedDB = 
// window.indexedDB || 
// window.mozIndexedDB ||
// window.webkitIndexedDB ||
// window.msIndexedDB ||
// window.shimIndexedDB;

let db;

const request = indexedDB.open("budget", 1)

// request.onupgradeneeded
request.onupgradeneeded = function (e) {
    
  const db = e.target.result;
  db.createObjectStore('budgetDiff', { autoIncrement: true });
};

// request.onsuccess
request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};
  
// request.onerror
request.onerror = function (e) {
    console.log(`Woops! ${e.target.errorCode}`);
};

  // function saveRecord
const saveRecord = (record) => {
  console.log('Save record invoked');
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(['budgetDiff'], 'readwrite');

  // Access your BudgetStore object store
  const store = transaction.objectStore('budgetDiff');

  // Add record to your store with add method.
  store.add(record);
};

// function checkDatabase
function checkDatabase() {
  console.log('check db invoked');
  
    // Open a transaction on your BudgetStore db
  let transaction = db.transaction(['budgetDiff'], 'readwrite');
  
    // access your BudgetStore object
  const store = transaction.objectStore('budgetDiff');
  
    // Get all records from store and set to a variable
  const getAll = store.getAll();
  
    // If the request was successful
  getAll.onsuccess = function () {
      // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
        },
      })
      .then((response) => response.json())
      .then(() => {
              // Open another transaction to BudgetStore with the ability to read and write
        const transaction = db.transaction(['budgetDiff'], 'readwrite');
              // Assign the current store to a variable
        const currentStore = transaction.objectStore('budgetDiff');
              // Clear existing entries because our bulk add was successful
        currentStore.clear();
        console.log('Clearing store 🧹');
      });
    }
  };
}
  
window.addEventListener("online", checkDatabase);