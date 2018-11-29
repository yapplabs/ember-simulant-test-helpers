ember-simulant-test-helpers
==============================================================================

Offers Ember test helpers for complex interactions, using DOM events generated with [simulant.js](https://github.com/Rich-Harris/simulant).

Installation
------------------------------------------------------------------------------

```
ember install ember-simulant-test-helpers
```

Usage
------------------------------------------------------------------------------

```js
import { find } from '@ember/test-helpers';
import { panX } from 'ember-simulant-test-hlpers';

// ...

test('swipe back', async function(assert) {
  await this.render();
  await panX(find('.my-swipe-aware-thingy'), {
    position: [50, 100],
    amount: 150,
    duration: 200,
  });
});

```

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-simulant-test-helpers`
* `npm install`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
