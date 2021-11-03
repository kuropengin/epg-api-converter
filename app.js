
const express = require('express');
const { createProxyMiddleware , responseInterceptor } = require('http-proxy-middleware');

const app = express();

const epg_url = process.env.EPGURL;
const convert_url = process.env.CNVURL;


const reg =　new RegExp(epg_url.replace(/\//g, "\/") , 'g')


const convert_api = createProxyMiddleware({ 
  target: epg_url, 
  changeOrigin: true ,
  selfHandleResponse: true, 
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    const response = responseBuffer.toString('utf8');
    return response.replace(reg, convert_url);
  })
});

const config_api = createProxyMiddleware({ 
  target: epg_url,
  changeOrigin: true ,
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    const response = responseBuffer.toString('utf8');
    return response.replace('"socketIOPort":8888', '"socketIOPort":443');
  })
});

const normal_api = createProxyMiddleware({ 
  target: epg_url, 
  changeOrigin: true
});

app.use('/api/streams/live/*/m2ts/playlist', convert_api);

app.use('/api/config', config_api);

app.use('/*', normal_api);


module.exports = app;
