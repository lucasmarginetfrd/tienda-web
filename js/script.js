const baseURL = "https://6679a0f718a459f63950cac8.mockapi.io/"
const formHTML = document.querySelector("#prod-form")
const tBodyHtml = document.querySelector("#table-body")
const bodyTiendaHTML = document.querySelector("#body-tienda")
let isEditing

/*   Mostrar productos    */

function renderProducts(product) {
    tBodyHtml.innerHTML = "";
    product.forEach(prod => {
        tBodyHtml.innerHTML += `
            <tr>
                <td class="product-image">
                    <img src="${prod.image}" alt="${prod.name} imagen">
                </td>
                <td>${prod.name}</td>
                <td>${prod.description}</td>
                <td><i>${prod.category}</i></td>
                <td>$${prod.price}</td>
                <td>${transformTimestampToDate()}</td>
                <td class="user-actions">
                    <button class="btn btn-sm mt-1 btn-danger" onclick="deleteProduct(${prod.id})"> <i class="fa-solid fa-trash"></i></button>
                    <button class="btn btn-sm mt-1" style="color: white; background-color: #809583" onclick="editProduct(${prod.id})"><i class="fa-solid fa-pencil"></i></button>
                </td>
            </tr>            
        `
    });
}

async function getProducts(){
    const resultado = await axios.get(`${baseURL}/products`)
    const productos = resultado.data
    renderProducts(productos)
}

getProducts()

/*   Mostrar cartas de productos    */

function renderCards(product) {
    bodyTiendaHTML.innerHTML = "";
    product.forEach(prod => {
        bodyTiendaHTML.innerHTML += `
            <div class="card">
                <img src="${prod.image}" class="card-img-top" alt=${prod.name}">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">$${prod.price}</li>
                </ul>
                <div class="card-body" style>
                    <h5 class="card-title">${prod.name}</h5>
                    <p class="card-text">${prod.description}</p>
                </div>
                <div class="btnCartas">
                        <a href="#" class="btn" style="color: white; background-color: #809583"><b>Anadir al carrito</b></a>
                </div>
            </div>
        `
    })
}

async function getProductCards() {
    const resultado = await axios.get(`${baseURL}/products`)
    const productos = resultado.data
    renderCards(productos)
}

getProductCards()

/*   Cargar y editar productos   */

formHTML.addEventListener("submit", evento => {
    evento.preventDefault()
    const product = evento.target.elements
    const nuevoProducto = {
        image: product.image.value,
        name: product.name.value,
        description: product.description.value,
        category: product.category.value,
        price: product.price.value
    }
    if (isEditing) {
        modProduct(nuevoProducto)
        isEditing = undefined
        document.getElementById("prod-form").reset();
    } else {
        createProduct(nuevoProducto)
        isEditing = undefined
        document.getElementById("prod-form").reset();
    }
})

async function createProduct(product) {
    try {
        await axios.post(`${baseURL}/products`, product)
        const resultado = await axios.get(`${baseURL}/products`)
        const productos = resultado.data
        renderProducts(productos)
        Swal.fire({
            title: "Creado!",
            text: "El producto se creo correctamente",
            icon: "success"
          });
    } catch (error) {
        Swal.fire({
            icon: "Error",
            title: "No se pudo crear el producto",
            text: "Something went wrong!"
          });
    }
}
async function modProduct(product) {
    try {
        await axios.put(`${baseURL}/products/${isEditing}`, product)
        const resultado = await axios.get(`${baseURL}/products`)
        const productos = resultado.data
        renderProducts(productos)
        Swal.fire({
            title: "Modificado!",
            text: "El producto se modifico correctamente",
            icon: "success"
          });
    } catch (error) {
        Swal.fire({
            icon: "Error",
            title: "No se pudo modificar el producto",
            text: "Something went wrong!"
          });
    }
}

async function editProduct(id) {
    isEditing = id
    const prodGet = await axios.get(`${baseURL}/products/${id}`)
    const product = prodGet.data
    const prod = formHTML.elements
    prod.image.value = product.image
    prod.name.value = product.name
    prod.description.value = product.description
    prod.category.value = product.category
    prod.price.value = product.price
}

/*   Eliminar productos    */

function deleteProduct(id) {
    Swal.fire({
        title: "Estas seguro?",
        text: "Una vez eliminado no hay vuelta atras",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#809583",
        cancelButtonColor: "#DC3545",
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
            await axios.delete(`${baseURL}/products/${id}`)
            const resultado = await axios.get(`${baseURL}/products`)
            const productos = resultado.data
            renderProducts(productos)
            Swal.fire({
            title: "Eliminado",
            text: "El producto ha sido elimminado correctamente.",
            icon: "success"
          });
        }
      });
}

/*   Buscar productos    */

async function inputSearch(evt) {
    const resultado = await axios.get(`${baseURL}/products`)
    const productos = resultado.data
    const search = evt.target.value.toLowerCase();
    const filteredProducts = productos.filter((prod) => {
      if (prod.name.toLowerCase().includes(search)) {
        return true;
      }
      return false;
    })
    renderProducts(filteredProducts)
}

/*   Ordenar productos por precio   */

async function sortAsc() {
    const resultado = await axios.get(`${baseURL}/products`)
    const productos = resultado.data
    productos.sort(function (a, b) {
      return a.price - b.price
    })
  
    renderProducts(productos);
}
  
async function sortDesc() {
    const resultado = await axios.get(`${baseURL}/products`)
    const productos = resultado.data
    productos.sort((a, b) => {
      return b.price - a.price
    })
  
    renderProducts(productos);
  
}

/*   Fecha del producto   */

function transformTimestampToDate(dateTimeStamp){
    const dateFormat = new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
        })
    return dateFormat.format(dateTimeStamp).split(",").reverse().join(" ").trim();
}

/*   Filtrar productos por categoria   */

async function botonCategorias(cat) {
    const resultado = await axios.get(`${baseURL}/products`)
    const productos = resultado.data
    const filteredCards = productos.filter((prod) => {
      if (prod.category.toLowerCase().includes(cat.toLowerCase())) {
        return true;
      }
      return false;
    })
    renderCards(filteredCards)
}

/*   Buscar cartas de productos en tienda   */

async function inputSearchCards(evt) {
    const resultado = await axios.get(`${baseURL}/products`)
    const productos = resultado.data
    const search = evt.target.value.toLowerCase();
    const filteredCards = productos.filter((prod) => {
      if (prod.name.toLowerCase().includes(search)) {
        return true;
      }
      return false;
    })
    renderCards(filteredCards)
}