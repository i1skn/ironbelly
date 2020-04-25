#/bin/sh

if [ -z $1 ]; then
  echo "Please provide tx_slate_id"
  exit
fi

SLATE_PATH=slates/$1.grinslate

adb pull /data/user/0/app.ironbelly/files/$SLATE_PATH $SLATE_PATH
grin-wallet --floonet -p 1 receive -i $SLATE_PATH  
adb push $SLATE_PATH.response /sdcard/Download/
