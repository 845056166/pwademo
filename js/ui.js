let divWrapper = null;
let divText = null;
window.addEventListener('load', function() {
  divWrapper = this.document.createElement('div');
  divText = this.document.createElement('div');
  divText.classList.add('text');
  divText.innerText = '';
  divWrapper.insertAdjacentElement('afterbegin', divText);
  divWrapper.classList.add('tips','hide');
// 'beforebegin': 在该元素本身的前面.
// 'afterbegin':只在该元素当中, 在该元素第一个子孩子前面.
// 'beforeend':只在该元素当中, 在该元素最后一个子孩子后面.
// 'afterend': 在该元素本身的后面.
  document.body.insertAdjacentElement('beforeend', divWrapper);
  window.ui = {
    showTips(text = '测试', type = 'info') {
      divText.innerText = text;
      divText.classList.add(type);
      divWrapper.classList.remove('hide');
      const timer = setTimeout(function() {
        divWrapper.classList.add('hide');
        clearTimeout(timer);
      }, 3000);
    }
  };
})


// const text = div;