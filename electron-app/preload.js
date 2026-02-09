const { contextBridge } = require('electron');

// Expor informações seguras para o renderer process
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron
});

console.log('⚡ Preload script carregado');
