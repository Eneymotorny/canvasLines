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
		this.drawPen()
	}
	drawPen() {
		this.elem.off();
		let
			width = this.panelTool.width(),
			color = this.panelTool.color(),
			drawing = false,
			ctx = this.ctx;

		this.elem.on('mousedown', function (e) {
			drawing = true;
			ctx.beginPath();
			ctx.moveTo(e.offsetX, e.offsetY);
			ctx.lineWidth = width;
			ctx.lineCap = 'round';
			ctx.strokeStyle = '#' + color;
			ctx.stroke();
		});
		this.elem.on('mousemove', function (e) {
			if (drawing) {
				ctx.lineTo(e.offsetX, e.offsetY);
				ctx.stroke();
			}
		});
		this.elem.on('mouseup', () => { drawing = false } );
		this.elem.on('mouseout', (e) => e.buttons === 1 ? ctx.closePath(): drawing = false );
		this.elem.on('mouseover', (e) => e.buttons !== 1 ? drawing = false : ctx.beginPath() );
	}
	clearCanvas(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}
}
class PanelTool {
	constructor (canvasLine) {
		let $tools =
			$('<div class="panel-tools">').insertBefore(canvasLine.elem);
		let $colrpcr =
			$('<input class="jscolor" value="00000">').appendTo($tools);
		let $inpWidth =
			$('<input type="number" min="1" max="70" value="6">').appendTo($tools);
			$('<button>Clear</button>').appendTo($tools)
				.on('click', () => canvasLine.clearCanvas() );

		$tools.children().on('change', () => canvasLine.drawPen() );

		this.color = function() { return $colrpcr.val() };
		this.width = function() { return $inpWidth.val() }
	}
}

let newCanvas = new CanvasLine('drawLine');
