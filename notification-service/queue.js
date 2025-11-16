const redis = require("redis");

// Create Redis subscriber
const subscriber = redis.createClient();

// Subscribe to the channel where other services publish messages
subscriber.subscribe("recipe_notifications");

module.exports = subscriber;
