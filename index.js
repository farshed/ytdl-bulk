const fs = require('fs');
const path = require('path');
const ytList = require('youtube-playlist');
const ytdl = require('ytdl-core');

const url = '';
const beginFrom = 1;

let dir, progress;

ytList(url, ['name', 'url']).then((res) => {
	const downloadDir = res.data.name.replace(/[^a-zA-Z0-9]/g, '');
	fs.existsSync(downloadDir) || fs.mkdirSync(downloadDir);
	dir = downloadDir;
	console.log(`\n${res.data.playlist.length} videos found. Starting download...`);
	main(res.data.playlist);
});

async function main(playlist) {
	try {
		for (let i = beginFrom - 1; i < playlist.length; i++) {
			if (playlist[i].isPrivate)
				return console.error('\nPrivate video encountered. Cancelling download');
			let name = `00${i + 1} - ${playlist[i].name}`
				.replace(/[:"\/\\]/g, '-')
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
