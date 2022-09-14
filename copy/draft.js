// const { isConstructorDeclaration } = require("typescript");

// const { collapseTextChangeRangesAcrossMultipleVersions } = require("typescript");

var grouped = {};
var typeOfDataGrouped = []; // typesOfData
var roadArr = [[], [], [], [], [], [], [], []]; // roads in each crack type
var arrValues = [[], [], [], [], [], [], [], []]; // values of each road in each crack type
var roadNames = []; //road names in DB'

var webmap;
var view;
var MapView;
var pt;
var graph_lay;
var graphic;
var collection;

require([
  "esri/config",
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/LayerList",
  "esri/widgets/Expand",
  "esri/rest/support/Query",
  "esri/rest/query"
], function (
  esriConfig,
  WebMap,
  MapView,
  LayerList,
  Expand,
  Query,
  query)
  {
  esriConfig.apiKey =
    "AAPKf329b2da442d409fac4aeefc5b191600m1RNQ4zxR3hivOJENHZhTogSjkHwZZ2qR8_4-ccU8gmPSOEvxGjOBdp2WT4C0mKo";
    
  webmap = new WebMap({
    portalItem: {
      id: "aa43ffa3a5d54f5e92d765b9388b14ea",
    },
  });
  view = new MapView({
    container: "viewDiv",

    map: webmap,
  });
  view.when(() => {
    let q = new Query();
    q.where = "1=1";
    q.geometry = view.extent;
    q.outFields = ["*"];
    q.spatialRelationship = "intersects";
    query
      .executeQueryJSON(
        "https://services7.arcgis.com/pbDblJpybjOn1fhL/ArcGIS/rest/services/CracksAtt/FeatureServer/0",
        q
      )
      .then((result) => {
        var ARR = result.features;
        let filtredArr = result.features.reduce((a, b) => {
          a[b.attributes.TypeOfData] = [
            ...(a[b.attributes.TypeOfData] || []),
            b.attributes,
          ];
          return a;
        }, {});

        groups = ["TypeOfData", "name"];

        let x = result.features.forEach(function (a) {
          groups
            .reduce(function (o, g, i) {
              // take existing object,
              o[a.attributes[g]] =
                o[a.attributes[g]] || (i + 1 === groups.length ? [] : {}); // or generate new obj, or
              return o[a.attributes[g]]; // at last, then an array
            }, grouped)
            .push(a.attributes);
        });

        setChartsData(filtredArr);
        // StackedChartData=filtredArr
        setTimeout(() => {
          setStackedChartData(Object.entries(grouped));
        }, 500);

        setScatterdChart(grouped);

        //types of data in an array (D1,D2,...)
        typeOfDataGrouped = Object.keys(grouped);
      });

  });
  

  LayerList = new LayerList({
    container: document.createElement("div"),
    view: view,
  });
  layerListExpand = new Expand({
    expandIconClass: "esri-icon-layer-list", // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
    // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
    view: view,
    content: LayerList,
  });

  view.ui.add(layerListExpand, "top-right");
  
});
// -------------------------------------------------------------------------------------------------------
function setStackedChartData(grouped) {
// console.log(grouped)
  //loop for gettng road names in each crack type
  for (i = 0; i < grouped.length; i++) //looping in grouped arr in first index
  {
    for (y = 0; y < Object.keys(grouped[i][1]).length; y++) {
      console.log("Object.keys(grouped[i][1])", Object.keys(grouped[i][1]))
      roadArr[i][y] = Object.keys(grouped[i][1])[y]
      console.log("Object.keys(grouped[i][1])[y]", Object.keys(grouped[i][1])[y])
    }
  }
  // console.log(roadArr)

  //loop for gettng value of eacj crack type in each road 
  for (i = 0; i < grouped.length; i++) //looping in grouped arr in first index
  {
    for (y = 0; y < Object.keys(grouped[i][1]).length; y++) {
      arrValues[i][y] = grouped[i][1][roadArr[i][y]].length
    }
  }
  // console.log(arrValues)

  //getting all road names in array 
  for (i = 0; i < roadArr.length; i++) {
    //loop in each array in elements of roadArr 
    for (y = 0; y < roadArr[i].length; y++) {
      //checking roadNames length if zero push 3la tool
      if (roadNames.length == 0) {
        roadNames.push(roadArr[i][y])
      }
      //if not compare b2a
      else {
        // loop 3la kol al elements aly mawgoda fel roadNames
        for (k = 0; k < roadNames.length; k++) {
          //law lsa mwslnash a5er al roadNames yb2a w hia hia yb2a continue wala ay andhash
          if (k != roadNames.length - 1) {
            if (roadNames[k] == roadArr[i][y]) {
              break;
            }
          }
          //law wslna le a5er al roadNames yb2a law msh hia hia ne push bardo 
          else if (k == roadNames.length - 1) {
            if (roadNames[k] == roadArr[i][y]) {
              break
            }
            else {
              roadNames.push(roadArr[i][y]);
            }
          }
        }
      }
    }
  }
  var dom = document.getElementById('stacked');
  var myChart3 = echarts.init(dom, 'dark', {
    renderer: 'canvas',
    useDirtyRect: false
  });
  var app = {};

  var option;

  option = {
    tooltip: {
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: [
      {
        type: 'category',
        data: typeOfDataGrouped
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
    ],
  };
console.log("typeOfDataGrouped", typeOfDataGrouped)
  for (m = 0; m < 15; m++) {
    option.series.push(
      {
        name: roadNames[m],
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        data: []
      }
    );
    console.log("typeOfDataGrouped.length", typeOfDataGrouped.length)
    for (n = 0; n < typeOfDataGrouped.length; n++) {
      // console.log("type of data loop: ", typeOfDataGrouped[n])
      for (s = 0; s < roadArr[n].length; s++) {
        if (s == roadArr[n][s].length - 1) {
          if (option.series[m].name == roadArr[n][s]) {
            option.series[m].data.push(arrValues[n][s]);
            break;
          }
          else {
            option.series[m].data.push(0)
          }
        }
        else {
          if (option.series[m].name == roadArr[n][s]) {
            option.series[m].data.push(arrValues[n][s]);
            break;
          }
          else {
            continue;
          }
        }
      }
    }
  }

  if (option && typeof option === 'object') {
    myChart3.setOption(option);
  }
  window.addEventListener('resize', myChart3.resize);
  console.log("webmap", webmap)
  
  //on click pan on map
  let counter = 0
  myChart3.on('click', (evt) => {
    if(counter == 0)
    {
      counter++;
    }
    else if(counter !=0 )
    {
      webmap.remove(graph_lay);
      counter++;
    }

    let layer = webmap.layers.items[1];
    const queryParams = layer.createQuery();

    queryParams.outFields = ["*"];
    queryParams.returnGeometry = true;

    queryParams.where = `name = '${evt.seriesName}' AND TypeOfData = '${evt.name}'`;

    layer.queryFeatures(queryParams).then(function (results) {
      createGraphicLayer(results.features, "stacked");
    });
  })
}

function createGraphicLayer(geo, chart_name)
    {
      console.log("geo", geo)
require([
  "esri/geometry/Point",
  "esri/layers/GraphicsLayer",
  "esri/Graphic"
], function (
  Point,
  GraphicsLayer,
  Graphic) {
      let web_map = webmap;
      let arrgraph = [];
      let views = view;
      graph_lay = new GraphicsLayer({});
      switch(chart_name) {
        case "scatter":
          graph_lay.title = geo[0].attributes.TypeOfData;
          break;
        case "stacked":
          graph_lay.title = geo[0].attributes.name;
          break;
        default:
          console.log("no chart name")
      }

      for(let i = 0; i< geo.length; i++)
      {
        pt = new Point({
          hasZ: false,
          hasM: false,
          spatialReference : views.spatialReference,
          x: geo[i].geometry.x,
          y: geo[i].geometry.y
        });
        graphic = new Graphic({
          spatialReference : views.spatialReference,
          geometry : pt,
          symbol: {
            type: "simple-marker",
            color: "#6622CC",
            size: 8,
            outline: { 
              width: 0.5,
              color: "#D2A1B8"
            }
          }
        });
        arrgraph.push(graphic);
      }
      graph_lay.addMany(arrgraph)
      web_map.add(graph_lay)
      web_map.layers.items[0].visible = false;
      web_map.layers.items[1].visible = false;
      views.goTo(graph_lay.graphics)
    });
  }
// -----------------------------------------------------------------------------------------------------------------------------
// function setScatterdChart(grouped) {
//   var dom = document.getElementById('chart-container');
//   var myChart = echarts.init(dom, 'dark', {
//     renderer: 'canvas',
//     useDirtyRect: false
//   });
//   console.log(" typeOfDataGrouped", typeOfDataGrouped)
//   var app = {};
//   var option;
//   option = {
//     title: {
//       text: "hello",
//       textStyle: {
//         color: '#fff'

//       }
//     },
//     tooltip: {
//       trigger: "item",
//     },
//     xAxis: {
//       type: 'category',
//       data: typeOfDataGrouped
//     },
//     yAxis: {
//       type: 'value'
//     },
//     series: [
//       {
//         data: [],
//         type: 'line',
//         lineStyle: {
//           opacity: 0
//         }
//       },
//     ]
//   };
//   var values = Object.values(grouped)
//   for (s in values) {
//     option.series[0].data.push(values[s].length)
//   }
//   if (option && typeof option === 'object') {
//     myChart.setOption(option);
//   }
//   window.addEventListener('resize', myChart.resize);

//   let counter = 0
//   myChart.on('click', (evt) => {
//     let web_map  = webmap; 
//     if(counter == 0)
//     {
//       counter++;
//       // compareDataBase(evt);
//     }

//     else if(counter !=0 )
//     {
//       webmap.remove(graph_lay);
//       counter++;
//       // compareDataBase(evt);
//     }
//   })
// }

function setScatterdChart(grouped) {
  var dom = document.getElementById('chart-container');
  var myChart = echarts.init(dom, 'dark', {
    renderer: 'canvas',
    useDirtyRect: false
  });
  var app = {};
  var option;
  option = {
    title: {
      text: "hello",
      textStyle: {
        color: '#fff'

      }
    },
    tooltip: {
      trigger: "item",
    },
    xAxis: {
      type: 'category',
      data: Object.keys(grouped),
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [],
        type: 'line',
        lineStyle: {
          opacity: 0
        }
      },
    ]
  };
  var values = Object.values(grouped)

  for (s in values) {

    option.series[0].data.push(values[s].length)
  }
  if (option && typeof option === 'object') {
    myChart.setOption(option);
  }
  window.addEventListener('resize', myChart.resize);  
}
//-----------------------------------------------------------------------------------------------------------------------------------------------
function setChartsData(data) {
  var dom = document.getElementById("pie");
  var myChart2 = echarts.init(dom, "dark", {
    renderer: "canvas",
    useDirtyRect: false,
  });
  var app = {};

  var option;

  option = {
    title: {
      text: "precentage and types of cracks",
      subtext: "",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["20%", "33%"],
        data: [
          { value: data.D1.length, name: "D1:Alligator" },
          { value: data.D2.length, name: "D2:Transverse" },
          { value: data.D3.length, name: "D3:Longitudinal" },
          { value: data.D4.length, name: "D4:pothole" },
          { value: data.D5.length, name: "D5:Patching" },
          { value: data.D6.length, name: "D6:Shrinkage" },
          { value: data.D7.length, name: "D7:Expansion" },
          { value: data.D8.length, name: "D8:Settling" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
console.log("data.D8.length", data.D8.length)
console.log("data.D7.length", data.D7.length)
  if (option && typeof option === "object") {
    myChart2.setOption(option);
  }

  window.addEventListener("resize", myChart2.resize);
}
// -------------------------------------------------------------------------------------------------------------------
var dom = document.getElementById("gauge");
var myChart4 = echarts.init(dom, "dark", {
  renderer: "canvas",
  useDirtyRect: false,
});
var app = {};

var option;

option = {
  tooltip: {
    formatter: "{a} <br/>{b} : {c}",
  },
  series: [
    {
      //name on tooltip
      name: "Pressure",
      type: "gauge",
      radius: "95%",
      progress: {
        show: true,
      },
      detail: {
        valueAnimation: true,
        formatter: "{value}",
      },
      data: [
        {
          name: "Max Speed",
          value: 50,
        },
      ],
    },
  ],
};
if (option && typeof option === "object") {
  myChart4.setOption(option);
}

window.addEventListener("resize", myChart4.resize);
// --------------------------------------------------------------------------------------------------------------
var dom = document.getElementById("indicator1");
var myChart6 = echarts.init(dom, "dark", {
  renderer: "canvas",
  useDirtyRect: false,
});
var app = {};
var ROOT_PATH = "https://echarts.apache.org/examples";
var option;

var _panelImageURL = ROOT_PATH + "/data/asset/img/custom-gauge-panel.png";
var _animationDuration = 1000;
var _animationDurationUpdate = 1000;
var _animationEasingUpdate = "quarticInOut";
var _valOnRadianMax = 200;
var _outerRadius = 80;
var _innerRadius = 70;
var _pointerInnerRadius = 20;
var _insidePanelRadius = 70;
var _currentDataIndex = 0;
function renderItem(params, api) {
  var valOnRadian = api.value(1);
  var coords = api.coord([api.value(0), valOnRadian]);
  var polarEndRadian = coords[3];
  var imageStyle = {
    image: _panelImageURL,
    x: params.coordSys.cx - _outerRadius,
    y: params.coordSys.cy - _outerRadius,
    width: _outerRadius * 2,
    height: _outerRadius * 2,
  };
  return {
    type: "group",
    children: [
      {
        type: "image",
        style: imageStyle,
        clipPath: {
          type: "sector",
          shape: {
            cx: params.coordSys.cx,
            cy: params.coordSys.cy,
            r: _outerRadius,
            r0: _innerRadius,
            startAngle: 0,
            endAngle: -polarEndRadian,
            transition: "endAngle",
            enterFrom: { endAngle: 0 },
          },
        },
      },
      {
        type: "image",
        style: imageStyle,
        clipPath: {
          type: "polygon",
          shape: {
            points: makePionterPoints(params, polarEndRadian),
          },
          extra: {
            polarEndRadian: polarEndRadian,
            transition: "polarEndRadian",
            enterFrom: { polarEndRadian: 0 },
          },
          during: function (apiDuring) {
            apiDuring.setShape(
              "points",
              makePionterPoints(params, apiDuring.getExtra("polarEndRadian"))
            );
          },
        },
      },
      {
        type: "circle",
        shape: {
          cx: params.coordSys.cx,
          cy: params.coordSys.cy,
          r: _insidePanelRadius,
        },
        style: {
          fill: "#fff",
          shadowBlur: 25,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: "rgba(76,107,167,0.4)",
        },
      },
      {
        type: "text",
        extra: {
          valOnRadian: valOnRadian,
          transition: "valOnRadian",
          enterFrom: { valOnRadian: 0 },
        },
        style: {
          text: makeText(valOnRadian),
          fontSize: 50,
          fontWeight: 700,
          x: params.coordSys.cx,
          y: params.coordSys.cy,
          fill: "rgb(70gau,50,190)",
          align: "center",
          verticalAlign: "middle",
          enterFrom: { opacity: 0 },
        },
        during: function (apiDuring) {
          apiDuring.setStyle(
            "text",
            makeText(apiDuring.getExtra("valOnRadian"))
          );
        },
      },
    ],
  };
}
function convertToPolarPoint(renderItemParams, radius, radian) {
  return [
    Math.cos(radian) * radius + renderItemParams.coordSys.cx,
    -Math.sin(radian) * radius + renderItemParams.coordSys.cy,
  ];
}
function makePionterPoints(renderItemParams, polarEndRadian) {
  return [
    convertToPolarPoint(renderItemParams, _outerRadius, polarEndRadian),
    convertToPolarPoint(
      renderItemParams,
      _outerRadius,
      polarEndRadian + Math.PI * 0.03
    ),
    convertToPolarPoint(renderItemParams, _pointerInnerRadius, polarEndRadian),
  ];
}
function makeText(valOnRadian) {
  // Validate additive animation calc.
  if (valOnRadian < -10) {
    alert("illegal during val: " + valOnRadian);
  }
  return ((valOnRadian / _valOnRadianMax) * 100).toFixed(0) + "%";
}
option = {
  animationEasing: _animationEasingUpdate,
  animationDuration: _animationDuration,
  animationDurationUpdate: _animationDurationUpdate,
  animationEasingUpdate: _animationEasingUpdate,
  dataset: {
    source: [[1, 156]],
  },
  tooltip: {},
  angleAxis: {
    type: "value",
    startAngle: 0,
    show: false,
    min: 0,
    max: _valOnRadianMax,
  },
  radiusAxis: {
    type: "value",
    show: false,
  },
  polar: {},
  series: [
    {
      type: "custom",
      coordinateSystem: "polar",
      renderItem: renderItem,
    },
  ],
};
setInterval(function () {
  var nextSource = [[1, Math.round(Math.random() * _valOnRadianMax)]];
  myChart6.setOption({
    dataset: {
      source: nextSource,
    },
  });
}, 3000);

if (option && typeof option === "object") {
  myChart6.setOption(option);
}

window.addEventListener("resize", myChart6.resize);
// -------------------------------------------------------------------------------------------------------------
var dom = document.getElementById("indicator2");
var myChart6 = echarts.init(dom, "dark", {
  renderer: "canvas",
  useDirtyRect: false,
});
var app = {};
var ROOT_PATH = "https://echarts.apache.org/examples";
var option;

var _panelImageURL = ROOT_PATH + "/data/asset/img/custom-gauge-panel.png";
var _animationDuration = 1000;
var _animationDurationUpdate = 1000;
var _animationEasingUpdate = "quarticInOut";
var _valOnRadianMax = 200;
var _outerRadius = 80;
var _innerRadius = 70;
var _pointerInnerRadius = 20;
var _insidePanelRadius = 70;
var _currentDataIndex = 0;
function renderItem(params, api) {
  var valOnRadian = api.value(1);
  var coords = api.coord([api.value(0), valOnRadian]);
  var polarEndRadian = coords[3];
  var imageStyle = {
    image: _panelImageURL,
    x: params.coordSys.cx - _outerRadius,
    y: params.coordSys.cy - _outerRadius,
    width: _outerRadius * 2,
    height: _outerRadius * 2,
  };
  return {
    type: "group",
    children: [
      {
        type: "image",
        style: imageStyle,
        clipPath: {
          type: "sector",
          shape: {
            cx: params.coordSys.cx,
            cy: params.coordSys.cy,
            r: _outerRadius,
            r0: _innerRadius,
            startAngle: 0,
            endAngle: -polarEndRadian,
            transition: "endAngle",
            enterFrom: { endAngle: 0 },
          },
        },
      },
      {
        type: "image",
        style: imageStyle,
        clipPath: {
          type: "polygon",
          shape: {
            points: makePionterPoints(params, polarEndRadian),
          },
          extra: {
            polarEndRadian: polarEndRadian,
            transition: "polarEndRadian",
            enterFrom: { polarEndRadian: 0 },
          },
          during: function (apiDuring) {
            apiDuring.setShape(
              "points",
              makePionterPoints(params, apiDuring.getExtra("polarEndRadian"))
            );
          },
        },
      },
      {
        type: "circle",
        shape: {
          cx: params.coordSys.cx,
          cy: params.coordSys.cy,
          r: _insidePanelRadius,
        },
        style: {
          fill: "#fff",
          shadowBlur: 25,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: "rgba(76,107,167,0.4)",
        },
      },
      {
        type: "text",
        extra: {
          valOnRadian: valOnRadian,
          transition: "valOnRadian",
          enterFrom: { valOnRadian: 0 },
        },
        style: {
          text: makeText(valOnRadian),
          fontSize: 50,
          fontWeight: 700,
          x: params.coordSys.cx,
          y: params.coordSys.cy,
          fill: "rgb(0,50,190)",
          align: "center",
          verticalAlign: "middle",
          enterFrom: { opacity: 0 },
        },
        during: function (apiDuring) {
          apiDuring.setStyle(
            "text",
            makeText(apiDuring.getExtra("valOnRadian"))
          );
        },
      },
    ],
  };
}
function convertToPolarPoint(renderItemParams, radius, radian) {
  return [
    Math.cos(radian) * radius + renderItemParams.coordSys.cx,
    -Math.sin(radian) * radius + renderItemParams.coordSys.cy,
  ];
}
function makePionterPoints(renderItemParams, polarEndRadian) {
  return [
    convertToPolarPoint(renderItemParams, _outerRadius, polarEndRadian),
    convertToPolarPoint(
      renderItemParams,
      _outerRadius,
      polarEndRadian + Math.PI * 0.03
    ),
    convertToPolarPoint(renderItemParams, _pointerInnerRadius, polarEndRadian),
  ];
}
function makeText(valOnRadian) {
  // Validate additive animation calc.
  if (valOnRadian < 1000) {
    return valOnRadian;
  }
  else if (valOnRadian >= 1000) {
    return (valOnRadian / 1000).toFixed(1) + "k";
  }
  else {
    alert("NO");
  }

}
option = {
  animationEasing: _animationEasingUpdate,
  animationDuration: _animationDuration,
  animationDurationUpdate: _animationDurationUpdate,
  animationEasingUpdate: _animationEasingUpdate,
  dataset: {
    source: [[1, 156]],
  },
  tooltip: {},
  angleAxis: {
    type: "value",
    startAngle: 0,
    show: false,
    min: 0,
    max: _valOnRadianMax,
  },
  radiusAxis: {
    type: "value",
    show: false,
  },
  polar: {},
  series: [
    {
      type: "custom",
      coordinateSystem: "polar",
      renderItem: renderItem,
    },
  ],
};
setInterval(function () {
  var sum = 0

  for (i = 0; i < typeOfDataGrouped.length; i++) {
    for (x = 0; x < arrValues.length; x++) {
      sum += arrValues[x].length;
    }
  }
  // console.log("sum:::", sum);
  var nextSource = [[1, sum]];
  myChart6.setOption({
    dataset: {
      source: nextSource,
    },
  });
}, 3000);
if (option && typeof option === "object") {
  myChart6.setOption(option);
}

window.addEventListener("resize", myChart6.resize);
// ------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------
var dom = document.getElementById("road_status");
var myChart7 = echarts.init(dom, "dark", {
  renderer: "canvas",
  useDirtyRect: false,
});
var app = {};

var option;

const data = [];
for (let i = 0; i < 5; ++i) {
  data.push(Math.round(Math.random() * 200));
}
option = {
  xAxis: {
    max: "dataMax",
  },
  yAxis: {
    type: "category",
    data: ["A", "B", "C", "D", "E"],
    inverse: true,
    animationDuration: 300,
    animationDurationUpdate: 300,
    max: 2, // only the largest 3 bars will be displayed
  },
  series: [
    {
      realtimeSort: true,
      name: "X",
      type: "bar",
      data: data,
      label: {
        show: true,
        position: "right",
        valueAnimation: true,
      },
    },
  ],
  legend: {
    show: true,
  },
  animationDuration: 0,
  animationDurationUpdate: 3000,
  animationEasing: "linear",
  animationEasingUpdate: "linear",
};
function run() {
  for (var i = 0; i < data.length; ++i) {
    if (Math.random() > 0.9) {
      data[i] += Math.round(Math.random() * 2000);
    } else {
      data[i] += Math.round(Math.random() * 200);
    }
  }
  myChart7.setOption({
    series: [
      {
        type: "bar",
        data,
      },
    ],
  });
}
setTimeout(function () {
  run();
}, 0);
setInterval(function () {
  run();
}, 3000);

if (option && typeof option === "object") {
  myChart7.setOption(option);
}

window.addEventListener("resize", myChart7.resize);
// -------------------------------------------------------------------------------------------------------------------
var dom = document.getElementById("road_type");
var myChart8 = echarts.init(dom, "dark", {
  renderer: "canvas",
  useDirtyRect: false,
});
var app = {};

var option;

option = {
  title: {
    text: "World Population",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  legend: {},
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "value",
    boundaryGap: [0, 0.01],
  },
  yAxis: {
    type: "category",
    data: ["Brazil", "Indonesia", "USA", "India", "China", "World"],
  },
  series: [
    {
      name: "2011",
      type: "bar",
      data: [18203, 23489, 29034, 104970, 131744, 630230],
    },
    {
      name: "2012",
      type: "bar",
      data: [19325, 23438, 31000, 121594, 134141, 681807],
    },
  ],
};

if (option && typeof option === "object") {
  myChart8.setOption(option);
}

window.addEventListener("resize", myChart8.resize);

// ----------------------------------------------------------------------------
function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
  document.getElementById("defaultOpen").click();

  var stu_names = ["Jhon", "Alice", "Mik"];
  var stu_score = [300, 200, 400];

  for (var i = 0; i < stu_names.length; i++) {
    for (var j = 0; j < stu_score.length; j++) {
      console.log(`Score of ${stu_names[i]} is ${stu_scrore[j]}`);
    }
  }
}