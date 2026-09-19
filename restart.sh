#!/data/data/com.termux/files/usr/bin/bash
set -e
cd /data/data/com.termux/files/home/audiobook2
for apppid in $(pgrep -x node); do
 if [ "$(readlink /proc/$apppid/cwd 2>/dev/null)" = "$PWD" ]; then kill "$apppid"; fi
done
sleep 1
nohup env PORT=3002 HOST=0.0.0.0 node termux-server.mjs > server.log 2>&1 < /dev/null &
echo $! > server.pid
