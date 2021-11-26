export GITHUB_TOKEN=$GITHUB_TOKEN
sudo nohup ${NVM_BIN}/node --title aegis dist/index.js >public/aegis.log 2>&1 &
