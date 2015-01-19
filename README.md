node-diary
===

> A simple diary tool using Node.js

## Install

The installation requires two steps.

1. In the application root, execute,
```bash
npm install
```

2. In the __node_modules__ directory,
```bash
git clone https://github.com/tatsy/marked.git
cd marked
git checkout imgsize
```

(I have sent pull request to the original marked authors, so please wait for more simple installtion.)

## Usage

1. Execute __start-diary.cmd__ (Windows), or start-diary.sh (Linux and MacOS).
2. Open __http://localhost:3000__ with your brouser.

## Special Markdown

### Support <video> tag

```markdown
$[](your_movie.mp4)
```

is interpreted as

```html
<video src="your_movie.mp4" controls></video>
```
### Number-based media specification

After you upload media files (image or viode files), you can specify them with a notation like __%1__.

```markdown
![](%1)
```

is interpreted as

```html
<img src="your_image_01.jpg" />
```
