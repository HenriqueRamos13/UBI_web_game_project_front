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
    email: form.name.email,
    name: form.name.value,
    gender: form.gender.value,
    password: form.password.value,
  };

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (response.ok) {
      alert("Registration successful. You can now log in.");
    } else {
      const errorData = await response.json();
      alert("Registration error: " + errorData.message);
    }
  } catch (error) {
    alert("An error occurred: " + error.message);
  }

}

document.getElementById("login").addEventListener("submit", login);

document.getElementById("singup").addEventListener("submit", signup);
