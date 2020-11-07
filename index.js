const fs = require('fs');
const path = require('path');
const ytList = require('youtube-playlist');
const ytdl = require('ytdl-core');

const url = '';

let dir, progress;

ytList(url, ['name', 'url']).then((res) => {
	fs.existsSync(res.data.name) || fs.mkdirSync(res.data.name);
	dir = res.data.name;
	console.log(`\n${res.data.playlist.length} videos found. Starting download...`);
	main(res.data.playlist);
});

async function main(playlist) {
	for (let i = 0; i < playlist.length; i++) {
		if (playlist[i].isPrivate)
			return console.error('\nPrivate video encountered. Cancelling download');
		let name = `00${i + 1} - ${playlist[i].name}`;
		console.log(`\n\nDownloading ${name}`);
		await downloadVideo(name, playlist[i].url);
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
	});
}
