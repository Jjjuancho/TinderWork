
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var app = new Framework7({
  // App root element
  root: '#app',
  // App Name
  name: 'My App',
  // App id
  id: 'com.myapp.test',
  // Enable swipe panel
  panel: {
    swipe: 'left',
  },
  // Add default routes
  routes: [
    {
      path: '/chat/',
      url: 'chat.html',
    },
    {
      path: '/regform/',
      url: 'formulario.html',
    },
    {
      path: '/regini/',
      url: 'Iniciosesion.html',
    },
    {
      path: '/index/',
      url: 'index.html',
    },
    {
      path: '/pbuscador/',
      url: 'Paginabuscador.html',
    },
    {
      path: '/pprestador/',
      url: 'Paginaprestador.html',
    },
  ]
  // ... other parameters
});

var mainView = app.views.create('.view-main');

//CUANDO EL DISPOSITIVO CARGA LA APP
$$(document).on('deviceready', function () {
  console.log("Device is ready!");

  $$('#casa').click();
});


//VARIABLES PARA EL REGISTRO
var db = firebase.firestore();
var colUsuarios = db.collection("Usuarios");

var nombre, apellido, telefono, fechanacimiento, genero, tipousuario;

var recargo = 0


//FORMULARIO DE REGISTRO
$$(document).on('page:init', '.page[data-name="regform"]', function (e) {

  console.log($$('#rus').val());


  $$("#rok").on("click", function () {


    var varmail = $$('#email').val()
    var varpw = $$('#pw').val()


    console.log(varmail)
    console.log(varpw)

    firebase.auth().createUserWithEmailAndPassword(varmail, varpw)
      .then((userCredential) => {
        // Signed in

        // ACA ESTA CREADO OK EL USUARIO EN AUTH

        // VAMOS A GUARDAR SUS DATOS EN LA DB---> FIRESTORE
        nombre = $$("#rNombre").val();
        apellido = $$("#rApellido").val();
        telefono = $$("#rTelefono").val();
        fechanacimiento = $$("#rfe").val();
        genero = $$("#rgen").val();
        tipousuario = $$("#rus").val();
        rubro = $$("#rubro").val();

        var datos = {
          nombre: nombre,
          apellido: apellido,
          telefono: telefono,
          fechanacimiento: fechanacimiento,
          genero: genero,
          tipousuario: tipousuario,
          rubro: rubro
        }

        colUsuarios.doc(varmail).set(datos)
          .then(() => {
            console.log("datosok");
            mainView.router.navigate('/regini/')
          })
          .catch((error) => {

          })


        var user = userCredential.user;
        console.log("ok")
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
        console.error(errorMessage)

      });
  })

  var bool = false;

  $$('#rus').change(function () {
    bool = !bool;

    if (bool) {
      $$('#mas').css('display', 'block');
    } else {
      $$('#mas').css('display', 'none');
    }
  });

})


var db = firebase.firestore();
var colUsuario = db.collection("Usuarios");

//INICIO DE SESION
$$(document).on('page:init', '.page[data-name="regini"]', function (e) {

  $$("#rokk").on("click", function () {

    var varmaili = $$('#emaili').val()
    var varpwi = $$('#pwi').val()

    console.log(varmaili)
    console.log(varpwi)


    firebase.auth().signInWithEmailAndPassword(varmaili, varpwi)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        // ...
        console.log('ok')

        claveDeColeccion = varmaili;

        var docRef = colUsuario.doc(claveDeColeccion);

        docRef.get().then((doc) => {
          if (doc.exists) {
            console.log("Document data:", doc.data());

            console.log(doc.id);
            console.log(doc.data().nombre);
            console.log(doc.data().tipousuario);

            if (doc.data().tipousuario == "Buscador de servicios") {
              mainView.router.navigate('/pbuscador/');
            } else {
              mainView.router.navigate('/pprestador/');
            }


          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }).catch((error) => {
          console.log("Error getting document:", error);
        });

      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error(errorMessage)
      });

  })
})

//PAGINA BUSCADOR DE SERVICIOS
$$(document).on('page:init', '.page[data-name="pbuscador"]', function (e) {

  //OCULTA BOTONES INICIO Y REGISTRO, MUESTRA BOTON CERRAR SESION
  $$("#nbini").css("display", "none");
  $$("#nbreg").css("display", "none");
  $$("#nbcer").css("display", "block");


  //MUESTRA TODOS LOS USUARIOS PRESTADORES DE SERVICIOS
  var t = "";
  colUsuario.where('tipousuario', '==', 'Prestador de servicios').get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        elId = doc.id;
        elNombre = doc.data().nombre;

        console.log(elNombre)

        t +=
          `<div class="card">
            <div class="card-header">`+ doc.data().nombre + ` ` + doc.data().apellido + `</div>
            <div class="card-footer">`+ doc.data().rubro + `</div>
            <input type="button" value="contactar" class="button button-fill convert-form-to-data" onclick="chatCon('` + doc.id + `')" id=` + doc.id + `>
            </div> `;


      });

      $$("#contResultados").html(t);

    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });


  //CERRAR SESION
  $$("#nbcer").on("click", function () {
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
      mainView.router.navigate('/index/');
      console.log("sesión cerrada");
      $$("#nbini").css("display", "block");
      $$("#nbreg").css("display", "block");
      $$("#nbcer").css("display", "none");

    }).catch((error) => {
      // An error happened.
    });
  })


})


var botonid = "";
//FILTRAR PRESTADORES POR RUBRO
$$(document).on('change', "#rubros", function () {

  //SE VACIA LA LISTA DE PRESTADORES
  $$("#contResultados").empty();

  //SE MUESTRAN LOS PRESTADORES DEL RUBRO SELECCIONADO
  var rubs = $$("#rubros").val();
  var g = "";

  colUsuario.where('rubro', '==', rubs).get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {

        botonid = doc.id
        console.log(botonid)

        g +=
          `<div class="card">
            <div class="card-header">`+ doc.data().nombre + ` ` + doc.data().apellido + `</div>
            <div class="card-footer">`+ doc.data().rubro + `</div>
            <input type="button" value="contactar" class="button button-fill convert-form-to-data puta" onclick="chatCon('` + doc.id + `')" id=` + doc.id + `>
            </div> `;


      });

      $$("#contResultados").html(g);

    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
})


//PAGINA PRESTADOR
$$(document).on('page:init', '.page[data-name="pprestador"]', function (e) {
  $$("#nbini").css("display", "none");
  $$("#nbreg").css("display", "none");
  $$("#nbcer").css("display", "block");

  $$("#nbcer").on("click", function () {
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
      mainView.router.navigate('/index/');
      console.log("sesión cerrada");
      $$("#nbini").css("display", "block");
      $$("#nbreg").css("display", "block");
      $$("#nbcer").css("display", "none");

    }).catch((error) => {
      // An error happened.
    });
  })

  //CHAT
  var txtMessage = $$('#mensaje');
  var btnSend = $$('#botonm');
  var bChat = $$('#guardarchat');
  var user = firebase.auth().currentUser;
  colUsuario.doc(user.email).get().then((doc) => {
    if (doc.exists) {
      btnSend.on('click', function (e) {
        if (txtMessage.val() !== '') {
          var message = txtMessage.val();
          var completeName = doc.data().nombre + ' ' + doc.data().apellido;

          txtMessage.val('');

          firebase.database().ref('chat').push({
            nombre: completeName,
            mensaje: message
          })
        }
      })

      firebase.database().ref('chat').on('value', function (snapshot) {
        var html = '';

        snapshot.forEach(function (e) {
          var element = e.val();
          var name = element.nombre;
          var message = element.mensaje;
          var completeName = doc.data().nombre + ' ' + doc.data().apellido;

          if (name === completeName) {
            html += `<p class="message-chat user-message"><b> ${name}: </b> ${message} </p>`;
          } else {
            html += `<p class="message-chat"><b> ${name}: </b> ${message} </p>`;
          }

        })

        bChat.html(html);
      })
    } else {
      // doc.data() will be undefined in this case
      // "No such document!"
    }
  }).catch((error) => {
    // "Error getting document"
  });

})


//REDIRECCIONAMIENTO A CHAT
function chatCon(mailUsuario) {
  botonid = mailUsuario
  console.log(botonid)
  mainView.router.navigate('/chat/');

}


//PAGE INIT CHAT
$$(document).on('page:init', '.page[data-name="chat"]', function (e) {



  var txtMessage = $$('#mensaje');
  var btnSend = $$('#botonm');
  var bChat = $$('#guardarchat');
  var user = firebase.auth().currentUser;
  colUsuario.doc(user.email).get().then((doc) => {
    if (doc.exists) {
      btnSend.on('click', function (e) {
        if (txtMessage.val() !== '') {
          var message = txtMessage.val();
          var completeName = doc.data().nombre + ' ' + doc.data().apellido;

          txtMessage.val('');

          firebase.database().ref('chat').push({
            nombre: completeName,
            mensaje: message
          })
        }
      })

      firebase.database().ref('chat').on('value', function (snapshot) {
        var html = '';

        snapshot.forEach(function (e) {
          var element = e.val();
          var name = element.nombre;
          var message = element.mensaje;
          var completeName = doc.data().nombre + ' ' + doc.data().apellido;

          if (name === completeName) {
            html += `<p class="message-chat user-message"><b> ${name}: </b> ${message} </p>`;
          } else {
            html += `<p class="message-chat"><b> ${name}: </b> ${message} </p>`;
          }

        })

        bChat.html(html);
      })
    } else {
      // doc.data() will be undefined in this case
      // "No such document!"
    }
  }).catch((error) => {
    // "Error getting document"
  });

})
