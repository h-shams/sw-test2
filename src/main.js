import './main.css'

console.log('hello');

if(navigator.serviceWorker){
  navigator.serviceWorker.register('./sw.js').then( () => {
    console.log('sw registred');
  }).catch(err => {
    console.log(err);
    console.log('error while registering sw');
  })
}else{
  console.log('sw is NOT abaialbe');
}

let btn = document.querySelector('.btn')

btn.addEventListener('click', event => {
  console.log('btn clicked :D');
  fetch('http://localhost:3000/CMD/DELETE_OLD_CACHES').then(res => {
    res.json().then( json => {
      console.log(json);
    })
  })
})
