// src/features/commands/play.ts
import {
  type Client,
  type CommandInteraction,
  type GuildMember,
  MessageFlags, // 用于发送仅用户可见的错误消息
  SlashCommandBuilder,
  ActionRowBuilder, // 用于创建消息组件的操作行
  StringSelectMenuBuilder, // 用于创建下拉选择菜单
  StringSelectMenuOptionBuilder, // 用于创建下拉菜单的选项
  ComponentType, // 用于指定组件类型 (例如 StringSelect)
  // EmbedBuilder, // 我们将使用 embedMessages 中的辅助函数来创建Embeds
} from "discord.js";
import { useMainPlayer, type Track, type GuildQueue } from "discord-player"; // 导入 discord-player 的核心工具和类型

import { logger } from "@/common/utils/logger"; // 日志工具
import type { Command } from "@/core/commands/Command"; // 命令接口定义
import { checkInVoiceChannel } from "@/core/player/core"; // 检查用户是否在语音频道的辅助函数
// 导入常量和 Embed 消息构建函数
import { EXTRACTOR_IDENTIFIER, DISCORD_SELECT_MENU_LIMIT, ExtractorSearchType } from "@/common/constants";
import { NowPlayingMessage, ErrorMessage } from "@/core/player/embedMessages";

// 构建斜杠命令的定义
const PlayOption = new SlashCommandBuilder()
  .setName("play")
  .setDescription("搜索歌曲并从结果中选择一首进行播放") // 更新命令描述
  .addStringOption((option) => // 添加一个字符串类型的选项
    option
      .setName("歌曲") // 用户在Discord界面看到的选项名
      .setDescription("输入歌曲名称、关键词或支持的歌曲链接") // 选项的描述信息
      .setRequired(true), // 此选项为必填项
  );

export const Play: Command = {
  name: PlayOption.name, // 命令名称
  description: PlayOption.description, // 命令描述
  data: PlayOption, // SlashCommandBuilder 构建的命令数据
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      // 1. 延迟回复交互，并设置为 ephemeral (仅发起者可见)
      //    这样做是为了在处理搜索和用户选择时不打扰频道内其他用户。
      await interaction.deferReply({ ephemeral: true });

      // 2. 检查发起命令的用户是否在语音频道中。
      //    如果不在，checkInVoiceChannel 函数会发送错误消息并抛出错误，中断后续执行。
      await checkInVoiceChannel(interaction);

      const player = useMainPlayer(); // 获取 discord-player 的 Player 实例
      if (!player) {
        // 理论上 player 实例应该总是可用的，除非初始化失败。
        await interaction.editReply({
          embeds: [ErrorMessage("播放器核心组件似乎未准备好，请稍后重试。")],
          components: [] // 清空任何可能的组件
        });
        return;
      }

      // 3. 从交互选项中获取用户输入的查询内容。
      const query = interaction.options.get("歌曲", true).value as string; // "歌曲" 必须与上面 addStringOption 的 name 一致
      const member = interaction.member as GuildMember; // 获取交互发起者的 GuildMember 对象
      const voiceChannel = member.voice.channel!; // 获取该成员所在的语音频道 (checkInVoiceChannel 已确保存在)

      // 4. 使用 player.search() 方法搜索音轨。
      //    我们期望 BambooExtractor (由 EXTRACTOR_IDENTIFIER 标识) 的
      //    default case 或 ExtractorSearchType.Track case 返回一个 Track 对象数组。
      const searchResult = await player.search(query, {
        requestedBy: interaction.user, // 记录是谁发起的这次搜索/播放请求
        searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`, // 显式指定使用我们的 BambooExtractor
        // 如果你的 BambooExtractor 默认行为不是搜索歌曲列表，或者你需要更精确控制，
        // 可以取消注释并设置 requestOptions，例如：
        // requestOptions: {
        //   searchType: ExtractorSearchType.Track, // 假设此类型返回歌曲列表
        // },
      });

      // 5. 检查搜索结果。
      if (!searchResult || searchResult.tracks.length === 0) {
        // 如果没有找到任何音轨，编辑之前的 ephemeral 回复告知用户。
        await interaction.editReply({
          embeds: [ErrorMessage(`❌ 未能根据关键词 "${query}" 找到任何歌曲。请尝试更换关键词或检查链接。`)],
          components: []
        });
        return;
      }

      // 6. 构建下拉选择菜单 (StringSelectMenu)。
      //    为每个交互的菜单创建一个唯一的 customId，以防止并发使用时多个用户的菜单相互干扰。
      const selectMenuCustomId = `play_select_song_${interaction.id}`;

      // 将搜索到的音轨映射为下拉菜单的选项。
      // Discord 的下拉菜单最多只能有25个选项。
      const songSelectOptions = searchResult.tracks
        .slice(0, Math.min(searchResult.tracks.length, 25)) // 取前25个或所有结果中较少者
        .map((track, index) => {
          // 格式化选项的标签 (通常是歌曲标题)，并确保不超过Discord的长度限制。
          const label =
            track.title.length > DISCORD_SELECT_MENU_LIMIT
              ? `${track.title.slice(0, DISCORD_SELECT_MENU_LIMIT - 3)}...` // 超长则截断并加省略号
              : track.title;
          // 格式化选项的描述 (通常是歌手和时长)，同样限制长度。
          const description = `${track.author || '未知作者'} - ${track.duration || '未知时长'}`.slice(0, DISCORD_SELECT_MENU_LIMIT);

          return new StringSelectMenuOptionBuilder()
            .setLabel(label) // 设置选项的显示文本
            .setValue(index.toString()) // 设置选项的值 (这里用音轨在搜索结果数组中的索引)
            .setDescription(description) // 设置选项的描述文本
            .setEmoji("🎵"); // 为选项添加一个表情符号
        });
      
      // 以防万一，如果 map 后的选项数组为空 (理论上 searchResult.tracks.length > 0 时不会发生)
      if (songSelectOptions.length === 0) {
         await interaction.editReply({
           embeds: [ErrorMessage(`❌ 处理搜索结果时发生内部错误，未能生成可选歌曲列表。`)],
           components: []
         });
         return;
      }

      // 创建包含下拉菜单的操作行 (ActionRow)。
      const songSelectRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(selectMenuCustomId) // 设置菜单的唯一ID
            .setPlaceholder("请从列表中选择一首歌曲进行播放...") // 菜单未选择时的占位提示文字
            .addOptions(songSelectOptions), // 将上面生成的选项添加到菜单中
        );

      // 7. 编辑初始的 ephemeral 回复，向用户显示包含搜索结果和选择菜单的消息。
      const responseInteraction = await interaction.editReply({
        content: `🔍 关于 "${query}" 的搜索结果如下 (最多显示25条)，请选择一首：`,
        components: [songSelectRow], // 将包含选择菜单的操作行添加到回复中
      });

      // 8. 创建消息组件收集器 (MessageComponentCollector) 来监听用户的选择。
      //    过滤器确保只收集与此菜单相关 (customId匹配) 且由发起命令的用户进行的交互。
      const collectorFilter = (i: any) => // i 是接收到的组件交互对象
        i.customId === selectMenuCustomId && i.user.id === interaction.user.id;

      const songSelectionCollector =
        responseInteraction.createMessageComponentCollector({
          componentType: ComponentType.StringSelect, // 指定只收集下拉选择菜单 (StringSelectMenu) 的交互
          filter: collectorFilter, // 应用上面定义的过滤器
          time: 60_000, // 设置收集器的等待时间为60秒，超时后会自动结束
        });

      // 9. 当用户从下拉菜单中做出选择时，触发 'collect' 事件。
      songSelectionCollector.on("collect", async (selectInteraction) => {
        // 类型守卫，确保 selectInteraction 是 StringSelectMenuInteraction 类型
        if (!selectInteraction.isStringSelectMenu()) return;

        // 用户做出选择后，立即更新这条临时的 (ephemeral) 交互消息，
        // 移除选择菜单并告知用户正在处理。
        await selectInteraction.update({
          content: `🎶 您已选择歌曲，正在为您处理播放请求...`,
          components: [], // 清空组件，即移除选择菜单
        });

        // 从选择交互中获取用户选中的值 (即歌曲在 searchResult.tracks 数组中的索引)
        const selectedSongIndex = parseInt(selectInteraction.values[0], 10);
        // 根据索引从原始搜索结果中获取对应的 Track 对象
        const selectedTrack: Track | undefined = searchResult.tracks[selectedSongIndex];

        // 再次校验是否成功获取到 Track 对象
        if (!selectedTrack) {
          // 如果未能获取 (例如索引无效，理论上不应发生)，则发送一条错误消息。
          // 使用 interaction.followUp 发送新的 ephemeral 消息，因为 selectInteraction 已被 update。
          await interaction.followUp({
            embeds: [ErrorMessage("❌ 抱歉，选择的歌曲信息似乎已失效或无法处理，请重新尝试。")],
            ephemeral: true,
          });
          songSelectionCollector.stop("track_selection_error"); // 停止收集器，并传递一个原因
          return;
        }

        try {
          // 10. 使用 player.play() 方法播放用户选中的 Track 对象。
          //     player.play() 可以直接接受一个 Track 对象作为播放源。
          const { track, queue } = await player.play(
            voiceChannel, // 用户所在的语音频道
            selectedTrack, // 用户选择的 Track 对象
            { // 播放选项
              nodeOptions: { // discord-player 节点的高级选项
                metadata: { // 将一些有用的元数据传递给播放器事件 (如 'playerStart', 'error')
                  channel: interaction.channel, // 文本频道，用于后续发送 "正在播放" 等消息
                  client: interaction.guild?.members.me, // 机器人自身在服务器中的成员信息
                  requestedBy: interaction.user, // 发起播放请求的用户
                },
                volume: 70, // 默认播放音量 (可以考虑从配置或用户设置中读取)
                leaveOnEmptyCooldown: 300_000, // 语音频道为空后，等待5分钟自动离开
                leaveOnEmpty: true, // 启用频道为空时自动离开
                leaveOnEnd: false, // 整个播放队列结束时，不自动离开 (除非频道也为空触发了leaveOnEmpty)
                // selfDeaf: true, // 可选：让机器人加入语音频道时自动设置为闭麦状态
              },
            }
          );

          // 11. 播放请求成功后，发送一条公开的确认消息 (告知歌曲已播放或已添加到队列)。
          //     使用 interaction.followUp() 来发送这个新的、非 ephemeral 的消息。
          if (track) { // track 对象通常代表当前开始播放或刚刚添加到队列的歌曲
             await interaction.followUp({
              embeds: [NowPlayingMessage(track, queue as GuildQueue)], // 使用你定义的 NowPlayingMessage Embed
            });
          } else {
            // 理论上，如果 player.play 调用成功，应该总会返回一个 track 对象。
            // 但作为一种备用情况，可以发送一个通用的成功消息。
            await interaction.followUp({
                content: "✅ 歌曲已成功添加到播放队列！", // 这条消息是公开的
            });
          }

        } catch (playError: any) {
          // 捕获在 player.play() 过程中可能发生的错误 (如无法加入语音频道、无法获取播放流等)
          logger.error(interaction, `尝试播放选定歌曲 "${selectedTrack.title}" 时出错`, playError.message || playError);
          await interaction.followUp({ // 错误消息也通过 followUp 发送
            embeds: [ErrorMessage(`❌ 播放歌曲 "${selectedTrack.title}" 时发生错误: ${playError.message || '发生未知播放错误，请检查机器人日志。'}`)],
            ephemeral: true, // 播放错误通常只让点歌用户看到即可
          });
        }
        songSelectionCollector.stop("selection_processed"); // 无论成功或失败，处理完选择后都停止收集器
      });

      // 12. 当收集器结束时 (例如因超时、或被手动 stop)，触发 'end' 事件。
      songSelectionCollector.on("end", (collected, reason) => {
        void (async () => { // 使用 void async IIFE 来避免 "unhandled promise rejection"
          // 如果收集器是因为 'time' (超时) 而结束，并且没有收集到任何用户的选择 (collected.size === 0)
          if (reason === "time" && collected.size === 0) {
            // 检查原始的 ephemeral 消息是否仍然带有组件 (即选择菜单是否还在)。
            // 因为如果用户已经做出了选择，'collect' 事件会移除组件，此时 'end' 事件不应再尝试编辑。
            try {
                const currentMessage = await interaction.fetchReply(); // 获取最新的交互回复状态
                if (currentMessage && currentMessage.components.length > 0) { // 如果选择菜单仍然显示
                    await interaction.editReply({
                        content: "⌛ 歌曲选择已超时。如果您还想播放歌曲，请重新使用 `/play` 命令。",
                        components: [], // 清除选择菜单
                    });
                }
            } catch (e: any) {
                // 如果在 fetchReply 或 editReply 时发生错误 (例如消息已被删除)，记录警告但不再做进一步处理。
                logger.warn(interaction, Play.name, `编辑超时消息时发生错误 (可能消息已不存在): ${e.message}`);
            }
          }
          // 其他的 reason (如 "selection_processed", "track_selection_error") 表示已在 'collect' 事件中处理或停止，
          // 无需在此处额外操作。
        })();
      });

    } catch (error: any) {
      // 捕获命令执行过程中的其他未被内部 try-catch 块捕获的错误
      // (例如 checkInVoiceChannel 抛出的错误，如果它没有自己处理回复的话)
      logger.error(interaction, `命令 /${Play.name} 执行过程中发生顶层错误`, error.message || error);

      // 提供统一的错误反馈给用户。
      // 由于命令开始时已经 deferReply({ephemeral: true})，所以这里主要使用 editReply。
      const errorMessageContent = `❌ **命令执行出错 (${Play.name})**\n处理您的请求时发生了意外错误。如果问题持续存在，请联系机器人管理员。`;
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: errorMessageContent, embeds: [], components: [] })
          .catch(e => logger.error(interaction, Play.name, `编辑顶层错误回复失败: ${e.message}`));
      } else {
        // 理论上不应进入此分支，因为我们有 deferReply。作为保险。
        await interaction.reply({ content: errorMessageContent, ephemeral: true })
          .catch(e => logger.error(interaction, Play.name, `初始顶层错误回复失败: ${e.message}`));
      }
    }
  },
};
