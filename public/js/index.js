document.addEventListener("DOMContentLoaded", function(x) {
  console.log("Loaded!");

  passportLogin = function(ev) {
    let user = document.getElementById("username").value,
      pass = document.getElementById("password").value;

    ev.preventDefault();
    console.log(`u: ${user} p: ${pass}`);

    var data = {
      username: user,
      password: pass
    }

    fetch("/login", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "same-origin",
      body: JSON.stringify(data)
    })
    .then(function(res) { return res.json(); })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(err) {
      console.log(err);
    })
  }
  
  document.getElementById("loginBtn").addEventListener("click", function(ev) { return passportLogin(ev) });
});