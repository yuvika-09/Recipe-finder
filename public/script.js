// ---------------- AUTH ----------------

function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.message === 'User registered successfully') {
            window.location.href = '/login.html';
        }
    });
}

function login() {
    const username = document.getElementById('username')?.value 
        || document.getElementById('loginUsername')?.value;
    const password = document.getElementById('password')?.value 
        || document.getElementById('loginPassword')?.value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message || 'Login failed');
        }
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

// ---------------- DASHBOARD ----------------

let recipesData = [];
const defaultRecipes = [
  {
    name: "Spaghetti Bolognese",
    ingredients: "Spaghetti, Beef, Tomato Sauce",
    instructions: "Cook spaghetti, prepare sauce, mix together",
    image: "https://tse2.mm.bing.net/th/id/OIP.Vmkn2IS83F0hxCul31YXaAHaFj?rs=1&pid=ImgDetMain&o=7&rm=3",
    isDefault: true
  },
  {
    name: "Caesar Salad",
    ingredients: "Lettuce, Croutons, Caesar Dressing",
    instructions: "Mix all ingredients in a bowl",
    image: "https://tse1.mm.bing.net/th/id/OIP.e-Oyvqcyh587jryILBbkigHaJQ?rs=1&pid=ImgDetMain&o=7&rm=3",
    isDefault: true
  }
];

function showAddForm(){
  document.getElementById('addForm').style.display = 'block';
}
function hideAddForm(){
  document.getElementById('addForm').style.display = 'none';
}

function addRecipe(){
  const token = localStorage.getItem('token');

  const name = document.getElementById('name').value.trim();
  const ingredients = document.getElementById('ingredients').value.trim();
  const instructions = document.getElementById('instructions').value.trim();
  const image = document.getElementById('image').value.trim();

  if (!name || !ingredients || !instructions) {
      alert("All fields are required");
      return;
  }

  fetch('/api/recipes', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': token 
    },
    body: JSON.stringify({ name, ingredients, instructions, image })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);

    // clear form fields
    document.getElementById('name').value = "";
    document.getElementById('ingredients').value = "";
    document.getElementById('instructions').value = "";
    document.getElementById('image').value = "";

    hideAddForm();
    getRecipes();
  });
}

function getRecipes(){
  const token = localStorage.getItem('token');

  fetch('/api/recipes', { headers: { 'Authorization': token } })
    .then(res => res.json())
    .then(userRecipes => {
      let allRecipes = [...defaultRecipes, ...userRecipes];

      allRecipes.sort((b, a) => (b._id || "").localeCompare(a._id || ""));

      recipesData = allRecipes;
      displayRecipes(allRecipes);
    })
    .catch(e => console.error(e));
}

function displayRecipes(data){
  const list = document.getElementById('recipesList');
  if (!list) return;

  list.innerHTML = '';

  data.forEach(r => {
    list.innerHTML += `
      <div>
        <div class="details">
          <h3>${r.name}</h3>
          <p><strong>Ingredients:</strong> ${r.ingredients}</p>
          <p><strong>Instructions:</strong> ${r.instructions}</p>

          <div class="buttons">
            ${r.isDefault ? '' : `
              <button onclick="deleteRecipe('${r._id}')">Delete</button>
              <button onclick="goToUpdate('${r._id}')">Update</button>
            `}
          </div>
        </div>
        <img src="${r.image || 'https://via.placeholder.com/200'}" />
      </div>
    `;
  });
}

function deleteRecipe(id){
  const token = localStorage.getItem('token');

  if (!confirm('Are you sure you want to delete this recipe?')) return;

  fetch(`/api/recipes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': token }
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    getRecipes();
  });
}

function goToUpdate(id){
  localStorage.setItem('updateId', id);
  window.location.href = '/update.html';
}

// ---------------- UPDATE PAGE ----------------

function updateRecipe(){
  const token = localStorage.getItem('token');
  const id = localStorage.getItem('updateId');

  const name = document.getElementById('name').value.trim();
  const ingredients = document.getElementById('ingredients').value.trim();
  const instructions = document.getElementById('instructions').value.trim();
  const image = document.getElementById('image').value.trim();

  if (!name || !ingredients || !instructions) {
      alert("All fields are required");
      return;
  }

  fetch(`/api/recipes/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': token 
    },
    body: JSON.stringify({ name, ingredients, instructions, image })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    localStorage.removeItem('updateId');
    window.location.href = '/dashboard.html';
  });
}

function cancelUpdate(){
    localStorage.removeItem('updateId');
    window.location.href = '/dashboard.html';
}

// ---------------- SEARCH ----------------

function searchRecipes(){
  const query = document.getElementById("searchInput").value.toLowerCase();

  const filtered = recipesData.filter(r =>
    r.ingredients.toLowerCase().includes(query) ||
    r.name.toLowerCase().includes(query)
  );

  displayRecipes(filtered);
}

// ---------------- AUTO RUN ----------------

if (window.location.pathname.includes('dashboard.html')) {
  if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
  }
  getRecipes();
}

if (window.location.pathname.includes('update.html')) {
  if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
  }

  const id = localStorage.getItem('updateId');

  fetch('/api/recipes', { headers: { 'Authorization': localStorage.getItem('token') } })
    .then(res => res.json())
    .then(data => {
      const recipe = data.find(r => r._id === id);
      if (recipe) {
        document.getElementById('name').value = recipe.name;
        document.getElementById('ingredients').value = recipe.ingredients;
        document.getElementById('instructions').value = recipe.instructions;
        document.getElementById('image').value = recipe.image || "";
      }
    });
}
