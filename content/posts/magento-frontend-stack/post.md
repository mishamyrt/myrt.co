# The flavor of the modern frontend in Magento

Date: October 2, 2018

Magento is a huge engine written by a large number of talented programmers. The problem is that due to its prevalence, they cannot make any serious changes without changing the major version.

Magento 2 was introduced in July 2015, when the ES5 features were not widely spread. Back then developers were using underscore for working with arrays, Knockout for data binding, and jQuery for working with DOM.

In 2018, JS developers started using such ES7 features as:

* The declaration of variables via `let` and `const` instead of `var`
* Arrow Functions
* `async`, `await` and `Promise` instead of callback
* Destructive assignment, extension operator, array and objects iteration methods

The situation with styles is similar, `float` was used for design implementation back then, while today you can use `grid`.

The vast majority of Magento 2 sites still use outdated layout and scripting methods to support older browsers. And although the share of IE11 is only 1.35%, and IE10 0.14%, our customers want sites to be accessible to everyone, regardless of their browser.

I’d like to make it clear that further instructions will help to use ES7 features and new CSS features in browsers older than IE11, since I believe it is not necessary to support IE10 in 2018.

## EcmaScript >5

For older browsers to be able to work with the new code standards, Babel needs to be integrated into the development process.

First, you need to add Babel to the dependences of the project. To do this, run the following code in the directory of the project:

```sh
npm install --save-dev @babel/core @babel/preset-env
```

In order for Babel to know which files are subject to transpilation, you need to specify the javascript file mask in the `dev/tools/grunt/configs/themes.js` file.

```js
mymegatheme: {
   area: 'frontend',
   name: 'Vendor/mymegatheme',
   locale: 'en_US',
   babelFiles: [{
     expand: true,
       cwd: 'js/source/',
       src: ['**/*.js'],
       dest: 'js/'
   }],
   files: [
     'css/styles-m',
     'css/styles-l'
   ],
   dsl: 'less'
},
```

Replace mymegatheme with the name of your theme, and Vendor with the vendor of the theme.

Now we need to teach Grunt to interact with the declared files. To do this, add the following lines to the `dev/tools/grunt/configs/combo.js` file:

```js
'use strict';
var combo  = require('./combo'),
   themes = require('./themes'),
   _   = require('underscore');
var themeOptions = {};
_.each(themes, function(theme, name) {
   if (typeof theme.babelFiles != "undefined") {
       themeOptions[name] = {
           files: combo.babelFiles(name)
       };
   }
});
var babelOptions = {
   options: {
       sourceMap: true,
       presets: ['babel-preset-env']
   }
};
module.exports = _.extend(themeOptions, babelOptions);
```

Done, now you can write modern Javascript and forget about the support of older browsers.

## CSS Next

Unfortunately, CSS does not have such a beautiful version name as JavaScript, so I borrowed this name from the PostCSS preset, although we will not use it.

I should also point out that the proposed settings will use PostCSS as a postprocessor, as it was intended. Often I see it being used as a preprocessor, which violates the functions implied by the authors (the answer lies in the title).

First, you need to install the plugin for Grunt and the preset for PostCSS:

```sh
npm install --save-dev grunt-postcss postcss-preset-env
```

Then you need to create a `dev/tools/grunt/configs/postcss.json` file and insert the following configuration there:

```json
{
   "options": {
       "map": true
   },
   "plugins": {
        "postcss-preset-env": {},
    },
   "dist": {
     "src": ["pub/static/frontend/*/*/*/css/*.css"]
   }
}
```

And finally, we create the `dev/tools/grunt/configs/postcss.js` file with the following content:

```js
module.exports = function(grunt) {
   grunt.loadNpmTasks('grunt-postcss');
   grunt.registerTask('postcss-env', function (target) {
       var currentTarget = target || 'dist';
       var config = grunt.config.get('postcss');
       if (target) {
           config[target] = {
               src:
                   [
                       'pub/static/frontend/*/' +
                        target +
                        '/*/css/*.css'
                   ]
           };
       }
       grunt.config.set('postcss', config);
       grunt.option('force', true);
       grunt.task.run('postcss:'+currentTarget);
   });
};
```

Run the following command before the release:

```sh
grunt postcss-env
```

That’s it, thank you for your attention. Now you can write modern code and forget about the browser compatibility.
