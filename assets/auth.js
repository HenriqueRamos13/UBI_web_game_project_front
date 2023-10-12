async function login(e) {
  e.preventDefault();

  const form = e.target;

  const body = {
    email: form.email.value,
    password: form.password.value,
  };

  fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  })
    .then((x) => x.json())
    .then((x) => {
      if (x.token) {
        localStorage.setItem("token", x.token);
        window.location.href = "/game.html";
      } else {
        alert("erro " + x.message);
      }
    })
    .catch((x) => alert(x.message));
}

async function register(e) {
  e.preventDefault();

  const form = e.target;

  const body = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value,
  };

  alert(JSON.stringify(body));
}

document.getElementById("login").addEventListener("submit", login);

document.getElementById("register").addEventListener("submit", register);
