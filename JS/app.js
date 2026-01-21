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

  var page = $("body").attr("data-page");


  if (page !== "login") {
    ensureLoggedIn();
  }
// ---------------- LOGIN / REGISTRO ----------------
if (page === "login") {

  (function ensureUsers() {
    var w = getWallet();
    if (!Array.isArray(w.users)) w.users = [];
    if (!w.users.some((u) => (u.email || "").toLowerCase() === "user@test.com")) {
      w.users.push({ email: "user@test.com", password: "1234" });
    }
    saveWallet(w);
  })();


  if (!$("#email").val()) $("#email").val("user@test.com");
  if (!$("#password").val()) $("#password").val("1234");

  function setAuthMode(mode) {
    const isRegister = mode === "register";
    $("#loginForm").toggleClass("d-none", isRegister);
    $("#registerForm").toggleClass("d-none", !isRegister);


    $("#showRegisterForm").text(
      isRegister
        ? "¿Ya tienes cuenta? Inicia sesión"
        : "¿No tienes una cuenta? Regístrate aquí"
    );

    $("#alert-container").empty();
  }

 
  setAuthMode("login");


  $("#showRegisterForm").on("click", function (e) {
    e.preventDefault();
    const isRegisterVisible = !$("#registerForm").hasClass("d-none");
    setAuthMode(isRegisterVisible ? "login" : "register");
  });


  $("#registerUserForm").on("submit", function (e) {
    e.preventDefault();

    var email = $("#newEmail").val().trim().toLowerCase();
    var pass1 = $("#newPassword").val();
    var pass2 = $("#newPasswordConfirm").val();

    if (!email || !pass1 || !pass2) {
      showAlert("danger", "Completa todos los campos");
      return;
    }
    if (pass1 !== pass2) {
      showAlert("danger", "Las contraseñas no coinciden");
      return;
    }
    if (pass1.length < 4) {
      showAlert("danger", "La contraseña debe tener al menos 4 caracteres");
      return;
    }

    var w = getWallet();
    if (!Array.isArray(w.users)) w.users = [];

    const exists = w.users.some((u) => (u.email || "").toLowerCase() === email);
    if (exists) {
      showAlert("danger", "Ese email ya está registrado");
      return;
    }

    w.users.push({ email: email, password: pass1 });
    saveWallet(w);

    showAlert("success", "Cuenta creada ✅ Ahora inicia sesión.");

 
    $("#newEmail,#newPassword,#newPasswordConfirm").val("");
    $("#email").val(email);
    $("#password").val(pass1);
    setAuthMode("login");
  });


  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    var email = $("#email").val().trim().toLowerCase();
    var pass = $("#password").val().trim();

    var w = getWallet();
    if (!Array.isArray(w.users)) w.users = [];

    const ok = w.users.some(
      (u) => (u.email || "").toLowerCase() === email && u.password === pass
    );

    if (ok) {
      w.loggedIn = true;
      w.currentUser = email; 
      saveWallet(w);

      showAlert("success", "Login exitoso. Redirigiendo al menú...");
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

    function getContacts() {
      var w = getWallet();
      return w.contacts || [];
    }

    function formatContact(c) {
      return (
        c.name +
        " — RUT: " +
        c.rut +
        " | Alias: " +
        c.alias +
        " | Banco: " +
        c.bank
      );
    }

    function renderContacts(filter) {
      var w = getWallet();
      var list = w.contacts || [];
      var term = (filter || "").toLowerCase();
      var $ul = $("#contactsList");
      $ul.empty();

      if (!list.length) {
        $("#noContactsMessage").removeClass("d-none");
        return;
      } else {
        $("#noContactsMessage").addClass("d-none");
      }

      list.forEach(function (c, idx) {
        var text = formatContact(c);

        // si hay filtro, aplicar filtro (name/alias/bank/rut)
        if (term) {
          const hayMatch =
            (c.name || "").toLowerCase().includes(term) ||
            (c.alias || "").toLowerCase().includes(term) ||
            (c.bank || "").toLowerCase().includes(term) ||
            (c.rut || "").toLowerCase().includes(term) ||
            text.toLowerCase().includes(term);

          if (!hayMatch) return;
        }

        var $item = $('<div class="list-group-item contact-item"></div>');
        $item.text(text);
        $item.attr("data-idx", idx);

        if (idx === w.selectedContact) $item.addClass("active");

        $ul.append($item);
      });
    }

    function selectContactByIndex(idx) {
      var w = getWallet();
      if (!Array.isArray(w.contacts) || idx < 0 || idx >= w.contacts.length)
        return;

      w.selectedContact = idx;
      saveWallet(w);

      $("#search").val(formatContact(w.contacts[idx]));
      $("#sendMoneyBtn").removeClass("d-none");

      // NO filtrar después de seleccionar 
      renderContacts("");
    }

    // Render inicial (lista completa)
    renderContacts("");

   
    (function preloadSelected() {
      var w = getWallet();
      w.selectedContact = -1; 
      saveWallet(w);

      $("#search").val(""); 
      $("#sendMoneyBtn").addClass("d-none"); 
      renderContacts(""); 
    })();


    $("#contactsList").on("click", ".contact-item", function () {
      var idx = parseInt($(this).attr("data-idx"), 10);
      selectContactByIndex(idx);
    });

  
    let settingFromSelect = false;
    $("#search").on("input", function () {
      if (settingFromSelect) return;

      var w = getWallet();
      w.selectedContact = -1;
      saveWallet(w);
      $("#sendMoneyBtn").addClass("d-none");

 
      renderContacts($(this).val());
    });

    // Autocompletado 
    if ($.fn.autocomplete) {
      
      try {
        $("#search").autocomplete("destroy");
      } catch (e) {}

      $("#search").autocomplete({
        minLength: 2,
        source: function (request, response) {
          const term = request.term.toLowerCase();
          const contacts = getContacts();

          const matches = contacts
            .map((c, idx) => ({ c, idx }))
            .filter(({ c }) => {
              return (
                (c.name || "").toLowerCase().includes(term) ||
                (c.alias || "").toLowerCase().includes(term) ||
                (c.bank || "").toLowerCase().includes(term) ||
                (c.rut || "").toLowerCase().includes(term)
              );
            })
            .map(({ c, idx }) => ({
              label: formatContact(c),
              value: formatContact(c),
              idx: idx,
            }));

          response(matches);
        },
        select: function (event, ui) {
          event.preventDefault(); 
          settingFromSelect = true;
          $("#search").val(ui.item.value);
          settingFromSelect = false;

          selectContactByIndex(ui.item.idx);
        },
      });
    } else {
      console.warn("jQuery UI Autocomplete no está cargado.");
    }

    
    $("#searchForm").submit(function (e) {
      e.preventDefault();
      renderContacts($("#search").val());
    });

    
    $("#addContactBtn").click(function () {
      $("#newContactForm").removeClass("d-none");
    });

    $("#cancelContactBtn").click(function () {
      $("#newContactForm").addClass("d-none");
      $("#contactName,#contactRUT,#contactAlias,#contactBank").val("");
    });

    
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

      renderContacts("");
    });

    // Enviar dinero
    $("#sendMoneyBtn").click(function (e) {
      e.preventDefault();
      var amount = parseInt($("#sendAmount").val(), 10);

      if (isNaN(amount) || amount <= 0) {
        showAlert("danger", "Monto inválido");
        return;
      }

      var w = getWallet();

      
      if (
        !Number.isInteger(w.selectedContact) ||
        w.selectedContact < 0 ||
        w.selectedContact >= w.contacts.length
      ) {
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
        "Transferencia OK ✅ a " +
          contact.name +
          " | Monto: $" +
          amount.toLocaleString("es-CL") +
          " | Saldo: $" +
          w.balance.toLocaleString("es-CL") +
          " | Redirigiendo...",
      );
      setTimeout(function () {
        window.location.href = "./menu.html";
      }, 2800);
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

      let saldoActual = w.balance;
      let txToShow = w.transactions.filter(function (t) {
        return filter && filter !== "all" && t.type !== filter ? false : true;
      });

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

        let saldoDespues = saldoActual;

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
