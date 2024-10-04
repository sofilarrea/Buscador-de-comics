// Configuración de la API
const API = {
    url: 'https://gateway.marvel.com',
    movies: '/v1/public/comics',
    characters: '/v1/public/characters',
    apiKey: '65db027dcb3242c298c3482a2b3f65d4',
    ts: '1',
    hash: '32e7770ba72dfc622c150d2fc1e02ac7',
};

// Variables de estado
let comics = [];
let currentPage = 0;
const comicsPerPage = 20;
let totalComics = 0;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', fetchComics);

// Mostrar/ocultar el spinner
function toggleSpinner(show) {
    const spinner = document.getElementById('spinner');
    spinner.classList.toggle('hidden', !show);
}

// Función para obtener cómics
async function fetchComics() {
    toggleSpinner(true);
    const offset = currentPage * comicsPerPage;

    try {
        const response = await fetch(`${API.url}${API.movies}?ts=${API.ts}&apikey=${API.apiKey}&hash=${API.hash}&limit=${comicsPerPage}&offset=${offset}`);
        const data = await response.json();
        totalComics = data.data.total;
        displayComics(data.data.results);
        updatePagination();
    } catch (error) {
        console.error(error);
    } finally {
        toggleSpinner(false);
    }
}

// Mostrar cómics en el contenedor
function displayComics(comics) {
    const comicsContainer = document.getElementById('comics-container');
    comicsContainer.innerHTML = '';

    if (comics.length > 0) {
        comics.forEach(comic => {
            const comicCard = createComicCard(comic);
            comicsContainer.appendChild(comicCard);
        });
    } else {
        comicsContainer.innerHTML = '<p>No se encontraron cómics.</p>';
    }
}

// Crear la tarjeta del cómic
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

    card.append(image, title, issueNumber);
    card.addEventListener('click', () => showComicDetails(comic));
    return card;
}

// Mostrar detalles del cómic
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

// Actualizar paginación
function updatePagination() {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';

    // Botón de página anterior
    if (currentPage > 0) {
        const prevButton = createPaginationButton('<', () => {
            currentPage--;
            fetchComics();
        });
        paginationContainer.appendChild(prevButton);
    }

    // Botón de página siguiente
    if ((currentPage + 1) * comicsPerPage < totalComics) {
        const nextButton = createPaginationButton('>', () => {
            currentPage++;
            fetchComics();
        });
        paginationContainer.appendChild(nextButton);
    }
}

// Crear botón de paginación
function createPaginationButton(text, onClick) {
    const button = document.createElement('button');
    button.innerText = text;
    button.className = 'bg-black text-white px-4 py-2 rounded mr-2 hover:bg-red-800';
    button.onclick = onClick;
    return button;
}

// Funcionalidad de búsqueda
const searchButton = document.querySelector('button');
searchButton.addEventListener('click', () => {
    const searchQuery = document.querySelector('input[type="text"]').value.trim();
    const searchType = document.querySelector('select').value;

    if (searchQuery) {
        if (searchType === 'comic') {
            fetchComicsByCharacter(searchQuery);
        }
    } else {
        alert('Por favor, ingresa un nombre para buscar');
    }
});

// Buscar cómics por personaje
async function fetchComicsByCharacter(characterName) {
    const normalizedCharacterName = characterName.trim();

    try {
        const characterResponse = await fetch(`${API.url}${API.characters}?ts=${API.ts}&apikey=${API.apiKey}&hash=${API.hash}&name=${normalizedCharacterName}`);
        const characterData = await characterResponse.json();

        if (characterData.data.results.length > 0) {
            const characterId = characterData.data.results[0].id;
            await fetchComicsByCharacterId(characterId);
        } else {
            displayMessage('No se encontró el personaje.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Obtener cómics por ID de personaje
async function fetchComicsByCharacterId(characterId) {
    try {
        const comicsResponse = await fetch(`${API.url}${API.movies}?ts=${API.ts}&apikey=${API.apiKey}&hash=${API.hash}&characters=${characterId}`);
        const comicsData = await comicsResponse.json();
        displayComics(comicsData.data.results);
    } catch (error) {
        console.error(error);
    }
}

// Mostrar mensaje
function displayMessage(message) {
    const comicsContainer = document.getElementById('comics-container');
    comicsContainer.innerHTML = `<p>${message}</p>`;
}
