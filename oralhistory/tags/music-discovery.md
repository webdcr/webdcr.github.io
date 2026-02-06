---
layout: oralhistory_clean
title: "Music discovery"
permalink: /oralhistory/tags/music-discovery/
tag: music-discovery
---

{% assign interviews_sorted = site.interviews | sort: 'date' | reverse %}
<section class="oralhistory-intro">
  <p class="oralhistory-date-label">Tag</p>
  <h1 class="oralhistory-hero-title">Music discovery</h1>
</section>

<ul>
{% for iv in interviews_sorted %}
  {% if iv.tags and iv.tags contains page.tag %}
  <li>
    <a href="{{ iv.url | relative_url }}">{{ iv.title }}</a>
    <span class="oralhistory-meta-muted">{{ iv.date | date: '%Y-%m-%d' }}</span>
  </li>
  {% endif %}
{% endfor %}
</ul>
