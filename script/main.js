const urlApi = 'https://gateway.marvel.com';
const urlMovies = '/v1/public/comics';
const apiKey = '65db027dcb3242c298c3482a2b3f65d4';
const ts = '1';
const hash = '32e7770ba72dfc622c150d2fc1e02ac7';

let comics = []; // Variable global para almacenar los cómics

// Obtener cómics
fetch(urlApi + urlMovies + `?ts=${ts}&apikey=${apiKey}&hash=${hash}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
})
.then(response => response.json())
.then(data => {
    console.log(data); // Agrega este log para ver toda la respuesta
    const comicsContainer = document.getElementById('comics-container');
    const comics = data.data.results;

    // Iteramos sobre los cómics y creamos una card por cada uno
    comics.forEach(comic => {
        const comicCard = createComicCard(comic);
        comicsContainer.appendChild(comicCard);
    });
})
.catch(error => console.log(error));

// Función para crear la card del cómic
function createComicCard(comic) {
    const card = document.createElement('div');
    card.className = 'comic-card bg-white border rounded shadow p-4 cursor-pointer';
    card.dataset.id = comic.id; // Almacena el ID del cómic en el dataset

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
    const comicsContainer = document.getElementById('comics-container'); // Contenedor de las cards
    const detailsSection = document.getElementById('comic-details'); // Sección de detalles
    const comicImage = document.getElementById('comic-image');
    const comicTitle = document.getElementById('comic-title');
    const comicPublished = document.getElementById('comic-published');
    const comicWriters = document.getElementById('comic-writers');
    const comicDescription = document.getElementById('comic-description');

    // Asignar la información del cómic a los elementos
    comicImage.src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    comicImage.alt = `${comic.title} (${comic.issueNumber})`; // Atributo alt para accesibilidad
    comicTitle.innerText = `${comic.title} (${comic.issueNumber})`;
    comicPublished.innerText = `Publicado: ${comic.dates[0].date.split('T')[0]}`; // Formato YYYY-MM-DD

    // Asignar guionistas
    comicWriters.innerText = comic.creators.items.length > 0 
        ? `Guionistas: ${comic.creators.items.map(writer => writer.name).join(', ')}`
        : 'Guionistas: Información no disponible';

    // Asignar descripción
    if (comic.description) {
        comicDescription.innerText = comic.description;
    } else if (comic.stories.available > 0) {
        // Si no hay descripción, intenta obtenerla de las historias
        const storyDescriptions = comic.stories.items.map(story => {
            // Aquí se asume que cada historia tiene una propiedad description
            // Asegúrate de verificar la estructura de datos que devuelve la API
            return story.description || 'Descripción no disponible'; // Cambia esta línea si la propiedad es diferente
        });

        comicDescription.innerText = storyDescriptions.join(', ');
    } else {
        comicDescription.innerText = 'Descripción no disponible.';
    }

    // Ocultar la sección de comics y mostrar la sección de detalles
    comicsContainer.classList.add('hidden'); // Oculta las cards
    detailsSection.classList.remove('hidden'); // Muestra la sección de detalles
}
