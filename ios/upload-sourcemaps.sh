#/bin/sh
set -x
version=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" "${PRODUCT_SETTINGS_PATH}")
api_key=$(/usr/libexec/PlistBuddy -c "Print BugsnagAPIKey" "${PRODUCT_SETTINGS_PATH}")
DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH
../node_modules/.bin/bugsnag-sourcemaps upload \
	--api-key "$api_key" \
	--app-version "$version" \
	--minified-file "$DEST/main.jsbundle" \
	--minified-url main.jsbundle \
	--source-map "$DEST/main.jsbundle.map" \
	--upload-sources \
	--overwrite
rm "$DEST/main.jsbundle.map"
