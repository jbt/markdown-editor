# Live (GitHub-Flavored) Markdown Editor

[Use it here](//jbt.github.io/markdown-editor)

# Run in local
## Prerequisite
[Docker](https://docs.docker.com/engine/installation/)

## Build
```sh
git clone https://github.com/jbt/markdown-editor.git
cd markdown-editor
docker build -t markdown-editor .
```

## Run
```sh
docker run --rm -p 8080:80 markdown-editor
```

Open `localhost:8080` in web browser to start writing.

# LICENCE
Feel free to take the code and copy it and modify it and use it however you like. (If you really want a licence, see [WTFPL](http://www.wtfpl.net/txt/copying/))
