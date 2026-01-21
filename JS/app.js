// app.js — lógica de la wallet (simple, estilo clase)

function initWallet() {
  // Si no existe, crear desde cero
  if (!localStorage.getItem("wallet")) {
    localStorage.setItem(
      "wallet",
      JSON.stringify({
        loggedIn: false,
        balance: 60000,
        transactions: [],
        contacts: [
          {
            name: "Peter Veneno",
            rut: "12.345.678-5",
            alias: "john.doe",
            bank: "ABC Bank",
          },
          {
            name: "Patrica Cofre",
            rut: "18.222.333-4",
            alias: "janel.perez",
            bank: "Banco Estado",
          },
          {
            name: "María López",
            rut: "9.876.543-2",
            alias: "maria.lopez",
            bank: "BCI",
          },
          {
            name: "Pedro González",
            rut: "20.111.222-3",
            alias: "pedro.gonzalez",
            bank: "Santander",
          },
        ],
        selectedContact: -1,
      }),
    );
    return;
  }

  var w = JSON.parse(localStorage.getItem("wallet"));

  if (w && Array.isArray(w.contacts)) {
    w.contacts.forEach(function (c) {
      if (!c.rut && c.cbu) {
        c.rut = c.cbu;
        delete c.cbu;
      }
    });
    localStorage.setItem("wallet", JSON.stringify(w));
  }
}

function getWallet() {
  return JSON.parse(localStorage.getItem("wallet"));
}

function saveWallet(data) {
  localStorage.setItem("wallet", JSON.stringify(data));
}

function showAlert(type, message) {
  var $c = $("#alert-container");
  if ($c.length === 0) {
    alert(message);
    return;
  }

  var html =
    "" +
    '<div class="alert alert-' +
    type +
    ' alert-dismissible fade show" role="alert">' +
    message +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
    "</div>";
  $c.html(html);
}

function ensureLoggedIn() {
  var w = getWallet();
  var page = $("body").attr("data-page");
  if (page && page !== "login" && !w.loggedIn) {
    window.location.href = "./login.html";
  }
}

function addTx(type, text, amount) {
  var w = getWallet();
  w.transactions.unshift({
    date: new Date().toLocaleString(),
    type: type,
    text: text,
    amount: amount,
  });
  if (w.transactions.length > 30) w.transactions.length = 30;
  saveWallet(w);
}

// ----------- Validación RUT (Chile) -----------
function validarRUT(rut) {
  if (!rut) return false;

  // limpia puntos y guion
  rut = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

  if (rut.length < 2) return false;

  var cuerpo = rut.slice(0, -1);
  var dv = rut.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  var suma = 0;
  var multiplo = 2;

  for (var i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  var dvEsperado = 11 - (suma % 11);
  if (dvEsperado === 11) dvEsperado = "0";
  else if (dvEsperado === 10) dvEsperado = "K";
  else dvEsperado = String(dvEsperado);

  return dv === dvEsperado;
}

$(document).ready(function () {
  initWallet();
  ensureLoggedIn();

  var page = $("body").attr("data-page");

  // ---------------- LOGIN ----------------
  if (page === "login") {
    $("#email").val("user@test.com");
    $("#password").val("1234");

    $("#loginForm").submit(function (e) {
      e.preventDefault();

      var email = $("#email").val().trim();
      var pass = $("#password").val().trim();

      if (email === "user@test.com" && pass === "1234") {
        var w = getWallet();
        w.loggedIn = true;
        saveWallet(w);
        showAlert(
          "success",
          "Login exitoso. Redirigiendo al menú principal...",
        );
        setTimeout(function () {
          window.location.href = "./menu.html";
        }, 800);
      } else {
        showAlert("danger", "Credenciales incorrectas. Intenta nuevamente.");
      }
    });
  }

  // ---------------- MENU ----------------
  if (page === "menu") {
    var wMenu = getWallet();
    $("#balance").text("$" + wMenu.balance);
    updateSaldoColor(wMenu.balance, "#balance");

    function goTo(label, url) {
      showAlert("info", "Redirigiendo a " + label + "...");
      setTimeout(function () {
        window.location.href = url;
      }, 700);
    }

    $("#btnDeposit").click(function () {
      window.location.href = "./deposit.html";
    });
    $("#btnSend").click(function () {
      window.location.href = "./sendmoney.html";
    });
    $("#btnTransactions").click(function () {
      window.location.href = "./transactions.html";
    });

    $("#btnLogout").click(function () {
      var w = getWallet();
      w.loggedIn = false;
      saveWallet(w);
      goTo("inicio de sesión", "./login.html");
    });
  }

  function updateSaldoColor(balance, selector) {
    const $el = $(selector);
    if (balance < 10000) {
      $el.addClass("saldo-bajo");
      $("#balance-hint").show();
    } else {
      $el.removeClass("saldo-bajo");
      $("#balance-hint").hide();
    }
  }

  // ---------------- DEPOSIT / RETIRO ----------------
  if (page === "deposit") {
    var wDep = getWallet();
    $("#saldoActual").text("$" + wDep.balance);
    updateSaldoColor(wDep.balance, "#saldoActual");

    function doMove(kind) {
      var amount = parseInt($("#amount").val(), 10);
      if (isNaN(amount) || amount <= 0) {
        showAlert("danger", "Monto inválido");
        return;
      }

      var w = getWallet();
      if (kind === "withdraw" && amount > w.balance) {
        showAlert("danger", "Saldo insuficiente para retirar");
        return;
      }

      if (kind === "deposit") {
        w.balance += amount;
        saveWallet(w);
        addTx("deposit", "Depósito", amount);
        $("#deposit-legend").text("Monto depositado: $" + amount);
        showAlert(
          "success",
          "Depósito realizado. Nuevo saldo: $" +
            w.balance +
            ". Redirigiendo...",
        );
      } else {
        w.balance -= amount;
        saveWallet(w);
        addTx("withdraw", "Retiro", amount);
        $("#deposit-legend").text("Monto retirado: $" + amount);
        showAlert(
          "success",
          "Retiro realizado. Nuevo saldo: $" + w.balance + ". Redirigiendo...",
        );
      }

      setTimeout(function () {
        window.location.href = "./menu.html";
      }, 2000);
    }

    $("#depositBtn").click(function (e) {
      e.preventDefault();
      doMove("deposit");
    });
    $("#withdrawBtn").click(function (e) {
      e.preventDefault();
      doMove("withdraw");
    });
  }

  // ---------------- ENVIAR DINERO ----------------
  if (page === "sendmoney") {
    var wSend = getWallet();
    $("#saldoEnvio").text("$" + wSend.balance);

    // UI: mostrar / ocultar secciones
    $("#openSearch").on("click", function () {
      $("#searchBox").removeClass("d-none");
      $("#amountBox").addClass("d-none");
    });

    $("#openAmount").on("click", function () {
      $("#amountBox").removeClass("d-none");
      $("#searchBox").addClass("d-none");
    });

    function renderContacts(filter) {
      var w = getWallet();
      var list = w.contacts;
      var term = (filter || "").toLowerCase(); // Búsqueda en minúsculas
      var $ul = $("#contactsList");
      $ul.empty(); // Limpiar la lista de contactos
      list.forEach(function (c, idx) {
        var text =
          c.name +
          " — RUT: " +
          c.rut +
          " | Alias: " +
          c.alias +
          " | Banco: " +
          c.bank;


        if (term && text.toLowerCase().indexOf(term) === -1) return;


        var $item = $('<div class="list-group-item contact-item"></div>');
        $item.text(text);
        if (idx === w.selectedContact) $item.addClass("active"); 

      
        $item.click(function () {
          var w2 = getWallet();
          w2.selectedContact = idx;
          saveWallet(w2); 

 
          $("#search").val(c.name); 
          $("#sendMoneyBtn").removeClass("d-none"); 

          // Volver a renderizar los contactos con el filtro aplicado
          renderContacts($("#search").val());
        });

        // Agregar el elemento de contacto a la lista
        $ul.append($item);
      });
    }

    renderContacts("");

    // búsqueda
    $("#searchForm").submit(function (e) {
      e.preventDefault();
      renderContacts($("#search").val());
    });

    // mostrar/ocultar formulario nuevo contacto
    $("#addContactBtn").click(function () {
      $("#newContactForm").removeClass("d-none");
    });

    $("#cancelContactBtn").click(function () {
      $("#newContactForm").addClass("d-none");
      $("#contactName,#contactRUT,#contactAlias,#contactBank").val("");
    });

    // guardar contacto (RUT con DV)
    $("#saveContactBtn").click(function (e) {
      e.preventDefault();

      var name = $("#contactName").val().trim();
      var rut = $("#contactRUT").val().trim();
      var alias = $("#contactAlias").val().trim();
      var bank = $("#contactBank").val().trim();

      if (!name || !rut || !alias || !bank) {
        showAlert("danger", "Completa todos los campos del contacto");
        return;
      }

      if (!validarRUT(rut)) {
        showAlert("danger", "RUT inválido (Ej: 12.345.678-5)");
        return;
      }

      var w = getWallet();
      w.contacts.push({ name: name, rut: rut, alias: alias, bank: bank });
      saveWallet(w);

      showAlert("success", "Contacto agregado");
      $("#newContactForm").addClass("d-none");
      $("#contactName,#contactRUT,#contactAlias,#contactBank").val("");
      renderContacts($("#search").val());
    });

    // enviar dinero
    $("#sendMoneyBtn").click(function (e) {
      e.preventDefault();
      var amount = parseInt($("#sendAmount").val(), 10);

      if (isNaN(amount) || amount <= 0) {
        showAlert("danger", "Monto inválido");
        return;
      }

      var w = getWallet();
      if (w.selectedContact < 0) {
        showAlert("danger", "Selecciona un contacto");
        return;
      }
      if (amount > w.balance) {
        showAlert("danger", "Saldo insuficiente");
        return;
      }

      var contact = w.contacts[w.selectedContact];
      w.balance -= amount;
      saveWallet(w);
      addTx("transfer", "Transferencia a " + contact.name, amount);

      showAlert(
        "success",
        "Envío realizado a " + contact.name + ". Redirigiendo al menú...",
      );
      setTimeout(function () {
        window.location.href = "./menu.html";
      }, 1800);
    });

    $("#backMenu").click(function () {
      window.location.href = "./menu.html";
    });
  }

  // ---------------- MOVIMIENTOS ----------------
  if (page === "transactions") {
    function renderTx(filter) {
      var w = getWallet();
      var $list = $("#txList");
      $list.empty();

      // Calcula el saldo después de cada transacción
      let saldoActual = w.balance;

      // Clona las transacciones que vas a mostrar, filtradas si corresponde
      let txToShow = w.transactions.filter(function (t) {
        if (filter && filter !== "all" && t.type !== filter) return false;
        return true;
      });

      // Recorre las transacciones, calculando el saldo después de cada una
      txToShow.forEach(function (t, idx) {
        let monto = t.amount;
        let signo = t.type === "deposit" ? "+" : "-";
        let colorMonto =
          t.type === "deposit"
            ? "text-success"
            : t.type === "withdraw"
              ? "text-danger"
              : "text-primary";
        let icono = "💸";
        if (t.type === "deposit") icono = "🪙";
        if (t.type === "withdraw") icono = "💵";
        if (t.type === "transfer") icono = "🔁";

        // El saldo después de este movimiento es el que hay AHORA,
        // luego lo ajustamos para la próxima iteración.
        let saldoDespues = saldoActual;

        // Construye la fila visual
        let $item = $(`
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <span style="font-size: 1.3em; margin-right: 0.5em;">${icono}</span>
          <span class="fw-semibold">${t.text}</span>
          <div class="small text-secondary">${t.date}</div>
        </div>
        <div class="text-end">
          <div class="fw-bold ${colorMonto}">${signo}$${monto}</div>
          <div class="small text-muted">Saldo: $${saldoDespues}</div>
        </div>
      </div>
    `);
        $list.append($item);

        // Actualiza el saldo para la siguiente transacción hacia atrás
        if (t.type === "deposit") saldoActual -= monto;
        else saldoActual += monto;
      });

      if (txToShow.length === 0) {
        $list.html('<div class="text-secondary">No hay movimientos aún.</div>');
      }
    }

    renderTx("all");

    $("#txFilter").change(function () {
      renderTx($(this).val());
    });

    $("#backToMenu").click(function () {
      window.location.href = "./menu.html";
    });
  }
});

$(document).ready(function () {
  // Función para obtener los contactos
  function getContacts() {
    var w = getWallet(); // Obtener los contactos desde el almacenamiento local
    return w.contacts || []; // Si no existen, retornar un array vacío
  }

  // Función para renderizar la lista de contactos
  function renderContacts(contacts) {
    const contactsList = $("#contactsList");
    contactsList.empty(); // Limpiar la lista

    if (contacts.length === 0) {
      // Si no hay contactos, mostrar el mensaje
      $("#noContactsMessage").removeClass("d-none");
    } else {
      // Si hay contactos, ocultar el mensaje
      $("#noContactsMessage").addClass("d-none");

      contacts.forEach(function (contact) {
        // Crear y agregar cada contacto a la lista
        const contactItem = `<div class="list-group-item contact-item" data-contact='${JSON.stringify(contact)}'>${contact.name} — RUT: ${contact.rut} | Alias: ${contact.alias} | Banco: ${contact.bank}</div>`;
        contactsList.append(contactItem);
      });
    }
  }

  // Configurar el autocompletado
  $("#search").autocomplete({
    source: function (request, response) {
      const searchTerm = request.term.toLowerCase(); // Obtener el término de búsqueda
      const filteredContacts = getContacts().filter((contact) => {
        return (
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.alias.toLowerCase().includes(searchTerm) ||
          contact.bank.toLowerCase().includes(searchTerm)
        ); // Filtrar contactos
      });

      response(
        filteredContacts.map((contact) => {
          return (
            contact.name +
            " — RUT: " +
            contact.rut +
            " | Alias: " +
            contact.alias +
            " | Banco: " +
            contact.bank
          );
        }),
      ); // Proporcionar resultados al autocompletado
    },
    minLength: 2, // Mínimo de caracteres para activar el autocompletado
    select: function (event, ui) {
      const selectedContact = ui.item.value; // Obtener el valor del contacto seleccionado
      $("#search").val(selectedContact); // Completar el campo de búsqueda
      $("#sendMoneyBtn").removeClass("d-none"); // Mostrar el botón de "Confirmar envío"
    },
  });

  // Manejar la selección de un contacto
  $("#contactsList").on("click", ".contact-item", function () {
    const contact = $(this).data("contact"); // Obtener los datos del contacto seleccionado
    $("#search").val(
      contact.name +
        " — " +
        contact.rut +
        " | Alias: " +
        contact.alias +
        " | Banco: " +
        contact.bank,
    ); // Completar el campo de búsqueda
    $("#sendMoneyBtn").removeClass("d-none"); // Mostrar el botón de "Confirmar envío"
  });

  // Inicializar la página
  const contacts = getContacts();
  renderContacts(contacts); // Renderizar los contactos al cargar la página
});

// Habilitar autocompletar para el campo de búsqueda
$("#search").autocomplete({
  source: getContacts(),

  minLength: 2, // Mínimo de caracteres antes de buscar
  select: function (event, ui) {
    // Lógica para manejar la selección del contacto
    var selectedContact = ui.item.value;
    var w = getWallet();
    var selected = w.contacts.find(function (contact) {
      return (
        contact.name +
          " — " +
          contact.rut +
          " | Alias: " +
          contact.alias +
          " | Banco: " +
          contact.bank ===
        selectedContact
      );
    });

    if (selected) {
      w.selectedContact = w.contacts.indexOf(selected);
      saveWallet(w);
      $("#sendMoneyBtn").removeClass("d-none"); // Mostrar el botón de enviar
    }
  },
});

function renderContacts(filter) {
  var w = getWallet();
  var list = w.contacts;
  var term = (filter || "").toLowerCase();
  var $ul = $("#contactsList");
  $ul.empty();

  list.forEach(function (c, idx) {
    var text =
      c.name +
      " — RUT: " +
      c.rut +
      " | Alias: " +
      c.alias +
      " | Banco: " +
      c.bank;
    if (term && text.toLowerCase().indexOf(term) === -1) return;

    var $item = $('<div class="list-group-item contact-item"></div>');
    $item.text(text);
    if (idx === w.selectedContact) $item.addClass("active");

    $item.click(function () {
      // Verificar si el evento click se está registrando
      console.log("Contacto seleccionado: " + c.name);

      var w2 = getWallet();
      w2.selectedContact = idx;
      saveWallet(w2);

      // Actualizar el campo de búsqueda
      $("#search").val(c.name);

      // Mostrar el botón de "Confirmar envío"
      $("#sendMoneyBtn").removeClass("d-none");

      renderContacts($("#search").val());
    });

    $ul.append($item);
  });
}



