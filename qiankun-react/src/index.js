import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

function render(props) {
  console.log('render', props)
  const container = props?.container;
  ReactDOM.render(<App />, container ? container.querySelector('#root') : document.querySelector('#root'));
}

if (window.__POWERED_BY_QIANKUN__) {
  console.log('QIANKUN', window['reactApp'])
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

if(!window.__POWERED_BY_QIANKUN__){
  console.log('N_QIANKUN')
  render();
}

export async function bootstrap(){
 
}
export async function mount(props) {
  console.log('mount', props)
  render(props)
}
export async function unmount(props) {
  const container = props?.container;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
}