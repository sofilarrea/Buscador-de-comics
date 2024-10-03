const urlApi = 'http//developer.marvel.com';
const urlPersonajes = '/v1/public/characters';
const apiKey = '65db027dcb3242c298c3482a2b3f65d4';

fetch( urlApi + urlPersonajes,{ 
    method: 'GET', 
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
        }
    }    
)