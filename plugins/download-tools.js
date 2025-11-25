const yts = require('yt-search');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const config = require('../config')
const { igdl } = require('ruhend-scraper')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

let session = {};

async function fetchFBVideo(url) {
    try {
        const response = await fetchJson(`https://deneth-dev-api-links.vercel.app/api/fb1?url=${encodeURIComponent(url)}&api_key=deneth2009`);
        return response.result || null;
    } catch (error) {
        console.error('Error fetching Facebook video:', error);
        return null;
    }
}

cmd({
    pattern: "fb",
    alias: ["fbvideo"],
    use: '.fb <url>',
    react: "⬇",
    desc: "Download Facebook videos.",
    category: "downloader",
    filename: __filename
}, async (messageHandler, context, quotedMessage, { from, q, reply }) => {
    try {
        if (!q) return reply('*Please Provide A Facebook Video Url 🧐*');
        
        let videoData = await fetchFBVideo(q);
        if (!videoData) return reply("*Error Fetching Video Data 😔*");
        
        let message = `*ＦＡＣＥＢＯＯＫ ＶＩＤＥＯ ＤＬ*\n\n` +
                      `⭕ *Title:* ${videoData.title || 'No Title'}\n` +
                      `✍ *Description:* ${videoData.desc || 'No Description'}\n\n` +
                      `⬇ *DOWNLOAD OPTIONS*\n` +
                      `1 || SD QUALITY\n` +
                      `2 || HD QUALITY\n\n` +
                      `> ᴅᴇɴᴇᴛʜ-ᴍᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`;
        
        const sentMessage = await messageHandler.sendMessage(from, {
            image: { url: videoData.thumb },
            caption: message
        }, { quoted: quotedMessage });

        session[from] = { videoData, messageId: sentMessage.key.id };

        const handleUserReply = async (update) => {
            const userMessage = update.messages[0];
            if (!userMessage.message.extendedTextMessage ||
                userMessage.message.extendedTextMessage.contextInfo.stanzaId !== sentMessage.key.id) {
                return;
            }

            const userReply = userMessage.message.extendedTextMessage.text.trim();
            let downloadUrl = userReply === '1' ? videoData.sd : userReply === '2' ? videoData.hd : null;

            if (!downloadUrl) return reply("*Please Enter A Valid Number (1 or 2) 🙄* ");

            await messageHandler.sendMessage(from, { react: { text: "⬇", key: userMessage.key } });
            
            await messageHandler.sendMessage(from, {
                video: { url: downloadUrl },
                mimetype: 'video/mp4',
                fileName: `🎥 ᴅᴇɴᴇᴛʜ-ᴍᴅ ᴠɪᴅᴇᴏꜱ 🎥 ${videoData.title || 'FaceBook'} | ${userReply === '1' ? 'SD' : 'HD'}.mp4`,
                caption: `▶ *${videoData.title || 'FaceBook Video'} (${userReply === '1' ? 'SD' : 'HD'} Quality)* ▶\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`
            }, { quoted: quotedMessage });
            
            await messageHandler.sendMessage(from, { react: { text: "✅", key: userMessage.key } });
        };

        messageHandler.ev.on("messages.upsert", handleUserReply);
    } catch (error) {
        console.error(error);
        await messageHandler.sendMessage(from, { text: '*Error Occurred During The Process 😔*' }, { quoted: quotedMessage });
    }
});

// Twitter
async function fetchTwitterVideo(url) {
    try {
        const response = await fetchJson(`https://deneth-dev-api-links.vercel.app/api/twitter?link=${encodeURIComponent(url)}&api_key=deneth2009`);
        return response.result || null;
    } catch (error) {
        console.error('Error fetching Twitter video:', error);
        return null;
    }
}

cmd({
    pattern: "twitter",
    alias: ["twvideo"],
    use: '.twitter <url>',
    react: "▶",
    desc: "Download Twitter videos.",
    category: "downloader",
    filename: __filename
}, async (messageHandler, context, quotedMessage, { from, q, reply }) => {
    try {
        if (!q) return reply('*Please Provide A Twitter Video Url 🧐*');
        
        let videoData = await fetchTwitterVideo(q);
        if (!videoData) return reply("*Error Fetching Video Data!* 😔");
        
        let message = `*ＴＷＩＴＴＥＲ ＶＩＤＥＯ ＤＬ*\n\n` +
                      `⭕ *Title:* ${videoData.desc || 'No Description'}\n\n` +
                      `⬇ *DOWNLOAD OPTIONS*\n` +
                      `1 || SD QUALITY\n` +
                      `2 || HD QUALITY\n` +
                      `> ᴅᴇɴᴇᴛʜ-ᴍᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`;
        
        const sentMessage = await messageHandler.sendMessage(from, {
            image: { url: videoData.thumb },
            caption: message
        }, { quoted: quotedMessage });

        session[from] = { videoData, messageId: sentMessage.key.id };

        const handleUserReply = async (update) => {
            const userMessage = update.messages[0];
            if (!userMessage.message.extendedTextMessage ||
                userMessage.message.extendedTextMessage.contextInfo.stanzaId !== sentMessage.key.id) {
                return;
            }

            const userReply = userMessage.message.extendedTextMessage.text.trim();
            let downloadUrl = null;
            let mimeType = 'video/mp4';
            let fileExtension = '.mp4';

            if (userReply === '1') {
                downloadUrl = videoData.video_sd;
            } else if (userReply === '2') {
                downloadUrl = videoData.video_hd;
            } else if (userReply === '3') {
                downloadUrl = videoData.audio;
                mimeType = 'audio/mp4';  // Set correct mime type for audio
                fileExtension = '.mp3';  // Set the correct file extension for audio
            } else {
                return reply("*Please Enter A Valid Number (1, 2, or 3)* 🙄");
            }

            if (!downloadUrl) return reply("*Error Fetching Download Url 😔*");

            await messageHandler.sendMessage(from, { react: { text: "⬇", key: userMessage.key } });

            await messageHandler.sendMessage(from, {
                [mimeType.startsWith('audio') ? 'audio' : 'video']: { url: downloadUrl },
                mimetype: mimeType,
                fileName: `🎥 ᴅᴇɴᴇᴛʜ-ᴍᴅ ᴠɪᴅᴇᴏꜱ 🎥 ${videoData.desc || 'Twitter Video'} | ${userReply === '1' ? 'SD' : userReply === '2' ? 'HD' : 'Audio'}${fileExtension}`,
                caption: `▶ *${videoData.desc || 'Twitter Video'} (${userReply === '1' ? 'SD' : userReply === '2' ? 'HD' : 'Audio'} Quality)* ▶\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`
            }, { quoted: quotedMessage });
            
            await messageHandler.sendMessage(from, { react: { text: "✅", key: userMessage.key } });
        };

        messageHandler.ev.on("messages.upsert", handleUserReply);
    } catch (error) {
        console.error(error);
        await messageHandler.sendMessage(from, { text: '❌ *Error Occurred During The Process!*' }, { quoted: quotedMessage });
    }
});

// Instagram
var needus = "*Please Give Me Instagram Url 🙄*" 
var cantf = "*I Cant Find This Video 😔*" 
cmd({
    pattern: "insta",
    alias: ["insta"],
    react: '▶',
    desc: "Download Instagram videos",
    category: "download",
    use: '.ig <insta link>',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!q) return await  reply(needus)
let wm = `> ᴅᴇɴᴇᴛʜ-ᴍᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`
let res = await igdl(q)
let data = await res.data;
//let data = await res.data
for (let media of res.data) {
await conn.sendMessage(from, { video: { url: media.url }, caption: wm}, { quoted: mek })
//conn.sendFileUrl(from, media.url, wm, mek )
}
} catch (e) {
let wm = `> ᴅᴇɴᴇᴛʜ-ᴍᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`
let res = await igdl(q)
//let data = await res.data
for (let media of res.data) {
await conn.sendMessage(from, { image: { url: media.url }, caption: wm}, { quoted: mek })
//conn.sendFileUrl(from, media.url, wm, mek )
}
console.log(e)
} 
}
)

async function searchJayasrilanka(query) {
    try {
        const response = await fetchJson(`https://api-vishwa.vercel.app/download-jayasrilnaka-search?qry=${query}`);
        return response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching Jayasrilanka search results:', error);
        return [];
    }
}

async function getSongDownloadLink(link) {
    try {
        const response = await fetchJson(`https://api-vishwa.vercel.app/download-jayasrilnaka-songdl?link=${link}&apikey=`);
        return response.status ? response.data.audioLink : null;
    } catch (error) {
        console.error('Error fetching song download link:', error);
        return null;
    }
}

cmd({
    pattern: "jayasrilk",
    alias: ["jayasrilanka"],
    use: '.jayasrilk <query>',
    react: "🎧",
    desc: "Search and download songs from Jayasrilanka.",
    category: "music",
    filename: __filename
}, async (messageHandler, context, quotedMessage, { from, q, reply }) => {
    try {
        if (!q) return reply('*Please Provide A Song Name 🙄*');

        let songs = await searchJayasrilanka(q);
        if (songs.length < 1) return reply("*No Songs Found 🧐*");

        let message = `*ＪＡＹＡＳＲＩＬＡＮＫＡ ＳＥＡＲＣＨ*\n\n`;
        songs.forEach((song, index) => {
            let songTitle = song.title.replace(/^\d+\.\s*/, "");
            message += `${index + 1}. ${songTitle}\n`;
        });

        message += `\n> ᴅᴇɴᴇᴛʜ-ᴍᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`;

        const sentMessage = await messageHandler.sendMessage(from, {
            image: { url: `https://github.com/deneth-hansaka-keerthirathna/DENETH-Media/blob/main/DENETH-MD%20V1.jpg?raw=true` },
            caption: message
        }, { quoted: quotedMessage });

        session[from] = { searchResults: songs, messageId: sentMessage.key.id };

        const handleUserReply = async (update) => {
            const userMessage = update.messages[0];
            if (!userMessage.message.extendedTextMessage ||
                userMessage.message.extendedTextMessage.contextInfo.stanzaId !== sentMessage.key.id) {
                return;
            }

            const userReply = userMessage.message.extendedTextMessage.text.trim();
            const songIndex = parseInt(userReply) - 1;

            if (isNaN(songIndex) || songIndex < 0 || songIndex >= songs.length) {
                return reply("*Please Enter A Valid Number 🙄*");
            }

            const selectedSong = songs[songIndex];
            let downloadLink = await getSongDownloadLink(selectedSong.link);
            if (!downloadLink) return reply("*Error Fetching Song Download Link 😔*");

            await messageHandler.sendMessage(from, {
                audio: { url: downloadLink },
                mimetype: 'audio/mpeg',
                fileName: `${selectedSong.title}.mp3`,
            }, { quoted: quotedMessage });
        };

        messageHandler.ev.on("messages.upsert", handleUserReply);
    } catch (error) {
        console.error(error);
        await messageHandler.sendMessage(from, { text: '*Error Occurred During The Process 😔*' }, { quoted: quotedMessage });
    }
});

async function fetchCapCutVideo(url) {
    try {
        const response = await fetchJson(`https://dark-shan-yt.koyeb.app/download/capcut?url=${encodeURIComponent(url)}`);
        return response.data || null;
    } catch (error) {
        console.error('Error fetching CapCut video:', error);
        return null;
    }
}

cmd({
    pattern: "capcut",
    alias: ["capcutdl"],
    use: '.capcut <url>',
    react: "⬇",
    desc: "Download CapCut videos.",
    category: "downloader",
    filename: __filename
}, async (messageHandler, context, quotedMessage, { from, q, reply }) => {
    try {
        if (!q) return reply('*Please Provide A CapCut Video Url 🧐*');
        
        let videoData = await fetchCapCutVideo(q);
        if (!videoData || !videoData.medias.length) return reply("*Error Fetching Video Data 😔*");
        
        let media = videoData.medias[0];
        let message = `*ＣＡＰＣＵＴ ＶＩＤＥＯ ＤＬ*\n\n` +
                      `⭕ *Title:* ${videoData.title || 'No Title'}\n` +
                      `🎯 *Quality:* ${media.quality || 'Unknown'}\n` +
                      `🔢 *Size:* ${media.formattedSize || 'Unknown'}\n` +
                      `🔗 *URL:* ${videoData.url}\n\n` +
                      `> ᴅᴇɴᴇᴛʜ-ᴍᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`;
        
        await messageHandler.sendMessage(from, {
            image: { url: videoData.thumbnail },
            caption: message
        }, { quoted: quotedMessage });
        
        await messageHandler.sendMessage(from, {
            video: { url: media.url },
            mimetype: 'video/mp4',
            fileName: `🎥 CapCut Video 🎥 ${videoData.title || 'CapCut'}.mp4`,
            caption: `▶ *${videoData.title || 'CapCut Video'} (${media.quality})* ▶\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`
        }, { quoted: quotedMessage });
    } catch (error) {
        console.error(error);
        await messageHandler.sendMessage(from, { text: '*Error Occurred During The Process 😔*' }, { quoted: quotedMessage });
    }
});

const ddownr = require('denethdev-ytmp3'); // Importing the denethdev-ytmp3 package for downloading

cmd({
  pattern: "song",
  desc: "Download songs.",
  category: "download",
  react: '🎧',
  filename: __filename
}, async (messageHandler, context, quotedMessage, { from, reply, q }) => {
  try {
    if (!q) return reply("*Please Provide A Song Name or Url 🙄*");
    
    // Search for the song using yt-search
    const searchResults = await yts(q);
    if (!searchResults || searchResults.videos.length === 0) {
      return reply("*No Song Found Matching Your Query 🧐*");
    }

    const songData = searchResults.videos[0];
    const songUrl = songData.url;

    // Using denethdev-ytmp3 to fetch the download link
    const result = await ddownr.download(songUrl, 'mp3'); // Download in mp3 format
    const downloadLink = result.downloadUrl; // Get the download URL

    let songDetailsMessage = `*ＹＯＵＴＵＢＥ ＡＵＤＩＯ ＤＬ*\n\n`;
    songDetailsMessage += `*⚜ Title:* ${songData.title}\n`;
    songDetailsMessage += `*👀 Views:* ${songData.views}\n`;
    songDetailsMessage += `*⏰ Duration:* ${songData.timestamp}\n`;
    songDetailsMessage += `*📆 Uploaded:* ${songData.ago}\n`;
    songDetailsMessage += `*📽 Channel:* ${songData.author.name}\n`;
    songDetailsMessage += `*🖇 URL:* ${songData.url}\n\n`;
    songDetailsMessage += `*Choose Your Download Format:*\n\n`;
    songDetailsMessage += `1 || Audio File 🎶\n`;
    songDetailsMessage += `2 || Document File 📂\n\n`;
    songDetailsMessage += `> ᴅᴇɴᴇᴛʜ-ᴍᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`;

    // Send the video thumbnail with song details
    const sentMessage = await messageHandler.sendMessage(from, {
      image: { url: songData.thumbnail },
      caption: songDetailsMessage,
    }, { quoted: quotedMessage });

    // Listen for the user's reply to select the download format
    messageHandler.ev.on("messages.upsert", async (update) => {
      const message = update.messages[0];
      if (!message.message || !message.message.extendedTextMessage) return;

      const userReply = message.message.extendedTextMessage.text.trim();

      // Handle the download format choice
      if (message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id) {
        switch (userReply) {
          case '1': // Audio File
            await messageHandler.sendMessage(from, {
              audio: { url: downloadLink },
              mimetype: "audio/mpeg"
            }, { quoted: quotedMessage });
            break;
          case '2': // Document File
            await messageHandler.sendMessage(from, {
              document: { url: downloadLink },
              mimetype: 'audio/mpeg',
              fileName: `${songData.title}.mp3`,
              caption: `${songData.title}\n\n> ᴅᴇɴᴇᴛʜ-ᴍᴅ ʙʏ ᴋɪɴɢ X ᴅᴇɴᴇᴛʜᴅᴇᴠ®`
            }, { quoted: quotedMessage });
            break;
          default:
            reply("*Invalid Option. Please Select A Valid Option 🙄*");
            break;
        }
      }
    });
  } catch (error) {
    console.error(error);
    reply("*An Error Occurred While Processing Your Request 😔*");
  }
});
