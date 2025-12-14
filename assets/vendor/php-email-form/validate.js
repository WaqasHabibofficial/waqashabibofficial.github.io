/**
* PHP Email Form Validation - Adapted for Web3Forms
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;
      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

      if (!action) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }

      toggleState(thisForm, true);

      let formData = new FormData(thisForm);

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
                .then(token => {
                  formData.set('recaptcha-response', token);
                  submitForm(thisForm, action, formData);
                });
            } catch (error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!');
        }
      } else {
        submitForm(thisForm, action, formData);
      }
    });
  });

  function submitForm(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => response.text())
    .then(data => {
      toggleState(thisForm, false);
      try {
        const json = JSON.parse(data);
        if (json.success) {
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset();
        } else {
          throw new Error(json.message || 'Form submission failed.');
        }
      } catch (err) {
        throw new Error('Invalid response from server.');
      }
    })
    .catch(error => {
      displayError(thisForm, error.message || error);
    });
  }

  function toggleState(thisForm, loading) {
    thisForm.querySelector('.loading').classList.toggle('d-block', loading);
    thisForm.querySelector('.error-message').classList.remove('d-block');
    thisForm.querySelector('.sent-message').classList.remove('d-block');
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
