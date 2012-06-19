
( function( window, undefined ){
	
	window.onload=Invaders;
	
 	var
		ROWS=[ 'Alien0', 'Alien1', 'Alien2', 'Alien3', 'Alien4' ],
		ASPRITES={
			'Alien0': [ 3, 39 ],
			'Alien1': [73, 106 ],
			'Alien3': [ 146, 178 ] 
		},
		SPRITEMAP={ // sprite location by name
			Sign: [ 170, 0, 240, 170 ],
			Ship: [ 276, 224, 28, 24 ],
			SmallShip: [ 300, 274, 20, 12 ],
			BigShip: [ 22, 104, 108, 66 ],
			Alien0: [ 3, 220, 24, 24 ],
			Alien1: [ 73, 220, 24, 24 ],
			Alien2: [ 73, 220, 24, 24 ],
			Alien3: [ 146, 220, 26, 26 ],
			Alien4: [ 146, 220, 26, 26 ],
			BigAlien2: [ 430, 106, 92, 66 ],
			BigAlien3: [ 418, 10, 100, 65 ],
			DeadAlien: [ 436, 274, 32, 32 ],
			Spaceship: [ 212, 222, 50, 24],
			BigSpaceship: [ 16, 16, 128, 60],
			Bullet: [ 411, 276, 8, 14],
			AlienBullet: [ 333, 274, 6, 16],
			Shield: [ 314, 210, 48, 36 ]
		},
		COLUMNS=11,
		SCORING={
			Alien0: 30,
			Alien1: 20,
			Alien2: 20,
			Alien3: 10,
			Alien4: 10
		};
		
		ASPRITES[ 'Alien2' ]=ASPRITES[ 'Alien1' ];
		ASPRITES[ 'Alien4' ] = ASPRITES[ 'Alien3' ],
		
		GAMELEVELS=[ undefined, 
			{
				maxBullets: 1,
				shipSpeed: 2,
				spaceShipSpeed: 1,
				bulletSpeed: 10,
				maxAlienBullets: 2,
				alienBulletSpeed: 5,
				beat: 70
			},
			{
				maxBullets: 2,
				shipSpeed: 3,
				spaceShipSpeed: 2,
				bulletSpeed: 11,
				maxAlienBullets: 2,
				alienBulletSpeed: 7,
				beat: 60
			},
			{
				maxBullets: 3,
				shipSpeed: 3,
				spaceShipSpeed: 2,
				bulletSpeed: 12,
				maxAlienBullets: 3,
				alienBulletSpeed: 9,
				beat: 50
			},
			{
				maxBullets: 4,
				shipSpeed: 3,
				spaceShipSpeed: 3,
				bulletSpeed: 14,
				maxAlienBullets: 4,
				alienBulletSpeed: 10,
				beat: 45
			},
			{
				maxBullets: 3,
				shipSpeed: 3,
				spaceShipSpeed: 3,
				bulletSpeed: 15,
				maxAlienBullets: 4,
				alienBulletSpeed: 11,
				beat: 40
			},
			{
				maxBullets: 2,
				shipSpeed: 3,
				spaceShipSpeed: 4,
				bulletSpeed: 15,
				maxAlienBullets: 5,
				alienBulletSpeed: 11,
				beat: 40
			},
			{
				maxBullets: 1,
				shipSpeed: 3,
				spaceShipSpeed: 3,
				bulletSpeed: 10,
				maxAlienBullets: 6,
				alienBulletSpeed: 15,
				beat: 40
			},
			{
				maxBullets: 1,
				shipSpeed: 3,
				spaceShipSpeed: 3,
				bulletSpeed: 10,
				maxAlienBullets: 6,
				alienBulletSpeed: 13,
				beat: 40
			}
		];
		
	function Invaders(){
		
		var 	gamesPlayed=getGamesPlayed(), // list of all games played - loaded from localStorage if available
		highScores=getHighScores(),
		highScore=highScores.length ? highScores[ 0 ].score : 0;

		Crafty.init( 480,  544 );
		
		Crafty.audio.add({
			'shoot': [ 'sounds/shoot.wav', 'sounds/shoot.mp3', 'sounds/shoot.ogg' ],
			'killed1': [ 'sounds/invaderkilled.wav', 'sounds/invaderkilled.mp3', 'sounds/invaderkilled.ogg' ],
			'explosion': [ 'sounds/explosion.wav','sounds/explosion.mp3','sounds/explosion.ogg'],
			'invader1': [ 'sounds/fastinvader1.wav','sounds/fastinvader1.mp3','sounds/fastinvader1.ogg' ],
			'spaceship': [ 'sounds/ufo_highpitch.wav','sounds/ufo_highpitch.mp3','sounds/ufo_highpitch.ogg' ],
			'alienShoot': 'sounds/invaderkilled.wav'
		});
		
		Crafty.load( [ 'sprite.jpg' ], function(){
			Crafty.sprite( 1, 'sprite.jpg', SPRITEMAP);
			
			Crafty.scene( 'Splash' );
		});
		Crafty.c( 'Shoot', {
			shoot: function( speed ){
				if ( this.has( 'Ship' ) ){
					Crafty.e( '2D, DOM, Bullet, Collision' )
						.attr({ y: this._y, x: this.x + ( this.w / 2 - 2 )})
						.bind( 'EnterFrame', function(){
							this.y = this.y - ( speed || 10 );
							if ( this.y < 0 ) this.destroy();
						})
						.onHit( 'AlienBullet', function( arr ){
							this.destroy();
							arr[ 0 ].obj.destroy();
						});
						Crafty.audio.play( 'shoot' ); 
				}
				else if ( this.has( 'Alien' ) ){
					//~ Crafty.audio.play( 'alienShoot' );
					Crafty.e( '2D, DOM, AlienBullet, Collision' )
						.attr({ y: this.y + this.h, x: this.x + ( this.w / 2 )})
						.bind( 'EnterFrame', function(){
							this.y=this.y+( speed || 10 );
							if ( this.y >= Crafty.viewport.height ) this.destroy();
						})
						.onHit( 'Shield', function(){ this.destroy();});
				}
			}
		});
		Crafty.c( 'Scorekeeper', {
			init: function(){ console.log( 'init scorekeeper' );
				this.addComponent( '2D, DOM, Persist, Color' )
					.color( 'red' );
				this.games=[];
				if ( localStorage && JSON ){
					if ( !localStorage.getItem( 'SpaceInvaders' ) ) localStorage.setItem( 'SpaceInvaders', '[]' );
					this.games=JSON.parse( localStorage.getItem( 'SpaceInvaders' ) );
				}
			},
			addScore: function( score, date ){
				this.games.push( { score: score, date: date || new Date() });
				return this.saveGames();
			},
			getHighScores: function( count ){
				var scores=this.scores.slice().sort( function( a, b ){
					return b.score - a.score;
				});
				if ( count && count > scores.length ){
					scores=scores.slice( 0, 10 );
				}
				return scores;
			},
			saveGames: function(){
				if ( JSON && localStorage ){
					localStorage.setItem( 'SpaceInvaders', JSON.stringify( this.games ) );
				}
				return this;
			}
		});
		Crafty.scene( 'Splash', function(){
			if ( Crafty.isPaused() ) Crafty.pause( true );
			Crafty.background('#000');
			Crafty.e( "2D, DOM, Sign" )
				.attr({ x: 120, w: 240,y: 30,  h: 170 });
				
			Crafty.e( "2D, DOM, BigAlien3")
				.attr({ x: 50, y: 330 });
				
			Crafty.e( "2D, DOM, BigAlien2")
				.attr({ x: 350, y: 250 });
				
			Crafty.e( "2D, DOM, BigSpaceship")
				.attr({ x: 120, y: 210 });
				
			Crafty.e( "2D, DOM, BigShip")
				.attr({ x: 240, y: 395 });
				
			Crafty.e("2D, DOM, Text")
				.attr({ w: 390, h: 50, x: 43, y: 470, alpha: '.5'})
				.text('Press any key to play')
				.css({ 'text-align': 'center', color: '#fff', 'font-size': 40, 'font-weight': 'bold', 'line-height': 50 })
				.textFont({ family: 'Press Start 2P' });
			Crafty.e("Keyboard")
				.bind( 'KeyDown', function( e ){
					//~ if ( e.keyCode === Crafty.keys.ENTER ){
						this.destroy();
						Crafty.scene( 'Invaders' );
					//~ }
				});
		});
		
		Crafty.scene( 'Invaders', function(){
			var rows=[],
				beat=50, // ms ( gets lower as less aliens live )
				score=0,
				level=0,
				lives=4,
				timer=null,
				config=GAMELEVELS[ level ],
				HUD={
					p1: Crafty.e( '2D, DOM, Text' )
						.text( 'SCORE <1>')
						.attr({ x: 10, y: 10, w: 100 })
						.css({ color: '#fff', 'font-size': '1em'}),
					p1score: Crafty.e( '2D, DOM, Text')
						.text( '0' )
						.attr({ x: 20, y: 30, w: 100 })
						.css({ color: '#fff', 'font-size': '16px' }),
					hi: Crafty.e( '2D, DOM, Text' )
						.text( 'HI-SCORE')
						.attr({ x: 150, y: 10, w: 100 })
						.css({ color: '#fff', 'font-size': '16px', 'text-align': 'center'}),
					hiscore: Crafty.e( '2D, DOM, Text' )
						.text( '0')
						.attr({ x: 150, y: 30, w: 100 })
						.css({ color: '#fff', 'font-size': '16px', 'text-align': 'center'})
				};
				
			Crafty.background( '#000' );
			
			Crafty.e( 'Keyboard' )
				.bind( 'KeyDown', function( e ){
					if ( e.key === Crafty.keys.P ){
						if ( Crafty.isPaused() ){
							Crafty( 'PauseText' ).destroy();
						}
						else{ 
							Crafty.e('2D, DOM, Text, PauseText'  )
								.css({ 'text-align': 'center', 'font-size': '32px', 'font-weight': 'bold', color: '#fff', z: 100 })
								.text( 'PAUSED' )
								.attr({ x: 190, w: 100, y: 240 })
						}
						setTimeout( function(){ Crafty.pause();}, 100 );
					}
				});
				
			
			/* OUR HERO */
			var ship=Crafty.e( '2D, DOM, Collision, Ship, Keyboard, Shoot' )
				.attr({ x: 100, y: 500 })
				.bind( 'EnterFrame', function( e ){
					if ( this.isDown( 'LEFT_ARROW') ) this.x = this.x -config.shipSpeed;
					else if ( this.isDown( 'RIGHT_ARROW' )) this.x= this.x +config.shipSpeed;
					
					if ( this.x < 0 ) this.x=0;
					if ( this.x + this.w > Crafty.viewport.width ) this.x=Crafty.viewport.width - this.w;
				})
				.bind( 'KeyDown', function( e ){
					if ( e.key === Crafty.keys.SPACE ){
						e.preventDefault();
						if ( Crafty( 'Bullet' ).length < config.maxBullets ) this.shoot();
					} 
				})
				.onHit( 'AlienBullet', function( arr ){ 
					arr[ 0 ].obj.destroy();
					die();
				})
				.onHit( 'Alien', function(){ // GAME OVER BITCHES
					lives=0;
					die();
				});
				
			levelUp(); // starting the game
			
			
			function die(){
				var dieTimer;
				lives=lives-1;
				Crafty.audio.play( 'explosion' );
				Crafty( 'AlienBullet' ).destroy();
				ship.sprite( 366, 274, ship.w, ship.h );
				
				setTimeout( function(){
					Crafty.pause( true );
				}, 20 );
				
				dieTimer=setTimeout( function(){
					clearTimeout( dieTimer );
					Crafty.pause( false );
					if ( lives < 0 ){
						gameOver();
					}
					else {
						updateLivesDisplay();
						ship
							.sprite( 276, 224, 28, 24 )
							.attr({ x:170, y: 500 });
					}
				}, 1500 );
			}
			function gameOver(){
				ship.destroy();
				stopFormation();
				var gText=Crafty.e( '2D, DOM, Text' )
					.text( 'GAME OVER' )
					.attr({ w: 400, x: 45,  h: 70, y: 200, z: 100})
					.css({ 'font-size': '55px', color: '#fff', 'font-weight': 'bold', 'text-align': 'center', 'line-height': '70px' });
					
				Crafty.e( '2D, DOM, Color' )
					.attr({ w: Crafty.viewport.width, h: Crafty.viewport.height, x: 0, y: 0, alpha: '.5', z: 99})
					.color( '#000' );
				saveGamesPlayed({ score: score, date: new Date() });
				setTimeout( function(){ Crafty.scene( 'Splash' ); }, 2500 );
			}
			function generateAliens(){
				Crafty( 'Alien, Spaceship' ).destroy();
				for ( var j=0, len=ROWS.length, i; j<len; j++ ){
						rows[ j ]=[];
						for ( i=0; i<COLUMNS; i++ ){
							rows[ j ].push( Crafty.e( '2D, DOM, Tween, Shoot, Alien, Collision, '+ROWS[ j ] )
								.attr({ y: 90 + ( j * 32 ), x: 10 + ( 32 * i ) })
								.onHit( 'Bullet', function( arr ){ // GOT SHOT
									var exp=Crafty.e( '2D, DOM, DeadAlien' )
										.attr({ x: this.x, y: this.y });
										
									arr[ 0 ].obj.destroy();// destroy the bullet
									setTimeout( function(){ exp.destroy(); }, 250 );
									for ( var k in SCORING ){
										if ( this.has( k )){
											updateScore( SCORING[ k ] );
											break;
										}
									}
									this.destroy();
									
									switch( Crafty( 'Alien' ).length ){
										case 0:
											levelUp();
											break;
										case 45:
										case 30:
										case 15:
											startSpaceship();
											break;
										default:
										break;
									}
							})
						);
					}
				}
			}
			function generateShields(){
				Crafty( 'Shield' ).destroy();
				for ( j=0; j<4; j++ ){
					Crafty.e( '2D, DOM, Shield' )
						.attr({ y: 440, x: 20 + ( j * 130 ), w: 48, h: 36 });
				}
			}
			function levelUp(){
				level=level + 1;
				config=GAMELEVELS[ level ];
				if ( !config ) throw "YOUR GAME SUCKS LEVELS INCOMPLETE BITCH!";
				Crafty.e( '2D, DOM, Text')
					.attr({ x: 0, y: 200, w: 480 })
					.text( 'Level '+level )
					.css({ color: '#fff', 'font-size': '56px', 'text-align': 'center'})
					.timeout( function(){
						this.destroy();
						updateLivesDisplay();
						updateScore();
						generateAliens();
						generateShields();
						startFormation2();
						
					}, 1600 );
				
			}
			
			function startFormation2(){
				var direction=1,
				speed=2,
				tick=config.beat;
				runFormation();
				function runFormation(){
					var minX=0, maxX=Crafty.viewport.width, localTimer=null, drop=false;
					clearTimeout( timer );
					if ( Crafty.isPaused() ){
						timer=setTimeout( runFormation, 500 );
						return;
					}
					move( 4 );
					function move( i ){
							//clearTimeout( localTimer );
							if ( i<0 ){ // finished a cycle
								var aliens=Crafty( 'Alien' );
								aliens.each( function(){
									if (( this.x + this.w > maxX && direction === 1 ) || ( this.x < minX && direction === -1 )){
										drop=true;
										direction=-direction;
									}
								});
								
								if ( drop ){
									aliens.each( function(){
										this.y = this.y + 32;
										drop=false;
									});
								}
								
								if ( aliens.length < 50 ) tick=config.beat/1.1;
								if ( aliens.length < 45 ) tick=config.beat/1.3;
								if ( aliens.length < 40 ) tick=config.beat/1.5;
								if ( aliens.length < 30 ) tick=config.beat/1.8;
								if ( aliens.length < 25 ) tick=config.beat/2.1;
								if ( aliens.length < 20 ) tick=config.beat/2.3;
								if ( aliens.length < 15 ) tick=config.beat/2.8;
								if ( aliens.length < 10 ) tick=config.beat/3;
								if ( aliens.length < 5 ) tick=config.beat/3.2;
								if ( aliens.length < 2 ) tick=config.beat/6 ;
								return;
							}
							var cmp=Crafty( 'Alien'+i );
							if ( !cmp.length ){
								move( i - 1 );
								return;
							}
							cmp.each( function(){
								var s=200 / tick;
								console.log( 's', s, 'tick', tick );
								this.x=this.x + ( direction * s );
								var ax=ASPRITES[ 'Alien'+i ],
									cd=this.__coord;
								this.sprite(cd[ 0 ]===ax[ 0 ] ? ax[ 1 ]: ax[ 0 ], cd[ 1 ], cd[ 2 ], cd[ 3 ] );
								
							});		
							localTimer=setTimeout( function(){ move( i-1 )}, tick );
						}
					if ( Crafty( 'AlienBullet' ).length < config.maxAlienBullets ) {
						var aliens=Crafty( 'Alien' );
						if ( aliens.length ){
							var rand=Crafty.math.randomInt( 0, aliens.length - 1 );
							Crafty( aliens[ rand ] ).shoot( config.alienBulletSpeed );
						}
					}
					Crafty.audio.play( 'invader1' );
					timer=setTimeout( function(){ runFormation(); }, tick * 5 );
				}
			}
			function startFormation(){
				var direction=1, // LEFT TO RIGHT TO START
					speed=3;
				clearTimeout( timer );
				function runFormation(){
				}
				timer=setInterval( function(){
					if ( Crafty.isPaused() ) return;
					var minX=0, maxX=Crafty.viewport.width, localTimer=null, drop=false;
					move( 4 );
					
					function move( i ){
						clearTimeout( localTimer );
						if ( i<0 ){
							var aliens=Crafty( 'Alien' );
							aliens.each( function(){
								if (( this.x + this.w > maxX && direction === 1 ) || ( this.x < minX && direction === -1 )){
									drop=true;
									direction=-direction;
								}
							});
							
							if ( drop ){
								aliens.each( function(){
									this.y = this.y + 32;
									drop=false;
								});
							}
							
							if ( aliens.length < 50 ) speed=4;
							if ( aliens.length < 45 ) speed=6;
							if ( aliens.length < 40 ) speed=8;
							if ( aliens.length < 30 ) speed=10;
							if ( aliens.length < 25 ) speed=12;
							if ( aliens.length < 20 ) speed=14;
							if ( aliens.length < 15 ) speed=16;
							if ( aliens.length < 10 ) speed=18;
							if ( aliens.length < 5 ) speed=20;
							if ( aliens.length < 2 ) speed=25;
							return;
						}
						var cmp=Crafty( 'Alien'+i );
						if ( !cmp.length ){
							move( i - 1 );
							return;
						}
						cmp.each( function(){
							this.x=this.x + ( direction * speed );
							var ax=ASPRITES[ 'Alien'+i ],
								cd=this.__coord;
							this.sprite(cd[ 0 ]===ax[ 0 ] ? ax[ 1 ]: ax[ 0 ], cd[ 1 ], cd[ 2 ], cd[ 3 ] );
							
						});		
							localTimer=setTimeout( function(){ move( i-1 )}, beat );

					}
					if ( Crafty( 'AlienBullet' ).length < config.maxAlienBullets ) {
						var aliens=Crafty( 'Alien' );
						if ( aliens.length ){
							var rand=Crafty.math.randomInt( 0, aliens.length - 1 );
							Crafty( aliens[ rand ] ).shoot( config.alienBulletSpeed );
						}
					}
					Crafty.audio.play( 'invader1' );
				}, beat * 5 );
			}
			
			function startSpaceship(){
				if ( Crafty( 'Spaceship' ).length ) return;
				Crafty.audio.play( 'spaceship', 50);
				var sp=Crafty.e( '2D, DOM, Shoot, Spaceship, Collision' )
					.attr({ x: -50, y: 60})
					.bind( 'EnterFrame', function(){
						this.x=this.x + config.spaceShipSpeed;
						if ( this.x > Crafty.viewport.width ) this.destroy();
					})
					.onHit( 'Bullet', function( arr ){
						updateScore( 200 );
						var sText=Crafty.e( '2D, DOM, Text' )
							.text( '200' )
							.attr({ x: this.x, y: this.y, h: this.h, w: this.w })
							.css({ color: 'red', 'font-size': '18px', 'text-align': 'center', 'line-height': this.h })
							.timeout( this.destroy, 1000 );
							
						arr[ 0 ].obj.destroy();
						this.destroy();
						Crafty.audio.play( 'explosion' );
					//	Crafty.audio.stop( 'spaceship' );
						//~ setTimeout( function(){
							//~ sText.destroy();
						//~ }, 1000 );
					});
			}
			function stopFormation(){
				clearTimeout( timer );
			}
			function updateScore( s ){
				score=score + ( s ? s : 0 );
				HUD.p1score.text( score );
				if ( score >= highScore ) {
					highScore=score;
				}
				HUD.hiscore.text( highScore );
			}
			function updateLivesDisplay(){
				Crafty( 'SmallShip').destroy();
				for( var i=0; i<lives; i++ ){
					Crafty.e( '2D, DOM, SmallShip' )
						.attr({ x: 2 + ( i * 21 ), y: 530 });
				}
			}
		});
		
	function saveGamesPlayed( game ){
		if ( game ){
			gamesPlayed.push( game );
		}
		if ( JSON && localStorage ){
			localStorage.setItem( 'invaderGames', JSON.stringify( gamesPlayed ) );
		}
		else console.log( 'cant use localstorge ');
	}
	function getGamesPlayed(){
		if ( JSON && localStorage ){
			if ( !localStorage.getItem( 'invaderGames' ) ) localStorage.setItem( 'invaderGames','[]' );
			return JSON.parse( localStorage.getItem( 'invaderGames' ) );
		}
		return [];
	}
	function getHighScores( num ){
		num=num || 10;
		var ret=gamesPlayed.slice().sort( function( a, b ){
			return b.score - a.score;
		});
		if ( ret.length > num ) return ret.slice( 0, num );
		return ret;
		
	}
	}
	
})( window );
