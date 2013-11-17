(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || (function(f){window.setTimeout(f, 0);});
  window.requestAnimationFrame = requestAnimationFrame;
})();

var FPSCounter = function (outputField) {
	var fps = 0;
	var self = this;
	this.collect = function () {
		if(outputField == document)
			outputField.title = fps.toString() + ' fps';
		else
			outputField.innerHTML = fps.toString() + ' fps';
		fps = 0;
		setTimeout(self.collect, 1000);
	}

	this.addFrame = function() {
		fps++;
	}

	this.collect();

	return this;
};

var JSRorschach = function(canvas) {

	this.width = canvas.width;
	this.height = canvas.height;

	this.scaleX = 1.5 / this.width;
	this.scaleY = 1.5 / this.height;
	this.scaleT = 0.01;
	this.time = 0;

	this.ctx = canvas.getContext("2d");
	this.imgdata = this.ctx.getImageData(0, 0, this.width, this.height);
	this.data = this.imgdata.data;

	this.paused = false;

	this.simplex = new SimplexNoise();

	this.self = this;
}

JSRorschach.prototype.step = function() {
	if(this.data) {
		this.time++;
		var width = this.width,
			height = this.height,
			scaleX = this.scaleX,
			scaleY = this.scaleY,
			scaleT = this.scaleT,
			time = this.time;
		var i, j, x, y, n, n2, n3;
		for(i=0; i<width / 2; i++) {
			x = (i - width * 0.5) * (i - width * 0.5) * 4 / (width * width);
			for(j=0; j<height; j++) {
				y = (j - height * 0.5) * (j - height * 0.5) * 4 / (height * height);

				n = this.simplex.noise3D(i * scaleX, j * scaleY, time * scaleT) * 0.5 + 0.5;
				n2 = this.simplex.noise3D(i * scaleX * 2, j * scaleY * 2, time * scaleT * 0.7) * 0.5 + 0.5;
				n3 = this.simplex.noise3D(i * scaleX * 4, j * scaleY * 4, time * scaleT * 1.1) * 0.5 + 0.5;
				n = (n + n2 + n3) / 3;
				n -= Math.pow((x > y ? x : y) * 0.8, 4);
				if(n < 0.48)
					n = 0;
				else if(n > 0.52)
					n = 1;
				else
					n = (n - 0.48) * 25 + (Math.random() - 0.5) * 0.2;
				/*n = (n + 0.5) | 0;*/
				n = (n * 255) | 0;
				n = 255 - n;
				this.putPixel(i, j, n);
				this.putPixel(width - i - 1, j, n);
			}
		}
		this.ctx.putImageData(this.imgdata, 0, 0);	
	}
};

JSRorschach.prototype.putPixel = function(x, y, v) {
	var p = (x + y * this.width) << 2;
	var data = this.data;
	data[p] = v;
	data[p+1] = v;
	data[p+2] = v;
	data[p+3] = 255;
};

JSRorschach.prototype.start = function(callback) {
	var self = this;
	var _step = function() {
		self.step();
		if(callback)
			callback();
		if(!self.paused) {
			requestAnimationFrame( function() { _step() } );
		}
	}
	_step();
};

JSRorschach.prototype.play = function(callback) {
	this.paused = false;
	this.start(callback);
};

JSRorschach.prototype.pause = function() {
	this.paused = true;
};