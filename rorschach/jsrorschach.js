(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || (function(f){window.setTimeout(f, 0);});
  window.requestAnimationFrame = requestAnimationFrame;
})();

var FPS = 0;
function collectFPS () {
	document.title = FPS.toString()+' fps';
	FPS = 0;
	setTimeout(collectFPS, 1000);
}

var jsRorschach = {

	scaleX: 0.017,
	scaleY: 0.017,
	scaleT: 0.01,
	time: 0,

	width: 0,
	height: 0,

	ctx: null,
	imgdata: null,
	data: null,

	paused: false,

	simplex: new SimplexNoise(),

	init: function (canvas) {
		this.width = canvas.width;
		this.height = canvas.height;

		this.scaleX = 1.5 / this.width;
		this.scaleY = 1.5 / this.height;

		this.ctx = canvas.getContext("2d");
		this.imgdata = this.ctx.getImageData(0, 0, this.width, this.height);
		this.data = this.imgdata.data;
	},

	step: function () {
		this.time++;
		var simplex = this.simplex,
			scaleX = this.scaleX,
			scaleY = this.scaleY,
			scaleT = this.scaleT,
			time = this.time,
			width = this.width,
			height = this.height,
			data = this.data;
		var i, j, x, y, n, n2, n3;
		for(i=0; i<width / 2; i++) {
			x = (i - width * 0.5) * (i - width * 0.5) * 4 / (width * width);
			for(j=0; j<height; j++) {
				y = (j - height * 0.5) * (j - height * 0.5) * 4 / (height * height);

				n = simplex.noise3D(i * scaleX, j * scaleY, time * scaleT) * 0.5 + 0.5;
				n2 = simplex.noise3D(i * scaleX * 2, j * scaleY * 2, time * scaleT * 0.7) * 0.5 + 0.5;
				n3 = simplex.noise3D(i * scaleX * 4, j * scaleY * 4, time * scaleT * 1.1) * 0.5 + 0.5;
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
	},

	animate: function() {
		if(!jsRorschach.paused)
			requestAnimationFrame( jsRorschach.animate );
		jsRorschach.step();
		FPS++;
	},

	pause: function() {
		this.paused = true;
	},

	play: function() {
		this.paused = false;
		this.animate();
	},

	putPixel: function (x, y, v) {
		var p = (x + y * this.width) << 2;
		this.data[p] = v;
		this.data[p+1] = v;
		this.data[p+2] = v;
		this.data[p+3] = 255;
	}
}