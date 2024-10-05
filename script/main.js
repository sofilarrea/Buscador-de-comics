const urlApi = 'https://gateway.marvel.com';
const urlMovies = '/v1/public/comics';
const apiKey = '65db027dcb3242c298c3482a2b3f65d4';
const ts = '1';
const hash = '32e7770ba72dfc622c150d2fc1e02ac7';

function showSpinner() {
    document.getElementById('spinner').classList.remove('hidden');
}

function hideSpinner() {
    document.getElementById('spinner').classList.add('hidden');
}

let comics = []; 
let currentPage = 0;
const comicsPerPage = 20;
let totalComics = 0; 

// Obtener cómics
function fetchComics() {
    showSpinner();
    const offset = currentPage * comicsPerPage; 

    fetch(`${urlApi}${urlMovies}?ts=${ts}&apikey=${apiKey}&hash=${hash}&limit=${comicsPerPage}&offset=${offset}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        totalComics = data.data.total; 
        displayComics(data.data.results);
        updatePagination();
    })
    .catch(error => {
        console.error("Error al cargar cómics:", error);
        alert("Ocurrió un error al cargar los cómics.");
    })
    .finally(() => {
        hideSpinner();
    });
}

// Función para mostrar los cómics
function displayComics(comics) {
    const comicsContainer = document.getElementById('comics-container');
    comicsContainer.innerHTML = ''; 

    if (comics.length > 0) {
        comics.forEach(comic => {
            const comicCard = createComicCard(comic);
            comicsContainer.appendChild(comicCard);
        });
    } else {
        const messageElement = document.createElement('p');
        messageElement.textContent = 'No se encontraron cómics.';
        comicsContainer.appendChild(messageElement);
    }
}

// Función para crear la card del cómic
function createComicCard(comic) {
    const card = document.createElement('div');
    card.className = 'comic-card bg-white border rounded shadow p-4 cursor-pointer';
    card.dataset.id = comic.id; 

    const image = document.createElement('img');
    image.src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    image.alt = comic.title;

    const title = document.createElement('h3');
    title.className = 'text-xl font-bold';
    title.innerText = comic.title;

    const issueNumber = document.createElement('p');
    issueNumber.className = 'text-gray-700';
    issueNumber.innerText = `#${comic.issueNumber}`;

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(issueNumber);

    card.addEventListener('click', () => showComicDetails(comic));

    return card;
}

function showComicDetails(comic) {
    const comicsContainer = document.getElementById('comics-container'); 
    const detailsSection = document.getElementById('comic-details'); 
    const comicImage = document.getElementById('comic-image');
    const comicTitle = document.getElementById('comic-title');
    const comicPublished = document.getElementById('comic-published');
    const comicWriters = document.getElementById('comic-writers');
    const comicDescription = document.getElementById('comic-description');

    comicImage.src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    comicImage.alt = `${comic.title} (${comic.issueNumber})`; 
    comicTitle.innerText = `${comic.title} (${comic.issueNumber})`;
    comicPublished.innerText = `Publicado: ${comic.dates[0].date.split('T')[0]}`; 

    comicWriters.innerText = comic.creators.items.length > 0 
        ? `Guionistas: ${comic.creators.items.map(writer => writer.name).join(', ')}`
        : 'Guionistas: Información no disponible';

    comicDescription.innerText = comic.description || 'Descripción no disponible.';

    comicsContainer.classList.add('hidden'); 
    detailsSection.classList.remove('hidden'); 
}

// Función para actualizar la paginación
function updatePagination() {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = ''; 

    // Botón de página anterior
    if (currentPage > 0) {
        const prevButton = document.createElement('button');
        prevButton.innerText = '<';
        prevButton.className = 'bg-black text-white px-4 py-2 rounded mr-2 hover:bg-red-800';
        prevButton.onclick = () => {
            currentPage--;
            fetchComics();
        };
        paginationContainer.appendChild(prevButton);
    }

    // Botón de página siguiente
    if ((currentPage + 1) * comicsPerPage < totalComics) {
        const nextButton = document.createElement('button');
        nextButton.innerText = '>';
        nextButton.className = 'bg-black text-white px-4 py-2 rounded mr-2 hover:bg-red-600';
        nextButton.onclick = () => {
            currentPage++;
            fetchComics();
        };
        paginationContainer.appendChild(nextButton);
    }
}

// Busqueda de cómics
const searchInput = document.querySelector('input[type="text"]');
const searchTypeSelect = document.querySelector('select'); 
const searchButton = document.querySelector('button');

// Almacenar la referencia a los contenedores
const comicsContainer = document.getElementById('comics-container');
const variantsContainer = document.getElementById('variants-container');

// Modificar la función de búsqueda
searchButton.addEventListener('click', () => {
    const searchQuery = searchInput.value.trim(); 
    const searchType = searchTypeSelect.value; 

    if (searchQuery) {
        if (searchType === 'comic') {
            fetchComicsByCharacter(searchQuery);
            variantsContainer.classList.add('hidden'); // Oculta el contenedor de variantes
            comicsContainer.classList.remove('hidden'); // Asegúrate de que el contenedor de cómics esté visible
        } else if (searchType === 'character') {
            fetchCharacterVariants(searchQuery);
            comicsContainer.classList.add('hidden'); // Oculta el contenedor de cómics
            variantsContainer.classList.remove('hidden'); // Muestra el contenedor de variantes
        }
    } else {
        alert('Por favor, ingresa un nombre para buscar');
    }
});

// Función para buscar cómics que contienen a un personaje
function fetchComicsByCharacter(characterName) {
    showSpinner();
    
    const normalizedCharacterName = encodeURIComponent(characterName.trim());

    fetch(`${urlApi}/v1/public/characters?ts=${ts}&apikey=${apiKey}&hash=${hash}&name=${normalizedCharacterName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.data.results.length > 0) {
            const characterId = data.data.results[0].id;

            fetch(`${urlApi}/v1/public/comics?ts=${ts}&apikey=${apiKey}&hash=${hash}&characters=${characterId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const comics = data.data.results;
                displayComics(comics);
                hideSpinner();
            })
            .catch(error => {
                console.log(error);
                hideSpinner();
            });
        } else {
            const comicsContainer = document.getElementById('comics-container');
            comicsContainer.innerHTML = '';
            const messageElement = document.createElement('p');
            messageElement.textContent = 'No se encontró el personaje.';
            comicsContainer.appendChild(messageElement);
            hideSpinner();
        }
    })
    .catch(error => {
        console.log(error);
        hideSpinner();
    });
}

// Función para buscar todas las variantes de un personaje
function fetchCharacterVariants(characterName) {
    showSpinner(); // Muestra un spinner mientras carga
    
    const normalizedCharacterName = encodeURIComponent(characterName.trim());

    fetch(`${urlApi}/v1/public/characters?ts=${ts}&apikey=${apiKey}&hash=${hash}&nameStartsWith=${normalizedCharacterName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        variantsContainer.innerHTML = ''; // Limpiar el contenedor de variantes

        if (data.data.results.length > 0) {
            data.data.results.forEach(variant => {
                const variantCard = document.createElement('div');
                variantCard.className = 'variant-card bg-gray-100 border rounded shadow p-4 m-2 inline-block cursor-pointer'; // Estilo de la tarjeta de variante

                const variantImage = document.createElement('img');
                variantImage.src = `${variant.thumbnail.path}.${variant.thumbnail.extension}`;
                variantImage.alt = variant.name;
                variantImage.className = 'w-24 h-36 mb-2'; // Establecer dimensiones de las miniaturas

                const variantName = document.createElement('h4');
                variantName.className = 'text-lg font-bold';
                variantName.innerText = variant.name;

                variantCard.appendChild(variantImage);
                variantCard.appendChild(variantName);
                variantCard.addEventListener('click', () => showComicDetails(variant)); // Cambiar aquí si deseas mostrar detalles específicos de la variante

                variantsContainer.appendChild(variantCard);
            });
        } else {
            const messageElement = document.createElement('p');
            messageElement.textContent = 'No se encontraron variantes para el personaje.';
            variantsContainer.appendChild(messageElement);
        }
        hideSpinner();
    })
    .catch(error => {
        console.error("Error al buscar variantes:", error);
        hideSpinner();
    });
}

// Al cargar la página, buscar cómics iniciales
fetchComics();
