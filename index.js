const host = 'https://huidoo.com.cn:8899';
const api = 'news';
// window.getNews = () => new Promise((resolve, reject) => {
//   fetch(`${host}/${api}`).then(response => response.json())
//     .then(res => {
//     if (res.code === 200){
//         resolve(res);
//     } else {
//         reject(res);
//     }
//  })
// });

window.getNews = () => { 
  const xmlhttp = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
            resolve(JSON.parse(xmlhttp.response));
        } else {
            reject(JSON.parse(xmlhttp.response));
        }
      }
    };
    const url = `${host}/${api}`;
    xmlhttp.open("GET", url, true);
    //发送！！
    xmlhttp.send();
  });
}