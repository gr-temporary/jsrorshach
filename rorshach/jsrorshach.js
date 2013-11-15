(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var jsRorshach = {

	scaleX: 0.007,
	scaleY: 0.007,
	scaleT: 0.01,
	time: 0,

	width: 0,
	height: 0,

	ctx: null,
	imgdata: null,
	data: null,

	simplex: new SimplexNoise(),

	init: function (canvas) {
		this.width = canvas.width;
		this.height = canvas.height;

		this.ctx = canvas.getContext("2d");
		this.imgdata = this.ctx.getImageData(0, 0, this.width, this.height);
		this.data = this.imgdata.data;
	},

	step: function () {
		this.time++;

		var i, j, x, y, n, n2;
		for(i=0; i<this.width / 2; i++) {
			x = (i - this.width * 0.5) * (i - this.width * 0.5) * 4 / (this.width * this.width);
			for(j=0; j<this.height; j++) {
				y = (j - this.height * 0.5) * (j - this.height * 0.5) * 4 / (this.height * this.height);

				n = this.simplex.noise3D(i * this.scaleX, j * this.scaleY, this.time * this.scaleT) * 0.5 + 0.5;
				n2 = this.simplex.noise3D(i * this.scaleX * 2, j * this.scaleY * 2, this.time * this.scaleT * 0.7) * 0.5 + 0.5;
				n = (n + n2) * 0.5;
				n -= Math.pow((x > y ? x : y) * 0.8, 4);
				if(n < 0.45)
					n = 0;
				else if(n < 0.55)
					n = (n - 0.45) * 10;
				else
					n = 1;
				n = (n * 255) | 0;
				n = 255 - n;
				this.putPixel(i, j, n);
				this.putPixel(this.width - i - 1, j, n);
			}
		}
		this.ctx.putImageData(this.imgdata, 0, 0);
	},

	animate: function(self) {
		requestAnimationFrame(function() { self.animate(self) });
		self.step();
	},

	putPixel: function (x, y, v) {
		var p = (x + y * this.width) * 4;
		this.data[p] = v;
		this.data[p+1] = v;
		this.data[p+2] = v;
		this.data[p+3] = 255;
	}
}