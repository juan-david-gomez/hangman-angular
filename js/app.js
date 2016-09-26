'use strict';


var app = angular.module('hangman',[]);

app.constant('APIURL','/');

app.controller('main',['$scope','hangman',mainFunction]);

function mainFunction($scope,hangman) {
	
	// Se usa para determinar si el juego esta activo (1) o finalizado (o)
	var gameStatus ;

	// Es el contenedor que almacenas los aciertor del usuario y asi mismo las posiciones vacias
	$scope.wordHidden ;
	// Es el contenedor que almacenas la palabra completa y sobre la que se valida si se adivino una letra
	$scope.wordReal   ;

	// Las siguientes 3 validables se usan para desplegar el mensaje de Exito o Fallo
	$scope.typeMgs	  ;
	$scope.titleMsg	  ;
	$scope.bodyMsg	  ;

	// La siguiente variable contiene la lista completa de categorias
	$scope.categories ;
	// La siguiente variable contiene el id de la categoria con la cual se esta jugando
	$scope.selectedCategory ;

	// La siguiente variable contiene un arreglo de indices faltantes en la palabrea, 
	// se usa para determinar que letras faltaron despues de terminar los intentos
	var missingIndexes ;

	// La siguiente variable contiene las letras que el usuario ha fallado
	$scope.errorLetters ;
	// La siguiente variable contiene el conteo de intentos
	var attempts ;
	// La siguiente variable un arreglo con las clases que terminan la imagen a mostrar del hangman
	var attemptsClasses ;

	// La siguiente variable contiene la clase actual del hangman
	$scope.activeAttempt ;

	// La siguiente variable un arreglo con todas las letras ingresadas por el usuario erroneas y correctas
	var wordsUsed ;
	
	// Esta función inicializa todos los valores por defecto que usa la aplicación
	var initVariables = function () {

			gameStatus 		  = 0;

			$scope.wordHidden = [];
			$scope.wordReal   = [];

			$scope.typeMgs	  = '';
			$scope.titleMsg	  = '';
			$scope.bodyMsg	  = '';

			missingIndexes = [];
			$scope.errorLetters = [];
			attempts = 0;
			attemptsClasses = [
			'attempt0',
			'attempt1',
			'attempt2',
			'attempt3',
			'attempt4',
			'attempt5',
			'attempt6'
			];
			$scope.activeAttempt = 'attempt0';

			wordsUsed = [];
	}

	// Carga e inicializa las categorias del juego
	var loadCategories = function () {
		$scope.categories = [];
		$scope.selectedCategory = '-1';
		$scope.categories.push({id:'-1',name:'Seleccione'});
		
		hangman.getCategories().success(function (data) {
			data.categories.forEach(function (category) {
				var categoryModel = {
					id : category.id,
					name : category.name,
				};
				$scope.categories.push(categoryModel);
			});
		})
	}

	// llama a la configuracion inicial de variables y categorias
	initVariables();
	loadCategories();


	// La siguiente función se usa para validar si la posicion que se esta mostrando debe marcarse como faltante
	// Cambia el color de la letra a roja cuando se muestra en la vista
	var validateMissingIndixes = function (indexLetter) {
		var index = missingIndexes.indexOf(indexLetter);
		if (index != -1) {
			return true;
		}else{
			return false;
		}
	}
	// Se envia al scope para ser usada al desplegar cada letra en la vista
	$scope.validateMissingIndixes  = validateMissingIndixes;

	// Esta funcion compara los arreglos wordReal (Contiene la palabra original) y 
	// wordHidden (Contiene lo que el usuario alcanzo a adinivar), se usa cuando se acaban los intentos 
	// para mostrar al usuario las letras que no pudo enocntrar 
	var MissingIndixes = function () {
		var showArrayWord = [];
		for (var i = $scope.wordReal.length - 1; i >= 0; i--) {
			if($scope.wordReal[i] != $scope.wordHidden[i]){
				missingIndexes.push(i);
				$scope.wordHidden[i] = $scope.wordReal[i];
				console.log($scope.wordHidden[i]);
			}
		}
	}

	// la funcion valida si una letra es un espacio o no, y se usa para mostrar un espacio entre las lineas de letras 
	var isSpace = function (letter) {
		return letter == ' ';
	}
	// Se envia al scope para ser usada al desplegar cada letra en la vista
	$scope.isSpace 		  = isSpace;
	

	var normalizeLetter = function (s) {
		var r=s.toLowerCase();
	            r = r.replace(new RegExp(/\s/g),"");
	            r = r.replace(new RegExp(/[àáâãäå]/g),"a");
	            r = r.replace(new RegExp(/[èéêë]/g),"e");
	            r = r.replace(new RegExp(/[ìíîï]/g),"i");
	            r = r.replace(new RegExp(/ñ/g),"n");                
	            r = r.replace(new RegExp(/[òóôõö]/g),"o");
	            r = r.replace(new RegExp(/[ùúûü]/g),"u");        
	 	return r;
	}

	// Resive la palabra y llena los arreglos wordHidden y wordReal
	// se usa para desplegar las posiciones en la vista y llenar el arreglo real
	var setWord = function (word) {
		var wordArrayHidden = [];
		var wordArrayReal = [];
		for (var i = 0; i < word.length; i++) {
			var originLetter = word.charAt(i);			
		    var letter = normalizeLetter(originLetter).toUpperCase();
		    wordArrayReal[i] = letter;
		    // Si es una letra se deja el espacio vacio '' pero si es una espacio se deja el mismo ' '
		    wordArrayHidden[i] = isSpace(letter) ? ' ':'';
		}
		$scope.wordHidden = wordArrayHidden;
		$scope.wordReal = wordArrayReal;
		// Pone el foco en control que captura las teclas del usuario
		$("#letterSpace").focus();
	}

	// Obtiene todos los indices que coincidan con la letra evaluada
	var getAllIndexes = function (arr, val) {
    	var indexes = [], i;
    	var value = val.toUpperCase();
	    for(i = 0; i < arr.length; i++)
	        if (arr[i] === value){
	            indexes.push(i);
	        }
	    return indexes;
	}

	// Valida si una letra existe o no en la palabra, y dirije el fujo a la funcion de exito o error
	var validLetter = function (letter) {
		
		if (letter.length <= 0)return;

		var indexes = getAllIndexes($scope.wordReal,letter);
		if (indexes.length > 0) {
			successLetter(indexes);
		}else{
			errorLetter(letter);		
		}
	}

	//Muestra la letra en la seccion de errores ademas de cambiar la imagen del hangman
	//adicionalmente valida si se cumplio el tome maximo de errores y si es asi desplieaga el error 
	var errorLetter = function (letter) {
		attempts++;

		if (attempts == (attemptsClasses.length - 1)) {
			MissingIndixes();
			$scope.typeMgs  = 'alert-danger';
			$scope.titleMsg	= "Lo siento";
			$scope.bodyMsg	= "No has adivinado la palabra";
			gameStatus = 0;
		}
		$scope.activeAttempt = attemptsClasses[attempts];
		$scope.errorLetters.push(letter.toUpperCase());
	}

	// Muestra la letra encontrada en el la posicion correcta, 
	// ademas valida que si ya se hallaron todas las letras muestre el mensaje de exito
	var successLetter = function (indexes) {

		indexes.forEach(function (indexVal) {
			$scope.wordHidden[indexVal] = $scope.wordReal[indexVal]
		})

		var index = $scope.wordHidden.indexOf('');
		if (index == -1) {
			$scope.typeMgs  = 'alert-success';
			$scope.titleMsg	= "Felicitaciones";
			$scope.bodyMsg	= "Has adivinado la palabra";
			gameStatus = 0;
		}
	}

	// Busca una palabra aleatoria segun la categoria actual del juego, ademas activa el juego una vez se encuentre la palabra 
	var getrRandomWord = function () {
		
		var category_id = $scope.selectedCategory;
		if (category_id != -1) {

			hangman.getWord(category_id).then(function (data) {
				if(typeof data == 'object'){
					gameStatus 		  = 1;
					console.log(data.name);
					setWord(data.name);
				}
			})
		}

	}
	
	// Captura el cada tecla ingresada sobre el control #letterSpace, la registra en las letras usadas 
	// y si no existe previmanete la valida
	var keydownLetter =  function(e){
 		
 		if (gameStatus == 1) {
	 		if (e.keyCode >= 65 && e.keyCode <= 90){
	 			var index = wordsUsed.indexOf(e.key);
	 			if (index == -1) {
	 				wordsUsed.push(e.key);
	 				validLetter(e.key);
	 			}
	 		}
 		}
 
	}
	// Se envia al scope para que se asigne el evento al control
	$scope.keydownLetter  = keydownLetter;

	// Reinicia el juego, limpia las variables y busca una nueva palabra
	var restart = function () {
		initVariables();
		getrRandomWord();
	}
	// Se envia al scope para poder reiniciar el juego a peticion del usuario
	$scope.restart 		  = restart;


	
}