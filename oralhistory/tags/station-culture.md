---
layout: oralhistory_clean
title: "Station culture"
permalink: /oralhistory/tags/station-culture/
tag: station-culture
---

{% assign interviews_sorted = site.interviews | sort: 'date' | reverse %}
<section class="oralhistory-intro">
  <p class="oralhistory-date-label">Tag</p>
  <h1 class="oralhistory-hero-title">Station culture</h1>
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
