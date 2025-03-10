Cypress.Commands.add('loginToApplication', () => {

    const userCredentials = {
        "user": {
          //"email": "fefe@cytest.com",
          //"password": "admin123"
          "email": Cypress.env("username"),
          "password": Cypress.env("password")
        }
      }

    //BackEnd LOG IN:
        //cy.request('POST', Cypress.env('mainUrl')+'/api/users/login', userCredentials)
        cy.request('POST', Cypress.env("mainUrl")+'/api/users/login', userCredentials)
        .its('body').then(body => {
            const token = body.user.token;

            //cy.wrap(token).as('token');
            
            cy.visit('/', {
                onBeforeLoad(win){
                    win.localStorage.setItem('jwtToken', token);
                }
            })
        });
    });