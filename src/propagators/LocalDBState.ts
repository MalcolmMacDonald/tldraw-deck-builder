import {StoreSnapshot, TLRecord} from "tldraw";
import {name, version} from '../../package.json';

const dbName = `TLDRAW_DOCUMENT_v2${name}-${version}`;
export type DBState = {
    snapshot: StoreSnapshot<TLRecord>;
    id: string;
    updatedAt: number;
};

function getDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {


        var request = indexedDB.open(dbName);
        request.onerror = function (event) {
            console.error('Database error:', event);
            reject(event);
        };
        request.onsuccess = function (event) {
            // @ts-ignore
            var db: IDBDatabase = event.target.result;
            console.log('Database opened successfully:', db);
            resolve(db);
        };
    });
}


function getStoredState(db: IDBDatabase): Promise<DBState | undefined> {
    return new Promise<DBState>((resolve, reject) => {
        const request = db.transaction(['session_state'], 'readonly')
            .objectStore('session_state')
            .getAll();
        request.onerror = function (event) {
            console.error('Error getting stored state:', event);
            reject(event);
        }
        request.onsuccess = function (event) {

            // @ts-ignore
            const allStates = event.target.result as DBState[];

            if (allStates.length === 0) {
                console.warn('No states found in IndexedDB');
                resolve(undefined);
                return;
            }

            const newestState = allStates.reduce((latest, current) => {
                return current.updatedAt > latest.updatedAt ? current : latest;
            }, allStates[0]);
            resolve(newestState);
        }

    });
}

function dbIsAvailable(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        indexedDB.databases().then((databases) => {
            const dbExists = databases.some(db => db.name === dbName);
            console.log('Database exists:', dbExists);
            resolve(dbExists);
        });
    });
}

export async function GetDBSnapshot(): Promise<DBState | undefined> {
    if (!(await dbIsAvailable())) {
        return undefined;
    }
    var db = await getDB();
    return await getStoredState(db);
}