var search_keywords = [];
var search_websites = [];
var open_windows = new Map();
var intervalID;

window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

String.prototype.deobfuscate = function () {
    var arr = this.split('\u1005');
    return arr.map(function(c) { 
        return String.fromCharCode(parseInt(c, 16))
    }).reduce(function(a, b) {return a  + b})
}

function readVideos(videos) {
  var txt = new XMLHttpRequest();
  txt.onerror = function(e) {
    printMessage('无法获得最新视频。');  	
  };
  txt.onreadystatechange = function() {
	if(txt.readyState === 4 && (txt.status === 200 || txt.status == 0)) {
	    var allText = txt.responseText;
		if (allText) {
			lines = allText.split("\n"); 
			for(var line of lines){ 
				if(line.startsWith("#")) {
					continue;
				}
	  	  videos.video_urls = videos.video_urls.concat(line);
			}
			videos.video_urls = videos.video_urls.filter(function(video_urls) {
			  return video_urls && video_urls.includes('|');
			});
			// videos.video_urls.reverse();
		    return;
	    }
	}
  }
  try {
	txt.open("GET", videos.file_path, /*async=*/false);
	txt.send(null);
  } catch (error) {
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function init1005() {
  var is_weixin = (function(){return navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1})();
  if(is_weixin){
	  printMessage('检查到您是在微信中打开本网站，将无法正常使用网站，请用Chrome浏览器直接打开网站。');
	  document.querySelectorAll("button.search").forEach(button => {
		  button.disabled = true;}
	  );
	  return;
  }

  if (window.mobileAndTabletCheck()) {
	  printMessage('检查到您是在手机上打开本网站，将无法正常使用网站，请用电脑上的Chrome浏览器直接打开网站。');
	  document.querySelectorAll("button.search").forEach(button => {
		  button.disabled = true;}
	  );
	  return;
  }
  readVideos(qq_videos);
	printMessage('获取' + qq_videos.video_urls.length.toString() + '个最新视频。')
}

function getWindowId(videos, i) {
  return videos.window_id_prefix + '_' + i.toString();
}

function getCurrentTimeStamp() {
  var zeroPad = function(nNum, nPad) {
	return ('' + (Math.pow(10, nPad) + nNum)).slice(1);
  };
  var now = new Date();
  return zeroPad(now.getHours(), 2) + ':' + zeroPad(now.getMinutes(), 2) + ':' + zeroPad(now.getSeconds(), 2);
}

function printLastTimestamp() {
  var console_text = document.querySelector('p.console');
  console_text.innerHTML = '最近更新时间：' + getCurrentTimeStamp();
}

function printMessage(message) {
  var elms = document.querySelectorAll('p.console');
  if (!elms || elms.length == 0) {
  	return;
  }
  var console_text = document.querySelector('p.console');
  console_text.innerHTML = message;
}

var video_stop_times = {};
var video_max_stop_times = {};
var video_play_counts = new Map();
var video_windows_to_urls = {}
var play_vip = false;

function printVideoPlayCounts() {
  // var elms = document.querySelectorAll('p.long');
  // if (!elms || elms.length == 0) {
  //   return;
  // }
  // var console_text = document.querySelector('p.long');
  // message = '';
  // for (const [key, value] of video_play_counts.entries()) {
  //   message += key + ' 已经播放 ' + value + '次。\n'
  // }
  // console_text.innerHTML = message;
}

function checkAndPlayVideo() {
	var found_video = false;
	while (!found_video) {
	parts = qq_videos.video_urls[qq_videos.video_index].split('|');
    video_url = parts[0];
    video_length_seconds = parts[1].split(':').reduce((acc, time) => (60 * acc) + +time);
	video_actual_length = video_length_seconds;
    if (video_length_seconds > qq_videos.max_seconds) {
  	  video_length_seconds = qq_videos.max_seconds;
    }
    video_is_vip = parts[2] == 'v';
    if (video_is_vip && !play_vip) {
	  qq_videos.video_index = (qq_videos.video_index + 1) % qq_videos.video_urls.length;
    } else {
    	found_video = true;
    }
	}
	// Clean up overdue windows.
	for (var i = 0; i < qq_videos.windows_count; i++) {
  	  var windowId = getWindowId(qq_videos, i);
	  var existing_window = open_windows.get(windowId);
	  var window_max_stop_time = video_max_stop_times[windowId];
	  var current_time = new Date();
	  if (existing_window && window_max_stop_time && current_time.getTime() >= window_max_stop_time) {
  		existing_window.location.replace('about:blank');
		video_stop_times[windowId] = null;
		video_max_stop_times[windowId] = null;
	  }
	}
	for (var i = 0; i < qq_videos.windows_count; i++) {
	  var windowId = getWindowId(qq_videos, i);
	  var existing_window = open_windows.get(windowId);
	  var window_stop_time = video_stop_times[windowId];
	  var current_time = new Date();
	  if (!existing_window) {
		video_windows_to_urls[windowId] = video_url;
	    existing_window = window.open(video_url);
	    printMessage('打开：' + video_url);  	
		if (existing_window) {
	      open_windows.set(windowId, existing_window);
	    }
		var video_stop_time = current_time.setSeconds(current_time.getSeconds() + video_length_seconds);
		video_stop_times[windowId] = video_stop_time;
		video_max_stop_times[windowId] = current_time.setSeconds(current_time.getSeconds() + video_actual_length);
		qq_videos.video_index = (qq_videos.video_index + 1) % qq_videos.video_urls.length;
		return true;
	  } else if (!window_stop_time || current_time.getTime() >= window_stop_time) {
		var prev_url = video_windows_to_urls[windowId];
		if (prev_url) {
			if (prev_url === video_url) {
				continue;
			}
			if (!video_play_counts.get(prev_url)) {
			  video_play_counts.set(prev_url, 0);
		    }
			video_play_counts.set(prev_url, video_play_counts.get(prev_url) + 1);
			printVideoPlayCounts();
		}
		video_windows_to_urls[windowId] = video_url;
		existing_window.location.replace(video_url);	
		printMessage('打开：' + video_url); 	
		var video_stop_time = current_time.setSeconds(current_time.getSeconds() + video_length_seconds);
		video_stop_times[windowId] = video_stop_time;
		video_max_stop_times[windowId] =  current_time.setSeconds(current_time.getSeconds() + video_actual_length);
		qq_videos.video_index = (qq_videos.video_index + 1) % qq_videos.video_urls.length;
		return true;
	  }
	}
	return true;
}

async function fetch1005(should_play_vip) {
  document.querySelectorAll("button.search").forEach(button => {
	  button.disabled = true;}
  );
  play_vip = should_play_vip;
  if (!play_vip) {
	qq_videos.max_seconds += 90;
  }
  if (qq_videos.video_urls.length > 0 && !intervalID) {
	  checkAndPlayVideo();
    intervalID = setInterval(checkAndPlayVideo, 4000);
  }
}