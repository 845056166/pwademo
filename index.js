const host = 'https://huidoo.com.cn:8899';
const api = 'news';
window.getNews = () => new Promise((resolve, reject) => {
  const requestConfig = {
    // credentials: 'include',//为了在当前域名内自动发送 cookie ， 必须提供这个选项
    method: 'POST',
    // headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    // },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    mode: "cors",//请求的模式
    cache: "force-cache",
    // body: getkey(params),
  };
  fetch(`${host}/${api}`, requestConfig).then(response => response.json())
    .then(res => {
    if (res.code === 200){
        resolve(res);
    } else {
        reject(res);
    }
 })
});
window.queryMessage = () => {
  const requestConfig = {
    // credentials: 'include',//为了在当前域名内自动发送 cookie ， 必须提供这个选项
    method: 'POST',
    // headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    // },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    mode: "cors",//请求的模式
    cache: "force-cache",
    // body: getkey(params),
  };
  return fetch(`https://huidoo.com.cn:9000/blogAdmin/blogUI/queryArticle.action`, requestConfig).then(response => response.json())
}
// https://huidoo.com.cn/blogAdmin/blogUI/queryMessage.action

// const getkey = (obj) => {
//   var arr = [];
//   var str = '';
//   for (const key in obj) {
//     arr.push(key + "=" + obj[key])
//   }
//   str = arr.join('&');
//   return str;
// }
window.sendSubscription = (url, param) => {
  const requestConfig = {
    // credentials: 'include',//为了在当前域名内自动发送 cookie ， 必须提供这个选项
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    mode: "cors",//请求的模式
    cache: "force-cache",
    body: param,
  };
  return fetch(url, requestConfig)
}

window.pushMsg = (url, param) => {
  console.log('param', param);
  // param = { a: 1 };
  const requestConfig = {
    // credentials: 'include',//为了在当前域名内自动发送 cookie ， 必须提供这个选项
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    mode: "cors",//请求的模式
    cache: "force-cache",
    body: JSON.stringify(param),
  };
  console.log(requestConfig);
  
  return fetch(url, requestConfig)
}

// window.getNews = () => { 
//   const xmlhttp = new XMLHttpRequest();
//   return new Promise((resolve, reject) => {
//     xmlhttp.onreadystatechange = function() {
//       if (xmlhttp.readyState == 4) {
//         if (xmlhttp.status == 200) {
//             resolve(JSON.parse(xmlhttp.response));
//         } else {
//             reject(JSON.parse(xmlhttp.response));
//         }
//       }
//     };
//     const url = `${host}/${api}`;
//     xmlhttp.open("GET", url, true);
//     //发送！！
//     xmlhttp.send();
//   });
// }