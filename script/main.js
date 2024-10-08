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
        hideSpinner(); 
    })
    .catch(error => console.log(error));
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
        // Mostrar mensaje cuando no se encuentran cómics
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

    // Agregar evento de clic a la card
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

    // Asignar la información del cómic a los elementos
    comicImage.src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    comicImage.alt = `${comic.title} (${comic.issueNumber})`; 
    comicTitle.innerText = `${comic.title} (${comic.issueNumber})`;
    comicPublished.innerText = `Publicado: ${comic.dates[0].date.split('T')[0]}`; 

    // Asignar guionistas
    comicWriters.innerText = comic.creators.items.length > 0 
        ? `Guionistas: ${comic.creators.items.map(writer => writer.name).join(', ')}`
        : 'Guionistas: Información no disponible';

    // Asignar descripción
    comicDescription.innerText = comic.description || 'Descripción no disponible.';

    comicsContainer.classList.add('hidden'); 
    detailsSection.classList.remove('hidden'); 
}

// Función para actualizar la paginación
function updatePagination() {
    showSpinner();
    hideSpinner(); 
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
    hideSpinner(); 

}
// Busqueda de comic
const searchInput = document.querySelector('input[type="text"]');
const searchTypeSelect = document.querySelector('select'); 
const searchButton = document.querySelector('button');

searchButton.addEventListener('click', () => {
    showSpinner();
    const searchQuery = searchInput.value.trim(); 
    const searchType = searchTypeSelect.value; 

    if (searchQuery) {
        if (searchType === 'comic') {
            fetchComicsByCharacter(searchQuery);
        }
    } else {
        alert('Por favor, ingresa un nombre para buscar');
    }
});

// Función para buscar cómics que contienen a un personaje
function fetchComicsByCharacter(characterName) {
    const normalizedCharacterName = characterName.trim();

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

            // Segundo fetch para obtener los cómics donde aparece el personaje
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
            })
            .catch(error => console.log(error));
        } else {
            // Manejar el caso en que no se encuentra el personaje
            const comicsContainer = document.getElementById('comics-container');
            comicsContainer.innerHTML = ''; 
            const messageElement = document.createElement('p');
            messageElement.textContent = 'No se encontró el personaje.';
            comicsContainer.appendChild(messageElement);
        }
    })
    .catch(error => console.log(error));
}

document.addEventListener('DOMContentLoaded', fetchComics);
