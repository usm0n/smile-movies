# Smile Movies V2 Beta 🎬

This project is a technical demonstration of frontend, backend, and media-handling skills. No content is hosted directly.

> ⚠️ This version is still in active development and may not represent the final product.

---

## 📌 Current Status

- Smile Movies V2 is in **Beta** and under active development.
- A complete rebuild (**Smile Movies V3**) is planned as a monorepo for better maintainability, performance, and cross-platform support.
- Until then, V2 remains available and usable for early access and feedback.

---

## 📱 Planned for V3

- Full monorepo architecture using **React + React Native**
- Support for **web, Android, iOS, Android TV, macOS**, and **Windows**
- Improved performance, UI/UX, and accessibility
- Enhanced subtitle, quality switching, and protected stream support
- Better developer experience with shared logic

---

## 🐞 Found a Bug or Have a Suggestion?

Please report issues or request features via:

- [GitHub Issues](https://github.com/smile-movies/issues)
- [Telegram Contact](https://t.me/usmondev)

Your feedback helps shape the future of Smile Movies.

---

## 📄 License

MIT License. See [`LICENSE`](./LICENSE) for details.

---

Made with ❤️ for film lovers, by Usmon.

## Torrent playback in development

The in-browser TorrentPlayer can only connect to WebRTC torrent peers. A Torrentio result can show many seeders and still fail in a browser when those seeders are regular BitTorrent TCP/UDP peers instead of WebRTC peers.

For reliable local playback, run the included HTTP torrent bridge in a separate terminal:

```bash
npm run torrent:server
```

Then start the Vite app with the bridge URL available to the frontend:

```bash
VITE_TORRENT_STREAM_BASE_URL=http://127.0.0.1:8787 npm run dev
```

The bridge downloads through the normal Node/WebTorrent engine and exposes a ranged HTTP video endpoint to the browser, so the watch page can play it with a standard `<video>` element.
