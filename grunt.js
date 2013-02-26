module.exports = function(grunt) {

  grunt.initConfig({
    lint: {
      files: ['src/*.js']
    },
    jshint: {
      options: {
        "browser": true,
        "jquery": true,
        "strict": true,
        "maxparams": 5,
        "maxdepth": 5,
        "maxlen": 120,
        "laxcomma": true
      }
    },
    concat: {
      dist: {
        src: [
          'src/Mancala.js',
          'src/game.js'
        ],
        dest: 'dist/mancala.js'
      }
    },
    min: {
      dist: {
        src: ['dist/mancala.js'],
        dest: 'dist/mancala.min.js'
      }
    },
    watch: {
      files: '<config:concat.dist.src>',
      tasks: 'concat'
    },
    qunit: {
      all: ['test/*.html']
    }
  });

  grunt.registerTask('default', ['lint', 'qunit', 'concat', 'min']);

};
