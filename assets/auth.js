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
        localStorage.setItem("id", x.id);
        window.location.href = "/game.html";
      } else {
        alert("erro " + x.message);
      }
    })
    .catch((x) => alert(x.message));
}

document.getElementById("login").addEventListener("submit", login);
