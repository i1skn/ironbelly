aab=$1
apks=app.apks
apk=app.apk
pass=$(security -q find-generic-password -a "Ivan Sorokin" -s "android_keystore" -w)
bundletool build-apks --mode=universal --bundle=$aab --output=$apks --ks=./app/upload-key.keystore --ks-pass="pass:$pass" --ks-key-alias=upload-key-alias --key-pass="pass:$pass"
mv $apks apks.zip 
unzip apks.zip  -d apks
mv apks/universal.apk $apk 
rm -rf apks.zip
rm -rf apks