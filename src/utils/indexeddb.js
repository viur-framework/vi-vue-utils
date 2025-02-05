function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('vueutils', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('cache')) {
                db.createObjectStore('cache', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function persistToIndexedDB(storeId, state) {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction('cache', 'readwrite');
      const store = transaction.objectStore('cache');
      store.put({ id: storeId, state });
    } catch (error) {
      console.error(error);
    }
  }
  
async function loadStateFromIndexedDB(storeId) {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction('cache', 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.get(storeId);
        return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            resolve(event.target.result ? event.target.result.state : null);
        };
        request.onerror = (event) => reject(event.target.error);
        });
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const indexedDBStorage = {
    getItem(key) {
        return null;
    },
    setItem(key, value) {
        //write to db
        persistToIndexedDB(key, value)
    },
    removeItem(key) {
    }
  };


export function setupIndexDBStorage(store,deserializer) {
    loadStateFromIndexedDB(store.$id).then( async (savedState) => {
        if (savedState) {
            //load on init
            store.$patch(deserializer(savedState));
        }
    }).catch((error) => {
        console.error( error);
    });
}