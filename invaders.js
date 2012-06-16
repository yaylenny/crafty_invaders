
( function( window, undefined ){
	
	window.onload=Invaders;
	
	var
		ROWS=[ 'Alien0', 'Alien1', 'Alien2', 'Alien3', 'Alien4' ],
		ASPRITES={
			'Alien0': [ 3, 39 ],
			'Alien1': [73, 106 ],
			'Alien3': [ 146, 178 ] 
		},
		COLUMNS=11;
		
		ASPRITES[ 'Alien2' ]=ASPRITES[ 'Alien1' ];
		ASPRITES[ 'Alien4' ] = ASPRITES[ 'Alien3' ];
		
	function Invaders(){
		
		var scoreKeeper=Crafty.e( 'Scorekeeper' );
		console.log( 'sk', scoreKeeper );
		Crafty.init( 480,  544 );
		
		Crafty.audio.add( 'shoot', 'sounds/shoot.wav' );
		
		Crafty.load( [ 'sprite.png' ], function(){
			Crafty.sprite( 1, 'sprite.png', {
				Sign: [ 170, 0, 240, 170 ],
				Ship: [ 276, 224, 28, 24 ],
				Alien0: [ 3, 220, 24, 24 ],
				Alien1: [ 73, 220, 24, 24 ],
				Alien2: [ 73, 220, 24, 24 ],
				Alien3: [ 146, 220, 26, 26 ],
				Alien4: [ 146, 220, 26, 26 ],
				DeadAlien: [ 436, 274, 32, 32 ],
				Spaceship: [ 212, 222, 50, 24],
				Bullet: [ 411, 276, 8, 14],
				AlienBullet: [ 333, 274, 6, 16],
				Shield: [ 314, 210, 48, 36 ]
			});
			
			Crafty.scene( 'Splash' );
		});
		Crafty.c( 'Shoot', {
			shoot: function(){
				if ( this.has( 'Ship' ) ){
					Crafty.e( '2D, DOM, Bullet, Collision' )
						.attr({ y: this._y, x: this.x + ( this.w / 2 - 2 )})
						.bind( 'EnterFrame', function(){
							this.y = this.y - 12;
							if ( this.y < 0 ) this.destroy();
						})
						.onHit( 'AlienBullet', function( arr ){
							this.destroy();
							arr[ 0 ].obj.destroy();
						});
						Crafty.audio.play( 'sheet' ); 
				}
				else if ( this.has( 'Alien' ) ){
					Crafty.e( '2D, DOM, AlienBullet, Collision' )
						.attr({ y: this.y + this.h, x: this.x + ( this.w / 2 )})
						.bind( 'EnterFrame', function(){
							this.y=this.y+10;
							if ( this.y >= Crafty.viewport.height ) this.destroy();
						});
				}
			}
		});
		Crafty.c( 'Scorekeeper', {
			init: function(){
				this.requires( '2D, DOM, Persist, Color' )
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
			Crafty.background('#000');
			Crafty.e( "2D, DOM, Sign" )
				.attr({ x: 120, w: 240,y: 100,  h: 170 });
				
			Crafty.e("2D, DOM, Text")
				.attr({ w: 390, h: 50, x: 43, y: 420, alpha: '.9'})
				.text('Press Enter to play')
				.css({ 'text-align': 'center', color: '#fff', 'font-size': 40, 'font-weight': 'bold', 'background-color': '#444', 'border': '2px solid #fff', 'border-radius': 5, 'line-height': 50 });
			Crafty.e("Keyboard")
				.bind( 'KeyDown', function( e ){
					if ( e.keyCode === Crafty.keys.ENTER ){
						this.destroy();
						Crafty.scene( 'Invaders' );
					}
				});
		});
		
		Crafty.scene( 'Invaders', function(){
			var rows=[],
				beat=50, // ms ( gets lower as less aliens live )
				pauseText=null,
				timer=null;
			
			Crafty.e( 'Keyboard' )
				.bind( 'KeyDown', function( e ){
					if ( e.key === Crafty.keys.P ){
						if ( Crafty.isPaused() ){
							Crafty( 'PauseText' ).destroy();
						}
						else{ console.log( 'setting pauseText' );
							Crafty.e('2D, DOM, Text, PauseText'  )
								.css({ 'text-align': 'center', 'font-size': '32px', 'font-weight': 'bold', color: '#fff', z: 100 })
								.text( 'PAUSED' )
								.attr({ x: 190, w: 100, y: 240 })
						}
						setTimeout( function(){ Crafty.pause();}, 100 );
					}
				});
				
			scoreKeeper.attr({
				x: 30, y: 10, w: 200, h: 100 
			});
			Crafty.background( '#000' );
			
			/* OUR HERO */
			Crafty.e( '2D, DOM, Collision, Ship, Keyboard, Shoot' )
				.attr({ x: 100, y: 500 })
				.bind( 'EnterFrame', function( e ){
					if ( this.isDown( 'LEFT_ARROW') ) this.x = this.x -2;
					else if ( this.isDown( 'RIGHT_ARROW' )) this.x= this.x +2;
					
					if ( this.x < 0 ) this.x=0;
					if ( this.x + this.w > Crafty.viewport.width ) this.x=Crafty.viewport.width - this.w
				})
				.bind( 'KeyDown', function( e ){
					if ( e.key === Crafty.keys.SPACE ){
						e.preventDefault();
						if ( Crafty( 'Bullet' ).length === 0 ) this.shoot();
					} 
				});
				
			/* ALIEN FORMATION */
			for ( var j=0, len=ROWS.length, i; j<len; j++ ){
				rows[ j ]=[];
				for ( i=0; i<COLUMNS; i++ ){
					rows[ j ].push( Crafty.e( '2D, DOM, Tween, Shoot, Alien, Collision, '+ROWS[ j ] )
						.attr({ y: 30 + ( j * 32 ), x: 10 + ( 32 * i ) })
						.onHit( 'Bullet', function( arr ){
							arr[ 0 ].obj.destroy();// destroy the bullet
							this.sprite( 435, 273, 24, 24 )
								.timeout( function(){
									this.destroy();
								}, 200 );
						})
					);
				}
			}
			
			/* SHIELDS */
			for ( j=0; j<4; j++ ){
				Crafty.e( '2D, DOM, Shield' )
					.attr({ y: 440, x: 20 + ( j * 130 ), w: 48, h: 36 });
			}
			startFormation();
			
			function startFormation(){
				var direction=1, // LEFT TO RIGHT TO START
					speed=3;
				timer=setInterval( function(){
					if ( Crafty.isPaused() ) return;
					var minX=0, maxX=Crafty.viewport.width, localTimer=null, drop=false;
					move( 4 );
					
					function move( i ){
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
							clearTimeout( localTimer );
							localTimer=setTimeout( function(){ move( i-1 )}, beat );

					}
				if ( Crafty( 'AlienBullet' ).length < 2 ) {
					var aliens=Crafty( 'Alien' ),
						rand=Crafty.math.randomInt( 0, aliens.length - 1 );
					Crafty( aliens[ rand ] ).shoot();
				}
				}, beat * 5 );
			}
			
			function stopFormation(){
				clearTimeout( timer );
			}
		});
		
	}
})( window );
