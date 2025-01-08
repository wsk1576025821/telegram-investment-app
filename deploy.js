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
        // 检查 Git 状态
        const status = await execCommand('git status --porcelain');
        if (!status.trim()) {
            console.log('No changes to commit ✅');
            return; // 如果没有更改，直接返回
        }

        // 检查 Git 配置
        try {
            await execCommand('git config user.name');
            await execCommand('git config user.email');
        } catch (error) {
            console.log('Setting up Git config...');
            await execCommand('git config --global user.name "Deployment Bot"');
            await execCommand('git config --global user.email "deploy@example.com"');
        }

        // 添加文件
        for (const file of config.watchFiles) {
            try {
                if (fs.existsSync(file)) {
                    await execCommand(`git add "${file}"`);
                    console.log(`Added ${file} to git ✅`);
                }
            } catch (error) {
                console.warn(`Warning: Could not add ${file}`);
            }
        }

        // 再次检查是否有更改要提交
        const statusAfterAdd = await execCommand('git status --porcelain');
        if (!statusAfterAdd.trim()) {
            console.log('No changes to commit after adding files ✅');
            return;
        }

        // 提交更改
        try {
            await execCommand(`git commit -m "${config.git.commitMessage}"`);
            console.log('Changes committed ✅');
        } catch (commitError) {
            console.error('Commit failed, trying with --allow-empty');
            await execCommand(`git commit --allow-empty -m "${config.git.commitMessage}"`);
            console.log('Changes committed with --allow-empty ✅');
        }

        // 检查远程分支是否存在
        try {
            await execCommand(`git rev-parse --verify origin/${config.git.branch}`);
        } catch (error) {
            console.log(`Remote branch ${config.git.branch} not found, creating...`);
            await execCommand(`git checkout -b ${config.git.branch}`);
        }

        // 推送到远程
        try {
            await execCommand(`git push origin ${config.git.branch}`);
            console.log('Changes pushed to remote ✅');
        } catch (pushError) {
            console.log('Push failed, trying with --force');
            await execCommand(`git push -f origin ${config.git.branch}`);
            console.log('Changes force pushed to remote ✅');
        }
    } catch (error) {
        console.error('Git operations failed ❌');
        console.error('Error details:', error);
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

        // 停止所有可能的 bot 实例
        try {
            // 停止使用应用名称的实例
            await execCommand(`pm2 delete ${config.pm2.appName}`);
            // 停止所有包含 bot.js 的进程
            await execCommand('pm2 delete all');
            console.log('All existing processes stopped ✅');
        } catch (error) {
            // 忽略错误，可能是进程不存在
        }

        // 等待一段时间确保所有进程都已停止
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 启动新进程，添加更多选项
        await execCommand(`pm2 start bot.js --name ${config.pm2.appName} --max-memory-restart 300M --wait-ready --listen-timeout 10000 --kill-timeout 5000`);
        console.log('New process started ✅');

        // 保存 PM2 配置
        await execCommand('pm2 save');
        console.log('PM2 configuration saved ✅');

        // 显示运行状态
        await execCommand('pm2 list');
    } catch (error) {
        console.error('PM2 operations failed ❌');
        throw error;
    }
}

// 添加版本检查
async function checkVersions() {
    const packageJson = require('./package.json');
    const files = [
        { path: 'js/app.js', pattern: /version: ['"](.+?)['"]/ },
        { path: 'index.html', pattern: /css\/style\.css\?v=(.+?)"/ },
        { path: 'index.html', pattern: /app\.js\?v=(.+?)"/ }
    ];

    for (const file of files) {
        const content = fs.readFileSync(file.path, 'utf8');
        const match = content.match(file.pattern);
        if (match && match[1] !== packageJson.version) {
            console.warn(`Version mismatch in ${file.path}: ${match[1]} != ${packageJson.version}`);
        }
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

        // 检查版本
        await checkVersions();

        console.log('\n✨ Deployment completed successfully! ✨');
    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        process.exit(1);
    }
}

// 执行部署
deploy(); 
