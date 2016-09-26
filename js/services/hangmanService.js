'use strict';

app
  .factory('hangman', function ($http,APIURL) {
    
	var categoryFillter = function (category_id) {
	    return function(element) {
	        return element.category_id == category_id;
	    }
	}

    return {
    
      getCategories: function  () {
        var url = APIURL+'categories.json';

        return $http.get(url);
      },
      getWord: function(category_id){
      	var url = APIURL+'words.json';
        return $http.get(url).then(function (res) {
	    	var words = res.data.words.filter(categoryFillter(category_id));
	    	var rand = words[Math.floor(Math.random() * words.length)];

	    	return rand;
        });
      }

    };
  });