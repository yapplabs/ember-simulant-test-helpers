'use strict';

const BroccoliDebug = require('broccoli-debug');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

const debugTree = BroccoliDebug.buildDebugCallback('ember-simulant-test-helpers');
const path = require('path');

module.exports = {
  name: require('./package').name,

  treeForAddonTestSupport(tree) {
    // intentionally not calling _super here
    // so that can have our `import`'s be
    // import { ... } from 'ember-simulant-test-helpers';

    var simulantPath = path.dirname(require.resolve('simulant/package.json'));
    let simulantTree = new Funnel(simulantPath, {
      include: [ 'dist/simulant.es.js' ],
      annotation: 'Funnel: simulant JS for test-support',
      getDestinationPath(/* srcPath */) {
        return 'ember-simulant-test-helpers/simulant.js';
      }
    });

    let input = debugTree(tree, 'addon-test-support:input');
    input = debugTree(new MergeTrees([input, simulantTree]), 'addon-test-support:input-with-simulant');

    input = debugTree(
      new Funnel(input, {
        destDir: '.'
      }),
      'addon-test-support:input-relocated'
    );

    let output = this.preprocessJs(input, '/', this.name, {
      registry: this.registry,
    });

    return debugTree(output, 'addon-test-support:output');
  }
};
