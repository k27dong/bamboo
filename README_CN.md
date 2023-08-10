```
折盡武昌柳，掛席上瀟湘。
二年魚鳥江上，笑我往來忙。
富貴何時休問，離別中年堪恨，憔悴鬢成霜。
絲竹陶寫耳，急羽且飛觴。

  ——辛棄疾
```

<h2 align="center">bamboo</h2>

<h4 align="center">一个播放网易云音乐的Discord机器人</h4>

<p align="center">
  <a href="https://github.com/discordjs">
    <img src="https://img.shields.io/badge/discord.js-v14.11.0-f7df1e.svg?logo=pnpm" alt="discord.js badge" />
  </a>
  <a href="https://discord.gg/yYrT6qfy">
    <img src="https://img.shields.io/discord/966754695123177554.svg?logo=discord&colorB=7289DA&label=Support&logoColor=fafafa" alt="Support server badge"/>
  </a>
  <a href="https://www.buymeacoffee.com/kefan">
    <img src="https://img.shields.io/badge/Sponser-me-bd5fff" alt="Sponsor page badge"/>
  </a>
</p>

<p align="center">
  <a href="https://github.com/k27dong/bamboo/actions">
    <img src="https://github.com/k27dong/bamboo/actions/workflows/build.yml/badge.svg" alt="Github action badge"/>
  </a>
  <a href="https://www.codefactor.io/repository/github/k27dong/bamboo">
    <img src="https://img.shields.io/codefactor/grade/github/k27dong/bamboo/master"  alt="Code quality badge"/>
  </a>
  <a href="https://github.com/k27dong/bamboo/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License badge">
  </a>
</p>

## 介绍

Bamboo(竹) 是一个播放[网易云音乐](https://music.163.com/)的Discord机器人，使用[discord.js](https://discord.js.org/)与JavaScript编写。

[English Readme](https://github.com/k27dong/bamboo/blob/master/README.md)

## 安装

[添加至服务器](https://discord.com/api/oauth2/authorize?client_id=899025207161929768&permissions=8&scope=bot%20applications.commands)

Bamboo(竹)部署在作者租用的服务器上以保证长期在线，但是由于服务器性能与带宽有限，在使用高峰期可能会出现卡顿/崩溃的情况。因此，如果您有条件，建议自行部署Bamboo。

本项目依旧处于早期开发阶段。如果在使用中遇到了任何问题或者有任何建议，欢迎加入官方服务器并告诉我。

[官方服务器](https://discord.gg/p6F32GejZT)

## 本地开发

> **Note**
> 截至2023年8月，Linux环境下的`ffmpeg-static`会错误地触发`discord.js`中`AudioPlayerStatus`的事件。因此该环境下的用户必须自行安装`ffmpeg`：
> 
> ```shell
> $ sudo apt update && sudo apt install ffmpeg
> ```
>
> 对于其他OS下的环境，`ffmpeg`可以直接通过`pnpm`安装：
>
> ```shell
> $ pnpm install ffmpeg-static
> ```
>
> 详情请见[这个帖子](https://github.com/Androz2091/discord-player/issues/1639#issuecomment-1477466885)。

- 安装 [Node.js](https://nodejs.org/en/) >= v16 与 [pnpm](https://pnpm.io/)
- 填写 `.env` 文件，参考 `.env.example`
- Docker: `docker compose up`
- Node: `pnpm install && pnpm start`

## 使用 & 截图

播放整张专辑：

<p align="center">
  <img src="https://github.com/k27dong/bamboo/assets/46537987/b28eefca-cc62-4d59-b16c-ed176a21a373" width="95%" height="95%" alt="album_demo"/>
</p>

播放用户歌单：

<p align="center">
  <img src="https://github.com/k27dong/bamboo/assets/46537987/8933171a-adfd-44b3-a30c-e28a1565df5f" width="95%" height="95%" alt="playlist_demo"/>
</p>

播放歌曲：

<p align="center">
  <img src="https://github.com/k27dong/bamboo/assets/46537987/6233aad5-185c-4343-8bdc-663c9709f18d" width="95%" height="95%" alt="play_demo"/>
</p>

显示歌词：

<p align="center">
  <img src="https://github.com/k27dong/bamboo/assets/46537987/99e336cb-886f-4660-af8b-f67b6347cb67" width="95%" height="95%" alt="lyric_demo"/>
</p>

## 鸣谢

<a href="https://github.com/k27dong/bamboo/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=k27dong/bamboo"  alt="Contributor badge"/>
</a>
