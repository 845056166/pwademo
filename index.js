const host = 'http://huidoo.com.cn:8899';
const api = 'news';
window.getNews = () => new Promise((resolve, reject) => {
fetch(`${host}/${api}`).then(response => response.json())
    .then(res => {
    if (res.code === 200){
        resolve(res);
    } else {
        reject(res);
    }
})
});