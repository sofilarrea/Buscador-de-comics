const urlApi = 'https://gateway.marvel.com';
const urlPersonajes = '/v1/public/characters';
const apiKey = '65db027dcb3242c298c3482a2b3f65d4';
const ts = '1';
const hash = '32e7770ba72dfc622c150d2fc1e02ac7';


fetch( urlApi + urlPersonajes + `?ts=${ts}&apikey=${apiKey}&hash=${hash}`, { 
    method: 'GET', 
    headers: {
        'Content-Type': 'application/json',
       /*  'Authorization': `${apiKey}`, */
        }
    }    
)
.then((response) => response.json())
.then((data) => console.log(data))
.catch((error) => console.log(error))