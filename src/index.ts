const schedule = require("node-schedule")
const fetch = require("node-fetch")
const nodemailer = require("nodemailer")

require("dotenv").config()

export const app = async () => {
  console.log("running the app")
  schedule.scheduleJob("* * 23 * 0", async function() {
    const d = new Date()
    console.log(`checking the weather, current day is ${d.getDate()}`)
    const weatherIsOkay: "nogo" | "go" | false = await fetch(
      `http://api.weatherunlocked.com/api/forecast/52.7024359,12.4279267?app_id=${process.env.WEATHER_APP_ID}&app_key=${process.env.WEATHER_APP_KEY}`
    )
      .then(res => res.json())
      .then(json => {
        const friday = json.Days[5]
        if (friday) {
          const beforeMidnight = friday.Timeframes.find(
            val => val.time === 2200
          )

          if (
            beforeMidnight.wx_code === 0 &&
            beforeMidnight.cloudtotal_pct < 10
          ) {
            return "go"
          }
          return "nogo"
        }
      })
      .catch(() => false)

    if (weatherIsOkay === "go" || weatherIsOkay === "nogo") {
      console.log(`Weather is ${weatherIsOkay === "go" ? "good!" : "meh"}`)
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "tempelmanjorrit@gmail.com",
          pass: process.env.GMAIL_KEY
        }
      })

      var mailOptions = {
        from: "tempelmanjorrit@gmail.com",
        to: "tempelmanjorrit@gmail.com",
        subject:
          weatherIsOkay === "go"
            ? "💫⭐Stargazing weekend??⭐💫"
            : "Weather doesn't look to good for stargazing",
        html:
          weatherIsOkay === "go"
            ? "Hi! <br /><br />Looks like stargazing could be good this weekend in Berlin, better check it out!<br /> <br />Cheers"
            : "Hi! <br /><br />Looks like stargazing isn't a very good idea this weekend in Berlin...<br /> <br />Cheers"
      }

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log("Email sent: " + info.response)
        }
      })
    }
  })
}

app()
