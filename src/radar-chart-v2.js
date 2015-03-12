(function(document, d3){
	//---------------------------
	// 常數
	//---------------------------
	var ARC = 2 * Math.PI;					//弧
	var CENTER_TYPE = {						//中心顯示的樣式列舉
				NORMAL : 'normal',			//不留空
				DOUNT : 'dount',			//園
				POLYGON : 'polygon'			//多邊形
	};
	var AXIS_TYPE = {
				DASH : 'dash',
				LINE : 'line'
	};
	
	//--------------------------
	// tools
	//--------------------------
	/* 清除空白 */
	var clearWhitespace = function(str){
		return str.replace(/\s/g,"");
	};
	
	//--------------------------
	//  資料模組 : 處理資料邏輯
	//-------------------------- 
	var ChartModel = function(source, opt){
		var base = ChartModel.prototype,		//ChartModel的prototype,用來定義共通的public method.
			data,								//
			defaultOption = {
				viewPort : '100%, 100%',		//svg長寬。 width height
				viewBox : '0,0,300,300',		//svg選擇顯示範圍，如同攝影機的攝影範圍。 x,y,width,height
				preserveAspectRatio : "none",	//svg zoom mode
				//vertical
				visibleVerticalWeb : true,		//是否呈現雷達圖垂直網
				verticalZoom : 0.8,				//縱軸縮放值
				verticalAxisLength : 0,			//縱軸長
				verticalStyle : AXIS_TYPE.DASH,	//
				maxValue : 100,					//縱軸上的最大值
				minValue : 0,					//縱軸上的最小值
				//horizontal
				visibleHorizontalWeb : true,	//是否呈現雷達圖橫網
				horizontalStyle : AXIS_TYPE.DASH,
				//scale
				scale : 10,						//縱軸刻度數
				visibleScale : true,			//是否要呈現刻度
				//
				dx : 0,							//繪製參考點水平偏移量
				dy : 0,							//繪製參考點垂直偏移量
				layer : 5,						//橫網層數
				centerType : CENTER_TYPE.DOUNT,	//雷達網中心要呈現的樣式
				centerRadius : 20,				//中心點半徑
				//
				pointCount : 0,
				onePiece : 0
				//
			};
		this.options;							//defaultOption與使用者傳入的options結合後的opt物件。
		this.vericalAxisPoints=[];
		/*
		 * 一個點的弧度值
		 */
		base.setOnePrice = function(){
			this.options.onePiece = ARC / this.options.pointCount;			
		};
		
		/*
		 * 設定一個雷達面區塊總共的點數
		 */
		base.setPointCount = function(data){
			this.options.pointCount = data[0].length;
		};
		
		/*
		 * 設定資料
		 */
		base.setData = function(val){
			if(val != data){
				data = val;
				this.setPointCount(data);
				this.setOnePrice();
			}
		};
		/*
		 * 取得資料
		 */
		base.getData = function(){
			return data;
		};
		
		/*
		 * 確定是否有資料
		 */
		base.hasData = function(){
			return (data && data.length > 0);
		};
		
		/*
		 * 將defaultOption與使用者傳入的option屬性混合，
		 * defaultOption的屬性將會成為prototype。
		 */
		base.mixOptions = function(opt){
			this.options = Object.create(defaultOption);
			if(opt && typeof opt !== 'string' && !(opt instanceof String) && typeof opt === "object"){
				for(var attr in opt){
					this.options[attr] = opt[attr];
				}
			}
		};
		
		/* 取得viewPort數值物件 */
		base.getViewPort = function(){
			var val = clearWhitespace(this.options.viewPort).split(',');
			return {
				width  : val[0],
				height : val[1]
			};
		};
		
		/* 取得viewbox數值物件 */
		base.getViewBoxValue = function(){
			var viewBox = (this.options) ? this.options.viewBox : defaultOption.viewBox;
			var val = clearWhitespace(viewBox).split(',');
			return {
				x : val[0],
				y : val[1],
				width  : val[2],
				height : val[3]
			};
		};
		
		/* 取得垂直軸長 */
		base.verticalLength = function(){
			return this.options.verticalAxisLength * this.options.verticalZoom;
		};
		
		/* 取得垂直軸 class name*/
		base.verticalClass = function(){
			var className='';
			switch(this.options.verticalStyle){
				case AXIS_TYPE.DASH:
					className = 'vertical-axis dash';
					break;
				case AXIS_TYPE.LINE:
					className = 'vertical-axis';
					break;
			}
			return className;
		};
		
		/* 依索引取回垂直軸上的title*/
		base.verticalTitle = function(index){
			return data[0][index].title;
		};
		
		/* 取得橫軸網之間的距離 */
		base.horizontalAxisGap = function(){
			console.log(this.verticalLength() );
			return this.verticalLength() / this.options.layer;
		};
		
		/* 取得橫軸 className*/
		base.horizontalClass = function(){
			var className='';
			switch(this.options.horizontalStyle){
				case AXIS_TYPE.DASH:
					className = 'horizontal-axis dash';
					break;
				case AXIS_TYPE.LINE:
					className = 'horizontal-axis';
					break;
			}
			return className;
		};

		/* 
		 * 銷毀 
		 */
		base.destroy = function(){
			console.log('model destroy');
		};
		
		/*
		 * init default verticalAxis value
		 */
		base.initAxisLength = function(){
			var viewBox = this.getViewBoxValue();
			var minSideLength = Math.min(viewBox.height / 2, viewBox.width / 2);	//取小邊
			defaultOption.verticalAxisLength = minSideLength;
		};
		
		base.initOffset = function(){
			var viewBox = this.getViewBoxValue();
			defaultOption.dx = viewBox.width / 2;
			defaultOption.dy = viewBox.height / 2;
		};
		
		/*
		 * 初始化
		 */
		base.init = function(source, opt){
			this.initAxisLength();
			this.initOffset();
			this.mixOptions(opt);
			this.setData(source);
		};
		this.init(source, opt);		
	};
	
	
	// --------------------------
	// 畫筆 : 負責繪製處理
	// pan : rander viewer
	// --------------------------
	var ChartPan = function(){
		var base = ChartPan.prototype,
			model;
		
		/*  
		 * 依半徑與弧度取得一個點
		 * radius	半徑
		 * radians	弧度
		 */
		base.point = function(radius, radians){
			//dx 水平偏移
			//dy 垂直偏移
			//主要用於偏移坐標基準點（圓心）
			return {
				x : radius * -Math.sin(radians) + model.options.dx,
				y : radius * -Math.cos(radians) + model.options.dy
			};
		};
		
		/* 準備所需參數值 */
		base.prepareParam = function(){
			var data = model.getData();
			//var onePiece = opt.arc / total;	
		};
		
		/* 繪製標文字資訊 */
		base.drawInfo = function(stage){
			
		};
		
		/* 繪製標記點 */
		base.drawMarkPoint = function(stage){
			
		};
		
		/* 繪製點所形成的區塊 */
		base.drawArea = function(stage){
		};
		
		/* 繪製刻度表 */
		base.drawScaleLine = function(stage){
			var opt = model.options;
			if(opt.visibleScale){
				var outSidePoint = model.vericalAxisPoints[0].outSide;
				/* 
				var p1 = self.getPoint(verticalLength, 0  , minLength);
				var p2 = self.getPoint(opt.centerRadius, 0  , minLength);
				var basicLength = (p2.y - p1.y) / opt.levels;
				var basicValue = (opt.maxValue - opt.minValue) / opt.levels;
				var g = svg.append('g').attr('class','scale-group');
				for(var j=0 , count = opt.levels ; j <= count ; j++){
					var textY =  p2.y - j * basicLength;
					g.append('text')
					 .attr('x', p1.x)
					 .attr('y', textY)
					 .attr('fill', opt.scaleColor)
					 .attr('font-size', opt.scaleFontSize + 'px')
					 .text(j * basicValue + opt.scaleText);
				}
				*/
			}
		};
		
		/* 繪製水平軸*/
		base.drawHorizontalAxis = function(axixGroup, p0, p1, className){
			axixGroup.append('line')
					 .attr('class', className)
					 .attr('x1', p0.x)
					 .attr('y1', p0.y)
					 .attr('x2', p1.x)
					 .attr('y2', p1.y);
		};
		
		/* 繪製水平相關的網絡 */
		base.drawHorizontalWeb = function(stage){
			var opt = model.options;
			if(opt.visibleHorizontalWeb){
				var axixGroup = stage.append('g').attr('class', 'horizontal-web');
				var className = model.horizontalClass();
				var gap = model.horizontalAxisGap();
				for(var outIndex=0; outIndex <= opt.layer ; outIndex++){
					var radius = outIndex * gap + opt.centerRadius;
					for(var index=0, axisCount = model.options.pointCount ; index < axisCount ; index++){
						var p0 = this.point(radius, opt.onePiece * index);
						var p1 = this.point(radius, opt.onePiece * (index+1));
						this.drawHorizontalAxis(axixGroup, p0, p1, className);
					}
				}
			}
		};
		
		/* 繪製垂直軸上標題 */
		base.drawVerticalTitle = function(titleGroup, outSidePoint, title){
			
		};
		
		
		
		/* 繪製垂直軸*/
		base.drawVerticalAxis = function(axixGroup, className, outSidePoint, innerPoint){			
				axixGroup.append('line')
						 .attr('class', className)
					 	 .attr('x1', outSidePoint.x)
					 	 .attr('y1', outSidePoint.y)
					 	 .attr('x2', innerPoint.x)
					 	 .attr('y2', innerPoint.y);		
		};
		
		/* 繪製垂直相關的網絡 */
		base.drawVerticalWeb = function(stage){
			var opt = model.options;
			if(opt.visibleVerticalWeb){
				model.vericalAxisPoints.length = 0;	//clear array
				var axixGroup = stage.append('g').attr('class', 'vertical-web');
				var titleGroup = stage.append('g').attr('class', 'title-group');				
				var className = model.verticalClass();
				//console.log(stage.datum());
				for(var index=0, axisCount = model.options.pointCount; index < axisCount ; index++){
					var radians = opt.onePiece * index; 	//當前縱軸的弧度
					var outSidePoint = this.point(model.verticalLength()+opt.centerRadius, radians);
					var innerPoint = this.point(opt.centerRadius,radians);
					var title = model.verticalTitle(index);
					this.drawVerticalAxis(axixGroup, className, outSidePoint, innerPoint);
					this.drawVerticalTitle(titleGroup, outSidePoint, title);
					model.vericalAxisPoints.push({inner : innerPoint , outSide : outSidePoint});
				}
			}
		};
		
		/* 繪製雷達的網 */
		base.drawWeb = function(stage){
			this.drawVerticalWeb(stage);
			this.drawHorizontalWeb(stage);
			this.drawScaleLine(stage);
		};
		
		/* 繪製場景 */
		base.drawStage = function(elements){
			var viewPort = model.getViewPort();
			var opt = model.options;
			//rander svg
			var stage = d3.selectAll(elements).append("svg");
				stage.attr('class', 'radar')
					 .attr("width", viewPort.width)
					 .attr("height", viewPort.height)
					 .attr("viewBox",opt.viewBox)
					 .attr("preserveAspectRatio", opt.preserveAspectRatio)
					 .datum(model.getData());
			return stage;
		};
		
		/* 繪製雷達圖 */
		base.drawChart = function(elements, chartModel){
			model = chartModel;
			if(model.hasData()){
				this.prepareParam();
				var stage = this.drawStage(elements);
				this.drawWeb(stage);
			}
		};
		
		/* 清除雷達圖 */
		base.clearChart = function(elements){
			d3.selectAll(elements).select('svg').remove();
		};
		
	};
	
	// --------------------------
	//  雷達圖畫家 ： 控制畫筆產生雷達圖
	// 
	// -------------------------- 
	var RaderPainter = function(d3){
		var base = RaderPainter.prototype,
			chartDepot = {},
			pan = new ChartPan(),
			registerChart = function(identity, model){
				var success = false;
				if(!chartDepot.hasOwnProperty(identity)){
					chartDepot[identity] = model;
					success = true;
				}
				return success;
			},
			unRegistChart = function(identity){
				var success = false;
				if(chartDepot.hasOwnProperty(identity)){
					chartDepot[identity].destroy();
					chartDepot[identity] = null;
					delete chartDepot[identity];
					success = true;
				}
				return success;
			},
			getChartModel = function(){
				var model;
				if(chartDepot.hasOwnProperty(identity)){
					model = chartDepot[identity];
				}
				return model;
			},
			isString = function(val){
				return (typeof val === 'string' || val instanceof String);
			},
			isHTMLElement = function(val){
				return (val instanceof HTMLElement || (typeof val === "object" && val.nodeType && val.nodeType === 1));
			},
			canBeIteration= function(list){
				return (list.hasOwnProperty('length') && list.length > 0);
			};
			
		base.d3 = d3;
		
		base.upPlane = function(element, plane){
			
		};
		
		base.downPlane = function(element, plane){
			
		};
		
		/*
		 * 繪製雷達圖
		 * identity : id or class
		 * data : 繪製資料
		 * opt : 雷達圖參數
		 */
		base.drawChart = function(identity, data, opt){
			var elements;
			if(isString(identity) && data && Array.isArray(data) && data.length > 0){
				elements = document.querySelectorAll(identity);
				if(canBeIteration(elements)){
					var model = new ChartModel(data, opt);
					registerChart(identity, model);
					pan.drawChart(elements, model);
				}
			}
			return elements;
		};
		
		base.clearChart = function(identity){
			var elements;
			if(isString(identity) && unRegistChart(identity)){
				elements = document.querySelectorAll(identity);
				if(canBeIteration(elements)){
					pan.clearChart(elements);
				}
			}
			return elements;
		};
		
		base.destroyChart = function(){
		};
	};
	
	if(!window.RaderPainter){		
		window.RaderPainter = new RaderPainter(d3);
	}
	
	if(typeof(module)!= "undefined"){
		module.exports = new RaderPainter(d3);
	}
}).call(this, document, d3);