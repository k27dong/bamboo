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
  <a href="https://github.com/discordjs">
    <img src="https://img.shields.io/badge/discord.js-v14.11.0-f7df1e.svg?logo=pnpm" alt="discord.js badge" />
  </a>
  <a href="https://discord.gg/yYrT6qfy">
    <img src="https://img.shields.io/discord/966754695123177554.svg?logo=discord&colorB=7289DA&label=Support&logoColor=FAFAFA" alt="Support server badge"/>
  </a>
  <a href="https://www.buymeacoffee.com/kefan">
    <img src="https://img.shields.io/badge/Sponser-me-7E598D?logo=Buy Me A Coffee&logoColor=EAB00E" alt="Sponsor page badge"/>
  </a>
</p>

<p align="center">
  <a href="https://github.com/k27dong/bamboo/actions">
    <img src="https://github.com/k27dong/bamboo/actions/workflows/build.yml/badge.svg" alt="Github action badge"/>
  </a>
  <a href="https://stats.uptimerobot.com/n66xyTlXRK">
    <img src="https://img.shields.io/uptimerobot/status/m795020475-ea6ed10802161d18399aebf6?logo=rescuetime" alt="Uptime badge"/>
  </a>
  <a href="https://www.codefactor.io/repository/github/k27dong/bamboo">
    <img src="https://img.shields.io/codefactor/grade/github/k27dong/bamboo/master?logo=CodeFactor"  alt="Code quality badge"/>
  </a>
  <a href="https://github.com/k27dong/bamboo/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License badge">
  </a>
</p>

## Overview

Bamboo is a Discord bot that allows you to stream music from [NetEase Cloud Music](https://music.163.com/) to Discord voice channels. It is written in JavaScript with [discord.js](https://discord.js.org/).

[中文文档](https://github.com/k27dong/bamboo/blob/master/README_CN.md)

## Installation

[Invite to Server](https://discord.com/api/oauth2/authorize?client_id=899025207161929768&permissions=8&scope=bot%20applications.commands)

The official instance of Bamboo is hosted on a server that operates 24/7 with auto-restart capabilities. To introduce it to your server, click on the invite link above. However, due to potential high traffic, the server may experience slowdowns which may affect your experience. For a more personalized and reliable experience, it is recommended to host your own instance of Bamboo.

Bamboo is still in its early stages of development. If you encounter any bugs or have any suggestions, please feel free to join the support server and let us know!

[Join the Official Discord Server](https://discord.gg/p6F32GejZT)

## Development

> **Note**
> As of August 2023, the static binary of `ffmpeg` on Linux-based systems would incorrectly trigger the `AudioPlayerStatus` event in `discord.js`, causing Bamboo to stop playing music. To fix this, it is required for Linux users to bypass the static binary by manually installing `ffmpeg` via `apt`:
>
> ```shell
> $ sudo apt update && sudo apt install ffmpeg
> ```
>
> For other systems, it is also recommended to install
> `ffmpeg` for better performance, and it can be done simply via `pnpm`:
>
> ```shell
> $ pnpm install ffmpeg-static
> ```
>
> More information can be found in [this thread](https://github.com/Androz2091/discord-player/issues/1639#issuecomment-1477466885).

- Install [Node.js](https://nodejs.org/en/) >= v16 and [pnpm](https://pnpm.io/).
- For Docker: `docker compose up`
- For Node: `pnpm install && pnpm start`

## Demo

Play songs from an album:

<p align="center">
  <img src="https://github.com/k27dong/bamboo/assets/46537987/b28eefca-cc62-4d59-b16c-ed176a21a373" width="95%" height="95%" alt="album_demo"/>
</p>

Play songs from a user playlist

<p align="center">
  <img src="https://github.com/k27dong/bamboo/assets/46537987/8933171a-adfd-44b3-a30c-e28a1565df5f" width="95%" height="95%" alt="playlist_demo"/>
</p>

Play a song by its name:

<p align="center">
  <img src="https://github.com/k27dong/bamboo/assets/46537987/6233aad5-185c-4343-8bdc-663c9709f18d" width="95%" height="95%" alt="play_demo"/>
</p>

Display lyrics:

<p align="center">
  <img src="https://github.com/k27dong/bamboo/assets/46537987/99e336cb-886f-4660-af8b-f67b6347cb67" width="95%" height="95%" alt="lyric_demo"/>
</p>

## Contributors

<a href="https://github.com/k27dong/bamboo/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=k27dong/bamboo"  alt="Contributor badge"/>
</a>

