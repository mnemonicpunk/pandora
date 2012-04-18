/**
	@namespace The Pandora Library Namespace
	@gscope Pandora
*/
var Pandora = new function() {
	this.version_major = 0;
	this.version_minor = 5;

	// backreference for any internal calls
	var pandora_base = this;

	/**
		Instance this application class to create your Pandora application
		@class
	*/
	this.Application = function(bind_element) {
		// backreference for any further functions
		var App = this;

		// Application Resources
		this.Device = Pandora.Device.CurrentDevice;
		this.Audio = new this.Device.getAudioPlayer();

		console.log(this.Device.toString());

		// application components
		this.view = null;
		this.renderer = null;
		this.sound = new Pandora.Audio.Player();

		this.Mouse = null;
		this.Keyboard = null;
		this.interval = 25; // interval in milliseconds before each recurring update, will update as you change it
		this.interval_active = false;
		this.scene = null;
		this.scene_start = null;
		this.fullscreen_mode = false;

		// stats
		this.fps = 0;
		this.fps_interim = 0;
		this.fps_anchor = 0;

		// application settings
		this.bind_element = null;

		this.bind = function(e) {
			//var e = document.getElementById(id);
			if (e != null) {
				this.renderer = new pandora_base.Render.Render2D(e);
				this.renderer.setup();

				this.Mouse = new Pandora.Input.Mouse(e);
				this.Mouse.setup();

				this.Keyboard = new Pandora.Input.Keyboard(this.bind_element);
				this.Keyboard.setup();
			} else {
				App.log("Tried binding element that does not exist.");
			}
		}
		this.unbind = function() {
			this.bind_element = null;
		}
		this.log = function(txt) {
			console.log(txt);
		}
		this.start = function() {
			App = this;
			this.Resources(Pandora.Resource.Manager);
			this.setScene(new Pandora.Content.ScenePreload());

			// start the application
			this.interval_active = true;
			this.updateCycle();
		}
		this.stop = function() {
			this.interval_active = false;
		}
		this.update = function() {
			// increment the temp counter
			this.fps_interim++;

			var dt = new Date().getTime();

			if (dt > this.fps_anchor + 1000) {
				this.fps_anchor = dt;
				this.fps = this.fps_interim;
				this.fps_interim = 0;
			}

			if (this.Mouse && this.Keyboard) {
				this.Mouse.update();
				this.Keyboard.update();
			}

			if (this.scene != null) {
				this.scene.update(this);
			}

			if (this.renderer != null) {
				this.renderer.frameBegin();
				if (this.scene != null) {
					this.scene.draw(this.renderer);
				}

			}
		}
		this.updateCycle = function() {
			App.update();
			if (App.interval_active == true) {
				window.setTimeout(App.updateCycle, App.interval);
			} else {
				console.log("meh");
			}
		}
		this.setStart = function(scene) {
			this.scene_start = scene;
		}
		this.setScene = function(scene) {
			if (this.scene != null) {
				this.scene.leave(this);
			}
			this.scene = scene;
			this.scene.enter(this);
		}
		this.setResolution = function(width, height) {
			if (this.bind_element != null) {
				this.bind_element.width = width;
				this.bind_element.height = height;
				this.renderer.setup();
			}
			if (this.scene != null) {
				this.scene._setViewportSize(width, height);
			}
			this.onResize(width, height);
		}

		// application events
		this.onResize = function(w, h) {
			this.view.update();
			if (this.renderer != null) {
				this.renderer.setup();
			}

			if (this.scene != null && this.view.canvas != null) {
				//this.scene._setViewportSize(w, h);
				this.scene.onResize(this.view.canvas.width, this.view.canvas.height);
			}			
		}

		this.setView = function(view) {
			this.view = view;
			this.view.display(this.bind_element);
			console.log("Displaying new view.");
			this.onResize(window.innerWidth, window.innerHeight);
			this.view.update();
			if (this.view.canvas != null) {
				this.bind(this.view.canvas);
			}
			
		}

		this.setFullscreen = function(mode) {
			if (mode == false) {
				if (document.exitFullscreen) {
    				document.exitFullscreen();
				}
				else if (document.mozCancelFullScreen) {
				    document.mozCancelFullScreen();
				}
				else if (document.webkitCancelFullScreen) {
				    document.webkitCancelFullScreen();
				}
			} else {
				if (app.bind_element.requestFullscreen) {
				    app.bind_element.requestFullscreen();
				}
				else if (app.bind_element.mozRequestFullScreen) {
				    app.bind_element.mozRequestFullScreen();
				}
				else if (app.bind_element.webkitRequestFullScreen) {
				    app.bind_element.webkitRequestFullScreen();
				}
			}
		}

		this.toggleFullscreen = function() {
			this.setFullscreen(!this.fullscreen_mode);
		}

		// if there was a bind_element provided, autobind to it
		if (bind_element) {
			//this.bind(bind_element);
			this.bind_element = document.getElementById(bind_element);	
		}

		
		this.setView(new Pandora.Views.CanvasView());

		window.addEventListener('resize', function() {
			App.onResize(window.innerWidth, window.innerHeight);
		}, false);
		this.onResize(window.innerWidth, window.innerHeight);

		document.addEventListener("fullscreenchange", function () {
		    App.fullscreen_mode = document.fullscreen;
		}, false);

		document.addEventListener("mozfullscreenchange", function () {
		    App.fullscreen_mode = document.mozFullScreen;
		}, false);

		document.addEventListener("webkitfullscreenchange", function () {
		    App.fullscreen_mode = document.webkitIsFullScreen;
		}, false);		
	}

	/**
		@namespace The Pandora Renderers, feel free to roll your own
	*/
	this.Render = new function() {
		this.RenderBase = function(element) {
			this.render_target = element;
			this.ctx = null;
			this.setup = function() {

			}
			this.clear = function() {

			}
			this.toString = function() {
				return "[Pandora.Render.RenderBase]";
			}
			this.update = function() {

			}
		}
		this.Render2D = function(element) {
			this.__proto__ = new pandora_base.Render.RenderBase(element);
			this.width = 0;
			this.height = 0;
			this.setup = function() {
				this.ctx = this.render_target.getContext('2d');
				this.setSize(this.render_target.width, this.render_target.height);
				if (this.ctx == null) {
					alert("Failed to get graphics context.");
				}
			}
			this.setSize = function(w, h) {
				this.width = w;
				this.height = h;				
			}
			this.toString = function() {
				return "[Pandora.Render.Render2D]";
			}
			this.frameBegin = function() {
				this.setAlpha(255);
				this.clear();
			}

			/********************************
			 * 2D Rendering functions START *
			 ********************************/

			this.setColor = function(r, g, b) {
				var cr = Math.round(r%256);
				var cg = Math.round(g%256);
				var cb = Math.round(b%256);
				var cn = "rgb(" + cr + "," + cg + "," + cb + ")";
				this.ctx.fillStyle = cn;
				this.ctx.strokeStyle = cn;
			}
			this.getColor = function() {
				return this.ctx.fillStyle;
			}
			this.setAlpha = function(alpha) {
				if (alpha > 255) {
					alpha = 255;
				}
				if (alpha < 0) {
					alpha = 0;
				}
				this.ctx.globalAlpha = alpha/255;
			}
			this.fillRect = function(x, y, w, h) {
				this.ctx.fillRect(x, y, w, h);
			}
			this.drawRect = function(x, y, w, h) {
				this.ctx.strokeStyle = this.ctx.fillStyle;
				this.ctx.strokeRect(x, y, w, h);
			}
			this.drawLine = function(x1, y1, x2, y2) {
				this.ctx.beginPath();
				this.ctx.moveTo(x1, y1);
				this.ctx.lineTo(x2, y2);
				this.ctx.closePath();
				this.ctx.stroke();
			}
			this.clear = function() {
				/*this.setColor(0,0,0);
				this.fillRect(0, 0, this.width, this.height);*/
				this.ctx.clearRect(0, 0, this.width, this.height);
			}
			this.drawImage = function(img, x, y) {
				var i = img.get();
				if (i != null) {
					this.ctx.drawImage(i, x, y);
				}
			}
			this.drawImageScaled = function(img, x, y, w, h) {
				var i = img.get();
				var width = i.width? i.width: i.videoWidth;
				var height = i.width? i.height: i.videoHeight;
				if (i != null) {
					this.ctx.drawImage(i, 0, 0, width, height, x, y, w, h);
				}
			}
            this.drawImageSliced = function(img, x, y, sx, sy, sw, sh) {
                var i = img.get();
                if (i != null) {
                    try {
                        this.ctx.drawImage(i, sx, sy, sw, sh, x, y, sw, sh);
                    } catch(e) {
                        // image wasn't ready yet
                        console.log(e);
                    }

                }
            }
			this.drawText = function(text, x, y) {
				this.ctx.fillText(text, x, y);
			}
			this.drawTextOutline = function(text, x, y) {
				this.drawText(text, x-1, y);
				this.drawText(text, x+1, y);
				this.drawText(text, x, y-1);
				this.drawText(text, x, y+1);
			}

			/******************************
			 * 2D Rendering functions END *
			 ******************************/

		}
		this.Render3D = function(element) {
			this.__proto__ = new pandora_base.Render.RenderBase(element);
			this.toString = function() {
				return "[Pandora.Render.Render3D]";
			}
		}
	}

	/**
		@namespace The Pandora Audio handling functions
	*/
	this.Audio = new function() {
		this.Player = function() {
			this.sound = null;
			this.play = function(sound) {
				if (sound == null) {
					console.log("Failed to play audio: File was not ready.");
					return;
				}
				var snd = sound.get();

				this.sound = snd;
				this.sound.play();
			}
			this.stop = function() {
				if (this.sound != null) {
					this.sound.stop();
				}
			}
		}
	}

	/**
		@namespace The Pandora Input handlers, their constants and whatever else you might need for input
	*/
	this.Input = new function() {
		this.InputBase = function(element) {
			this.bind = element;
			this.setup = function() {

			}
		}
		this.Mouse = function(element) {
			this.__proto__ = new pandora_base.Input.InputBase(element);

			this.x = 0;
			this.y = 0;

			// deprecated, soon to be removed
			this.mbleft = false;
			this.mbright = false;
			this.mbmiddle = false;

			// state management vars
			this.LMB_down = false;
			this.RMB_down = false;
			this.LMB_held = false;
			this.RMB_held = false;

			// backref
			var Mouse = this;

			this.setup = function() {
				// install event handlers
				// down, up, move
				this.bind.addEventListener('mousemove', function(e) {
					Mouse.x = e.clientX - this.offsetLeft + document.body.scrollLeft;
					Mouse.y = e.clientY - this.offsetTop + document.body.scrollTop;
				}, true);
				this.bind.addEventListener('mousedown', function(e) {
					if (e.button == 0) {
						Mouse.mbleft = true;
					}
					if (e.button == 2) {
						Mouse.mbright = true;
					}
					if (e.button == 3) {
						Mouse.mbmiddle = true;
					}
					e.preventDefault();
					return false;
				}, true);
				this.bind.addEventListener('mouseup', function(e) {
					if (e.button == 0) {
						Mouse.mbleft = false;
					}
					if (e.button == 2) {
						Mouse.mbright = false;
					}
					if (e.button == 3) {
						Mouse.mbmiddle = false;
					}
					e.preventDefault();
					return false;
				}, true);
				this.bind.addEventListener('contextmenu', function(e) {
					e.preventDefault();
					return false;
				}, true);

			}
			this.update = function() {
				if (this.mbleft == true) {
					if (this.LMB_down == true) {
						this.LMB_held = true;
					} else {
						this.LMB_down = true;
					}
				} else {
					this.LMB_down = false;
					this.LMB_held = false;
				}
				if (this.mbright == true) {
					if (this.RMB_down == true) {
						this.RMB_held = true;
					} else {
						this.RMB_down = true;
					}
				} else {
					this.RMB_down = false;
					this.RMB_held = false;
				}
			}
			this.leftPressed = function() {
				return (this.LMB_down && !this.LMB_held);
			}
			this.leftDown = function() {
				return (this.LMB_down && this.LMB_held);
			}
			this.rightPressed = function() {
				return this.RMB_down;
			}
			this.rightDown = function() {
				return (this.RMB_down && this.RMB_held);
			}
		}
		this.Keyboard = function(element) {
			this.__proto__ = new pandora_base.Input.InputBase(element);

            // keycode constants
            this.KEY_UP = 38;
            this.KEY_LEFT = 37;
            this.KEY_RIGHT = 39;
            this.KEY_DOWN = 40;

            this.keystate_down = [];
            this.keystate_pressed = [];

			// this contains the last caught alphanumeric characters or symbols, for text entry purposes
			this.keyboard_string = "";

			var Keyboard = this;

			this.setup = function() {
				// install event handlers
				// onkeydown, onkeyup, onkeypress
				window.addEventListener('keydown', function(e) {
                    Keyboard.keystate_down[e.keyCode] = true;
				}, true);
				this.bind.addEventListener('keyup', function(e) {
                    Keyboard.keystate_down[e.keyCode] = false;
				}, true);
				this.bind.addEventListener('keypress', function(e) {

				}, true);

			}
			this.update = function() {

			}
            this.keyDown = function(key) {
                return (this.keystate_down[key]);
                /*if (this.keystate_down[key]) {

                } else {
                    return false;
                }*/
            }
		}
	}

	/**
		@namespace The Pandora Resource handling function
	*/
	this.Resource = new function() {
		// This is the resource manager providing all resource handling for the engine
		this.Manager = new function() {
			// backreference to the manager object
			var manager = this;

			this.res_list = new Object();
			this.get = function(name) {
				if (this.res_list[name] != undefined) {
					return this.res_list[name].get();
				} else {
					return null;
				}
			}
			this.loadImage = function(name, url) {
				var i = new Pandora.Device.CurrentDevice.Resource.Image();
				i.load(url);
				this.res_list[name] = i;
				res.img[name] = i;
				return i;
			}
			this.loadSound = function(name, url) {
				var i = new Pandora.Device.CurrentDevice.Resource.Sound();
				i.load(url);
				this.res_list[name] = i;
				res.sfx[name] = i;
				return i;
			}
			this.loadVideo = function(name, url) {
				var i = new Pandora.Device.CurrentDevice.Resource.Video();
				i.load(url);
				this.res_list[name] = i;
				res.video[name] = i;
				return i;
			}
			this.createScene = function(name, scene) {
				res.scene[name] = scene;
			}
			this.createObject = function(name, obj) {
				res.obj[name] = obj;
			}
			this.createView = function(name, view) {
				res.view[name] = view;
			}
			this.createWidget = function(name, widget) {
				res.widget[name] = widget;
			}			
			this.isPreloaded = function() {
				var ret = true;
				for (r in this.res_list) {
					if (this.res_list[r].preload) {
						console.log("Found preloadable resource.");
						if (!this.res_list[r].isReady()) {
							ret = false;
						}
					}
				}
				return ret;
			}
			this.preloadRemaining = function() {
				var ret = 0;
				for (var r in this.res_list) {
					if (this.res_list[r].preload) {
						if (!this.res_list[r].isReady()) {
							ret++;
						}
					}
				}
				return ret;
			}
			this.preloadTotal = function() {
				var ret = 0;
				for (r in this.res_list) {
					if (this.res_list[r].preload) {
						ret++;
					}
				}
				return ret;
			}
			this.preloadPercent = function() {
				var perc = 100 - (manager.preloadRemaining() / manager.preloadTotal() * 100);
				return perc;
			}
		}

		this.preloadPercent = this.Manager.preloadPercent;
	}

	/**
		@namespace The Pandora sanity checks to make sure certain features are supported by the browser
	*/
	this.Features = new function() {
		this.supportsWebM = function() {
			var ret = false;
			var tester = document.createElement('video');
			if (tester.canPlayType) {
				if (tester.canPlayType( "video/webm; codecs=\"vp8, vorbis\"" )) {
					ret = true;
				}
			}
			return ret;
		}
		this.supportsOgg = function() {
			var ret = false;
			var tester = document.createElement('audio');
			if (tester.canPlayType) {
				if (tester.canPlayType( 'video/ogg; codecs="theora"' )) {
					ret = true;
				}
			}
			return ret;
		}		
	}

	/**
		@namespace The Pandora Content namespace, contains all object prototypes relevant to creating application content
		@name Pandora.Content
	*/
	this.Content = new function() {
		/**
			@class The base class for all content objects, derive new content objects from this one as it may change over time
			@memberOf Pandora.Content
		*/
		this.ContentBase = function() {

		}
		/**
			@class The basic game object, featuring a location in space and a bounding box for collision checking
			@augments Pandora.Content.ContentBase
		*/
		this.GameObject = function() {
			this.__proto__ = new pandora_base.Content.ContentBase();

			// member vars for every visible/tangible object
			/**
				@private
			*/
			this.x = 0;
			/**
				@private
			*/
			this.y = 0;
			/**
				@private
			*/
			this.z = 0;
			/**
				@private
			*/
			this.rotx = 0;
			/**
				@private
			*/
			this.roty = 0;
			/**
				@private
			*/
			this.rotz = 0;
			/**
				@private
			*/
			this._boundingbox = new Pandora.Content.BoundingBox();

			// gameplay member vars
			/**
				@private
			*/
			this.visible = true;
			/**
				@private
			*/
			this.persistent = false;

			/**
				Run when creating the object - called internally, should never be directly called by your application
				@function
			*/
			this.create = function() {
				if (this.setup) {
					this.setup();
				}
			}
			/**
				Run when destroying the object - called internally, should never be directly called by your application
				@function
			*/
			this.destroy = function() {

			}
			/**
				Run when updating the object - called internally, should never be directly called by your application
				@function
			*/
			this.update = function() {

			}
			/**
				Run when drawing the object using a 2D renderer - called internally, should never be directly called by your application
				@param Renderer The renderer object to be used for drawing
				@function
			*/
			this.draw2D = function(g) {

			}
			/**
				Run when drawing the object using a 3D renderer - called internally, should never be directly called by your application
				@param Renderer The renderer object to be used for drawing
				@function
			*/
			this.draw3D = function(g) {

			}
			/**
				@private
			*/
			this.toString = function() {
				return "[Pandora.Content.GameObject]";
			}
		}
		/**
			@class The basic scene object, used to hold object collections and trigger their update and draw functions periodically
			@augments Pandora.Content.ContentBase
		*/
		this.Scene = function() {
			this.__proto__ = new pandora_base.Content.ContentBase();

			/**
				@private
			*/
			this.obj = new pandora_base.Content.ObjectList();
			/**
				@private
			*/
			this.view = null;			
			/**
				@private
			*/
			this.width = 800;
			/**
				@private
			*/
			this.height = 480;

			/**
				@private
			*/
			this._vp_x = 0;
			/**
				@private
			*/
			this._vp_y = 0;
			/**
				@private
			*/
			this._vp_width = 0;
			/**
				@private
			*/
			this._vp_height = 0;

			/**
				@private
			*/
			var current_scene = this;

			/**
				Run when updating the scene - called internally, should never be directly called by your application
				@param Application The application object this scene belongs to
				@function
			*/
			this.update = function(app) {
				var updateFunc = function(obj) {
					obj.update(current_scene);
				}
				this.obj.forEach(updateFunc);

			}

			/**
				Run when drawing the scene - called internally, should never be directly called by your application
				@param Renderer The renderer object to be used for drawing
				@function
			*/
			this.draw = function(g) {
				var Graphics = g;
				var drawFunc = function(obj) {
					if (obj.visible) {
						obj.draw2D(Graphics);
					}
				}
				this.obj.forEach(drawFunc);
			}
			/**
				Run when the viewport size of the scene changes - called internally, should never be directly called by your application
				@param width The new viewport width
				@param height The new viewport height
				@function
			*/
			this.onResize = function(w, h) {
				var width = w;
				var height = h;

				this.width = w;
				this.height = h;
				var resizeFunc = function(obj) {
					if (obj.onResize) {
						obj.onResize(width, height);
					}
				}
				this.obj.forEach(resizeFunc);
			}
			/**
				Adds a GameObject to the scene
				@param object The object to be added to the scene
				@function
			*/
			this.add = function(obj) {
				this.obj.add(obj);
			}
			/**
				Run when entering the scene - called internally, should never be directly called by your application
				@param Application The application object the current scene belongs to
				@function
			*/
			this.enter = function(app) {

			}
			/**
				Run when leaving the scene - called internally, should never be directly called by your application
				@param Application The application object the current scene belongs to
				@function
			*/
			this.leave = function(app) {

			}
			this._setViewportPosition = function(x, y) {
				this._vp_x = x;
				this._vp_y = y;
			}
			this._setViewportSize = function(w, h) {
				this._vp_width = w;
				this._vp_height = h;
			}
		}

		/**
			@class The default canvas renderer scene, if you want to use your own derive it from this
			@augments Pandora.Content.Scene
		*/
		this.SceneCanvas = function() {
			this.__proto__ = new Pandora.Content.Scene();			
			this.enter = function(app) {
				this.view = Pandora.Views.CanvasView();
				app.setView(this.view);
			}
		}

		/**
			@class The default preloader scene, if you want to use your own derive it from this and plug it in before starting your application
			@augments Pandora.Content.Scene
		*/
		this.ScenePreload = function() {
			this.__proto__ = new pandora_base.Content.Scene();

			this.next_scene = null;
			this.enter = function(app) {
				this.__proto__.enter(app);

				// check for compatibility
				var error = "";
				/*if (!Pandora.Features.supportsWebM() == true) {
					error += "Your browser does not support the WebM video format.";
				}*/

				if (error != "") {
					var new_scene = new Pandora.Content.SceneError();
					new_scene.error = error;
					app.setScene(new_scene);
				}

				console.log("Preloading resources...");
			}
			this.update = function(app) {
				// if preloading complete, switch scene
				var c = Pandora.Resource.Manager.preloadRemaining();
				if (c == 0) {
					if (app.scene_start != null) {
						console.log("Resources ready, entering application.");
						app.setScene(app.scene_start);
					} else {
						console.log("Trying to enter starting scene, but no starting scene set.");
					}
				}
			}
			this.draw = function(g) {
				this.__proto__.draw(g);
				g.setColor(255,255,255);

				var plp = Pandora.Resource.preloadPercent();
				if ((plp >= 0) && (plp <= 100)) {
					g.drawText("Loading... (" + plp +  "%)", 10, 10);
				} else {
					g.drawText("Loading...", 10, 10);
				}
			}
		}
		/**
			@class The default error scene, if you want to use your own derive it from this and plug it in before starting your application
			@augments Pandora.Content.Scene
		*/
		this.SceneError = function() {
			this.__proto__ = new pandora_base.Content.Scene();
			this.error = "";
			this.draw = function(g) {
				g.setColor(255,255,255);
				g.drawText("An error has occurred:", 10, 10);
				g.drawText(this.error, 10, 25);
			}
		}
		/**
			@class An object list designed to hold and sort GameObjects and iteratively call functions on them
		*/
		this.ObjectList = function() {
			/**
				@private
			*/
			this.obj = new Array();

			/**
				Adds an object
				@function
				@parameter Object The object to add
			*/
			this.add = function(obj) {
				this.obj.push(obj);
			}
			/**
				Removes an object
				@function
				@parameter Object The object to remove
			*/
			this.remove = function(obj) {

			}
			/**
				Executes a function for each object in the list
				@function
				@parameter Function The function to exevute, must take a GameObject as first parameter
			*/
			this.forEach = function(func) {
				for (var i=0; i<this.obj.length; i++) {
					func(this.obj[i]);
				}
			}
		}
		/**
			@class A bounding box class to unify all bounding box related stuff
		*/
		this.BoundingBox = function() {
			this.x = 0;
			this.y = 0;
			this.w = 0;
			this.h = 0;

			/**
				Sets the size of the bounding box
				@function
				@param width The new width
				@param height The new height
			*/
			this.setSize = function(w, h) {
				this.w = w;
				this.h = h;
			}
			/**
				Sets the position of the bounding box
				@function
				@param x The new x position
				@param y The new y position
			*/
			this.setPosition = function(x, y) {
				this.x = x;
				this.y = y;
			}
			this.collidesWith = function() {

			}
			/**
				Checks whether a point is inside the bounding box
				@function
				@param x The x position to check
				@param y The y position to check
				@returns TRUE if inside, FALSE if outside the bounding box
			*/
			this.contains = function(x, y) {
				if ((this.x <= x) && (this.x+this.w >= x) && (this.y <= y) && (this.y+this.h >= y)) {
					return true;
				} else {
					return false;
				}
			}
		}

        this.Sprite = function() {
            this.res = null;
            this.sprite_width = 0;
            this.sprite_height = 0;
            this.sprite_images = 0;
            this.sprite_images_per_row = 0;
            this.current_image = 0;
            this.__proto__ = new pandora_base.Content.ContentBase();
            this.setImage = function(image) {
                this.res = image;
            }
            this.setSprite = function(width, height) {
                this.sprite_width = width;
                this.sprite_height = height;
                if (this.res != null) {
                    var i = this.res.get();
                    this.sprite_images = i.width/this.sprite_width * i.height/this.sprite_height;
                    this.sprite_images_per_row = i.width/this.sprite_width;
                }
            }
            this.next = function() {
                this.current_image++;
                if (this.current_image > this.sprite_images) {
                    this.current_image = this.sprite_images;
                }
            }
            this.draw = function(g, x, y) {
                var sx = 0; //(this.current_image % this.sprite_images_per_row) * this.sprite_width;
                var sy = 0; //((this.current_image - (this.current_image % this.sprite_images_per_row)) / this.sprite_images_per_row) * this.sprite_height;
                g.drawRect(x, y, 32, 32);
                g.drawImageSliced(this.res, x, y, this.sx, this.sy, this.sprite_width, this.sprite_height);

            }
        }
	}

	/**
		@namespace The Pandora Device namespace, contains all device detection functions and allows for automatic branching depending on the device
		@name Pandora.Content
	*/
	this.Device = new function() {
		var Devices = this;

		this.DeviceBase = function() {
			this.getAudioPlayer = function() {

			}
			this.toString = function() {
				return "Pandora Device: Unknown Device";
			}
		}
		this.Desktop = function() {
			var Device = this;

			this.__proto__ = new Devices.DeviceBase();
			this.toString = function() {
				return "Pandora Device: Desktop Computer";
			}
			this.Resource = new function() {
				this.ResourceBase = function() {
					this.url = null;
					this.res = null;
					this.ready = false;
					this.preload = true;

					this.type = "";

					this.load = function(url) {

					}
					this.get = function() {

					}
					this.isReady = function() {
						return this.ready;
					}
					this.toString = function() {
						return "[Pandora.Resource.ResourceBase]";
					}
				}
				this.Image = function() {
					this.__proto__ = new Device.Resource.ResourceBase();
					this.load = function(url) {
						this.res = document.createElement('img');
						this.res.src = url;

						var ImageLoader = this;
						this.res.addEventListener('load', function() {
							console.log("Image resource [" + this.src + "] just became ready.");
							ImageLoader.ready = true;
						}, false);
					}
					this.get = function() {
						if (this.ready) {
							return this.res;
						} else {
							return null;
						}
					}
					this.toString = function() {
						return "[Pandora.Resource.Image:" + this.url + "]";
					}
				}
				this.Sound = function() {
					this.__proto__ = new Device.Resource.ResourceBase();
					this.load = function(url) {
						this.res = document.createElement('audio');
						this.res.src = url;
						this.res.src.preload = this.preload;
						this.res.load();

						//console.log("Sound resource [" + this.res.src + "] just became ready.");
						//this.ready = true;

						var SoundLoader = this;
						this.res.addEventListener('canplay', function() {
							console.log("Sound resource [" + this.src + "] just became ready.");
							SoundLoader.ready = true;
						}, false);
					}
					this.get = function() {
						return this.res;
					}
				}
				this.Video = function(url) {
					this.__proto__ = new Device.Resource.ResourceBase();
					this.preload = true;
					this.load = function(url) {
						this.res = document.createElement('video');
						this.res.src = url;
						this.res.src.preload = "auto";
						this.res.load();
						//this.ready = true;
						console.log("Loading: " + url);

						var VideoLoader = this;
						this.res.addEventListener('canplay', function() {
							console.log("Video resource [" + this.src + "] just became ready.");
							VideoLoader.ready = true;
						}, false);
						//this.res.addEventListener('');
					}
					this.get = function() {
						return this.res;
					}
				}				
			}
			this.Notification = new function() {
				this.supported = function() {
					if (window.webkitNotifications) {
						return true;
					}
					else {
						return false;
					}
				}
				this.show = function(icon, title, content) {
					if (this.supported()) {
						if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
						// function defined in step 2
							console.log("Notifications created.");
							return window.webkitNotifications.createNotification(icon, title, content);
						} else {
							console.log("Notification permission requested.");
							window.webkitNotifications.requestPermission();
						}
					} else {
						console.log("Notifications unavailable.");
						return null;
					}
				}
			}		
		}
		this.PandoraBox = function() {
			var Device = this;

			this.__proto__ = new Devices.DeviceBase();
			this.toString = function() {
				return "Pandora Device: PhoneGap Device";
			}
			this.Resource = new function() {
				this.ResourceBase = function() {
					this.url = null;
					this.res = null;
					this.ready = false;
					this.preload = true;

					this.type = "";

					this.load = function(url) {

					}
					this.get = function() {

					}
					this.isReady = function() {
						return this.ready;
					}
					this.toString = function() {
						return "[Pandora.Resource.ResourceBase]";
					}
				}
				this.Image = function() {
					this.__proto__ = new Device.Resource.ResourceBase();
					this.load = function(url) {
						this.res = document.createElement('img');
						this.res.src = url;

						var ImageLoader = this;
						this.res.addEventListener('load', function() {
							console.log("Image resource [" + this.src + "] just became ready.");
							ImageLoader.ready = true;
						}, false);
					}
					this.get = function() {
						if (this.ready) {
							return this.res;
						} else {
							return null;
						}
					}
					this.toString = function() {
						return "[Pandora.Resource.Image:" + this.url + "]";
					}
				}
				this.Sound = function() {
					this.__proto__ = new Device.Resource.ResourceBase();
					this.load = function(url) {
						/*this.res = document.createElement('audio');
						this.res.src = url;
						this.res.src.preload = this.preload;
						this.res.load();*/



						//console.log("Sound resource [" + this.res.src + "] just became ready.");*/

						var SoundLoader = this;
						this.res = new Media("file:///android_asset/www/res/chiptune.ogg", function() {
							console.log("Sound resource [" + this.src + "] just became ready.");
							SoundLoader.ready = true;
						}, function() {
							console.log("Error loading sound.");
						});
						//console.log("Sound playback not yet implemented for this platform.")
					}
					this.get = function() {
						return this.res;
					}
				}
				this.Video = function(url) {
					this.__proto__ = new Device.Resource.ResourceBase();
					this.preload = true;
					this.load = function(url) {
						/*this.res = document.createElement('video');
						this.res.src = url;
						this.res.src.preload = "auto";
						this.res.load();
						//this.ready = true;
						console.log("Loading: " + url);

						var VideoLoader = this;
						this.res.addEventListener('canplay', function() {
							console.log("Video resource [" + this.src + "] just became ready.");
							VideoLoader.ready = true;
						}, false);
						//this.res.addEventListener('');*/
						console.log("Video playback not yet implemented for this platform.")
					}
					this.get = function() {
						return this.res;
					}
				}				
			}		
		}

		this.CurrentDevice = new this.Desktop();
	}

	this.Views = new function() {
		this.BaseView = function() {
			this.__proto__ = new Pandora.Widgets.Widget();
			this.canvas = null;
			this.display = function(root_element) {
				var b = null;
	            if (root_element == null) {
	                b = document.body;
	            } else {
	                b = root_element;
	            }

	            //var b = root_element;
				while (b.hasChildNodes()) {
					b.removeChild(b.lastChild);
				}
				b.appendChild(this.get());
			}
		}

		this.CanvasView = function() {
			this.__proto__ = new Pandora.Views.BaseView();
			this.setup = function() {
				this.element  = document.createElement('div');
				var c = new Pandora.Widgets.Canvas();
				c.width = document.width;
				c.height = document.height;
				this.canvas = c.get();
				this.add(c);
			}
			this.update = function() {
				this.canvas.width = document.width;
				this.canvas.height = document.height;
			}
		}

		this.DefaultView = function() {
			this.__proto__ = new Pandora.Views.BaseView();
			this.widget_bar = null;
			this.widget_canvas = null;
			this.setup = function() {
				this.element  = document.createElement('div');

				this.widget_bar = new Pandora.Widgets.AppBar();
				this.widget_canvas = new Pandora.Widgets.Canvas();

				this.widget_canvas.width = document.body.clientWidth;
				this.widget_canvas.height = document.body.clientHeight-32;

				this.canvas = this.widget_canvas.get();

				this.add(this.widget_bar);
				this.add(this.widget_canvas);
			}
			this.update = function() {
				this.widget_canvas.width = document.body.clientWidth;
				this.widget_canvas.height = document.body.clientHeight-32;
				this.widget_bar.update();
				this.widget_canvas.update();
			}
		}
	}

	this.Widgets = new function() {
		this.Widget = function() {
			this.element = null;
			this.events = null;
			this.children = null;

	        // method placeholders
	        this.wrapChild = null;

			this.setup = function() {
				this.element = document.createElement('div');
				this.element.className = 'pandoraUI_widget';
			}
	        this.update = function() {

	        }
			this.assertReady = function() {
				if (this.element == null) {
					this.setup();
					this.attachEvents(this.element);
					this.appendChildren(this.element);
				}
			}
			this.get = function() {
				this.assertReady();
				return this.element;
			}
			this.add = function(widget) {
				if (this.children == null) {
					this.children = new Array();
				}
				this.children.push(widget);
			}
			this.appendChildren = function(node) {
				if (this.children != null) {
					for (var i=0; i<this.children.length; i++) {
	                    var next = this.children[i].get();
	                    if (this.wrapChild != null) {
	                        next = this.wrapChild(next);
	                    }
						node.appendChild(next);
					}
				}
			}
			this.event = function(event_name, event_function) {
				if (this.events == null) {
					this.events = new Array();
				}
				this.events.push([event_name, event_function]);
			}
			this.attachEvents = function(node) {
				if (this.events != null) {
					for (var i=0; i<this.events.length; i++) {
						node.addEventListener(this.events[i][0],this.events[i][1],false);
					}
				}			
			}
			this.toString = function() {
				return "Base Widget";
			}
		}

        this.Container = function() {
            this.__proto__ = new Pandora.Widgets.Widget();
            this.setup = function() {
                this.element = document.createElement('ul');
                this.element.className = 'container_vertical';
            }
            this.wrapChild = function(child) {
                var li = document.createElement('li');
                li.className = "container_vertical_item";
                console.log(child);
                li.appendChild(child);
                return li;
            }
        }
        this.List = function() {
            this.__proto__ = new Pandora.Widgets.Widget();
            this.setup = function() {
                this.element = document.createElement('div');
                this.element.className = 'list_vertical';
            }
            this.wrapChild = function(child) {
                var li = document.createElement('div');
                li.className = "list_vertical_item";
                console.log(child);
                li.appendChild(child);
                return li;
            }
        }
		this.Label = function() {
			this.__proto__ = new Pandora.Widgets.Widget();
			this._text = "Label";
			this.setup = function() {
				this.element = document.createElement('p');
				this.element.className = 'label';
				this.element.innerHTML = this._text;
			}
            this.setText = function(text) {
                this._text = text;
            }
		}
		this.TextField = function() {
			this.__proto__ = new Pandora.Widgets.Widget();
			this._text = "Label";
			this.setup = function() {
				this.element = document.createElement('input');
				this.element.type = 'text';
				this.element.className = 'TextField';
				this.element.value = this._text;
			}
		}
		this.Canvas = function() {
			this.__proto__ = new Pandora.Widgets.Widget();
			this.setup = function() {
				this.element = document.createElement('canvas');
				this.element.className = 'pandoraUI_canvas';
				this.element.style.width = this.width;
				this.element.style.height = this.height;
				this.element.width = this.width;
				this.element.height = this.height;
			}

			this.update = function() {
				this.element.style.width = this.width;
				this.element.style.height = this.height;
				this.element.width = this.width;
				this.element.height = this.height;
			}
		}
		this.AppBar = function() {
			this.__proto__ = new Pandora.Widgets.Widget();
			this._text = "Pandora Application";
			this.setup = function() {
				this.element = document.createElement('div');
				this.element.className = 'pandoraUI_appbar';
				//this.element.innerHTML = this._text;
				this.element.height = "48px";

				var fs = new Pandora.Widgets.AppBarFullscreenButton();
				this.add(fs);

				var l = new Pandora.Widgets.Label();
				l.setText("Pandora Application");
				this.add(l);

			}
            this.setText = function(text) {
                this._text = text;
            }			
		}

		this.AppBarFullscreenButton = function() {
			this.__proto__ = new Pandora.Widgets.Widget();
			this._text = "Pandora Application";
			this.setup = function() {
				this.element = document.createElement('input');
				this.element.type = "button";
				this.element.className = 'pandoraUI_fullscreenbutton';
				this.element.value = "Fullscreen";
				this.element.addEventListener('click', function() {
					app.toggleFullscreen();
				});
			}
            this.setText = function(text) {
                this._text = text;
            }						
		}	
	}
}

var res = new function() {
	this.img = {};
	this.video = {};
	this.bgm = {};
	this.sfx = {};
	this.spr = {};
	this.scene = {};
	this.obj = {};
	this.view = {};
	this.widget = {};
}