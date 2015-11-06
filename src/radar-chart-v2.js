/** author : ocean Tsai
 *  email : contest.start@gmail.com
 *  licenses : MIT
 */
(function(document, d3, $){
	//--------------------------
	// const
	//--------------------------
	var CENTER_TYPE = {						//中心顯示的樣式列舉
				NORMAL : 'normal',			//不留空
				DOUNT : 'dount',			//園
				POLYGON : 'polygon'			//多邊形
	};
	var AXIS_TYPE = {
				DASH : 'dash',
				LINE : 'line',
				V_DASH : 'v_dash',
				V_LINE : 'v_line',
				H_DASH : 'h_dash',
				H_LINE : 'h_line'
	};
	var MARK_TYPE = {
			CIRCLE : 'circle',
			RECT : 'rect'
	};

	//--------------------------
	// utils
	//--------------------------
	var StringUtil = (function($){
		return {
			clearWhitespace : function(str){
				return str.replace(/\s/g,"");		
			}
		};
	}).call(this, $);

	//--------------------------
	// options
	//--------------------------
	var Options = (function(){
		var defaultOptions = {
				//stage
				viewPort : '100%, 100%',		//svg長寬。 width height
				viewBox : '0,0,600,600',		//svg選擇顯示範圍，如同攝影機的攝影範圍。 x,y,width,height
				preserveAspectRatio : "none",	//svg zoom mode
				//vertical
				visibleVerticalWeb : true,		//是否呈現雷達圖垂直網
				verticalZoom : 0.76,				//縱軸縮放值
				verticalStyle : AXIS_TYPE.V_DASH,	//
				maxValue : 100,					//縱軸上的最大值
				minValue : 0,					//縱軸上的最小值
				//horizontal
				visibleHorizontalWeb : true,	//是否呈現雷達圖橫網
				horizontalStyle : AXIS_TYPE.V_DASH,
				//scale
				scale : 10,						//縱軸刻度數
				visibleScale : true,			//是否要呈現刻度
				scaleFontDx : 3,				//刻度文字水平偏移
				scaleFontDy : 0,				//刻度文字垂直偏移
				scaleFontColor : 'black',		//刻度文字顏色
				scaleFontSize : 14,				//刻度文字大小
				scaleUnit : '%',				//單位顯示
				//area
				visibleArea : true,				//是否呈現各點的區塊連接
				areaColor : '#FFEB3B, #673AB7, #4CAF50, #FF9800, #9C27B0, #3F51B5, #8BC34A, #E91E63, #795548, #009688',
				//mark
				visibleMark : true,				//是否呈現標記點
				markType : MARK_TYPE.CIRCLE,	//預設標記點樣式
				markRadius : 7,					//標記半徑
				//public prpoerty
				dx : 0,							//繪製參考點水平偏移量
				dy : 0,							//繪製參考點垂直偏移量
				layer : 5,						//橫網層數
				centerType : CENTER_TYPE.DOUNT,	//雷達網中心要呈現的樣式
				centerRadius : 25,				//中心點半徑
				//假設值
				//title
				surmiseFontGap: 3,				//假設的font gap
				verticalAxisTitleGap : 6,
				//information panel
				visiblePanel :true,
				panelWidth: 70,
				panelHeight :24,
				panelRadiusX :5,			//面板的圓角
				panelRadiusY :5,
				infoPanelhorizontalGap : 10,
				infoPanelverticalGap :10,
				infoLeftPadding : 3,
				infoTopPadding : 4
		};
		var mixOptions = function(opt){
			var options = Object.create(defaultOptions);
			if(opt && typeof opt !== 'string' && !(opt instanceof String) && typeof opt === "object"){
				for(var attr in opt){
					options[attr] = opt[attr];
				}
			}
			return options;
		};
		return {
			mix : mixOptions
		};
	}).call(this);

	//--------------------------
	//  Chart Data Module
	//  圖表的資料處理層
	//  用來處理資料計算邏輯
	//-------------------------- 
	/**
	 *  AXIS_TYPE		軸類型常數, DI.
	 *  StringUtil		字串工具, DI.
	 *  opt 			操作屬性
	 *  dataList 		繪製圖表的來源資料。
	 */
	var RadarModule = function(AXIS_TYPE, StringUtil, opt, dataList){
		var modulePrototype = RadarModule.prototype;
		var thiz = this;
		var provider;								//繪製圖表的來源資料。
		var options = opt;
		var verticalAxisLength = 0;					//縱軸長
		var viewBox;
		thiz.pointCount = 0;							//雷達圖垂直軸坐標點數量。
		thiz.vericalAxisPoints = [];					//構成雷達網之垂直點坐標儲存庫。
		thiz.onePiece = 0;							//點與點之間的弧度值。

		/**
		 * cal view box object value.
		 */
		var calViewBox = function(){
			var vals = thiz.StringUtil.clearWhitespace(options.viewBox).split(',');
			viewBox = {
				x : vals[0].toString(),
				y : vals[1].toString(),
				width  : vals[2].toString(),
				height : vals[3].toString()
			};
		};

		/**
		 * 設定垂直軸長 
		 */
		var calAxisLength = function(){
			verticalAxisLength = Math.min(viewBox.height / 2, viewBox.width / 2);	//取小邊
		};

		/**
		 * 設定預設偏移
		 */
		var calDefaultOffset = function(){
			//changed prototype attar
			Object.getPrototypeOf(options).dx = viewBox.width / 2;
			Object.getPrototypeOf(options).dy = viewBox.height / 2;
		};

		
		//------------------------
		// super member
		//------------------------
		modulePrototype.ARC = 2 * Math.PI; 	//弧
		modulePrototype.StringUtil = StringUtil;
		modulePrototype.AXIS_TYPE = AXIS_TYPE;
		/**
		 * 計算點與點之間的弧度
		 */
		modulePrototype.calOnePrice = function(count){
			return this.ARC / count;			
		};

		/**
		 * 計算雷達垂直軸數量
		 */
		modulePrototype.calPointCount = function(radarData){
			return (radarData && radarData.length > 0 && radarData[0].length > 0) ? radarData[0].length : 0;
		};
		
		/*  
		 * 依半徑與弧度計算出一個出一個坐標點
		 * radius	半徑
		 * radians	弧度
		 */
		modulePrototype.point = function(radius, radians, dx, dy){
			//dx 水平偏移 options.dx
			//dy 垂直偏移 options.dy
			//主要用於偏移坐標基準點（圓心）
			return {
				x : radius * -Math.sin(radians) + dx,
				y : radius * -Math.cos(radians) + dy
			};
		};

		/** 
		 * 取得垂直軸 class name
		 */
		modulePrototype.axisClass = function(style){
			var className = '';
			switch(style){
				case this.AXIS_TYPE.V_DASH:
					className = 'vertical-axis dash';
					break;
				case this.AXIS_TYPE.V_LINE:
					className = 'vertical-axis';
					break;
				case this.AXIS_TYPE.H_DASH:
					className = 'horizontal-axis dash';
					break;
				case this.AXIS_TYPE.H_LINE:
					className = 'horizontal-axis';
					break;
			}
			return className;
		};

		//------------------------
		// public member
		//------------------------
		/**
		 * 取得參數操作物件
		 */
		thiz.getOptions = function(){
			return options;
		};

		/**
		 * 確定是否有資料
		 */
		thiz.existenceProvider = function(){
			return (provider && provider.length > 0)? true : false;
		};

		/**
		 * 取得 svg viewPort 數值物件 
		 */
		thiz.getViewPort = function(){
			var vals = this.StringUtil.clearWhitespace(options.viewPort).split(',');
			return {
				width  : vals[0].toString(),
				height : vals[1].toString()
			};
		};
		
		/**
		 * 取得 svg viewbox 數值物件 
		 */
		thiz.getViewBoxValue = function(){
			return viewBox;
		};

		/**
		 * 依索引取回垂直軸上的title
		 * TODO : 這個要加強
		 */
		thiz.verticalTitle = function(index){
			return provider[0][index].title;
		};

		/**
		 * 取得垂直軸長 
		 */
		thiz.verticalLength = function(){
			return verticalAxisLength * options.verticalZoom;
		};

		/** 
		 * 取得縱軸 className
		 */
		thiz.verticalClass = function(){
			return this.axisClass(options.verticalStyle);
		};
		
		/** 
		 * 取得橫軸 className
		 */
		thiz.horizontalClass = function(){
			return this.axisClass(options.horizontalStyle);
		};

		/** 
		 * 取得橫軸層與層之間的距離 
		 */
		thiz.horizontalAxisGap = function(){
			return this.verticalLength() / options.layer;
		};

		/** 
		 * 取得尺標刻度之間的距離 
		 */
		thiz.scaleGap = function(){
			return this.verticalLength() / options.scale;
		};
		
		/**
		 * 每一刻度基礎參考數值
		 */
		thiz.scaleRefValue = function(){
			return (options.maxValue - options.minValue) / options.scale;
		};
		
		/** 
		 * 取得 全部 area 顏色
		 */
		thiz.getAllAreaColor = function(){
			return this.StringUtil.clearWhitespace(options.areaColor).split(',');
		};
		
		/** 
		 * 取得 area 顏色
		 */
		thiz.getAreaColor = function(index){
			var color = 'grey';
			var areaColorList = this.getAllAreaColor();
			if(areaColorList && areaColorList.length > 0){
				color = areaColorList[ index % areaColorList.length ];
			}
			return color;
		};
		
		/** 
		 * 弧度轉角度 
		 */
		thiz.angle = function(radian){
			return radian * 180 / Math.PI;
		};
		
		/*
		 * 
		 */
		thiz.dataProvider = function(value){
			switch(value){
				case undefined :
					return provider;
					break;
				default :
					if(value !== provider){
						provider = value;
						this.pointCount = modulePrototype.calPointCount(provider);
						this.onePiece = modulePrototype.calOnePrice(this.pointCount);
					}
			}
		};
		
		/* 
		 * 銷毀 
		 */
		thiz.destroy = function(){
			try{
				modulePrototype = null;
				provider = null;
				options = null;
				if(this.vericalAxisPoints){
					this.vericalAxisPoints.length = 0;
				}
				viewBox = null;
				thiz = null;
			}
			catch(e){
				console.log('executed destroy method fail!')
				console.log(e);
			}
		};

		//------------------------
		// init property
		//------------------------
		var constructorMethod = function(){
			thiz.dataProvider(dataList);
			calViewBox();
			calAxisLength();	
			calDefaultOffset();	
		};
		constructorMethod();
	};


	//--------------------------
	//  Render View Model
	//  圖表的繪製模組
	//  處理繪製的邏輯
	//-------------------------- 
	var RenderView = function(window, document, $, d3){
		var viewPrototype = RenderView.prototype;
		var thiz = this;

		// 繪製標文字資訊		
		viewPrototype.drawPanel = function(stage, options){
			if(options.visiblePanel){
				var panel = stage.append('g').attr('class','infoPanel-group');
		        	panel.append('rect')
		        		 .attr('class' , 'infoPanel')
		        		 .attr('width' , options.panelWidth)
		        		 .attr('height', options.panelHeight)
		        		 .attr('x', 0)
		        		 .attr('y', 0)
		        		 .attr('rx', options.panelRadiusX)
		        		 .attr('ry', options.panelRadiusY);
		          	panel.append('text').attr('class', 'panel-title');
		      }
		};

		/* 繪製標記點 */
		viewPrototype.drawMarkPoint = function(container, points, color , options, model){
			var gulp = container.append('g').attr('class', 'mark-group');
			for(var index=0, count=points.length ; index < count ; index++ ){
				var point = points[index].point;
				var pointData = points[index].pointData;
				switch(options.markType){
					case  MARK_TYPE.CIRCLE:
						//圓形
						gulp.append(options.markType)
							.attr('class', 'mark')
							.attr('cx', point.x)
							.attr('cy', point.y)
							.attr('r', options.markRadius)
							.style('fill', color)
							.datum({data : pointData, model : model});	//bind data
						break;
					case  MARK_TYPE.MARK_TYPE:
						//矩形
						gulp.append(opt.markType)
							.attr('class', 'mark')
							.datum({data : pointData, model : model});	//bind data
						break;
				}
			}
		};
		
		/**
		 * 繪製area折線
		 */
		viewPrototype.drawAreaPolygon = function(container, points, color){
			var areaGroup = container.append('g')
					 .attr('class', 'area-group')
					 .append('polygon')
					 .attr('class'  , 'area')
					 .attr('points' , points)
					 .style('fill'  , color)
					 .style('stroke', color);
			return this;
			//event listener
			/* TODO : 移到互動模組
			areaGroup.on('mouseover', this.areaMouseOver)
					 .on('mouseout' , this.areaMouseOut)
					 .on('mousedown', this.areaMouseDown);			
			*/
		};
		
		/**
		 * 繪製點所形成的區塊 
		 */
		viewPrototype.drawArea = function(stage, model, options){
			if(options.visibleArea){
				var areaData = model.dataProvider() //or use stage.datum()
				var container = stage.append('g').attr('class', 'area-box');
				var areaPoints = [];
				var markPoints = [];
				//out loop hanlde area
				//inner loop hanlde point
				for(var areaIndex=0, areaCount=areaData.length; areaIndex < areaCount ; areaIndex++){
					var currentData   = areaData[areaIndex];
					var areaContainer = container.append('g').attr('class', 'area-container');
					areaPoints.length = 0; //clear array
					markPoints.length = 0; //clear array
					for(var pointIndex=0,pointCount=model.pointCount ; pointIndex < pointCount; pointIndex++){
						//cal point
						var pointData = currentData[pointIndex];
						var radians   = model.onePiece * pointIndex; 	//當前縱軸的弧度
						var radius    = model.verticalLength() / (options.maxValue - options.minValue) * pointData.value + options.centerRadius;
						var point     = model.point(radius, radians, options.dx, options.dy);
						areaPoints.push(point.x + ',' + point.y);	//ploygon format	
						markPoints.push({point : point, pointData : pointData});					
					}
					var color = model.getAreaColor(areaIndex);
					this.drawAreaPolygon(areaContainer, areaPoints.join(' '), color);
					this.drawMarkPoint(areaContainer, markPoints, color, options, model);
				}
			}
			return this;
		};
			
		/** 
		 * 繪製刻度表 
		 */
		viewPrototype.drawScaleLine = function(stage, model, options){
			if(options.visibleScale){
				var outSidePoint = model.vericalAxisPoints[0].outSide;
				var container = stage.append('g').attr('class','scale-group');
				var gap = model.scaleGap();
				for(var index=0; index <= options.scale ; index++){
					var radius = index * gap + options.centerRadius;
						//刻度固定在弧度0位置
						var point = model.point(radius, model.onePiece * 0, options.dx, options.dy);
						container.append('text')
								  .attr('x', point.x + options.scaleFontDx)
								  .attr('y', point.y + options.scaleFontDy)
								  .attr('fill', options.scaleFontColor)
								  .attr('font-size', options.scaleFontSize + 'px')
								  .text( (index * model.scaleRefValue()) + options.scaleUnit);
				}
			}
			return this;
		};
			
		/** 
		 * 繪製水平軸
		 */
		viewPrototype.drawHorizontalAxis = function(container, p0, p1, className){
			container.append('line')
					 .attr('class', className)
					 .attr('x1', p0.x)
					 .attr('y1', p0.y)
					 .attr('x2', p1.x)
					 .attr('y2', p1.y);
			return this;
		};
		/** 
		 * 繪製水平相關的網絡 
		 */
		viewPrototype.drawHorizontalWeb = function(stage, model, options){
			if(options.visibleHorizontalWeb){
				var axisContainer = stage.append('g').attr('class', 'horizontal-web');
				var className = model.horizontalClass();
				var gap = model.horizontalAxisGap();
				for(var outIndex=0; outIndex <= options.layer ; outIndex++){
					var radius = outIndex * gap + options.centerRadius;
					for(var index=0, axisCount=model.pointCount ; index < axisCount ; index++){
						var p0 = model.point(radius, model.onePiece * index, options.dx , options.dy);
						var p1 = model.point(radius, model.onePiece * (index+1), options.dx , options.dy);
						this.drawHorizontalAxis(axisContainer, p0, p1, className);
					}
				}
			}
			return this;
		};
		
		/** 
		 * 繪製垂直軸上標題 
		 * TODO : 需改良加強文字與間隔的計算方式
		 */
		viewPrototype.drawVerticalTitle = function(container, options, outSidePoint, title){
			var x = Math.ceil(outSidePoint.x);
			var y = Math.ceil(outSidePoint.y);
			var text = container.append('text').attr('class', 'item-title').text(title); 
			var fontSize = text.style("font-size").replace('pt','').replace('px','')  | 0;
			var gapTotal = options.surmiseFontGap * (title.length - 1);
			var offsetW  = (fontSize * title.length + gapTotal) ;  //
			var offsetH  = fontSize / 2 | 0;
			//x is rigth
			if(x > options.dx){
				text.attr('x', x + options.verticalAxisTitleGap );
			}else if(x < options.dx){
				text.attr('x', x - options.verticalAxisTitleGap - offsetW);
			}else{
				//x is center
				text.attr('x', x - offsetW / 2 );
			}
			
			if(y > options.dy){
				text.attr('y', y + offsetH + options.verticalAxisTitleGap + 5);
			}else if(y < options.dy){
				text.attr('y', y - offsetH - options.verticalAxisTitleGap + -5);
			}else{
				text.attr('y', y);
			}
			return this;
		};

		/**
		 *	繪製垂直軸
		 */
		viewPrototype.drawVerticalAxis = function(container, className, outSidePoint, innerPoint){
			container.append('line')
					 .attr('class', className)
					 .attr('x1', outSidePoint.x)
				 	 .attr('y1', outSidePoint.y)
				 	 .attr('x2', innerPoint.x)
				 	 .attr('y2', innerPoint.y);
			return this;
		};

		/** 
		 * 繪製垂直相關的網絡 
		 */
		viewPrototype.drawVerticalWeb = function(stage, model, options){
			if(options.visibleVerticalWeb){
				model.vericalAxisPoints.length = 0;	//clear array
				var axisContainer  = stage.append('g').attr('class', 'vertical-web');
				var titleContainer = stage.append('g').attr('class', 'title-group');				
				var className  = model.verticalClass();
				for(var index=0, axisCount=model.pointCount; index < axisCount ; index++){
					//當前縱軸的弧度
					var radians = model.onePiece * index;
					//兩點構成一直線
					var outSidePoint = model.point(model.verticalLength() + options.centerRadius, radians, options.dx , options.dy);
					var innerPoint   = model.point(options.centerRadius, radians, options.dx , options.dy);
					this.drawVerticalAxis(axisContainer, className, outSidePoint, innerPoint);
					this.drawVerticalTitle(titleContainer, options, outSidePoint, model.verticalTitle(index));
					model.vericalAxisPoints.push({inner : innerPoint , outSide : outSidePoint});
				}
			}
			return this;
		};
		
		/** 
		 * 繪製雷達的網 
		 */
		viewPrototype.drawWeb = function(stage, model, options){
			this.drawVerticalWeb(stage, model, options)
				.drawHorizontalWeb(stage, model, options)
				.drawScaleLine(stage, model, options);
			return this;
		};
		
		/* *
		 * 繪製場景 
		 * container :  雷達圖的畫布 Canvas of Radar Chart.
		 * options   :  畫面控制參數 Operating parameters.
		 */
		viewPrototype.drawStage = function(container, viewPort, options, dataProvider){
			return d3.selectAll(container)
				  	 .append('svg')
				  	 .attr('class', 'radar')
				  	 .attr('width'   , viewPort.width)
				  	 .attr('height'  , viewPort.height)
				  	 .attr('viewBox' , options.viewBox)
				  	 .attr('preserveAspectRatio', options.preserveAspectRatio)
				  	 .datum(dataProvider);	//d3 bind data
		};

		/** 
		 * 繪製雷達圖 
		 */
		viewPrototype.drawChart = function(container, model){
			if(model.existenceProvider()){
				var viewPort  = model.getViewPort();
				var options   = model.getOptions(); 
				var dataProvider = model.dataProvider();
				//draw 
				var stage = this.drawStage(container, viewPort, options, dataProvider);
				this.drawWeb(stage, model, options)
					.drawArea(stage, model, options)
					.drawPanel(stage, options);
			}else{
				console.log("radar data is empty!");
			}
		};
	};
	
	//--------------------------
	//  Interactive
	//  互動處理
	//-------------------------- 
	var InteractiveProxy = function(window, document, $, d3){
		var interactivePrototype = InteractiveProxy.prototype;
		var thiz = this;

		/* find stage*/
		var findStage = function(mark){
			var node = $(mark);
			var findDepth = 50;
			//取得svg
			while(node.attr('class') != 'radar' &&  findDepth-- > 0){
				node = node.parent();
			}
			//代表搜尋完 findDepth 數 沒有有找到 svg
			if(node.attr('class') != 'radar' || findDepth <= -1){
				node = null;	
			}
			return (node) ? node[0] : node;
		};

		// 前進一層 
		interactivePrototype.nextLayer = function(svg){
				var areaBox = $(svg).find('.area-box');
				var node = areaBox.find('.area-container').first();
					node.remove();
				areaBox.append(node);
		};

		// 退回一層
		interactivePrototype.backLayer = function(svg){
			var areaBox = $(svg).find('.area-box');
			var node = areaBox.find('.area-container').last();
				node.remove();
			areaBox.prepend(node);
		};

		// 將目標插入最底層 (DOM的最前頭)
		interactivePrototype.insertFirst = function(display){
			var childer = $(display);
				//childer.remove();
				childer.parent().prepend(childer[0]);
		};

		// 將目標插入最上層 (DOM最後頭)
		interactivePrototype.insertLast = function(display){
			var childer = $(display);
				childer.parent().append(childer[0]);
		};

		//
		interactivePrototype.calPanelPoint = function(mark, model){
			var viewBox = model.getViewBoxValue();
			var opt = model.getOptions();
			var point = { x : 0, y : 0, titleX : 0, titleY : 0 };
			mark = d3.select(mark);
			var markPoint = { cx : Number(mark.attr('cx')), cy : Number(mark.attr('cy'))};
			if(markPoint.cx + opt.infoPanelhorizontalGap + opt.panelWidth > Number(viewBox.width) ){
				point.x =  markPoint.cx - opt.infoPanelhorizontalGap - opt.panelWidth;
				point.titleX = markPoint.cx  - opt.infoPanelhorizontalGap + opt.infoTopPadding - opt.panelWidth;
			}else{
				point.x = markPoint.cx + opt.infoPanelhorizontalGap;
				point.titleX = markPoint.cx + opt.infoPanelhorizontalGap + opt.infoTopPadding;
			}
			point.y = markPoint.cy + opt.infoPanelverticalGap;
			point.titleY = markPoint.cy + opt.infoPanelverticalGap + opt.infoLeftPadding + 14;
			return point;
		};
		
		// 更新 infoPanel 內容
		interactivePrototype.updatePanel = function(mark, panel, text, textContent, model){
			var point = this.calPanelPoint(mark, model);
				panel.attr('x', point.x)
					 .attr('y', point.y);
				text.attr('x', point.titleX)
					.attr('y', point.titleY)
					.text(textContent);
		};
		interactivePrototype.showPanel = function(panel, text){
			panel.classed('panel-show', true);
			text.classed('panel-show', true);
		};
		interactivePrototype.hidePanel = function(panel, text){
			panel.classed('panel-show', false);
			text.classed('panel-show', false);
		};

		/* 滑鼠點擊 area 的處理*/
		interactivePrototype.areaMouseDown = function(){
			insertLast($(this).parent()[0]);
		},

		/* 滑鼠滑入 mark時的處理 */
		interactivePrototype.markMouseOver = function(data){
			var stage = findStage(this);
			if(stage){
				var d3Stage = d3.select(stage);
				var panel   = d3Stage.select('.infoPanel');
				var text    = d3Stage.select('.panel-title');
				var textContent = data.data.title + ':' + data.data.showValue;
				thiz.hidePanel(panel, text);
				thiz.updatePanel(this, panel, text, textContent, data.model);
				thiz.showPanel(panel, text);
			}
		},
		/* 滑鼠滑出 mark 時的處理 */
		interactivePrototype.markMouseOut = function(data){
			var stage = findStage(this);
			if(stage){
				var d3Stage = d3.select(stage);
				var panel   = d3Stage.select('.infoPanel');
				var text    = d3Stage.select('.panel-title');
				thiz.hidePanel(panel, text);
				thiz.updatePanel(this, panel, text, '', data.model);
			}
		},
		//enable or disable interactive.
		interactivePrototype.interactive = function(enable){
			//TO 事件移到事件模組
			if(enable){
				d3.selectAll('.mark')
				  .on('mouseover', this.markMouseOver)
				  .on('mouseout' , this.markMouseOut);
			}
		}
	};
	
	// --------------------------
	//  雷達圖畫家 ： 控制畫筆產生雷達圖
	//  Control
	// -------------------------- 
	var RaderPainter = function(d3){
		var painterPrototype = RaderPainter.prototype
		var register = {};
		var render = new RenderView(window, document, $, d3);
		var interactiveProxy = new InteractiveProxy(window, document, $, d3);

		/*
		 * 繪製雷達圖
		 * identity : id or class
		 * data : 繪製資料
		 * opt : 雷達圖參數
		 */
		painterPrototype.drawChart = function(identity, data, opt){
			var elements = document.querySelectorAll(identity);
			var model = new RadarModule(AXIS_TYPE, StringUtil, Options.mix(opt), data);
			register[identity] = model;
			render.drawChart(elements, model);
			interactiveProxy.interactive(true);
			return elements;
		};

		/* 上移一層
		 * svg : HTML Element
		 */
		painterPrototype.nextArea = function(svg){
			interactiveProxy.nextLayer(svg);
		};
		
		/* 下移一層
		 * svg : HTML Element
		 */
		painterPrototype.breakArea = function(svg){
			interactiveProxy.backLayer(svg);
		};
		
		/* 圖層插入最前頭 
		 * display : HTML Element
		 */
		painterPrototype.insertFirst = function(display){
			interactiveProxy.insertFirst(display);
		};
		
		/* 圖層插入最後頭 
		 * display : HTML Element
		 */
		painterPrototype.insertLast = function(display){
			interactiveProxy.insertLast(display);
		};
		
		/* 取得 全部 area 顏色*/
		painterPrototype.getAllAreaColor = function(identity){
			return register[identity].getAllAreaColor();
		};
		
		/* 取得 area 顏色*/
		painterPrototype.getAreaColor = function(identity, index){
			return register[identity].getAreaColor(index);
		};
	};
	
	if(!window.RaderPainter){		
		window.RaderPainter = new RaderPainter(d3);
	}
	
	if(typeof(module)!= "undefined"){
		module.exports = new RaderPainter(d3);
	}
}).call(this, document, d3, $);