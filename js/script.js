/* ria.exos.flatland.be - Notes de cours en ligne pour le cours de RIA - Applications Internet Riches
 * JS Document - /html5/test_two/js/script.js
 * coded by Kevin Guéders 2383
 * november 2012
 */

/*jshint nonstandard: true, browser: true, boss: true */
/*global jQuery */

( function ( $ ) {
	"use strict";

	// --- global vars
	var $searchBar,
		$homeIcones,
		$vuePlanning,
		$listRecherche,
		$ficheSerie,
		$listMesSeries,
		$mesSeriesTitre,
		$alert;

	// --- methods

	//définition d'un objet ajax
	var oAjaxRequest = {

		url_api: "http://api.betaseries.com",	// Url API
		key: "92b154dcdd6f",	// Developer key

		callAjax: function(param, successCallback, errorCallback){
			$.ajax({
				type: "GET",
				url: this.url_api + param,
				data: {key:this.key},
				dataType: "jsonp",
				success: function(requete){
					if( $.isFunction(successCallback)){
						successCallback.apply(null, [requete]);
					}
				},
				error: function(){
					if( $.isFunction(errorCallback)){
						errorCallback.apply();
					}
				}
			});
		}
	};

	//fonction de recherche des séries
	var search = function(e){
		e.preventDefault();
		$ficheSerie.remove();
		var $sDataInput = $('.search-query').val();

		if($sDataInput !== "" && $sDataInput.length>1){
			oAjaxRequest.callAjax("/shows/search.json?title="+$sDataInput,function(liste){
				$('#listeRecherche h2').remove();
				$('#listeRecherche li').remove();
				if(liste.root.shows.length!==0){
					for(var i=0; i<liste.root.shows.length; i++){
						if(i%2){
							$('<li class="fond"><a href="'+liste.root.shows[i].url+'">'+liste.root.shows[i].title+'</a><a class="btnPlus addLocSt" href="'+liste.root.shows[i].url+'"><i class="icon-plus-circle"></i></a></li>').appendTo('#listeRecherche');
						}
						else{
							$('<li><a href="'+liste.root.shows[i].url+'">'+liste.root.shows[i].title+'</a><a class="btnPlus addLocSt" href="'+liste.root.shows[i].url+'"><i class="icon-plus-circle"></i></a></li>').appendTo('#listeRecherche');
						}
					}
				}
				else{
					$("<h2> Aucun résultat n'a été trouvé </h2>").appendTo('#listeRecherche');
				}
			});
		}
		else{
			$('#listeRecherche li').remove();
			$('#listeRecherche h2').remove();
			$("<h2> Aucun résultat n'a été trouvé </h2>").appendTo('#listeRecherche');
		}
	};

	//fonction pour faire apparaitre la fiche d'une série
	var displayFicheSerie = function(e){
		e.preventDefault();

		var urlTarget = $(this).attr("href");
		$listRecherche.hide();

		oAjaxRequest.callAjax("/shows/display/"+urlTarget+".json",function(fiche){
			$ficheSerie.find('h1').text(fiche.root.show.title);
			if(fiche.root.show.banner){
				$ficheSerie.find('img').attr({src:fiche.root.show.banner, alt:"Banniere de la série "+fiche.root.show.title});
			}
			else{
				$ficheSerie.find('img').attr({src:"", alt:"Banniere de la série "+fiche.root.show.title});
			}
			$ficheSerie.find('p').text(fiche.root.show.description);
			$ficheSerie.find('#ajoutSerie').attr('href',''+fiche.root.show.url);
			$ficheSerie.appendTo('#ficheSerie');
			$('#ficheSerie').show("slow");
		});
		$ficheSerie.show();
		closeSearchBar(e);
	};

	//fonction d'ajout au local storage
	var addLocalStorage = function(e){
		e.preventDefault();
		var sUrlTarget = $(this).attr('href'),
			sKey = 'ria_'+sUrlTarget;

		oAjaxRequest.callAjax("/shows/episodes/"+ sUrlTarget+".json?hide_notes=1", function(oSerie){
			for(var i=0;i<oSerie.root.seasons.length; i++){
				for(var j=0;j<oSerie.root.seasons[i].episodes.length; j++){
					oSerie.root.seasons[i].episodes[j].vu = false;
					oSerie.root.url = sUrlTarget;
				}
			}

			window.localStorage.setItem(sKey, JSON.stringify(oSerie.root));
			$alert.appendTo('body');
		});
	};

	//fonction pour récuperer les infos du localStorage
	var getLocalStorage = function(){
		var aSeries=[],
			key,
			i=0;

		for(key in localStorage){
			if(key.substring(0,4) ==="ria_"){
				aSeries[i] = JSON.parse(window.localStorage.getItem(key));
			}
			i++;
		}

		return aSeries;
	};

	//fonction pour retirer un élément du localStorage
	var removeLocalStorage = function(e){
		e.preventDefault();
		var sUrlTarget = $(this).attr('href'),
			sKey = "ria_"+sUrlTarget,
			aSerie;

		$(this).parents('#s'+sUrlTarget).slideUp(function(){
			$(this).parents('#s'+sUrlTarget).remove();
		});
		window.localStorage.removeItem(sKey);
		aSerie = getLocalStorage();
		if(aSerie==""){
			$mesSeriesTitre.appendTo('#listeMesSeries');
		}
	};

	//fonction pour afficher les séries qui se trouvent dans le localStorage
	var displayMySeries = function(e){
		var aSerie;
		e.preventDefault();
		$homeIcones.hide("slow");
		$("#recherche").removeAttr("class");
		$('#nomAp').text("RIA'series / Mes séries");
		$('#home').removeAttr("class");
		
		aSerie = getLocalStorage();
		$('#listeMesSeries div').remove();
		$mesSeriesTitre=$('#listeMesSeries h2').remove();
		for(var i=0; i<aSerie.length;i++){
			$('<div id="s'+aSerie[i].url+'"></div>').appendTo('#listeMesSeries');
			$('<h2>'+ aSerie[i].seasons[0].episodes[0].show+'<a href="'+aSerie[i].url+'" class="removeLocSt"><i class="icon-trash"></i></a></h2>').appendTo('#listeMesSeries #s'+aSerie[i].url);
			for(var j=0; j<aSerie[i].seasons.length;j++){
				$('<ul class="saison'+aSerie[i].seasons[j].number+'"><h3><a href="'+aSerie[i].url+'" name="saison'+aSerie[i].seasons[j].number+'" class="showLi"><i class="icon-right-dir"></i> Saison '+aSerie[i].seasons[j].number+'</a></h3></ul>').appendTo('#listeMesSeries #s'+aSerie[i].url);
				for(var n=0; n<aSerie[i].seasons[j].episodes.length;n++){
					if(aSerie[i].seasons[j].episodes[n].vu){
						if(n%2){
							$('<li class="fond e'+aSerie[i].seasons[j].episodes[n].number+'">'+aSerie[i].seasons[j].episodes[n].number+'<a  href="'+aSerie[i].url+'" name="'+aSerie[i].seasons[j].episodes[n].number+'" class="check"><i class="icon-eye"></i></a></li>').appendTo('#listeMesSeries #s'+aSerie[i].url+' .saison'+aSerie[i].seasons[j].number);
						}
						else{
							$('<li class="e'+aSerie[i].seasons[j].episodes[n].number+'">'+aSerie[i].seasons[j].episodes[n].number+'<a  href="'+aSerie[i].url+'" name="'+aSerie[i].seasons[j].episodes[n].number+'" class="check"><i class="icon-eye"></i></a></li>').appendTo('#listeMesSeries #s'+aSerie[i].url+' .saison'+aSerie[i].seasons[j].number);
						}	
					}
					else{
						if(n%2){
							$('<li class="fond e'+aSerie[i].seasons[j].episodes[n].number+'">'+aSerie[i].seasons[j].episodes[n].number+'<a  href="'+aSerie[i].url+'" name="'+aSerie[i].seasons[j].episodes[n].number+'" class="checkVu"><i class="icon-eye-off"></i></a></li>').appendTo('#listeMesSeries #s'+aSerie[i].url+' .saison'+aSerie[i].seasons[j].number);
						}
						else{
							$('<li class="e'+aSerie[i].seasons[j].episodes[n].number+'">'+aSerie[i].seasons[j].episodes[n].number+'<a  href="'+aSerie[i].url+'" name="'+aSerie[i].seasons[j].episodes[n].number+'" class="checkVu"><i class="icon-eye-off"></i></a></li>').appendTo('#listeMesSeries #s'+aSerie[i].url+' .saison'+aSerie[i].seasons[j].number);
						}
					}
				}
			}
		}
		if(aSerie==""){
			$mesSeriesTitre.appendTo('#listeMesSeries');
		}
		$('#listeMesSeries li').hide();
		$listMesSeries.show("slow");
	};

	//fonction pour afficher/cacher la liste des saisons
	var showList = function(e){
		e.preventDefault();
		var sSelecDiv = $(this).attr('href'),
			sSelecUl = $(this).attr('name');

		$('#listeMesSeries #s'+sSelecDiv+' .'+sSelecUl+' li').slideDown();
		$(this).attr('class', 'hideLi').find('i').attr('class', 'icon-down-dir');
	};

	//fonction pour cacher la liste des saisons
	var hideList = function(e){
		e.preventDefault();
		var sSelecDiv = $(this).attr('href'),
			sSelecUl = $(this).attr('name');

		$('#listeMesSeries #s'+sSelecDiv+' .'+sSelecUl+' li').slideUp();
		$(this).attr('class', 'showLi').find('i').attr('class', 'icon-right-dir');
	};

	//fonction pour marquer les épisodes comme vu
	var checkViewed = function(e){
		e.preventDefault();
		var aSerie,
			sUrlTarget = $(this).attr('href'),
			sNameTarget = $(this).attr('name'),
			sKey = "ria_"+sUrlTarget;

		aSerie = getLocalStorage();
		for(var i=0; i<aSerie.length;i++){
			if(sUrlTarget===aSerie[i].url){
				for(var j=0; j<aSerie[i].seasons.length;j++){
					for(var n=0; n<aSerie[i].seasons[j].episodes.length;n++){
						if(sNameTarget===aSerie[i].seasons[j].episodes[n].number){
							aSerie[i].seasons[j].episodes[n].vu = true;
						}
					}
				}
			}
		}
		for(i=0; i<aSerie.length;i++){
			if(sUrlTarget===aSerie[i].url){
				window.localStorage.setItem(sKey, JSON.stringify(aSerie[i]));
			}
		}
		$(this).slideUp(function(){
			$(this).attr('class', 'check').find('i').attr('class', 'icon-eye').end().slideDown();
		});
	};

	var checkView = function(e){
		e.preventDefault();
	};

	//fonction pour faire apparaitre le planning
	var displayPlanning = function(e){
		e.preventDefault();
		var aSerie,
			sSelecDiv = "",
			bVide = true;
		$homeIcones.hide("slow");
		$("#recherche").removeAttr("class");
		$('#nomAp').text("RIA'series / Mon planning");
		$('#home').removeAttr("class");

		$('#planning div').remove();
		aSerie = getLocalStorage();
		oAjaxRequest.callAjax("/planning/general.json",function(oPlanning){
			var sDate;
			for(var i=0; i<aSerie.length;i++){
				for(var j=0; j<oPlanning.root.planning.length; j++){
					if(oPlanning.root.planning[j].url===aSerie[i].url){
						sDate = new Date(oPlanning.root.planning[j].date*1000);
						if(sSelecDiv!==("s"+oPlanning.root.planning[j].url)){
							$('<div id="s'+oPlanning.root.planning[j].url+'"></div>').appendTo('#planning');
							$('<h2>'+oPlanning.root.planning[j].show+'</h2>').appendTo('#planning #s'+oPlanning.root.planning[j].url);
							$('<ul><li class="color">'+sDate.toLocaleDateString()+'</li><li class="e'+oPlanning.root.planning[j].number+'">'+oPlanning.root.planning[j].number+'</li><li>'+oPlanning.root.planning[j].title+'</li></ul>').appendTo('#planning #s'+oPlanning.root.planning[j].url);
							sSelecDiv = "s"+oPlanning.root.planning[j].url;
						}
						else{
							$('<ul><li class="color">'+sDate.toLocaleDateString()+'</li><li class="e'+oPlanning.root.planning[j].number+'">'+oPlanning.root.planning[j].number+'</li><li>'+oPlanning.root.planning[j].title+'</li></ul>').appendTo('#planning #s'+oPlanning.root.planning[j].url);
						}
						$('#noPlan').remove();
					}
				}
			}
		});
		$vuePlanning.show();
	};	

	//fonction pour faire apparaitre la barre de recherche
	var displaySearchBar = function(e){
		e.preventDefault();
		$homeIcones.hide("slow");
		$vuePlanning.hide("slow");
		$listMesSeries.hide("slow");
		$ficheSerie.remove();
		$alert.remove();
		$('#nomAp').text("RIA'series / Recherche");
		$('#home').removeAttr("class");
		$('#recherche').attr("class", "active");
		$searchBar.show("slow");
		$('.search-query').focus();
		$listRecherche.show("slow");
	};

	//fonction pour faire disparaitre la barre de recherche
	var closeSearchBar = function(e){
		e.preventDefault();
		$("#recherche").removeAttr("class");
		$searchBar.hide("slow");
	};
	//Reset du champs de recherche
	var resetSearchBar = function(e){
		e.preventDefault();
		$ficheSerie.remove();
		$listRecherche.show("slow");
		$(this).val('');
	};
	//fonction pour fermer la fiche d'une série
	var closeFicheSerie = function(e){
		e.preventDefault();
		$ficheSerie.remove();
		$alert.remove();
		$listRecherche.show("slow");
	};

	var closeAlert = function(e){
		e.preventDefault();
		$alert.remove();
	};

	$( function () {

		// --- onload routines
		$alert = $('.alert').remove();
		$ficheSerie = $('#ficheSerie div').remove();
		$listMesSeries = $('#listeMesSeries').hide();
		$listRecherche = $('#listeRecherche').hide();
		$vuePlanning = $('#planning').hide();
		$homeIcones = $('#icones');
		$('#ficheSerie').hide();
		$searchBar = $('.form-search').hide();


		//evenements
		$('#recherche a').on('click', displaySearchBar);
		$('a.close').on('click', closeSearchBar);
		$('#liSeries').on('click', displaySearchBar);
		$('#monPlanning').on('click', displayPlanning);
		$('#mesSeries').on('click', displayMySeries);
		$('#listeRecherche').on('click','a:first-child', displayFicheSerie);
		$('#ficheSerie').on('click','.close', closeFicheSerie);
		$('body').on('click', '.alert .close', closeAlert);
		$('.form-search').on('submit', search);
		//$('.search-query').on('keyup', search);
		//$('.search-query').on('focus', resetSearchBar);
		$('body').on('click','.addLocSt', addLocalStorage);
		$('#listeMesSeries').on('click', '.removeLocSt', removeLocalStorage);
		$('#listeMesSeries').on('click', '.checkVu', checkViewed);
		$('#listeMesSeries').on('click', '.check', checkView);
		$('#listeMesSeries').on('click', '.showLi', showList);
		$('#listeMesSeries').on('click', '.hideLi', hideList);
	} );

}( jQuery ) );
