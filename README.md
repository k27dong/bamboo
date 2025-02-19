```
折盡武昌柳，掛席上瀟湘。
二年魚鳥江上，笑我往來忙。
富貴何時休問，離別中年堪恨，憔悴鬢成霜。
絲竹陶寫耳，急羽且飛觴。

  ——辛棄疾
```

<h2 align="center">bamboo</h2>

<h4 align="center">A Discord bot for streaming NetEase Cloud Music</h4>

<p align="center">
  <a href="https://github.com/discordjs"><img src="https://img.shields.io/badge/discord.js-v14.16.3-f7df1e.svg?logo=pnpm" alt="discord.js badge" /></a>
  <a href="https://discord.gg/yYrT6qfy"><img src="https://img.shields.io/discord/966754695123177554.svg?logo=discord&colorB=7289DA&label=Support&logoColor=FAFAFA" alt="Support server badge"/></a>
  <a href="https://www.codefactor.io/repository/github/k27dong/bamboo"><img src="https://img.shields.io/codefactor/grade/github/k27dong/bamboo/master?logo=CodeFactor"  alt="Code quality badge"/></a>
  <a href="https://top.gg/bot/899025207161929768"><img src="https://top.gg/api/widget/servers/899025207161929768.svg"></a>
</p>

<p align="center">
  <a href="https://discord.com/api/oauth2/authorize?client_id=899025207161929768&permissions=8&scope=bot%20applications.commands"><img src="https://github.com/user-attachments/assets/c2c55d9c-a410-41dd-9713-07a4356e3952" width="180"/></a>
  <a href="https://www.buymeacoffee.com/kefan"><img src="https://github.com/user-attachments/assets/2c8af35e-e09a-481d-a25e-a9c778359ae2" width="180"/></a>
</p>

## Overview

Bamboo is a Discord bot written in TypeScript that lets you stream music from [NetEase Cloud Music](https://music.163.com/). It is built with modern toolchain for efficiency and deployed on Vultr for reliable uptime.

[中文文档](https://github.com/k27dong/bamboo/blob/master/README_CN.md)

## Installation

The official instance of Bamboo is hosted on a server that operates 24/7 with auto-restart capabilities. To introduce it to your server, click on the invite button above. For a more personalized and reliable experience, it is recommended to host your own instance of Bamboo.

Bamboo is actively developed and maintained. If you encounter any bugs or have suggestions, feel free to join the support server and share your feedback!

[Join the Official Discord Server](https://discord.gg/p6F32GejZT)

## Development

### Prerequisites

- [`Node.js`]: Runtime for the project
- [`pnpm`]: Package manager
- [`ffmpeg`]: Required for audio processing and streaming

### Usage

1. `pnpm install`: Install dependencies
2. create a `.env.development` file in the root directory with the format of `.env.example`, and fill in the required fields
3. `pnpm dev`: build and run the bot in development mode

## Demo (Sound On)

### Play songs from an album:

<div align="center">
  <video src="https://github.com/user-attachments/assets/2ce8fdde-f4db-4fb8-a317-17b662bf1828"/>
</div>

### Play songs from a user playlist

<div align="center">
  <video src="https://github.com/user-attachments/assets/191fe1c0-6879-4523-be01-f0ca9ac1128b"/>
</div>

### Play a song by its name:

<div align="center">
  <video src="https://github.com/user-attachments/assets/6c5d0b8d-6371-4756-8b1c-26e3e32e26e0"/>
</div>

### Display lyrics:

<div align="center">
  <video src="https://github.com/user-attachments/assets/f13f4f1f-b4d3-44b2-932d-decbb96d2cad"/>
</div>


## Contributors

<a href="https://github.com/k27dong/bamboo/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=k27dong/bamboo"  alt="Contributor badge"/>
</a>

[`node.js`]: https://nodejs.org/en/download
[`pnpm`]: https://pnpm.io/installation
[`ffmpeg`]: https://ffmpeg.org/
