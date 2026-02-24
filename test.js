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
