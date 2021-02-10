const fs = require('fs');
const path = require('path');
const { scrapePlaylist } = require('youtube-playlist-scraper');
const ytdl = require('ytdl-core');

const playlistId = '';
const beginFrom = 1;
const addPrefix = true;

let dir, progress;

scrapePlaylist(playlistId)
	.then((res) => {
		const downloadDir = res.title.replace(/[^a-zA-Z0-9]/g, '');
		fs.existsSync(downloadDir) || fs.mkdirSync(downloadDir);
		dir = downloadDir;
		console.log(`\n${res.playlist.length} videos found. Starting download...`);
		main(res.playlist);
	})
	.catch((e) =>
		console.error("Error ocurred while fetching your playlist. Make sure it's not private", e)
	);

async function main(playlist) {
	try {
		for (let i = beginFrom - 1; i < playlist.length; i++) {
			// if (playlist[i].isPrivate)
			// 	return console.error('\nPrivate video encountered. Cancelling download');
			let name = `${addPrefix ? i + 1 + ' - ' : ''}${playlist[i].name}`
				.replace(/[:"|\/\\]/g, '-')
				.replace(/[?!']/g, '');
			console.log(`\n\nDownloading ${name}`);
			await downloadVideo(name, playlist[i].url);
		}
		console.log('\n\nDOWNLOAD FINISHED');
	} catch (e) {
		console.error(e);
	}
}

async function downloadVideo(name, url) {
	let ytStream = ytdl(url, { quality: 'highestvideo', filter: 'videoandaudio' });
	let writeStream = fs.createWriteStream(path.join(dir, name) + '.mp4');
	ytStream.on('progress', (_, loadedChunks, totalChunks) => {
		let newProgress = Math.round(+(loadedChunks / totalChunks).toFixed(2) * 100);
		if (progress !== newProgress) {
			progress = newProgress;
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(progress + '%');
		}
	});
	ytStream.pipe(writeStream);
	return new Promise((resolve, reject) => {
		writeStream.on('finish', resolve);
		writeStream.on('error', reject);
	});
}
