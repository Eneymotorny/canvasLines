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

		this.draw('pencil');
		this.addCursor()
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

		function pozitCursor(e) {
			let
				w = cursor.width()/2,
				h = cursor.height()/2,
				y = (e.offsetY - w - 2),
				x = (e.offsetX - h - 2);
			cursor.css('transform', `translateY(${y}px) translateX(${x}px)`);
		}
		this.elem.on('mouseout', () => cursor.hide());
		this.elem.on('mouseover', () => cursor.show());

		this.elem.on('wheel', (e) => {
			e.preventDefault();

			if (e.originalEvent.deltaY < 0) {
				this.panelTool.plusWidth();
				cursor
					.width( this.panelTool.getWidth() )
					.height( this.panelTool.getWidth() )
			} else {
				this.panelTool.minusWidth();
				cursor
					.width( this.panelTool.getWidth() )
					.height( this.panelTool.getWidth() )
			}
			pozitCursor(e);
		});
	}
	draw(tool) {
		this.elem.off('.draw');
		let
			drawing = false,
			ctx = this.ctx;
		ctx.lineWidth = this.panelTool.getWidth();
		ctx.strokeStyle = this.panelTool.getColor();
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		if (tool === 'pencil') {
			this.elem.on('mousedown.draw', function (e) {
				drawing = true;
				ctx.beginPath();
				ctx.moveTo(e.offsetX, e.offsetY);
			});
			this.elem.on('mousemove.draw', function (e) {
				if (drawing) {
					ctx.lineTo(e.offsetX, e.offsetY);
					ctx.stroke();
				}
			});
			this.elem.on('mouseup.draw', function (e) {
				ctx.lineTo(e.offsetX, e.offsetY);
				ctx.stroke();
				drawing = false
			});
			this.elem.on('mouseout.draw', (e) => (e.buttons === 1) ? ctx.closePath() : drawing = false );
			this.elem.on('mouseover.draw', (e) => (e.buttons !== 1) ? drawing = false : ctx.beginPath() );
		} else

		if (tool === 'line') {
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
		} // expected
	}
	clearCanvas(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
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
			$('<button>Clear</button>').appendTo($tools)
				.on('click', () => canvas.clearCanvas() );

		$tools.children().on('change', () => this.refresh() );
		$('<span>').text('Width').insertBefore(this.inpWidth);

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
