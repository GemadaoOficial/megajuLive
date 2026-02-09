const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let serverProcess;

// Configurar caminhos para produção
const getServerPath = () => {
  if (isDev) {
    return path.join(__dirname, '..', 'server', 'dist', 'index.js');
  }
  // Em produção, o servidor está em resources/server/dist
  return path.join(process.resourcesPath, 'server', 'dist', 'index.js');
};

// Inicializar banco de dados (copiar template se não existir)
function initDatabase(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.log('📦 Primeira execução - criando banco de dados...');
    const templatePath = isDev
      ? path.join(__dirname, '..', 'server', 'database-initial.db')
      : path.join(process.resourcesPath, 'server', 'database-initial.db');

    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, dbPath);
      console.log('✅ Banco de dados inicial criado');
    } else {
      console.warn('⚠️  Template do banco não encontrado, será criado vazio');
    }
  } else {
    console.log('✅ Banco de dados existente encontrado');
  }
}

// Iniciar servidor Express
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Iniciando servidor Express...');

    const serverPath = getServerPath();
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database.db');

    console.log('📁 Caminho do servidor:', serverPath);
    console.log('📁 Caminho do banco:', dbPath);

    // Inicializar banco de dados
    initDatabase(dbPath);

    // Configurar variáveis de ambiente
    const env = {
      ...process.env,
      DATABASE_URL: `file:${dbPath}`,
      JWT_SECRET: 'shopee-live-secret-key-change-in-production',
      PORT: '5000',
      NODE_ENV: 'production',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
    };

    // Em produção, o servidor está empacotado no resources
    serverProcess = spawn('node', [serverPath], {
      env,
      stdio: 'inherit'
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar servidor:', error);
      reject(error);
    });

    // Aguardar o servidor ficar pronto
    setTimeout(() => {
      console.log('✅ Servidor Express iniciado na porta 5000');
      resolve();
    }, 3000);
  });
}

// Criar janela principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    // icon: path.join(__dirname, 'icon.png'), // Adicione seu ícone aqui
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    backgroundColor: '#0f172a',
    show: false,
    frame: true,
    titleBarStyle: 'default'
  });

  // Remover menu padrão
  Menu.setApplicationMenu(null);

  // Carregar aplicação
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Em produção, carregar o build do Vite
    mainWindow.loadURL('http://localhost:5000');
  }

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Janela principal carregada');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Quando o Electron estiver pronto
app.whenReady().then(async () => {
  try {
    console.log('🎯 MegaJu Live - Iniciando aplicação...');

    // Iniciar servidor Express
    await startServer();

    // Criar janela
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar aplicação:', error);
    app.quit();
  }
});

// Fechar servidor quando a aplicação fechar
app.on('window-all-closed', () => {
  if (serverProcess) {
    console.log('🛑 Encerrando servidor Express...');
    serverProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Promise rejeitada:', error);
});
