var chartData = {};
var grouped = {};
var typeOfDataGrouped = []; // typesOfData
var roadArr = [[], [], [], [], [], [], [], []]; // roads in each crack type
var arrValues = [[], [], [], [], [], [], [], []]; // values of each road in each crack type
var roadNames = []; //road names in DB'
var fclassArr = [[], [], []];
var roads_object_array = [];
let roadObj;
var roads_type_object;
var getmap;
var webmap;
var view;
var MapView;
var crackCount = -1;
var maxSpeedArr = [];
var pt;
var graph_lay;
var graphic;
var q;
var centerOfMap;
var control = true;

require([
  "esri/config",
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/LayerList",
  "esri/widgets/Expand",
  "esri/rest/support/Query",
  "esri/rest/query",
  "esri/core/watchUtils",
  "esri/layers/GraphicsLayer",
  "esri/layers/MapImageLayer"
], function (
  esriConfig,
  WebMap,
  MapView,
  LayerList,
  Expand,
  Query,
  query,
  watchUtils,
  GraphicsLayer,
  MapImageLayer
) {
  esriConfig.apiKey =
    "AAPKf329b2da442d409fac4aeefc5b191600m1RNQ4zxR3hivOJENHZhTogSjkHwZZ2qR8_4-ccU8gmPSOEvxGjOBdp2WT4C0mKo";

  const trafficLayer = new MapImageLayer({
    url: "https://traffic.arcgis.com/arcgis/rest/services/World/Traffic/MapServer",
    dpi: 48,
    imageFormat: "png24",
    refreshInterval: 3, // refresh the layer every 3 minutes
    useViewTime: false, // layer sets its time extent and will ignore view's timeExtent.
    opacity: 0.5
  });

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
    getData(view.extent);
  });

  layerList = new LayerList({
    container: document.createElement("div"),
    view: view,
  });
  layerListExpand = new Expand({
    expandIconClass: "esri-icon-layer-list",
    view: view,
    content: layerList,
  });
  view.ui.add(layerListExpand, "top-right");

  graph_lay = new GraphicsLayer({});

  webmap.add(graph_lay);
  webmap.add(trafficLayer);
  

  watchUtils.whenFalse(view, 'stationary', function (evt) {
    if (!view.stationary && control) {
      watchUtils.whenTrueOnce(view, 'stationary', function (evt) {
        console.log("webmap.layers.items", webmap.layers.items)
        webmap.layers.items[2].visible = true;
        webmap.layers.items[3].visible = true;
        // webmap.layers.items[0].visible = false;
        getData(view.extent);
      });
    }
  });

  function getData(ex) {
    q = new Query();
    q.where = "1=1";
    q.geometry = ex;

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
        grouped = {};
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

        let yalla = [];
        let b;
        Object.keys(filtredArr).forEach(a => {
          if (a === "D1") {
            b = a + ": Alligator"
          }
          else if (a === "D2") {
            b = a + ": Transverse"
          }
          else if (a === "D3") {
            b = a + ": Longitudinal"
          }
          else if (a === "D4") {
            b = a + ": Pothole"
          }
          else if (a === "D5") {
            b = a + ": Patching"
          }
          else if (a === "D6") {
            b = a + ": Shrinkage"
          }
          else if (a === "D7") {
            b = a + ": Expansion"
          }
          else if (a === "D8") {
            b = a + ": Settling"
          }
          else {
            b = a
          }
          yalla.push({
            name: b,
            value: filtredArr[a].length
          })
        })

        setChartsData(yalla)

        setTimeout(() => {
          setStackedChartData(Object.entries(grouped));
        }, 1000);

        setTimeout(() => {
          setScatterdChart(filtredArr);
        }, 1000);

        setTimeout(() => {
          set_road_status_chart(grouped);
        }, 1000);

        setTimeout(() => {
          set_road_type_chart(grouped);
        }, 1000);

        setTimeout(() => {
          setMaxSpeedGuage(Object.values(filtredArr)[0][0].maxspeed);
        }, 1000);

        typeOfDataGrouped = Object.keys(grouped);

        setTimeout(() => {
          createCrackSelector(typeOfDataGrouped);
        }, 3000);

        setTimeout(() => {
          createRoadSelector(roadNames);
        }, 3000);


        groupedValues = Object.entries(grouped);
        groupedValues.map((group) => {
          Object.entries(group[1]).map((g) => {
            g[1].forEach((road) => {
              roadObj = new Road();
              roadObj.r_name = road.name;
              roadObj.r_fclass = road.fclass;
              roadObj.r_accuracy = parseFloat(road.Accuracy.toFixed(4));
              roadObj.r_maxSpeed = road.maxspeed;
              roadObj.r_targetID = road.TARGET_FID;
              roadObj.r_objectID = road.OBJECTID;
              roads_object_array.push(roadObj);
              maxSpeedArr.push(road.maxspeed);
              for (d = 0; d < 31000; d++) {
                if (roadObj.r_targetID > crackCount) {
                  crackCount = roadObj.r_targetID;
                }
              }
            });
          });
          return roads_object_array;
        });
      });
  }
})
  //--------------------------------------------------------------------------------------------------------
  function updateData(result) {
    let filtredArr = result.features.reduce((a, b) => {
      a[b.attributes.TypeOfData] = [
        ...(a[b.attributes.TypeOfData] || []),
        b.attributes,
      ];
      return a;
    }, {});
    groups = ["TypeOfData", "name"];
    grouped = {}
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
    let yalla = [];
    let b;
    Object.keys(filtredArr).forEach(a => {
      if (a === "D1") {
        b = a + ": Alligator"
      }
      else if (a === "D2") {
        b = a + ": Transverse"
      }
      else if (a === "D3") {
        b = a + ": Longitudinal"
      }
      else if (a === "D4") {
        b = a + ": Pothole"
      }
      else if (a === "D5") {
        b = a + ": Patching"
      }
      else if (a === "D6") {
        b = a + ": Shrinkage"
      }
      else if (a === "D7") {
        b = a + ": Expansion"
      }
      else if (a === "D8") {
        b = a + ": Settling"
      }
      else {
        b = a
      }
      yalla.push({
        name: b,
        value: filtredArr[a].length
      })
    })

    // setChartsData(yalla)

    setTimeout(() => {
      setStackedChartData(Object.entries(grouped));
    }, 1000);

    setTimeout(() => {
      setScatterdChart(filtredArr);
    }, 1000);

    setTimeout(() => {
      set_road_status_chart(grouped);
    }, 1000);

    setTimeout(() => {
      set_road_type_chart(grouped);
    }, 1000);

    setTimeout(() => {
      setMaxSpeedGuage(Object.values(filtredArr)[0][0].maxspeed);
    }, 1000);

    typeOfDataGrouped = Object.keys(grouped);

    setTimeout(() => {
      createCrackSelector(typeOfDataGrouped);
    }, 3000);

    setTimeout(() => {
      createRoadSelector(roadNames);
    }, 3000);


    groupedValues = Object.entries(grouped);
    groupedValues.map((group) => {
      Object.entries(group[1]).map((g) => {
        g[1].forEach((road) => {
          roadObj = new Road();
          roadObj.r_name = road.name;
          roadObj.r_fclass = road.fclass;
          roadObj.r_accuracy = parseFloat(road.Accuracy.toFixed(4));
          roadObj.r_maxSpeed = road.maxspeed;
          roadObj.r_targetID = road.TARGET_FID;
          roadObj.r_objectID = road.OBJECTID;
          roads_object_array.push(roadObj);
          maxSpeedArr.push(road.maxspeed);
          for (d = 0; d < 31000; d++) {
            if (roadObj.r_targetID > crackCount) {
              crackCount = roadObj.r_targetID;
            }
          }
        });
      });
      return roads_object_array;
    });
  }
  function createGraphicLayer(geo, chart_name) {
    require([
      "esri/geometry/Point",
      "esri/Graphic"
    ], function (Point, Graphic) {
      let web_map = webmap;
      let arrgraph = [];
      let views = view;
      switch (chart_name) {
        case "scatter":
          graph_lay.title = geo[0].attributes.TypeOfData;
          break;
        case "stacked":
          graph_lay.title = geo[0].attributes.name;
          break;
        default:
          graph_lay.title = "no chart name"
      }
      for (let i = 0; i < geo.length; i++) {
        pt = new Point({
          hasZ: false,
          hasM: false,
          spatialReference: views.spatialReference,
          x: geo[i].geometry.x,
          y: geo[i].geometry.y,
        });
        graph = new Graphic({
          spatialReference: views.spatialReference,
          geometry: pt,
          symbol: {
            type: "simple-marker",
            color: "#6622CC",
            size: 8,
            outline: {
              width: 0.5,
              color: "#D2A1B8",
            },
          },
        });
        arrgraph.push(graph);
      }
      graph_lay.addMany(arrgraph);
      web_map.layers.items[2].visible = false;
      web_map.layers.items[3].visible = false;
      views.goTo(graph_lay.graphics);
    });
  }

  // -------------------------------------------------------------------------------------------------------
  function setStackedChartData(grouped) {

    roadArr = [[], [], [], [], [], [], [], []]; // roads in each crack type
    arrValues = [[], [], [], [], [], [], [], []]; // values of each road in each crack type
    roadNames = []; //road names in DB'
    for (i = 0; i < grouped.length; i++) {
      for (y = 0; y < Object.keys(grouped[i][1]).length; y++) {
        roadArr[i][y] = Object.keys(grouped[i][1])[y];
      }
    }
    for (i = 0; i < grouped.length; i++) {
      for (y = 0; y < Object.keys(grouped[i][1]).length; y++) {
        arrValues[i][y] = grouped[i][1][roadArr[i][y]].length;
      }
    }
    for (i = 0; i < roadArr.length; i++) {
      for (y = 0; y < roadArr[i].length; y++) {
        if (roadNames.length == 0) {
          roadNames.push(roadArr[i][y]);
        } else {
          for (k = 0; k < roadNames.length; k++) {
            if (k != roadNames.length - 1) {
              if (roadNames[k] == roadArr[i][y]) {
                break;
              }
            } else if (k == roadNames.length - 1) {
              if (roadNames[k] == roadArr[i][y]) {
                break;
              } else {
                roadNames.push(roadArr[i][y]);
              }
            }
          }
        }
      }
    }

    var dom = document.getElementById("stacked");
    var myChart3 = echarts.init(dom, "dark", {
      renderer: "canvas",
      useDirtyRect: false,
    });
    var app = {};

    var option;

    option = {
      tooltip: {
        axisPointer: {
          type: "shadow",
        },
      },
      title: {
        text: "Cracks Number For Each Axis",

        left: "center",
      },
      xAxis: [
        {
          type: "category",
          data: typeOfDataGrouped,
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      grid: {
        top: -3,
        bottom: 22,
      },
      series: [],
    };
    for (m = 0; m < 15; m++) {
      option.series.push({
        name: roadNames[m],
        type: "bar",
        emphasis: {
          focus: "series",
        },
        data: [],
      });

      for (n = 0; n < typeOfDataGrouped.length; n++) {
        for (s = 0; s < roadArr[n].length; s++) {
          if (roadArr[n][s] == " ") {
            continue;
          } else {
            if (s == roadArr[n][s].length - 1) {
              if (option.series[m].name == roadArr[n][s]) {
                option.series[m].data.push(arrValues[n][s]);
                break;
              } else {
                option.series[m].data.push(0);
              }
            } else {
              if (option.series[m].name == roadArr[n][s]) {
                option.series[m].data.push(arrValues[n][s]);
                break;
              } else {
                continue;
              }
            }
          }
        }
      }
    }

    if (option && typeof option === "object") {
      myChart3.setOption(option);
    }

    window.addEventListener("resize", myChart3.resize);
    //stacked chart
    myChart3.on("click", (evt) => {
      control = false;

      if (graph_lay.graphics.length > 0) {
        graph_lay.graphics.removeAll();
      }
      let layer = webmap.layers.items[2];
      const queryParams = layer.createQuery();

      queryParams.outFields = ["*"];
      queryParams.returnGeometry = true;

      queryParams.where = `name = '${evt.seriesName}' AND TypeOfData = '${evt.name}'`;
      layer.queryFeatures(queryParams).then(function (results) {
        createGraphicLayer(results.features, 'stacked');
        setMaxSpeedGuage(results.features[0].attributes.maxspeeds);
        updateData(results);
        setTimeout(()=>{
          control = true;
        },2000)
      });
    })
  }

  // -----------------------------------------------------------------------------------------------------------------------------
  function setScatterdChart(grouped) {

    var dom = document.getElementById("chart-container");
    var myChart = echarts.init(dom, "dark", {
      renderer: "canvas",
      useDirtyRect: false,
    });
    var app = {};
    var option;
    option = {
      grid: {
        bottom: 22,
      },
      title: {
        text: "Cracks Number  ",
        subtext: "",
        left: "center",
        textStyle: {
          color: "#fff",
        },

      },
      tooltip: {
        trigger: "item",
      },
      xAxis: {
        type: "category",
        data: Object.keys(grouped),
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: [],
          type: "line",
          lineStyle: {
            opacity: 0,
          },
        },
      ],
    };
    var values = Object.values(grouped);

    for (s in values) {
      option.series[0].data.push(values[s].length);
    }
    if (option && typeof option === "object") {
      myChart.setOption(option);
    }
    window.addEventListener("resize", myChart.resize);

    //on click pan on map
    myChart.on('click', (evt) => {
      control = false;

      if (graph_lay.graphics.length > 0) {
        graph_lay.graphics.removeAll();
      }

      let layer = webmap.layers.items[2];
      const queryParams = layer.createQuery();

      queryParams.outFields = ["*"];
      queryParams.returnGeometry = true;

      queryParams.where = `TypeOfData = '${evt.name}'`;

      layer.queryFeatures(queryParams).then(function (results) {
        createGraphicLayer(results.features, "scatter");
        updateData(results);
        setTimeout(()=>{
          control = true;
        },2000)
      });
    })
  }
  //-----------------------------------------------------------------------------------------------------------------------------------------------
  function setChartsData(filtredArr) {
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
        orient: "horizontal",
        bottom: "bottom",
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: ["20%", "33%"],
          color: [
            "#36AE7C",
            "#FF7F3F",
            "#AB46D2",
            "#9ED763",
            "#FF7396",
            "#FBDF07",
            "#EB5353",
            "#3AB0FF",
          ],

          data: filtredArr,
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

    if (option && typeof option === "object") {
      myChart2.setOption(option);
    }

    window.addEventListener("resize", myChart2.resize);
  }
  // -------------------------------------------------------------------------------------------------------------------
  function setMaxSpeedGuage(speed) {
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
          max: 220,
          name: "Max Speed",
          type: "gauge",
          radius: "96%",
          progress: {
            show: true,
          },
          detail: {
            valueAnimation: true,
            formatter: "{value}",
          },
          data: [
            {
              value: speed,
            },
          ],
        },
      ],
    };
    if (option && typeof option === "object") {
      myChart4.setOption(option);
    }

    window.addEventListener("resize", myChart4.resize);
  }
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
    return valOnRadian;
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
    var avgacc = 0;
    for (i = 0; i < roadNames.length; i++) {
      avgacc += roadObj.r_accuracy;
    }
    avgacc /= roadNames.length;
    var nextSource = [[1, avgacc.toFixed(1)]];
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
    if (valOnRadian < 1000) {
      return valOnRadian;
    } else if (valOnRadian >= 1000) {
      return (valOnRadian / 1000).toFixed(1) + "k";
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
    var nextSource = [[1, crackCount]];

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
  // ----------------------------------------------------------------------------------------------------------------
  function set_road_status_chart() {
    var dom = document.getElementById("road_status");
    var myChart7 = echarts.init(dom, "dark", {
      renderer: "canvas",
      useDirtyRect: false,
    });
    var app = {};

    let roadValuesObj = { name: roadNames, values: [] };
    for (x = 0; x < roadNames.length; x++) {
      if (roadNames[x] == " ") {
        continue;
      } else {
        var cracksSumForEachRoad = 0;
        for (l = 0; l < roadArr.length; l++) {
          for (s = 0; s < roadArr[l].length; s++) {
            if (roadNames[x] == roadArr[l][s]) {
              cracksSumForEachRoad += arrValues[l][s];
              roadValuesObj.values[x] = cracksSumForEachRoad;
            }
          }
        }
      }
    }
    var valuesSorted = [];
    valuesSorted = roadValuesObj.values.sort(function (a, b) {
      return b - a;
    });
    var option;

    const data = [];
    // for (let i = 0; i < 5; ++i) {
    //   data.push(Math.round(Math.random() * 200));
    // }
    option = {
      grid: {
        left: 130,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: {
        type: "value",
        interval: 100,
      },
      yAxis: {
        type: "category",
        data: roadNames,
        inverse: true,
      },
      visualMap: {
        orient: "horizontal",
        left: "center",
        min: 10,
        max: 100,
        dimension: 0,
        inRange: {
          color: [
            "#95e253",
            "#9cdc50",
            "#c4b33f",
            "#dc9c35 ",
            "#e59331",
            "#e38433",
            "#e17534",
            "#da4d37",
            "#d52a3a",
          ],
        },
      },
      series: [
        {
          data: valuesSorted,
          type: "bar",
        },
      ],
    };
    if (option && typeof option === "object") {
      myChart7.setOption(option);
    }
    window.addEventListener("resize", myChart7.resize);
    //click event
    myChart7.on("click", (evt) => {
      control = false;

      if (graph_lay.graphics.length > 0) {
        graph_lay.graphics.removeAll();
      }
      let layer = webmap.layers.items[2];
      const queryParams = layer.createQuery();

      queryParams.outFields = ["*"];
      queryParams.returnGeometry = true;

      queryParams.where = `name = '${evt.name}'`;
      layer.queryFeatures(queryParams).then(function (results) {
        createGraphicLayer(results.features, 'stacked');
        setMaxSpeedGuage(results.features[0].attributes.maxspeeds);
        updateData(results);
        setTimeout(()=>{
          control = true;
        },5000)
      });
    })
  }
  // -------------------------------------------------------------------------------------------------------------------
  function set_road_type_chart(grouped) {
    var dom = document.getElementById("road_type");
    var myChart8 = echarts.init(dom, "dark", {
      renderer: "canvas",
      useDirtyRect: false,
    });
    var app = {};

    var option;
    const seriesLabel = {
      show: true,
    };
    option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      legend: {
        data: ["Primary", "Secondary", "Motorway"],
      },
      grid: {
        left: 120,
      },
      xAxis: {
        interval: 5,
        type: "value",
        axisLabel: {
          formatter: "{value}",
        },
      },
      yAxis: {
        max: 25,
        type: "category",
        inverse: true,
        data: roadNames,
        axisLabel: {
          formatter: function (value) {
            return value;
          },
          margin: 20,
          rich: {
            value: {
              lineHeight: 0,
              verticalAlign: "bottom",
            },
          },
        },
      },
      series: [],
    };
    for (l = 0; l < roadNames.length; l++) {
      option.series.push(
        {
          name: "Primary",
          type: "bar",
          color: "#7a61ba",
          data: [],
        },
        {
          name: "Secondary",
          type: "bar",
          color: "#f5c767",
          data: [],
        },
        {
          name: "Motorway",
          type: "bar",
          color: "#39a767",
          data: [],
        }
      );
    }

    for (i = 0; i < roads_object_array.length; i++) {
      roads_type_object = new roadTypeClass();
      if (!roads_type_object.road_name.includes(roads_object_array[i].r_name)) {
        roads_type_object.primary_road = 0;
        roads_type_object.sec_road = 0;
        roads_type_object.motor_road = 0;
      }
      if (roads_object_array[i].r_name == " ") {
        continue;
      } else {
        for (j = 0; j < roads_object_array[i].r_name.length; j++) {
          roads_type_object.road_name = roads_object_array[i].r_name;
          if (roads_object_array[i].r_fclass == "primary") {
            roads_type_object.primary_road++;
          } else if (roads_object_array[i].r_fclass == "secondary") {
            roads_type_object.sec_road++;
          } else if (roads_object_array[i].r_fclass == "motorway") {
            roads_type_object.motor_road++;
          }
        }
      }
      for (h = 0; h < roadNames.length; h++) {
        if (roads_type_object.road_name == roadNames[h]) {
          if (roads_type_object.primary_road != 0) {
            option.series[0].data.push(roads_type_object.primary_road);
          } else if (roads_type_object.sec_road != 0) {
            option.series[1].data.push(roads_type_object.sec_road);
          } else if (roads_type_object.motor_road != 0) {
            option.series[2].data.push(roads_type_object.motor_road);
          } else {
            continue;
          }
        }
      }
    }
    if (option && typeof option === "object") {
      // myChart8.clear()
      myChart8.setOption(option);
    }

    window.addEventListener("resize", myChart8.resize);

    //click event
    myChart8.on("click", (evt) => {
      console.log(" in chart 8", evt)
      control = false;

      if (graph_lay.graphics.length > 0) {
        graph_lay.graphics.removeAll();
      }
      let layer = webmap.layers.items[2];
      const queryParams = layer.createQuery();

      queryParams.outFields = ["*"];
      queryParams.returnGeometry = true;

      queryParams.where = `name = '${evt.name}' AND fclass = '${evt.seriesName}'`;
      layer.queryFeatures(queryParams).then(function (results) {
        createGraphicLayer(results.features);
        updateData(results);
        setTimeout(()=>{
          control = true;
        },5000)
      });
    })
  }
  // ----------------------------------------------------------------------------
  function createCrackSelector(array) {
    document.getElementById("CrackSelector").textContent = " ";
    var select = document.getElementById("CrackSelector");
    for (let i = 0; i < array.length; i++) {
      let opt = array[i];
      let el = document.createElement("li");
      el.setAttribute("class", "dropdown-item");
      el.setAttribute("id", "chart");
      el.textContent = opt;
      el.value = opt;
      select.appendChild(el);
    }


    document.getElementById("chart").addEventListener("click", function (e) {

      if (graph_lay.graphics.length > 0) {
        graph_lay.graphics.removeAll();
      }

      let layer = webmap.layers.items[2];
      const queryParams = layer.createQuery();

      queryParams.outFields = ["*"];
      queryParams.returnGeometry = true;

      queryParams.where = `TypeOfData = '${e.target.innerText}'`;

      layer.queryFeatures(queryParams).then(function (results) {
        createGraphicLayer(results.features, 'scatter');
        updateData(results.features)
      });
    });

  }
  // ----------------------------------------------------------------------------
  function createRoadSelector(array) {
    document.getElementById("RoadSelector").textContent = " ";
    let x = document.createElement("form")
    x.setAttribute("class", "d-flex")
    var select = document.getElementById("RoadSelector");
    for (let i = 0; i < array.length; i++) {
      let opt = array[i];
      let el = document.createElement("li");
      el.setAttribute("class", "dropdown-item");
      el.setAttribute("id", "roadchart");
      el.textContent = opt;
      el.value = opt;
      select.appendChild(el);
    }
    document.getElementById("roadchart").addEventListener("click", function (e) {
      control = false;
      if (graph_lay.graphics.length > 0) {
        graph_lay.graphics.removeAll();
      }

      let layer = webmap.layers.items[2];
      const queryParams = layer.createQuery();

      queryParams.outFields = ["*"];
      queryParams.returnGeometry = true;

      queryParams.where = `name = '${e.target.innerText}'`;

      layer.queryFeatures(queryParams).then(function (results) {
        createGraphicLayer(results.features, 'stacked');
        setMaxSpeedGuage(results.features.attributes.maxspeeds)
        updateData(results.features);
      });
    })
  }

