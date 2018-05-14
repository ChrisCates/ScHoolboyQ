# Make them icns for Mac OS bruh
# Make sure to run `yarn global add png2icns` if you don't have that package already...
png2icns icons/q.png -s 16,32,64,128,256 -o icons/q.icns

# Make them apps yo
export ELECTRON_RUN_AS_NODE=true

# Mac OS
electron-packager ./src_js ScHoolboyQ --platform=darwin --icon="icons/q.icns" --out=builds

# Windows
electron-packager ./src_js ScHoolboyQ --platform=win32 --icon="icons/q.ico" --out=builds

# Linux
electron-packager ./src_js ScHoolboyQ --platform=linux --icon="icons/q.ico" --out=builds
