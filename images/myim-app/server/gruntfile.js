module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            default: {
                tsconfig: './tsconfig.json',
            },
        },
        uglify: {
            production: {
                options: {
                    mangle: true
                },
                files: [{
                    expand: true,
                    src: 'dist/**/*.js',
                    dest: '',
                    cwd: '.',
                }]
            }
        },
        watch: {
            ts: {
                files: ['src/**/*.ts'],
                tasks: ['ts'],
            },
        },
        nodemon: {
            dev: {
                script: 'src/bin/www.ts',
                options: {
                    watch: ['src'],
                    ext: 'ts',
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('build', ['ts', 'uglify:production']);

    grunt.registerTask('dev', ['ts', 'nodemon:dev', 'watch:ts']);
};
