module.exports = {
    options: {
        separator: '\n\n',
    },
    session: {
        dest: '<%= dir %>dist/jeli.sketch.js',
        src: ['<%= dir %>src/**/*.js', '<%= dir %>../jeli.helpers/extend.js'],
        options: {
            wrap: {
                type: 'UMD',
                data: {
                    moduleName: 'jsketch',
                    returnObj: 'Sketch'
                }
            }
        }
    }
};