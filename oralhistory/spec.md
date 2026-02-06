
## Codex instructions (build the site)

### Goal

Create a Jekyll site for Dartmouth College Radio oral history with:

* Interview pages at: `/oralhistory/interviews/<person-id>/<yyyymmdd>/`
* Interview content stored as Markdown in a Jekyll **collection** `_interviews/`
* Person info stored only in `_data/people.yml` and shown on interview pages in an “About” box (no people pages)
* Tags stored as slugs in interview front matter and defined in `_data/vocab.yml`
* A tags browse page at `/oralhistory/browse/tags/`
* Per-tag pages at `/oralhistory/tags/<tag>/` (GitHub Pages compatible: no custom plugins)
* On each interview page, show links to “Other interviews with <person>” (filtering from the interviews collection)

### Constraints

* Must work on GitHub Pages Jekyll (assume **no plugins** beyond what GitHub Pages supports).
* Use `baseurl: "/oralhistory"` and **all internal links must use `{{ site.baseurl }}`** (no hardcoded `/oralhistory` strings scattered in templates).
* Audio is referenced by URL in front matter and rendered with HTML `<audio controls>` if rights allow.

---

## 1) Create/modify `_config.yml`

Implement:

* `baseurl: "/oralhistory"`
* Two collections: `interviews` only (no `people` collection)
* Interviews collection permalink must preserve folder structure:

```yml
title: "Dartmouth College Radio Oral History"
baseurl: "/oralhistory"

collections:
  interviews:
    output: true
    permalink: /oralhistory/interviews/:path/

defaults:
  - scope:
      path: ""
      type: interviews
    values:
      layout: interview
```

Notes:

* Use `:path` so `_interviews/jane-doe/20260115.md` becomes `/oralhistory/interviews/jane-doe/20260115/`.

---

## 2) Create data files

### `_data/people.yml`

Create sample entries like:

```yml
jane-doe:
  name: "Jane Doe"
  class_year: "2003"
  blurb: "Late-night DJ in the early 2000s; helped train new hosts."
  links:
    - label: "Alumni profile"
      url: "https://example.com"

james-underwood:
  name: "James Underwood"
  blurb: "Interviewer and editor for the Dartmouth College Radio Oral History project."
```

### `_data/vocab.yml`

Create a few sample tags:

```yml
station-culture:
  label: "Station culture"
  description: "Studio life, traditions, norms, rituals."
music-discovery:
  label: "Music discovery"
  description: "How DJs found, curated, and shared music."
campus-life:
  label: "Campus life"
  description: "How the station intersected with Dartmouth life."
```

---

## 3) Create layouts

### `_layouts/default.html`

* Basic HTML skeleton
* Nav links:

  * Home (`{{ site.baseurl }}/`)
  * Tags browse (`{{ site.baseurl }}/browse/tags/`)

Use:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>{{ page.title }} · {{ site.title }}</title>
    <link rel="stylesheet" href="{{ site.baseurl }}/assets/css/main.css" />
  </head>
  <body>
    <header>
      <a href="{{ site.baseurl }}/">{{ site.title }}</a>
      <nav>
        <a href="{{ site.baseurl }}/browse/tags/">Tags</a>
      </nav>
    </header>
    <main>{{ content }}</main>
  </body>
</html>
```

### `_layouts/interview.html`

Render:

* Title, date, summary
* Audio player if `rights.publish_audio` and `audio.url`
* “About” box: for each participant id in `page.people.participants`, pull from `site.data.people[pid]`
* In About box: show name, optional class_year, blurb, optional links
* Under each participant’s about, show **Other interviews** links:

  * Loop `site.interviews`
  * Include those where `iv.people.participants contains pid`
  * Exclude current page (`iv.url != page.url`)
  * Sort by date descending
* Tags list, link to tag pages
* Transcript content if `rights.publish_transcript`

Use this front matter for the layout:

```html
---
layout: default
---
```

Implementation detail: sorting other interviews

* Jekyll/Liquid: use `sort: "date"` then reverse; or build an array and reverse.

---

## 4) Create browse and tag pages

### `browse/tags.md`

Permalink: `/oralhistory/browse/tags/`
List tags from `_data/vocab.yml`, linking to `/oralhistory/tags/<tag>/`.

```markdown
---
layout: default
title: "Tags"
permalink: /oralhistory/browse/tags/
---

<ul>
{% for kv in site.data.vocab %}
  {% assign tag = kv[0] %}
  {% assign meta = kv[1] %}
  <li>
    <a href="{{ site.baseurl }}/tags/{{ tag }}/">{{ meta.label }}</a>
    {% if meta.description %}<small> — {{ meta.description }}</small>{% endif %}
  </li>
{% endfor %}
</ul>
```

### Tag pages (no plugins)

Create a folder `tags/` with:

* `tags/tag-template.md` is NOT enough; GitHub Pages won’t auto-generate.
  So:
* Create one tag page per tag key in `_data/vocab.yml`, e.g.:

  * `tags/station-culture.md`
  * `tags/music-discovery.md`
  * `tags/campus-life.md`

Each tag page should:

* set `tag: <slug>`
* list interviews with that tag

Example (`tags/station-culture.md`):

```markdown
---
layout: default
title: "Station culture"
permalink: /oralhistory/tags/station-culture/
tag: station-culture
---

<ul>
{% assign interviews_sorted = site.interviews | sort: "date" | reverse %}
{% for iv in interviews_sorted %}
  {% if iv.tags contains page.tag %}
    <li><a href="{{ iv.url }}">{{ iv.title }}</a> — {{ iv.date | date: "%Y-%m-%d" }}</li>
  {% endif %}
{% endfor %}
</ul>
```

(Do the same for each tag in vocab; titles should come from vocab label.)

---

## 5) Create sample interview content

Create `_interviews/jane-doe/20260115.md`:

```markdown
---
title: "Jane Doe on the early days of WDCR"
date: 2026-01-15
people:
  participants: [jane-doe]
  interviewers: [james-underwood]
tags: [station-culture, music-discovery, campus-life]
audio:
  url: "{{ site.baseurl }}/assets/audio/jane-doe-20260115.mp3"
  duration: "01:18:32"
rights:
  publish_audio: true
  publish_transcript: true
summary: >
  Late-night shows, the music library, and how the station changed as the internet arrived.
---

## Transcript

**James:** Thanks for doing this…

**Jane:** I wandered into the studio because…
```

Also create a second interview for same person (to test “other interviews”):
`_interviews/jane-doe/20260210.md` with a different title/date.

---

## 6) Create home page

`index.md` with permalink `/oralhistory/` (or rely on baseurl).
List newest interviews.

```markdown
---
layout: default
title: "Home"
permalink: /oralhistory/
---

<h1>{{ site.title }}</h1>

<ul>
{% assign interviews_sorted = site.interviews | sort: "date" | reverse %}
{% for iv in interviews_sorted limit: 20 %}
  <li><a href="{{ iv.url }}">{{ iv.title }}</a> — {{ iv.date | date: "%Y-%m-%d" }}</li>
{% endfor %}
</ul>
```

---

## 7) Acceptance criteria

* Visiting `/oralhistory/interviews/jane-doe/20260115/` shows:

  * audio player (if enabled)
  * About box for Jane Doe using `_data/people.yml`
  * “Other interviews with Jane Doe” contains link(s) to other Jane Doe interviews
  * tags link to `/oralhistory/tags/<tag>/`
* `/oralhistory/browse/tags/` lists tags from `_data/vocab.yml`
* Each `/oralhistory/tags/<tag>/` page lists interviews with that tag
* No people pages exist; no `_people/` collection

---


