const urlApi = 'https://gateway.marvel.com';
const urlPersonajes = '/v1/public/characters';
const apiKey = '65db027dcb3242c298c3482a2b3f65d4';
const ts = '1';
const hash = '32e7770ba72dfc622c150d2fc1e02ac7';
const urlMovies = '/v1/public/comics'

// Obtener personajes (si los necesitas)
fetch(urlApi + urlPersonajes + `?ts=${ts}&apikey=${apiKey}&hash=${hash}`, { 
    method: 'GET', 
    headers: {
        'Content-Type': 'application/json',
       /*  'Authorization': `${apiKey}`, */
        }
    }    
)
/* .then((response) => response.json())
.then((data) => console.log(data))
.catch((error) => console.log(error)) */



// Suponiendo que ya tienes el fetch funcionando y obtienes los datos de los cómics
fetch(urlApi + urlMovies + `?ts=${ts}&apikey=${apiKey}&hash=${hash}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
})
.then(response => response.json())
.then(data => {
    const comicsContainer = document.getElementById('comics-container');
    const comics = data.data.results;

    // Iteramos sobre los cómics y creamos una card por cada uno
    comics.forEach(comic => {
        const comicCard = document.createElement('div');
        // Añadimos clases de Tailwind para el diseño y efectos de hover
        comicCard.classList.add('bg-white', 'shadow-lg', 'rounded', 'overflow-hidden', 'p-4', 'transform', 'transition', 'duration-300', 'hover:scale-105', 'hover:shadow-2xl');

        const comicImage = document.createElement('img');
        comicImage.src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
        comicImage.alt = comic.title;
        comicImage.classList.add('w-full', 'h-64', 'object-cover');

        // Creamos el título del cómic
        const comicTitle = document.createElement('h2');
        comicTitle.textContent = comic.title;
        comicTitle.classList.add('mt-4', 'text-xl', 'font-bold', 'text-center');

        // Agregamos la imagen y el título a la card
        comicCard.appendChild(comicImage);
        comicCard.appendChild(comicTitle);

        // Agregamos la card al contenedor
        comicsContainer.appendChild(comicCard);
    });
})
.catch(error => console.log(error));
