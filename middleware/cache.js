const redis_client = require("../redis.js");

// Get cache
async function getCache(key) {
  let response = await new Promise((resolve, reject) => {
    redis_client.get(key, (err, result) => {
      if (err) throw err;
      console.log("Fetching data...");
      if (result != null) {
        resolve(result);
      } else {
        console.log("No result in data... back to .js...");
        resolve(false);
      }
    });
  }) 
  console.log(response);
  return response;
}

// Set cache
function setCache(key, data) {
  // Store object in Redis
  redis_client.set(key, JSON.stringify(data));
  console.log('Storing data in redis...');
}


// Clear cache
function clearCache() {
  console.log("Clearing cache...");
  redis_client.flushdb(function(err, result) {
    if (err) throw err;
    console.log(result);
  });
}

module.exports = { getCache, setCache, clearCache };
