$(document).ready(function(){
  $('.sidenav').sidenav();
	$('.fixed-action-btn').floatingActionButton();
	$('.tooltipped').tooltip();
});

let header = $('header');
let range = 200;

$(window).on('scroll', function () {
  
  let scrollTop = $(this).scrollTop(),
      height = header.outerHeight(),
      offset = height / 1.1,
      calc = 1 - (scrollTop - offset + range) / range;

  header.css({ 'opacity': calc });

  if (calc > '1') {
    header.css({ 'opacity': 1 });
  } else if ( calc < '0' ) {
    header.css({ 'opacity': 0 });
  }
  
});

function digitosPaginacao(number, limit) {
    const result = [];

    if (number < 2) {
        number = 2;
    } else if (number > limit - 2) {
        number = limit - 2;
    }

    for (let i = number - 2; i <= number + 2; i++) {
        result.push(i);
    }

    return result;
}

function getPrice(number) {
    if (number % 2 === 0) {
        // Preço normal
        number = String(parseInt(String(number).slice(0, 4)) / 100).padEnd(5, '0');
    } else {
        // Preço mais alto
        number = String(parseInt(String(number).slice(0, 5)) / 100).padEnd(6, '0');
    }
    return number
}

function fetchProducts(offsetMultiplier) {
    if (offsetMultiplier === undefined) {
        offsetMultiplier = 0;
    }

    let publicKey = "f0b19d99feab00f681aa29b26587c64a";
    let privateKey = "233e5bd422f59df75e6c54402bce05a1170bcb7b";
    let ts = new Date().getTime().toString();
    let hash = md5(ts + privateKey + publicKey).toLowerCase();

    let apiUrl = "https://gateway.marvel.com:443/v1/public/characters";
    let limit = 20;
    let offset = limit * offsetMultiplier;

    let requestUrl = apiUrl +
        "?limit=" + limit +
        "&offset=" + offset +
        "&ts=" + ts +
        "&apikey=" + publicKey +
        "&hash=" + hash;

    $.ajax({
        url: requestUrl,
        method: "GET",
        beforeSend: function(xhr) {
            const produtosDiv = document.getElementById("produtos");

            for (let i = 0; i < 20; i++) {
                const cardDiv = document.createElement("div");
                cardDiv.classList.add("col", "s12", "m3");
                cardDiv.innerHTML = `
                    <div class="card" id="produto_${i}">
                        <div class="card-image">
                            <img src="img/loading-img.gif">
                        </div>
                        <div class="card-content">
                            <div class="animated-background" style="height: 40px">
                                <div class="background-masker"></div>
                            </div>
                            <div style="height: 50px"></div>
                            <div class="animated-background">
                                <div class="background-masker"></div>
                            </div>
                        </div>
                    </div>
                `;
                produtosDiv.appendChild(cardDiv);
            }
        },
        success: function(response) {
            console.log(response);
            const paginas_total = Math.ceil((response.data.total / 20))
            const results = response.data.results;
            let produto = 0;

            // Verifica se o offsetMultiplier é maior que o total de páginas, se for retornar última página
            if (offsetMultiplier > paginas_total) {
                fetchProducts(paginas_total - 1);
            }

            // Produtos
            results.forEach(result => {
                let image = result.thumbnail.path === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available' ? 'img/not-found.webp' : `${result.thumbnail.path}.${result.thumbnail.extension}`;
                document.getElementById("produto_" + produto).innerHTML = `
                <a href="single.html?id=${result.id}">
                    <div class="card">
                        
                            <div class="card-image">
                                <img class="responsive-img" src="${image}" alt="" style="height: 300px">
                            </div>
                            <div class="card-content">
                                <h1 class="black-text center" style="font-size: 20pt; height: 100px">
                                  ${result.name}
                                </h1>
                                <p class="amarelo-texto center" style="font-size: 14pt">R$ ${getPrice(result.id)}</p>
                            </div>
                    </div>
                </a>
                `;
                produto++;
            });

            if (produto < 20) {
                for (let i = produto; i < 20; i++) {
                    document.getElementById("produto_" + i).remove();
                }
            }

            // Botões de paginação
            const paginas = digitosPaginacao(offsetMultiplier, paginas_total - 1);
            let pagina_html = '';

            for (let i = 0; i < 5; i++) {
                pagina_html += `
                    <li class="${parseInt(paginas[i]) === parseInt(offsetMultiplier) ? 'active' : ''}"><a href="produtos.html?page=${paginas[i]}">${paginas[i] + 1}</a></li>
                `;
            }
            document.getElementById("paginacao").innerHTML = pagina_html;

        },
        error: function(error) {
            console.error(error);
        }
    });
}

function maisVendidos(id) {
    const publicKey = "f0b19d99feab00f681aa29b26587c64a";
    const privateKey = "233e5bd422f59df75e6c54402bce05a1170bcb7b";
    let ts = new Date().getTime().toString();
    let hash = md5(ts + privateKey + publicKey).toLowerCase();
    let apiUrl = "https://gateway.marvel.com:443/v1/public/characters/";


    for (let i = 0; i < 4; i++) {

        let requestUrl = apiUrl +
            id[i] +
            "?ts=" + ts +
            "&apikey=" + publicKey +
            "&hash=" + hash;

        $.ajax({
            url: requestUrl,
            method: "GET",
            success: function(response) {
                // console.log(response);
                const results = response.data.results[0];
                let image = results.thumbnail.path === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available' ? 'img/not-found.webp' : `${results.thumbnail.path}.${results.thumbnail.extension}`;
                document.getElementById("produto_" + i).innerHTML = `
               <a href="single.html?id=${id[i]}">
                    <div class="card">
                      <div class="card-image">
                        <img class="responsive-img" src="${image}" alt="" style="height: 300px">
                      </div>
                      <div class="card-content">
                        <h1 class="black-text center" style="font-size: 20pt; height: 100px"> ${results.name} </h1>
                        <div style="height: 50px"></div>
                        <p class="amarelo-texto center" style="font-size: 14pt">R$ ${getPrice(results.id)}</p>
                      </div>
                    </div>
                </a>
                `;
            },
            error: function(error) {
                console.error(error);
            }
        });
    }
}
