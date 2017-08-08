'use strict';

import css from '../css/styles.scss';
import js from './jscolor.min.js';

class CanvasLine {
	constructor(cnvsID) {
		this.name = cnvsID;
		this.elem = $('#' + cnvsID);
		this.canvas = this.elem[0];
		this.ctx = this.canvas.getContext('2d');
		this.panelTool = new PanelTool(this);
		this.history = [];

		this.draw('pencil');
		this.addCursor()
	}
	draw(tool) {
		this.elem.off('.draw');
		let
			drawing = false,
			commands = [],
			history = this.history,
			panelTool = this.panelTool,
			ctx = this.ctx;

		ctx.lineWidth = this.panelTool.getWidth();
		ctx.strokeStyle = this.panelTool.getColor();
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		function pushCommands() {
			if ( commands.length > 0 )  {
				history.push(commands.slice());
				commands.length = 0;
			}
		}
		
		function startDraw(e) {
			e.preventDefault();
			drawing = true;
			ctx.beginPath();
			ctx.moveTo(e.offsetX, e.offsetY);
			commands.push( startDrawHist(e.offsetX, e.offsetY, ctx.lineWidth, ctx.strokeStyle) )
		}
		function startDrawHist(x, y, w, c) {
			return function () {
				ctx.lineWidth = w;
				ctx.strokeStyle = c;
				ctx.beginPath();
				ctx.moveTo(x, y);
			}
		}

		function draw(e) {
			if (drawing) {
				ctx.lineTo(e.offsetX, e.offsetY);
				ctx.stroke();
				commands.push( drawHist(e.offsetX, e.offsetY) )
			}
		}
		function drawHist(x, y) {
			return function () {
				ctx.lineTo(x, y);
				ctx.stroke();
			}
		}

		function stopDraw(e) {
			if (drawing) {
				ctx.lineTo(e.offsetX, e.offsetY);
				ctx.stroke();
				ctx.closePath();
				drawing = false;
				commands.push( stopDrawHist(e.offsetX, e.offsetY, ctx.lineWidth, ctx.strokeStyle) );
				pushCommands()
			}
		}
		function stopDrawHist(x, y) {
			return function () {
				ctx.lineTo(x, y);
				ctx.stroke();
				panelTool.refresh()
			}
		}

		function mouseOut(e) {
			if (e.buttons === 1) {
				ctx.closePath();
				commands.push( mouseOutHist(e) )
			} else {
				drawing = false;
			}
		}
		function mouseOutHist(e) {
			if (e.buttons === 1) return function () { ctx.closePath() };
		}

		function mouseOver(e) {
			(e.buttons !== 1) ? drawing = false : ctx.beginPath();
			if (drawing) commands.push( mouseOverHist(e) );
		}
		function mouseOverHist(e) {
			if (e.buttons === 1) return function () { ctx.beginPath() }
		}


		if (tool === 'pencil') {
			this.elem.on('mousedown.draw', (e) => startDraw(e));
			this.elem.on('mousemove.draw', (e) => draw(e));
			this.elem.on('mouseup.draw',   (e) => stopDraw(e));
			$('body').on('mouseup.draw',   (e) => pushCommands());
			this.elem.on('mouseout.draw',  (e) => mouseOut(e));
			this.elem.on('mouseover.draw', (e) => mouseOver(e));
		} else

		if (tool === 'line') /*expected, not work correctly*/ {
			let x, y;
			this.elem.on('mousedown.draw', function (e) {
				drawing = true;
				ctx.beginPath();
				x = e.offsetX;
				y = e.offsety;
				ctx.moveTo(x, y);

			});
			this.elem.on('mousemove.draw', function (e) {
				if (drawing) {
					ctx.moveTo(x, y);
					ctx.lineTo(e.offsetX, e.offsetY);
					ctx.stroke();
					ctx.closePath();
				}
			});
			this.elem.on('mouseup.draw', function (e) {
				if (drawing) {
					ctx.lineTo(e.offsetX, e.offsetY);
					ctx.stroke();
					ctx.closePath();
					drawing = false
				}
			});
			/*this.elem.on('mouseup', () => drawing = false );*/
			this.elem.on('mouseout.draw', () => drawing = false );
		}
	}
	addCursor() {
		let cursor = $('<div class="cursor"></div>')
			.width( this.panelTool.getWidth() )
			.height( this.panelTool.getWidth() )
			.insertBefore(this.elem);
		this.elem.on('mousemove', (e) => pozitCursor(e) );


		this.panelTool.colrpcr.on('change', () => {
			cursor.css('border-color', this.panelTool.getColor() )
		});
		let resizeCursor = () =>
			cursor
				.width( this.panelTool.getWidth() )
				.height( this.panelTool.getWidth() );

		function pozitCursor(e) {
			let
				w = cursor.width()/2,
				h = cursor.height()/2,
				y = (e.offsetY - w - 2),
				x = (e.offsetX - h - 2);
			cursor.css('transform', `translateY(${y}px) translateX(${x}px)`);
		}
		this.elem.on('mouseout', () => cursor.hide());
		this.elem.on('mouseover', () => { resizeCursor(); cursor.show() });

		this.elem.on('wheel', (e) => {
			e.preventDefault();

			if (e.originalEvent.deltaY < 0) {
				this.panelTool.plusWidth();
				resizeCursor()
			} else {
				this.panelTool.minusWidth();
				resizeCursor()
			}
			pozitCursor(e);
		});
	}
	clearCanvas(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}
	undo() {

	}
	redo() {

	}
	restore () {
		for( let i = 0; i < this.history.length; i++) {
			for( let j = 0; j < this.history[i].length; j++) {
				this.history[i][j]()
			}
		}
	}
}
class PanelTool {
	constructor (canvas) {
		this.canvas = canvas;
		let $tools =
			$('<div class="panel-tools">').insertBefore(canvas.elem);

		this.colrpcr =
			$(`<input class="jscolor {
				width: 123,
				padding: 0,
				shadow: false,
				borderWidth: 0,
				backgroundColor: 'transparent',
				insetColor: '#fff',
				position: 'top',
				hash: true
			}"
			value="#000000">`).appendTo($tools);
		$('<span>').text('Color').insertBefore(this.colrpcr);

		this.inpWidth =
			$('<input type="number" min="1" max="70" value="6">').appendTo($tools);
		$('<span>').text('Width').insertBefore(this.inpWidth);

//		$('<button>History</button>').appendTo($tools).on('click', () => console.dir(canvas.history) );

		$('<button>Restore</button>').appendTo($tools)
			.on('click', () => canvas.restore() );
		$('<button>Clear</button>').appendTo($tools)
				.on('click', () => canvas.clearCanvas() );
/*
		$('<button>↷</button>').appendTo($tools)
			.on('click', () => canvas.redo() );
		$('<button>↶</button>').appendTo($tools)
			.on('click', () => canvas.undo() );
*/

		$tools.children().on('change', () => this.refresh() );
	}
	refresh() { this.canvas.draw('pencil') }
	getColor () { return this.colrpcr.val() };
	getWidth () { return this.inpWidth.val() };
	plusWidth () {
		if (this.inpWidth.val() < 70 )
		this.inpWidth.val( +this.inpWidth.val() + 1 );
		this.refresh()
	};
	minusWidth () {
		if (this.inpWidth.val() > 1 )
		this.inpWidth.val( +this.inpWidth.val() - 1 );
		this.refresh()
	};
}

let newCanvas = new CanvasLine('drawLine');
console.dir(newCanvas);
