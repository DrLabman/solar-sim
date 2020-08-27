"use strict";

const path = require("path");

const restana = require("restana");
const bodyParser = require("body-parser")
const files = require("serve-static");
const morgan = require("morgan");


const net = require("net");
const cache = {
    data: null
};

const fileFolder = "src";

const service = restana({});
service.use(bodyParser.json());

service.use(morgan());
service.use(files(path.join(__dirname, fileFolder)));
service.get("/data", function (req, res) {
    res.send(cache.data);
});

service.post("/cmd", async function (req, res) {
    const data = await fetchData(req.body);
    res.send(JSON.stringify(data));
});

service.get("/star", function (req, res) {
    const calculateLuminosity = function (mass) {
        if (mass < 0.20) {
            // Too small to be a star, no hydrogen fusion
            return 0;
        } else if (mass < 0.85) {
            return -141.7 * Math.pow(mass, 4) + 232.4 * Math.pow(mass, 3) - 129.1 * Math.pow(mass, 2) + 33.29 * mass + 0.215;
        } else if (mass < 2) {
            return Math.pow(mass, 4);
        } else if (mass < 55) {
            return 1.4 * Math.pow(mass, 3.5);
        } else {
            // rare stars in main sequence and larger than this (collided massive stars which didn't explode)
            return 32000 * mass
        }
    }

    const radius = Math.pow(mass, 0.85);
    const luminosity = calculateLuminosity(mass);
    const temp = Math.pow(luminosity / 4 * Math.PI * radius * radius, 4);
    const temperature = Math.pow(luminosity, -4) / Math.pow(radius, -2) * 5800;
    const temp3 = 1/Math.pow(radius / Math.sqrt(luminosity), 2) * 5800;

    console.log("Mass", mass);
    console.log("Radius", radius);
    console.log("Luminosity", luminosity);
    console.log("Temperature", temp, temperature, temp3);
});

const port = 8888;
service.start(port);
console.log(`Server started on http://localhost:${port}/`);
