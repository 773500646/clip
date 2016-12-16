/**
 * Created by Administrator on 2016/12/13.
 * 司徒 2016.12.15
 */
var drap=function(){
    var instantiated,
        Top = document.body,
        doc = document.documentElement || document.body,
        autox,
        autoy;
    var _public_ = {
        bgx: 0,                                      //图片x轴
        bgy: 0,                                      //图片y轴
        bgsize: [0, 0],                               //图片宽高
        bgb: 0
    };
    var options = {
        w: doc.clientWidth || doc.clientWidth,         //屏幕宽
        h: doc.clientHeight || doc.clientHeight,       //屏幕高
        setw: 300,                                   //裁剪区域宽
        seth: 300,                                   //裁剪区域高
        callback: function (ret) {
        }                   //回调函数
    };
    var oImage = new Image(); 

    //阻止事件冒泡捕获
    function group(ev) {
        if (ev.stopPropagation) {
            ev.stopPropagation();
        } else {
            window.ev.cancelBubble = true;
        }
    }

    //放大缩小
    function drags(el, obj) {
        if (obj.calc <= obj.left && obj.calc >= obj.right) {
            el.style[obj.style] = obj.calc + 'px';
        } else if (obj.calc >= obj.left) {
            el.style[obj.style] = obj.left + 'px';
        } else if (obj.calc <= obj.right) {
            el.style[obj.style] = obj.right + 'px';
        }
    }

    function init() {
        autox = (options.w - options.setw) * 0.5;
        autoy = (options.h - options.seth) * 0.5;
        Dom();       //插入dom
        plotcvs();   //绘制canvas
        Btn();       //选择完成按钮事件
        eve();       //图片拖拽放大缩小事件
        return this;
    }

    //获取图片X Y轴宽高重新赋值
    function getImgzb(positi) {
        _public_.bgx = parseFloat(positi.style.backgroundPositionX);
        _public_.bgy = parseFloat(positi.style.backgroundPositionY);
        _public_.bgsize = positi.style.backgroundSize.replace(/[a-zA-Z]+/g, '').split(' ');
    }

    //生成DOM
    function Dom() {
        var Mi = document.createElement('div');
        Mi.id = 'Mi_drop';
        Mi.innerHTML = '<div class="Mi_drop_content">' +
            '<canvas class="Mi_drop_canvas" id="Mi_drop_canvas" width="' + options.w + '" height="' + options.h + '">你的浏览器不支持canvas</canvas>' +
            '<div class="Mi_drop_bg"></div>' +
            '</div>' +
            '<div class="Mi_drop_btn">' +
            '<button class="Mi_choose">选择</button>' +
            '<button class="Mi_close">完成</button>' +
            '<input  class="Mi_file" type="file" accept="image/*">' +
            '</div>';
        Top.appendChild(Mi);
    }

    //绘制canvas
    function plotcvs() {
        var C = document.getElementById('Mi_drop_canvas');
        var plot = C.getContext('2d');
        //绘制矩形
        plot.beginPath();
        plot.globalAlpha = 0.5;
        plot.fillRect(0, 0, options.w, options.h);
        plot.fill();
        plot.closePath();

        //源图层绘制透明矩形
        plot.beginPath();
        plot.globalCompositeOperation = "destination-out";
        plot.globalAlpha = 1;
        plot.fillRect(autox, autoy, options.setw, options.seth);
        plot.fill();
        plot.closePath();

        //源图层绘制边框
        plot.beginPath();
        plot.globalCompositeOperation = 'sourct-over';
        plot.lineWidth = 1;
        plot.strokeStyle = '#ffffff';
        plot.strokeRect(autox, autoy, options.setw, options.seth);
        plot.fill();
        plot.closePath();
    }

    //选择、完成按钮事件
    function Btn() {
        //fileA 选择 storage保存
        var fileA = document.querySelector('#Mi_drop .Mi_drop_btn .Mi_file');
        var storage = document.querySelector('#Mi_drop .Mi_drop_btn .Mi_close');
        var positi = document.querySelector('#Mi_drop .Mi_drop_bg');
        fileA.addEventListener('change', function (ev) {
            var files = this.files[0];
            if (('FileReader' in window)) {
                var reader = new FileReader();
                reader.onload = function () {
                    var ret = reader.result;
                    oImage.src = ret;
                };
                oImage.onload = function () {
                    if (oImage.width > options.setw) {
                        _public_.bfb = oImage.width / oImage.height;
                        var init = options.setw / oImage.width;
                        positi.style.cssText = "background:url(" + oImage.src + ");background-size:" + (oImage.width * init) + "px " + (oImage.height * init) + "px;background-position:" + autox + "px " + autoy + "px;background-repeat: no-repeat;";
                        getImgzb(positi);
                    }
                };
                reader.readAsDataURL(files);
            }
        }, false)
        storage.addEventListener('touchstart', function () {
            if (oImage.src != '') {
                var oC = document.createElement('canvas');
                oC.width = options.setw;
                oC.height = options.seth;
                var jd = oC.getContext('2d');
                jd.drawImage(oImage, _public_.bgx - autox, _public_.bgy - autoy, _public_.bgsize[0], _public_.bgsize[1]);
                var base64 = oC.toDataURL('image/png', 1);
                options.callback && options.callback(base64, _public_);
            } else {
                alert('请上传一张图片')
            }
            ;
        }, false)
    }

    //图片拖拽放大缩小
    function eve() {
        //初始化x坐标 //初始化y坐标
        var initX = 0, initY = 0, initBoo;
        var content = document.querySelector('#Mi_drop .Mi_drop_content');
        var positi = document.querySelector('#Mi_drop .Mi_drop_bg');

        content.addEventListener('touchstart', touchstart, false)
        content.addEventListener('touchmove', touchmove, false);
        content.addEventListener('touchend', touchend, false)
        function touchstart(ev) {
            group(ev);
            getImgzb(positi);
            var event = ev.touches, eventlen = event.length;
            if (eventlen == 1) {
                initX = event[0].pageX;
                initY = event[0].pageY;
            } else if (eventlen == 2) {
                var ev0X = event[0].pageX, ev1X = event[1].pageX;
                var ev0Y = event[0].pageY, ev1Y = event[1].pageY;
                initX = Math.abs(ev0X - ev1X);
                initY = Math.abs(ev0Y - ev1Y);
            }
        }

        function touchmove(ev) {
            group(ev);
            ev.preventDefault();
            var event = ev.touches, eventlen = event.length;
            if (eventlen == 1) {
                if (initBoo) {
                    initX = event[0].pageX;
                    initY = event[0].pageY;
                    initBoo = false;
                }
                var evX = event[0].pageX, evY = event[0].pageY;
                var calcX = (evX - initX);
                var calcY = (evY - initY);
                drags(positi, {
                    style: 'backgroundPositionX',
                    calc: _public_.bgx + calcX,
                    left: autox,
                    right: (-(parseInt(_public_.bgsize[0]) - options.w + autox))
                });
                drags(positi, {
                    style: 'backgroundPositionY',
                    calc: _public_.bgy + calcY,
                    left: autoy,
                    right: (-(parseInt(_public_.bgsize[1]) - options.h + autoy))
                })
            } else if (eventlen == 2) {
                if (!initBoo) {
                    initBoo = true;
                }
                var ev0X = event[0].pageX, ev1X = event[1].pageX;
                var ev0Y = event[0].pageY, ev1Y = event[1].pageY;
                var endX = Math.abs(ev0X - ev1X) - initX, endY = Math.abs(ev0Y - ev1Y) - initY;
                var num = Math.abs(endX) > Math.abs(endY) ? endX : endY;

                if((parseInt(_public_.bgsize[0]) + num)<options.setw){
                    var bgSize=options.setw+"px " + options.setw/ _public_.bfb + "px";
                    var bgPositi=autox+'px '+autoy+'px';
                    positi.style.cssText+='background-size:'+bgSize+';background-position:'+bgPositi;
                    return;
                };
                positi.style.backgroundSize=parseInt(_public_.bgsize[0]) + num + "px " + (parseInt(_public_.bgsize[0]) + num) / _public_.bfb + "px";
                drags(positi,{
                     style:'backgroundPositionX',
                     calc:_public_.bgx-(num/2),
                     left:autox,
                     right:(-(parseInt(_public_.bgsize[0])+num/2)-options.w+autox)
                 });
                 drags(positi,{
                     style:'backgroundPositionY',
                     calc:_public_.bgy-(num/2),
                     left:autoy,
                     right:(-(parseInt(_public_.bgsize[1])+num/2)-options.h+autoy)
                 })
            }
        } 
        function touchend(ev) {
            group(ev);
            getImgzb(positi);
            drags(positi, {
                style: 'backgroundPositionX',
                calc: _public_.bgx,
                left: autox,
                right: (-(parseInt(_public_.bgsize[0]) - options.w + autox))
            });
            drags(positi, {
                style: 'backgroundPositionY',
                calc: _public_.bgy,
                left: autoy, 
                right: (-(parseInt(_public_.bgsize[1]) - options.h + autoy))
            })
        }
    } 
    return {
            clip: function (param) {
                if (!instantiated) { 
                    for (var i in param) { 
                        options[i] = param[i];
                    }
                    instantiated = init();
                }
            },
            close: function () {
                if (instantiated) {
                    instantiated = undefined;
                    oImage = new Image();
                    Top.removeChild(document.getElementById('Mi_drop'));
                }
            }
       } 
}
