/* Used:
 * Bootstrap v3.3.6 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 
 The MIT License (MIT)

Copyright (c) 2011-2018 Twitter, Inc.
Copyright (c) 2011-2018 The Bootstrap Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

// uFR Signer API Version 1.1

var values = {
    run_loop : false,
    counter : 0,
    port_open : false,
}

var DlComands = {
    OPEN_PORT : "OPEN_PORT",
    CLOSE_PORT : "CLOSE_PORT",
    GET_CARD_ID_LAST_EX : "GET_CARD_ID_LAST_EX",
    GET_CARD_ID_EX : "GET_CARD_ID_EX",
    GET_DLOGIC_CARD_TYPE : "GET_DLOGIC_CARD_TYPE",
    READER_UI_SIGNAL : "READER_UI_SIGNAL",
    BLOCK_READ_PK : "BLOCK_READ_PK",
    BLOCK_WRITE_PK : "BLOCK_WRITE_PK",
    CHECK_JC_CARD : "CHECK_JC_CARD",
    SIGN : "SIGN"
}

var DL_OK = 0;

window.onload = function() {
    getTitleByOS();
};
  
function getTitleByOS()
{
    var OSName = "Unknown";
    if (window.navigator.userAgent.indexOf("Windows") != -1) OSName="Windows";
    else if (window.navigator.userAgent.indexOf("Linux") != -1) OSName="Linux";
    else if (window.navigator.userAgent.indexOf("Mac") != -1) OSName="macOS / iOS";
    else if (window.navigator.userAgent.indexOf("X11") != -1) OSName="UNIX";
    
    if (OSName !== "Unknown")
        document.getElementById("h2_title").innerHTML = "uFR Signer running on " + OSName
}

function str2HexStr(hex)
{
    return hex.split('').map(function(c)
    {
        return c.charCodeAt(0).toString(16);
    }).join("");
}

function Hex2Base64(hexstring)
{

    return btoa(hexstring.match(/\w{2}/g).map(function(a)
    {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}

function PerformHex2Base64()
{
    document.getElementById("res_disp").value = Hex2Base64(document.getElementById("res_disp").value);
    return;
}

function printUid(arg)
{
    try
    {
        data = JSON.parse(arg)

    }
    catch (e)
    {
        data = rawResponseToObject(arg);
    }

    if (data.dlStatus == DL_OK)
    {
        document.getElementById("card_uid_box").value = data.data;
    }
    else
    {
        document.getElementById("card_uid_box").value = "";
    }
}

function rawResponseToObject(arg)
{
    var temp = arg.split(',');

    var res = {

        dlStatus : temp[0].split('=')[1],
        dlMsg : temp[1].split('=')[1],
        dlCommand : temp[2].split('=')[1],
        data : temp[3].split('=')[1]
    }
    return res;
}

function clearPlain()
{
    document.getElementById("plain_txt").value = "";
}

function clearSignature()
{
    document.getElementById("signature").value = "";
}

function clearStatus()
{
    dl_status = document.getElementById("dl_status")
    dl_status.value = "";
    dl_status.style.backgroundColor = "White";
}

function setStatus(arg)
{
    dl_status = document.getElementById("dl_status")
    dl_status.value = arg;
    if (arg == "DL_OK")
        dl_status.style.backgroundColor = "LightGreen";
    else
        dl_status.style.backgroundColor = "MistyRose";
}

function print(arg, disp_uid)
{
    document.getElementById("dl_status").value = arg;
}

function GetXmlHttpObject()
{
    var xmlHttp = null;

    try
    {
        xmlHttp = new XMLHttpRequest();
    }
    catch (e)
    {
        try
        {
            // code for old IE browsers
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e)
        {
            // code for oldest IE browsers
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}

function doAjax(param, disp_uid, callback)
{
    var url = document.getElementById("server_url").value;
    var xmlHttp = GetXmlHttpObject();

    xmlHttp.open("POST", url, true);
    xmlHttp.responseType = 'text';
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.onreadystatechange = function(oEvent)
    {
        if (xmlHttp.readyState === 4)
        {
            if (xmlHttp.status === 200)
            {
                print(this.response, disp_uid);
                console.log(this.response);
                if (callback != null && callback != undefined)
                {
                    callback(this.response);
                }
            }
            else
            {
                if (xmlHttp.responseText.length !== 0)
                    alert("Ajax Error:\n" + xmlHttp.responseText);
                else
                    alert("Ajax Error\nPlease check if your SERVER is running.");
            }
        }
    }
    xmlHttp.send("uFrFunct=" + param);
}

function doAjaxMultipart(param, disp_uid, callback)
{
    var url = document.getElementById("server_url").value;
    var xmlHttp = GetXmlHttpObject();
    var formData = new FormData();

    // ...

    var blob = new Blob([ content ], {
        type : "text/xml"
    });
    formData.append("uFrFunct=" + param);
    formData.append("webmasterfile", blob);
    xmlHttp.send(formData);
}

function checkJCCard()
{
    clearSignature()
    clearStatus();
    if (values.run_loop)
    {
        alert("Please first pause loop!");
        return;
    }

    var param = DlComands.CHECK_JC_CARD;

    doAjax(param, false, function(res)
    {
        data = rawResponseToObject(res);
        setStatus(data.dlMsg);
        document.getElementById("signature").value = data.data;
    });
}

function getSignature()
{
    if (values.run_loop)
    {
        alert("Please first pause loop!");
        return;
    }

    if (document.getElementById("plain_txt").value === "")
    {
        alert("\"Plain text\" couldn't be empty!");
        return;
    }

    var digest = document.getElementById("digest_alg").value;
    var cipher = document.getElementById("cipher_alg").value;
    var key_index = document.getElementById("key_index").value;
    var plain = document.getElementById("plain_txt").value;
    var param = DlComands.SIGN + "&digest=" + digest + "&cipher=" + cipher + "&key=" + key_index + "&plain=" + str2HexStr(plain);

    doAjax(param, false, function(res)
    {
        data = rawResponseToObject(res);
        setStatus(data.dlMsg);
        document.getElementById("signature").value = data.data;
    });
}

function hexToBytes(hex)
{
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function splitAtEvery(hex)
{
    var arr = [];
    for (var i = 0; i < hex.length; i += 2)
    {
        arr.push(hex.substr(i, 2));
    }
    return arr;
}

function parseHexString(str)
{
    var result = [];
    while (str.length >= 8)
    {
        result.push(parseInt(str.substring(0, 8), 16));

        str = str.substring(8, str.length);
    }
    return result;
}
