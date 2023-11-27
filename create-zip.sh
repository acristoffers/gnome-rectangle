git archive --output=gnome-rectangle.zip HEAD
unzip gnome-rectangle.zip -d gnome-rectangle
rm gnome-rectangle.zip
pushd gnome-rectangle || exit
rm package.json .gitignore .eslintrc.yml create-zip.sh
zip -9 -r ../gnome-rectangle.zip *
popd || exit
rm -rf gnome-rectangle
