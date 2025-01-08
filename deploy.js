const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置项
const config = {
    // 需要监控的文件
    watchFiles: [
        'bot.js',
        'js/app.js',
        'package.json',
        'index.html',
        'css/style.css'
    ],
    // Git 配置
    git: {
        branch: 'main',
        commitMessage: 'feat: Update bot and webapp\n\nChanges:\n- Updated user info display\n- Enhanced parameter handling\n- Improved UI/UX'
    },
    // PM2 配置
    pm2: {
        appName: 'telegram-bot'
    }
};

// 执行命令的 Promise 包装
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${command}`);
                console.error(error);
                reject(error);
                return;
            }
            console.log(stdout);
            if (stderr) console.error(stderr);
            resolve(stdout);
        });
    });
}

// 检查文件是否存在
function checkFiles() {
    console.log('Checking files...');
    for (const file of config.watchFiles) {
        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }
    }
    console.log('All files exist ✅');
}

// Git 操作
async function gitOperations() {
    console.log('\nPerforming Git operations...');
    try {
        // 添加文件
        await execCommand('git add ' + config.watchFiles.join(' '));
        console.log('Files added to git ✅');

        // 提交更改
        await execCommand(`git commit -m "${config.git.commitMessage}"`);
        console.log('Changes committed ✅');

        // 推送到远程
        await execCommand(`git push origin ${config.git.branch}`);
        console.log('Changes pushed to remote ✅');
    } catch (error) {
        console.error('Git operations failed ❌');
        throw error;
    }
}

// 安装依赖
async function installDependencies() {
    console.log('\nInstalling dependencies...');
    try {
        await execCommand('npm install');
        console.log('Dependencies installed ✅');
    } catch (error) {
        console.error('Failed to install dependencies ❌');
        throw error;
    }
}

// PM2 操作
async function pm2Operations() {
    console.log('\nManaging PM2 process...');
    try {
        // 检查 PM2 是否安装
        try {
            await execCommand('pm2 -v');
        } catch (error) {
            console.log('PM2 not found, installing...');
            await execCommand('npm install -g pm2');
        }

        // 停止现有进程
        try {
            await execCommand(`pm2 delete ${config.pm2.appName}`);
            console.log('Existing process stopped ✅');
        } catch (error) {
            // 忽略错误，可能是进程不存在
        }

        // 启动新进程
        await execCommand(`pm2 start bot.js --name ${config.pm2.appName}`);
        console.log('New process started ✅');

        // 保存 PM2 配置
        await execCommand('pm2 save');
        console.log('PM2 configuration saved ✅');
    } catch (error) {
        console.error('PM2 operations failed ❌');
        throw error;
    }
}

// 主函数
async function deploy() {
    console.log('Starting deployment...\n');
    try {
        // 检查文件
        checkFiles();

        // Git 操作
        await gitOperations();

        // 安装依赖
        await installDependencies();

        // PM2 操作
        await pm2Operations();

        console.log('\n✨ Deployment completed successfully! ✨');
    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        process.exit(1);
    }
}

// 执行部署
deploy(); 
