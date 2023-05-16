const fs = require("fs");
const url = require("url");

const serverHandler = (req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000, // 30 days
    /** add other headers as per requirement */
  };
  const reqUrl = req.url;
  if (reqUrl === "/categories") {
    res.writeHead(200, { ...headers, "Content-Type": "application/json" });
    fs.readFile("./data/categories.txt", "utf-8", (err, data) => {
      if (err) throw err;
      res.end(data);
    });
  } else if (reqUrl === "/active") {
    res.writeHead(200, { ...headers, "Content-Type": "application/json" });
    fs.readFile("./data/activeSatellites.txt", "utf-8", (err, data) => {
      if (err) throw err;
      res.end(data);
    });
  }
};

module.exports = { serverHandler };
