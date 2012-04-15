var NGP = new function() {
	//this.image1 = Pandora.Resource.Manager.loadImage('nyan', 'res/nyan.jpg');
	this.video1 = Pandora.Resource.Manager.loadVideo('bbb', 'res/bbb.webm');
	//this.bgm1 = Pandora.Resource.Manager.loadSound('bgm1', 'res/bgm1.mp3');
	this.app = null;

	this.onload = function() {
		this.app = new Pandora.Application('app_canvas');
		this.app.setStart(new NGP.SceneStart());
		this.app.start();
		
	}
	
	this.Player = function() {
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
			this.ssmall = new NGP.ObjectButton();
			this.smedium = new NGP.ObjectButton();
			this.slarge = new NGP.ObjectButton();
			this.pb = new NGP.PlayButton();
			this.ssmall.text = "Small";
			this.smedium.text = "Medium";
			this.slarge.text = "Large";
			
			if (!NGP.video1.get().paused) {
				this.pb.text = "Pause";
			} else {
				this.pb.text = "Play";
			}
			
			this.sbar = new NGP.SeekBar();
			
			this.ssmall.onclick = function() {
				NGP.app.setResolution(800, 480);
			}
			this.smedium.onclick = function() {
				NGP.app.setResolution(1024, 600);
			}
			this.slarge.onclick = function() {
				NGP.app.setResolution(1280, 720);
			}
			
		}
		this.onResize = function(w, h) {
			this.w = w;
			this.h = h;
		}		
		this.update = function(app) {
			this._boundingbox.setSize(this.w, 48);
			this._boundingbox.setPosition(0, this.h - 48);
			
			if ((this.lastx != NGP.app.Mouse.x) || (this.lasty != NGP.app.Mouse.y)) {
				this.show = true;
				this.showtime = 0;
			}
			this.lastx = NGP.app.Mouse.x;
			this.lasty = NGP.app.Mouse.y;
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
			var txt = "FPS: " + NGP.app.fps + " -  Resolution: " + this.w + "x" + this.h + " -  Mouse: " + NGP.app.Mouse.x + ", " + NGP.app.Mouse.y + " LMB: " + NGP.app.Mouse.mbleft + " RMB: " + NGP.app.Mouse.mbright + " MMB: " + NGP.app.Mouse.mbmiddle;
			var x = 0;
			var y = this.h - 48;
		
			g.drawImageScaled(NGP.video1, this.x, this.y, this.w, this.h);
			
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
	}
	
	this.ObjectButton = function() {
		this.__proto__ = new Pandora.Content.GameObject();
		this.w = 64;
		this.h = 24;
		this.text = "Button";
		this.onclick = null;
		
		this.update = function() {
			this._boundingbox.setSize(this.w, this.h);
			this._boundingbox.setPosition(this.x, this.y);
			if (NGP.app.Mouse.leftPressed()) { 
				if (this._boundingbox.contains(NGP.app.Mouse.x, NGP.app.Mouse.y) == true) {
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
	}
	this.SeekBar = function() {
		this.__proto__ = new Pandora.Content.GameObject();
		this.w = 800;
		this.h = 8;
		this.text = "Button";
		this.onclick = null;
		
		this.percent = 0;
		
		this.update = function() {
			this._boundingbox.setSize(this.w, this.h);
			this._boundingbox.setPosition(this.x, this.y);
			
			var v = NGP.video1.get();
			
			if (NGP.app.Mouse.mbleft) {
				if (this._boundingbox.contains(NGP.app.Mouse.x, NGP.app.Mouse.y) == true) {
					v.currentTime = (v.duration * (NGP.app.Mouse.x / this.w));
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
	}
	this.PlayButton = function() {
		this.__proto__ = new NGP.ObjectButton();
		
		var Play = this;
		this.onclick = function() {
			v = NGP.video1.get();
			if (v.paused != true) {
				v.pause();
				this.text = "Play";
			} else {
				v.play();
				this.text = "Pause";			
			}
		}
	}
	this.SceneStart = function() {
		this.__proto__ = new Pandora.Content.Scene();
		this.counter = 0;
		this.enter = function(app) {
			var c = new NGP.Player();
			this.add(c);
			
			//NGP.app.sound.play(NGP.bgm1);	
			NGP.video1.get().play();
		}
	}
}

window.addEventListener('load', function() {
	NGP.onload();
}, false);
