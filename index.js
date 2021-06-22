const http = require("http")
const express = require("express")
const router = express.Router()
const app = express()
const server = http.createServer(app)
const PORT = 5000

const defaultAPIKEY = "NUUCSIE"
var userlist = {}

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("/api/", router)

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

router.post("/login/", (req, res) => {
  let body = req.body
  let data = JSON.parse(body.data)
  let account = data.account
  let password = data.password

  console.log(`[account]: ${account}`)
  console.log(`[password]: ${password}`)

  let state = true
  let UID = Object.keys(userlist).length

  // UID 重複 > 自動順位
  if (Object.keys(userlist).includes(UID)) ++UID

  // 檢查使用者名稱重複
  Object.keys(userlist).forEach( (user, index) => {
    if ( user["account"] == account ) {
      state = false
      return
    }
  })

  if (state) {
    // 登記使用者資訊
    userlist[UID] = { 'account': account, 'password': password }

    // 紀錄cookie
    res.cookie("apiKey", defaultAPIKEY)
    res.cookie("UID", UID)
    res.cookie("account", account)
    res.cookie("loginState", true)
  }

  res.send(JSON.stringify({
    "state": state,
    "message": state ? "login success" : "login failed",
  }))
})

router.post("/logout/", (req, res) => {
  let body = req.body
  let data = JSON.parse(body.data)
  let apiKey = data.apiKey
  let UID = data.UID
  let account = data.account

  let state = true

  if (apiKey != defaultAPIKEY) state = false // 檢查apiKey
  else if ( Object.keys(userlist).includes(UID) ) { // 檢查UID
    if ( userlist[UID]["account"] == account ) { // 檢查account
      delete userlist[UID] // 移除使用者資訊
    } else {
      state = false
    }
  }

  if (state) { // 清除cookie
    res.clearCookie("apiKey")
    res.clearCookie("UID")
    res.clearCookie("account")
    res.cookie("loginState", false)
  }

  res.send(JSON.stringify({
    "state": state,
    "message": state ? "logout success" : "logout failed"
  }))
})

router.post("/userlist/", (req, res) => {
  let body = req.body
  let data = JSON.parse(body.data)
  let apiKey = data.apiKey
  
  let state = true
  
  if (apiKey!=defaultAPIKEY) state = false

  res.send(JSON.stringify({
    "state": state,
    "message": state ? "access success" : "access deny",
    "result": state ? JSON.stringify({ "userlist": userlist }) : "{}"
  }))
})

server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`)
})