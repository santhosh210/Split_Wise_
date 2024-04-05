const axios = require("axios");
const token = "6812596204:AAHfJ9dgEqVejGeUJ45bKcrUAE0NOPdZFCI";

const users = {
  santhosh: "1236834354",
  // sudheer: "6762472682",
  // satish: "1321350229",
};

function sendMessage(chatId, message) {
  const apiUrl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(
    message
  )}`;

  axios
    .post(apiUrl)
    .then((response) => {
      // console.log("Message sent successfully:", response.data);
      response.data;
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
}

function sendAlerts(message) {
  for (const user in users) {
    if (Object.hasOwnProperty.call(users, user)) {
      const chatId = users[user];
      sendMessage(chatId, message);
    }
  }
}
sendAlerts("Hello from the bot!");
module.exports = sendAlerts;
