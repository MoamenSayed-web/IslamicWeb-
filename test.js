<<<<<<< HEAD
const https = require("https");

https.get(
  "https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json",
  (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      let json = JSON.parse(data);
      json.forEach((item) => {
        console.log(item.category);
      });
    });
  },
);
=======
const https = require("https");

https.get(
  "https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json",
  (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      let json = JSON.parse(data);
      json.forEach((item) => {
        console.log(item.category);
      });
    });
  },
);
>>>>>>> 7194fd316f5879c5a1b0c0285d02ac58ee0672e1
