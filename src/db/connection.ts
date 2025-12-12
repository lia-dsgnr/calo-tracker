/**
 * SQLite database connection manager for Calo Tracker.
 * Uses sql.js (WASM) for browser-based SQLite with IndexedDB persistence.
 */

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'

// Database file name in IndexedDB
const DB_NAME = 'calo_tracker_db'
const INDEXEDDB_STORE = 'calo_tracker_store'

let sqlPromise: Promise<SqlJsStatic> | null = null
let db: Database | null = null

/**
 * Initialises sql.js WASM module (singleton).
 * Loads WASM from public folder for reliable loading.
 */
async function getSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: () => '/sql-wasm.wasm',
    })
  }
  return sqlPromise
}

/**
 * Saves database to IndexedDB for persistence.
 * Called after each write operation to ensure durability.
 */
async function saveToIndexedDB(database: Database): Promise<void> {
  const data = database.export()
  const buffer = new Uint8Array(data)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXEDDB_STORE, 1)

    request.onupgradeneeded = () => {
      const idb = request.result
      if (!idb.objectStoreNames.contains(DB_NAME)) {
        idb.createObjectStore(DB_NAME)
      }
    }

    request.onsuccess = () => {
      const idb = request.result
      const transaction = idb.transaction(DB_NAME, 'readwrite')
      const store = transaction.objectStore(DB_NAME)
      store.put(buffer, 'database')
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Loads database from IndexedDB if it exists.
 * Returns null if no saved database found.
 */
async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXEDDB_STORE, 1)

    request.onupgradeneeded = () => {
      const idb = request.result
      if (!idb.objectStoreNames.contains(DB_NAME)) {
        idb.createObjectStore(DB_NAME)
      }
    }

    request.onsuccess = () => {
      const idb = request.result
      const transaction = idb.transaction(DB_NAME, 'readonly')
      const store = transaction.objectStore(DB_NAME)
      const getRequest = store.get('database')

      getRequest.onsuccess = () => {
        resolve(getRequest.result || null)
      }
      getRequest.onerror = () => reject(getRequest.error)
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Gets or creates the database connection.
 * Initialises schema if database is new.
 */
export async function getDatabase(): Promise<Database> {
  if (db) return db

  const SQL = await getSql()

  // Try to load existing database from IndexedDB
  const savedData = await loadFromIndexedDB()

  if (savedData) {
    db = new SQL.Database(savedData)
  } else {
    db = new SQL.Database()
  }

  return db
}

/**
 * Persists current database state to IndexedDB.
 * Should be called after write operations.
 */
export async function persistDatabase(): Promise<void> {
  if (!db) {
    throw new Error('Database not initialised')
  }
  await saveToIndexedDB(db)
}

/**
 * Executes a SQL statement that modifies data.
 * Automatically persists changes to IndexedDB.
 */
export async function runSQL(sql: string, params?: unknown[]): Promise<void> {
  const database = await getDatabase()
  database.run(sql, params as (string | number | null | Uint8Array)[])
  await persistDatabase()
}

/**
 * Executes a SQL query and returns all results.
 * For read-only operations (no persistence needed).
 */
export async function querySQL<T>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const database = await getDatabase()
  const statement = database.prepare(sql)

  if (params) {
    statement.bind(params as (string | number | null | Uint8Array)[])
  }

  const results: T[] = []
  while (statement.step()) {
    results.push(statement.getAsObject() as T)
  }
  statement.free()

  return results
}

/**
 * Executes a SQL query and returns the first result or null.
 */
export async function queryOneSQL<T>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const results = await querySQL<T>(sql, params)
  return results[0] || null
}

/**
 * Executes multiple SQL statements in a transaction.
 * Rolls back on error, persists on success.
 */
export async function transactionSQL(
  statements: Array<{ sql: string; params?: unknown[] }>
): Promise<void> {
  const database = await getDatabase()

  try {
    database.run('BEGIN TRANSACTION')

    for (const { sql, params } of statements) {
      database.run(sql, params as (string | number | null | Uint8Array)[])
    }

    database.run('COMMIT')
    await persistDatabase()
  } catch (error) {
    database.run('ROLLBACK')
    throw error
  }
}

/**
 * Closes the database connection and clears the singleton.
 * Useful for testing or cleanup.
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

/**
 * Exports database as Uint8Array for backup purposes.
 */
export async function exportDatabase(): Promise<Uint8Array> {
  const database = await getDatabase()
  return database.export()
}

/**
 * Gets approximate database size in bytes.
 */
export async function getDatabaseSize(): Promise<number> {
  const database = await getDatabase()
  const data = database.export()
  return data.length
}
