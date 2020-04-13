const API_URL = "https://api.mercadolibre.com/sites/MLB/search?q=$computador"
const PROJECT_URL = 'andrey/index.html'

const LOADING = '.loading';
const ITEMS = '.items';
const ITEM_SELECTOR = '.item';
const ADD_CART_BUTTON = '.item__add'
const CART_ITEMS = '.cart__items'
const EMPTY_CART_BUTTON = '.empty-cart'
const TOTAL_PRICE = '.total-price'

const addToCart = (index) => {
  cy.get(ITEMS)
    .children()
    .eq(index)
    .children(ADD_CART_BUTTON)
    .click()
    .wait(1000);
}

const countCart = (amount) => {
  cy.get(CART_ITEMS)
      .children()
      .should('have.length', amount);
}

const checkPrice = () => {
  cy.get(CART_ITEMS)
    .children()
    .then((items) => {
      let total = 0;
      Array.from(items).forEach((item) => {
        let itemInfo = item.innerText.split('$');
        total += parseFloat(itemInfo[1]);
      })
      cy.get(TOTAL_PRICE)
          .should('have.text', total.toString());
    })
}

describe('Shopping Cart Project', () => {


  before(() => {
    cy.visit(PROJECT_URL); 
  });

  afterEach(() => {
    cy.clearLocalStorage();
  })

  it('Listagem de produtos', () => {
    cy.get(ITEM_SELECTOR)
      .should('exist')
      .should('have.length', 50);
  });

  it('Adicione o produto ao carrinho de compras',() => {
    cy.wait(1000);
    addToCart(36);
    countCart(1);
    cy.get(CART_ITEMS)
      .children()
      .first()
      .then((data) => {
        let cartItem = data[0].innerText.split('|').map( element => element.trim() );
        cy.get(ITEMS)
          .children()
          .eq(36)
          .children()
          .then((data) => {
            let itemInfo = Array.from(data);
            expect(cartItem[0]).to.deep.equal(`SKU: ${itemInfo[0].innerText}`)
            expect(cartItem[1]).to.deep.equal(`NAME: ${itemInfo[1].innerText}`);
          })
      })
  });

  it('Remova o item do carrinho de compras ao clicar nele', () => {
    cy.visit(PROJECT_URL, {
      onLoad: () => {
        addToCart(29)
        addToCart(31)
        addToCart(15)
      }
    })
    cy.get(CART_ITEMS)
      .children()
      .eq(1)
      .click()
    countCart(2);
    cy.get(CART_ITEMS)
      .children()
      .eq(1)
      .click()
    countCart(1);
    cy.get(CART_ITEMS)
      .children()
      .eq(0)
      .click()
    countCart(0);

  });

  it('Carregue o carrinho de compras através do **LocalStorage** ao iniciar a página', () => {
    let first = 36;
    let last = 29;

    cy.visit(PROJECT_URL)
    addToCart(first);
    countCart(1);
    cy.get(CART_ITEMS)
      .children()
      .first()
      .should('not.have.length', 0)
    addToCart(last);
    cy.get(CART_ITEMS)
      .children()
      .last()
      .should('not.have.length', 0)
    countCart(2);
    cy.visit(PROJECT_URL)
    countCart(2);
    cy.get(CART_ITEMS)
      .children()
      .first()
      .should('not.have.length', 0)
    cy.get(CART_ITEMS)
      .children()
      .last()
      .should('not.have.length', 0)
  });

  it('Some o valor total dos itens do carrinho de compras de forma assíncrona', () => {
    addToCart(5);
    checkPrice();
    addToCart(42);
    checkPrice();
    addToCart(36);
    checkPrice();
    addToCart(15);
    checkPrice();
    cy.get(CART_ITEMS)
      .children()
      .eq(1)
      .click()
    checkPrice();
  });

  it('Botão para limpar carrinho de compras', () => {
    addToCart(3);
    addToCart(0);
    addToCart(1);
    countCart(3);
    cy.get(EMPTY_CART_BUTTON)
      .click()
    countCart(0);
  });

  it('Adicionar um texto de "loading" durante uma requisição à API', () => {
    cy.visit(PROJECT_URL)
    if (cy.get(LOADING)) {
      cy.get(LOADING)
        .should('exist')
        .wait(3000)
        .should('not.exist');
    } else {
      cy.vist(PROJECT_URL, {
        onBeforeLoad: () => {
          cy.get(LOADING)
            .should('exist');
        },
        onLoad: () => {
          cy.get(LOADING)
            .should('not.exist');
        }
      })
    }

  });
});
