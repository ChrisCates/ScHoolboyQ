# Move the dist file over to src_js
echo "Copying dist of ui to src_js"
cp -r ui/dist src_js/web_ui
echo "Copying package.json in src_js"
cp package.json src_js/package.json
echo "Updating src_js node_modules"
cd src_js
yarn install
