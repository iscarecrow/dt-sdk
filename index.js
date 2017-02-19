/*
@说明：产品级公用js文件，产品级公用js 方法，js调用原生Sdk
@作者：hugin<hxjlucky@gmail.com>
@时间：2015-04-09
*/
(function(){
  var globalbridge;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var DtSdk = {};
  DtSdk.VERSION = '1.2';
  DtSdk.cachedata = {};
  // sdk ready, 所有方法写在ready内部
  DtSdk.ready = function(callback) {
    if (isDuitang()){
        if (window.WebViewJavascriptBridge) {
        callback();
      } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function() {
          callback();
        }, false);
      }
    } else {
      callback();
    }
  };

  // js调用原生
  // 广播, 关闭当前页面，打开新页面带数据，支付，判断是否登陆，登陆模态组件，设置导航栏，打点，弹框，分享，评论，赞，喜欢
  // 图片浏览，选择专辑，标题，本地请求，设备信息，地址选择，日志，回退hook
  // 音乐支持，页面load等功能

  // 具体fn name 去除
  DtSdk.fn = function(data, callback) {
    _callHandler('fn', data, callback);
  };

  DtSdk.responseNotification = [ ];

  //1.2 version start
  DtSdk.responseNavigationButtonsClick = function(params) {
  };
   //1.2 version end

  // Native call js function start
  function _callHandler(method, data, callback) {
    if (typeof data !== 'object') {
      if (typeof callback !== 'function') {
        callback = data;
        data = {
          "method": method
        };
      }
    } else {
      if (isEmpty(data)) {
        data = {
          "method": method,
        };
      } else {
        var cacheData = data;
        data = {
          "method": method,
          "params": cacheData
        };
      }
    }
    var dataString = JSON.stringify(data);

    if (globalbridge) {
      globalbridge.callHandler('duitangSDKHandler', dataString, function(response) {
        var jsn = isObject(response) ? response : JSON.parse(response);
        callback(jsn);
      });
    } else {
      console.log('sdk is not ready');
    }

  }
  // Native call js function end

  function isEmpty(obj) {
    if (obj === null) return true;
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
  }

  function isObject(item) {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
  }

  function isDuitang() {
    var ua, r;
    ua = navigator.userAgent.toLowerCase();
    r = /(duitang)/ig;
    return r.test(ua) ? true : false;
  }

  // connect to iOS
  function connectWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
      callback(WebViewJavascriptBridge);
    } else {
      document.addEventListener('WebViewJavascriptBridgeReady', function() {
        callback(WebViewJavascriptBridge);
      }, false);
    }
  }

  connectWebViewJavascriptBridge(function(bridge) {
    globalbridge = bridge;
    bridge.init(function(message, responseCallback) {
      var data = {
        'Javascript Responds': 'init!'
      };
      responseCallback(data);
    });


    bridge.registerHandler("_callNavtiveHandler", function(response) {
      var jsn = isObject(response) ? response : JSON.parse(response);
      var method = jsn.method || '';
      var params = jsn.params;
      var _data;
      switch (method) {
        case 'init':
          DtSdk.cachedata = params.data;
          break;
        case 'postNotification':
          if(typeof(DtSdk.responseNotification) === 'function'){
            DtSdk.responseNotification(params);
          }else if(typeof(DtSdk.responseNotification) === 'object'){
             for (var i = DtSdk.responseNotification.length - 1; i >= 0; i--) {
              DtSdk.responseNotification[i](params);
             }
          }
          break;
        case 'onNavigationBarRightButtonClick':
          DtSdk.responseNavigationClick(params);
          break;
          //1.2 version start
        case 'onNavigationBarButtonsClick':
          DtSdk.responseNavigationButtonsClick(params);
          break;
          //1.2 version end
        default:

      }
    });
  });

  if (typeof define === 'function' && define.amd) {
    define('DtSdk', [], function() {
      //因为dttrac打点的需要，dtsdk挂载到window下
      window.DtSdk = DtSdk;
      return DtSdk;
    });
  } else {
    window.DtSdk = DtSdk;
  }

}.call(this));
