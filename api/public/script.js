let token = localStorage.getItem('token');
let recipeId = localStorage.getItem('recipeId');

function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(res => res.json())
      .then(data => alert(data.message));
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(res => res.json())
      .then(data => {
        if(data.token){
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message);
        }
      });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

// Dashboard
function addRecipe() {
    const name = document.getElementById('name').value;
    const ingredients = document.getElementById('ingredients').value;
    const instructions = document.getElementById('instructions').value;
    const image = document.getElementById('image').value;

    fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ name, ingredients, instructions, image })
    }).then(res => res.json())
      .then(data => { alert(data.message); getRecipes(); });
}

function displayRecipes(data){
  const list = document.getElementById('recipesList');
  list.innerHTML = '';
  data.forEach(r => {
    list.innerHTML += `
      <div>
        <div class="details">
          <h3>${r.name}</h3>
          <p><strong>Ingredients:</strong> ${r.ingredients}</p>
          <p><strong>Instructions:</strong> ${r.instructions}</p>
          <div class="buttons">
            <button onclick="deleteRecipe('${r._id}')">Delete</button>
            <button onclick="goToUpdate('${r._id}')">Update</button>
          </div>
        </div>
        <img src="${r.image || 'https://via.placeholder.com/120'}"/>
      </div>`;
  });
}


function deleteRecipe(id) {
    fetch(`/api/recipes/${id}`, { method: 'DELETE', headers: { 'Authorization': token } })
        .then(res => res.json())
        .then(data => { alert(data.message); getRecipes(); });
}

// Update page
function goToUpdate(id){
    localStorage.setItem('recipeId', id);
    window.location.href = '/update.html';
}

function updateRecipe(){
    const id = recipeId;
    const name = document.getElementById('name').value;
    const ingredients = document.getElementById('ingredients').value;
    const instructions = document.getElementById('instructions').value;
    const image = document.getElementById('image').value;

    fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ name, ingredients, instructions, image })
    }).then(res => res.json())
      .then(data => { alert(data.message); localStorage.removeItem('recipeId'); window.location.href = '/dashboard.html'; });
}

// Auto-load recipes
if(window.location.pathname.includes('dashboard.html')){
    if(!token) window.location.href = '/login.html';
    getRecipes();
}

// Pre-fill update fields
if(window.location.pathname.includes('update.html')){
    if(!token) window.location.href = '/login.html';
    const id = recipeId;
    fetch(`/api/recipes`, { headers: { 'Authorization': token } })
        .then(res => res.json())
        .then(data => {
            const recipe = data.find(r => r._id === id);
            if(recipe){
                document.getElementById('name').value = recipe.name;
                document.getElementById('ingredients').value = recipe.ingredients;
                document.getElementById('instructions').value = recipe.instructions;
                document.getElementById('image').value = recipe.image;
            }
        });
}

function goBack(){
    localStorage.removeItem('recipeId');
    window.location.href = '/dashboard.html';
}
