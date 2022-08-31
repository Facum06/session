const btnLogin = document.getElementById('btnLogin');
const statusFrm = document.getElementById('status');
const formLogUser = document.getElementById('formLogUser');
const formLogPass = document.getElementById('formLogPass');
let userLog = "";

window.addEventListener("load", function(event) {
    cheqUser();
});

function cheqUser(){
    fetch('/getCookies', {
        method: 'POST',        
      }).then(response => response.json())
      .catch(error => console.error('Error:', error))
      .then(response => {
        if (response.user !== "" && response.contador > 0){
            userLog = response.user;
            let vista = "";
            vista += "<h2 class=''>";
            vista += "Usuario logueado: <b class='mayus'>"+response.user+ "</b><br>Visitaste el sitio "+response.contador+ " veces";
            vista += "</h2>";
            vista += "<button id='btnCerrar' onclick='logout()' class='btn btn-outline-danger btn-block mb-4'>Cerrar Sesión</button>";            
            statusFrm.innerHTML = vista;            
            formLogUser.style.display = "none";
            formLogPass.style.display = "none";
            btnLogin.style.display = "none";
        }
    });
}

btnLogin.addEventListener('click', () => {
    let user = document.getElementById('user').value;
    let pass = document.getElementById('pass').value;
    if (!user){
        return alert('Falta user');
    }
    if (!pass){
        return alert('Falta password');
    }

    fetch('/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'user':  user, 'pass': pass})
      }).then(response => response.json())
      .catch(error => console.error('Error:', error))
      .then(response => {
        let vista = "";
        statusFrm.style.display = 'block';
        if (response.status === "1"){
            userLog = user;
            vista += "<h2 class='alert-success'>";
            vista += response.message;
            vista += "</h2>";
            vista += "<button id='btnCerrar' onclick='logout();' class='btn btn-outline-danger btn-block mb-4'>Cerrar Sesión</button>";            
            formLogUser.style.display = "none";
            formLogPass.style.display = "none";
            btnLogin.style.display = "none";
            statusFrm.innerHTML = vista;
        }else {
            vista += "<h2 class='alert-error'>";
            vista += response.message;
            vista += "</h2>";
            statusFrm.innerHTML = vista;
        }
    });
});

function logout(){
    fetch('/logout')
      .catch(error => console.error('Error:', error))
      .then(response => {        
        console.log(response);
    });

}