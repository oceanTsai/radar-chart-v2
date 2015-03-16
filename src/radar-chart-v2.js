(function(document, d3, $){
	/* author : ocean Tsai
	 * email : contest.start@gmail.com
	 * licenses : MIT
	 */
	
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
	var MARK_TYPE = {
			CIRCLE : 'circle',
			RECT : 'rect'
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
				//stage
				viewPort : '100%, 100%',		//svg長寬。 width height
				viewBox : '0,0,600,600',		//svg選擇顯示範圍，如同攝影機的攝影範圍。 x,y,width,height
				preserveAspectRatio : "none",	//svg zoom mode
				//vertical
				visibleVerticalWeb : true,		//是否呈現雷達圖垂直網
				verticalZoom : 0.76,				//縱軸縮放值
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
				//system auto calculate (系統會自動計算的欄位)
				pointCount : 0,
				onePiece : 0,
				//假設值
				//title
				surmiseFontGap: 3,				//假設的font gap
				verticalAxisTitleGap : 6,
				//follow mouse icon
				visibleFollowIcon : false,		//是否呈現跟隨滑鼠笑果
				followIcon : '',				//svg path
				//information panel
				visibleInfoPanel :true,
				infoPanelWidth: 70,
				infoPanelHeight :24,
				infoPanelRadiusX :5,			//面板的圓角
				infoPanelRadiusY :5,
				infoPanelhorizontalGap : 10,
				infoPanelverticalGap :10,
				infoLeftPadding : 3,
				infoTopPadding : 4,
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

		/* 取得刻度之間的距離 */
		base.scaleGap = function(){
			return this.verticalLength() / this.options.scale;
		};
		
		/* 每一刻度基礎參考數值*/
		base.scaleRefValue = function(){
			return (this.options.maxValue - this.options.minValue) / this.options.scale;
		};
		
		/* 取得 全部 area 顏色*/
		base.getAllAreaColor = function(){
			return clearWhitespace(this.options.areaColor).split(',');
		};
		
		/* 取得 area 顏色*/
		base.getAreaColor = function(index){
			var color = 'grey';
			var areaColorList = clearWhitespace(this.options.areaColor).split(',');
			if(areaColorList && areaColorList.length > 0){
				color = areaColorList[ index % areaColorList.length ];
			}
			return color;
		};
		
		/* 弧度轉角度 */
		base.angle = function(radian){
			return radian * 180 / Math.PI;
		};
		
		/* 
		 * 銷毀 
		 */
		base.destroy = function(){
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
		
		base.initFollowIcon = function(){
			//followIcon
			var r = defaultOption.centerRadius / 2;
			var p1 = {
						x : defaultOption.dx,
						y : defaultOption.dy - r
				};
			var p2 = {
					x : defaultOption.dx + r,
					y : defaultOption.dy + r
			};
			var p3 = {
					x : defaultOption.dx - r,
					y : defaultOption.dy + r
			};
			defaultOption.followIcon = 'M ' + p1.x + ' ' + p1.y + ' L ' + p2.x + ' ' + p2.y  + ' L ' + p3.x + ' ' + p3.y + ' Z';
		};
		
		/*
		 * 初始化
		 */
		base.init = function(source, opt){
			this.initAxisLength();
			this.initOffset();
			this.initFollowIcon();
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
		};
		
		/* 上移一層 */
		base.nextArea = function(svg){
			var areaBox = $(svg).find('.area-box');
			var areaContainer = areaBox.find('.area-container');
			var node = areaContainer.first();
			node.remove();
			areaBox.append(node);			
		};
		
		/* 下移一層 */
		base.breakArea = function(svg){
			var areaBox = $(svg).find('.area-box');
			var areaContainer = areaBox.find('.area-container');
			var node = areaContainer.last();
			node.remove();
			areaBox.prepend(node);
		};
		
		/* 指定圖層插入 */
		base.insertPlaneAt = function(display, index){	
		};
		
		/* 圖層插入dom最前頭 (放在最底層)*/
		base.insertFirst = function(display){
			var childer = $(display);
			var parent = childer.parent();
			childer.remove();
			parent.prepend(childer[0]);
		};
		
		/* 圖層插入dom最後頭 (放在圖層的最上層)*/
		base.insertLast = function(display){
			var childer = $(display);
			var parent = childer.parent();
			childer.remove();
			parent.append(childer[0]);
		};
		
		/* 繪製跟隨滑鼠的 icon */
		base.drawFollowMouse = function(stage){
			var opt = model.options;
			if(opt.visibleFollowIcon){
				var followMousebox = stage.append('g').attr('class', 'followMouse-box');
				followMousebox.append('path')
							  .attr('class', 'follow-Icon')
							  .attr('d', opt.followIcon);
			}
		};
		
		/* 繪製標文字資訊 */
		base.drawInfoPanel = function(stage){
			var opt = model.options;
			if(opt.visibleInfoPanel){
				var panelGroup = stage.append('g').attr('class','infoPanel-group');
		        	panelGroup.append('rect')
		        			  .attr('class','infoPanel')
		          			  .attr('width',	opt.infoPanelWidth)
		          			  .attr('height', opt.infoPanelHeight)
		          			  .attr('x', 0)
		          			  .attr('y', 0)
		          			  .attr('rx', opt.infoPanelRadiusX)
		          			  .attr('ry', opt.infoPanelRadiusY);
		          	panelGroup.append('text').attr('class', 'panel-title');
		      }
		};
		
		/* 弱化全部 area 色彩*/
		var weakenAllAreaColor = function(display){
			d3.select(display).selectAll('.area-group').select('.area').classed('areaFade', true);
		};
			
		/* 強化單一 area 色彩*/
		var strengthenAreaColro = function(display){
			d3.select(display).select('.area').classed('areaFade', false).classed('areaHover', true);
		};
		
		/* 恢復 area 原來色彩 */
		var restoreAreaColor = function(groupContainer, focusDisplay){
			d3.select(groupContainer).selectAll('.area-group').select('.area').classed('areaFade', false);
			d3.select(focusDisplay).select('.area').classed('areaHover', false);
		};
		
		/* 滑鼠滑入 area 時的處理 */
		base.areaMouseOver = function(data){
			var areaBox = $(this).parent().parent()[0];
			weakenAllAreaColor(areaBox);
			strengthenAreaColro(this);
		};
		
		/* 滑鼠滑出 area 時的處理 */
		base.areaMouseOut = function(data){
			var areaBox = $(this).parent().parent()[0];
			restoreAreaColor(areaBox, this);
		};
		
		/* 滑鼠點擊 area 的處理*/
		base.areaMouseDown = function(data){
			var areaContainer = $(this).parent()[0];
			base.insertLast(areaContainer);
		};
		
		var infoTextContext = function(data){
			return data.title + ':' + data.value;
		};
		
		var infoPanelPoint = function(mark){
			mark = d3.select(mark);
			var opt = model.options;
			var panelPoint = {
				x : 0,
				y : 0,
				titleX : 0,
				titleY : 0
			};
			var markPoint = {
				cx : Number(mark.attr('cx')),
				cy : Number(mark.attr('cy'))		
			};
			
			var viewBox = model.getViewBoxValue();
			console.log(viewBox);
			if(markPoint.cx + opt.infoPanelhorizontalGap + opt.infoPanelWidth > viewBox.width ){
				panelPoint.x =  markPoint.cx - opt.infoPanelhorizontalGap - opt.infoPanelWidth;
				panelPoint.titleX = markPoint.cx  - opt.infoPanelhorizontalGap + opt.infoTopPadding - opt.infoPanelWidth;
			}else{
				panelPoint.x = markPoint.cx + opt.infoPanelhorizontalGap;
				panelPoint.titleX = markPoint.cx + opt.infoPanelhorizontalGap + opt.infoTopPadding;
			}
			panelPoint.y = markPoint.cy + opt.infoPanelverticalGap;
			panelPoint.titleY = markPoint.cy + opt.infoPanelverticalGap + opt.infoLeftPadding + 14;
			return panelPoint;
		};
		/* 更新 infoPanel 內容*/
		base.UpdateInfoPanelText = function(mark, stage, visible, data){
			if(stage){
				var d3Stage = d3.select(stage);
				var infoPanel = d3Stage.select('.infoPanel');
				var infoText = d3Stage.select('.panel-title');
				if(visible){
					var panelPoint = infoPanelPoint(mark);
					infoPanel
						.classed('panel-show', true)
						.attr('x', panelPoint.x)
						.attr('y', panelPoint.y);
			
					infoText
						.classed('panel-show', true)
						.attr('x', panelPoint.titleX)
						.attr('y', panelPoint.titleY)
						.text(infoTextContext(data));
				}else{
					infoPanel.classed('panel-show', false);
					infoText.classed('panel-show', false);
					infoText.text('');
				}
			}
		};
		
		/* find stage*/
		var findStage = function(mark){
			var node = $(mark);
			var findDepth = 15;
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
		
		/* 滑鼠滑入 mark時的處理 */
		base.markMouseOver = function(data){
			var areaBox = $(this).parent().parent().parent()[0];
			var areaGroup = $(this).parent().parent().find('.area-group')[0];
			weakenAllAreaColor(areaBox);
			strengthenAreaColro(areaGroup);
			var stage = findStage(this);
			base.UpdateInfoPanelText(this, stage, true, data);
		};
		
		 /* 滑鼠滑出 mark 時的處理 */
		base.markMouseOut = function(data){
			var areaBox = $(this).parent().parent().parent()[0];
			var areaGroup = $(this).parent().parent().find('.area-group')[0];
			restoreAreaColor(areaBox, areaGroup);
			var stage = findStage(this);
			base.UpdateInfoPanelText(this, stage, false, data);
		};
		
		/* */
		base.appendMark = function(markGulp, point, pointData, color){
			var mark;
			var opt = model.options;
			//圓形
			if(opt.markType ===  MARK_TYPE.CIRCLE){
				mark = markGulp.append(opt.markType);
				mark.attr('class', 'mark')
					.attr('cx', point.x)
					.attr('cy', point.y)
					.attr('r', opt.markRadius)
					.style('fill', color)
					.datum(pointData);	//bind data
				mark.on('mouseover', this.markMouseOver)
					.on('mouseout' , this.markMouseOut);
			}
			//矩形
			if(model.options.markType === MARK_TYPE.MARK_TYPE){
				mark = markGulp.append(opt.markType);
				mark.attr('class', 'mark')
					.datum(pointData);	//bind data
			}
			return mark;
		};
		/* 繪製標記點 */
		base.drawMarkPoint = function(areaContainer, markPoints, color ){
			var markGulp = areaContainer.append('g').attr('class', 'mark-group');
			for(var index=0, count=markPoints.length ; index < count ; index++ ){
				this.appendMark(markGulp, markPoints[index].point, markPoints[index].pointData, color);
			}
		};
		
		/* 繪製area折線*/
		base.drawAreaPolygon = function(areaContainer, ploygonPoint, color){
			var areaGroup = areaContainer.append('g');
			areaGroup.attr('class', 'area-group')
					 .append('polygon')
					 .attr('class', 'area')
					 .attr('points',ploygonPoint)
					 .style('fill', color)
					 .style('stroke', color);
			//event listener
			areaGroup.on('mouseover', this.areaMouseOver)
					 .on('mouseout' , this.areaMouseOut)
					 .on('mousedown', this.areaMouseDown);			
		};
		
		/* 繪製點所形成的區塊 */
		base.drawArea = function(stage){
			var opt = model.options;
			if(opt.visibleArea){
				var areaData = model.getData();
				var areaBox = stage.append('g').attr('class', 'area-box');
				var areaPoints = [];
				var markPoints = [];
				//out loop hanlde area
				//inner loop hanlde point
				for(var areaIndex=0, areaCount=areaData.length; areaIndex < areaCount ; areaIndex++){
					var currentData = areaData[areaIndex];
					var areaContainer = areaBox.append('g').attr('class', 'area-container');
					areaPoints.length = 0; //clear array
					markPoints.length = 0; //clear array
					for(var pointIndex=0,pointCount=model.options.pointCount ; pointIndex < pointCount; pointIndex++){
						//cal point
						var pointData = currentData[pointIndex];
						var radians = opt.onePiece * pointIndex; 	//當前縱軸的弧度
						var radius = model.verticalLength() / (opt.maxValue - opt.minValue) * pointData.value + opt.centerRadius;
						var point = this.point(radius, radians);
						areaPoints.push(point.x + ',' + point.y); //ploygon format	
						markPoints.push({point : point, pointData : pointData});					
					}
					var color = model.getAreaColor(areaIndex);
					this.drawAreaPolygon(areaContainer, areaPoints.join(' '), color);
					this.drawMarkPoint(areaContainer, markPoints, color);
				}
			}
		};
		
		/* 繪製刻度表 */
		base.drawScaleLine = function(stage){
			var opt = model.options;
			if(opt.visibleScale){
				var outSidePoint = model.vericalAxisPoints[0].outSide;
				var scalaGroup = stage.append('g').attr('class','scale-group');
				var gap = model.scaleGap();
				for(var index=0; index <= opt.scale ; index++){
					var radius = index * gap + opt.centerRadius;
						var point = this.point(radius, opt.onePiece * 0);
						scalaGroup.append('text')
								  .attr('x', point.x + opt.scaleFontDx)
								  .attr('y', point.y + opt.scaleFontDy)
								  .attr('fill', opt.scaleFontColor)
								  .attr('font-size', opt.scaleFontSize + 'px')
								  .text( (index * model.scaleRefValue()) + opt.scaleUnit);
				}
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
						//if (index == 0) console.log(p0);
						this.drawHorizontalAxis(axixGroup, p0, p1, className);
					}
				}
			}
		};
		
		/* 繪製垂直軸上標題 */
		base.drawVerticalTitle = function(titleGroup, outSidePoint, title){
			var opt = model.options;
			var x = Math.ceil(outSidePoint.x);
			var y = Math.ceil(outSidePoint.y);
			var text = titleGroup.append('text').attr('class', 'item-title').text(title); 
			var fontSize = text.style("font-size").replace('pt','').replace('px','')  | 0;
			var gapTotal =  opt.surmiseFontGap * (title.length - 1);
			var offsetW  = (fontSize * title.length + gapTotal) ;  //
			var offsetH  = fontSize / 2 | 0;

			//x is rigth
			if(x > opt.dx){
				text.attr('x', x + opt.verticalAxisTitleGap );
			}else if(x < opt.dx){
				text.attr('x', x - opt.verticalAxisTitleGap - offsetW);
			}else{
				//x is center
				text.attr('x', x - offsetW / 2 );
			}
			
			if(y > opt.dy){
				text.attr('y', y + offsetH + opt.verticalAxisTitleGap + 5);
			}else if(y < opt.dy){
				text.attr('y', y - offsetH - opt.verticalAxisTitleGap + -5);
			}else{
				text.attr('y', y);
			}
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
				for(var index=0, axisCount = model.options.pointCount; index < axisCount ; index++){
					var radians = opt.onePiece * index; 	//當前縱軸的弧度
					var outSidePoint = this.point(model.verticalLength() + opt.centerRadius, radians);
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
					 //.attr('index', function(d,i){return i;});	//寫入索引值
			return stage;
		};
		
		/* 繪製雷達圖 */
		base.drawChart = function(elements, chartModel){
			model = chartModel;
			if(model.hasData()){
				this.prepareParam();
				var stage = this.drawStage(elements);
				this.drawWeb(stage);
				this.drawArea(stage);
				this.drawFollowMouse(stage);
				this.drawInfoPanel(stage);
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
			getChartModel = function(identity){
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
		//d3 js reference
		base.d3 = d3;
		
		/* 上移一層
		 * svg : HTML Element
		 */
		base.nextArea = function(svg){
			pan.nextArea(svg);
		};
		
		/* 下移一層
		 * svg : HTML Element
		 */
		base.breakArea = function(svg){
			pan.breakArea(svg);
		};
		
		/* 指定圖層插入 */
		base.insertPlaneAt = function(display, index){
		};
		
		/* 圖層插入最前頭 
		 * display : HTML Element
		 */
		base.insertFirst = function(display){
			pan.insertFirst(display);
		};
		
		/* 圖層插入最後頭 
		 * display : HTML Element
		 */
		base.insertLast = function(display){
			pan.insertLast(display);
		};
		
		/* 取得 全部 area 顏色*/
		base.getAllAreaColor = function(identity){
			return getChartModel(identity).getAllAreaColor();
		};
		
		/* 取得 area 顏色*/
		base.getAreaColor = function(identity, index){
			return getChartModel(identity).getAreaColor(index);
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
}).call(this, document, d3, $);