const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let serverProcess;
let logFile;

// Setup logging
function log(message) {
  if (!logFile) {
    logFile = path.join(app.getPath('userData'), 'electron-log.txt');
  }
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (e) {
    console.error('Failed to write log:', e);
  }
}

app.on('ready', () => {
  log('========== MegaJu Live Starting ==========');
  log(`isDev: ${isDev}`);
  log(`Node version: ${process.version}`);
  log(`Electron version: ${process.versions.electron}`);
  log(`UserData path: ${app.getPath('userData')}`);
  log(`Log file: ${logFile}`);
});

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
  log(`initDatabase called with: ${dbPath}`);
  if (!fs.existsSync(dbPath)) {
    log('📦 Primeira execução - criando banco de dados...');
    const templatePath = isDev
      ? path.join(__dirname, '..', 'server', 'database-initial.db')
      : path.join(process.resourcesPath, 'server', 'database-initial.db');

    log(`Template path: ${templatePath}`);
    log(`Template exists: ${fs.existsSync(templatePath)}`);

    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, dbPath);
      log('✅ Banco de dados inicial criado');
    } else {
      log('⚠️  Template do banco não encontrado, será criado vazio');
    }
  } else {
    log('✅ Banco de dados existente encontrado');
  }
}

// Run Prisma DB Push to create tables
function runPrismaDbPush(dbPath, schemaPath) {
  return new Promise((resolve, reject) => {
    log('📊 Running Prisma DB Push to create tables...');

    const prismaPath = isDev
      ? path.join(__dirname, '..', 'server', 'node_modules', '.bin', 'prisma')
      : path.join(process.resourcesPath, 'server', 'node_modules', '.bin', 'prisma');

    log(`Prisma path: ${prismaPath}`);
    log(`Schema path: ${schemaPath}`);

    const prismaProcess = spawn(prismaPath, ['db', 'push', '--skip-generate'], {
      env: {
        ...process.env,
        DATABASE_URL: `file:${dbPath}`,
        PRISMA_SCHEMA: schemaPath
      },
      stdio: 'pipe',
      shell: true
    });

    let output = '';

    prismaProcess.stdout.on('data', (data) => {
      output += data.toString();
      log(`[PRISMA] ${data.toString().trim()}`);
    });

    prismaProcess.stderr.on('data', (data) => {
      output += data.toString();
      log(`[PRISMA] ${data.toString().trim()}`);
    });

    prismaProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Prisma DB Push completed successfully');
        resolve();
      } else {
        log(`❌ Prisma DB Push failed with code ${code}`);
        log(`Output: ${output}`);
        // Don't reject, try to continue anyway
        resolve();
      }
    });

    prismaProcess.on('error', (error) => {
      log(`❌ Error running Prisma: ${error.message}`);
      // Don't reject, try to continue anyway
      resolve();
    });
  });
}

// Iniciar servidor Express
async function startServer() {
  return new Promise(async (resolve, reject) => {
    log('🚀 Iniciando servidor Express...');

    const serverPath = getServerPath();
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database.db');

    const schemaPath = isDev
      ? path.join(__dirname, '..', 'server', 'prisma', 'schema.prisma')
      : path.join(process.resourcesPath, 'server', 'prisma', 'schema.prisma');

    log(`📁 Caminho do servidor: ${serverPath}`);
    log(`📁 Server exists: ${fs.existsSync(serverPath)}`);
    log(`📁 Caminho do banco: ${dbPath}`);
    log(`📁 Schema exists: ${fs.existsSync(schemaPath)}`);

    // Inicializar banco de dados
    try {
      initDatabase(dbPath);
    } catch (e) {
      log(`❌ Erro ao inicializar banco: ${e.message}`);
    }

    // Run Prisma DB Push to create tables
    try {
      await runPrismaDbPush(dbPath, schemaPath);
    } catch (e) {
      log(`❌ Erro ao rodar Prisma DB Push: ${e.message}`);
    }

    // Configurar caminhos do cliente
    const clientPath = isDev
      ? path.join(__dirname, '..', 'client', 'dist')
      : path.join(process.resourcesPath, 'client', 'dist');

    log(`📁 Caminho do cliente: ${clientPath}`);
    log(`📁 Client exists: ${fs.existsSync(clientPath)}`);

    // Configurar variáveis de ambiente
    const OPENAI_KEY = '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';

    const env = {
      ...process.env,
      DATABASE_URL: `file:${dbPath}`,
      JWT_SECRET: 'shopee-live-secret-key-change-in-production',
      PORT: '5000',
      NODE_ENV: 'production',
      CLIENT_PATH: clientPath,
      OPENAI_API_KEY: OPENAI_KEY
    };

    log(`📁 OpenAI Key configured: ${OPENAI_KEY ? 'Yes' : 'No'}`);

    log('Spawning Node.js process...');

    // Em produção, o servidor está empacotado no resources
    serverProcess = spawn('node', [serverPath], {
      env,
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      log(`[SERVER] ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      log(`[SERVER ERROR] ${data.toString().trim()}`);
    });

    serverProcess.on('error', (error) => {
      log(`❌ Erro ao iniciar servidor: ${error.message}`);
      reject(error);
    });

    serverProcess.on('exit', (code) => {
      log(`❌ Servidor fechou com código: ${code}`);
    });

    // Aguardar o servidor ficar pronto
    setTimeout(() => {
      log('✅ Servidor Express iniciado na porta 5000');
      resolve();
    }, 5000);
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
    // Abrir DevTools para debug
    mainWindow.webContents.openDevTools();
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
