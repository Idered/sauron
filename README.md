# Sauron

It's a starting point for your projects. First edit default project to your taste and use it as template for your 
future projects.

It takes care of: 

- sass compilation(fast)
- adding css prefixes (using autoprefixer)
- js/sass minification
- compiling all your vendor plugins into one vendor file
- setting up livereload server and file watchers

## Installation

Just download this repo and run: `npm install`

## Using Sauron

### Getting started

Edit files in `projects/default`, change default settings, add your favourite libs, customize default js structure, etc.
This will be used as your boilerplate.

### Creating new project

To create new project, run `gulp new --name PROJECT_NAME`. Your default template will be used as starting point for new 
project. All dependencies will be automatically installed during project creation.

### Vendor JS files

To add new js lib to your project, use command `bower install PLUGIN --save` in project directory then add url to new 
dependency to bower.json in vendor section. Files in bower.json/vendor will be automatically compiled to vendor.min.js 
in project dist folder.
 
### Working with project

Every new project can be compiled using `gulp --project PROJECT_NAME` - your sass, js and vendor js will be compiled
to style.min.css, script.min.js and vendor.min.js, they're already hooked in default index.html.

## Licensing 

Apache License