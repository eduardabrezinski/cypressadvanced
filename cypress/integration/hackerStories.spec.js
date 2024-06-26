describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Consultando na API Real - Hitting the real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0'
        }
      }).as('getStories')

      cy.visit('/')
      cy.wait('@getStories')
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '1'
        }
      }).as('getNewStories')

      cy.get('.item').should('have.length', 20)

      cy.contains('More')
        .should('be.visible')
        .click()

      // cy.assertLoadingIsShownAndHidden()
      cy.wait('@getNewStories')

      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`
      ).as('getNewTermStories')

      cy.get('#search')
        .should('be.visible')
        .clear()
        .type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@getStories')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  context('Mocando os dados - Mocking de API', () => {
    const stories = require('../fixtures/stories')

    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getStories')
      })

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('be.visible')
            .should('contain', stories.hits[0].title)
            .should('contain', stories.hits[0].num_comments)
            .should('contain', stories.hits[0].points)
            //.should('contain', stories.hits[0].objectID)
          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('be.visible')
            .and('have.attr', 'href', stories.hits[0].url)

          cy.get('.item')
            .last()
            .should('be.visible')
            .should('contain', stories.hits[1].title)
            .should('contain', stories.hits[1].num_comments)
            .should('contain', stories.hits[1].points)
            .should('contain', stories.hits[1].objectID)
          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('be.visible')
            .and('have.attr', 'href', stories.hits[1].url)
        })

        it('shows one less stories after dimissing the first story', () => {
          cy.get('.button-small')
            .first()
            .should('be.visible')
            .click()

          cy.get('.item').should('have.length', 1)
        })

        context('Order by', () => {
          it('orders by title', () => {
            cy.get('.list-header-button:contains(Title)')
              .as('titleHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title)
            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)

            cy.get('@titleHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)
            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)

            /* it('orders by title', () => {
              // Carregar a fixture
              cy.fixture('stories').then((stories) => {
                // Ordenar os dados pelo título em ordem crescente
                const sortedHitsAsc = [...stories.hits].sort((a, b) => a.title.localeCompare(b.title))

                // Ordenar os dados pelo título em ordem decrescente
                const sortedHitsDesc = [...stories.hits].sort((a, b) => b.title.localeCompare(a.title))

                // Primeira ordenação: ordem crescente
                cy.get('.list-header-button:contains(Title)').click()

                // Verificar se o primeiro item da lista está ordenado corretamente
                cy.get('.item').first()
                  .should('be.visible')
                  .and('contain', sortedHitsAsc[0].title)
                cy.get(`.item a:contains(${sortedHitsAsc[0].title})`)
                  .should('have.attr', 'href', sortedHitsAsc[0].url)

                // Segunda ordenação: ordem decrescente
                cy.get('.list-header-button:contains(Title)').click()

                // Verificar se o primeiro item da lista está ordenado corretamente
                cy.get('.item').first()
                  .should('be.visible')
                  .and('contain', sortedHitsDesc[0].title)
                cy.get(`.item a:contains(${sortedHitsDesc[0].title})`)
                  .should('have.attr', 'href', sortedHitsDesc[0].url)
              }) */
          })

          it('orders by author', () => {
            cy.get('.list-header-button:contains(Author)')
              .as('authorHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].author)

            cy.get('@authorHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].author)
          })

          it('orders by comments', () => {
            cy.get('.list-header-button:contains(Comments)')
              .as('commentsHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments)

            cy.get('@commentsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments)
          })

          it('orders by points', () => {
            cy.get('.list-header-button:contains(Points)')
              .as('pointssHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)

            cy.get('@pointssHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].points)
          })
        })
      })
    })
  })

  context('Search', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'empty' }
      ).as('getEmptyStories')

      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`,
        { fixture: 'stories' }
      ).as('getStories')

      cy.visit('/')
      cy.wait('@getEmptyStories')

      cy.get('#search')
        .should('be.visible')
        .clear()
    })

    it('show no stories when none is returned', () => {
      cy.get('.item')
        .should('not.exist')
    })

    it('types and hits ENTER', () => {
      cy.get('#search')
        .should('be.visible')
        .type(`${newTerm}{enter}`)

      cy.wait('@getStories')

      cy.get('.item')
        .should('have.length', 2)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    it('types and clicks the submit button', () => {
      cy.get('#search')
        .should('be.visible')
        .type(newTerm)
      cy.contains('Submit')
        .should('be.visible')
        .click()

      // cy.assertLoadingIsShownAndHidden()
      // Pego o termo anterior, não é necessário adicionar um novo intercept aqui visto que a busca direciona para o mesmo endereço
      cy.wait('@getStories')

      cy.get('.item')
        .should('have.length', 2)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    context('Last searches', () => {
      Cypress._.times(2, () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')

          cy.intercept(
            'GET',
            '**/search**',
            { fixture: 'empty' }
          ).as('getLastStories')

          Cypress._.times(6, () => {
            cy.get('#search')
              .clear()
              .type(`${faker.random.word()}{enter}`)
              .wait('@getLastStories')
          })

          // cy.assertLoadingIsShownAndHidden()

          cy.get('.last-searches button')
            .should('have.length', 5)
        })
      })
    })
  })
})

// Simulando erro em servidor e falta de internet
context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      {
        statusCode: 500
      }
    ).as('getServerError')

    cy.visit('/')

    cy.wait('@getServerError')

    cy.get('p:contains(Something went wrong ...)')
      .should('be.visible')
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

    cy.get('p:contains(Something went wrong ...)')
      .should('be.visible')
  })
})
