const API_BASE = 'https://www.themealdb.com/api/json/v1/1';


    const mealsGrid = document.getElementById('mealsGrid');
    const detailImg = document.getElementById('detailImg');
    const detailTitle = document.getElementById('detailTitle');
    const detailCategory = document.getElementById('detailCategory');
    const detailArea = document.getElementById('detailArea');
    const detailIngredients = document.getElementById('detailIngredients');
    const detailInstructions = document.getElementById('detailInstructions');

    const searchName = document.getElementById('searchName');
    const btnSearch = document.getElementById('btnSearch');
    const btnRandom = document.getElementById('btnRandom');
    const categorySelect = document.getElementById('categorySelect');
    const areaSelect = document.getElementById('areaSelect');
    const searchIngredient = document.getElementById('searchIngredient');
    const btnIngredient = document.getElementById('btnIngredient');

   
    async function fetchJSON(url){
      const res = await fetch(url);
      if(!res.ok) throw new Error('Network error');
      return res.json();
    }

    
    async function loadLists(){
      try{
        const cats = await fetchJSON(`${API_BASE}/list.php?c=list`);
        const areas = await fetchJSON(`${API_BASE}/list.php?a=list`);

        if(cats && cats.meals){
          cats.meals.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.strCategory;
            opt.textContent = c.strCategory;
            categorySelect.appendChild(opt);
          });
        }
        if(areas && areas.meals){
          areas.meals.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.strArea;
            opt.textContent = a.strArea;
            areaSelect.appendChild(opt);
          });
        }
      }catch(err){
        console.error('Failed to load lists', err);
      }
    }

    function renderMeals(meals){
      mealsGrid.innerHTML = '';
      if(!meals || meals.length === 0){
        mealsGrid.innerHTML = '<div class="col-12"><div class="p-4 bg-white rounded">No results.</div></div>';
        return;
      }

      meals.forEach(meal => {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4';

        const card = document.createElement('article');
        card.className = 'card meal-card';
        card.setAttribute('data-mealid', meal.idMeal);

        const img = document.createElement('img');
        img.src = meal.strMealThumb;
        img.alt = meal.strMeal;

        const body = document.createElement('div');
        body.className = 'card-body';

        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = meal.strMeal;

        body.appendChild(title);
        card.appendChild(img);
        card.appendChild(body);
        col.appendChild(card);
        mealsGrid.appendChild(col);

       
        card.addEventListener('click', () => {
          getMealById(meal.idMeal);
          
          if(window.innerWidth < 992){
            document.getElementById('detailCard').scrollIntoView({behavior:'smooth'});
          }
        });
      });
    }

    function showMealDetails(meal){
      detailImg.src = meal.strMealThumb || '';
      detailImg.alt = meal.strMeal || 'Meal';
      detailTitle.textContent = meal.strMeal || '-';
      detailCategory.textContent = `Category: ${meal.strCategory || '-'}`;
      detailArea.textContent = `Area: ${meal.strArea || '-'}`;


      detailIngredients.innerHTML = '';
      for(let i=1;i<=20;i++){
        const ing = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if(ing && ing.trim().length){
          const li = document.createElement('li');
          li.textContent = `${measure ? measure.trim() + ' ' : ''}${ing.trim()}`;
          detailIngredients.appendChild(li);
        }
      }

      detailInstructions.textContent = meal.strInstructions || '';
    }

   
    async function searchByName(name){
      try{
        const data = await fetchJSON(`${API_BASE}/search.php?s=${encodeURIComponent(name||'')}`);
        renderMeals(data.meals || []);
        if(data.meals && data.meals.length === 1){
          showMealDetails(data.meals[0]);
        }
      }catch(err){
        console.error(err);
        renderMeals([]);
      }
    }

    async function getMealById(id){
      try{
        const data = await fetchJSON(`${API_BASE}/lookup.php?i=${id}`);
        if(data.meals && data.meals[0]){
          showMealDetails(data.meals[0]);
        }
      }catch(err){
        console.error(err);
      }
    }

 
    async function getRandomMeal(){
      try{
        const data = await fetchJSON(`${API_BASE}/random.php`);
        if(data.meals && data.meals[0]){
          renderMeals(data.meals);
          showMealDetails(data.meals[0]);
        }
      }catch(err){
        console.error(err);
      }
    }

    async function filterByCategory(category){
      try{
        const data = await fetchJSON(`${API_BASE}/filter.php?c=${encodeURIComponent(category)}`);
        renderMeals(data.meals || []);
      }catch(err){
        console.error(err);
      }
    }

    async function filterByArea(area){
      try{
        const data = await fetchJSON(`${API_BASE}/filter.php?a=${encodeURIComponent(area)}`);
        renderMeals(data.meals || []);
      }catch(err){
        console.error(err);
      }
    }

    async function searchByIngredient(ingredient){
      try{
        const data = await fetchJSON(`${API_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
        renderMeals(data.meals || []);
      }catch(err){
        console.error(err);
      }
    }

    async function init(){
      await loadLists();
      await searchByName(''); 
    }

 
    btnSearch.addEventListener('click', () => {
      const q = searchName.value.trim();

      if(q) searchByName(q);
      else if(categorySelect.value) filterByCategory(categorySelect.value);
      else if(areaSelect.value) filterByArea(areaSelect.value);
      else searchByName(''); 
    });

    
    searchName.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') btnSearch.click();
    });


    categorySelect.addEventListener('change', () => {
      const c = categorySelect.value;
      if(c) filterByCategory(c);
      else searchByName('');
    });

    
    areaSelect.addEventListener('change', () => {
      const a = areaSelect.value;
      if(a) filterByArea(a);
      else searchByName('');
    });

    
    btnRandom.addEventListener('click', () => getRandomMeal());

    
    btnIngredient.addEventListener('click', () => {
      const ing = searchIngredient.value.trim();
      if(!ing) return alert('Type an ingredient (e.g., chicken, rice).');
      searchByIngredient(ing);
    });
    searchIngredient.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') btnIngredient.click();
    });


    init();