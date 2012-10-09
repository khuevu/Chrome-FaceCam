
function onFailSoHard(e) {
    if (e.code == 1) {
        console.log('User denied access to their camera');
    } else {
        console.log('getUserMedia() not supported in your browser.');
    }
}

function getGeo() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Not Supported!");
    }

    function success(position) {
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
    }

    function error(msg) {
        console.log(msg);
        console.log(typeof msg == 'string' ? msg : "error");
    }

    var watchId = navigator.geolocation.watchPosition(function (position) {
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
    });

    navigator.geolocation.clearWatch(watchId);
}

function closedEnough() {
    return true;
}

function tick() {
    window.webkitRequestAnimationFrame(tick);

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        $(video).objectdetect("all", {
            scaleMin: 3,
            scaleFactor: 1.1,
            classifier: objectdetect.frontalface
        }, function (coords) {
            if (coords[0]) {
                coords = smoother.smooth(coords[0]);
                console.log(coords);
                /*
						$("#glasses").css({
							"left":    ~~(coords[0] + coords[2] * 1.0/8 + $(video).offset().left) + "px",
							"top":     ~~(coords[1] + coords[3] * 0.8/8 + $(video).offset().top) + "px",
							"width":   ~~(coords[2] * 6/8) + "px",
							"height":  ~~(coords[3] * 6/8) + "px",
							"display": "block"
						});
						*/
                for (var i = 0; i < coords.length; ++i) {
                    $(this).highlight(coords[i], "red");
                    console.log($(this));
                    $(this).objectdetect("all", {
                        classifier: objectdetect.eye,
                        selection: coords[i]
                    }, function (eyes) {
                        for (var j = 0; j < eyes.length; ++j) {
                            $(this).highlight(eyes[j], "blue");
                        }
                    });
                }
            }
        });
    }
}

$.fn.highlight = function (rect, color) {
    $("<div />", {
        "css": {
            "border": "2px solid " + color,
            "position": "absolute",
            "left": ($(this).offset().left + rect[0]) + "px",
            "top": ($(this).offset().top + rect[1]) + "px",
            "width": rect[2] + "px",
            "height": rect[3] + "px"
        }
    }).appendTo("body");
}

var video;
var smoother = new Smoother(0.85, [0, 0, 0, 0, 0]);

function runVideo() {
    video = document.querySelector('#screenshot-stream');
    var button = document.querySelector('#screenshot-button');
    var canvas = document.querySelector('#screenshot-canvas');
    var img = document.querySelector('#screenshot');
    var ctx = canvas.getContext('2d');
    var localMediaStream = null;

    function sizeCanvas() {
        setTimeout(function () {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            img.height = video.videoHeight;
            img.width = video.videoWidth;
        }, 50);
    }

    function snapshot() {
        ctx.drawImage(video, 0, 0);
        img.src = canvas.toDataURL('image/webp');
    }
    button.addEventListener('click', function (e) {
        if (localMediaStream) {
            snapshot();
            return;
        }
        if (navigator.getUserMedia) {
            navigator.getUserMedia('video', function (stream) {
                video.src = stream;
                localMediaStream = stream;
                sizeCanvas();
                button.textContent = 'Take Shot';
            }, onFailSoHard);
        } else if (navigator.webkitGetUserMedia) {
            navigator.webkitGetUserMedia({
                video: true
            }, function (stream) {
                video.src = window.webkitURL.createObjectURL(stream);
                window.webkitRequestAnimationFrame(tick);
                localMediaStream = stream;
                sizeCanvas();
                button.textContent = 'Take Shot';
            }, onFailSoHard);
        } else {
            onFailSoHard({
                target: video
            });
        }
    }, false);
    video.addEventListener('click', snapshot, false);
    document.querySelector('#screenshot-stop-button').addEventListener('click', function (e) {
        video.pause();
        localMediaStream.stop();
    }, false);

}



var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        getGeo();
        runVideo();
        clearInterval(readyStateCheckInterval);
    }
}, 10);
