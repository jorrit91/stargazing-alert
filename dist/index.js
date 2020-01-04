"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schedule = require("node-schedule");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
require("dotenv").config();
exports.app = () => __awaiter(this, void 0, void 0, function* () {
    console.log("running the app");
    schedule.scheduleJob("* * 23 * 0", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const d = new Date();
            console.log(`checking the weather, current day is ${d.getDate()}`);
            const weatherIsOkay = yield fetch(`http://api.weatherunlocked.com/api/forecast/52.7024359,12.4279267?app_id=${process.env.WEATHER_APP_ID}&app_key=${process.env.WEATHER_APP_KEY}`)
                .then(res => res.json())
                .then(json => {
                const friday = json.Days[5];
                if (friday) {
                    const beforeMidnight = friday.Timeframes.find(val => val.time === 2200);
                    if (beforeMidnight.wx_code === 0 &&
                        beforeMidnight.cloudtotal_pct < 10) {
                        return "go";
                    }
                    return "nogo";
                }
            })
                .catch(() => false);
            if (weatherIsOkay === "go" || weatherIsOkay === "nogo") {
                console.log(`Weather is ${weatherIsOkay === "go" ? "good!" : "meh"}`);
                var transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "tempelmanjorrit@gmail.com",
                        pass: process.env.GMAIL_KEY
                    }
                });
                var mailOptions = {
                    from: "tempelmanjorrit@gmail.com",
                    to: "tempelmanjorrit@gmail.com",
                    subject: weatherIsOkay === "go"
                        ? "💫⭐Stargazing weekend??⭐💫"
                        : "Weather doesn't look to good for stargazing",
                    html: weatherIsOkay === "go"
                        ? "Hi! <br /><br />Looks like stargazing could be good this weekend in Berlin, better check it out!<br /> <br />Cheers"
                        : "Hi! <br /><br />Looks like stargazing isn't a very good idea this weekend in Berlin...<br /> <br />Cheers"
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log("Email sent: " + info.response);
                    }
                });
            }
        });
    });
});
exports.app();
//# sourceMappingURL=index.js.map