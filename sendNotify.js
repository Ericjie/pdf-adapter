'use strict';

function initNIM(account, token, callback) {
    var re = /[\s\S]+?\.(\S+?)\.[\s\S]+/i;
    var envir = {
        'edu-pad': 'online',
        'learningpad': 'test',
        'schoolpad': 'pre',
        undefined: 'test'
    }[location.href.match(re)[1]] || 'test';
    var configMap = {
        test: {
            appkey: 'XXXXXXXXXXXXXXXXX',
            url:'https://apptest.netease.im'
        },
        pre:{
            appkey: 'XXXXXXXXXXXXXXXXX',
            url:'http://preapp.netease.im:8184'
        },
        online: {
            appkey: 'XXXXXXXXXXXXXXXXX',
            url:'https://app.netease.im'
        }
    };
    window.nim = NIM.getInstance({
        // 初始化SDK
        // debug: true
        appKey: configMap[envir].appkey,
        account: account,
        token: token,
        onconnect: onConnect,
        onerror: onError,
        onwillreconnect: onWillReconnect,
        ondisconnect: onDisconnect,
        // 多端登录
        onloginportschange: onLoginPortsChange
    });

    function onConnect() {
        console.log('连接成功');
        callback();
    }
    function onWillReconnect(obj) {
        // 此时说明 `SDK` 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
        console.log('即将重连');
        console.log(obj.retryCount);
        console.log(obj.duration);
    }
    function onDisconnect(error) {
        // 此时说明 `SDK` 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
        console.log('丢失连接');
        console.log(error);
        if (error) {
            switch (error.code) {
                // 账号或者密码错误, 请跳转到登录页面并提示错误
                case 302:
                    break;
                // 被踢, 请提示错误后跳转到登录页面
                case 'kicked':
                    break;
                default:
                    break;
            }
        }
    }
    function onError(error) {
        console.log(error);
    }

    function onLoginPortsChange(loginPorts) {
        console.log('当前登录帐号在其它端的状态发生改变了', loginPorts);
    }
}
function sendNotify(_ref,is_timework,life_time,typecode,isStudentCheck) {
    var slist = _ref.slist,
        type = _ref.type, //remind
        callback = _ref.callback, //checksendOk
        account = _ref.account, //老师名
        token = _ref.token,
        code = _ref.code;
    function send() {
        var count = 0,
            total = slist.length, //要发的学生总数
            errorList = [];

        function sendMsgDone(error, msg) {
            if (error) {
                errorList.push({id:msg.to,error:error}); //发送给谁出错了
            } else {
                count++; //统计成功发送的人数
            }
            if (count + errorList.length === total) {
                console.log('出错的学生数组',errorList)
                callback(errorList, type);
            }
        }

        function remind(_ref2) {
            var id = _ref2.id,
                name = _ref2.name,
                to = _ref2.to;

            var msg = nim.sendCustomMsg({
                scene: 'p2p',
                to: to,
                content: JSON.stringify({
                    module: "homework",
                    version: 0.1,
                    ext: "",
                    content: {
                        clue: "remindDoHomework",
                        version: 1,
                        intro: {
                            examId: id, //提醒的作业examId
                            examName: name, //提醒的作业名称
                            isTimerWork: is_timework, // 是否是定时作业 true为定时
                            lifetime: life_time, // 定时作业 定时时间
                            teacherId: account, // 教师ID
                            typeCode: typecode, // 课堂作业 onClass  家庭作业 afterClass
                            isStudentCheck: code // 是否学生自评 true为自评作业
                        }
                    }
                }),
                done: sendMsgDone
            });
        }

        function selfEvaluation(_ref3) {
            var id = _ref3.id,
                to = _ref3.to;

            var msg = nim.sendCustomMsg({
                scene: 'p2p',
                to: to,
                content: JSON.stringify({
                    module: "homework",
                    version: 0.1,
                    ext: "",
                    content: {
                        clue: "needRefreshHomework",
                        version: 1,
                        intro: {
                            examId: id //状态变为自评的examId
                        }
                    }
                }),
                done: sendMsgDone
            });
        }

        if (type === 'remind') {
            slist.map(remind);
        } else if (type === 'evaluation') {
            slist.map(selfEvaluation);
        }
    }
    if (!window.nim) {
        if (!account || !token) {
            throw "未提供用户名或token";
        }
        initNIM(account, token, send);
    } else {
        send();
    }
}
//# sourceMappingURL=sendNotify.js.map