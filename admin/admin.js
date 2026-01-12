if (window.CMS) {
  window.CMS.registerEditorComponent({
    id: 'audio-player',
    label: 'Audio Player',
    fields: [
      {
        name: 'src',
        label: 'Audio file path or URL',
        widget: 'string',
        hint: 'Example: /assets/audio/news/my-story.mp3',
      },
    ],
    pattern: /{%\s*include\s+audio-player\.html\s+src="([^"]+)"\s*%}/,
    fromBlock: function (match) {
      return {
        src: match && match[1] ? match[1] : '',
      }
    },
    toBlock: function (data) {
      if (!data || !data.src) {
        return ''
      }
      return `{% include audio-player.html src="${data.src}" %}`
    },
    toPreview: function (data) {
      if (!data || !data.src) {
        return '<em>No audio source selected</em>'
      }
      return `<div class="cms-audio-preview">Audio Player → ${data.src}</div>`
    },
  })
}
