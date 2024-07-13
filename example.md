export ENCVAL=$(cat ../bookmarks/index.html | node njs-script.js enc)
cat ../selfstatic/template.html | envsubst > ../selfstatic/bookmarks/index.html
