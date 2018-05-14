# Move into ui folder
echo "cded into ui folder"
cd ui
# Build ui
echo "Build angular app"
ng build --prod
# Move ui
echo "cleaning old src ui"
rm -rf ../src_js/web_ui
mkdir ../src_js/web_ui
echo "copying ui into src"
cp -r ./dist/* ../src_js/web_ui
# Remove original dist folder
echo "removing dist folder"
rm -rf ./dist
