/**
 * Configuration du projet.
 */
var pkg = require('./package.json');

module.exports = {
    dist: 'dist',
    /**
     * Header de la distribution.
     */
    banner:
    '/*!\n' +
    ' * Copyright 2015 itesoft.\n' +
    ' * http://itesoft.com/\n' +
    ' *\n' +
    ' * <%= pkg.name %>, v<%= pkg.version %>\n' +
    ' * A powerful music manager.*/\n' ,

    closureStart: '(function() {var RELEASE_VERSION="1.0.0";\n',
    closureEnd: '\n})();',

    /**
     * Liste des fichiers JS de l'application qui seront minifier pour la prod.
     */
    appFiles: [
        '!src/app/**/*Test.js',// Exclude test files
        'src/app/app.module.js',
        'src/app/**/*.js'
    ],

    /**
     * Liste des librairies minifié à utiliser en prod
     */
    vendorJavascriptFiles: [
        'src/assets/lib/angular-common/dist/assets/lib/vendor.min.js',
        'src/assets/lib/angular-common/dist/app/itesoft.min.js',
        'src/assets/lib/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
        'src/assets/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js'
    ],
    /**
     *
     * Fichiers de locales pour les formats, les monnaies, les jours, mois et autres.
     * A ne PAS minifier pour l'utilisation d'Angular Dynamic Locale
     *
     */
    localeJsFiles: [
        'src/assets/lib/angular-i18n/angular-locale_fr.js',
        'src/assets/lib/angular-i18n/angular-locale_en.js',
        'src/assets/lib/angular-i18n/angular-locale_de.js'
    ],
    vendorCssFiles: [
        'src/assets/lib/font-awesome/css/font-awesome.min.css',
        'src/assets/lib/angular-common/dist/assets/fonts/itesoft-bundle.min.css'
    ]
};