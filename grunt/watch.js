module.exports = {
    jWatch: {
        files: ['<%= dir %>src/*.js'],
        tasks: ['clean',
            'jeli-template-loader',
            'uglify'
        ]
    }
};