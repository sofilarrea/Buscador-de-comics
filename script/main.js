const urlApi = 'https://gateway.marvel.com';
const urlMovies = '/v1/public/comics';
const apiKey = '65db027dcb3242c298c3482a2b3f65d4';
const ts = '1';
const hash = '32e7770ba72dfc622c150d2fc1e02ac7';

let comics = []; 
let currentPage = 0;
const comicsPerPage = 20;
let totalComics = 0; 

// Obtener cómics
function fetchComics() {
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
    .catch(error => console.log(error));
}

// Función para mostrar los cómics
function displayComics(comics) {
    const comicsContainer = document.getElementById('comics-container');
    comicsContainer.innerHTML = ''; 

    comics.forEach(comic => {
        const comicCard = createComicCard(comic);
        comicsContainer.appendChild(comicCard);
    });
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
    console.log(comic);
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


document.addEventListener('DOMContentLoaded', fetchComics);


// Obtener los elementos del DOM
const searchInput = document.querySelector('input[type="text"]');
const searchTypeSelect = document.querySelector('select:first-of-type'); // El primer select para elegir "comic" o "personaje"
const searchButton = document.querySelector('button');

// Evento de búsqueda al hacer clic en el botón "Buscar"
searchButton.addEventListener('click', () => {
    const searchQuery = searchInput.value.trim(); // Obtener el valor del input
    const searchType = searchTypeSelect.value; // Obtener el valor del select (comic/personaje)

    if (searchQuery) {
        if (searchType === 'character') {
            // Si el tipo es "personaje", buscar cómics por personaje
            fetchComicsByCharacter(searchQuery);
        } else if (searchType === 'comic') {
            // Si el tipo es "comic", puedes implementar una búsqueda por nombre de cómic (opcional)
            fetchComicsByTitle(searchQuery);
        }
    } else {
        alert('Por favor, ingresa un nombre para buscar');
    }
});

// Función para buscar cómics por personaje
function fetchComicsByCharacter(characterName) {
    const offset = currentPage * comicsPerPage;

    fetch(`${urlApi}/v1/public/characters?ts=${ts}&apikey=${apiKey}&hash=${hash}&name=${characterName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.data.results.length > 0) {
            const characterId = data.data.results[0].id;

            fetch(`${urlApi}${urlMovies}?ts=${ts}&apikey=${apiKey}&hash=${hash}&characters=${characterId}&limit=${comicsPerPage}&offset=${offset}`, {
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
            .catch(error => console.log(error));
        } else {
            alert('No se encontró el personaje');
        }
    })
    .catch(error => console.log(error));
}
