## Radar Chart V2

## 說明
svg 雷達圖

### 安裝 Install
1. sudo npm install d3   
2. sudo npm install jquery   


### 資料結構 Data structure
```
var data = [
     	[
           {title: "國文", value: 20 ,showValue : "A"}, 
           {title: "數學", value: 0	,showValue : "A"}, 
           {title: "英文", value: 10 ,showValue : "A"},  
           {title: "歷史", value: 40 ,showValue : "A"},  
           {title: "物理", value: 90 ,showValue : "A"},
           {title: "生物", value: 57 ,showValue : "A"},
           {title: "公民", value: 30 ,showValue : "A"},
           {title: "地理", value: 100,showValue : "A"}
        ],
        [
           {title: "國文", value: 100 ,showValue : "A"}, 
           {title: "數學", value: 20	,showValue : "A"}, 
           {title: "英文", value: 70 ,showValue : "A"},  
           {title: "歷史", value: 95 ,showValue : "A"},  
           {title: "物理", value: 80 ,showValue : "A"},
           {title: "生物", value: 0 ,showValue : "A"},
           {title: "公民", value: 33 ,showValue : "A"},
           {title: "地理", value: 66 ,showValue : "A"}
        ],
        [
           {title: "國文", value: 40 ,showValue : "A"}, 
           {title: "數學", value: 60	,showValue : "A"}, 
           {title: "英文", value: 72 ,showValue : "A"},  
           {title: "歷史", value: 86 ,showValue : "A"},  
           {title: "物理", value: 92 ,showValue : "A"},
           {title: "生物", value: 57 ,showValue : "A"},
           {title: "公民", value: 23 ,showValue : "A"},
           {title: "地理", value: 48 ,showValue : "A"}
        ],
        [
           {title: "國文", value: 20 ,showValue : "A"}, 
           {title: "數學", value: 10	,showValue : "A"}, 
           {title: "英文", value: 32 ,showValue : "A"},  
           {title: "歷史", value: 36 ,showValue : "A"},  
           {title: "物理", value: 22 ,showValue : "A"},
           {title: "生物", value: 37 ,showValue : "A"},
           {title: "公民", value: 0 ,showValue : "A"},
           {title: "地理", value: 99 ,showValue : "A"}
        ]
];
```

### 範例 examp
```html
<!DOCTYPE html>
<html lang="zh-tw">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>radar chart v2</title>
	<meta name="author" content="ocean">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
	<link rel="stylesheet" href="./src/radar-chart-v2.css"/>
	<style>
		body{
			margin: 0px 0px;
			padding : 0px 0px;
		}
		
		div{
			margin-bottom: 10px;
		}
		
		.btnBox{
			overflow: hidden;
		}
		
		.container{
			width: 600px;
			height:600px;
			background-color: #eeeeee;
		}
		
		.areaBtn div, .areaBtn button, .areaBtn input{
			float : left;
			width: 100px;
			height: 25px;
			margin-left: 10px;
		}

		
	</style>
</head>
<body>
	<div class="container" id="top"></div>
	<div class='btnBox'>
		<div class='areaBtn'>
			<input id="oneSilder" type="range" min="300" max="900" value="600" />
			<button id="oneNext">next</button>
			<button id="oneBreak">Break</button>
		</div>
	</div>
	
	<div class="container" id="bottom"></div>
	<div class='btnBox'>
		<div class='areaBtn'>
			<input id="twoSilder" type="range" min="300" max="900" value="600" />
			<button id="twoNext">next</button>
			<button id="twoBreak">Break</button>
		</div>
	</div>
	
	
	<div id="radarChart"></div>

</body>
<script src="./node_modules/d3/d3.min.js"></script>
<script src="./node_modules/jquery/dist/jquery.min.js"></script>
<script src="./src/radar-chart-v2.js"></script>

<script>
var data = [
     	[
           {title: "國文", value: 20 }, 
           {title: "數學", value: 0	}, 
           {title: "英文", value: 10 },  
           {title: "歷史", value: 40 },  
           {title: "物理", value: 90 },
           {title: "生物", value: 57 },
           {title: "公民", value: 30 },
           {title: "地理", value: 100}
        ],
        [
           {title: "國文", value: 100 }, 
           {title: "數學", value: 20	}, 
           {title: "英文", value: 70 },  
           {title: "歷史", value: 95 },  
           {title: "物理", value: 80 },
           {title: "生物", value: 0 },
           {title: "公民", value: 33 },
           {title: "地理", value: 66 }
        ],
        [
           {title: "國文", value: 40 }, 
           {title: "數學", value: 60	}, 
           {title: "英文", value: 72 },  
           {title: "歷史", value: 86 },  
           {title: "物理", value: 92 },
           {title: "生物", value: 57 },
           {title: "公民", value: 23 },
           {title: "地理", value: 48 }
        ],
        [
           {title: "國文", value: 20 }, 
           {title: "數學", value: 10	}, 
           {title: "英文", value: 32 },  
           {title: "歷史", value: 36 },  
           {title: "物理", value: 22 },
           {title: "生物", value: 37 },
           {title: "公民", value: 0 },
           {title: "地理", value: 99 }
        ]
];

var painter = window.RaderPainter;
var elements = painter.drawChart('.container', data, {scaleUnit : ' 分'});

$('#oneNext').click(function(){
	painter.nextArea($('svg')[0]);
});

$('#oneBreak').click(function(){
	painter.breakArea($('svg')[0]);
});


$('#twoNext').click(function(){
	painter.nextArea($('svg')[1]);
});

$('#twoBreak').click(function(){
	painter.breakArea($('svg')[1]);
});



var colorBlockClick = function(){
	painter.insertLast(this['area']);
};
//
$('.areaBtn').each(function(index, element){
	var svg = $('svg')[index];
	var areaList = $(svg).find('.area-box').children();
	for(var i=0, len=data.length ; i < len ; i++){
		var container = $(element).append('<div></div>');
		var color = painter.getAreaColor('.container',i);
		var colorBlock = container.find('div').last().css({'background': color});
		colorBlock[0]['area'] = areaList[i];	//bind html element
		colorBlock.click(colorBlockClick);
	}	
});

$('#oneSilder').change(function(){
	var value = $(this).val()+'px';
	$('.container').first().width(value).height(value);
});

$('#twoSilder').change(function(){
	var value = $(this).val()+'px';
	$('.container').last().width(value).height(value);
});

</script>
</html>


```



### 設定 Configure
```javascript
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
```


