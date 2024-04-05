// const redis = require("redis");
// const mongoFunctions = require("./mongoFunctions");
// const sendAlerts = require("./telegramBot");
// const [password, host, port] = [
//   process.env.REDIS_PASS,
//   process.env.REDIS_HOST,
//   process.env.REDIS_PORT,
// ];
// const redisClient = redis.createClient({
//   password,
//   socket: {
//     host,
//     port,
//   },
// });
// (async () => await redisClient.connect())();
// redisClient
//   .on("connect", () => {
//     console.log("Redis Connected");
//   })
//   .on("error", (err) => {
//     sendAlerts("Redis Connection Failed");
//     console.log("Redis Connection Failed", err.message);
//   })
//   .on("end", () => {
//     console.log("Redis Connection Disconnected");
//   });
// // function to set expire time to key
// async function setExpire(key) {
//   // get ttl time
//   let time = await redisClient.TTL(key);
//   // set expire time to key(if key has no expire)
//   if (time <= -1) await redisClient.expire(key, 86400);
// }
// module.exports = {
//   // to set a key
//   set: async (key, value) => {
//     const response = await redisClient.set(key, JSON.stringify(value));
//     await setExpire(key); // set expire time
//     return response;
//   },
//   // to set a key with expire time
//   setEx: async (key, value, time) =>
//     await redisClient.setEx(key, time, JSON.stringify(value)),
//   // to get a key
//   get: async (key, collection, filter = {}) => {
//     // check key
//     const keyExists = await redisClient.exists(key);
//     if (keyExists) {
//       // get result from redis
//       const result = await redisClient.get(key);
//       if (result) return JSON.parse(result);
//     }
//     // get result from db
//     if (collection) {
//       const result = await mongoFunctions.find(collection, filter);
//       if (!result || !result.length) return null;
//       // set result to redis
//       await redisClient.set(key, JSON.stringify(result));
//       await setExpire(key); // set expire time
//       return result;
//     }
//     return null;
//   },
//   // to check key exists
//   exists: async (key) => await redisClient.exists(key),
//   // to set a field to hash
//   hSet: async (key, field, value) => {
//     const response = await redisClient.hSet(key, field, value);
//     await setExpire(key); // set expire time
//     return response;
//   },
//   // to get a field from hash
//   hGet: async (key, field, collection = "", filter = "") => {
//     const keyExists = await redisClient.exists(key);
//     if (keyExists) {
//       // get result
//       const result = JSON.parse(await redisClient.hGet(key, field));
//       if (result) return result;
//     }
//     // get result from db
//     if (collection && filter) {
//       const result = await mongoFunctions.findOne(collection, filter);
//       if (!result) return null;
//       // save result to redis
//       await redisClient.hSet(key, field, JSON.stringify(result));
//       return result;
//     }
//     return null;
//   },
//   // to delte field from hash
//   hDel: async (key, field) => await redisClient.hDel(key, field),
//   // to delete a key
//   delete: async (key) => await redisClient.del(key),
//   // to reset all redis cache
//   flushAll: async () => await redisClient.flushAll(),
// };
