// ==UserScript==
// @name            pawchive下载当前页面
// @description     pawchive下载当前页面的所有图片
// @version         1.0.1
// @author          Ealvn
// @license         MIT
// @match           https://pawchive.pw/*
// @icon            https://pawchive.pw/static/favicon.png
// @grant           GM_download
// @grant           GM_getResourceText
// @grant           GM_info
// @grant           GM_registerMenuCommand
// @grant           GM_xmlhttpRequest
// @require         https://cdnjs.cloudflare.com/ajax/libs/jszip/3.9.1/jszip.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js
// @require         https://code.jquery.com/jquery-3.7.1.slim.min.js
// ==/UserScript==


(function () {

    // const language = navigator.language || navigator.userLanguage;

    // var openInNew = GM_getValue('OpenInNew', false);

    // let openInNewId = GM_registerMenuCommand(`[${openInNew ? "✔" : "✖"}]新建标签页打开`, openInNew_callback);

    // function openInNew_callback() {
    //     GM_unregisterMenuCommand(openInNewId);
    //     openInNew = !openInNew;
    //     GM_setValue('OpenInNew', openInNew);
    //     openInNewId = GM_registerMenuCommand(`[${openInNew ? "✔" : "✖"}]新建标签页打开`, openInNew_callback);
    // }

    // var domain = GM_getValue('Domain', 'kemono.cr');

    // let domainId = GM_registerMenuCommand(`当前域名：${domain}`, domain_callback);

    // function domain_callback() {
    //     var result = prompt(language === 'zh-CN' ? '请输入域名, 例如kemono.su' : 'Please enter the domain name, for example kemono.su', domain);
    //     if (!result) return;
    //     domain = result;
    //     GM_setValue('Domain', domain);
    //     GM_unregisterMenuCommand(domainId);
    //     domainId = GM_registerMenuCommand(`当前域名：${domain}`, domain_callback);
    // }



    //创建容器
    const item = document.createElement('item');
    item.id = 'SIR';
    item.innerHTML = `
		<div id="hover-1" style="position:fixed;top:1px;left:0;width:100vw;height:100vh;background-color:rgba(0,0,0,0.3);display:none;z-index:5000"></div>
		<div id="mb-uma-sel" style="position:fixed;top:10vh;left:10vw; width:80vw;height:inherit;display:none;z-index:6000">
		<div style="width:100%;height:70vh;background: #333333;border-radius: 30px;padding: 50px;">
		<div class="btn1 btn-warning" id="uma-sel-cancel" style="position:fixed;top:100px;right:150px;z-index:6200;background: orange;border-radius: 5px;padding: 5px;">关闭弹窗</div>
		<div class="progress-container"  style="padding: 50px;" id="progress-container" >
            <div class="status-text" id="status-text">准备下载...</div>
            <div class="progress-bar">
				<div class="progress" id="progress-bar"></div>
            </div>
            <div id="file-counter">正在处理: 0/0</div>
        </div>
		</div>
		</div>
        <input type="text" id="filename" placeholder="文件名..." size="16">
        <button id="ealvndl01" class="SIR-button" style="right: 72px;">一键下载</button>
		<button id="ealvndl02" class="SIR-button">保存为zip</button>
        `;

    document.body.append(item)

    //创建样式
    const style = document.createElement('style');
    style.innerHTML = `
        /* Light mode */
        @media (prefers-color-scheme: light) {
            #SIR * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
            }
            #SIR .SIR-button {
                display: inline-block;
                height: 22px;
                margin-right: 10px;
                opacity: 0.5;
                background: white;
                font-size: 13px;
                padding:0 5px;
                position:fixed;
                bottom:2px;
                right:2px;
                border: solid 2px black;
                z-index: 999;
            }
            #filename {
                display: inline-block;
                height: 22px;
                opacity: 0.5;
                font-size: 13px;
                position:fixed;
                bottom:27px;
                right:12px;
                border: solid 2px black;
                z-index: 999;
            }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
            #SIR * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
            }
            #SIR .SIR-button {
                display: inline-block;
                height: 22px;
                margin-right: 10px;
                opacity: 0.5;
                font-size: 13px;
                padding:0 5px;
                position:fixed;
                bottom:2px;
                right:2px;
                border: solid 2px white;
                z-index: 999;
            }
            #filename {
                display: inline-block;
                height: 22px;
                opacity: 0.5;
                font-size: 13px;
                position:fixed;
                bottom:27px;
                right:12px;
                border: solid 2px white;
                z-index: 999;
            }
        }
		.progress-container {
            padding: 20px;
            text-align: center;
        }

        .progress-bar {
            height: 10px;
            background: #e9ecef;
            border-radius: 5px;
            overflow: hidden;
            margin: 20px 0;
        }

        .progress {
            height: 100%;
            background: linear-gradient(90deg, #6a11cb, #2575fc);
            width: 0%;
            transition: width 0.3s ease;
        }

        .status-text {
            font-size: 1.1rem;
            margin-bottom: 10px;
            color: white;
        }

        #file-counter {
            color: white;
        }
		.btn1 {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px
}
        `;

	const animate = {
	"showZ": $el => {
		$el.show();
        $el.removeClass("animate__animated animate__zoomOut");
        $el.addClass("animate__animated animate__zoomIn");
	},
	"hideZ": $el => {
		setTimeout(() => $el.hide(), 100);
        $el.removeClass("animate__animated animate__zoomIn");
        $el.addClass("animate__animated animate__zoomOut");
	},
	"hideHover": $el => {
		setTimeout(() => $el.hide(), 100);
	},
	};
	const showZ = animate.showZ;
	const hideZ = animate.hideZ;
	const hideHover = animate.hideHover;

    $("#ealvndl01").click(async () => {
        await DownloadAll();
    });
    $("#ealvndl02").click(async () => {
		showZ($("#mb-uma-sel"));
		$("#hover-1").show();
        await DownloadZip();
		//fixedBody();
    });
    $("#uma-sel-cancel").click(function() {
		hideHover($("#hover-1"));
		hideZ($("#mb-uma-sel"));
		//looseBody();
    });

    document.head.append(style)
})();

function fixedBody () {
	let scrollTop = document.body.scrollTop || document.documentElement.scrollTop
    document.body.style.cssText += 'position:fixed;width:100%;top:-' + scrollTop + 'px;'
    //$("wiki-nav-celling").hide();
    //$(".wiki-header").css("visibility", "hidden");
}

function looseBody () {
    let body = document.body
    body.style.position = ''
    let top = body.style.top
    document.body.scrollTop = document.documentElement.scrollTop = -parseInt(top)
    //$("wiki-nav-celling").show();
    //$(".wiki-header").css("visibility", "visible");
  //  body.style.top = ''
}

// 从URL中正确提取文件扩展名（保留原始格式）
function getFileExtensionFromUrl(url) {
    // 移除查询参数
    const cleanUrl = url.split('?')[0];
    // 获取文件名
    const filename = cleanUrl.split('/').pop();
    // 提取扩展名（包括点号）
    const ext = filename.includes('.') ? '.' + filename.split('.').pop().toLowerCase() : '.jpg';
    return ext;
}

async function DownloadZip() {
	const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status-text');
	const fileCounter = document.getElementById('file-counter');

	var download_list = document.querySelectorAll("div.post__thumbnail");
	var text_input = document.getElementById("filename").value;
	var zipfilename = decodeURI(document.querySelector("h1.post__title>span").innerHTML);
	var zip = new JSZip();
	// 显示进度条
    progressContainer.style.display = 'block';
    statusText.textContent = '正在准备下载...';
    progressBar.style.width = '0%';
    fileCounter.textContent = `正在处理: 0/${download_list.length}`;
	for(var i = 0; i < download_list.length; i++){
        var download_url = "";

        try{
            download_url = download_list[i].querySelector("a.fileThumb").href;
        } catch (error) {
            download_url = download_list[i].querySelector("img").src;
        }finally {
            var url = download_url.toString().split("?f=")[0];
            var filename = decodeURI(document.querySelector("h1.post__title>span").innerHTML);
			// 从URL中提取原始扩展名
			var format = getFileExtensionFromUrl(url);
			console.log("文件格式: " + format)
            if(text_input != ""){
                filename = text_input;
            }
            filename = filename + "_" + i.toString();
            // download image
            console.log(" " + i + " " + url);
			statusText.textContent = `获取图片: ${filename}${format}`;
            fileCounter.textContent = `正在处理: ${i + 1}/${download_list.length}`;
			const blob = await fetchImageAsBlob(url);
			zip.file(filename + format, blob);
			// 更新进度
            const progress = (i / download_list.length) * 100;
            progressBar.style.width = `${progress}%`;
        };
    }
	// 生成ZIP文件
    //statusText.textContent = '正在压缩文件...';
    //var content = zip.generate();
	try{
		statusText.textContent = '正在压缩文件...';
		const content = await zip.generateAsync({type:"blob"});
		saveAs(content, zipfilename+'.zip');
		progressBar.style.width = `100%`;
		statusText.textContent = '下载完成！';
	}catch (error) {
		console.log(error);
		statusText.textContent = '下载出错！';
	}

}


async function DownloadAll(retries = 3) {

    var download_list = document.querySelectorAll("div.post__thumbnail");
    var text_input = document.getElementById("filename").value;
    for(var i = 0; i < download_list.length; i++){
        var download_url = ""
        try{
            download_url = download_list[i].querySelector("a.fileThumb").href;
        } catch (error) {
            download_url = download_list[i].querySelector("img").src;
        }finally {
            var url = download_url.toString().split("?f=")[0];
            var filename = decodeURI(document.querySelector("h1.post__title>span").innerHTML);
            if(text_input != ""){
                filename = text_input;
            }
            filename = filename + "_" + i.toString();
            var format = getFileExtensionFromUrl(url);
            console.log(" " + i + " " + url);
            
            // 关键：使用 await + Promise 确保每个下载按顺序进行
            await new Promise(resolve => {
                setTimeout(() => {
                    downloadImage(url, filename + format, retries);
                    resolve();
                }, 500 * i);  // 每个文件延迟 500ms * 索引
            });
        };
    }
}


// 使用 GM_xmlhttpRequest 绕过 CORS 限制
function fetchImageAsBlob(url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            responseType: 'blob',
            onload: function(response) {
                if (response.status === 200) {
                    resolve(response.response);
                } else {
                    reject(new Error(`HTTP error! status: ${response.status}`));
                }
            },
            onerror: function(error) {
                reject(error);
            }
        });
    });
}


function downloadImage(url, name, retries = 3) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        responseType: 'blob',
        onload: function(response) {
            if (response.status === 200) {
                const blob = response.response;
                const objUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = objUrl;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(objUrl);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        },
        onerror: function(error) {
            if (retries > 0) {
                console.warn(`Download failed for ${url}. Retrying... (${retries} attempts left)`);
                setTimeout(() => downloadImage(url, name, retries - 1), 1000);
            } else {
                console.error(`Download failed for ${url} after multiple retries:`, error);
                alert(`Failed to download ${name}`);
            }
        }
    });
}
