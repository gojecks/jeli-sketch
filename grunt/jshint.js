module.exports = {
    all: ['Gruntfile.js', '<%= dir %>**/*.js'],
    allInApp: ['<%= dir %>**/*.js'],
    options: {
        force: true,
        jshintrc: true
    }
};