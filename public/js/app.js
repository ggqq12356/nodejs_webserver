const host = "http://localhost:5000"

function checkPayload(payload) {
  let state = true
  Object.values(payload).forEach( value => {
    if (value=="" || value==undefined) {
      state = false
      Swal.fire({
        "title": "[Error]",
        "text": "資料有錯誤",
        "icon": "error"
      })
      return
    }
  })
  return state
}

function loadInfo() {
  document.querySelector("#infoForm").innerHTML = `
  <h3>UID:${Cookies.get("UID")}</h3>
  <h3>帳號:${Cookies.get("account")}</h3>
  <input type="button" value="顯示使用者清單" onclick="getUserList()" class="btn btn-outline-primary">
  <input type="button" value="登出" onclick="logout()" class="btn btn-outline-primary">
  `
}

function login() {
  let account = document.querySelector("#account").value
  let password = document.querySelector("#password").value
  let payload = { account, password }
  console.log(`[payload]: ${JSON.stringify(payload)}`)

  if (!checkPayload(payload)) return

  axios.post(host + '/api/login', {
    data: JSON.stringify(payload),
    dataType: "application/json"
  })
  .then( res => {
    let data = res.data
    console.log(`[data]:`)
    console.log(data)
    if (data.state) {
      apiKey = data.apiKey
      Swal.fire({
        title: '[Success]',
        text: '登入成功!',
        icon: 'success',
      })
      document.querySelector("#account").value = ""
      document.querySelector("#password").value = ""
      document.querySelector("#loginForm").style.display = "none"
      document.querySelector("#infoForm").style.display = "inline-block"
      loadInfo()
    } else {
      Swal.fire({
        title: '[Failed]',
        text: '登入失敗!',
        icon: 'error',
      })
      document.querySelector("#password").value = ""
    }
  })
  .catch( err => {
    console.log(`[err]: ${err}`)
  })
}

function logout() {
  let apiKey = Cookies.get("apiKey")
  let UID = Cookies.get("UID")
  let account = Cookies.get("account")
  let payload = { apiKey, UID, account }
  console.log(`[payload]: ${JSON.stringify(payload)}`)

  if (!checkPayload(payload)) return

  axios.post(host + '/api/logout', {
    data: JSON.stringify(payload),
    dataType: "application/json"
  })
  .then( res => {
    let data = res.data
    console.log(`[data]:`)
    console.log(data)
    if (data.state) {
      apiKey = ""
      Swal.fire({
        title: '[Success]',
        text: '登出成功!',
        icon: 'success',
      })
      document.querySelector("#loginForm").style.display = "inline-block"
      document.querySelector("#infoForm").style.display = "none"
    } else {
      Swal.fire({
        title: '[Failed]',
        text: '登出失敗!',
        icon: 'error',
      })
    }
  })
  .catch( err => {
    console.log(`[err]: ${err}`)
  })
}

function getUserList() {
  let apiKey = Cookies.get("apiKey")
  let loginState = Cookies.get("loginState")
  if (!loginState) {
    Swal.fire({
      title: '[Error]',
      text: '尚未登入!',
      icon: 'warning',
    })
    return
  }
  let payload = { apiKey }
  console.log(`[payload]: ${JSON.stringify(payload)}`)

  if (!checkPayload(payload)) return
  
  axios.post(host + '/api/userlist', {
    data: JSON.stringify(payload),
    dataType: "application/json"
  })
  .then( res => {
    let data = res.data
    console.log(`[data]:`)
    console.log(data)
    if (data.state) {
      
      let result = JSON.parse(data.result)
      console.log(`[result]:`)
      console.log(result)

      let userlist = result["userlist"]
      let content = `
        <tr>
          <th>#</th>
          <th>UID</th>
          <th>帳號</th>
          <th>密碼</th>
        </tr>
      `
      Object.keys(userlist).forEach( (UID, index) => {
        let account = userlist[UID].account
        let password = userlist[UID].password
        content += `
          <tr>
            <td>${index+1}</td>
            <td>${UID}</td>
            <td>${account}</td>
            <td>${password}</td>
          </tr>
        `
      })

      Swal.fire({
        html: `
          <table class="table">
            ${content}
          </table>
        `
      })

    } else {
      Swal.fire({
        title: '[Failed]',
        text: '存取失敗!',
        icon: 'error',
      })
    }
  })
  .catch( err => {
    console.log(`[err]: ${err}`)
  })
}

function init() {
  if (Cookies.get("loginState")=="false") {
    document.querySelector("#loginForm").style.display = "inline-block"
    document.querySelector("#infoForm").style.display = "none"
    return
  }
  if ( Cookies.get("UID") || Cookies.get("username") || Cookies.get("loginState") ) {
    document.querySelector("#loginForm").style.display = "none"
    document.querySelector("#infoForm").style.display = "inline-block"
    loadInfo()
  }
}

function main() {
  console.log('加載完成')
  init()
}

document.addEventListener("DOMContentLoaded", main)