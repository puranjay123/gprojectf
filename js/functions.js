
var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
var clientWidth = $(window).width();
var clientHeight = $(window).height();

$(function () {
    // setup garden
	$loveHeart = $("#loveHeart");
	var offsetX = $loveHeart.width() / 2;
	var offsetY = $loveHeart.height() / 2 - 55;
    $garden = $("#garden");
    gardenCanvas = $garden[0];
	gardenCanvas.width = $("#loveHeart").width();
    gardenCanvas.height = $("#loveHeart").height()
    gardenCtx = gardenCanvas.getContext("2d");
    gardenCtx.globalCompositeOperation = "lighter";
    garden = new Garden(gardenCtx, gardenCanvas);
	
	if ($window.width() <= 720) {
		$loveHeart.css({ float: "none", width: "100%", margin: "0 auto" });
		$("#code").css({ float: "none", width: "100%", boxSizing: "border-box" });
		$("#content").css({ width: "100%", height: "auto", marginTop: 0, marginLeft: 0 });
	} else {
		$("#content").css("width", $loveHeart.width() + $("#code").width());
		$("#content").css("height", Math.max($loveHeart.height(), $("#code").height()));
		$("#content").css("margin-top", Math.max(($window.height() - $("#content").height()) / 2, 10));
		$("#content").css("margin-left", Math.max(($window.width() - $("#content").width()) / 2, 10));
	}

    // renderLoop
    setInterval(function () {
        garden.render();
    }, Garden.options.growSpeed);
});

$(window).resize(function() {
    var newWidth = $(window).width();
    var newHeight = $(window).height();
	if (newWidth != clientWidth || newHeight != clientHeight) {
        location.replace(location);
    }
});

function getHeartScale() {
	return Math.min(1, $("#loveHeart").width() / 670);
}

function getHeartPoint(angle) {
	var t = angle / Math.PI;
	var scale = getHeartScale();
	var x = 19.5 * (16 * Math.pow(Math.sin(t), 3)) * scale;
	var y = -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
	return new Array(offsetX + x, offsetY + y);
}

function startHeartAnimation() {
	var interval = 50;
	var angle = 10;
	var heart = new Array();
	var animationTimer = setInterval(function () {
		var bloom = getHeartPoint(angle);
		var draw = true;
		for (var i = 0; i < heart.length; i++) {
			var p = heart[i];
			var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
			if (distance < Garden.options.bloomRadius.max * 1.3) {
				draw = false;
				break;
			}
		}
		if (draw) {
			heart.push(bloom);
			garden.createRandomBloom(bloom[0], bloom[1]);
		}
		if (angle >= 30) {
			clearInterval(animationTimer);
			showMessages();
		} else {
			angle += 0.2;
		}
	}, interval);
}

(function($) {
	$.fn.typewriter = function() {
		this.each(function() {
			var $ele = $(this), str = $ele.html(), progress = 0;
			$ele.html('');
			var timer = setInterval(function() {
				var current = str.substr(progress, 1);
				if (current == '<') {
					progress = str.indexOf('>', progress) + 1;
				} else {
					progress++;
				}
				$ele.html(str.substring(0, progress) + (progress & 1 ? '_' : ''));
				if (progress >= str.length) {
					clearInterval(timer);
				}
			}, 75);
		});
		return this;
	};
})(jQuery);

function getNextBirthday() {
	var now = new Date();
	var birthday = new Date(now.getFullYear(), 10, 12, 0, 0, 0, 0);
	if (now >= birthday) {
		birthday.setFullYear(birthday.getFullYear() + 1);
	}
	return birthday;
}

function birthdayCountdown(targetDate) {
	var now = new Date();
	var seconds = Math.max(0, (Date.parse(targetDate) - Date.parse(now)) / 1000);
	var days = Math.floor(seconds / (3600 * 24));
	seconds = seconds % (3600 * 24);
	var hours = Math.floor(seconds / 3600);
	if (hours < 10) {
		hours = "0" + hours;
	}
	seconds = seconds % 3600;
	var minutes = Math.floor(seconds / 60);
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	seconds = seconds % 60;
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var result = "<span class=\"digit\">" + days + "</span>d <span class=\"digit\">" + hours + "</span>h<br/><span class=\"digit\">" + minutes + "</span>m <span class=\"digit\">" + seconds + "</span>s";
	$("#elapseClock").html(result);
}

function heartCoords(t) {
	var scale = getHeartScale();
	var x = 19.5 * (16 * Math.pow(Math.sin(t), 3)) * scale;
	var y = -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
	return { x: x, y: y };
}

function getHeartBounds() {
	var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	var t;
	for (t = 0; t <= 2 * Math.PI; t += 0.02) {
		var pt = heartCoords(t);
		minX = Math.min(minX, pt.x);
		maxX = Math.max(maxX, pt.x);
		minY = Math.min(minY, pt.y);
		maxY = Math.max(maxY, pt.y);
	}
	return {
		minX: minX,
		maxX: maxX,
		minY: minY,
		maxY: maxY,
		width: maxX - minX,
		height: maxY - minY
	};
}

function updateHeartClipPath() {
	var bounds = getHeartBounds();
	var path = '';
	var first = true;
	var t;
	for (t = 0; t <= 2 * Math.PI + 0.001; t += 0.05) {
		var pt = heartCoords(t);
		var nx = (pt.x - bounds.minX) / bounds.width;
		var ny = (pt.y - bounds.minY) / bounds.height;
		path += (first ? 'M ' : ' L ') + nx.toFixed(4) + ' ' + ny.toFixed(4);
		first = false;
	}
	path += ' Z';
	$('#heartClipPath').attr('d', path);
	window.heartBounds = bounds;
}

function positionHeartShape(useCircle) {
	var b = window.heartBounds || getHeartBounds();
	if (useCircle) {
		var size = b.width;
		$('#heartShape').css({
			width: size,
			height: size,
			left: window.offsetX - size / 2,
			top: window.offsetY - size / 2 + 20
		});
	} else {
		$('#heartShape').css({
			width: b.width,
			height: b.height,
			left: window.offsetX + b.minX,
			top: window.offsetY + b.minY
		});
	}
	positionTimer(useCircle);
}

function positionTimer(useCircle) {
	var b = window.heartBounds || getHeartBounds();
	if (useCircle) {
		$('#timerBlock').css({
			top: window.offsetY + 200,
			left: window.offsetX - 100
		});
	} else {
		$('#timerBlock').css({
			top: window.offsetY + b.maxY + 6,
			left: window.offsetX + b.minX + 30
		});
	}
}

function initHeartPhoto() {
	updateHeartClipPath();
	var src = $('#heartPhoto').attr('src');

	function useHeartShape() {
		$('#heartShape').removeClass('circle-fallback');
		positionHeartShape(false);
	}

	function useCircleFallback() {
		$('#heartShape').addClass('circle-fallback');
		positionHeartShape(true);
	}

	var testImg = new Image();
	testImg.onload = useHeartShape;
	testImg.onerror = useCircleFallback;
	testImg.src = src;

	if (testImg.complete) {
		if (testImg.naturalWidth > 0) {
			useHeartShape();
		} else {
			useCircleFallback();
		}
	}

	$('#heartPhoto').on('error', useCircleFallback);
}

function showMessages() {
	positionHeartShape($('#heartShape').hasClass('circle-fallback'));
	$('#timerBlock').fadeIn(2000);
}

function adjustWordsPosition() {
	positionHeartShape($('#heartShape').hasClass('circle-fallback'));
}

function adjustCodePosition() {
	$('#code').css("margin-top", ($("#garden").height() - $("#code").height()) / 2);
}
