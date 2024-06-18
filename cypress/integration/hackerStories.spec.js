describe('Hacker Stories', () => {
  beforeEach(() => {
    /* cy.visit('/')

    cy.assertLoadingIsShownAndHidden()
    cy.contains('More').should('be.visible')
    */

    // Aguarda a página inicial estar carregada para então fazer um acesso
    /* cy.intercept('GET', '/search?query=React&page=0').as('firstPage')
    cy.visit('/')
    cy.wait('@firstPage')
    */

    // Nova refatoração

    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: 'React',
        page: '0'
      }
    }).as('getStories')

    cy.visit('/')
    cy.wait('@getStories')
  })

  it('shows the footer', () => {
    cy.get('footer')
      .should('be.visible')
      .and('contain', 'Icons made by Freepik from www.flaticon.com')
  })

  context('List of stories', () => {
    // Since the API is external,
    // I can't control what it will provide to the frontend,
    // and so, how can I assert on the data?
    // This is why this test is being skipped.
    // TODO: Find a way to test it out.
    it.skip('shows the right data for all rendered stories', () => { })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: 'React',
          page: '1'
        }
      }).as('getNewStories')

      cy.get('.item').should('have.length', 20)

      cy.contains('More').click()

      // cy.assertLoadingIsShownAndHidden()
      cy.wait('@getNewStories')

      cy.get('.item').should('have.length', 40)
    })

    it('shows only nineteen stories after dimissing the first story', () => {
      cy.get('.button-small')
        .first()
        .click()

      cy.get('.item').should('have.length', 19)
    })

    // Since the API is external,
    // I can't control what it will provide to the frontend,
    // and so, how can I test ordering?
    // This is why these tests are being skipped.
    // TODO: Find a way to test them out.
    context.skip('Order by', () => {
      it('orders by title', () => { })

      it('orders by author', () => { })

      it('orders by comments', () => { })

      it('orders by points', () => { })
    })

    // Hrm, how would I simulate such errors?
    // Since I still don't know, the tests are being skipped.
    // TODO: Find a way to test them out.


    context('Search', () => {
      const initialTerm = 'React'
      const newTerm = 'Cypress'

      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${newTerm}&page=0`
        ).as('getNewTerm')

        cy.get('#search')
          .clear()
      })

      it('types and hits ENTER', () => {
        cy.get('#search')
          .type(`${newTerm}{enter}`)

        // cy.assertLoadingIsShownAndHidden()

        cy.wait('@getNewTerm')

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {

        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()

        //cy.assertLoadingIsShownAndHidden()
        //Pego o termo anterior, não é necessário adicionar um novo intercept aqui visto que a busca direciona para o mesmo endereço
        cy.wait('@getNewTerm')

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      context('Last searches', () => {
        it('searches via the last searched term', () => {
          cy.get('#search')
            .type(`${newTerm}{enter}`)

          //cy.assertLoadingIsShownAndHidden()
          cy.wait('@getNewTerm')

          cy.get(`button:contains(${initialTerm})`)
            .should('be.visible')
            .click()

          //cy.assertLoadingIsShownAndHidden()
          cy.wait('@getStories')

          cy.get('.item').should('have.length', 20)
          cy.get('.item')
            .first()
            .should('contain', initialTerm)
          cy.get(`button:contains(${newTerm})`)
            .should('be.visible')
        })

        Cypress._.times(6, () => {
          it('shows a max of 5 buttons for the last searched terms', () => {
            const faker = require('faker')

            cy.intercept(
              'GET',
              '**/search**'
            ).as('getLastStories')

            Cypress._.times(6, () => {
              cy.get('#search')
                .clear()
                .type(`${faker.random.word()}{enter}`)
                .wait('@getLastStories')
            })

            //cy.assertLoadingIsShownAndHidden()

            cy.get('.last-searches button')
              .should('have.length', 5)
          })
        })
      })
    })
  })
})

context
('Errors', () => {

  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      {
        statusCode: 500
      }
    ).as('getServerFailure')

    cy.visit('/')

    cy.wait('@getServerFailure')

    cy.get('p:contains(Something went wrong ...)').should('be.visible')

  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      {
        forceNetworkError: true
      }
    ).as('getNetworkError')

    cy.visit('/')

    cy.wait('@getNetworkError')

    cy.get('p:contains(Something went wrong ...)').should('be.visible')


  })

})
