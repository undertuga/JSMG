/*
Name: MEMORY GAME
Version: 0.1
Author: Te—filo Couto (undertuga[at]gmail[dot]com)
*/



(function(window, document){
	
	// declaring some needed url holders
	var badgesFeed = 'https://services.sapo.pt/Codebits/listbadges';
	var backImgUrl = 'https://i2.wp.com/codebits.eu/logos/defaultavatar.jpg';
	var tweetUrl = 'https://twitter.com/intent/tweet?text=';
	
	
	
	// Game config spot (change game layout)
	var cols = 6;
	var rows = 3;
	
	
	
	// Game required holders
	var pairs = (cols*rows)/2, cardid = 0, match = 0, faceup = 0, deck = [], tstamp = {h: 0, m: 0, s: 0}, tiktak;
	
	
	
	// Load Game Board
	function LoadBoard(){
		
		// building board base
	    var mainContainer = document.createElement('div');
	    mainContainer.id = "mainContainer";
	    mainContainer.className = "mainContainer";
	    
	    // creating start button
	    var btnStart = document.createElement('button');
	    var btnStartText = document.createTextNode("Novo Jogo");
	    btnStart.id = "btnStart";
	    btnStart.className = "btnStart";
	    
	    // creating footer
	    var footer = document.createElement('table');
	    footer.id = 'footer';
	    footer.className = 'footer';
	    var row = footer.insertRow(0);
	    var timerSpot = row.insertCell(0), btnSpot = row.insertCell(1);
	    timerSpot.id = 'timerSpot', btnSpot.id = 'btnSpot';
	    timerSpot.className = 'timerSpot', btnSpot.className = 'btnSpot';
	    
	    // binding elements
	    btnStart.appendChild(btnStartText);
	    mainContainer.appendChild(btnStart);
	    document.body.appendChild(mainContainer);
	    document.body.appendChild(footer);
	    
	    // fill up timer spot
	    var lblTimer = document.createElement('Label');
	    lblTimer.id = 'lblTimer';
	    lblTimer.innerHTML = tstamp.h + 'h | ' + tstamp.m + ' m | ' + tstamp.s + ' s';
	    timerSpot.appendChild(lblTimer);
	    
	    // bail out
	    btnStart.addEventListener("click", GameSetup, false);
	    return true;
	};
	
	
	
	// LOAD BADGES
	function LoadBadges(pcount, callback){
		
		// validating gathered data
		if(((typeof(pcount) === 'undefined') || (pcount === null) || (pcount === "") || (pcount <= 0))){return false;}
	    else{
	        
	        // declaring a new XMLHttpRequest instance
	        var request = new XMLHttpRequest();
	        
	        // check request state changes
	        request.onreadystatechange = function(){
	            
	            // validating response status
	            if((request.readyState != 4) || (request.status != 200)){return false;}
	            else{
	                
	                // setup for data selection
	                var data = JSON.parse(request.responseText);
	                var randBadges = [];
	                
	                // sweeping gathered badges list
	                data.forEach(function(badge){
	                    
	                    // trying to randomize a little the badge selection and filtering what to retain
	                    if(((Math.floor(Math.random() * (1 - 0 + 1)) + 0) > 0) && (randBadges.length+1 <= pcount)) // limiting by max pair count
	                    {randBadges.push({'id': badge.id, 'img': badge.img});} // get only what we want
	                });
	                
	                
	                // duplicating badges into pairs
	                var tmp1 = randBadges.slice(0), tmp2 = randBadges.slice(0);
	                randBadges = tmp1.concat(tmp2);
	                tmp1 = null, tmp2 = null;
	                
	                /*
	                 * Randomize badge pairs
	                 * ----------------------------
	                 * NOT MY ORIGINAL SOURCE! Found it some time ago, liked it! Nice approach on array shuffle!
	                 * Just removed the "unneeded" parseInt's from the original version!
	                 * -------------------------------
	                 * Original Source: http://jsfromhell.com/array/shuffle
	                 */
	                for(var j, x, i = randBadges.length; i; j = Math.floor(Math.random() * i), x = randBadges[--i], randBadges[i] = randBadges[j], randBadges[j] = x);
	                
	                // callback random badge list
	                callback(randBadges);
	            }
	        };
	        
	        // setting up request && ship it!
	        request.open("GET", badgesFeed, true);
	        request.send();
	        return true;
	    }
	};
	
	
	
	// Game Setup and startup
	function GameSetup(){
		
		// removing start button
	    var btnStart = document.getElementById('btnStart');
	    btnStart.parentNode.removeChild(btnStart);
	    
	    // gather main container element
	    var mainContainer = document.getElementById('mainContainer');
	    
	    // building cards table
	    var mainTable = document.createElement('table');
	    mainTable.id = "mainTable";
	    mainTable.className = "mainTable";
	    
	    // get badges
	    LoadBadges(pairs, function(badges){
	    	
	    	// validating gathered badges list
	    	if(!badges || badges.length !== pairs*2){return false;}
	    	else{
	    		
	    		// setup for badge sweeping
	    		var ccnt = 0;
	    		var row;
	    		deck = [];
	    		
	    		// sweeping gathered badges list
	    		badges.forEach(function(badge){
	    			
	    			// building table inner structure
	    			if(ccnt === 0){row = mainTable.insertRow(0);} // check when to add new row
	    			if(ccnt <= cols){
	    				
	    				var col = row.insertCell(0);
	    				col.id = Math.floor((Math.random()*100)+1)*Math.floor((Math.random()*100)+1); // make random (kinda unique) id for current column
	    				deck[col.id] = {img: badge.img, id: badge.id, face: false}; // add to deck
	    				col.setAttribute('name', badge.id); // set element name property with badge id (matching purposes)
	    				col.className = 'cardBack';
	    				col.setAttribute('disabled', 'false'); // element "enabled" @ startup > match lock purposes)
	    				col.style.backgroundImage = "url("+backImgUrl+")";
	    				col.addEventListener('click', function(){TurnCard(!deck[col.id].face, col.id);}, false);
	    				ccnt++;
	    			}
	    			if(ccnt === cols){ccnt = 0;} // full row, reset column counter
	    		});
	    	}
	    });
	    
	    // binding objects
	    mainContainer.appendChild(mainTable);
	    
	    // wake up tiktak
	    tiktak = setInterval(function(){
	    	
	    	// managing time and updating visual
	    	if(tstamp.s < 59){tstamp.s++;}else{tstamp.s = 0; tstamp.m++;}
	    	if(tstamp.m === 60){tstamp.m = 0; tstamp.h++;}
	    	document.getElementById('lblTimer').innerHTML = tstamp.h + 'h | ' + tstamp.m + ' m | ' + tstamp.s + ' s';
	    	
	    }, 1000);
	    
	    return true;
	};
	
	
	
	// Card handling (turn, pair match, etc...)
	function TurnCard(face, cid){
		
		// validating gathered data
		if(((typeof(cid) === 'undefined') || (cid === null) || (cid === "") || (cid <= 0))){return false;}
		else{
			
			// validating faces up and element disabled states
			if(faceup < 2 && (document.getElementById(cid).getAttribute('disabled')) === 'false'){
				
				// lets turn that card face up!
				if(face){
					
					// updating face status
					faceup++;
					deck[cid].face = face;
					
					// update card element
					var card = document.getElementById(cid);
					card.className = 'cardFront';
					card.style.backgroundImage = "url("+deck[cid].img+")";
					
					// checking for pair match and game end!
					if(cardid === 0){cardid = card.getAttribute('name');}else{if(cardid === card.getAttribute('name')){
						
						// poke pairs match +1
						match++;
						faceup = 0, cardid = 0; // reset status counter
						
						// game "running"
						if(match < pairs){
							
							// gather card pair
							var pair = document.getElementsByName(card.getAttribute('name'));
							
							// disabling pair
							for(var x = 0; x <= pair.length-1; x++){pair[x].setAttribute('disabled', 'true');}
						}
						
						// game end detection
						if(match === pairs){
							
							// stop timer and disable presented deck!
							window.clearTimeout(tiktak);
							var cards = document.getElementsByTagName('td');
							for(var x = 0; x <= cards.length-1; x++){cards[x].setAttribute('disabled', 'true');}
							
							// update footer (creating and setting up buttons)
							var pg = document.createElement('button'), sh = document.createElement('button');
							var txtpg = document.createTextNode('Jogar Novamente'), txtsh = document.createTextNode('Tweet Tempo');
							pg.id = 'btnpg', sh.id = 'btnsh';
							pg.className = 'btnpg', sh.className = 'btnsh';
							pg.appendChild(txtpg), sh.appendChild(txtsh);
							document.getElementById('btnSpot').appendChild(pg), document.getElementById('btnSpot').appendChild(sh);
							
							// setup gameover buttons listeners
							var tweetMsg = 'Memory JavaScript FTW em: ' + tstamp.h + 'h ' + tstamp.m + 'm ' + tstamp.s + 's';
							pg.addEventListener('click', function(){location.reload(true);}, false);
							sh.addEventListener('click', function(){window.open(tweetUrl+tweetMsg.toString());}, false);
						}
					}}
				}
				else{
					
					// updating used status
					if(faceup === 1){cardid = 0;}
					faceup--;
					deck[cid].face = face;
					
					var card = document.getElementById(cid);
					card.className = 'cardBack';
					card.style.backgroundImage = "url("+backImgUrl+")";
				}
			}
			
			// turn cards face down
			if(faceup === 2 && !face){
				
				// updating status
				faceup = 0, cardid = 0;
				deck.forEach(function(d){d.face = face;});
				
				// gather cards with face up and sweep list
				var cardsUp = document.getElementsByTagName('td');
				for(var x = 0; x <= cardsUp.length-1; x++){
					
					// filter already matched pairs
					if(cardsUp[x].getAttribute('disabled') === 'false'){
						
						// turn the cards facedown
						cardsUp[x].className = 'cardBack';
						cardsUp[x].style.backgroundImage = "url("+backImgUrl+")";
					}
				}
			}
		}
	};
	
	// expose only what's needed
	window.loadBoard = LoadBoard;
	
})(window, document);