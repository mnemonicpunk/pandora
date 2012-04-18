var NGP = function(ac) {
	this.__proto__ = new Pandora.Application(ac);
	
	this.Resources = function(rm) {
		if (Pandora.Features.supportsOgg()) {
			rm.loadSound('chip', 'res/chiptune.ogg');
		}
		rm.createObject('player', function() {
			this.__proto__ = new Pandora.Content.GameObject();
			this.visible = true;
			//this._sprite = Pandora.Resource.Manager.get
				this.x = Math.random()*1280;
				this.y = Math.random()*720;
				this.speed = -Math.random()*10;

			this.update = function(app) {
				this.x += this.speed;
				if (this.x < 0) {
					this.x += 1280;
				}
			}
			this.draw2D = function(g) {
				var cr = Math.random() * 255;
				var cg = Math.random() * 255;
				var cb = Math.random() * 255;
				g.setColor(cr,cg,cb);
				g.drawText("Hello world! FPS: " + app.fps, this.x, this.y);
				//g.drawRect(this.x, this.y, 10, 10);
			}
		});
		rm.createScene('start', function() {
			this.__proto__ = new Pandora.Content.Scene();
			this.enter = function(app) {
				for (var i=0; i<100; i++) {
					var c = new res.obj.player();
					this.add(c);
				}
				app.sound.play(res.sfx.chip);
				this.view = new Pandora.Views.DefaultView();
				app.setView(this.view);
			}
		});
		rm.createView('demoview', function() {
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
		});
	}
}