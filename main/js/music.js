// 自执行函数，避免全局变量污染
!function(a){
    // 编译着色器的函数
    function b(a,b){
        function c(a,b){
            var c=e.createShader(a);
            // 设置着色器源代码
            e.shaderSource(c,b);
            // 编译着色器
            e.compileShader(c);
            // 检查着色器是否编译成功
            if(!e.getShaderParameter(c,e.COMPILE_STATUS)){
                return c;
            }
            return c;
        }
        var d,f,g,h={};
        // 创建着色器程序
        h.id=e.createProgram();
        // 附加顶点着色器
        e.attachShader(h.id,c(e.VERTEX_SHADER,a));
        // 附加上片元着色器
        e.attachShader(h.id,c(e.FRAGMENT_SHADER,b));
        // 链接着色器程序
        e.linkProgram(h.id);
        // 检查着色器程序是否链接成功
        if(!e.getProgramParameter(h.id,e.LINK_STATUS)){
            return h;
        }
        // 初始化 uniform 和 locations 对象
        h.uniforms={};
        h.locations={};
        // 使用着色器程序
        e.useProgram(h.id);
        // 启用顶点属性数组
        e.enableVertexAttribArray(0);
        f=/uniform (\w+) (\w+)/g;
        g=a+b;
        // 遍历所有 uniform 变量，获取其位置
        while(null!=(match=f.exec(g))){
            d=match[2];
            h.locations[d]=e.getUniformLocation(h.id,d);
        }
        return h;
    }
    // 激活并绑定纹理的函数
    function c(a,b){
        e.activeTexture(e.TEXTURE0+(b||0));
        e.bindTexture(e.TEXTURE_2D,a);
    }
    // 从 CSS 背景图片中提取图片 URL 的函数
    function d(a){
        var b=/url\(["']?([^"']*)["']?\)/.exec(a.css("background-image"));
        return null==b?null:b[1];
    }
    var e,f;
    // 水纹效果构造函数
    f=function(b,c){
        function f(){
            n.step();
            // 请求下一帧动画
            requestAnimationFrame(f);
        }
        var g,h,i,j,k,l,m,n=this;
        this.$el=a(b);
        if(g=d(this.$el)){
            // 设置交互性
            this.interactive=c.interactive;
            // 设置分辨率
            this.resolution=c.resolution||256;
            // 计算纹理增量
            this.textureDelta=new Float32Array([1/this.resolution,1/this.resolution]);
            // 设置扰动系数
            this.perturbance=c.perturbance;
            // 设置水滴半径
            this.dropRadius=c.dropRadius;
            // 创建画布元素
            h=document.createElement("canvas");
            // 设置画布宽度
            h.width=this.$el.innerWidth();
            // 设置画布高度
            h.height=this.$el.innerHeight();
            this.canvas=h;
            this.$canvas=a(h);
            this.$canvas.css({position:"absolute",left:0,top:0,right:0,bottom:0,zIndex:-1});
            // 将画布添加到元素中
            this.$el.append(h);
            // 获取 WebGL 上下文
            this.context=e=h.getContext("webgl")||h.getContext("experimental-webgl");
            // 获取扩展
            e.getExtension("OES_texture_float");
            i=e.getExtension("OES_texture_float_linear");
            // 绑定鼠标移动和点击事件
            this.$el.on("mousemove.ripples",function(a){
                n.visible&&n.running&&n.interactive&&n.dropAtMouse(a,n.dropRadius,.01);
            }).on("mousedown.ripples",function(a){
                n.visible&&n.running&&n.interactive&&n.dropAtMouse(a,1.5*n.dropRadius,.14);
            });
            // 初始化纹理和帧缓冲区数组
            this.textures=[];
            this.framebuffers=[];
            for(j=0;2>j;j++){
                k=e.createTexture();
                l=e.createFramebuffer();
                e.bindFramebuffer(e.FRAMEBUFFER,l);
                l.width=this.resolution;
                l.height=this.resolution;
                e.bindTexture(e.TEXTURE_2D,k);
                // 设置纹理过滤参数
                e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,i?e.LINEAR:e.NEAREST);
                e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,i?e.LINEAR:e.NEAREST);
                // 设置纹理环绕参数
                e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE);
                e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);
                // 初始化纹理数据
                e.texImage2D(e.TEXTURE_2D,0,e.RGBA,this.resolution,this.resolution,0,e.RGBA,e.FLOAT,null);
                // 将纹理附加到帧缓冲区
                e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,k,0);
                // 检查帧缓冲区状态
                if(e.checkFramebufferStatus(e.FRAMEBUFFER)!=e.FRAMEBUFFER_COMPLETE){
                    console.error("Framebuffer is not complete");
                }
                e.bindTexture(e.TEXTURE_2D,null);
                e.bindFramebuffer(e.FRAMEBUFFER,null);
                this.textures.push(k);
                this.framebuffers.push(l);
            }
            // 设置运行状态
            this.running=!0;
            // 创建缓冲区
            this.quad=e.createBuffer();
            e.bindBuffer(e.ARRAY_BUFFER,this.quad);
            // 填充缓冲区数据
            e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,1]),e.STATIC_DRAW);
            // 初始化着色器
            this.initShaders();
            m=new Image();
            m.onload=function(){
                function a(a){
                    return 0==(a&a-1);
                }
                var b,c;
                e=n.context;
                // 根据图片尺寸设置纹理环绕模式
                b=a(m.width)&&a(m.height)?e.REPEAT:e.CLAMP_TO_EDGE;
                n.backgroundWidth=m.width;
                n.backgroundHeight=m.height;
                c=e.createTexture();
                e.bindTexture(e.TEXTURE_2D,c);
                // 设置像素存储参数
                e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,1);
                // 设置纹理过滤参数
                e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR);
                e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR);
                e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,b);
                e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,b);
                // 加载纹理数据
                e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,m);
                n.backgroundTexture=c;
            };
            m.src=g;
            this.visible=!0;
            // 设置清除颜色
            e.clearColor(0,0,0,0);
            // 设置混合函数
            e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA);
            // 请求下一帧动画
            requestAnimationFrame(f);
        }
    };
    // 水纹效果默认配置
    f.DEFAULTS={
        resolution:112,
        dropRadius:120,
        perturbance:.001,
        interactive:!0,
        crossOrigin:""
    };
    // 水纹效果原型方法
    f.prototype={
        step:function(){
            e=this.context;
            if(this.visible&&this.backgroundTexture){
                // 计算纹理边界
                this.computeTextureBoundaries();
                if(this.running){
                    // 更新水纹状态
                    this.update();
                }
                // 渲染水纹
                this.render();
            }
        },
        drawQuad:function(){
            e.bindBuffer(e.ARRAY_BUFFER,this.quad);
            // 设置顶点属性指针
            e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);
            // 绘制三角形扇
            e.drawArrays(e.TRIANGLE_FAN,0,4);
        },
        render:function(){
            // 设置视口
            e.viewport(0,0,this.canvas.width,this.canvas.height);
            // 启用混合
            e.enable(e.BLEND);
            // 清除颜色和深度缓冲区
            e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT);
            // 使用渲染着色器程序
            e.useProgram(this.renderProgram.id);
            // 绑定背景纹理
            c(this.backgroundTexture,0);
            // 绑定水纹纹理
            c(this.textures[0],1);
            // 设置扰动系数
            e.uniform1f(this.renderProgram.locations.perturbance,this.perturbance);
            // 设置左上角坐标
            e.uniform2fv(this.renderProgram.locations.topLeft,this.renderProgram.uniforms.topLeft);
            // 设置右下角坐标
            e.uniform2fv(this.renderProgram.locations.bottomRight,this.renderProgram.uniforms.bottomRight);
            // 设置容器比例
            e.uniform2fv(this.renderProgram.locations.containerRatio,this.renderProgram.uniforms.containerRatio);
            // 设置背景纹理采样器
            e.uniform1i(this.renderProgram.locations.samplerBackground,0);
            // 设置水纹纹理采样器
            e.uniform1i(this.renderProgram.locations.samplerRipples,1);
            // 绘制四边形
            this.drawQuad();
            // 禁用混合
            e.disable(e.BLEND);
        },
        update:function(){
            // 设置视口
            e.viewport(0,0,this.resolution,this.resolution);
            for(var a=0;2>a;a++){
                // 绑定帧缓冲区
                e.bindFramebuffer(e.FRAMEBUFFER,this.framebuffers[a]);
                // 绑定纹理
                c(this.textures[1-a]);
                // 使用更新着色器程序
                e.useProgram(this.updateProgram[a].id);
                // 绘制四边形
                this.drawQuad();
            }
            // 解除帧缓冲区绑定
            e.bindFramebuffer(e.FRAMEBUFFER,null);
        },
        computeTextureBoundaries:function(){
            var a,b,c,d,e,f,g=this.$el.css("background-position").split(" ");
            a=this.backgroundWidth;
            b=this.backgroundHeight;
            c=g[0]||"";
            d=g[1]||c;
            c=parseFloat(c);
            d=parseFloat(d);
            e=this.$el.offset();
            // 计算左上角坐标
            this.renderProgram.uniforms.topLeft=new Float32Array([(e.left-c)/a,(e.top-d)/b]);
            // 计算右下角坐标
            this.renderProgram.uniforms.bottomRight=new Float32Array([this.renderProgram.uniforms.topLeft[0]+this.$el.innerWidth()/a,this.renderProgram.uniforms.topLeft[1]+this.$el.innerHeight()/b]);
            f=Math.max(this.canvas.width,this.canvas.height);
            // 计算容器比例
            this.renderProgram.uniforms.containerRatio=new Float32Array([this.canvas.width/f,this.canvas.height/f]);
        },
        initShaders:function(){
            var a=["attribute vec2 vertex;","varying vec2 coord;","void main() {","coord = vertex * 0.5 + 0.5;","gl_Position = vec4(vertex, 0.0, 1.0);","}"].join("\n");
            // 初始化水滴着色器程序
            this.dropProgram=b(a,["precision highp float;","const float PI = 3.141592653589793;","uniform sampler2D texture;","uniform vec2 center;","uniform float radius;","uniform float strength;","varying vec2 coord;","void main() {","vec4 info = texture2D(texture, coord);","float drop = max(0.0, 1.0 - length(center * 0.5 + 0.5 - coord) / radius);","drop = 0.5 - cos(drop * PI) * 0.5;","info.r += drop * strength;","gl_FragColor = info;","}"].join("\n"));
            this.updateProgram=[0,0];
            // 初始化更新着色器程序 0
            this.updateProgram[0]=b(a,["precision highp float;","uniform sampler2D texture;","uniform vec2 delta;","varying vec2 coord;","void main() {","vec4 info = texture2D(texture, coord);","vec2 dx = vec2(delta.x, 0.0);","vec2 dy = vec2(0.0, delta.y);","float average = (","texture2D(texture, coord - dx).r +","texture2D(texture, coord - dy).r +","texture2D(texture, coord + dx).r +","texture2D(texture, coord + dy).r",") * 0.25;","info.g += (average - info.r) * 2.0;","info.g *= 0.995;","info.r += info.g;","gl_FragColor = info;","}"].join("\n"));
            // 设置更新着色器程序 0 的 delta 变量
            e.uniform2fv(this.updateProgram[0].locations.delta,this.textureDelta);
            // 初始化更新着色器程序 1
            this.updateProgram[1]=b(a,["precision highp float;","uniform sampler2D texture;","uniform vec2 delta;","varying vec2 coord;","void main() {","vec4 info = texture2D(texture, coord);","vec3 dx = vec3(delta.x, texture2D(texture, vec2(coord.x + delta.x, coord.y)).r - info.r, 0.0);","vec3 dy = vec3(0.0, texture2D(texture, vec2(coord.x, coord.y + delta.y)).r - info.r, delta.y);","info.ba = normalize(cross(dy, dx)).xz;","gl_FragColor = info;","}"].join("\n"));
            // 设置更新着色器程序 1 的 delta 变量
            e.uniform2fv(this.updateProgram[1].locations.delta,this.textureDelta);
            // 初始化渲染着色器程序
            this.renderProgram=b(["precision highp float;","attribute vec2 vertex;","uniform vec2 topLeft;","uniform vec2 bottomRight;","uniform vec2 containerRatio;","varying vec2 ripplesCoord;","varying vec2 backgroundCoord;","void main() {","backgroundCoord = mix(topLeft, bottomRight, vertex * 0.5 + 0.5);","backgroundCoord.y = 1.0 - backgroundCoord.y;","ripplesCoord = vec2(vertex.x, -vertex.y) * containerRatio * 0.5 + 0.5;","gl_Position = vec4(vertex.x, -vertex.y, 0.0, 1.0);","}"].join("\n"),["precision highp float;","uniform sampler2D samplerBackground;","uniform sampler2D samplerRipples;","uniform float perturbance;","varying vec2 ripplesCoord;","varying vec2 backgroundCoord;","void main() {","vec2 offset = -texture2D(samplerRipples, ripplesCoord).ba;","float specular = pow(max(0.0, dot(offset, normalize(vec2(-0.6, 1.0)))), 4.0);","gl_FragColor = texture2D(samplerBackground, backgroundCoord + offset * perturbance) + specular;","}"].join("\n"));
        },
        dropAtMouse:function(a,b,c){
            // 在鼠标位置创建水滴
            this.drop(a.pageX-this.$el.offset().left,a.pageY-this.$el.offset().top,b,c);
        },
        drop:function(a,b,d,f){
            var g,h,i,j,k;
            e=this.context;
            g=this.$el.innerWidth();
            h=this.$el.innerHeight();
            i=Math.max(g,h);
            d/=i;
            j=new Float32Array([(2*a-g)/i,(h-2*b)/i]);
            // 设置视口
            e.viewport(0,0,this.resolution,this.resolution);
            // 绑定帧缓冲区
            e.bindFramebuffer(e.FRAMEBUFFER,this.framebuffers[0]);
            // 绑定纹理
            c(this.textures[1]);
            // 使用水滴着色器程序
            e.useProgram(this.dropProgram.id);
            // 设置水滴中心坐标
            e.uniform2fv(this.dropProgram.locations.center,j);
            // 设置水滴半径
            e.uniform1f(this.dropProgram.locations.radius,d);
            // 设置水滴强度
            e.uniform1f(this.dropProgram.locations.strength,f);
            // 绘制四边形
            this.drawQuad();
            k=this.framebuffers[0];
            this.framebuffers[0]=this.framebuffers[1];
            this.framebuffers[1]=k;
            k=this.textures[0];
            this.textures[0]=this.textures[1];
            this.textures[1]=k;
            // 解除帧缓冲区绑定
            e.bindFramebuffer(e.FRAMEBUFFER,null);
        }
    };
    // jQuery 插件方法
    a.fn.ripples=function(b){
        var c=arguments.length>1?Array.prototype.slice.call(arguments,1):void 0;
        return this.each(function(){
            var d=a(this),e=d.data("ripples"),g=a.extend({},f.DEFAULTS,d.data(),"object"==typeof b&&b);
            if(e||"string"!=typeof b){
                if(e){
                    if("string"==typeof b){
                        f.prototype[b].apply(e,c);
                    }
                }else{
                    d.data("ripples",new f(this,g));
                }
            }
        });
    }
}(window.jQuery);
// 自执行函数，避免全局变量污染
!function(){
    // 添加类名的函数
    function a(a,c){
        if(0==b(a,c)){
            a.className+=" "+c;
        }
    }
    // 检查元素是否包含指定类名的函数
    function b(a,b){
        return!!a.className.match(new RegExp("(\\s|^)"+b+"(\\s|$)"));
    }
    // 移除类名的函数
    function c(a,c){
        var d=a.className;
        if(b(a,c)){
            d=d.replace(new RegExp("(\\s|^)"+c+"(\\s|$)")," ");
            d=d.replace(/(^\s*)|(\s*$)/g,"");
            a.className=d;
        }
    }
    // 切换类名的函数
    function d(d,e){
        if(b(d,e)){
            c(d,e);
        }else{
            a(d,e);
        }
    }
    // 查询元素的函数
    function e(a){
        return document.querySelector(a);
    }
    // 合并对象的函数
    function f(a,b){
        for(var c in b){
            if(b.hasOwnProperty(c)){
                a[c]=b[c];
            }
        }
        return a;
    }
    // 格式化时间的函数
    function g(a){
        var b,c,d,e="";
        b=String(parseInt(a/3600,10));
        c=String(parseInt(a%3600/60,10));
        d=String(parseInt(a%60,10));
        if("0"!=b){
            if(1==b.length){
                b="0"+b;
            }
            e+=b+":";
        }
        if(1==c.length){
            c="0"+c;
        }
        e+=c+":";
        if(1==d.length){
            d="0"+d;
        }
        e+=d;
        return e;
    }
    // 初始化播放器 HTML 结构的函数
    function h(){
        e(".grid-music-container").innerHTML="<div class='m-music-play-wrap'><div class='u-cover'></div><div class='m-now-info'><h1 class='u-music-title'><strong>music</strong></h1><div class='m-now-controls'><div class='u-control u-process'> <span class='buffer-process'></span><span class='current-process'></span></div><div class='u-control u-time'>00:00/00:00</div><div class='u-control u-volume'><div class='volume-process' data-volume='0.50'><span class='volume-current'></span><span class='volume-bar'></span><span class='volume-event'></span></div><a class='volume-control'></a></div></div><div class='m-play-controls'><a class='u-play-btn prev' title='上一曲'></a><a class='u-play-btn ctrl-play play' title='暂停'></a><a class='u-play-btn next' title='下一曲'></a><a class='u-play-btn mode mode-list current' title='列表循环'></a><a class='u-play-btn mode mode-random' title='随机播放'></a><a class='u-play-btn mode mode-single' title='单曲循环'></a><a class='max' title='最小化'></a></div></div></div>";
    }
    // 音乐播放器构造函数
    function n(a){
        var b=this.config;
        // 合并配置
        this.config=f(b,a);
        // 音乐列表
        this.musicList=this.config.musicList||[];
        // 音乐列表长度
        this.musicLength=this.musicList.length;
        // 背景图片列表
        this.bgImgList=this.config.bgImgList||[];
        // 背景图片列表长度
        this.bgImgLength=this.bgImgList.length;
        this.audioDom=null;
        // 初始化播放器 HTML 结构
        h();
        // 初始化播放器
        this.init();
        // 隐藏播放器
        this.musicDom.music.style.display="none";
        // 显示最小化按钮
        this.musicDom.mini.style.display="block";
        // 切换背景图片
        this.switchImg(this.currentBgImg);
        
        // 自动播放支持
        if(this.config.autoPlay) {
            // 延迟播放以增加成功概率
            setTimeout(() => {
                this.play();
            }, 1000);
        }
    }
    var k,l,m,i=!1,j=!0;
    // 壁纸属性监听器
    window.wallpaperPropertyListener={
        applyUserProperties:function(a){
            if(a.autoImg){
                i=a.autoImg.value;
            }
            if(a.autoPlayer){
                j=a.autoPlayer.value;
            }
            if(a.playerColor){
                k=a.playerColor.value.split(" ");
                k=k.map(function(a){
                    return Math.ceil(255*a);
                });
                e(".grid-music-container").setAttribute("style","background-color: rgba("+k+","+l+")");
            }
            if(a.playerAlpha){
                l=a.playerAlpha.value/100;
                e(".grid-music-container").setAttribute("style","background-color: rgba("+k+","+l+")");
            }
        }
    };
    m=null;
    // 音乐播放器原型方法
    n.prototype={
        config:{
            musicList:[],
            bgImgList:[],
            defaultVolume:.7,
            defaultIndex:0,
            defaultMode:1,
            callback:function(){},
            autoPlay: false // 新增自动播放配置项
        },
        setBuffer:function(a,b){
            var c=b.parentNode.offsetWidth;
            m=setInterval(function(){
                var e,d=a.buffered.length;
                if(d>0&&void 0!=a.buffered){
                    e=a.buffered.end(d-1)/a.duration*c;
                    b.style.width=e+"px";
                    if(Math.abs(a.duration-a.buffered.end(d-1))<1){
                        b.style.width=c+"px";
                        clearInterval(m);
                    }
                }
            },1e3);
        },
        resetPlayer:function(a){
            var b,c,d,e;
            if(a>=this.musicLength-1){
                a=this.musicLength-1;
            }
            if(0>=a){
                a=0;
            }
            this.currentMusic=a;
            b=this.musicList[a];
            c=this;
            d=function(){
                return c.setBuffer(this,c.musicDom.bufferProcess);
            };
            this.audioDom.removeEventListener("canplay",d,!1);
            clearInterval(m);
            this.musicDom.bufferProcess.style.width="0px";
            this.musicDom.curProcess.style.width="0px";
            this.audioDom.src="music/"+b;
            this.musicDom.title.innerHTML="<strong>"+b+"</strong>";
            this.audioDom.addEventListener("canplay",d,!1);
            if(j){
                this.play();
            }else{
                this.pause();
            }
            e=b;
            e.index=a;
            if("function"==typeof this.config.callback){
                this.config.callback(e);
            }
        },
        setVolume:function(b){
            var f,d=this.musicDom.volume,e=d.volumeEventer.offsetHeight||50;
            if(0>=b){
                b=0;
            }
            if(b>=1){
                b=1;
            }
            this.audioDom.volume=b;
            f=e*b;
            d.volumeCurrent.style.height=f+"px";
            d.volumeCtrlBar.style.bottom=f+"px";
            d.volumeProcess.setAttribute("data-volume",b);
            if(0==b){
                a(d.volumeControl,"muted");
                this.audioDom.muted=!0;
            }else{
                c(d.volumeControl,"muted");
                this.audioDom.muted=!1;
            }
        },
        initPlay:function(){
            var a=this.config.defaultIndex;
            if(2==this.playMode){
                a=this.getRandomIndex();
            }
            // 设置音量
            this.setVolume(this.config.defaultVolume);
            // 加载音频
            this.audioDom.load();
            // 重置播放器
            this.resetPlayer(a);
        },
        play:function(){
            var b=this.musicDom.button.ctrl;
            // 播放音频
            this.audioDom.play()
                .catch(e => {
                    console.log("自动播放失败:", e);
                    // 可以在这里添加用户交互提示，引导用户点击播放
                });
            // 移除 paused 类
            c(b,"paused");
            // 添加 play 类
            a(b,"play");
            // 设置按钮标题为暂停
            b.setAttribute("title","暂停");
            // 移除 paused 类
            c(this.musicDom.cover,"paused");
            // 添加 play 类
            a(this.musicDom.cover,"play");
        },
        pause:function(){
            var b=this.musicDom.button.ctrl;
            // 暂停音频
            this.audioDom.pause();
            // 移除 play 类
            c(b,"play");
            // 添加 paused 类
            a(b,"paused");
            // 设置按钮标题为播放
            b.setAttribute("title","播放");
            // 移除 play 类
            c(this.musicDom.cover,"play");
            // 添加 paused 类
            a(this.musicDom.cover,"paused");
        },
        switchImg:function(a){
            var b=e(".body");
            // 设置背景图片
            b.style.background="url(bgimg/"+this.bgImgList[a]+")";
            // 设置背景图片大小
            b.style.backgroundSize="cover";
            // 设置背景图片位置
            b.style.backgroundPosition="center center";
            // 设置背景图片重复方式
            b.style.backgroundRepeat="no-repeat";
        },
        mini:function(){
            // 隐藏播放器
            this.musicDom.music.style.display="none";
            // 显示最小化按钮
            this.musicDom.mini.style.display="block";
        },
        max:function(){
            // 显示播放器
            this.musicDom.music.style.display="block";
            // 隐藏最小化按钮
            this.musicDom.mini.style.display="none";
        },
        getRandomIndex:function(){
            var e,a=this.currentMusic,b=this.musicLength,c=0,d=[];
            for(c;b>c;c++){
                if(c!=a){
                    d.push(c);
                }
            }
            e=parseInt(Math.random()*d.length);
            return d[e];
        },
        getBgImgRandomIndex:function(){
            var e,a=this.currentBgImg,b=this.bgImgLength,c=0,d=[];
            for(c;b>c;c++){
                if(c!=a){
                    d.push(c);
                }
            }
            e=parseInt(Math.random()*d.length);
            return d[e];
        },
        playByMode:function(a){
            var b=this.playMode,c=this.currentMusic,d=this.musicLength,e=c,f=this.currentBgImg,g=this.bgImgLength;
            if(1==b){
                if("prev"==a){
                    e=d-1>=c&&c>0?c-1:d-1;
                }else if("next"==a||"ended"==a){
                    e=c>=d-1?0:c+1;
                }
                if(i){
                    f=f>=g-1?0:f+1;
                }
            }else if(2==b){
                e=this.getRandomIndex();
                if(i){
                    f=this.getBgImgRandomIndex();
                }
            }else if(3==b){
                e="prev"==a?d-1>=c&&c>0?c-1:d-1:"next"==a?c>=d-1?0:c+1:c;
                if(i){
                    f=f>=g-1?0:f+1;
                }
            }
            // 重置播放器
            this.resetPlayer(e);
            // 切换背景图片
            this.switchImg(f);
            this.currentBgImg=f;
        },
        action:function(){
            var j,f=this,h=this.musicDom.volume,i=this.musicDom.button;
            // 监听音频时间更新事件
            this.audioDom.addEventListener("timeupdate",function(){
                var b,c,d,a=this;
                if(!isNaN(a.duration)){
                    b=g(a.currentTime);
                    c=g(a.duration);
                    d=a.currentTime/a.duration*f.musicDom.bufferProcess.parentNode.offsetWidth;
                    f.musicDom.time.innerHTML=""+b+"/"+c;
                    f.musicDom.curProcess.style.width=d+"px";
                }
            },!1);
            // 监听音频结束事件
            this.audioDom.addEventListener("ended",function(){
                f.playByMode("ended");
            },!1);
            // 监听音量控制按钮点击事件
            h.volumeControl.addEventListener("click",function(c){
                c=c||window.event;
                c.stopPropagation();
                if(b(h.volumeProcess,"show")){
                    d(this,"muted");
                    f.audioDom.muted=b(this,"muted")?!0:!1;
                }else{
                    a(h.volumeProcess,"show");
                }
            },!1);
            // 监听文档点击事件
            document.addEventListener("click",function(a){
                a=a||window.event;
                a.stopPropagation();
                var b=a.target||a.srcElement;
                if(b.parentNode!==h.volumeProcess&&b.parentNode!==e(".grid-music-container .u-volume")){
                    c(h.volumeProcess,"show");
                }
            },!1);
            // 监听音量事件区域点击事件
            h.volumeEventer.addEventListener("click",function(a){
                a=a||window.event;
                a.stopPropagation();
                var b=this.offsetHeight,c=a.offsetY,d=(b-c)/b;
                f.setVolume(d);
            },!1);
            // 监听最小化按钮点击事件
            i.max.addEventListener("click",function(){
                f.mini();
            },!1);
            // 监听最小化播放器点击事件
            this.musicDom.mini.addEventListener("click",function(){
                f.max();
            },!1);
            // 监听播放/暂停按钮点击事件
            i.ctrl.addEventListener("click",function(){
                if(b(this,"play")){
                    f.pause();
                }else{
                    f.play();
                }
            },!1);
            // 监听上一曲按钮点击事件
            i.prev.addEventListener("click",function(){
                f.playByMode("prev");
            },!1);
            // 监听下一曲按钮点击事件
            i.next.addEventListener("click",function(){
                f.playByMode("next");
            },!1);
            // 监听列表循环按钮点击事件
            i.listCircular.addEventListener("click",function(){
                a(this,"current");
                c(i.singleCircular,"current");
                c(i.randomPlay,"current");
                f.playMode=1;
            });
            // 监听随机播放按钮点击事件
            i.randomPlay.addEventListener("click",function(){
                a(this,"current");
                c(i.singleCircular,"current");
                c(i.listCircular,"current");
                f.playMode=2;
            });
            // 监听单曲循环按钮点击事件
            i.singleCircular.addEventListener("click",function(){
                a(this,"current");
                c(i.listCircular,"current");
                c(i.randomPlay,"current");
                f.playMode=3;
            });
            j=this.musicDom["curProcess"].parentNode;
            // 监听进度条点击事件
            j.addEventListener("click",function(a){
                var b,c,d;
                a=a||window.event;
                b=this.getBoundingClientRect().left;
                c=this.offsetWidth;
                d=Math.min(c,Math.abs(a.clientX-b));
                if(f.audioDom.currentTime&&f.audioDom.duration){
                    f.audioDom.currentTime=parseInt(d/c*f.audioDom.duration);
                    f.play();
                }
            });
        },
        init:function(){
            // 获取播放器 DOM 元素
            this.musicDom={
                music:e(".grid-music-container"),
                cover:e(".grid-music-container .u-cover"),
                title:e(".grid-music-container .u-music-title"),
                curProcess:e(".grid-music-container .current-process"),
                bufferProcess:e(".grid-music-container .buffer-process"),
                time:e(".grid-music-container .u-time"),
                volume:{
                    volumeProcess:e(".grid-music-container .volume-process"),
                    volumeCurrent:e(".grid-music-container .volume-current"),
                    volumeCtrlBar:e(".grid-music-container .volume-bar"),
                    volumeEventer:e(".grid-music-container .volume-event"),
                    volumeControl:e(".grid-music-container .volume-control")
                },
                button:{
                    ctrl:e(".grid-music-container .ctrl-play"),
                    prev:e(".grid-music-container .prev"),
                    next:e(".grid-music-container .next"),
                    listCircular:e(".grid-music-container .mode-list"),
                    randomPlay:e(".grid-music-container .mode-random"),
                    singleCircular:e(".grid-music-container .mode-single"),
                    max:e(".max")
                },
                mini:e(".mini")
            };
            // 当前音乐索引
            this.currentMusic=this.config.defaultIndex||0;
            // 当前背景图片索引
            this.currentBgImg=this.config.defaultIndex||0;
            // 播放模式
            this.playMode=this.config.defaultMode||1;
            // 创建音频元素
            this.audioDom=document.createElement("audio");
            // 初始化播放
            this.initPlay();
            // 绑定事件
            this.action();
            
            // 调整按钮位置，解决偏移问题
            this.adjustButtonPositions();
        },
        adjustButtonPositions: function() {
            // 调整播放控制按钮位置
            const playControls = this.musicDom.button;
            const playButtonContainer = playControls.ctrl.parentElement;
            
            // 计算居中位置
            const containerWidth = playButtonContainer.offsetWidth;
            const totalButtonWidth = 30 * 3 + 20 * 3 + 15 * 2 + 10 * 2; // 3个30px按钮，3个20px按钮，间距
            const leftOffset = (containerWidth - totalButtonWidth) / 2;
            
            // 设置按钮位置
            playControls.prev.style.marginLeft = `${leftOffset}px`;
            playControls.listCircular.style.marginLeft = '15px';
        }
    };
    // 全局音乐播放器构造函数
    window.Music=function(a){
        return new n(a);
    }
}(window);
// 页面加载完成后执行
window.onload=function(){
    var a={
        o:null,
        init:function(a){
            a.onmousedown=this.start;
        },
        start:function(b){
            var c;
            b=a.fixEvent(b);
            b.preventDefault&&b.preventDefault();
            a.o=c=this;
            c.x=b.clientX-a.o.offsetLeft;
            c.y=b.clientY-a.o.offsetTop;
            document.onmousemove=a.move;
            document.onmouseup=a.end;
        },
        move:function(b){
            b=a.fixEvent(b);
            var c,d;
            c=b.clientX-a.o.x;
            d=b.clientY-a.o.y;
            a.o.style.left=c+"px";
            a.o.style.top=d+"px";
        },
        end:function(b){
            b=a.fixEvent(b);
            a.o=document.onmousemove=document.onmouseup=null;
        },
        fixEvent:function(a){
            if(!a){
                a=window.event;
                a.target=a.srcElement;
                a.layerX=a.offsetX;
                a.layerY=a.offsetY;
            }
            return a;
        }
    };
    var b=document.getElementById("music");
    var c=document.getElementById("mini");
    // 初始化拖动功能
    a.init(b);
    a.init(c);
}