"use strict";

function toQuery(obj) {
  var str = "";

  for (var key in obj) {
    if (str != "") {
      str += "&";
    }

    str += key + "=" + encodeURIComponent(obj[key]);
  }

  return str;
}

function printSystemInfo() {
  window.logData = {};
  window.logData.prj = window.zprj; // print system info

  var ua = navigator.userAgent,
      logMsg = ''; // device & system

  var ipod = ua.match(/(ipod).*\s([\d_]+)/i),
      ipad = ua.match(/(ipad).*\s([\d_]+)/i),
      iphone = ua.match(/(iphone)\sos\s([\d_]+)/i),
      android = ua.match(/(android)\s([\d\.]+)/i);
  logMsg = 'Unknown';

  if (android) {
    logMsg = 'Android ' + android[2];
  } else if (iphone) {
    logMsg = 'iPhone, iOS ' + iphone[2].replace(/_/g, '.');
  } else if (ipad) {
    logMsg = 'iPad, iOS ' + ipad[2].replace(/_/g, '.');
  } else if (ipod) {
    logMsg = 'iPod, iOS ' + ipod[2].replace(/_/g, '.');
  }

  var templogMsg = logMsg; // wechat client version

  var version = ua.match(/MicroMessenger\/([\d\.]+)/i);
  logMsg = 'Unknown';

  if (version && version[1]) {
    logMsg = version[1];
    templogMsg += ', WeChat ' + logMsg;
    console.info('[system]', 'System:', templogMsg);
    window.logData.system = templogMsg;
  } else {
    console.info('[system]', 'System:', templogMsg);
    window.logData.system = templogMsg;
  } // HTTP protocol


  logMsg = 'Unknown';

  if (location.protocol == 'https:') {
    logMsg = 'HTTPS';
  } else if (location.protocol == 'http:') {
    logMsg = 'HTTP';
  } else {
    logMsg = location.protocol.replace(':', '');
  }

  templogMsg = logMsg; // network type

  var network = ua.toLowerCase().match(/ nettype\/([^ ]+)/g);
  logMsg = 'Unknown';

  if (network && network[0]) {
    network = network[0].split('/');
    logMsg = network[1];
    templogMsg += ', ' + logMsg;
    console.info('[system]', 'Network:', templogMsg);
    window.logData.network = templogMsg;
  } else {
    console.info('[system]', 'Protocol:', templogMsg);
    window.logData.protocol = templogMsg;
  } // performance related
  // use `setTimeout` to make sure all timing points are available


  setTimeout(function () {
    var performance = window.performance || window.msPerformance || window.webkitPerformance;

    if (performance && performance.getEntriesByType("resource")) {
      var arrTiming = performance.getEntriesByType("resource");

      if (arrTiming.length > 0) {
        var dataResource = [];
        arrTiming.map(function (e) {
          dataResource.push({
            name: e.name,
            time: e.duration
          });
        }); //reorder

        dataResource = dataResource.sort(function (a, b) {
          return a.time < b.time ? 1 : b.time < a.time ? -1 : 0;
        });
        dataResource = dataResource.splice(0, 40); //set data

        window.logData.dataResource = JSON.stringify(dataResource);
      }
    } // timing


    if (performance && performance.timing) {
      var t = performance.timing;

      if (t.navigationStart) {
        console.info('[system]', 'navigationStart:', t.navigationStart);
        window.logData.navigationStart = t.navigationStart;
      }

      if (t.navigationStart && t.domainLookupStart) {
        console.info('[system]', 'navigation:', t.domainLookupStart - t.navigationStart + 'ms');
        window.logData.navigation = t.domainLookupStart - t.navigationStart;
      }

      if (t.domainLookupEnd && t.domainLookupStart) {
        console.info('[system]', 'dns:', t.domainLookupEnd - t.domainLookupStart + 'ms');
        window.logData.dns = t.domainLookupEnd - t.domainLookupStart;
      }

      if (t.connectEnd && t.connectStart) {
        if (t.connectEnd && t.secureConnectionStart) {
          console.info('[system]', 'tcp (ssl):', t.connectEnd - t.connectStart + 'ms (' + (t.connectEnd - t.secureConnectionStart) + 'ms)');
          window.logData.tcp = t.connectEnd - t.connectStart;
        } else {
          console.info('[system]', 'tcp:', t.connectEnd - t.connectStart + 'ms');
          window.logData.tcp = t.connectEnd - t.connectStart;
        }
      }

      if (t.responseStart && t.requestStart) {
        console.info('[system]', 'request:', t.responseStart - t.requestStart + 'ms');
        window.logData.request = t.responseStart - t.requestStart;
      }

      if (t.responseEnd && t.responseStart) {
        console.info('[system]', 'response:', t.responseEnd - t.responseStart + 'ms');
        window.logData.response = t.responseEnd - t.responseStart;
      }

      if (t.domComplete && t.domLoading) {
        if (t.domContentLoadedEventStart && t.domLoading) {
          console.info('[system]', 'domComplete (domLoaded):', t.domInteractive - t.domLoading + 'ms (' + (t.domContentLoadedEventStart - t.domLoading) + 'ms)');
        } else {
          console.info('[system]', 'domComplete:', t.domInteractive - t.domLoading + 'ms');
        }
      }

      window.logData.domComplete = t.domInteractive - t.domLoading;

      if (t.loadEventEnd && t.loadEventStart) {
        console.info('[system]', 'loadEvent:', t.loadEventEnd - t.loadEventStart + 'ms');
        window.logData.loadEvent = t.loadEventEnd - t.loadEventStart;
      }

      if (t.navigationStart && t.loadEventEnd) {
        console.info('[system]', 'total (DOM):', t.loadEventEnd - t.navigationStart + 'ms (' + (t.domComplete - t.navigationStart) + 'ms)');
        window.logData.total = t.loadEventEnd - t.navigationStart;
      }

      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", "https://webqos.api.zaloapp.com/qos", true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.send(toQuery(window.logData));
    }
  }, 0);
}

function getUserAgent() {
  try {
    return window.navigator ? window.navigator.userAgent : "";
  } catch (e) {}

  return "";
}

function getCookie() {
  try {
    return document.cookie ? document.cookie : "";
  } catch (e) {}

  return "";
}

window.addEventListener("load", function (event) {
  setTimeout(function () {
    printSystemInfo();
  }, 10000);
});
window.addEventListener('error', function (event) {
  var data = {};
  data.prj = window.zprj;
  data.message = event.message + " | " + getUserAgent();
  if (window.gameId) {
      data.message += " | " + window.gameId;
  }
  data.filename = event.filename;
  data.lineno = event.lineno;
  data.colno = event.colno;

  if (!data.message || data.message == null || data.message == 'Script error.') {
    return;
  } else if (data.message.includes('onScreenPaused') || data.message.includes('onScreenResumed') || data.message.includes('webviewInvisible')) {
    return;
  }

  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "https://webqos.api.zaloapp.com/err", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(toQuery(data));
});