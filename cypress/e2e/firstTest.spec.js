describe('Testing with BE', () => {
  

  beforeEach('Login to application', () => {
    cy.intercept({method: 'Get', path: 'tags'}, {fixture: 'tags.json'});
    cy.loginToApplication();
  });


  it('verify correct request and response', {browser:'!chrome'}, () => {
    
    cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles');//URL response might be 422 if post with same title!!
    //https://conduit-api.bondaracademy.com/api/articles/

    cy.contains('New Article').click();
    cy.wait(10000);
    cy.get('[formcontrolname="title"]').type('A test title');
    cy.get('[formcontrolname="description"]').type('A test description');
    cy.get('[formcontrolname="body"]').type('A test body');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then( xhr => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal('A test body');
      expect(xhr.response.body.article.description).to.equal('A test body');
    });
  });

  it('intercepting and modifying request and response CASE 1', () => {
    
    cy.intercept('POST', '**/articles', (req) => {
      req.body.article.description = "This is a description 2"; //NO AMIGO! ES TERRIBLE ESTO
    }).as('postArticles');//URL response might be 422 if post with same title!!
    //https://conduit-api.bondaracademy.com/api/articles/

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('A test title');
    cy.get('[formcontrolname="description"]').type('A test description');//YO ESPERABA ESTO!
    cy.get('[formcontrolname="body"]').type('A test body');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles');
    cy.get('@postArticles').then( xhr => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal('A test body');
      expect(xhr.response.body.article.description).to.equal('This is a description 2');//PERO ESTE ES EL QUE SE TERMINA ENVIANDO <.<
    });
  });

  it('intercepting and modifying request and response CASE 2', () => {
    
    cy.intercept('POST', '**/articles', (req) => {
      req.reply( res => {
        expect(res.body.article.description).to.equal('A test description');
        res.body.article.description = "This is an intercepted response !!!";
      });
    }).as('postArticles');//URL response might be 422 if post with same title!!
    //https://conduit-api.bondaracademy.com/api/articles/

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('A test title');
    cy.get('[formcontrolname="description"]').type('A test description');//YO ESPERABA ESTO!
    cy.get('[formcontrolname="body"]').type('A test body');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles');
    cy.get('@postArticles').then( xhr => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal('A test body');
      expect(xhr.response.body.article.description).to.equal('This is an intercepted response !!!');//ESTO ES RE HEAVY TERRIBLE FALSO POSITIVO
    });
  });

  it.only('verify popular tags are displayed', () => {//This will ONLY execute under firefox browser. Skipped on every other browser. 
    cy.get('.tag-list')
    .should('contain', 'cypress')
    .should('contain', 'automation')
    .should('contain', 'testing');
  });

  it('verify global feed likes count', () => {
    cy.intercept('GET', Cypress.env('baseUrl')+'/api/articles/feed*', {"articles":[],"articlesCount":0});
    cy.intercept('GET', Cypress.env('baseUrl')+'api/articles*', {fixture: 'articles.json'});

    cy.contains('Global Feed').click();
    cy.get('app-article-list button').then(heartList => {
      expect(heartList[0]).to.contain('533');
      expect(heartList[1]).to.contain('5');
    });

    cy.fixture('articles.json').then( file => {
      const articleLink = file.articles[1].slug;
      file.articles[1].favoritesCount = 6;
      cy.intercept('POST', Cypress.env('apiUrl')+'/api/articles/'+articleLink+'/favorite');
    });

    cy.get('app-article-list button').eq(1).click().should('contain', '6');
  });

  it('delete a new article in a global feed', () => {

    const articleBodyRequest = {
      "article": {
        "tagList": [],
        "title": "Request from API",
        "description": "Cypression",
        "body": "SHAZZAM!"
      }
    }

      cy.request({
        url: Cypress.env('baseUrl')+'/api/articles',
        headers: {'Authorization': 'Token '+token},
        method: 'POST',
        body: articleBodyRequest
      }).then(resp => {
        expect(resp.status).to.equal(201);
      });

      cy.contains('Global Feed').click();
      cy.get('.article-preview').first().find('.preview-link').click();
      cy.get('.article-actions').contains('Delete Article').click();
      cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',
        headers: {'Authorization': 'Token '+token},
        method: 'GET'})
        .its('body').then(body => {
          expect(body.articles[0].title).not.to.equal('Request from API (Cypress scripted)')
        });
    });

});


