const fs = require("fs");
const axios = require("axios");
const { cmd } = require('../command');

cmd({
    pattern: "dl",
    react: "⬇️",
    desc: "Download MP4 from direct link(s)",
    category: "downloader",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply("❌ Please send URL(s)\nExample: `dl https://site.com/video.mp4`");

        const links = args; // multiple links supported
        reply(`📥 Starting download queue...\nTotal links: *${links.length}*`);

        for (let i = 0; i < links.length; i++) {
            let url = links[i];
            reply(`📥 Downloading (${i+1}/${links.length})...\n${url}`);

            // Download file
            const buffer = await axios.get(url, {
                responseType: "arraybuffer"
            });

            let filename = `video_${Date.now()}.mp4`;
            fs.writeFileSync(filename, buffer.data);

            await conn.sendMessage(from, {
                video: fs.readFileSync(filename),
                mimetype: "video/mp4",
                caption: `✅ Uploaded (${i+1}/${links.length})`
            }, { quoted: mek });

            fs.unlinkSync(filename);
        }

        reply("✅ All downloads completed!");

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e}`);
    }
});
