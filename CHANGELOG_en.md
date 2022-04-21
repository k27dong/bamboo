# Change Log

[中文版](https://github.com/k27dong/bamboo/blob/main/CHANGELOG.md)

### 3.0.0 | 20220420
- Major Upgrade

```diff
discord.js
- 12.5.1
+ 13.6.0

NeteaseCloudMusicApi
-4.0.3
+4.5.12

Node
- 12.21.0
+ 16.13.2
```

### 2.1.2 | 20211014
- Changed hosting from GCP to Heroku
- Fixed a bug in the `remove` command

### 2.1.1 | 20210331
- Changed the prefix from `!` to `*`, since the former is used by Rythm, another famous music bot
- Set status for the bot
- Fixed a bug where the resulting playlist could not be displayed due to an error from the Netease API
- The default front and back ratio when displaying track is reduced from `0.4` to `0.3`
- Fixed a problem where the length of the displayed track sometime goes beyond the limit of a single discord message (2000)
- Added `full` flag for the `queue` command

### 2.1.0 | 20210328
- Now the bot could be updated without restarting the entire service
- Optimized the server which ozy is hosted on

### 2.0.3 | 20210327
- Added a button in README to connect ozy to your server
- Fixed a problem where user could still add songs even he/she's not in any voice channel
- Wrote help scripts for each command

### 2.0.2 | 20210326
- Fixed a problem where a Netease playlist with >1000 songs cannot be added to the queue
- Correctly set cookies when request song urls from Netease

### 2.0.1 | 20210324
- Now user can play directly from a youtube url
- Bugfix

### 2.0.0 | 20210322
- Refactored the project