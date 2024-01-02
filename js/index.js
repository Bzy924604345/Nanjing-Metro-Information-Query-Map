// #region 地图界面加载
var map = new AMap.Map('map', {
  mapStyle: "amap://styles/whitesmoke",
  viewMode: '3D', // 默认使用 2D 模式，如果希望使用带有俯仰角的 3D 模式，请设置 viewMode: '3D'
  zoom: 12, // 初始化地图层级
  center: [118.83333, 32.05000] // 初始化地图中心点
});

//异步加载控件-缩放控件
AMap.plugin('AMap.ToolBar', function () {
  var toolbar = new AMap.ToolBar({
    visible: true,
    position: {
      top: '110px',
      right: '40px'
    }
  }); //缩放工具条实例化
  map.addControl(toolbar);
});

//异步加载控件-比例尺
AMap.plugin('AMap.Scale', function () {
  var scale = new AMap.Scale({
    visible: true
  });
  map.addControl(scale);
});

//异步加载控件-指南针
AMap.plugin('AMap.ControlBar', function () {
  var controlBar = new AMap.ControlBar({
    visible: true,
    position: {
      top: '10px',
      right: '10px'
    }
  });
  map.addControl(controlBar);
});

//异步加载控件-鹰眼图
AMap.plugin('AMap.HawkEye', function () {
  var hawkEye = new AMap.HawkEye({
    visible: true
  })
  map.addControl(hawkEye);
});

// 异步加载控件-切换底图
AMap.plugin('AMap.MapType', function () {
  var maptype = new AMap.MapType({
    visible: true,
    position: {
      bottom: '490px',
      right: '15px'
    }
  })
  map.addControl(maptype);
});

// #endregion

// #region 请求数据函数
function getWFSData(layer, searchParam) {
  return axios.get('http://localhost:8090/geoserver/webgis_test/ows?', {
    params: {
      service: 'WFS',
      version: '1.3.0',
      request: 'GetFeature',
      typeName: 'webgis_test:' + layer,
      outputFormat: 'application/json',
      cql_filter: searchParam
    }
  })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}
// #endregion

// #region 全局显示
// 绘制地铁全图
function renderWholeSubway() {
  getWFSData('nj_2022_station_gcj02_4326', 'name IS NOT NULL')
    .then(data => {
      var features = data.features;
      renderStationgeometry(features);
    })

  getWFSData('nj_2022_subway_4326_gcj02_l', 'name IS NOT NULL')
    .then(data => {
      var features = data.features;
      renderSingleSubwaygeometry(features);
      map.setFitView(); // 设置地图视图适应数据范围
    })
}

var polylineList = [];
// 绘制地铁线路
function renderSingleSubwaygeometry(features) {
  features.forEach(feature => {
    var geometry = feature.geometry.coordinates;
    geometry.forEach(line => {
      var strokecolor;

      if (feature.properties.name === '南京地铁10号线') {
        strokecolor = "#eac183";
      } else if (feature.properties.name === '南京地铁1号线') {
        strokecolor = "#12a3ed";
      } else if (feature.properties.name === '南京地铁2号线') {
        strokecolor = "#cd0640";
      } else if (feature.properties.name === '南京地铁3号线') {
        strokecolor = "#0c9852";
      } else if (feature.properties.name === '南京地铁4号线') {
        strokecolor = "#776cae";
      } else if (feature.properties.name === '南京地铁S1号线') {
        strokecolor = "#48b7b3";
      } else if (feature.properties.name === '南京地铁S3号线') {
        strokecolor = "#bb84ac";
      } else if (feature.properties.name === '南京地铁S6号线') {
        strokecolor = "#88a4d4";
      } else if (feature.properties.name === '南京地铁S7号线') {
        strokecolor = "#eb9c98";
      } else if (feature.properties.name === '南京地铁S8号线') {
        strokecolor = "#ef9f5b";
      } else if (feature.properties.name === '南京地铁S9号线') {
        strokecolor = "#fba00c";
      }

      var polyline = new AMap.Polyline({
        path: line,
        strokeColor: strokecolor,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        cursor: 'crosshair',
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 50,
        extData: feature.properties
      });

      // 添加交互事件
      polyline.on('mouseover', function (event) {
        event.target.setOptions({
          isOutline: true,
          borderWeight: 1,
          outlineColor: 'red'
        })
      });

      polyline.on('click', function (event) {
        var lnglat = event.lnglat
        var content = [
          '<div style="position: relative; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); background-color: rgba(240, 240, 240, 0.8);;">' +
          '<div style="font-size: 16px; font-weight: bold; color: #333;">' + feature.properties.name + '</div>' +
          '<div style="color: #555;">地铁总长：' + feature.properties.sum_length + 'km</div>' +
          '<div style="position: absolute; bottom: -15px; left: 50%; margin-left: -10px; width: 0; height: 0; border-style: solid; border-width: 15px 10px 0; border-color: #bdbdbd transparent transparent transparent;"></div>' +
          '</div>'
        ];
        var infoWindow = new AMap.InfoWindow({
          isCustom: true,
          content: content,
          position: lnglat,
          closeWhenClickMap: true,
          offset: [0, -15]
          // offset: new AMap.Pixel(0, 0) // 设置信息窗口偏移位置，以确保不遮挡地图上的标记
        });

        infoWindow.open(map);
      });

      polyline.on('mouseout', function (event) {
        event.target.setOptions({
          isOutline: false
        })
      })
      map.add(polyline)
      polylineList.push(polyline)
    })
  })
}

var labelsLayer = new AMap.LabelsLayer();
// 绘制地铁站点
function renderStationgeometry(features) {
  // 创建点标记图层
  labelsLayer = new AMap.LabelsLayer({
    zooms: [3, 20],
    zIndex: 1000,
    collision: true,  // 该层内标注是否避让
    allowCollision: true, // 设置 allowCollision：true，可以让标注避让用户的标注
  });
  map.add(labelsLayer);

  var markers = [];

  features.forEach(feature => {
    const icon = {
      type: 'image', // 图标类型，现阶段只支持 image 类型
      image: '../data/地铁站 (2).jpg',
      size: [24, 24],
      anchor: 'center', // 图片相对 position 的锚点，默认为 bottom-center 
    };

    const text = {
      content: feature.properties.name, // 要展示的文字内容
      direction: 'top', // 文字方向，有 icon 时为围绕文字的方向，没有 icon 时，则为相对 position 的位置
      offset: [0, 0], // 在 direction 基础上的偏移量
      style: { // 文字样式       
        fontSize: 12,// 字体大小        
        fillColor: '#22886f', // 字体颜色  
        strokeColor: '#fff', // 描边颜色
        strokeWidth: 2,  // 描边宽度
      }
    }

    var geometry = feature.geometry.coordinates;

    const labelMarker = new AMap.LabelMarker({
      name: feature.properties.name, // 此属性非绘制文字内容，仅最为标识使用
      position: [geometry[0], geometry[1]],
      zIndex: 16,
      icon: icon, // 将第一步创建的 icon 对象传给 icon 属性
      text: text,// 将第二步创建的 text 对象传给 text 属性
      extData: feature.properties
    });

    markers.push(labelMarker)

    // labelMarker.on('mouseover', function () {
    //   labelMarker.setIcon({
    //     size: [32, 32]
    //   })
    // });

    labelMarker.on('click', function (event) {
      labelMarker.setIcon({
        size: [40, 40]
      }
      )
      var position = [geometry[0], geometry[1]];

      if (position) {
        contentMarker.setContent(
          '<div style="font-family: Arial, sans-serif; background-color: #ffffff; border: 1px solid #cccccc; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">' +
          '<div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">经停地铁：' + '<br>' + feature.properties.address + '</div>' +
          '<div style="color: #007BFF; margin-bottom: 5px;">市辖区：' + feature.properties.adname + '</div>' +
          '<div>经纬度：' + position + '</div>' +
          '</div>')

        contentMarker.setPosition(position);
        map.add(contentMarker);
      }
    });

    // labelMarker.on('mouseout', function () {
    //   labelMarker.setIcon({
    //     size: [24, 24]
    //   })
    // });

    map.on('click', function () {
      map.remove(contentMarker);
      labelMarker.setIcon({
        size: [24, 24]
      })
    });
  });

  // 一次性将海量点添加到图层
  labelsLayer.add(markers);

  // 普通点
  var contentMarker = new AMap.Marker({
    anchor: 'bottom-center',
    offset: [0, 160],
  });
}

// #endregion 全局显示

// #region 查询地铁线/站
function searchSubway() {
  var searchParam = document.querySelector('.searchContainer .input').value;
  var search_results_container = document.querySelector('.search_results_container');

  var labelMarkers = labelsLayer.getAllOverlays()
  search_results_container.innerHTML = '';

  labelMarkers.forEach(labelMarker => {
    var target_name = labelMarker.getName()
    // 使用 includes 方法进行模糊查询
    if (target_name.includes(searchParam)) {
      var resultContainer = document.createElement('div');
      resultContainer.classList.add('result_items');

      var content = '<div class="row1">' +
        '<div class="restaurant_name">' + target_name + '</div>' +
        '<div class="cuisine">地铁站</div>' +
        '</div>' +
        '<div class="row2">' +
        '<span class="score">经停地铁：' + labelMarker.getExtData().address + '</span>' +
        '<div class="per">市辖区：' + labelMarker.getExtData().adname + '</div>' +
        '</div>' +
        '<div class="row3">' +
        '<div class="address">经纬度：' + labelMarker.getPosition() + '</div>' +
        '</div>' +
        '<div class="horizontal-line"></div>';

      // 将内容添加到 resultContainer 中
      resultContainer.innerHTML = content;

      // 将 resultContainer 添加到 search_results_container 中
      search_results_container.appendChild(resultContainer);

      resultContainer.addEventListener('click', function () {
        map.setZoomAndCenter(14, labelMarker.getPosition(), false, 600);
        labelMarker.setIcon({
          size: [40, 40]
        })
        var position = labelMarker.getPosition()

        var contentMarker = new AMap.Marker({
          anchor: 'bottom-center',
          offset: [0, 160],
        });

        if (position) {
          contentMarker.setContent(
            '<div style="font-family: Arial, sans-serif; background-color: #ffffff; border: 1px solid #cccccc; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">' +
            '<div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">经停地铁：' + '<br>' + labelMarker.getExtData().address + '</div>' +
            '<div style="color: #007BFF; margin-bottom: 5px;">市辖区：' + labelMarker.getExtData().adname + '</div>' +
            '<div>经纬度：' + position + '</div>' +
            '</div>')

          contentMarker.setPosition(position);
          map.add(contentMarker);

          // 取消选中
          map.on('click', function () {
            labelMarker.setIcon({
              size: [24, 24]
            })

            map.remove(contentMarker);
          })
        }
      });
    }
  })

  polylineList.forEach(polyline => {
    var target_name = polyline.getExtData().name
    // 使用 includes 方法进行模糊查询
    if (target_name.includes(searchParam)) {
      var resultContainer = document.createElement('div');
      resultContainer.classList.add('result_items');

      var content = '<div class="row1">' +
        '<div class="restaurant_name">' + target_name + '</div>' +
        '<div class="cuisine">地铁线</div>' +
        '</div>' +
        '<div class="row3">' +
        '<div class="address">地铁总长：' + polyline.getExtData().sum_length + '</div>' +
        '</div>' +
        '<div class="horizontal-line"></div>'


      // 将内容添加到 resultContainer 中
      resultContainer.innerHTML = content;

      // 将 resultContainer 添加到 search_results_container 中
      search_results_container.appendChild(resultContainer);

      resultContainer.addEventListener('click', function () {
        // 将地图缩放至中心点
        var bounds = polyline.getBounds()
        var boundsCenter = bounds.getCenter();

        map.setBounds(bounds);

        polyline.setOptions({
          isOutline: true,
          borderWeight: 1,
          outlineColor: 'red'
        })

        var content = [
          '<div style="position: relative; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); background-color: rgba(240, 240, 240, 0.8);;">' +
          '<div style="font-size: 16px; font-weight: bold; color: #333;">' + polyline.getExtData().name + '</div>' +
          '<div style="color: #555;">地铁总长：' + polyline.getExtData().sum_length + 'km</div>' +
          '</div>'
        ];
        var infoWindow = new AMap.InfoWindow({
          isCustom: true,
          content: content,
          position: boundsCenter,
          closeWhenClickMap: true,
          offset: [0, -15]
          // offset: new AMap.Pixel(0, 0) // 设置信息窗口偏移位置，以确保不遮挡地图上的标记
        });

        infoWindow.open(map);

        map.on('click', function () {
          polyline.setOptions({
            isOutline: false
          })
          console.log(11)
          map.remove(infoWindow);
        })

      })
    }
  })
}

// #endregion 查询地铁线/站

// #region 分析


var density_button = document.querySelector('.density_button')
var density_results_container = document.querySelector('.density_results_container')
var buffer_button = document.querySelector('.buffer_button')
var buffer_results_container = document.querySelector('.buffer_results_container')

var loca = new Loca.Container({
  map
});

// 点击按钮出现弹窗
density_button.addEventListener('click', function (event) {
  buffer_results_container.style.animation = 'resultsOut 0.5s ease';
  buffer_results_container.style.display = 'none';

  density_results_container.style.display = 'block';
  density_results_container.style.animation = 'resultsIn 0.5s ease';

  buffer_button.classList.remove('button_clicked')
  density_button.classList.toggle('button_clicked')

  // 渲染图层
  if (density_button.classList.contains('button_clicked')) {
    clearcircleList()
    renderHeatmap()
  }
})

buffer_button.addEventListener('click', function (event) {
  density_results_container.style.animation = 'resultsOut 0.5s ease';
  density_results_container.style.display = 'none';

  buffer_results_container.style.display = 'block';
  buffer_results_container.style.animation = 'resultsIn 0.5s ease';

  density_button.classList.remove('button_clicked')
  buffer_button.classList.toggle('button_clicked')

  if (buffer_button.classList.contains('button_clicked')) {
    renderBuffer()
  }

})

function renderHeatmap() {
  const height = parseFloat(document.querySelector('#height').value)
  const radius = parseFloat(document.querySelector('#radius').value);
  loca.clear();
  clearcircleList()

  getWFSData('nj_2022_station_gcj02_4326', 'name IS NOT NULL')
    .then(data => {
      var geo = new Loca.GeoJSONSource({
        data
      });

      var heatmap = new Loca.HeatMapLayer({
        zIndex: 10,
        opacity: 1,
        visible: true,
        zooms: [2, 22],
      });

      heatmap.setSource(geo, {
        radius: radius,
        unit: 'px',
        height: height,
        gradient: {
          0.1: 'rgba(55,80,147,1)',
          0.2: 'rgba(112,145,199,1)',
          0.3: 'rgba(200,214,231,1)',
          0.4: 'rgba(236,208,180,1)',
          0.5: 'rgba(219,162,125,1)',
          0.6: 'rgba(193,109,88,1)',
          0.8: 'rgba(161,61,59,1)',
          1: 'rgba(131,26,33,1)',
        },
        value: 1,
        min: 0,
        max: 6,
        // heightBezier: [0, .53, .37, .98],
      });
      loca.add(heatmap);

      // 淡入淡出
      map.on('viewchange', function () {
        var z = map.getZoom();
        var outZ = 18;
        // 14 - 16 级别淡出
        heatmap.setOpacity(1 - (z - 14) / (outZ - 14));
      });
    })
}
var circleList = []

function renderBuffer() {
  const buffer_radius = parseFloat(document.querySelector('#buffer_radius').value);
  const colorPicker = document.querySelector('#colorPicker').value;

  clearcircleList()
  loca.clear();

  getWFSData('nj_2022_station_gcj02_4326', 'name IS NOT NULL')
    .then(data => {
      data.features.forEach(feature => {
        var geometry = feature.geometry.coordinates
        var position = [geometry[0], geometry[1]]

        var center = position;
        var radius = buffer_radius;

        var circle = new AMap.Circle({
          center: center, //圆心
          radius: radius, //半径
          strokeWeight: 1,
          strokeColor: '#cdcdcd',
          strokeOpacity: 0.5,
          fillOpacity: 0.3, //圆形填充透明度
          fillColor: colorPicker, //圆形填充颜色
          zIndex: 50, //圆形覆盖物的叠加顺序
        });
        circleList.push(circle)
        map.add(circle);
      })
    })
}

function clearcircleList() {
  circleList.forEach(circle => {
    circle.destroy()
  })
}
// #endregion 分析









