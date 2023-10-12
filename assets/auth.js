async function login(e) {
  e.preventDefault();

  const form = e.target;

  const body = {
    email: form.email.value,
    password: form.password.value,
  };

  alert(JSON.stringify(body));
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
