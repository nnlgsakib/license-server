import level from 'level'

export const license_db = level('./db/license_db', {
  valueEncoding: 'json',

  // Enable compression for efficient storage on disk
  compression: true,

  // Increase cache size to improve read efficiency
  cacheSize: 128 * 1024 * 1024, // 128 MB cache size, adjust according to available memory

  // Boost write performance with a larger write buffer
  writeBufferSize: 32 * 1024 * 1024, // 32 MB write buffer

  // Optimal block size for fast reads; smaller size helps when accessing small data chunks
  blockSize: 8 * 1024, // 8 KB block size for faster reads with smaller chunks

  // File size balance to reduce file merges without overwhelming the file system
  maxFileSize: 256 * 1024 * 1024, // 256 MB max file size for fewer merges

  // Increase file handles for heavy workloads; ensure OS supports this value
  maxOpenFiles: 2048, // 2048 open files

  // Enable memory-mapped I/O for efficient large dataset handling
  useMmap: true,

  // Enable dynamic level sizing to optimize compaction and level distribution for larger datasets
  levelCompactionDynamicLevelBytes: true,

  // Bloom filter improves read performance by reducing disk access on non-existent keys
  bloomFilterBitsPerKey: 16, // Higher bits per key for larger datasets

  // Separate keys to handle unique sorting requirements efficiently
  separator: '\u0000',

  // Compaction tuning to handle heavy writes without performance drops
  disableCompactionBackpressure: true, // Disables compaction backpressure to prevent write stalls
  minCompactionBytes: 4 * 1024 * 1024, // 4 MB minimum compaction to prevent excessive compaction overhead
  maxCompactionBytes: 64 * 1024 * 1024, // 64 MB compaction size to balance between compaction speed and resource use

  // Enhanced logging for better insight during heavy loads
  logger: console,
})

// In-memory cache (can be extended with LRU eviction)
const cache = new Map<string, any>()

// Set a cache limit (optional, for LRU or fixed-size cache)
const CACHE_LIMIT = 1000

// Helper to manage cache size
function evictCacheIfNecessary() {
  if (cache.size > CACHE_LIMIT) {
    const firstKey: any = cache.keys().next().value
    cache.delete(firstKey) // Evict the least recently used item
  }
}

export async function set<T>(key: string, value: T): Promise<void> {
  // Write the value to LevelDB
  await license_db.put(key, value)

  // Update the cache
  cache.set(key, value)

  // Evict items from cache if necessary
  evictCacheIfNecessary()
}

export async function get<T>(key: string): Promise<T | null> {
  // First, check the in-memory cache
  if (cache.has(key)) {
    return cache.get(key) as T
  }

  // If not in cache, read from LevelDB
  try {
    const value = await license_db.get(key)
    cache.set(key, value) // Cache the result
    evictCacheIfNecessary() // Evict items from cache if necessary
    return value
  } catch (error: any) {
    if (error.type === 'NotFoundError') {
      return null
    } else {
      throw error
    }
  }
}

export async function del(key: string): Promise<void> {
  // Delete from LevelDB
  await license_db.del(key)

  // Remove from cache
  cache.delete(key)
}

export async function batch(operations: any[]): Promise<void> {
  // Perform batch write to LevelDB
  await license_db.batch(operations)

  // Update the cache with batch operations
  for (const op of operations) {
    const {type, key, value} = op
    if (type === 'put') {
      cache.set(key, value)
    } else if (type === 'del') {
      cache.delete(key)
    }
  }

  // Evict items from cache if necessary
  evictCacheIfNecessary()
}

export function getAllWithPrefix<T>(prefix: string): Promise<{key: string; value: T}[]> {
  return new Promise((resolve, reject) => {
    const dataArray: {key: string; value: T}[] = []
    license_db
      .createReadStream({
        gt: prefix,
        lt: prefix + '\uFFFF',
      })
      .on('data', function (data) {
        dataArray.push({
          key: data.key as string,
          value: data.value as T, // No need to parse since valueEncoding: 'json' is used
        })
      })
      .on('error', function (err) {
        reject(err)
      })
      .on('end', function () {
        resolve(dataArray)
      })
  })
}

export async function getAllLicenses<T>(): Promise<{key: string; value: T}[]> {
  return getAllWithPrefix<T>('license:')
}
