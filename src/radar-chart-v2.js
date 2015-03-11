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
				verticalZoom : 0.8,				//縱軸縮放值
				verticalAxisLength : 0,			//縱軸長
				verticalStyle : AXIS_TYPE.DASH,	//
				maxValue : 100,					//縱軸上的最大值
				minValue : 0,					//縱軸上的最小值
				scale : 10,						//縱軸刻度數
				//
				dx : 0,							//繪製參考點水平偏移量
				dy : 0,							//繪製參考點垂直偏移量
				layer : 5,						//橫網層數
				centerType : CENTER_TYPE.DOUNT,	//雷達網中心要呈現的樣式
				centerRadius : 20,				//中心點半徑
				//
				pointCount : 0,
				onePiece : 0
			};
		this.options;							//defaultOption與使用者傳入的options結合後的opt物件。
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
		
		base.drawHorizontalWeb = function(stage){
			
		};
		
		base.drawVerticalAxis = function(axixGroup, axisInfo){
			var className = '';
			switch(model.options.verticalStyle){
				case AXIS_TYPE.DASH:
					className = 'vertical-axis dash';
					break;
				case AXIS_TYPE.LINE:
					className = 'vertical-axis';
					break;
			}
			for(var index=0, count=axisInfo.length ; index < count ; index++){
				var axis = axisInfo[index];
				axixGroup.append('line')
						 .attr('class', className)
					 	 .attr('x1', axis.outSide.x).attr('y1', axis.outSide.y)
					 	 .attr('x2', axis.inner.x).attr('y2', axis.inner.y);
			}
		};
		
		base.verticalAxisPoint = function(){
			var result = [];
			var opt = model.options;
			for(var index=0, axisCount = model.options.pointCount; index < axisCount ; index++){
				var radians = opt.onePiece * index; 	//當前縱軸的弧度
				var outSidePoint = this.point(model.verticalLength(), radians);
				var innerPoint = this.point(opt.centerRadius,radians);
				result.push({inner : innerPoint , outSide : outSidePoint});
			}
			return result;
		};
		
		/* 繪製垂直相關的網絡 */
		base.drawVerticalWeb = function(stage){
			if(show=true){
				var opt = model.options;
				var axixGroup = stage.append('g').attr('class', 'vertical-web');
				var titleGroup = stage.append('g').attr('class', 'title-group');
				var axisInfo = this.verticalAxisPoint();
				this.drawVerticalAxis(axixGroup, axisInfo);
				//var titleList = stage.datum();
				/*
				var axisCount = model.options.pointCount;
				for(var index=0; index < axisCount ; index++){
					var radians = opt.onePiece * index; 	//當前縱軸的弧度
					var outSidePoint = this.point(model.verticalLength(), radians);
					var innerPoint = this.point(opt.centerRadius,radians);
					//var p1 = self.getPoint(verticalLength, radians  , minLength);
					//var p2 = self.getPoint(opt.centerRadius, radians  , minLength);
					//var title = titleList[index].title;
					//stage.call(self.drawVerticalAxis, p1, p2, axixGroup, self);
					//stage.call(self.drawItemTitle, p1, p2, title, titleGroup, minLength, opt, self);
				}
				*/
			}
		};
		
		/* 繪製雷達的網 */
		base.drawWeb = function(stage){
			this.drawVerticalWeb(stage);
			this.drawHorizontalWeb(stage);
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