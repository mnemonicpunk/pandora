var NGP = function(ac) {
	this.__proto__ = new Pandora.Application(ac);

	this.Resources = function(rm) {
		rm.loadVideo('bbb', 'res/bbb.webm');
		rm.createObject('player', function() {
			this.__proto__ = new Pandora.Content.GameObject();
			//this._sprite = Pandora.Resource.Manager.get
			this.w = 800;
			this.h = 480;
			this.x = 0;
			this.y = 0;
			this.lastx = 0;
			this.lasty = 0;
			this.show = false;
			this.show_time = 0;
			this.alpha = 0;
			
			// buttons for resizing
			this.ssmall = null;
			this.smedium = null;
			this.slarge = null;
			this.sbar = null;
			this.pb = null;

			this.setup = function() {
				this.ssmall = new res.obj.button();
				this.smedium = new res.obj.button();
				this.slarge = new res.obj.button();
				this.pb = new res.obj.playbutton();
				this.ssmall.text = "Small";
				this.smedium.text = "Medium";
				this.slarge.text = "Large";
				
				this.sbar = new res.obj.seekbar();
				
				this.ssmall.onclick = function() {
					app.setResolution(800, 480);
				}
				this.smedium.onclick = function() {
					app.setResolution(1024, 600);
				}
				this.slarge.onclick = function() {
					app.setResolution(1280, 720);
				}
			}
			this.onResize = function(w, h) {
				this.w = w;
				this.h = h;
			}		
			this.update = function(scene) {
				this._boundingbox.setSize(this.w, 48);
				this._boundingbox.setPosition(0, this.h - 48);
				
				if ((this.lastx != app.Mouse.x) || (this.lasty != app.Mouse.y)) {
					this.show = true;
					this.showtime = 0;
				}
				this.lastx = app.Mouse.x;
				this.lasty = app.Mouse.y;
				if (this.show == true) {
					this.alpha += 32;
					if (this.alpha > 255) {
						this.alpha = 255;
						this.show_time++;
					}
					if (this.show_time > 40) {
						this.show = false;
						this.show_time = 0;
					}
				} else {
					this.alpha -= 32;
					if (this.alpha < 0) {
						this.alpha = 0;
					}			
				}
				this.x = 0;
				this.y = 0;

				// position the buttons
				this.ssmall.x = this.w - 79 - 128;
				this.ssmall.y = this.h - 32;
				this.smedium.x = this.w - 74 - 64;
				this.smedium.y = this.h - 32;
				this.slarge.x = this.w - 69;
				this.slarge.y = this.h - 32;
				this.sbar.x = 0;
				this.sbar.y = this.h - 48;
				this.sbar.w = this.w;
				this.sbar.h = 8;
				this.pb.x = 5;
				this.pb.y = this.h-32;
				
				this.ssmall.update(app);
				this.smedium.update(app);
				this.slarge.update(app);
				this.sbar.update(app);
				this.pb.update(app);
			}
			this.draw2D = function(g) {
				var txt = ""; //"FPS: " + app.fps + " -  Resolution: " + this.w + "x" + this.h + " -  Mouse: " + app.Mouse.x + ", " + app.Mouse.y + " LMB: " + NGP.app.Mouse.mbleft + " RMB: " + NGP.app.Mouse.mbright + " MMB: " + NGP.app.Mouse.mbmiddle;
				var x = 0;
				var y = this.h - 48;
			
				//g.drawImage(res.video.bbb, this.x, this.y);
				g.drawImageScaled(res.video.bbb, this.x, this.y, this.w, this.h);
				
				// draw menu
				g.setAlpha(this.alpha*0.75);
				g.setColor(32,32,32);
				g.fillRect(x, y, this.w, 48);
				
				g.setAlpha(this.alpha);
				
				this.sbar.draw2D(g);
				
				/*g.setColor(0,0,0);
				g.drawTextOutline(txt, x+10, y+10);
				g.setColor(255,255,255);
				g.drawText(txt, x+10, y+10);*/
				
				this.pb.draw2D(g);
				this.ssmall.draw2D(g);
				this.smedium.draw2D(g);
				this.slarge.draw2D(g);
				
				
			}
			this.setup();
		});
		rm.createObject('button', function() {
			this.__proto__ = new Pandora.Content.GameObject();
			this.w = 64;
			this.h = 24;
			this.text = "Button";
			this.onclick = null;
			
			this.update = function() {
				this._boundingbox.setSize(this.w, this.h);
				this._boundingbox.setPosition(this.x, this.y);
				if (app.Mouse.leftPressed()) { 
					if (this._boundingbox.contains(app.Mouse.x, app.Mouse.y) == true) {
						if (this.onclick != null) {
							this.onclick();
						}
					}
				}
			}
			this.draw2D = function(g) {
				g.setColor(32, 32, 32);
				g.fillRect(this.x, this.y, this.w, this.h);
				g.setColor(64, 64, 64);
				g.drawRect(this.x, this.y, this.w, this.h);					
				g.setColor(0,0,0);
				g.drawTextOutline(this.text, this.x+10, this.y+15);
				g.setColor(255,255,255);
				g.drawText(this.text, this.x+10, this.y+15);			
			}
		});
		rm.createObject('seekbar', function() {
			this.__proto__ = new Pandora.Content.GameObject();
			this.w = 800;
			this.h = 8;
			this.text = "Button";
			this.onclick = null;
			
			this.percent = 0;
			
			this.update = function() {
				this._boundingbox.setSize(this.w, this.h);
				this._boundingbox.setPosition(this.x, this.y);
				
				var v = res.video.bbb.get();
				
				if (app.Mouse.mbleft) {
					if (this._boundingbox.contains(app.Mouse.x, app.Mouse.y) == true) {
						v.currentTime = (v.duration * (app.Mouse.x / this.w));
						v.play();
					}
				}
				
				this.percent = v.currentTime / v.duration;
			}
			this.draw2D = function(g) {
				// draw progess bar
				//var percent = 25;
				var pbw = this.w * this.percent;
				
				g.setColor(128,64,64);
				g.fillRect(this.x, this.y-8, pbw, 8);
				g.setColor(128,128,128);
				g.fillRect(this.x+pbw, this.y-8, this.w-pbw, 8);
			}
		});
		rm.createObject('playbutton', function() {
			this.__proto__ = new res.obj.button();
			
			var Play = this;
			this.text = "Pause";
			this.onclick = function() {
				v = res.video.bbb.get();
				if (v.paused != true) {
					v.pause();
				} else {
					v.play();
				}
				if (v.paused == true || v.ended == true) {
					this.text = "Play";
				} else {
					this.text = "Pause";
				}				
			}
		});
		rm.createScene('start', function() {
			this.__proto__ = new Pandora.Content.Scene();
			this.counter = 0;
			this.enter = function(app) {
				var c = new res.obj.player();
				this.add(c);
				
				res.video.bbb.get().play();
			}
		});
	}
}